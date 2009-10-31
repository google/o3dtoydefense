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
 * @fileoverview This file contains the Client class, which is a wrapper around
 * a o3d plugin.  It's been written for Firefox 2, but should be easy to
 * port to other browsers.
 */

/**
 * The Client class wraps a o3d plugin and exposes all interfaces that a
 * caller should need in order to access the plugin.  It also provides
 * convenience methods to set two standard viewpoints and to "grab" the camera
 * for direct control.
 *
 * @constructor
 * @param {Object} o3d the dom object owned by the o3d plugin
 */
function Client(o3d) {
  this.index = Client.getNextIndex();

  this.o3dObj = o3d;
  this.o3d = o3d.o3d;

  this.math = o3djs.math;

  this.client = o3d.client;
  this.pack = this.client.createPack();
  this.root = this.client.root;

  this.client.renderMode = this.o3d.Client.RENDERMODE_CONTINUOUS;

  // Create the render graph for a view.
  this.viewInfo = o3djs.rendergraph.createBasicView(
      this.pack,
      this.root,
      this.client.renderGraphRoot,
    [1,1,1,1]);

  this.context = this.viewInfo.drawContext;
  this.projMatrix = this.math.matrix4.perspective(30 * Math.PI / 180, 1, 1, 50);

  this.defaultEffect = this.pack.createObject('Effect');
  var shaderString = document.getElementById('shader').value ;
  this.defaultEffect.loadFromFXString(shaderString);
  this.defaultMaterial = this.pack.createObject('Material');
  this.defaultMaterial.effect = this.defaultEffect;
  this.defaultMaterial.drawList = this.viewInfo.performanceDrawList;
  this.defaultEffect.createUniformParameters(this.defaultMaterial);

  this.textureEffect = this.pack.createObject('Effect');
  shaderString = document.getElementById('texture_shader').value;
  this.textureEffect.loadFromFXString(shaderString);
  this.textureMaterial = this.pack.createObject('Material');
  this.textureMaterial.effect = this.textureEffect;
  this.textureMaterial.drawList = this.viewInfo.performanceDrawList;
  this.textureEffect.createUniformParameters(this.textureMaterial);

  this.setAngleView();

  return this;
}

(function() {
  var clientCount = 0;
  /**
   * This is used to number all clients uniquely; note that it changes static
   * state here.
   */
  Client.getNextIndex = function() {
    return clientCount++;
  };

  /**
   * Call this after setting the eye, target, and/or up fields to update the
   * view.
   */
  Client.prototype.updateView = function() {
    var viewMatrix = this.math.matrix4.lookAt(this.eye, this.target, this.up);
    this.context.view = viewMatrix;
    this.context.projection = this.projMatrix;
  };

  Client.prototype.setEye = function(x, y, z) {
    this.eye = [x, y, z];
  };

  Client.prototype.setUp = function(x, y, z) {
    this.up = [x, y, z];
  };

  Client.prototype.setTarget = function(x, y, z) {
    this.target = [x, y, z];
  };

  /**
   * Sets the view to a particular angled perspective view of the game board.
   */
  function setAngleView() {
    this.unGrabFunction = setAngleView;
    this.projMatrix =
      this.math.matrix4.perspective(30 * Math.PI / 180, 1, 0.1, 10);
    this.setTarget(0, 0, 0);
    this.setEye(0, 3.5, 3.5);
    this.setUp(0, 3.5, 0);
    this.updateView();
  }
  Client.prototype.setAngleView = setAngleView;

  /**
   * Sets the view to a perfectly-fit orthographic overhead view of the board.
   */
  function setTopView() {
    this.unGrabFunction = setTopView;
    this.projMatrix = this.math.matrix4.orthographic(-1, 1, -1, 1, 1, 10);
    this.setTarget(0, 0, 0);
    this.setEye(0, 0, 4);
    this.setUp(0, 4, 0);
    this.updateView();
  }
  Client.prototype.setTopView = setTopView;

  /**
   * Sets the view to a perfectly-fit orthographic overhead view of the board.
   */
  function setSlightView() {
    this.unGrabFunction = setSlightView;
  this.updateCamera();
  this.updateProj();
    this.updateView();
  }
  Client.prototype.setSlightView = setSlightView;

  function updateCamera() {
  var hMove = this.horzMove/1;
  var vMove = this.vertMove/1;
  var dMove = this.depthMove/1;
  var hPan = this.horzPan/1;
  var vPan = this.vertPan/1;
  var zoom = this.zoom/1;
    this.setTarget(0+hMove, 0+vMove, 0+dMove);
    this.setEye(0+hPan, -2.7+vPan, 3+zoom);
    this.setUp(0, 3.5, 0);
  }
  Client.prototype.updateCamera = updateCamera;

  function updateProj() {
  var dfov = this.fov/1;

    var FOV = this.math.degToRad(27.8+dfov);
  var near = 1;
  var far = 1000;
  var ratio = this.client.width/this.client.height;

  this.projMatrix = this.math.matrix4.perspective(
              FOV,
              ratio,
              near,
              far);

  if(g_hudViewInfo)
  {
    g_hudViewInfo.drawContext.projection = this.math.matrix4.orthographic(
      0 + 0.5,
      this.client.width + 0.5,
      this.client.height + 0.5,
      0 + 0.5,
      0.001,
      1000);
  }
  }
  Client.prototype.updateProj = updateProj;

  /**
   * Use this when you want someone to be able to grab a camera, but not really
   * change the view at all.  This is really only useful for testing.
   */
  Client.prototype.nopAllMethods = function() {
    for (prop in Client.prototype) {
      this[prop] = nop;
    }
  };

}) ();
