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
 * @fileoverview  This file contains the Explosion class.  It's been written for
 * Firefox 2, but should be easy to port to other browsers.
 */

/**
 * This class represents an explosion; it's generally used whenever a missile
 * hits anything.  This constructor should not be called directly; use
 * Explosion.newInstance instead.
 *
 * For now, all explosions are the same; they're just expanding spheres of a
 * single color and supplied maximum size.  TODO: Missiles are still doing their
 * own explosion sounds; those should get moved in here for cleanliness,
 * although it really makes no difference functionally at this time.
 *
 * @constructor
 */
function Explosion() {
}

(function() {

  /**
   * Use this to create new explosions, rather than using the raw constructor.
   *
   * @param {String} key an identifier that adequately identifies your explosion
   * type for use as a drawing object pool key; if it collides with an
   * incompatible shape, that's not adequate.
   * @param {integer} i the column where the explosion takes place
   * @param {integer} j the row where the explosion takes place
   * @param {integer} k the altitude of the center of the explosion above the
   * @param {String} color the name of the color array to use, from
   * @param {[number]} size how big the explosion should be at its peak
   * @param {[integer]} duration how long the explosion should stick around, in
   * frames
   */
  Explosion.newInstance = function(key, i, j, k, color, size, duration) {
    var e = new Explosion();
    e.init(key, i, j, k, color, size, duration);
    return e;
  };

  Explosion.prototype.init =
      function(key, i, j, k, color, size, duration) {
    this.guid = guidForType('EXPLOSION');
    this.i = i;
    this.j = j;
    this.k = k;
    this.duration = duration;
    this.timeLeft = this.duration;
    this.color = color;
    this.size = size;
    this.drawings = [];
    for (var idx in clients) {
      var c = clients[idx];
      var d = DrawnObj.newPoolShape(
          c,
          key,
          world,
          Shapes.SPHERE,
          this.i,
          this.j,
          this.k,
          0, // Start at zero size.
          0, // Start at zero size.
          0, // Start at zero size.
          this.color);
    g_thingsToNotPick[d.clientId] = true;
      // Translate won't be touched, but is the top node in the drawing object,
      // and so is needed for deletion.
      this.drawings[idx] = d;
    }
    return this;
  };

  Explosion.prototype.destructor = function() {
    for (var idx in this.drawings) {
      this.drawings[idx].makeItGoAway();
    }
    world.removeTransient(this);
  };

  Explosion.prototype.updateDrawing = function() {
    var t = this.duration - this.timeLeft;
    var scale = this.size - 1 / (t + 1 / this.duration);
    var inGrid = world.gridToDrawingScale(scale, scale, scale);

    for (var idx in this.drawings) {
      var d = this.drawings[idx];
      var v3 = inGrid.slice(0, 3);
      d.scale.localMatrix = d.client.math.matrix4.scaling(v3);
    }
  };

  /**
   * This is the main animation/processing function, called once per frame.
   */
  Explosion.prototype.animateOneStep = function(elapsedTime) {
    assert(this.timeLeft > 0);
    this.timeLeft -= elapsedTime;
    if (this.timeLeft > 0) {
      this.updateDrawing();
    } else {
      this.destructor();
    }
  };

}) ();
