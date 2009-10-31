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
 * @fileoverview  This file contains the Creep class and its subclasses.
 * It's been written for Firefox 2, but should be easy to port to other
 * browsers.
 */

/**
 * The Creep represents an enemy in the game.  It enters at an ENTRANCE node of
 * the grid, attempts to proceed to an EXIT node the best way it knows how
 * [which varies by subclass], takes damage and possibly dying along the way.
 *
 * The Creep constructor should not be called directly; use Creep.newInstance
 * instead.
 *
 * @constructor
 */
function Creep() {
  return this;
}

(function() {
  // Move 1 manhattan square in ? seconds.
  var CREEP_SECS_PER_MOVE = 0.5;

  // Because of the rounding, if we move at the same speed on a diagonal as we
  // do on a straightaway, we'll go the wrong distance.  So we tweak the
  // diagonal speed just a touch.
  var CREEP_SECS_PER_DIAGONAL_MOVE = CREEP_SECS_PER_MOVE *
      O3D_TD_SQRT_2;

  var CREEP_BASE_SPEED = 1 / CREEP_SECS_PER_MOVE;
  var CREEP_DIAGONAL_SPEED = 1 / CREEP_SECS_PER_DIAGONAL_MOVE;
  var BASE_DIST_ARRAY = [
    -CREEP_BASE_SPEED, 0, CREEP_BASE_SPEED
  ];
  var DIAG_DIST_ARRAY = [
    -CREEP_DIAGONAL_SPEED, 0, CREEP_DIAGONAL_SPEED
  ];

  Creep.Type = {
    BASIC: 'BASIC_CREEP',
    FAST: 'FAST_CREEP',
    FLYING: 'FLYING_CREEP',
    JUMPING: 'JUMPING_CREEP'
  };

  /**
   * Use this to create new creeps, rather than using the raw constructors.
   *
   * @param {integer} i the column where the creep will start
   * @param {integer} j the row where the creep will start
   * @param {String} type a field of Creep.Type
   * @param {integer} health the initial health of this creep
   */
  Creep.newInstance = function(i, j, type, health) {
    var t;
    switch (type) {
    case Creep.Type.BASIC:
      t = new BasicCreep();
      break;
    case Creep.Type.FAST:
      t = new FastCreep();
      break;
    case Creep.Type.FLYING:
      t = new FlyingCreep();
      break;
    case Creep.Type.JUMPING:
      t = new JumpingCreep();
      break;
    default:
      assert(false);
    }
    t.init(i, j, health);
    return t;
  };

  Creep.getPrettyName = function(type) {
    switch (type) {
    case Creep.Type.BASIC:
      return 'Basic';
    case Creep.Type.FAST:
      return 'Fast';
    case Creep.Type.FLYING:
      return 'Flying';
    case Creep.Type.JUMPING:
      return 'Jumping';
    default:
      assert(false);
    }
  };

  /**
   * Initializes a newly-created Creep, and is called from newInstance
   * immediately after construction.  Any overriding classes should call this
   * before doing their own initialization.
   *
   * @param {integer} i the column where the creep will start
   * @param {integer} j the row where the creep will start
   * @param {integer} health the initial health of this creep
   */
  Creep.prototype.init = function(i, j, health) {
  this.slimeCount = 0;
  this.slimed = false;
  this.dead = false;
    this.guid = guidForType('CREEP');
    this.jitterI = (Math.random() - 0.5) * 0.2;
    this.i = i + this.jitterI;
    this.jitterJ = (Math.random() - 0.5) * 0.2;
    this.j = j + this.jitterJ;
  this.lastI = this.i;
  this.lastJ = this.j;
    this.health = health;
    this.initHealth = health;
    this.node = world.getNode(Math.round(i), Math.round(j));
    this.node.addCreep(this);


    this.computeTrajectory(true);
    this.drawings = [];

    for (var idx in clients) {
      var c = clients[idx];

      var d = DrawnObj.newPoolShape(
          c,
          this.type,
          world,
      this.shapeName,
          this.i,
          this.j,
          this.k,
          this.length,
          this.width,
          this.height,
          Drawing.Colors.EXIT);

      if(!this.flying)
    {
      this.shadowTransform = g_pack.createObject('Transform');
      this.shadowTransform.parent = d.translate;
      this.shadowTransform.addShape(SHADOW_IMAGE);
      this.shadowTransform.scale(this.shadowWidth, this.shadowLength, this.shadowHeight);
    }


    g_thingsToNotPick[d.clientId] = true;

      this.drawings[idx] = d;
    }
  };

  Creep.prototype.distArray = BASE_DIST_ARRAY;
  Creep.prototype.diagDistArray = DIAG_DIST_ARRAY;
  Creep.prototype.timePerMove = CREEP_SECS_PER_MOVE;
  Creep.prototype.initTimePerMove = CREEP_SECS_PER_MOVE;
  Creep.prototype.timePerDiagonalMove = CREEP_SECS_PER_DIAGONAL_MOVE;
  Creep.prototype.k = O3D_TD_GRID_K;
  Creep.prototype.dieSound = soundControl.id.CREEP_DIE;
  Creep.prototype.escapeSound = soundControl.id.CREEP_ESCAPE;
  Creep.prototype.targetDK = O3D_TD_CREEP_DEPTH / 2;
  Creep.prototype.destDK = O3D_TD_CREEP_DEPTH / 15 +
      Creep.prototype.targetDK;

  /**
   * Updates the drawing, given the current state of the creep.  It changes
   * no creep state.
   */
  Creep.prototype.updateDrawing = function() {
    var math = o3djs.math;

    var trans = world.gridToDrawingCoords(this.i, this.j, this.k);
  var sTrans = world.gridToDrawingCoords(this.i, this.j, 0);
    for (var idx in this.drawings) {
      var d = this.drawings[idx];
      d.translate.localMatrix = math.matrix4.translation(trans);
    }
  };

  /**
   * Calculates the z-axis orientation of a creep.
   * Allows creeps to do slow turns so they don't look jumpy
   *
   * @param {number} duration time over which to do a slow pan
   */
  Creep.prototype.doOrientationRecalc = function(doSlowTurn, duration) {
    if (!this.dI) {
      if (this.dJ < 0) {
        this.thetaNew = -Math.PI / 2;
      } else {
        this.thetaNew = Math.PI / 2;
      }
    } else {
      this.thetaNew = Math.atan2(this.dJ, this.dI);
    }
    if (doSlowTurn) {
      // Only do slow pans if requested and if orientation is changing.
      if (this.thetaNew != this.theta) {
        this.rotateTime = duration;
        if (Math.abs(this.thetaNew - this.theta) > Math.PI) {
          if (this.theta > this.thetaNew) {
            this.theta -= O3D_TD_TWO_PI;
          } else {
            this.theta += O3D_TD_TWO_PI;
          }
        }
        this.dTheta = (this.thetaNew - this.theta) / this.rotateTime;
      }
    } else {
      this.rotateTime = 0;
      this.theta = this.thetaNew;
      this.needAngleUpdate = true;
    }
  };

  /**
   * Given where the creep is, where should it be going?
   * Most of the time, we just need a quick and cheap calculation, since we will
   * move exactly one grid node at a time.  However, when the SPT changes during
   * a motion, we have to do a more complex calculation.
   *
   * @param {boolean} quick whether we can get away with the cheap calculation
   */
  Creep.prototype.computeTrajectory = function(quick) {
    var destNode =
        world.getNode(
            this.node.i + this.node.dI,
            this.node.j + this.node.dJ);
    var destI = destNode.i + this.jitterI;
    var destJ = destNode.j + this.jitterJ;
    var distance;
    if (quick) { // Just use cached data.
      dI = this.node.dI;
      dJ = this.node.dJ;

      if (!dI == !dJ) { // Diagonal
        this.timeLeft = this.timePerDiagonalMove;
        this.dI = this.diagDistArray[dI + 1];
        this.dJ = this.diagDistArray[dJ + 1];
        distance = O3D_TD_SQRT_2;
      } else {
        this.timeLeft = this.timePerMove;
        this.dI = this.distArray[dI + 1];
        this.dJ = this.distArray[dJ + 1];
        distance = 1;
      }
    } else { // Do the full computation, assuming that things have changed.
      var dI = destI - this.i;
      var dJ = destJ - this.j;
      distance = Math.sqrt(dI * dI + dJ * dJ);
      // TODO(ericu): This makes us move very slowly at times [changes to the
      // board cause us to take 1 square's-worth of time to move the next step,
      // even if it's really short].
      this.timeLeft = this.timePerMove; // Jumping's quick, so won't be here.
      this.dI = dI / this.timeLeft;
      this.dJ = dJ / this.timeLeft;
    }
    this.fromNodeDI = this.node.dI;
    this.fromNodeDJ = this.node.dJ;
    this.fromNode = this.node;

    this.doOrientationRecalc(true, 0.2);
  };

  /**
   * Returns true if the SPT has changed such that we need to do an emergency
   * trajectory recalculation.  Overridden by subclasses with special needs.
   */
  Creep.prototype.needTrajectoryRecalc = function() {
    return (this.fromNodeDI != this.fromNode.dI ||
        this.fromNodeDJ != this.fromNode.dJ);
  };

  Creep.prototype.incrementTheta = function(elapsedTime) {
    if (this.rotateTime > 0) {
      this.rotateTime -= elapsedTime;
      if (this.rotateTime > 0) {
        this.theta += this.dTheta * elapsedTime;
      } else {
        this.rotateTime = 0;
        this.theta = this.thetaNew;
      }
      this.needAngleUpdate = true;
    }
  };

  Creep.prototype.adjustDrawingAngle = function() {
    var math = o3djs.math;
    for (var idx in this.drawings) {
      var d = this.drawings[idx];
      d.rotZ.localMatrix = math.matrix4.rotationZ(this.theta);
    }
    var t = math.mul([this.length / 2, 0, 0, 1],
        math.matrix4.rotationZ(this.theta));
    // Where should folks who want to shoot us aim?
    this.targetDI = t[0];
    this.targetDJ = t[1];
    this.destDI = 2 * this.targetDI;
    this.destDJ = 2 * this.targetDJ;
    // Skip z.
    this.needAngleUpdate = false;
  };

  /**
   * This is the main animation/processing function, called once per frame.
   */
  Creep.prototype.animateOneStep = function(elapsedTime)
  {
    assert(this.timeLeft > 0);

  if(this.slimed)
  {
    this.slimeCount--;
    if(this.slimeCount <= 0)
    {
      this.timePerMove = this.initTimePerMove;
      this.slimed = false;
    }
  }

  if(this.particle)
  {
    i = this.i/this.particleI;
    j = this.j/this.particleJ;
    k = this.k/this.particleK;
    updateParticle(i, j, k, this.particle);
  }

  if(!this.dead)
  {
    if (elapsedTime > this.timeLeft) {
      elapsedTime = this.timeLeft;
    }
    if (this.rotateTime && elapsedTime > this.rotateTime) {
      elapsedTime = this.rotateTime;
    }
    if (this.needTrajectoryRecalc()) {
      // The tree has changed in a relevant way.  Time to recalculate.
      // We're guaranteed still to be in a location that's valid [not blocked],
      // so we'll just walk from our current location to the destination pointed
      // to by our current node.
      this.computeTrajectory(false);
    }

    this.incrementTheta(elapsedTime);
    if (this.needAngleUpdate) {
      this.adjustDrawingAngle();
    }
    this.i += this.dI * elapsedTime;
    this.j += this.dJ * elapsedTime;
    this.timeLeft -= elapsedTime;

    // Now determine if we should change our node registry.
    var gridI = Math.round(this.i);
    var gridJ = Math.round(this.j);
    if (gridI != this.node.i || gridJ != this.node.j) { // Moved over a boundary
      var newNode = world.getNode(gridI, gridJ);
      if (newNode.state == States.EXIT) {
      soundControl.play(this.escapeSound);
      world.reportEscape(this);
      this.destructor();
      return;
      } else {
      GridNode.MoveCreepBetweenGridNodes(this.node, newNode, this);
      this.node = newNode;
      }
    }
    this.updateDrawing();

    if (this.timeLeft <= 0) {
      this.computeTrajectory(true);
    }
  }
  else
  {
    this.dead += elapsedTime;
    if(this.dead >= this.getDeathFrameCount())
    {
      for (var idx in this.drawings)
      {
        var d = this.drawings[idx];
        //the shape used when a creep is walking
        d.setDrawingShape(this.getName()+"_WALK");
      }
      this.destructor();
    }
  }
  };

  Creep.prototype.receiveDamage = function(points, slime, level) {
  if(slime)
  {
    this.slimeCount += level*100;
    if(!this.slimed)
    {
      this.timePerMove /= 10*level;
      this.slimed = true;
    }
  }
    this.health -= points;

  var percentHealth = this.health/this.initHealth;

    if (this.health <= 0) {
      world.reportKill(this);
      soundControl.play(this.dieSound);
    this.dead = 0.1;
    if(this.type == Creep.Type.BASIC)
    {
    for(ii = 0; ii < g_animTimeParam.length; ii++)
    {
      if(g_animTimeParam[ii].name == "anim_princess_death")
      {
        g_animTimeParam[ii].value = 0;
      }
    }
    }
    else if(this.type == Creep.Type.FAST)
    {
    for(ii = 0; ii < g_animTimeParam.length; ii++)
    {
      if(g_animTimeParam[ii].name == "anim_racecar_death")
      {
        g_animTimeParam[ii].value = 0;
      }
    }
    }
    else if(this.type == Creep.Type.FLYING)
    {
    for(ii = 0; ii < g_animTimeParam.length; ii++)
    {
      if(g_animTimeParam[ii].name == "anim_toyrobot_death")
      {
        if(this.particle)
        {
          this.particle.transform.visible = false;
          this.particle.transform.parent = null;
        }
        g_animTimeParam[ii].value = 0;
      }
    }
    }
    else if(this.type == Creep.Type.JUMPING)
    {
    for(ii = 0; ii < g_animTimeParam.length; ii++)
    {
      if(g_animTimeParam[ii].name == "anim_dinosaur_death")
      {
        g_animTimeParam[ii].value = 0;
      }
    }
    }
      for (var idx in this.drawings)
    {
    var d = this.drawings[idx];
    //the shape used when a creep is dying
    d.setDrawingShape(this.getName()+"_DEATH");
    }
    }
  };

  Creep.prototype.getName = function() {
  switch(this.type)
  {
    case Creep.Type.BASIC:
      return "PRINCESS";
    case Creep.Type.FAST:
      return "RACECAR";
    case Creep.Type.FLYING:
      return "ROBOT";
    case Creep.Type.JUMPING:
      return "DINO";
  }
  }

  Creep.prototype.getDeathFrameCount = function() {
  switch(this.type)
  {
    case Creep.Type.BASIC:
      return 56 / 30;
    case Creep.Type.FAST:
      return 91 / 30;
    case Creep.Type.FLYING:
      return 81 / 30;
    case Creep.Type.JUMPING:
      return 70 / 30;
  }
  }

  /**
   * The creep is responsible for calling its destructor when it goes away for
   * any reason.  Any subclass that overrides this function or any method that
   * calls it should make sure to call it as appropriate.
   */
  Creep.prototype.destructor = function() {
  if(this.particle)
  {
    this.particle.transform.visible = false;
    this.particle.transform.parent = null;
  }
    for (var idx in this.drawings) {
      this.drawings[idx].makeItGoAway();
    }
    if (this.camera) {
      this.camera.releaseCamera();
      this.camera = null;
    }
    this.node.removeCreep(this);
    world.removeTransient(this);
    this.done = true;
  };

  /**
   * BasicCreeps are the simplest Creeps; they have no special attributes.
   *
   * @extends Creep
   * @constructor
   */
  function BasicCreep() {
  }

  BasicCreep.prototype = new Creep();
  BasicCreep.prototype.constructor = BasicCreep;
  BasicCreep.prototype.shapeName = Shapes.PRINCESS_WALK;
  BasicCreep.prototype.type = Creep.Type.BASIC;
  BasicCreep.prototype.color = Drawing.Colors.BASIC_CREEP;
  BasicCreep.prototype.length = 0.5;
  BasicCreep.prototype.width = 0.5;
  BasicCreep.prototype.height = 0.5;
  BasicCreep.prototype.shadowLength = 0.25;
  BasicCreep.prototype.shadowWidth = 0.25;
  BasicCreep.prototype.shadowHeight = 0.25;
  BasicCreep.prototype.targetDK = BasicCreep.prototype.height / 2;

  BasicCreep.prototype.init = function(i, j, health) {
    Creep.prototype.init.call(this, i, j, health);
  };

  // Move 1 manhattan square in ? seconds, scaled by FPS.
  var FAST_CREEP_SECS_PER_MOVE = CREEP_SECS_PER_MOVE / 2;

  // Because of the rounding, if we move at the same speed on a diagonal as we
  // do on a straightaway, we'll go the wrong distance.  So we tweak the
  // diagonal speed just a touch.
  var FAST_CREEP_SECS_PER_DIAGONAL_MOVE = FAST_CREEP_SECS_PER_MOVE *
      O3D_TD_SQRT_2;

  var FAST_CREEP_BASE_SPEED = 1 / FAST_CREEP_SECS_PER_MOVE;
  var FAST_CREEP_DIAGONAL_SPEED =
      1 / FAST_CREEP_SECS_PER_DIAGONAL_MOVE;
  var FAST_BASE_DIST_ARRAY = [
    -FAST_CREEP_BASE_SPEED, 0, FAST_CREEP_BASE_SPEED
  ];
  var FAST_DIAG_DIST_ARRAY = [
    -FAST_CREEP_DIAGONAL_SPEED, 0, FAST_CREEP_DIAGONAL_SPEED
  ];

  /**
   * FastCreeps are twice as fast as BasicCreeps.
   *
   * @extends Creep
   * @constructor
   */
  function FastCreep() {
  }

  FastCreep.prototype = new Creep();
  FastCreep.prototype.constructor = FastCreep;
  FastCreep.prototype.type = Creep.Type.FAST;
  FastCreep.prototype.shapeName = Shapes.RACECAR_WALK;
  FastCreep.prototype.distArray = FAST_BASE_DIST_ARRAY;
  FastCreep.prototype.diagDistArray = FAST_DIAG_DIST_ARRAY;
  FastCreep.prototype.color = Drawing.Colors.FAST_CREEP;
  FastCreep.prototype.timePerMove = FAST_CREEP_SECS_PER_MOVE;
  FastCreep.prototype.initTimePerMove = FAST_CREEP_SECS_PER_MOVE;
  FastCreep.prototype.timePerDiagonalMove = FAST_CREEP_SECS_PER_DIAGONAL_MOVE;
  FastCreep.prototype.length = 0.25;
  FastCreep.prototype.width = 0.25;
  FastCreep.prototype.height = 0.25;
  FastCreep.prototype.shadowLength = 0.25;
  FastCreep.prototype.shadowWidth = 0.25;
  FastCreep.prototype.shadowHeight = 0.25;

  FastCreep.prototype.init = function(i, j, health) {
    Creep.prototype.init.call(this, i, j, health);
  };

  /**
   * FlyingCreeps fly right over walls, so they just move in a straight line.
   *
   * @extends Creep
   * @constructor
   */
  function FlyingCreep() {
  }

  FlyingCreep.prototype = new Creep();
  FlyingCreep.prototype.constructor = FlyingCreep;
  FlyingCreep.prototype.type = Creep.Type.FLYING;
  FlyingCreep.prototype.shapeName = Shapes.ROBOT_WALK;
  FlyingCreep.prototype.color = Drawing.Colors.FLYING_CREEP;
  FlyingCreep.prototype.flying = true;
  FlyingCreep.prototype.dI = 1 / FlyingCreep.prototype.timePerMove;
  FlyingCreep.prototype.dJ = 0;
  FlyingCreep.prototype.k = O3D_TD_FLYING_K;
  FlyingCreep.prototype.length = 0.5;
  FlyingCreep.prototype.width = 0.5;
  FlyingCreep.prototype.height = 0.5;
  FlyingCreep.prototype.shadowLength = 0.5;
  FlyingCreep.prototype.shadowWidth = 0.5;
  FlyingCreep.prototype.shadowHeight = 0.5;

  FlyingCreep.prototype.destDK =
      -O3D_TD_CREEP_DEPTH / 10 + FlyingCreep.prototype.targetDK;

  FlyingCreep.prototype.init = function(i, j, health) {
    Creep.prototype.init.call(this, i, j, health);
  this.particleI = 0.95;
  this.particleJ = 1;
  this.particleK = 9;
  i = this.i / this.particleI;
  j = this.j / this.particleJ;
  k = this.k / this.particleK;
    this.particle = addFlame(i, j, k);
  };

  FlyingCreep.prototype.needTrajectoryRecalc = function() {
    return false;
  };

  // This assumes flyers never turn and that they don't move diagonally.  It
  // ignores the theta stuff that other creeps use for target and eye locations.
  FlyingCreep.prototype.computeTrajectory = function(quick) {
    this.timeLeft = this.timePerMove;
    if (this.dI) {
      this.targetDI = (Math.abs(this.dI) / this.dI) * this.length / 2;
    } else {
      this.targetDI = 0;
    }
    if (this.dJ) {
      this.targetDJ = (Math.abs(this.dJ) / this.dJ) * this.length / 2;
    } else {
      this.targetDJ = 0;
    }
    this.destDI = 2 * this.targetDI;
    this.destDJ = 2 * this.targetDJ;
  };

  /**
   * JumpingCreeps are much like BasicCreeps, except that they'll jump over
   * walls with some probability roughly proportional to how much faster it will
   * get them to the exit.
   *
   * @extends Creep
   * @constructor
   */
  function JumpingCreep() {
  }

  JumpingCreep.prototype = new Creep();
  JumpingCreep.prototype.constructor = JumpingCreep;
  JumpingCreep.prototype.type = Creep.Type.JUMPING;
  JumpingCreep.prototype.shapeName = Shapes.DINO_WALK;
  JumpingCreep.prototype.color = Drawing.Colors.JUMPING_CREEP;
  JumpingCreep.prototype.length = 0.5;
  JumpingCreep.prototype.width = 0.5;
  JumpingCreep.prototype.height = 0.5;
  JumpingCreep.prototype.shadowLength = 0.5;
  JumpingCreep.prototype.shadowWidth = 0.5;
  JumpingCreep.prototype.shadowHeight = 0.5;
  // Don't jump for less than this.
  // If less than 4, we'll jump rather than walk!
  JumpingCreep.prototype.ADV_MIN = 7;
  // the advantage above which we always jump
  JumpingCreep.prototype.ADV_MAX =
      O3D_TD_I_MAX * O3D_TD_J_MAX * 0.45;
  JumpingCreep.prototype.jumpSound = soundControl.id.CREEP_SPROING;
  // Jumps over towers will be height 4; shorter jumps over diagonals will be
  // lower.
  JumpingCreep.prototype.dKdT = -4 /* peak height */ * 8 /
    (3 * 3 / CREEP_BASE_SPEED / CREEP_BASE_SPEED);

  // When NOT_JUMPING, JumpingCreeps act just like BasicCreeps.
  var JumpStates = {
    NOT_JUMPING : 'NOT_JUMPING',
    TURNING : 'TURNING',
    JUMPING : 'JUMPING'
  };

  JumpingCreep.prototype.init = function(i, j, health) {
    Creep.prototype.init.call(this, i, j, health);

    this.jumpState = JumpStates.NOT_JUMPING;
    this.phi = 0;
    this.ADV_MAX = this.ADV_MAX / 2;
  };

  JumpingCreep.prototype.needTrajectoryRecalc = function() {
    // While jumping, ignore recalc events, since we're not going to turn around
    // in mid-air and our destination node can't be built on or isolated
    // [because we claim to be occupying it].  Otherwise fall back to the main
    // function.
    if (this.jumpState != JumpStates.NOT_JUMPING) {
      // We should recalc if we're only turning.  The dest node isn't guaranteed
      // to stay clear until we're actually jumping, and anyway, the jump might
      // have gotten less worthwhile.
      if (this.jumpState == JumpStates.TURNING) {
        if (World.isABlockedState(this.jumpNode.state)) {
          this.cancelJump();
          return true;
        } else if (this.jumpGain > this.node.sptCost - this.jumpNode.sptCost) {
          // The gain from this jump has lessened.  Call it off, although we
          // could decide again to jump anyway.
          this.cancelJump();
          return true;
        }
      }
      return false;
    }
    return Creep.prototype.needTrajectoryRecalc.call(this);
  };

  // These are the legal jumps we can attempt, in (column, row) offsets.
  var jumpOffsets = [
    // Just enough to jump between towers diagonally.
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    // Just enough to jump over a tower.
    [0, 3],
    [0, -3],
    [3, 0],
    [-3, 0]
  ];

  /**
   * Determines the best jump we could legally make from this location, if any.
   * If it finds none, it returns the node passed in.  Note that we'll never
   * currently jump directly to the EXIT node, because I haven't thought that
   * path through yet and it might require a bit of special cleanup.
   *
   * @param {[integer, integer]} coords the current [column, row] of the creep
   * @param {GridNode} node the default node to return
   */
  JumpingCreep.prototype.bestJumpNode = function(coords, node) {
    var i = coords[0] + this.node.i;
    var j = coords[1] + this.node.j;
    if (world.isLegalCreepLocation(i, j)) {
      var n = world.getNode(i, j);
      if (!World.isABlockedState(n.state) && n.state != States.EXIT &&
          n.sptCost < node.sptCost) {
        node = n;
      }
    }
    return node;
  };

  /**
   * Call this if the SPT state changes while we're preparing to jump.  Since we
   * do a short pause [and turn, as needed] while preparing to jump, there's
   * actually a good amount of time in which the player can mess up our plans.
   */
  JumpingCreep.prototype.cancelJump = function() {
    // This should be all we have to do.  Angles and such should get taken care
    // of by the existing code.  Since this is only called from
    // needTrajectoryRecalc, and only when it's going to return true, that'll
    // trigger both trajectory and orientation fixups.
    this.jumpState = JumpStates.NOT_JUMPING;
    this.computeTrajectory(false);
  };

  JumpingCreep.prototype.adjustDrawingAngle = function() {
    var math = o3djs.math;
    for (var idx in this.drawings) {
      var d = this.drawings[idx];
      d.rotZ.localMatrix = math.matrix4.rotationZ(this.theta);
      d.rotY.localMatrix = math.matrix4.rotationY(this.phi);
    }

    var m = math.mul(math.matrix4.rotationZ(this.theta),
                     math.matrix4.rotationY(this.phi));
    var t = math.mul([this.length / 2, 0, this.height / 2, 1], m);

    // Where should folks who want to shoot us aim?
    this.targetDI = t[0];
    this.targetDJ = t[1];
    this.targetDK = t[2];
    t = math.mul([this.length,
                  0,
                  this.height / 2 - O3D_TD_CREEP_DEPTH / 15,
                  1], m);
    this.destDI = t[0];
    this.destDJ = t[1];
    this.destDK = t[2];
    // Skip z.
    this.needAngleUpdate = false;
  };

  JumpingCreep.prototype.incrementPhi = function(elapsedTime) {
    if (this.tumbleTime > 0) {
      this.tumbleTime -= elapsedTime;
      if (this.tumbleTime > 0) {
        this.phi += this.dPhi * elapsedTime;
        if (this.phi >= O3D_TD_TWO_PI) {
          this.phi -= Math.PI;
        }
      } else {
        this.tumbleTime = 0;
        this.phi = 0;
      }
    }
  };

  /**
   * Once we've determined that it's worth jumping to a particular node, we call
   * this function to do all the preparation.
   *
   * @param {GridNode} destNode the node where we'll land
   */
  JumpingCreep.prototype.setupJump = function(destNode) {
    this.fromNode = this.node;
    this.jumpNode = destNode;
    this.jumpState = JumpStates.TURNING;
    this.jumpGain = this.node.sptCost - this.jumpNode.sptCost;
    var destI = destNode.i + this.jitterI;
    var destJ = destNode.j + this.jitterJ;
    var dI = destI - this.i;
    var dJ = destJ - this.j;
    // Clean up float errors so that we can recognize zeroes and keep arctan
    // fairly accurate.
    if (Math.abs(dI) < 0.001) {
      dI = 0;
    }
    if (Math.abs(dJ) < 0.001) {
      dJ = 0;
    }
    var distance = Math.sqrt(dI * dI + dJ * dJ);
    this.timeLeft = distance / CREEP_BASE_SPEED;
    this.tumbleTime = this.timeLeft;
    if (distance > 2) {
      this.dPhi = 4 * Math.PI / this.tumbleTime;
    } else {
      this.dPhi = 2 * Math.PI / this.tumbleTime;
    }
    this.dI = dI / this.timeLeft;
    this.dJ = dJ / this.timeLeft;
    this.doOrientationRecalc(true, 1);
    this.adjustDrawingAngle(); // Handles rotation about Z only, currently.
  };

  JumpingCreep.prototype.animateOneStep = function(elapsedTime) {
    switch (this.jumpState) {
      case JumpStates.NOT_JUMPING:
        Creep.prototype.animateOneStep.call(this, elapsedTime);
        return;
      case JumpStates.TURNING:
        if (!this.needTrajectoryRecalc()) {
          if (this.rotateTime && elapsedTime > this.rotateTime) {
            elapsedTime = this.rotateTime;
          }
          this.incrementTheta(elapsedTime);
          this.adjustDrawingAngle();
          if (this.rotateTime <= 0) {
            assert(!World.isABlockedState(this.jumpNode.state));
            GridNode.MoveCreepBetweenGridNodes(this.node, this.jumpNode, this);
            this.node = this.jumpNode;
      for(ii = 0; ii < g_animTimeParam.length; ii++)
      {
        if(g_animTimeParam[ii].name == "anim_dinosaur_jump")
        {
          g_animTimeParam[ii].value = 0;
        }
      }
      for (var idx in this.drawings)
      {
        //the shape used when jumping
        var d = this.drawings[idx];
        d.setDrawingShape(this.getName()+"_JUMP");
      }
      this.delay = 31 / 30;
      this.jumpTimer = 0;
            this.jumpState = JumpStates.JUMPING;
            this.dK = -this.dKdT * this.timeLeft / 2;
            soundControl.play(this.jumpSound);
          }
        }
        break;
      case JumpStates.JUMPING:
    if(this.jumpTimer >= this.delay)
    {
      assert(this.timeLeft > 0);
      if (this.rotateTime && elapsedTime > this.rotateTime) {
        elapsedTime = this.rotateTime;
      }
      if (this.tumbleTime && elapsedTime > this.tumbleTime) {
        elapsedTime = this.tumbleTime;
      }
      this.i += this.dI * elapsedTime;
      this.j += this.dJ * elapsedTime;
      this.k += this.dK * elapsedTime;
      this.dK += this.dKdT * elapsedTime;
      this.incrementPhi(elapsedTime);
      this.updateDrawing();
      this.timeLeft -= elapsedTime;
      if (this.timeLeft <= 0) {
        this.k = JumpingCreep.prototype.k;
        assert(this.node.state != States.EXIT);
        for (var idx in this.drawings)
        {
        var d = this.drawings[idx];
        //the shape used when landing
        d.setDrawingShape(this.getName()+"_WALK");
        }
        this.jumpState = JumpStates.NOT_JUMPING;
        this.computeTrajectory(true);
      }
    }
    else
    {
      this.jumpTimer += elapsedTime;
    }
    break;
      default:
        assert(false);
    }
  };

  JumpingCreep.prototype.computeTrajectory = function(quick) {
    var node = this.node;

    for (var idx in jumpOffsets) {
      node = this.bestJumpNode(jumpOffsets[idx], node);
    }
    var adv = this.node.sptCost - node.sptCost - this.ADV_MIN;
    if (adv > 0) {
      this.setupJump(node);
    } else {
      Creep.prototype.computeTrajectory.call(this, quick);
    }
  };

}) ();

