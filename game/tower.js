/*
 * Copyright 2009, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @fileoverview This file holds the Tower class and its subclasses and utility
 * methods.  It's been tested in Firefox 2, but should work in any modern
 * javascript interpreter.
 */

// TODO: display range in some way when selected.

// TODO: Could optimize tower target node calculation by precomputing the
// in-range offset pattern for each range, but it's not clear that that will
// save a lot of time.  Also, this will target nodes regardless of state unless
// checked.
// This range should be used to compute the set of creeps that a tower *might*
// be interested in.  Further calculation can then be done to determine
// targeting at the edge of the range.  This can take care of aliasing effects
// caused by diagonal motion along the jagged edge of a range.

/**
 * Tower encapsulates any of the types of tower that the player can build to
 * defend his exit.  This constructor should not be called directly; use
 * Tower.newInstance instead.
 *
 * @constructor
 */
function Tower() {
}

(function() {

  Tower.Type = {
    CANNON: 'CANNON',
    FAST: 'FAST',
    HEAVY: 'HEAVY'
  };

  /**
   * Use this to create new towers, rather than using the raw constructors.
   *
   * @param {integer} i the column where the tower will be
   * @param {integer} j the row where the tower will be
   * @param {String} type a field of Tower.Type
   */
  Tower.newInstance = function(i, j, type) {
    var t;
    switch (type) {
    case Tower.Type.CANNON:
      t = new CannonTower();
      break;
    case Tower.Type.FAST:
      t = new FastTower();
      break;
    case Tower.Type.HEAVY:
      t = new HeavyTower();
      break;
    default:
      assert(false);
    }
    t.init(i, j);
    return t;
  };

  /**
   * How much does this type of tower cost to build?
   *
   * @param {String} type a field of Tower.Type
   */
  Tower.cost = function(type) {
    switch (type) {
    case Tower.Type.CANNON:
      return CannonTower.prototype.levels[0].costIncrement;
    case Tower.Type.FAST:
      return FastTower.prototype.levels[0].costIncrement;
    case Tower.Type.HEAVY:
      return HeavyTower.prototype.levels[0].costIncrement;
    }
    assert(false);
  };

  Tower.getLevelInfo = function(type, level) {
    switch (type) {
    case Tower.Type.CANNON:
      return CannonTower.prototype.levels[level];
    case Tower.Type.FAST:
      return FastTower.prototype.levels[level];
    case Tower.Type.HEAVY:
      return HeavyTower.prototype.levels[level];
    }
    assert(false);
  };

  Tower.getDisplayName = function(type) {
    switch (type) {
    case Tower.Type.CANNON:
      return CannonTower.prototype.typeDisplayName;
    case Tower.Type.FAST:
      return FastTower.prototype.typeDisplayName;
    case Tower.Type.HEAVY:
      return HeavyTower.prototype.typeDisplayName;
    }
    assert(false);
  };

  Tower.prototype.startConstructionSound = soundControl.id.CONSTRUCTION_START;
  Tower.prototype.allInOneConstructionSound =
    soundControl.id.CONSTRUCTION_ALL_IN_ONE;
  Tower.prototype.startUpgradeSound = soundControl.id.UPGRADE_START;
  Tower.prototype.endUpgradeSound = soundControl.id.UPGRADE_END;
  Tower.prototype.sellSound = soundControl.id.SELL_TOWER;

  /**
   * Call this when building or upgrading a tower to register it with all nodes
   * that it can now target.
   */
  Tower.prototype.expandRange = function() {
    assert(this.range);
    var iMin = Math.max(0, Math.floor(this.centerI - this.range));
    var jMin = Math.max(0, Math.floor(this.centerJ - this.range));
    var iMax = Math.min(O3D_TD_I_MAX - 1, Math.ceil(this.centerI + this.range));
    var jMax = Math.min(O3D_TD_J_MAX - 1, Math.ceil(this.centerJ + this.range));
    // Register self with target nodes.
    var range2 = this.range * this.range;
    for (var iTarget = iMin; iTarget <= iMax; ++iTarget) {
      for (var jTarget = jMin; jTarget <= jMax; ++jTarget) {
        var dI = iTarget - this.centerI;
        var dJ = jTarget - this.centerJ;
        if (dI * dI + dJ * dJ <= range2) {
          var node = world.getNode(iTarget, jTarget);
          if (!this.targetNodesByGuid.hasOwnProperty(node.guid)) {
            this.targetNodesByGuid[node.guid] = node;
            var creepGuidDict = node.registerTargetingTower(this);
            for (var guid in creepGuidDict) {
              assert(!this.targetChoiceGuids.hasOwnProperty(guid));
              var creep = world.getTransientByGuid(guid);
              if (this.canTargetCreep(creep)) {
                this.targetChoiceGuids[guid] = true;
              }
            }
          }
        }
      }
    }
  };

  /**
   * Initializes a newly-created Tower, and is called from newInstance
   * immediately after construction.  Any overriding classes should call this
   * before doing their own initialization.
   *
   * @param {integer} i the column where the tower will be
   * @param {integer} j the row where the tower will be
   */
  Tower.prototype.init = function(i, j) {
  var k = 0;
  this.fireAnimCounter = 0;
    this.centerI = i + 0.5; // since we're 2x2
    this.centerJ = j + 0.5; // since we're 2x2
    this.guid = guidForType('TOWER');
    this.level = 0;
    this.cost = this.levels[0].costIncrement;
    this.i = i;
    this.j = j;
  this.k = k;
    this.coveredNodes = [];
    this.coveredNodes[0] = world.getNode(i, j);
    this.coveredNodes[1] = world.getNode(i + 1, j);
    this.coveredNodes[2] = world.getNode(i, j + 1);
    this.coveredNodes[3] = world.getNode(i + 1, j + 1);
    this.reloadTimeLeft = 0;
    for (var nodeIdx in this.coveredNodes) {
      var node = this.coveredNodes[nodeIdx];
      assert(node.state == States.OPEN);
      node.addTower(this);
      assert(node.state == States.TOWER);
    }
    this.targetChoiceGuids = new Object();
    this.targetNodesByGuid = new Object();

    this.drawings = [];
  this.bases = [];

    for (var idx in clients) {
      var c = clients[idx];

    var d = DrawnObj.newShape(
          c,
          world,
      this.shapeName,
          this.centerI,
          this.centerJ,
          O3D_TD_GRID_K,
          this.length,
          this.width,
          this.height,
          Drawing.Colors.EXIT);
      d.base = DrawnObj.newShape(
          c,
          world,
      this.shapeName+"_BASE",
          this.centerI,
          this.centerJ,
          O3D_TD_GRID_K,
          this.length,
          this.width,
          this.height,
          Drawing.Colors.EXIT);

    this.shadowTransform = g_pack.createObject('Transform');
    this.shadowTransform.parent = d.translate;
    this.shadowTransform.addShape(SHADOW_IMAGE);
    this.shadowTransform.scale(0.2, 0.2, 0.2);

    this.bases[idx] = d.base;
      this.drawings[idx] = d;
    }

    this.setBuilding(this.levels[0].buildDelay);
    this.expandRange();

    // Find a target, if available.
    for (var guid in this.targetChoiceGuids) {
      // todo: Targeting policy here.
      this.setTargetCreepGuid(guid);
      break;
    }
  };

  /**
   * The tower is responsible for calling its destructor when it goes away for
   * any reason.  Any subclass that overrides this function or any method that
   * calls it should make sure to call it as appropriate.
   */
  Tower.prototype.destructor = function() {
    // First, some sanity checks.
    node = world.getNode(this.i, this.j);
    assert(node.objGuid === this.guid);
    assert(node.state == States.TOWER);
    node = world.getNode(this.i, this.j + 1);
    assert(node.objGuid === this.guid);
    assert(node.state == States.TOWER);
    node = world.getNode(this.i + 1, this.j);
    assert(node.objGuid === this.guid);
    assert(node.state == States.TOWER);
    node = world.getNode(this.i + 1, this.j + 1);
    assert(node.objGuid === this.guid);
    assert(node.state == States.TOWER);

    node = world.getNode(this.i, this.j);
    node.removeTower(this);
    assert(node.state == States.OPEN);
    node = world.getNode(this.i, this.j + 1);
    node.removeTower(this);
    assert(node.state == States.OPEN);
    node = world.getNode(this.i + 1, this.j);
    node.removeTower(this);
    assert(node.state == States.OPEN);
    node = world.getNode(this.i + 1, this.j + 1);
    node.removeTower(this);
    assert(node.state == States.OPEN);

    for (var idx in this.drawings) {
      this.drawings[idx].makeItGoAway();
    this.bases[idx].makeItGoAway();
    }
    for (guid in this.targetNodesByGuid) {
      this.targetNodesByGuid[guid].unregisterTargetingTower(this);
    }
    world.removeTower(this);
  };

  /**
   * Used for a quickck 'is this a type of creep we can shoot at' check, e.g. does
   * it fly, etc.  This will be called when creeps get registered and
   * unregistered, so it shouldn't depend on the state of the creep or tower,
   * which may have changed between those two checks.
   *
   * @param {Creep} creep a potential target
   */
  Tower.prototype.canTargetCreep = function(creep) {
    return !creep.flying;
  };

  /**
   * Adds this creep to the list of those that this tower may attack.
   *
   * @param {Creep} creep a potential target
   */
  Tower.prototype.registerTargetCreep = function(creep) {
    assert(!this.targetChoiceGuids.hasOwnProperty(creep.guid));
    if (!this.canTargetCreep(creep) || creep.dead) {
      return;
    }
    this.targetChoiceGuids[creep.guid] = true;
    if (!this.targetCreepGuid) {
      this.setTargetCreepGuid(creep.guid);
    }
  };

  /**
   * Removes this creep from the list of those that this tower may attack.
   * This'll happen when the creep dies, exits, or moves out of range.
   *
   * @param {Creep} creep no longer a potential target
   */
  Tower.prototype.unregisterTargetCreep = function(creep) {
    if (!this.canTargetCreep(creep)) {
      assert(!this.targetChoiceGuids.hasOwnProperty(creep.guid));
      return;
    }
    assert(this.targetChoiceGuids.hasOwnProperty(creep.guid));
    delete this.targetChoiceGuids[creep.guid];
    if (this.targetCreepGuid == creep.guid) {
      this.setTargetCreepGuid(null);
      // todo: Targeting policy here.
      for (var guid in this.targetChoiceGuids) { // Is there another way?
        this.setTargetCreepGuid(guid);
        break;
      }
    }
  };

  Tower.prototype.rotateTower = function()
  {
  var creep = world.getTransientByGuid(this.targetCreepGuid);
    var tI = creep.i + creep.targetDI - this.i;
  var tJ = creep.j + creep.targetDJ - this.j;

  var tI2 = tI * tI;
  var tJ2 = tJ * tJ;
  var tIJ = Math.sqrt(tI2 + tJ2);

  var turretLengthDelta = (tIJ - O3D_TD_TOWER_DIAM) / tIJ;

  this.tI = tI * turretLengthDelta;
  this.tJ = tJ * turretLengthDelta;

  var phi, theta;

  if(!tI)
  {
    if(tJ < 0) { theta = Math.PI; }
    else { theta = 0; }
  }
  else { theta = Math.atan2(tJ, tI); }

  for(var idx in this.drawings)
  {
    var d = this.drawings[idx];
    d.rotZ.localMatrix = d.client.math.matrix4.rotationZ(3.14+theta);
  }
  }

  Tower.prototype.fire = function() {
    for (var idx in this.drawings) {
      var d = this.drawings[idx];
    //the shape used when a tower is being upgraded
      d.setDrawingShape(this.fireShape);
    d.base.setDrawingBase(this.fireShape);
    }
  this.isFiring = true;
    assert(this.reloadTimeLeft <= 0);
    var creep = world.getTransientByGuid(this.targetCreepGuid);
    var levelInfo = this.levels[this.level];
  world.addTransient(
    Missile.newInstance(this.centerI, this.centerJ,
    levelInfo.towerHeight * this.depth, levelInfo.damage,
    levelInfo.missileSize, creep, levelInfo.missileType, this.level));
  this.reloadTimeLeft = this.getRepeatDelay();
  };

  Tower.prototype.setTargetCreepGuid = function(guid) {
    assert(!guid != !this.targetCreepGuid);
    if (!guid) {
      this.targetCreepGuid = null;
    } else {
      this.targetCreepGuid = guid;
    }
  };

  Tower.prototype.isUpgrading = function() {
    return this.upgradeTimeLeft > 0;
  };

  /**
   * As this.level changes due to upgrades, use this to update the size of the
   * tower.
   */
  Tower.prototype.setScale = function() {
  var scale = world.gridToDrawingScale(
    this.levels[this.level].towerHeight*this.width, //width (left/right)
    this.levels[this.level].towerHeight*this.depth, //depth (up/down)
        this.levels[this.level].towerHeight*this.height  //height (towards/away)
    );

    for (var idx in this.drawings) {
      var d = this.drawings[idx];
    var base = this.bases[idx];
      var v3 = scale.slice(0, 3);
      d.scale.localMatrix = d.client.math.matrix4.scaling(v3);
    base.scale.localMatrix = d.client.math.matrix4.scaling(v3);
    }
  };

  /**
   * While being built or upgraded towers are displayed differently and don't
   * fire.  During initial setup, construction and upgrades are instantaneous,
   * but still make a sound.
   *
   * @param {integer} delay how many frames construction should take, if this
   * isn't the setup phase.
   */
  Tower.prototype.setBuilding = function(delay) {
    if (world.settingUp()) {
      soundControl.play(this.allInOneConstructionSound);
    } else {
      soundControl.play(this.startConstructionSound);
      this.upgradeTimeLeft = delay;
      for (var idx in this.drawings) {
        var d = this.drawings[idx];
    //the shape to use when building a new tower
        d.setDrawingShape(this.buildingShape);
    d.base.setDrawingBase(this.buildingShape);
    d.base.visible = false;
      }
    }
    this.range = this.levels[this.level].range;
    this.setScale();
    game.updateDisplayForCurTower(this);
  };

  Tower.prototype.getFireAnimDelay = function() {
  switch(this.type)
  {
    case Tower.Type.CANNON:
      return 20 / 30
    case Tower.Type.FAST:
      return 12 / 30
    case Tower.Type.HEAVY:
      return 12 / 30
  }
  }

  /**
   * While being built or upgraded towers are displayed differently and don't
   * fire.  During initial setup, construction and upgrades are instantaneous,
   * but still make a sound.
   *
   * @param {boolean} upgrading true for starting an upgrade and false for
   * finishing it
   * @param {integer} delay how many frames the upgrade should take, if this
   * isn't the setup phase.
   * @param {integer} addedCost how much money was spent to do this particular
   * upgrade
   */
  Tower.prototype.setUpgrading = function(upgrading, delay, addedCost) {
    if (upgrading) {
      this.cost += addedCost;
      ++this.level;
      soundControl.play(this.startUpgradeSound);
    } else {
      soundControl.play(this.endUpgradeSound);
    }
    if (upgrading && !world.settingUp()) {
      this.upgradeTimeLeft = delay;
      for (var idx in this.drawings) {
        var d = this.drawings[idx];
    //the shape used when a tower is being upgraded
    if(this.level)
    {
      if(this.type == Tower.Type.CANNON)
      {
        var name = "anim_missileLauncher_upgrade0"+this.level+"build";
        for(ii = 0; ii < g_animTimeParam.length; ii++)
        {
          if(g_animTimeParam[ii].name == name)
          {
            g_animTimeParam[ii].value = 0;
          }
        }
      }
      else if(this.type == Tower.Type.FAST)
      {
        var name = "anim_oozieLauncher_Upgrade0"+this.level+"build";
        for(ii = 0; ii < g_animTimeParam.length; ii++)
        {
          if(g_animTimeParam[ii].name == name)
          {
            g_animTimeParam[ii].value = 0;
          }
        }
      }
      else if(this.type == Tower.Type.HEAVY)
      {
        var name = "anim_ballLauncher_upgrade0"+this.level+"build";
        for(ii = 0; ii < g_animTimeParam.length; ii++)
        {
          if(g_animTimeParam[ii].name == name)
          {
            g_animTimeParam[ii].value = 0;
          }
        }
      }

      this.upgradeShape = this.name+"_UPGRADE0"+this.level;
      d.setDrawingShape(this.upgradeShape);
      d.base.setDrawingBase(this.upgradeShape);
    }
    else
    {
      if(this.type == Tower.Type.CANNON)
      {
        for(ii = 0; ii < g_animTimeParam.length; ii++)
        {
          if(g_animTimeParam[ii].name == "anim_missileLauncher_build")
          {
            g_animTimeParam[ii].value = 0;
          }
        }
      }
      if(this.type == Tower.Type.FAST)
      {
        for(ii = 0; ii < g_animTimeParam.length; ii++)
        {
          if(g_animTimeParam[ii].name == "anim_missileLauncher_build")
          {
            g_animTimeParam[ii].value = 0;
          }
        }
      }
      if(this.type == Tower.Type.HEAVY)
      {
        for(ii = 0; ii < g_animTimeParam.length; ii++)
        {
          if(g_animTimeParam[ii].name == "anim_ballLauncher_build")
          {
            g_animTimeParam[ii].value = 0;
          }
        }
      }
      d.setDrawingShape(this.buildingShape);
      d.base.setDrawingBase(this.buildingShape);
    }
      }
    } else {
      this.reloadTimeLeft = 0;
      for (var idx in this.drawings) {
          var d = this.drawings[idx];
    //the shape used when a tower is finished building/upgrading
    if(this.level)
    {
      this.shapeName = this.name+"_UPGRADE0"+this.level+"_IDLE";
      this.fireShape = this.name+"_UPGRADE0"+this.level+"_FIRE";
      d.setDrawingShape(this.shapeName);
      d.base.setDrawingBase(this.shapeName);
    }
    else
    {
      this.shapeName = this.name+"_IDLE"
      d.setDrawingShape(this.shapeName);
      d.base.setDrawingBase(this.shapeName);
    }
      }
      this.setScale();
      if (world.getSelectedTower() == this) {
        game.updateDisplayForCurTower(this);
      }
    }
    // Only expand the range if it's a completed-during-setup upgrade or if it's
    // a real upgrade [not just normal construction] that has just completed.
    if ((!upgrading && this.level) || world.settingUp()) {
      this.range = this.levels[this.level].range;
      this.expandRange();
    if(!prevSelection)
    {
    prevSelection = this;
    }
    if(g_rangeIcon)
    {
    g_rangeIcon.makeItGoAway();
    g_rangeIcon = DrawnObj.newShape(
      clients[0],
      world,
      Shapes.RANGE_SHAPE,
      prevSelection.i+0.5,
      prevSelection.j+0.5,
      O3D_TD_GRID_K,
      prevSelection.range*0.1,
      prevSelection.range*0.1,
      1,
      Drawing.Colors.EXIT);
    }
    }
  };

  // getUpgradeCost, getUpgradeDelay and getRepeatDelay are functions rather
  // than just variables here so that the subclasses can do something more
  // complicated later.
  Tower.prototype.getUpgradeCost = function() {
    assert(this.canUpgrade());
    return this.levels[this.level + 1].costIncrement;
  };

  Tower.prototype.getUpgradeDelay = function() {
    return this.levels[this.level + 1].buildDelay;
  };

  Tower.prototype.getRepeatDelay = function() {
    return this.levels[this.level].repeatDelay;
  };

  Tower.prototype.canUpgrade = function() {
    return !this.isUpgrading() && this.level + 1 < this.levels.length;
  };

  Tower.prototype.upgrade = function() {
    assert(!this.isUpgrading());
    assert(this.level < this.levels.length);
    this.setUpgrading(true, this.getUpgradeDelay(), this.getUpgradeCost());
  };

  /**
   * This is the main animation/processing function, called once per frame.
   *
   * This could be optimized later to skip processing when a tower's not doing
   * anything [between shots, when nobody's in range, during upgrades].
   */
  Tower.prototype.animateOneStep = function(elapsedTime) {
    if (this.upgradeTimeLeft > 0) {
      this.upgradeTimeLeft -= elapsedTime;
      if (this.upgradeTimeLeft <= 0) {
        this.setUpgrading(false);
      }
    } else {
      if (this.reloadTimeLeft > 0) {
    this.fireAnimCounter += elapsedTime;
        this.reloadTimeLeft -= elapsedTime;
    if(this.fireAnimCounter > this.getFireAnimDelay())
    {
      this.fireAnimCounter = 0;
      if(this.isFiring)
      {
          for (var idx in this.drawings)
        {
          var d = this.drawings[idx];
          //the shape used when a tower is being upgraded
          d.setDrawingShape(this.shapeName);
          d.base.setDrawingBase(this.shapeName);
        }
        this.isFiring = false;
      }
    }
      }
      if (this.targetCreepGuid)
    {
    var creep = world.getTransientByGuid(this.targetCreepGuid);
    if(!creep.dead)
    {
      this.rotateTower();
      if(this.reloadTimeLeft <= 0) {  this.fire(); }
    }
    else
    {
        for (guid in this.targetingTowerGuids)
      {
        world.towersByGuid[guid].unregisterTargetCreep(creep);
      }
    }
    }
    }
  };

  /**
   * LevelInfo stores the parameters that describe a tower at a given level of
   * development.  As you upgrade the tower, it moves from one LevelInfo
   * description to the next.
   *
   * @param {String} missileType what type of missile it fires
   * @param {integer} damage how many points of damage each missile does
   * @param {number} repeatDelay how many seconds between shots
   * @param {number} towerHeight how tall the tower looks
   * @param {number} missileSize how big the missile is [in some number that the
   * missile constructor understands]
   * @param {integer} costIncrement how much it costs to upgrade/build to this
   * level from the previous level [if any]
   * @param {number} range how far the tower can shoot
   */
  function LevelInfo(missileType, damage, repeatDelay, towerHeight, missileSize,
      costIncrement, buildDelay, range) {
    this.missileType = missileType;
    this.damage = damage;
    this.repeatDelay = Math.ceil(repeatDelay);
    this.towerHeight = towerHeight;
    this.missileSize = missileSize;
    this.costIncrement = costIncrement;
    this.buildDelay = Math.ceil(buildDelay);
    this.range = range;
    return this;
  }

  /**
   * A tower that fires unguided cannonballs.
   *
   * @extends Tower
   * @constructor
   */
  function CannonTower() {
  this.name = "LAUNCHER";
  this.shapeName = "LAUNCHER_IDLE";
  this.buildingShape = "LAUNCHER_BUILD";
  this.upgradeShape = "LAUNCHER_UPGRADE";
  this.fireShape = "LAUNCHER_FIRE";
  this.depth = O3D_TD_TOWER_DIAM;
  this.width = O3D_TD_TOWER_DIAM;
  this.height = O3D_TD_TOWER_DEPTH;
  }
  CannonTower.prototype = new Tower();
  CannonTower.prototype.constructor = CannonTower;
  CannonTower.prototype.type = Tower.Type.CANNON;
  CannonTower.prototype.typeDisplayName = 'Cannon Tower [anti-aircraft]';
  CannonTower.prototype.upgradeColor = Drawing.Colors.EXIT;
  CannonTower.prototype.color = Drawing.Colors.EXIT;
  CannonTower.prototype.levels = [
  // (type, damage, repeat rate, height, ?, upgrade cost/resale, upgrade time, range)
    new LevelInfo(Missile.Type.ARC, 1,  2.0, 0.7, 1.7, 20, 70/30, 5.0),
    new LevelInfo(Missile.Type.ARC, 3,  1.5, 0.7, 1.9, 30, 60/30, 6.25),
    new LevelInfo(Missile.Type.ARC, 6, 1.0, 0.7, 2.0, 50, 60/30, 7.5),
  ];

  CannonTower.init = function(i, j) {
    // Call the parent class's init, but with us as this.
    Tower.prototype.init.call(this, i, j);

    // We don't have anything interesting to do here yet.
  };

  /**
   * Used for a quick 'is this a type of creep we can shoot at' check, e.g. does
   * it fly, etc.  This will be called when creeps get registered and
   * unregistered, so it shouldn't depend on the state of the creep or tower,
   * which may have changed between those two checks.
   *
   * CannonTowers only target flying creeps.
   *
   * @param {Creep} creep a potential target
   */
  CannonTower.prototype.canTargetCreep = function(creep) {
    return creep.flying;
  };

  /**
   * A tower that fires lasers.
   *
   * @extends Tower
   * @constructor
   */
  function FastTower() {
  this.name = "OOZIE";
  this.shapeName = "OOZIE_IDLE";
  this.buildingShape = "OOZIE_BUILD";
  this.upgradeShape = "OOZIE_UPGRADE";
  this.fireShape = "OOZIE_FIRE";
  this.depth = O3D_TD_TOWER_DIAM;
  this.width = O3D_TD_TOWER_DIAM;
  this.height = O3D_TD_TOWER_DEPTH;
  }
  FastTower.prototype = new Tower();
  FastTower.prototype.constructor = FastTower;
  FastTower.prototype.type = Tower.Type.FAST;
  FastTower.prototype.typeDisplayName = 'Laser Tower';
  FastTower.prototype.upgradeColor = Drawing.Colors.EXIT;
  FastTower.prototype.color = Drawing.Colors.EXIT;
  FastTower.prototype.levels = [
  // (type, damage, repeat rate, height, ?, upgrade cost/resale, upgrade time, range)
    new LevelInfo(Missile.Type.ZAP, 0.25, 2.0, 0.7, 0.7, 10, 45/30, 5.0),
    new LevelInfo(Missile.Type.ZAP, 0.5, 1.0, 0.7, 0.9, 20, 30/30, 5.5),
    new LevelInfo(Missile.Type.ZAP, 2, 0.5, 0.7, 1.1, 40, 60/30, 6.0),
  ];

  FastTower.prototype.init = function(i, j) {
    // Call the parent class's init, but with us as this.
    Tower.prototype.init.call(this, i, j);

    // We don't have anything interesting to do here yet.
  };

  /**
   * A tower that fires guided missiles that do splash damage in addition to
   * damage to the targeted creep.
   *
   * @extends Tower
   * @constructor
   */
  function HeavyTower() {
  this.name = "BALL";
  this.shapeName = "BALL_IDLE";
  this.buildingShape = "BALL_BUILD";
  this.upgradeShape = "BALL_UPGRADE";
  this.fireShape = "BALL_FIRE";
  this.depth = O3D_TD_TOWER_DIAM;
  this.width = O3D_TD_TOWER_DIAM;
  this.height = O3D_TD_TOWER_DEPTH;
  }
  HeavyTower.prototype = new Tower();
  HeavyTower.prototype.constructor = HeavyTower;
  HeavyTower.prototype.type = Tower.Type.HEAVY;
  HeavyTower.prototype.typeDisplayName =
      'Guided Missile Tower [surface-to-ground]';
  HeavyTower.prototype.upgradeColor = Drawing.Colors.EXIT;
  HeavyTower.prototype.color = Drawing.Colors.EXIT;
  HeavyTower.prototype.levels = [
  // (type, damage, repeat rate, height, ?, upgrade cost/resale, upgrade time, range)
    new LevelInfo(Missile.Type.BASIC, 0.5, 3.5, 0.7, 1.0, 5,  45/30, 5.0),
    new LevelInfo(Missile.Type.BASIC, 1, 2.5, 0.7, 1.2, 15, 10/30, 6.5),
    new LevelInfo(Missile.Type.BASIC, 2, 1.5, 0.7, 1.4, 30, 10/30, 8.0),
  ];

  HeavyTower.prototype.init = function(i, j) {
    // Call the parent class's init, but with us as this.
    Tower.prototype.init.call(this, i, j);

    // We don't have anything interesting to do here yet.
  };

  /**
   * Used for a quick 'is this a type of creep we can shoot at' check, e.g. does
   * it fly, etc.  This will be called when creeps get registered and
   * unregistered, so it shouldn't depend on the state of the creep or tower,
   * which may have changed between those two checks.
   *
   * HeavyTowers only target non-flying creeps.
   *
   * @param {Creep} creep a potential target
   */
  HeavyTower.prototype.canTargetCreep = function(creep) {
    return !creep.flying;
  };

}) ();