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
 * @fileoverview This file contains the Missile class and its subclasses.
 * It's been written for Firefox 2, but should be easy to port to other
 * browsers.
 */

/**
 * This class represents a visible weapon or projectile that moves or stretches
 * from a Tower to a Creep [or where a Creep used to be, if the Creep goes
 * away].  This constructor should not be called directly; use
 * Missile.newInstance instead.
 *
 * @constructor
 */
function Missile() {
}

(function() {

  // Arc missiles are the only ones that seek targets.  They're therefore the
  // most expensive to process.  Basic missiles just try to move fast enough
  // that it doesn't matter, and Zap missiles don't move, but don't stick around
  // long.
  Missile.Type = {
    BASIC: 'BASIC_MISSILE',
    ARC: 'ARC_MISSILE',
    ZAP: 'ZAP_MISSILE'
  };

  /**
   * Use this to create new missiles, rather than using the raw constructors.
   *
   * @param {integer} i the column where the missile will start
   * @param {integer} j the row where the missile will start
   * @param {integer} k the elevation where the missile will start
   * @param {number} damage the amount of damage this missile does
   * @param {number} size how big the missile should appear, in some units
   * meaningful to the missile's drawing code
   * @param {Creep} targetCreep the creep being targeted
   * @param {String} type a field of Missile.Type
   */
  Missile.newInstance = function(i, j, k, damage, size, targetCreep, type, level) {
    var m;
    switch (type) {
    case Missile.Type.BASIC:
      m = new BasicMissile();
      break;
    case Missile.Type.ARC:
      m = new ArcMissile();
      break;
    case Missile.Type.ZAP:
      m = new ZapMissile();
      break;
    default:
      assert(false);
    }
    m.init(i, j, k, targetCreep, damage, size, level);

    return m;
  };

  /**
   * Initializes a newly-created Missile, and is called from newInstance
   * immediately after construction.  Any overriding classes should call this
   * before doing their own initialization.
   *
   * @param {integer} i the column where the missile will start
   * @param {integer} j the row where the missile will start
   * @param {integer} k the elevation where the missile will start
   * @param {Creep} targetCreep the creep being targeted
   * @param {number} damage the amount of damage this missile does
   * @param {number} size how big the missile should appear, in some units
   * meaningful to the missile's drawing code
   */
  Missile.prototype.init = function(i, j, k, targetCreep, damage, size) {
    this.guid = guidForType('MISSILE');
    this.targetCreep = targetCreep;
    this.drawings = [];
    this.i = i;
    this.j = j;
    this.k = k;
    this.damage = damage;
    assert(this.damage > 0);
    this.size = size;
    soundControl.play(this.fireSound);
    return this;
  };

  /**
   * The missile is responsible for calling its destructor when it goes away for
   * any reason.  Any subclass that overrides this function or any method that
   * calls it should make sure to call it as appropriate.
   */
  Missile.prototype.destructor = function() {
    world.removeTransient(this);
  };

  Missile.prototype.deliverDamage = function() {
    soundControl.play(this.explosionSound);
    if (!this.targetCreep.done)
  {
    if(!this.targetCreep.dead)
    {
    this.targetCreep.receiveDamage(this.damage);
    }
    }
  };

  /**
   * Updates the drawing, given the current state of the missile.  It changes
   * no missile state.
   */
  Missile.prototype.updateDrawing = function() {
    var translation = world.gridToDrawingCoords(this.i, this.j, this.k);
    for (var idx in this.drawings) {
      var d = this.drawings[idx];
      d.translate.localMatrix = d.client.math.matrix4.translation(translation);
    }
  if(this.particle)
  {
    this.particle.transform.localMatrix = d.client.math.matrix4.translation(translation);
  }
  };

  /**
   * This is the main animation/processing function, called once per frame.
   */
  Missile.prototype.animateOneStep = nop;

  // Grid nodes per second
  var BASE_MISSILE_SPEED = 14;
  var ARC_MISSILE_SPEED = 20
  /**
   * BasicMissiles are small unguided spheres.
   *
   * @extends Missile
   * @constructor
   */
  function BasicMissile() {
  }

  BasicMissile.prototype = new Missile();
  BasicMissile.prototype.constructor = BasicMissile;
  BasicMissile.prototype.type = Missile.Type.BASIC;
  BasicMissile.prototype.explosionKey = Missile.Type.BASIC + '_EXP';
  BasicMissile.prototype.color = Drawing.Colors.BASIC_MISSILE;
  BasicMissile.prototype.fireSound = soundControl.id.BASIC_MISSILE_FIRE;
  BasicMissile.prototype.explosionSound =
      soundControl.id.BASIC_MISSILE_EXPLOSION;

  BasicMissile.prototype.init = function(i, j, k, targetCreep, damage, size) {
    // Call the parent class's init, but with us as this.
    Missile.prototype.init.call(this, i, j, k, targetCreep, damage, size);

    // Technically this shoots until the rear end of the missile hits the
    // target, but it's quick enough to work for now.
    var dI = targetCreep.i + targetCreep.targetDI - this.i;
    var dJ = targetCreep.j + targetCreep.targetDJ - this.j;
    var k = targetCreep.k;
    if (!targetCreep.flying) {
      k += targetCreep.height;
    }
    var dK = k - this.k;
    var dIJ = Math.sqrt(dI * dI + dJ * dJ); // Cheat on Z
    this.duration = dIJ / BASE_MISSILE_SPEED;
    if(!(this.duration > 0))
  {
    this.duration = 1;
  }
    this.dI = dI / this.duration;
    this.dJ = dJ / this.duration;
    this.dK = dK / this.duration;

    for (var idx in clients) {
      var c = clients[idx];

      var d = DrawnObj.newPoolShape(
          c,
          this.type,
          world,
          Shapes.BALL_AMMO,
          this.i,
          this.j,
          this.k,
          O3D_TD_MISSILE_DIAM * this.size,
          O3D_TD_MISSILE_DIAM * this.size,
          O3D_TD_MISSILE_DIAM * this.size,
          Drawing.Colors.EXIT);
    g_thingsToNotPick[d.clientId] = true;
      this.drawings[idx] = d;

    this.particle = null;
    }
  };

  BasicMissile.prototype.destructor = function() {
    if(this.particle)
  {
    this.particle.transform.visible = false;
    this.particle.transform.parent = null;
  }
    for (var idx in this.drawings) {
      this.drawings[idx].makeItGoAway();
    }

    // Call the parent class's destructor last, with us as the this pointer.
    Missile.prototype.destructor.call(this);
  };

  BasicMissile.prototype.animateOneStep = function(elapsedTime) {
    assert(this.duration > 0);
    if (this.duration < elapsedTime) {
      elapsedTime = this.duration;
    }
    this.i += this.dI * elapsedTime;
    this.j += this.dJ * elapsedTime;
    this.k += this.dK * elapsedTime;
    this.duration -= elapsedTime;
    if (this.duration > 0) {
      this.updateDrawing();
    } else {
      this.deliverDamage();
      this.destructor();
    }
  };

  /**
   * ArcMissiles are pyramidal, seek their targets as they run away, and do
   * splash damage to anyone in the grid node in which they detonate.
   *
   * @extends Missile
   * @constructor
   */
  function ArcMissile() {
  }

  ArcMissile.prototype = new Missile();
  ArcMissile.prototype.constructor = ArcMissile();
  ArcMissile.prototype.type = Missile.Type.ARC;
  ArcMissile.prototype.explosionKey = Missile.Type.ARC + '_EXP';
  ArcMissile.prototype.color = Drawing.Colors.ARC_MISSILE;
  ArcMissile.prototype.fireSound = soundControl.id.ARC_MISSILE_FIRE;
  ArcMissile.prototype.explosionSound = soundControl.id.ARC_MISSILE_EXPLOSION;

  ArcMissile.prototype.init = function(i, j, k, targetCreep, damage, size) {
    // Call the parent class's init, but with us as this.
    Missile.prototype.init.call(this, i, j, k, targetCreep, damage, size);

    var dI = targetCreep.i + targetCreep.targetDI - this.i;
    var dJ = targetCreep.j + targetCreep.targetDJ - this.j;
    var targetK;
    if (targetCreep.flying) {
      targetK = targetCreep.k;
    } else {
      targetK = targetCreep.k + targetCreep.height;
    }
    var dK = targetK - this.k;
    // Subtract our length, so that we stop when the tip of the missile hits the
    // target, despite our motion being computed as of the butt of the missile.
    var dIJK = Math.sqrt(dI * dI + dJ * dJ + dK * dK) -
        O3D_TD_MISSILE_DIAM * this.size;

    this.duration = (dIJK * 3 / ARC_MISSILE_SPEED);
    if (this.duration <= 0) {
      this.duration = 1; // Blow up almost instantly.
    }

    for (var idx in clients) {
      var c = clients[idx];

      var d = DrawnObj.newPoolShape(
          c,
          this.type,
          world,
          Shapes.LAUNCHER_AMMO,
          this.i,
          this.j,
          this.k,
          O3D_TD_MISSILE_DIAM * this.size,
          O3D_TD_MISSILE_DIAM * this.size,
          O3D_TD_MISSILE_DEPTH * this.size,
          Drawing.Colors.EXIT);
      this.drawings[idx] = d;
    g_thingsToNotPick[d.clientId] = true;

    this.particle = addSmoke(this.i, this.j, this.k)

    this.particleI = 1;
    this.particleJ = 1;
    this.particleK = 10;

    var offSetI = this.i - this.targetCreep.i;
    var offSetJ = this.j - this.targetCreep.j;
    var offSetK = this.k - this.targetCreep.k;

    offSetI /= dIJK;
    offSetJ /= dIJK;
    offSetK /= dIJK;

    offSetI /= 12;
    offSetJ /= 12;
    offSetK /= 10;

    this.particle.setParameters({
    numParticles: 200,
    lifeTime: 3,
    timeRange: 3/2,
    startSize: 0.1,
    endSize: 0.75,
    velocity: [offSetI, offSetJ, offSetK], velocityRange: [0.025, 0.025, 0.025],
    worldAcceleration: [0, 0, 0],
    spinSpeedRange: 0});
    }
    this.computeMotion(targetCreep);
  };

  ArcMissile.prototype.computeMotion = function(targetCreep) {
    assert(this.duration > 0);

    var dI = targetCreep.i + targetCreep.targetDI - this.i;
    var dJ = targetCreep.j + targetCreep.targetDJ - this.j;
    var targetK;
    if (targetCreep.flying) {
      targetK = targetCreep.k;
    } else {
      targetK = targetCreep.k + targetCreep.height + 2 * this.duration;
    }
    var dK = targetK - this.k;
    var dI2 = dI * dI;
    var dJ2 = dJ * dJ;
    var dIJ = Math.sqrt(dI2 + dJ2);
    var dIJK = Math.sqrt(dI2 + dJ2 + dK * dK);
    // Shorten all components so that we're dealing with the tip of the missile,
    // not the butt.
    var missileLengthDelta =
        (dIJK - O3D_TD_MISSILE_DIAM * this.size) / dIJK;

    this.dI = dI * missileLengthDelta / (this.duration/2);
    this.dJ = dJ * missileLengthDelta / (this.duration/2);
    this.dK = dK * missileLengthDelta / (this.duration/2);

    var phi, theta;

    if (!dK) {
      phi = Math.PI;
    } else {
      phi = Math.atan2(dIJ, dK);
    }
    if (!dI) {
      if (dJ < 0) {
        theta = Math.PI;
      } else {
        theta = 0;
      }
    } else {
      theta = Math.atan2(dJ, dI);
    }

    // Shouldn't this really be in updateDrawingArcMissile?  Of course, then
    // we'd have to store phi and theta.  It's not clear the separation really
    // means all that much anyway.
  for (var idx in this.drawings)
  {
    var d = this.drawings[idx];
    if(this.particle)
    {
      var offSetI = this.i - this.targetCreep.i;
      var offSetJ = this.j - this.targetCreep.j;
      var offSetK = this.k - this.targetCreep.k;

      offSetI /= dIJK;
      offSetJ /= dIJK;
      offSetK /= dIJK;

      offSetI /= 12;
      offSetJ /= 12;
      offSetK /= 10;

      this.particle.setParameters({
        numParticles: 20,
        lifeTime: 1,
        timeRange: 0.5,
        startSize: 0.1,
        endSize: 0.2,
        velocity: [offSetI, offSetJ, offSetK],
        velocityRange: [0.04, 0.04, 0.04],
        worldAcceleration: [0, 0, 0],
        spinSpeedRange: 0});
    }
    d.rotY.localMatrix = d.client.math.matrix4.rotationY(phi);
    d.rotZ.localMatrix = d.client.math.matrix4.rotationZ(theta);
  }
  };

  ArcMissile.prototype.destructor = function() {
  if(this.particle)
  {
    this.particle.transform.visible = false;
    this.particle.transform.parent = null;
  }
  if(this.explosion && !this.explosion.counter)
  {
    this.explosion.counter = 1;
  }
    for (var idx in this.drawings) {
      this.drawings[idx].makeItGoAway();
    }

    // Call the parent class's destructor last, with us as the this pointer.
  if(destroyParticles(this))
  {
    Missile.prototype.destructor.call(this);
  }
  };

  ArcMissile.prototype.animateOneStep = function(elapsedTime) {
    assert(this.duration > 0 || this.explosion.counter);
    if (this.duration < elapsedTime) {
      elapsedTime = this.duration;
    }
    this.i += (this.dI * elapsedTime) * 2;
    this.j += (this.dJ * elapsedTime) * 2;
    this.k += (this.dK * elapsedTime) * 2;
    this.duration -= elapsedTime;
    if (this.duration > 0) {
      this.computeMotion(this.targetCreep);
      this.updateDrawing();
    } else {
    if(!this.explosion)
    {
    this.deliverDamage();
    this.explosion = addExplosion(this.i, this.j, this.k, this.type);
    for (var idx in this.drawings)
    {
      var d = this.drawings[idx];
      var translation = world.gridToDrawingCoords(this.i, this.j, this.k);
      this.explosion.transform.localMatrix = d.client.math.matrix4.translation(translation);
    }
    }

      this.destructor();
    }
  };

  // TODO: Make splash damage work by distance, not just 'is it in the same grid
  // node?'.  Larger explosions should splash further.  Splash damage should
  // ideally be proportional to initial damage and inverse-square-proportional
  // to distance from the impact.
  ArcMissile.prototype.deliverDamage = function() {
    Missile.prototype.deliverDamage.call(this); // Base damage
    var flying = this.targetCreep.flying;
    var node = world.getNode(Math.round(this.targetCreep.i), Math.round(this.targetCreep.j));
    for (var guid in node.creepGuids) {
      if (guid !== this.targetCreep.guid) {
        var creep = world.getTransientByGuid(guid);
        if (!creep.done && creep.flying == flying) {
          creep.receiveDamage(Math.floor(this.damage / 4)); // Splash damage
        }
      }
    }
  };

  /**
   * ZapMissiles are lasers that strike targets precisely, then vanish without
   * any motion.
   *
   * @extends Missile
   * @constructor
   */

  function ZapMissile() {
  }

  ZapMissile.prototype = new Missile();
  ZapMissile.prototype.constructor = ZapMissile;
  ZapMissile.prototype.type = Missile.Type.ZAP;
  ZapMissile.prototype.explosionKey = Missile.Type.ZAP + '_EXP';
  ZapMissile.prototype.color = Drawing.Colors.ZAP_MISSILE;
  ZapMissile.prototype.fireSound = soundControl.id.ZAP_MISSILE_FIRE;
  ZapMissile.prototype.explosionSound = soundControl.id.ZAP_MISSILE_EXPLOSION;

  ZapMissile.prototype.init = function(i, j, k, targetCreep, damage, size, level) {
    // Call the parent class's init, but with us as this.
    Missile.prototype.init.call(this, i, j, k, targetCreep, damage, size);

  this.towerLevel = level

    this.duration = 0.025;

    var dI = targetCreep.i + targetCreep.targetDI - this.i;
    var dJ = targetCreep.j + targetCreep.targetDJ - this.j;
    var k = targetCreep.k;
    if (!targetCreep.flying) {
      k += targetCreep.height;
    }
    var dK = k - this.k;
    var dI2 = dI * dI;
    var dJ2 = dJ * dJ;
    var dK2 = dK * dK;
    var dIJK = Math.sqrt(dI2 + dJ2 + dK2);

    var phi, theta;

    var dIJ = Math.sqrt(dI2 + dJ2);
    if (!dK) {
      phi = Math.PI;
    } else {
      phi = Math.atan2(dIJ, dK);
    }

    if (!dI) {
      if (dJ < 0) {
        theta = Math.PI;
      } else {
        theta = 0;
      }
    } else {
      theta = Math.atan2(dJ, dI);
    }

    for (var idx in clients) {
      var c = clients[idx];

    this.particle = addSlime(this.i, this.j, this.k)

    this.particleI = 1;
    this.particleJ = 1;
    this.particleK = 5;

    var offSetI = this.targetCreep.i - this.i;
    var offSetJ = this.targetCreep.j - this.j;
    var offSetK = this.targetCreep.k - this.k;

    offSetI /= dIJK;
    offSetJ /= dIJK;
    offSetK /= dIJK;

    offSetI /= 10;
    offSetJ /= 10;
    offSetK /= this.particleK;

    this.particle.setParameters({
    numParticles: 40,
    lifeTime: dIJK,
    timeRange: dIJK/2,
    startSize: 0.05,
    endSize: 0.075,
    velocity: [offSetI, offSetJ, offSetK], velocityRange: [0.01, 0.01, 0],
    worldAcceleration: [0, 0, 0],
    spinSpeedRange: 0});
    }

  };

  ZapMissile.prototype.deliverDamage = function() {
    soundControl.play(this.explosionSound);
    if (!this.targetCreep.done)
  {
    if(!this.targetCreep.dead)
    {
    this.targetCreep.receiveDamage(this.damage, true, this.towerLevel+1);
    }
    }
  };

  ZapMissile.prototype.destructor = function() {
  if(this.particle)
  {
    this.particle.transform.visible = false;
    this.particle.transform.parent = null;
  }
  if(this.explosion && !this.explosion.counter)
  {
    this.explosion.counter = 1;
  }
  for (var idx in this.drawings) {
      this.drawings[idx].transform.visible = false;
    }

    // Call the parent class's destructor last, with us as the this pointer.
  if(destroyParticles(this))
  {
    Missile.prototype.destructor.call(this);
  }
  };

  ZapMissile.prototype.animateOneStep = function(elapsedTime) {
    assert(this.duration > 0 || this.explosion.counter);
    this.duration -= elapsedTime;
    if (this.duration <= 0) {
    if(!this.explosion)
    {
    this.deliverDamage();

    var targetCreep = this.targetCreep;
    var i = targetCreep.i + targetCreep.targetDI;
    var j = targetCreep.j + targetCreep.targetDJ;
      var k = targetCreep.k;
    if (!targetCreep.flying) {
      k += targetCreep.height;
    }

    this.explosion = addExplosion(i, j, k, this.type);
    }
      this.destructor();
    }
  };

}) ();

