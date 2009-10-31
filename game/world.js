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
 * @fileoverview This file contains the World class and all its support
 * functions.  It's been written for Firefox 2, but should be easy to port to
 * other browsers.
 */

/**
 * The World holds all of the state of the playing field, including all
 * associated game objects, waves of creeps yet to come, etc.  It's also got
 * game state including the score, high score table, money, lives left, and so
 * on.  There's a bit of overlap in mission between this and the Game object
 * which should get clarified.  TODO: I favor moving all game state that doesn't
 * directly involve the playing field out of World into Game.  There should only
 * ever be only 1 World object.  It's currently referenced via global references
 * here and there, but via a passed-in reference in most places.  TODO: remove
 * those global references.
 *
 * @constructor
 * @param {number} xMin the drawing-space minimum displayed x-coordinate [the
 * left edge of the board]
 * @param {number} xMax the drawing-space maximum displayed x-coordinate [the
 * right edge of the board]
 * @param {number} yMin the drawing-space minimum displayed y-coordinate [the
 * bottom edge of the board]
 * @param {number} yMax the drawing-space maximum displayed y-coordinate [the
 * top edge of the board]
 * @param {integer} cols the number of grid columns in the playing field
 * @param {integer} rows the number of grid rows in the playing field
 */
function World(xMin, xMax, yMin, yMax, cols, rows) {
  this.cols = cols;
  this.rows = rows;
  this.xMin = xMin;
  this.xMax = xMax;
  this.yMin = yMin;
  this.yMax = yMax;

  this.cursorMinI = O3D_TD_CURSOR_MIN_I_OFFSET;
  this.cursorMaxI = this.cols - O3D_TD_CURSOR_MAX_I_OFFSET -
      O3D_TD_CURSOR_SCALE;
  this.cursorMinJ = O3D_TD_CURSOR_MIN_J_OFFSET;
  this.cursorMaxJ = this.rows - O3D_TD_CURSOR_MAX_J_OFFSET -
      O3D_TD_CURSOR_SCALE;
  this.nodeWidth = (this.xMax - this.xMin) / this.cols;
  this.nodeHeight = (this.yMax - this.yMin) / this.rows;
  this.nodeDepth = this.nodeHeight;
  this.missileWidth = this.nodeWidth / 4;
  this.missileHeight = this.nodeHeight / 4;

  this.grid = this.makeGrid(this.cols, this.rows);
  this.drawings = [];
  this.HUDs = [];

  for (var idx in clients) {
    var c = clients[idx];

    // Explosions
    Drawing.setupShape(c, Shapes.SPHERE, Drawing.Colors.BASIC_MISSILE, null);
    Drawing.setupShape(c, Shapes.SPHERE, Drawing.Colors.ARC_MISSILE, null);
    Drawing.setupShape(c, Shapes.SPHERE, Drawing.Colors.ZAP_MISSILE, null);
    // Board stuff
    Drawing.setupShape(c, Shapes.BOX, Drawing.Colors.ENTRANCE, null);
    Drawing.setupShape(c, Shapes.BOX, Drawing.Colors.EXIT, null);
    // Cursor
    Drawing.setupShape(c, Shapes.CURSOR1, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR2, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR3, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR1BASE, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR2BASE, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR3BASE, Drawing.Colors.EXIT, null);

    Drawing.setupShape(c, Shapes.CURSOR1GRAY, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR2GRAY, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR3GRAY, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR1GRAYBASE, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR2GRAYBASE, Drawing.Colors.EXIT, null);
    Drawing.setupShape(c, Shapes.CURSOR3GRAYBASE, Drawing.Colors.EXIT, null);

    // SPT debugging lines
    Drawing.setupShape(c, Shapes.BOX, Drawing.Colors.REACHABLE, null);
    Drawing.setupShape(c, Shapes.BOX, Drawing.Colors.DONE, null);

  //test
  Drawing.setupShape(c, Shapes.OOZIE_BUILD, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_BUILD_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_IDLE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_IDLE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_IDLE_GRAY, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_IDLE_GRAY_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_FIRE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_FIRE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE01, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE01_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE01_IDLE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE01_IDLE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE01_FIRE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE01_FIRE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE02, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE02_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE02_IDLE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE02_IDLE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE02_FIRE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZIE_UPGRADE02_FIRE_BASE, Drawing.Colors.EXIT, null);

  Drawing.setupShape(c, Shapes.BALL_AMMO, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_BUILD, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_BUILD_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_IDLE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_IDLE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_IDLE_GRAY, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_IDLE_GRAY_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_FIRE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_FIRE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE01, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE01_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE01_IDLE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE01_IDLE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE01_FIRE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE01_FIRE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE02, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE02_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE02_IDLE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE02_IDLE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE02_FIRE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.BALL_UPGRADE02_FIRE_BASE, Drawing.Colors.EXIT, null);

  Drawing.setupShape(c, Shapes.LAUNCHER_AMMO, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_BUILD, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_BUILD_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_IDLE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_IDLE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_IDLE_GRAY, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_IDLE_GRAY_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_FIRE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_FIRE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE01, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE01_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE01_IDLE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE01_IDLE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE01_FIRE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE01_FIRE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE02, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE02_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE02_IDLE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE02_IDLE_BASE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE02_FIRE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.LAUNCHER_UPGRADE02_FIRE_BASE, Drawing.Colors.EXIT, null);

  Drawing.setupShape(c, Shapes.RANGE_SHAPE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.UPGRADE_SHAPE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.OOZE_SHAPE, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.GRID_BLOCK, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.GRID_BLOCK_OFF, Drawing.Colors.EXIT, null);

  Drawing.setupShape(c, Shapes.DINO_WALK, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.DINO_DEATH, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.DINO_JUMP, Drawing.Colors.EXIT, null);

  Drawing.setupShape(c, Shapes.PRINCESS_WALK, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.PRINCESS_DEATH, Drawing.Colors.EXIT, null);

  Drawing.setupShape(c, Shapes.RACECAR_WALK, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.RACECAR_DEATH, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.RACECAR_TURNLEFT, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.RACECAR_TURNRIGHT, Drawing.Colors.EXIT, null);

  Drawing.setupShape(c, Shapes.ROBOT_WALK, Drawing.Colors.EXIT, null);
  Drawing.setupShape(c, Shapes.ROBOT_DEATH, Drawing.Colors.EXIT, null);
  }

  this.setCursorPos(0, 0);

  // These are objects which don't directly affect the SPT, need animation every
  // frame, and get flushed every reset.  Towers almost work, but they don't
  // keep the animation from ending and need to mark the SPT invalid on changes.
  // Hmm...is that really enough to merit special treatment?  The latter is
  // trivially fixable.  Seems like maybe the missiles and explosions shouldn't
  // keep the game going either, only the creeps, but it is kind of nice to see
  // them all fade away at the end.  Well, for now, just keep towers separately.
  this.transientsByGuid = new Object();

  // These are permanent parts of the game setup [walls, entrance, exit] that
  // don't get animated.

  this.objectsByGuid = new Object();
  this.towersByGuid = new Object();

  // A World should *always* own a valid SPT during the game.  There are brief
  // times when it doesn't, and haveValidSptData is false, but that should clear
  // up quickly.
  this.spt = null;
  this.haveValidSptData = false;
  this.entranceNodes = [];
//  this.highScoreTable = new HighScoreTable();
  return this;
}

