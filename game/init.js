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
var g_viewInfo;
var g_root;
var g_shadowDrawList;
var g_viewMatrix;
var g_transforms = [];

/**
 * This is the big initialization function that starts everything up.  It should
 * be called from the html file once all the javascript files have been loaded.
 */
function init() {
  o3djs.util.makeClients(initStep2);
}

/**
 * This function is called as a callback by o3djs.util.makeClients()
 * @param {Array} clientElements Array of o3d object elements.
 */
function initStep2(clientElements) {
  try {
  // Initialize client sample libraries.
  var o3d = clientElements[0];

  setupClient(o3d);

  setupCamera();

  DrawnObj.initShapePool();

  setupHUD();

  setupShadowsStep1();

  clients[0].viewInfo.drawContext.projection = o3djs.math.matrix4.perspective(
      o3djs.math.degToRad(30), // 30 degree fov.
      g_client.width / g_client.height,
      0.1,                // Near plane.
      5000);              // Far plane.


  var loader = o3djs.loader.createLoader(initStep3);
  for (var ii = 0; ii < g_textureUrls.length; ++ii) {
  texturePath = makePath(g_textureUrls[ii]);
    loadTexture(loader, texturePath, ii);
  }
  loader.finish();

  } catch (ex) {
    alert(stringifyObj(ex));
    throw ex;
  }
}

function initStep3()
{
  setupShadowsStep2();
  clients[0].client.setRenderCallback(splashScreen);
  g_particleSystem = o3djs.particles.createParticleSystem(g_pack, clients[0].viewInfo);
  loadFiles();
}

function setupCamera()
{
  clients[0].zoom = 0;
  clients[0].horzPan = 0;
  clients[0].vertPan = 0;
  clients[0].fov = 0;
  clients[0].depthMove = 0;
  clients[0].horzMove = 0;
  clients[0].vertMove = 0;
  g_pack = clients[0].pack;
  g_client = clients[0].client;
}

function setupGame()
{
  g_TowerInfo = o3djs.picking.createTransformInfo(g_client.root, null);
  game = new Game();

  world = new World(-1, 1, -1, 1, O3D_TD_I_MAX,
    O3D_TD_J_MAX);
  world.init();
}
function setupControls(state)
{
  if(state == "SPLASH")
  {
    o3djs.event.removeEventListener(clients[0].o3dObj, 'dblclick', onDoubleClick);
    o3djs.event.removeEventListener(clients[0].o3dObj, 'click', onClick);
    o3djs.event.removeEventListener(clients[0].o3dObj, 'mouseup', onMouseUp);
    o3djs.event.removeEventListener(clients[0].o3dObj, 'mousedown', onMouseDown);
    o3djs.event.removeEventListener(clients[0].o3dObj, 'mousemove', onMouseMove);
    o3djs.event.removeEventListener(clients[0].o3dObj, 'wheel', onWheel);
    if (document.addEventListener) {
      document.removeEventListener('keydown', onKeyDown, true);
    } else if (document.attachEvent) {
      document.detachEvent('onkeydown', onKeyDown);
    }

    o3djs.event.addEventListener(clients[0].o3dObj, 'mouseup', onSplashMouseUp);
  }
  if(state == "GAME")
  {
    o3djs.event.removeEventListener(clients[0].o3dObj, 'mouseup', onSplashMouseUp);

    o3djs.event.addEventListener(clients[0].o3dObj, 'dblclick', onDoubleClick);
    o3djs.event.addEventListener(clients[0].o3dObj, 'click', onClick);

    o3djs.event.addEventListener(clients[0].o3dObj, 'mouseup', onMouseUp);
    o3djs.event.addEventListener(clients[0].o3dObj, 'mousedown', onMouseDown);
    o3djs.event.addEventListener(clients[0].o3dObj, 'mousemove', onMouseMove);
    o3djs.event.addEventListener(clients[0].o3dObj, 'wheel', onWheel);
    if (document.addEventListener) {
      document.addEventListener('keydown', onKeyDown, true);
    } else if (document.attachEvent) {
      document.attachEvent('onkeydown', onKeyDown);
    }
  }
}

/**
 * Used to create a Client wrapper from a dom o3d plugin object
 *
 * @param {Object} o3d the dom object owned by the o3d plugin.
 * @return {Client} client object.
 */
function setupClient(o3d) {
  var c = new Client(o3d);
  // Used for client->index mapping in drawnobj.js.
  assert(c.index == clients.length);
  clients.push(c);
  return c;
}