function updateParticle(i,j,k, emitter)
{
  if(emitter)
  {
  var reducedI = i-(O3D_TD_I_MAX/2);
  var newI = reducedI/(O3D_TD_I_MAX/2);
  var reducedJ = j-(O3D_TD_J_MAX/2);
  var newJ = reducedJ/(O3D_TD_J_MAX/2);

  emitter.transform.identity();
  emitter.transform.translate(newI, newJ, k);
  }
}
function addSlime(i,j,k) {
  var transform = g_pack.createObject('Transform');
  transform.parent = g_client.root;
  g_thingsToNotPick[transform.clientId] = true;

  var reducedI = i-(O3D_TD_I_MAX/2)
  var newI = reducedI/(O3D_TD_I_MAX/2)
  var reducedJ = j-(O3D_TD_J_MAX/2)
  var newJ = reducedJ/(O3D_TD_J_MAX/2)

  k /= 5;

  transform.translate(newI, newJ, k);

  var emitter = g_particleSystem.createParticleEmitter(g_textures[47]);
  emitter.setState(o3djs.particles.ParticleStateIds.BLEND);
  emitter.setColorRamp(
      [0, 1, 0, 0.8,
     0, 1, 0, 0.6,
     0, 1, 0, 0.4,
     0, 1, 0, 0.2,
     0, 1, 0, 0.0]);

  emitter.setParameters({
    numParticles: 25,     //density of smoke
    lifeTime: 3,        //how long to wait before deleting
    timeRange: 3/2,       //how long to wait before recreating
    startSize: 0.05,      //how big to start the particle
    endSize: 0.075,       //how big to end the particle
    velocity: [0, 0, 0], velocityRange: [0.01, 0.01, 0], //movement speed, ending position accuracy
    worldAcceleration: [0, -0.1, 0], //constant drag on the particle
    spinSpeedRange: 0});  //how fast to spin the particle
  transform.addShape(emitter.shape);
  emitter.transform = transform;
  return emitter;
}