// TODO: This should probably either be a field or move into constants.js.
var States = {
  OPEN : 'OPEN',
  BLOCKED : 'BLOCKED',
  POPULATED : 'POPULATED',
  ENTRANCE : 'ENTRANCE',
  EXIT : 'EXIT',
  TOWER : 'TOWER'
};

(function() {

  /**
   * This only checks to see whether the node location is within the walled-off
   * area; it doesn't check to see if there's a tower there or anything like
   * that.
   */
  World.prototype.isLegalCreepLocation = function(i, j) {
    var legalI = i >= O3D_TD_CURSOR_MIN_I_OFFSET &&
        i < this.cols - O3D_TD_CURSOR_MAX_I_OFFSET;
    var legalJ = j >= O3D_TD_CURSOR_MIN_J_OFFSET &&
        j < this.rows - O3D_TD_CURSOR_MAX_J_OFFSET;
    var legal = legalI && legalJ;
    return legal;
  };

  World.isABlockedState = function(state) {
    return state == States.BLOCKED || state == States.TOWER;
  };

  World.prototype.isBlocked = function(i, j) {
    return World.isABlockedState(this.getNode(i, j).state);
  };

  /**
   * This converts an offset from game/grid space to drawing space.
   *
   * @param {number} i the column offset
   * @param {number} j the row offset
   * @param {number} k the height offset
   */
  World.prototype.gridToDrawingOffset = function(i, j, k) {
    var offsets = [
      this.nodeWidth * i,
      this.nodeHeight * j,
      this.nodeDepth * k,
    ];
    return offsets;
  };
  World.prototype.gridToDrawingScale = World.prototype.gridToDrawingOffset;

  /**
   * This converts a coordinate from game/grid space to drawing space.  It
   * defines i, j, k as the center of the square containing node i, j, with k
   * being the distance off the floor.  So 0, 0, 0 is the x-y center of the
   * square, but not elevated to the center of the unit cube, but rather on the
   * floor.  Also, we assume that the floor is at k==0 and z==0.
   *
   * @param {number} i the column offset
   * @param {number} j the row offset
   * @param {number} k the height offset
   */
  World.prototype.gridToDrawingCoords = function(i, j, k) {
    var coords = [
      this.xMin + this.nodeWidth * (i + 0.5),
      this.yMin + this.nodeHeight * (j + 0.5),
      this.nodeDepth * k,
    ];
    return coords;
  };

  World.prototype.getNode = function(i, j) {
  assert(i >= 0 && i < this.cols);
  assert(j >= 0 && j < this.rows);
    return this.grid[i][j];
  };

  /**
   * Gets the node currently selected by the user's floating cursor.
   */
  World.prototype.getCurNode = function() {
    return this.grid[this.cursorI][this.cursorJ];
  };

  /**
   * This is a helper function extracted from makeObjectAtNode to simplify it.
   * Here the 'state' is also the 'type'.
   *
   * @param {GridNode} node the node at which to build
   * @param {String} type which type of object to build
   */
  World.prototype.makeObject = function(node, type) {
    assert(type != States.TOWER);
    assert(node);
    assert(node.state == States.OPEN);
    assert(type);
    assert(type != States.OPEN);
    var obj = new Object();
    obj.guid = guidForType(type);
    obj.node = node;
    obj.type = type;
    node.addObject(obj, type);
    assert(node.state == type);
    obj.drawings = [];

    return obj;
  };

  /**
   * Create an object of type type at node node.  Use this to create ENTRANCE,
   * EXIT, or BLOCKED objects, not towers or creeps.
   * Here the 'state' is also the 'type'.
   *
   * @param {GridNode} node the node at which to build
   * @param {String} type which type of object to build
   */
  World.prototype.makeObjectAtNode = function(node, type) {
    assert(node.state == States.OPEN);
    var obj = this.makeObject(node, type);
    assert(node.state == type);
    this.objectsByGuid[obj.guid] = obj;
    this.haveValidSptData = false;
    if (type == States.ENTRANCE) {
      this.entranceNodes.push(node);
    }
  };

  /**
   * Remove an object of type type at node node.  Use this to remove ENTRANCE,
   * EXIT, or BLOCKED objects, not towers or creeps.
   * Here the 'state' is also the 'type'.
   *
   * @param {GridNode} node the node to clear
   */
  World.prototype.removeObjectAtNode = function(node) {
    assert(node.state != States.OPEN);
    assert(node.objGuid);
    var obj = this.getObjectByGuid(node.objGuid);
    node.removeObject(obj);
    assert(node.state == States.OPEN);
    this.deleteObject(obj);
  };

  /**
   * This is an internal function, used only during setup, to clear out blocked
   * nodes.  It was originally used for debugging, but then turned out to be a
   * convenient way to set stuff up.
   *
   * It removes any permanent object that's sitting at a given node.  Don't use
   * it for creeps.
   *
   * @param {GridNode} node the node to clear
   */
  World.prototype.clearNode = function(node) {
    if (node.state == States.OPEN) {
      return;
    } else if (node.state == States.TOWER) {
      this.getTowerByGuid(node.objGuid).destructor();
    } else {
      this.removeObjectAtNode(node);
    }
  };

  /**
   * Create an tower of type type at node node.
   * Call this on the lower-left node of the tower's 2x2 area.
   *
   * @param {GridNode} node the node at which to build
   * @param {String} type a field of Tower.Type
   */
  World.prototype.makeTowerAtNode = function(node, type) {
    var i = node.i;
    var j = node.j;

    assert(node === this.grid[i][j]);
    assert(this.clearToBuildTower(node));

    var tower = Tower.newInstance(i, j, type);
    this.setMoney(this.money - tower.cost);

    node = this.grid[i][j];
    assert(node.state == States.TOWER);
    assert(node.objGuid == tower.guid);

    node = this.grid[i][j + 1];
    assert(node.state == States.TOWER);
    assert(node.objGuid == tower.guid);

    node = this.grid[i + 1][j];
    assert(node.state == States.TOWER);
    assert(node.objGuid == tower.guid);

    node = this.grid[i + 1][j + 1];
    assert(node.state == States.TOWER);
    assert(node.objGuid == tower.guid);

    this.towersByGuid[tower.guid] = tower;
    this.haveValidSptData = false;
  };

  var FAKE_GUID = 'FAKE';
  /**
   * This is used to block out nodes as if a tower were there.  It's used for
   * speculative placements before running an SPT to check a user action for
   * validity.
   * Call this on the lower-left node of the tower's 2x2 area.
   *
   * @param {GridNode} node the node at which to build
   */
  World.prototype.fakeTowerAtNode = function(node) {
    var i = node.i;
    var j = node.j;

    assert(this.clearToBuildTower(node));

    node = this.grid[i][j];
    node.state = States.BLOCKED;
    node.objGuid = FAKE_GUID;
    node = this.grid[i][j + 1];
    node.state = States.BLOCKED;
    node.objGuid = FAKE_GUID;
    node = this.grid[i + 1][j];
    node.state = States.BLOCKED;
    node.objGuid = FAKE_GUID;
    node = this.grid[i + 1][j + 1];
    node.state = States.BLOCKED;
    node.objGuid = FAKE_GUID;

    this.haveValidSptData = false;
  };

  /**
   * @see fakeTowerAtNode
   */
  World.prototype.unfakeTowerAtNode = function(node) {
    var i = node.i;
    var j = node.j;

    assert(node === this.grid[i][j]);
    assert(node.state == States.BLOCKED);
    assert(node.objGuid == FAKE_GUID);
    node = this.grid[i][j + 1];
    assert(node.state == States.BLOCKED);
    assert(node.objGuid == FAKE_GUID);
    node = this.grid[i + 1][j];
    assert(node.state == States.BLOCKED);
    assert(node.objGuid == FAKE_GUID);
    node = this.grid[i + 1][j + 1];
    assert(node.state == States.BLOCKED);
    assert(node.objGuid == FAKE_GUID);

    node = this.grid[i][j];
    node.state = States.OPEN;
    node.objGuid = null;
    node = this.grid[i][j + 1];
    node.state = States.OPEN;
    node.objGuid = null;
    node = this.grid[i + 1][j];
    node.state = States.OPEN;
    node.objGuid = null;
    node = this.grid[i + 1][j + 1];
    node.state = States.OPEN;
    node.objGuid = null;

    this.haveValidSptData = false;
  };

  World.prototype.clearToBuildTower = function(node) {
    return node.state === States.OPEN &&
        this.grid[node.i][node.j + 1].state === States.OPEN &&
        this.grid[node.i + 1][node.j].state === States.OPEN &&
        this.grid[node.i + 1][node.j + 1].state === States.OPEN;
  };

  World.prototype.buildTower = function(type) {
    var node = this.getCurNode();
    if (!this.clearToBuildTower(node)) {
      throw new UserError("Can't build there.");
    }
    if (this.money < Tower.cost(type)) {
      throw new UserError("You can't afford it.");
    }
    // This is just a sanity check to make sure that the world is initially
    // valid.
    if (!this.haveValidSptData) {
      this.setupSpt(); // Just in case there was one in progress.
      this.runSpt();
    }
    if (!this.haveValidSptData) {
      throw new Error('The state of the world is invalid for SPT purposes.');
    }
    this.fakeTowerAtNode(node);
    var spt = new o3d.towerdefense.ShortestPathTree(this, false);
    spt.run();
    this.unfakeTowerAtNode(node);
    if (spt.isValid()) {
      this.makeTowerAtNode(node, type);
      this.spt.updateDisplay(false);
      this.spt = spt;
      this.promoteSptState();
      this.haveValidSptData = true;
    } else {
      assert(node.state == States.OPEN);
      throw new UserError('Blocking');
    }
  };

  World.prototype.sellTower = function() {
    var tower = this.getSelectedTower();
    if (!tower) {
      throw new UserError('No tower here to sell.');
    }
    var refund = tower.cost;
    if (this.gamePhase != Phases.SETUP) {
      refund = Math.floor(refund / 2);
    }
    this.setMoney(this.money + refund);
    soundControl.play(tower.sellSound);
    tower.destructor();
    assert(this.getNode(this.cursorI, this.cursorJ).state == States.OPEN);
    this.haveValidSptData = false;
    this.setupSpt(); // Just in case there was one in progress.
    this.runSpt();
    assert(this.haveValidSptData);
    this.spt.updateDisplay(false);
  };

  World.prototype.upgradeTower = function(opt_tower) {
    if(opt_tower)
  {
    var tower = opt_tower;
  }
  else
  {
    var tower = this.getSelectedTower();
  }
    if (!tower) {
      throw new UserError('No tower here to upgrade.');
    }
    if (tower.isUpgrading()) {
      throw new UserError("I'm *busy*.");
    }
    if (!tower.canUpgrade()) {
      throw new UserError('No more renovations, ever.');
    }
    if (this.money < tower.getUpgradeCost()) {
      throw new UserError("You can't afford it.");
    }
    this.setMoney(this.money - tower.getUpgradeCost());
    tower.upgrade();
  };

  /**
   * Do all the initialization of a World that can't easily or safely be done in
   * the constructor.  Call immediately after calling the constructor.
   */
  World.prototype.init = function() {
    var i, j, node;
    for (i = 0; i < this.cols; ++i) {
      this.makeObjectAtNode(this.getNode(i, 0), States.BLOCKED);
      this.makeObjectAtNode(this.getNode(i, this.rows - 1), States.BLOCKED);
    }
    for (j = 0; j < this.rows; ++j) {
      node = this.getNode(0, j);
      this.clearNode(node);
      this.makeObjectAtNode(node, States.BLOCKED);
      node = this.getNode(1, j);
      this.clearNode(node);
      this.makeObjectAtNode(node, States.BLOCKED);
      node = this.getNode(this.cols - 2, j);
      this.clearNode(node);
      this.makeObjectAtNode(node, States.BLOCKED);
      node = this.getNode(this.cols - 1, j);
      this.clearNode(node);
      this.makeObjectAtNode(node, States.BLOCKED);
    }
    for (j = Math.floor(this.rows / 2 - 1);
        j < Math.floor(this.rows / 2 + 1); ++j) {
      node = this.getNode(0, j);
      this.clearNode(node);
      this.clearNode(this.getNode(1, j));
      this.makeObjectAtNode(node, States.ENTRANCE);
      node = this.getNode(this.cols - 1, j);
      this.clearNode(node);
      this.clearNode(this.getNode(this.cols - 2, j));
      this.makeObjectAtNode(node, States.EXIT);
    }

    this.setGamePhase(Phases.SETUP); // Runs the initial SPT.
  };

  World.prototype.settingUp = function() {
    return this.gamePhase == Phases.SETUP;
  };

  /**
   * Create the grid of GridNodes.
   *
   * @param {integer} iMax the number of columns to create
   * @param {integer} jMax the number of rows to create
   */
  World.prototype.makeGrid = function(iMax, jMax) {
    grid = [];
    for (var i = 0; i < iMax; ++i) {
      grid[i] = [];
      for (var j = 0; j < jMax; ++j) {
        grid[i][j] = new GridNode(this, i, j);
      }
    }
    return grid;
  };

  /**
   * Create the cursor that the player will use to select towers and
   * construction locations.
   *
   * @param {integer} i the column in which to create the cursor
   * @param {integer} j the row in which to create the cursor
   */
  World.prototype.createCursor = function(i, j) {
    this.cursorDrawings = [];
  this.cursorBaseDrawings = [];
  this.rangeDrawings = [];
  this.dummyDrawings = [];
    this.cursorI = i;
    this.cursorJ = j;
    var translation = this.gridToDrawingCoords(
        i + (O3D_TD_CURSOR_SCALE - 1) / 2,
        j + (O3D_TD_CURSOR_SCALE - 1) / 2,
        O3D_TD_GRID_K);
    for (var idx in clients) {
      var c = clients[idx];

      var d = DrawnObj.newShape(
          c,
          this,
      Shapes.CURSOR3,
          i + (O3D_TD_CURSOR_SCALE - 1) / 2,
          j + (O3D_TD_CURSOR_SCALE - 1) / 2,
          O3D_TD_GRID_K,
          O3D_TD_CURSOR_DIAM * 0.7,
          O3D_TD_CURSOR_DIAM * 0.7,
          O3D_TD_CURSOR_DEPTH * 0.7,
          Drawing.Colors.EXIT);
    g_thingsToNotPick[d.clientId] = true;

      this.cursorDrawings[idx] = d;

    var base = DrawnObj.newShape(
          c,
          this,
      Shapes.CURSOR3BASE,
          i + (O3D_TD_CURSOR_SCALE - 1) / 2,
          j + (O3D_TD_CURSOR_SCALE - 1) / 2,
          O3D_TD_GRID_K,
          O3D_TD_CURSOR_DIAM * 0.7,
          O3D_TD_CURSOR_DIAM * 0.7,
          O3D_TD_CURSOR_DEPTH * 0.7,
          Drawing.Colors.EXIT);
      this.cursorBaseDrawings[idx] = base;

    this.shadowTransform = g_pack.createObject('Transform');
    this.shadowTransform.parent = d.translate;
    this.shadowTransform.addShape(SHADOW_IMAGE);
    this.shadowTransform.scale(0.2, 0.2, 0.2);

      var dummy = DrawnObj.newShape(
          c,
          this,
      Shapes.GRID_BLOCK,
          i + (O3D_TD_CURSOR_SCALE - 1) / 2,
          j + (O3D_TD_CURSOR_SCALE - 1) / 2,
          O3D_TD_GRID_K,
          O3D_TD_CURSOR_DIAM,
          O3D_TD_CURSOR_DIAM,
          O3D_TD_CURSOR_DEPTH,
          Drawing.Colors.EXIT);
      this.dummyDrawings[idx] = dummy;

    d.translate.visible = false;
    this.shadowTransform.visible = false;
    base.translate.visible = false;
    dummy.translate.visible = true;
    }

    this.handleMotion(0, 0); // Adjust to legal position.
  };

  World.prototype.getTowerAtPos = function(i, j) {
    var node0 = this.grid[i][j];
    if (node0.state == States.TOWER) {
      var node1 = this.grid[i + 1][j + 1];
      if (node1.state == States.TOWER && node0.objGuid === node1.objGuid)
    {
    return this.getTowerByGuid(node0.objGuid);
      }
    }
    return null;
  };

  World.prototype.getSelectedTower = function() {
    return this.getTowerAtPos(this.cursorI, this.cursorJ);
  };

  // Assumes i, j are legal!
  World.prototype.setCursorPos = function(i, j) {
    if (!this.cursorDrawings) {
      this.createCursor(i, j);
    } else {
      this.cursorI = i;
      this.cursorJ = j;

      var translation = this.gridToDrawingCoords(
          i + (O3D_TD_CURSOR_SCALE - 1) / 2,
          j + (O3D_TD_CURSOR_SCALE - 1) / 2,
          O3D_TD_GRID_K);
      for (var idx in this.cursorDrawings) {
        var d = this.cursorDrawings[idx];
    var base = this.cursorBaseDrawings[idx];
    var dummy = this.dummyDrawings[idx];
        var v3 = translation.slice(0, 3);
        d.translate.localMatrix = d.client.math.matrix4.translation(v3);
    base.translate.localMatrix = d.client.math.matrix4.translation(v3);
    dummy.translate.localMatrix = d.client.math.matrix4.translation(v3);
    if(g_cursorRange)
    {
      g_cursorRange.translate.localMatrix = d.client.math.matrix4.translation(v3);
    }
      }
    }
  };

  /**
   * Takes a request for a relative motion of the cursor, limits it to the legal
   * playing field area, and moves the cursor as appropriate.
   *
   * @param {integer} di the column offset requested
   * @param {integer} dj the row offset requested
   */
  World.prototype.handleMotion = function(di, dj) {
    var curI = this.cursorI, curJ = this.cursorJ;
    curI = Math.max(O3D_TD_CURSOR_MIN_I_OFFSET,
        Math.min(this.cursorMaxI, curI + di));
    curJ = Math.max(O3D_TD_CURSOR_MIN_J_OFFSET,
        Math.min(this.cursorMaxJ, curJ + dj));
    this.setCursorPos(curI, curJ);
  };

  /**
   * When the user toggles the relevant checkbox, tell the SPT to toggle its
   * display of SPT lines.
   */
  World.prototype.onToggleSptDisplay = function() {
    if (this.spt) {
      this.spt.onToggleDisplay();
    }
  };

  World.prototype.dumpStateGrid = function() {
    o3d.towerdefense._debug('Grid of states:');
    for (var j = this.rows - 1; j >= 0; --j) {
      var s = '';
      for (var i = 0; i < this.cols; ++i) {
        switch (this.grid[i][j].state) {
          case States.OPEN:
            s += '0';
            break;
          case States.BLOCKED:
            s += '1';
            break;
          case States.POPULATED:
            s += '2';
            break;
          case States.ENTRANCE:
            s += '3';
            break;
          case States.EXIT:
            s += '4';
            break;
          case States.TOWER:
            s += '5';
            break;
          default:
            assert(false);
            break;
        }
      }
      o3d.towerdefense._debug(s);
    }
    o3d.towerdefense._debug('');
  };

  World.prototype.dumpSptGrid = function() {
    if (this.spt) {
      this.spt.dumpSptGrid();
    }
  };

  /**
   * Imports state from a completed SPT calculation into the grid.
   */
  World.prototype.promoteSptState = function() {
    assert(this.spt.isValid());
    for (var i = 0; i < this.cols; ++i) {
      for (var j = 0; j < this.rows; ++j) {
        var sptNode = this.spt.grid[i][j];
        var gridNode = this.grid[i][j];
        gridNode.sptCost = sptNode.cost;
        gridNode.dI = sptNode.dI;
        gridNode.dJ = sptNode.dJ;
      }
    }
  };

  /**
   * Set up, but do not run, the shortest-path tree.
   */
  World.prototype.setupSpt = function() {
    if (this.spt) {
      if (!this.spt.setUp) { // Meaning it's complete; clear it out.
        assert(this.spt.complete);
        this.spt.updateDisplay(false); // Dispose of display first.
        this.spt = new o3d.towerdefense.ShortestPathTree(this, false);
      } else {
        o3d.towerdefense.popup('It was set up; leaving it.');
      }
    } else {
      this.spt = new o3d.towerdefense.ShortestPathTree(this, false);
    }
    assert(this.spt.setUp);
  };

  World.prototype.runSpt = function() {
    if (!this.spt || !this.spt.setUp) {
      this.setupSpt();
    }
    assert(this.spt.setUp);
    this.spt.run();
    if (this.spt.isValid()) {
      this.promoteSptState();
      this.haveValidSptData = true;
    }
  };

  /**
   * This isn't currently used; it was handy in debugging the SPT to be able to
   * watch it execute a single step at a time.
   */
  World.prototype.stepSpt = function() {
    if (!this.spt || !this.spt.setUp) {
      this.setupSpt();
    }
    assert(this.spt.setUp);
    this.spt.step();
    if (this.spt.isValid()) {
      this.promoteSptState();
      this.haveValidSptData = true;
    }
  };

  // Called only by Tower code, including the destructor.
  World.prototype.removeTower = function(tower) {
    assert(this.towersByGuid.hasOwnProperty(tower.guid));
    delete this.towersByGuid[tower.guid];
  };

  /**
   * This should only be called once an object has been removed from the world.
   * @see removeObjectAtNode, removeObject
   */
  World.prototype.deleteObject = function(obj) {
    assert(this.objectsByGuid.hasOwnProperty(obj.guid));
    for (var idx in obj.drawings) {
      obj.drawings[idx].makeItGoAway();
    }
    delete this.objectsByGuid[obj.guid];
  };

  /**
   * Call this to add transient objects such as creeps and explosions to the
   * world.  When we're out of waves and all transients have been removed, the
   * game ends.  This is the win condition.
   *
   * @param {Object} trans the transient object
   */
  World.prototype.addTransient = function(trans) {
    assert(!this.transientsByGuid.hasOwnProperty(trans.guid));
    this.transientsByGuid[trans.guid] = trans;
  };

  /**
   * Call this to remove transient objects such as creeps and explosions from
   * the world.  When we're out of waves and all transients have been removed,
   * the game ends.  This is the win condition.
   *
   * @param {Object} trans the transient object
   */
  World.prototype.removeTransient = function(trans) {
    assert(this.transientsByGuid.hasOwnProperty(trans.guid));
    delete this.transientsByGuid[trans.guid];
  };

  World.prototype.deleteAllTransients = function() {
    for (var guid in this.transientsByGuid) {
      this.transientsByGuid[guid].destructor();
    }
  };

  World.prototype.deleteAllTowers = function() {
    this.haveValidSptData = false;
    for (var guid in this.towersByGuid) {
      var tower = this.towersByGuid[guid];
      tower.destructor();
    }
  };

  var Phases = {
    SETUP : 0,
    IN_PROGRESS : 1,
    GAME_OVER : 2
  };

  World.prototype.reportKill = function(creep) {
    this.setCreepsKilled(this.creepsKilled + 1);
    this.setScore(this.score + creep.initHealth);
    this.setMoney(this.money + Math.floor(2.5 * creep.initHealth));
  };

  World.prototype.reportEscape = function(creep) {
  if(this.gamePhase == Phases.IN_PROGRESS)
  {
    this.hitPoints--;

    playerGauge.transform.identity();
    playerGauge.transform.translate(130, 32, -1);
    playerGauge.transform.scale((this.hitPoints/O3D_TD_INIT_HIT_POINTS), 1, 1);

  }
  if (!this.hitPoints) {
  this.endGame();
  }
  };

  /**
   * Used during setup to initialize the game to a clean state.
   */
  World.prototype.deleteAllGameState = function() {
    this.deleteAllTransients();
    this.deleteAllTowers();
    this.runSpt();
    assert(this.haveValidSptData);
  };

  /**
   * This is the main animation/processing function, called once per frame.
   *
   * @param {Number} elapsedTime the number of seconds since the last call.
   */
  World.prototype.stepGame = function(elapsedTime) {
    switch (this.gamePhase) {
      case Phases.SETUP:
        onStop();
        break;
      case Phases.IN_PROGRESS:
        try {
          if (this.waveCountdown) {
            this.setWaveCountdown(this.waveCountdown - elapsedTime);
            if (this.waveCountdown <= 0 && this.waves.length) {
              this.nextWave();
            }
          }
          var allDone = !this.waves.length;
          if (this.wavesActive.length) {
            allDone = false;
            for (var idx in this.wavesActive) {
              var w = this.wavesActive[idx];
              var shouldSpawn;
              // Always start one creep as soon as possible.
              if (w.count != w.origCount && w.timeToRelease > 0) {
                shouldSpawn = Math.random() <
                    w.count * elapsedTime / w.timeToRelease;
                w.timeToRelease -= elapsedTime;
              } else {
                shouldSpawn = true;
              }
              if (shouldSpawn) {
                --w.count;
                if (!w.count) {
                  this.wavesActive.splice(idx, 1);
                }
                var node = this.entranceNodes[
                    Math.floor(Math.random() * this.entranceNodes.length)];
                creep = Creep.newInstance(node.i, node.j, w.type, w.health);
                this.addTransient(creep);
              }
            }
          }
          for (var guid in this.transientsByGuid) {
            allDone = false;
            this.transientsByGuid[guid].animateOneStep(elapsedTime);
          }
          for (var guid in this.towersByGuid) {
            this.towersByGuid[guid].animateOneStep(elapsedTime);
          }
          if (allDone) {
            this.endGame();
          }
        } catch (ex) {
          if (ex instanceof GameOverException) {
            game.showHighScores();
            alert(ex.s);
          } else {
            throw ex;
          }
        }
        break;
      case Phases.GAME_OVER:
        onStop();
        break;
      default:
        assert(false);
    }
  };

  World.prototype.setMoney = function(val) {
    assert(val >= 0);
    this.money = val;

  if(g_iconBacks[10])
  {
    //missile tower
    if(val < 20){ g_iconBacks[8].sampler.texture = g_textures[18]; }
    else { g_iconBacks[8].sampler.texture = g_textures[8]; }
    //oozie tower
    if(val < 10){ g_iconBacks[9].sampler.texture = g_textures[19]; }
    else { g_iconBacks[9].sampler.texture = g_textures[9]; }
    //ball tower
    if(val < 5){ g_iconBacks[10].sampler.texture = g_textures[20]; }
    else { g_iconBacks[10].sampler.texture = g_textures[10]; }
  }
  };

  World.prototype.setScore = function(val) {
    this.score = val;
  };

  World.prototype.setCreepsKilled = function(val) {
    this.creepsKilled = val;
  };

  World.prototype.setCreepsEscaped = function(val) {
    this.creepsEscaped = val;
  };

  World.prototype.setHitPoints = function(val) {
    this.hitPoints = val;
  };

  /**
   * Takes a time in seconds until the next wave.  Will update the display
   * each second, or if reset to a higher number.
   */
  World.prototype.setWaveCountdown = function(val) {
    if (val < 0) {
      val == 0;
    }
    var rounded = Math.floor(val);
    if ((rounded < Math.floor(this.waveCountdown)) ||
        (val > this.waveCountdown)) {
//      setIntegerField('wave_countdown', rounded);
    }
    this.waveCountdown = val;
  };

  World.prototype.setWaveNumber = function(val) {
  if(g_splashScreenA){removeScreen(g_splashScreenA);}

  switch(val)
  {
    case  1:
      g_splashScreenA = addScreen(g_textures[22]);
      break;
    case  2:
      g_splashScreenA = addScreen(g_textures[23]);
      break;
    case  3:
      g_splashScreenA = addScreen(g_textures[24]);
      break;
    case  4:
      g_splashScreenA = addScreen(g_textures[25]);
      break;
    case  5:
      g_splashScreenA = addScreen(g_textures[26]);
      break;
    case  6:
      g_splashScreenA = addScreen(g_textures[27]);
      break;
    case  7:
      g_splashScreenA = addScreen(g_textures[28]);
      break;
    case  8:
      g_splashScreenA = addScreen(g_textures[29]);
      break;
    case  9:
      g_splashScreenA = addScreen(g_textures[30]);
      break;
    case 10:
      g_splashScreenA = addScreen(g_textures[31]);
      break;
    case 11:
      g_splashScreenA = addScreen(g_textures[32]);
      break;
    case 12:
      g_splashScreenA = addScreen(g_textures[33]);
      break;
    case 13:
      g_splashScreenA = addScreen(g_textures[34]);
      break;
    case 14:
      g_splashScreenA = addScreen(g_textures[35]);
      break;
    case 15:
      g_splashScreenA = addScreen(g_textures[36]);
      break;
    case 16:
      g_splashScreenA = addScreen(g_textures[37]);
      break;
    case 17:
      g_splashScreenA = addScreen(g_textures[38]);
      break;
    case 18:
      g_splashScreenA = addScreen(g_textures[39]);
      break;
    case 19:
      g_splashScreenA = addScreen(g_textures[40]);
      break;
    case 20:
      g_splashScreenA = addScreen(g_textures[41]);
      break;
    case 21:
      g_splashScreenA = addScreen(g_textures[42]);
      break;
    case 22:
      g_splashScreenA = addScreen(g_textures[43]);
      break;
    case 23:
      g_splashScreenA = addScreen(g_textures[44]);
      break;
    case 24:
      g_splashScreenA = addScreen(g_textures[45]);
      break;
    case 25:
      g_splashScreenA = addScreen(g_textures[46]);
      break;
  }
    this.waveNumber = val;
  };

  World.prototype.setCurWaveInfo = function(str) {
  };

  World.prototype.setNextWaveInfo = function(str) {
  };

  World.prototype.setWavesLeft = function(val) {
    if (!val) {
    }
  };

  // TODO: Consider moving some game state [score, etc.] into Game from World.
  World.prototype.resetGame = function() {
    o3d.towerdefense._debug('GAME RESET');
  if(g_resetSwitch)
  {
    removeScreen(g_splashScreenA);
    removeScreen(g_splashScreenB);
    g_resetSwitch = false;
    g_iconBacks[7].visible = false;
    g_iconBacks[7].transform.parent = null;
    greyIcons(false);
    paused = false;
    pregame = true;
    g_iconBacks[5].sampler.texture = g_textures[54];
    for (var idx in world.cursorDrawings) {
    var d = world.cursorDrawings[idx];
    d.setDrawingShape("CURSOR3");
    var base = world.cursorBaseDrawings[idx];
    base.setDrawingShape("CURSOR3BASE");
    }

    g_iconBacks[g_selectedIndex].sampler.texture = g_textures[4];

    g_selectedIndex = 2;

    g_iconBacks[g_selectedIndex].sampler.texture = g_textures[16];

    game.selectTowerType(2);
  }

  if(g_cursorRange) { g_cursorRange.makeItGoAway(); }
  if(g_upgradeIcon) { g_upgradeIcon.makeItGoAway(); }
  if(g_rangeIcon) { g_rangeIcon.makeItGoAway(); }

  this.hitPoints = O3D_TD_INIT_HIT_POINTS;
  playerGauge.transform.identity();
  playerGauge.transform.translate(130, 32, -1);
  playerGauge.transform.scale((this.hitPoints/O3D_TD_INIT_HIT_POINTS), 1, 1);

  this.setGamePhase(Phases.SETUP);
  };

  /**
   * Brings on the next wave of creeps, if any, starting the game if it wasn't
   * already.
   */
  World.prototype.nextWave = function() {
    switch (this.gamePhase) {
      case Phases.SETUP:
        this.setGamePhase(Phases.IN_PROGRESS); // FALL THROUGH
      case Phases.IN_PROGRESS:
        if (this.waves.length) {
          var wave = this.waves.pop();
          this.setCurWaveInfo(wave.toString());
          this.wavesActive.push(wave);
          soundControl.play(soundControl.id.CREEP_WAVE_START);
          this.setWaveNumber(this.waveNumber + 1);
          this.setWavesLeft(this.waves.length);
          if (this.waves.length) {
            this.setWaveCountdown(O3D_TD_SECONDS_PER_WAVE);
            this.setNextWaveInfo(this.waves[this.waves.length - 1].toString());
          } else {
            this.setWaveCountdown(0);
            this.setNextWaveInfo('None!');
          }
        }
        break;
      case Phases.GAME_OVER:
        throw new UserError('No more waves.');
      default:
        assert(false);
    }
  };

  /**
   * Resets the set of waves such that they start up again from the beginning
   * and continue play, even if the game had already been lost.  Resets hit
   * points back to full as well.
   */
  World.prototype.sendAnExtraWave = function() {
    this.setupNonBoardStuff();
    if (this.gamePhase == Phases.GAME_OVER) {
      this.setGamePhase(Phases.IN_PROGRESS);
    }
    this.nextWave();
  };

  World.prototype.endGame = function() {
    this.setGamePhase(Phases.GAME_OVER);
  };

  function setButtonDisabled(id, val) {
    var elt = document.getElementById(id);
    elt.disabled = val;
    return elt;
  }

  World.prototype.setupNonBoardStuff = function() {
    this.setHitPoints(O3D_TD_INIT_HIT_POINTS);
    this.setWaveCountdown(0); // Just for display purposes.
    this.setupWaves();
    this.setWaveNumber(0);
    this.setWavesLeft(this.waves.length);
    this.setCreepsEscaped(0);
    this.setMoney(O3D_TD_INIT_MONEY);
    this.setScore(0);
    this.setCreepsKilled(0);
  };

  /**
   * Used to change phase of the game.  If called to end the game, throws
   * GameOverException instead of returning.
   *
   * @param {String} phase a field of Phases
   */
  World.prototype.setGamePhase = function(phase) {
    var elt;
    switch (phase) {
      case Phases.SETUP:
        this.deleteAllGameState();
        this.setupNonBoardStuff();
        break;
      case Phases.IN_PROGRESS:
        onAnimate();
        break;
      case Phases.GAME_OVER:
        onStop();
        this.gamePhase = Phases.GAME_OVER;
        var won = this.hitPoints != 0;

        if (won) {
      if(paused)
      {
      game.togglePause();
      }
          soundControl.play(soundControl.id.GAME_WON);
      newY = g_client.height - (g_client.height/4);
      g_splashScreenB = addScreen(g_textures[13]);
      setupControls("SPLASH");
      playerGauge.transform.scale(0,0,0);
          g_canvas.canvas.clear([1, 1, 1, 0]);
      g_canvas.canvas.drawText("POINTS:"+this.score.toString(), 100, 52.5, g_paint);
      g_canvas.updateTexture();
      clients[0].client.clearRenderCallback();
      clients[0].client.setRenderCallback(finishScreen);
        } else {
      if(paused)
      {
      game.togglePause();
      }
          soundControl.play(soundControl.id.GAME_LOST);
      newY = g_client.height - (g_client.height/4);
      g_splashScreenB = addScreen(g_textures[12]);
      setupControls("SPLASH");
      playerGauge.transform.scale(0,0,0);
      g_canvas.canvas.clear([1, 1, 1, 0]);
      g_canvas.canvas.drawText("POINTS:"+this.score.toString(), 100, 52.5, g_paint);
      g_canvas.updateTexture();
      clients[0].client.clearRenderCallback();
      clients[0].client.setRenderCallback(finishScreen);
        }
      break;
      default:
        assert(false);
    }
    this.gamePhase = phase;
  };

  World.prototype.getTowerByGuid = function(guid) {
    assert(this.towersByGuid.hasOwnProperty(guid));
    return this.towersByGuid[guid];
  };

  World.prototype.getObjectByGuid = function(guid) {
    assert(this.objectsByGuid.hasOwnProperty(guid));
    return this.objectsByGuid[guid];
  };

  World.prototype.getTransientByGuid = function(guid) {
    assert(this.transientsByGuid.hasOwnProperty(guid));
    return this.transientsByGuid[guid];
  };

  /**
   * A description of a wave of creeps.  We attempt to release all the creeps in
   * roughly waveFractionOfRelease * SECONDS_PER_WAVE seconds.
   *
   * @constructor
   * @param {String} type the type of creep
   * @param {integer} health each creep's initial hit points
   * @param {integer} count how many creeps to spawn
   * @param {number} waveFractionOfRelease over which portion of the beginning
   * of the wave interval should we spread the spawning of these creeps?  Use a
   * number between 0 and 1.
   */
  function Wave(type, health, count, waveFractionOfRelease) {
    this.type = type;
    this.health = health;
    this.count = count;
    this.origCount = count;
    this.timeToRelease = Math.ceil(waveFractionOfRelease *
        O3D_TD_SECONDS_PER_WAVE);

    return this;
  }

  Wave.prototype.toString = function() {
    return this.count + ' ' + this.health + '-Hit-Point ' +
      Creep.getPrettyName(this.type) +
      (this.count > 1 ? 'Creeps' : 'Creep');
  };

  /**
   * Sets up the table of waves; this is a good place to look to see what the
   * whole game's going to look like, and to tweak difficulty.
   */
  World.prototype.setupWaves = function() {
    this.waves = [
  //      TYPE        HP    #   RATE
    new Wave(Creep.Type.BASIC,  1,    3,    1.0), //(wave 1)
      new Wave(Creep.Type.BASIC,  1,    5,    1.0), //(wave 2)
      new Wave(Creep.Type.FAST,   2,    3,    1.0), //(wave 3)
      new Wave(Creep.Type.BASIC,  2,    3,    1.0), //(wave 4)
      new Wave(Creep.Type.JUMPING,  12,   1,    1.0), //(wave 5)
      new Wave(Creep.Type.FAST,   4,    3,    1.0), //(wave 6)
      new Wave(Creep.Type.BASIC,    4,    3,    1.0), //(wave 7)
      new Wave(Creep.Type.BASIC,  6,    2,    1.0), //(wave 8)
      new Wave(Creep.Type.FAST,     6,    2,    1.0), //(wave 9)
      new Wave(Creep.Type.FLYING,   10,   1,    1.0), //(wave 10)
      new Wave(Creep.Type.FLYING,   8,    3,    1.0), //(wave 11)
      new Wave(Creep.Type.FAST,   8,    3,    1.0), //(wave 12)
      new Wave(Creep.Type.FLYING, 10,   2,    1.0), //(wave 13)
      new Wave(Creep.Type.FAST,   10,   2,    1.0), //(wave 14)
      new Wave(Creep.Type.JUMPING,  30,   1,    1.0), //(wave 15)
      new Wave(Creep.Type.FLYING,   12,   3,    1.0), //(wave 16)
      new Wave(Creep.Type.FAST,   12,   3,    1.0), //(wave 17)
      new Wave(Creep.Type.FAST,   14,   3,    1.0), //(wave 18)
      new Wave(Creep.Type.BASIC,  14,   3,    1.0), //(wave 19)
      new Wave(Creep.Type.JUMPING,  50,   1,    1.0), //(wave 20)
      new Wave(Creep.Type.FLYING, 16,   4,    1.0), //(wave 21)
      new Wave(Creep.Type.FAST,   16,   4,    1.0), //(wave 22)
      new Wave(Creep.Type.BASIC,  18,   4,    1.0), //(wave 23)
      new Wave(Creep.Type.FLYING, 18,   3,    1.0), //(wave 24)
      new Wave(Creep.Type.JUMPING,  80,   1,    1.0), //(wave 25)
    ].reverse();
    this.wavesActive = [];
    this.setCurWaveInfo('');
    this.setNextWaveInfo(this.waves[this.waves.length - 1].toString());
  };
}) ();