function addFlame(i,j,k) {
  var transform = g_pack.createObject('Transform');
  transform.parent = g_client.root;
  g_thingsToNotPick[transform.clientId] = true;

  var reducedI = i-(O3D_TD_I_MAX/2)
  var newI = reducedI/(O3D_TD_I_MAX/2)
  var reducedJ = j-(O3D_TD_J_MAX/2)
  var newJ = reducedJ/(O3D_TD_J_MAX/2)

  transform.translate(newI, newJ, k);

  var emitter = g_particleSystem.createParticleEmitter(g_textures[47]);
  emitter.setState(o3djs.particles.ParticleStateIds.BLEND);
  emitter.setColorRamp(
      [0.9,  0.5,  0,  1.0,
     0.8,  0.4,  0,  0.6,
     0.7,  0.3,  0,  0.0]);

  emitter.setParameters({
    numParticles: 200,      //density of smoke
    lifeTime: 1/2,        //how long to wait before deleting
    timeRange: 1/4,       //how long to wait before recreating
    startSize: 0.1,       //how big to start the particle
    endSize: 0.2,       //how big to end the particle
    velocity: [-0.5, 0, 0], velocityRange: [0.25, 0.25, 0.25], //movement speed, ending position accuracy
    worldAcceleration: [-0.5, 0, 0], //constant drag on the particle
    spinSpeedRange: 0});  //how fast to spin the particle
  transform.addShape(emitter.shape);
  emitter.transform = transform;
  return emitter;
}