function addSmoke(i,j,k) {
  var transform = g_pack.createObject('Transform');
  transform.parent = g_client.root;
  g_thingsToNotPick[transform.clientId] = true;

  var reducedI = i-(O3D_TD_I_MAX/2)
  var newI = reducedI/(O3D_TD_I_MAX/2)
  var reducedJ = j-(O3D_TD_J_MAX/2)
  var newJ = reducedJ/(O3D_TD_J_MAX/2)

  k /= 5;

  transform.translate(newI, newJ, k);

  var emitter = g_particleSystem.createParticleEmitter(g_textures[47]);
  emitter.setState(o3djs.particles.ParticleStateIds.BLEND);
  emitter.setColorRamp(
      [1, 1, 1, 0.8,
     1, 1, 1, 0.6,
     1, 1, 1, 0.4,
     1, 1, 1, 0.2,
     1, 1, 1, 0.0]);

  emitter.setParameters({
    numParticles: 200,      //density of smoke
    lifeTime: 1/2,        //how long to wait before deleting
    timeRange: 1/4,       //how long to wait before recreating
    startSize: 0.05,      //how big to start the particle
    endSize: 0.075,       //how big to end the particle
    velocity: [0, 0, 0], velocityRange: [0.01, 0.01, 0], //movement speed, ending position accuracy
    worldAcceleration: [0, 0, -0.1], //constant drag on the particle
    spinSpeedRange: 0});  //how fast to spin the particle
  transform.addShape(emitter.shape);
  emitter.transform = transform;
  return emitter;
}

