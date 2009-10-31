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
 * @fileoverview This file contains the class DrawnObj, a wrapper around a
 * visible object.  It's been written for Firefox 2, but should be easy to
 * port to other browsers.
 */

/**
 * A DrawnObj is used to wrap any object that can be displayed in the game
 * world.  This constructor should not be called directly; use DrawnObj.newShape
 * or DrawnObj.newPoolShape instead.
 *
 * @constructor
 */
function DrawnObj() {
  return this;
}

(function() {

  var shapePool;

  /**
   * Called from the main init function, after the clients are created.
   * Initializes all pools of shapes to empty arrays.
   */
  DrawnObj.initShapePool = function() {
    if (!shapePool) {
      shapePool = [];
      for (var idx in clients) {
        shapePool[idx] = new Object();
      }
    }
  };

  /**
   * This is used to pull shapes from one of several pools of reusable objects.
   * If there is no shape available in the pool for this type of shape, a new
   * shape is created; it'll get added to the pool when released, just as one
   * pulled from the pool would be.  This means that pools grow without bound,
   * but are never larger than the greatest number that was needed at one time.
   * Since this is used for moving objects, be sure to set the orientation of
   * any object returned that might have its orientation change.  Note that this
   * function will, as with newShape, make the shape visible before you get a
   * chance to do anything to it.  We're currently single-threaded and share
   * that thread with the 3d rending, so it's atomic right now, but it might not
   * always be.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {String} key an identifier that adequately identifies your shape
   * type for use as a pool key; if it collides with an incompatible shape,
   * that's not adequate.
   * @param {World} world the game board on which we're drawing
   * @param {String} shape which shape to create; used only for new
   * shapes, not reinitialization of reused pool shapes.
   * @param {number} i the i-coordinate of the shape
   * @param {number} j the j-coordinate of the shape
   * @param {number} k the k-coordinate of the shape
   * @param {number} di the width [i extent] of the shape
   * @param {number} dj the height [j extent] of the shape
   * @param {number} dk the depth [k extent] of the shape
   * @param {String} color the name of the color array to use, from
   * Drawing.Colors.  Used only for new shapes, not reinitialization of reused
   * pool shapes.
   */
  DrawnObj.newPoolShape = function(client, key, world, shape, i, j, k, di, dj,
      dk, color) {
    var pool = shapePool[client.index][key];
    var drawnObj;
    if (pool && pool.length) {
      drawnObj = pool.pop();
      Drawing.reinitShapeParams(client, world, drawnObj, i, j, k, di, dj, dk);
    } else {
      drawnObj = DrawnObj.newShape(client, world, shape, i, j, k, di, dj, dk,
          color);
      drawnObj.release = releasePoolObj;
      drawnObj.key = key;
    }
    return drawnObj;
  };

  /**
   * This method does nothing on non-pool objects, but the overriding version
   * releasePoolObj does.
   */
  DrawnObj.prototype.release = nop;

  /**
   * Call this function on a pool DrawnObj to release it when done.  It
   * overrides the non-pool method in the prototype that does nothing.
   */
  function releasePoolObj() {
    var pool = shapePool[this.client.index][this.key];
    if (!pool) {
      pool = [];
      shapePool[this.client.index][this.key] = pool;
    }
    pool.push(this);
  }

  /**
   * This is used to create new shapes and add them to the visible scene.
   * Note that this make the shape visible before you get a chance to do
   * anything to it.  We're currently single-threaded and share that thread with
   * the 3d rending, so it's atomic right now, but it might not always be.
   *
   * Exactly one of color and url should be non-null.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {World} world the game board on which we're drawing
   * @param {String} shapeName which shape to create
   * @param {number} i the i-coordinate of the shape
   * @param {number} j the j-coordinate of the shape
   * @param {number} k the k-coordinate of the shape
   * @param {number} di the width [i extent] of the shape
   * @param {number} dj the height [j extent] of the shape
   * @param {number} dk the depth [k extent] of the shape
   * @param {String} color the name of the color array to use, from
   * Drawing.Colors.  Used only for new shapes, not reinitialization of reused
   * pool shapes.
   * @param {String} url the url of a texture, or null
   */
  DrawnObj.newShape = function(client, world, shapeName, i, j, k, di, dj, dk,
      color, url) {

    var tuple = Drawing.drawShapeInGrid(client, world, shapeName, i, j, k, di,
        dj, dk, color, url);
    var d = new DrawnObj();
    d.init(client, shapeName, tuple);
    return d;
  };

  /**
   * This draws a thin line from c0 to c1 in game-space coordinates.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {World} world the game board on which we're drawing
   * @param {[number, number, number]} c0 [i, j, k] of one end of the line
   * @param {[number, number, number]} c1 [i, j, k] of other end of the line
   * @param {String} color the name of the color array to use, from
   * Drawing.Colors.
   */
  DrawnObj.newLine = function(client, world, c0, c1, color) {

    var tuple = Drawing.drawLineInGrid(client, world, c0, c1, color);
    var d = new DrawnObj();
    d.init(client, Shapes.BOX, tuple);
    return d;
  };

  /**
   * This function is used to initialize each DrawnObj just after contruction.
   * Translate does z-axis rotation and position, and is the top-level transform
   * node for the shape.
   * Scale does scaling and y-axis rotation.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {String} shapeName which shape to create
   * @param {Object} the tuple returned by Drawing.drawShapeInGrid
   */
   DrawnObj.prototype.init = function(client, shapeName, tuple) {
    this.client = client;
    this.translate = tuple.translate;
    this.scale = tuple.scale;
    this.rotY = tuple.rotY;
    this.rotZ = tuple.rotZ;
    this.shape = tuple.shape;
    this.shapeName = shapeName;

    Drawing.setupTransformParams(client, this.scale, this.shape);
  };

  /**
   * This changes the color of the object.
   *
   * @param {String} color the name of the color array to use, from
   * Drawing.Colors.
   */
  DrawnObj.prototype.setDrawingShape = function(shapeName) {
  var removed = this.scale.removeShape(this.shape);
    assert(removed);
    this.shape = Drawing.getShape(this.client, shapeName, "EXIT", null);
    Drawing.setupTransformParams(this.client, this.scale, this.shape);
  };

  DrawnObj.prototype.setDrawingBase = function(shapeName) {
  var removedBase = this.scale.removeShape(this.shape);
  assert(removedBase);
  this.shape = Drawing.getShape(this.client, shapeName+"_BASE", "EXIT", null);
  Drawing.setupTransformParams(this.client, this.scale, this.shape);
  };

  /**
   * This changes the color of the object.
   *
   * @param {String} color the name of the color array to use, from
   * Drawing.Colors.
   */
  DrawnObj.prototype.setDrawingColor = function(color) {
    var removed = this.scale.removeShape(this.shape);
    assert(removed);
    this.shape = Drawing.getShape(this.client, this.shapeName, color, null);
    Drawing.setupTransformParams(this.client, this.scale, this.shape);
  };

  /**
   * This removes the shape from the visible scene and takes care of any needed
   * object-pool maintenance.  It must be called on any DrawnObj that you want
   * to make go away or are otherwise done with.
   */
  DrawnObj.prototype.makeItGoAway = function() {
    this.translate.visible = false;
    this.translate.parent = null;
    this.release();
  };

}) ();