function setupHUD() {
  g_hudRoot = g_pack.createObject('Transform');

  g_hudViewInfo = o3djs.rendergraph.createBasicView(
        g_pack,
        g_hudRoot,
        g_client.renderGraphRoot);

  g_hudViewInfo.root.priority = clients[0].viewInfo.root.priority + 1;

  g_hudViewInfo.clearBuffer.clearColorFlag = false;

  g_hudViewInfo.zOrderedState.getStateParam('CullMode').value =
      clients[0].o3d.State.CULL_NONE;
  g_hudViewInfo.zOrderedState.getStateParam('ZWriteEnable').value = false;

  g_hudViewInfo.drawContext.view = o3djs.math.matrix4.lookAt(
      [0, 0, 1],   // eye
      [0, 0, 0],   // target
      [0, 1, 0]);  // up

  for (var ii = 0; ii < g_materialUrls.length; ++ii) {
    var effect = g_pack.createObject('Effect');
    o3djs.effect.loadEffect(effect, g_materialUrls[ii]);

    var material = g_pack.createObject('Material');

    material.effect = effect;

    effect.createUniformParameters(material);

    material.getParam('colorMult').value = [1, 1, 1, 1];

    g_materials[ii] = material;
  }

  // Set the materials' drawLists
  g_materials[0].drawList = g_hudViewInfo.zOrderedDrawList;

  g_planeShape = o3djs.primitives.createPlane(
    g_pack,
    g_materials[0],
    1,
    1,
    1,
    1,
    [[1, 0, 0, 0],
     [0, 0, 1, 0],
     [0,-1, 0, 0],
     [0, 0, 0, 1]]);
}

function setupShadowsStep1()
{

  // Make another DrawList and DrawPass just for the shadows so they get
  // drawn last.  Also, make a StateSet and corresponding State so we can tell
  // the shadows to be translucent and to not effect the zBuffer.
  g_shadowDrawList = g_pack.createObject('DrawList');
  var shadowStateSet = g_pack.createObject('StateSet');
  var shadowState = g_pack.createObject('State');
  var shadowDrawPass = g_pack.createObject('DrawPass');
  shadowStateSet.state = shadowState;
  shadowStateSet.priority = clients[0].viewInfo.priority;
  shadowStateSet.parent = clients[0].viewInfo.viewport;
  // The following settings turn on blending for all objects using the
  // shadow DrawList
  shadowState.getStateParam('ZWriteEnable').value = false;
  shadowState.getStateParam('AlphaBlendEnable').value = true;
  shadowState.getStateParam('SourceBlendFunction').value =
      o3djs.base.o3d.State.BLENDFUNC_SOURCE_ALPHA;
  shadowState.getStateParam('DestinationBlendFunction').value =
      o3djs.base.o3d.State.BLENDFUNC_INVERSE_SOURCE_ALPHA;
  shadowState.getStateParam('AlphaTestEnable').value = true;
  shadowState.getStateParam('AlphaComparisonFunction').value =
      o3djs.base.o3d.State.CMP_GREATER;
  // This setting pulls the shadow in front of the ground plane even though
  // they are at the same position in space.
  shadowState.getStateParam('PolygonOffset1').value = -1;

  shadowDrawPass.drawList = g_shadowDrawList;
  shadowDrawPass.parent = shadowStateSet;
  clients[0].viewInfo.treeTraversal.registerDrawList(
      g_shadowDrawList, clients[0].viewInfo.drawContext, true);
}

function setupShadowsStep2()
{
  var shadowMaterial = o3djs.material.createBasicMaterial(
      g_pack,
      clients[0].viewInfo,
      g_textures[52],
      true);
  shadowMaterial.getParam('specular').value = [0, 0, 0, 1];
  shadowMaterial.drawList = g_shadowDrawList;

  // Create a plane for the shadow.
  SHADOW_IMAGE = o3djs.primitives.createPlane(
  g_pack,
  shadowMaterial,
  1,
  1,
  1,
  1,
  [[1, 0, 0, 0],
   [0, 0, 1, 0],
   [0,-1, 0, 0],
   [0, 0, 0, 1]]);

   clients[0].viewInfo.drawContext.projection = o3djs.math.matrix4.perspective(
    o3djs.math.degToRad(45),       // field of view.
    g_client.width / g_client.height,  // aspect ratio
    0.1,                       // Near plane.
    5000);                     // Far plane.
}