function addExplosion(i,j,k, type)
{
  var transform = g_pack.createObject('Transform');
  transform.parent = g_client.root;
  g_thingsToNotPick[transform.clientId] = true;

  var reducedI = i-(O3D_TD_I_MAX/2)
  var newI = reducedI/(O3D_TD_I_MAX/2)
  var reducedJ = j-(O3D_TD_J_MAX/2)
  var newJ = reducedJ/(O3D_TD_J_MAX/2)

  k /= 5;

  transform.translate(newI, newJ, k);

  var emitter = g_particleSystem.createParticleEmitter(g_textures[47]);
  emitter.setState(o3djs.particles.ParticleStateIds.BLEND);
  if(type == Missile.Type.ARC)
  {
   emitter.setColorRamp(
      [1, 0, 0, 1.0,
     1, 1, 1, 0.0]);
  emitter.setParameters({
    numParticles: 50,     //density of smoke
    lifeTime: 5,        //how long to wait before deleting
    timeRange: 0.1,       //how long to wait before recreating
    startSize: 0.1,     //how big to start the particle
    endSize: 0.4,       //how big to end the particle
    velocity: [0.1, 0.1, 0.1],
    velocityRange: [0.5, 0.5, 0.5], //movement speed, ending position accuracy
    worldAcceleration: [-0.5, -0.5, -0.5], //constant drag on the particle
    spinSpeedRange: 0.5});  //how fast to spin the particle
  }
  else
  {
   emitter.setColorRamp(
      [0, 1, 0, 1.0,
     0, 1, 0, 0.0]);
  emitter.setParameters({
    numParticles: 200,      //density of smoke
    lifeTime: 5,        //how long to wait before deleting
    timeRange: 0.1,       //how long to wait before recreating
    startSize: 0.1,     //how big to start the particle
    endSize: 0.3,       //how big to end the particle
    velocity: [0.1, 0.1, 0.1],
    velocityRange: [0.5, 0.5, 0.5], //movement speed, ending position accuracy
    worldAcceleration: [-1, -1, -1], //constant drag on the particle
    spinSpeedRange: 0.5});  //how fast to spin the particle
  }
  transform.addShape(emitter.shape);
  emitter.transform = transform;
  return emitter;
}

function destroyParticles(missile)
{
  if(missile.explosion)
  {
    if(missile.explosion.counter > 5)
    {
      missile.explosion.transform.visible = false;
      missile.explosion.transform.parent =  null;
      return true;
    }
    else
    {
      missile.explosion.counter++;
      return false;
    }
  }
}