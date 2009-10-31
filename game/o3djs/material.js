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
 * @fileoverview This file contains various functions for helping setup
 * materials for o3d.  It puts them in the "material" module on the
 * o3djs object.
 *
 *     Note: This library is only a sample. It is not meant to be some official
 *     library. It is provided only as example code.
 *
 */

o3djs.provide('o3djs.material');

o3djs.require('o3djs.math');
o3djs.require('o3djs.effect');

/**
 * A Module for materials.
 * @namespace
 */
o3djs.material = o3djs.material || {};

{
  /**
   * Checks a material's params by name to see if it possibly has non 1.0 alpha.
   * Given a name, checks for a ParamTexture called 'nameTexture' and if that
   * fails, checks for a ParamFloat4 'name'.
   * @private
   * @param {!o3d.Material} material Materal to check.
   * @param {string} name name of color params to check.
   * @return {found: boolean, nonOneAlpha: boolean} found is true if one of
   *     the params was found, nonOneAlpha is true if that param had non 1.0
   *     alpha.
   */
  var hasNonOneAlpha = function(material, name) {
    var found = false;
    var nonOneAlpha = false;
    var texture = null;
    var samplerParam = material.getParam(name + 'Sampler');
    if (samplerParam && samplerParam.isAClassName('o3d.ParamSampler')) {
      found = true;
      var sampler = samplerParam.value;
      if (sampler) {
        texture = sampler.texture;
      }
    } else {
      var textureParam = material.getParam(name + 'Texture');
      if (textureParam && textureParam.isAClassName('o3d.ParamTexture')) {
        found = true;
        texture = textureParam.value;
      }
    }

    if (texture && !texture.alphaIsOne) {
      nonOneAlpha = true;
    }

    if (!found) {
      var colorParam = material.getParam(name);
      if (colorParam && colorParam.isAClassName('o3d.ParamFloat4')) {
        found = true;
        if (colorParam.value[3] < 1) {
          // TODO(gman): this check does not work. We need to check for the
          // <transparency> and <transparent> elements or something.
          // nonOneAlpha = true;
        }
      }
    }
    return {found: found, nonOneAlpha: nonOneAlpha};
  };

  /**
   * Prepares a material by setting their drawList and possibly creating
   * an standard effect if one does not already exist.
   *
   * This function is very specific to our sample importer. It expects that if
   * no Effect exists on a material that certain extra Params have been created
   * on the Material to give us instructions on what to Effects to create.
   *
   * @param {!o3d.Pack} pack Pack to manage created objects.
   * @param {!o3djs.rendergraph.ViewInfo} viewInfo as returned from
   *     o3djs.rendergraph.createView.
   * @param {!o3d.Material} material to prepare.
   * @param {string} opt_effectType type of effect to create ('phong',
   *     'lambert', 'constant').
   *
   * @see o3djs.material.attachStandardEffect
   */
  o3djs.material.prepareMaterial = function(pack,
                                            viewInfo,
                                            material,
                                            opt_effectType) {
    // Assume we want the performance list
    var drawList = viewInfo.performanceDrawList;
    // First check if we have a tag telling us that it is or is not
    // transparent
    if (!material.drawList) {
      var param = material.getParam('collada.transparent');
      if (param && param.className == 'o3d.ParamBoolean') {
        material.drawList = param.value ? viewInfo.zOrderedDrawList :
                                          viewInfo.performanceDrawList;
      }
    }
    // If the material has no effect, try to build shaders for it.
    if (!material.effect) {
      // If the user didn't pass an effect type in see if one was stored there
      // by our importer.
      if (!opt_effectType) {
        // Retrieve the lightingType parameter from the material, if any.
        var lightingType = o3djs.effect.getColladaLightingType(material);
        if (lightingType) {
          opt_effectType = lightingType;
        }
      }
      if (opt_effectType) {
        o3djs.material.attachStandardEffect(pack,
                                            material,
                                            viewInfo,
                                            opt_effectType);
        // For collada common profile stuff guess what drawList to use. Note: We
        // can only do this for collada common profile stuff because we supply
        // the shaders and therefore now the inputs and how they are used.
        // For other shaders you've got to do this stuff yourself. On top of
        // that this is a total guess. Just because a texture has no alpha
        // it does not follow that you don't want it in the zOrderedDrawList.
        // That is application specific. Here we are just making a guess and
        // hoping that it covers most cases.
        if (material.drawList == null) {
          // Check the common profile params.
          var result = hasNonOneAlpha(material, 'diffuse');
          if (!result.found) {
            result = hasNonOneAlpha(material, 'emissive');
          }
          if (result.nonOneAlpha) {
            drawList = viewInfo.zOrderedDrawList;
          }
        }
      }
    }
    if (!material.drawList) {
      material.drawList = drawList;
    }
  };

  /**
   * Prepares all the materials in the given pack by setting their drawList and
   * if they don't have an Effect, creating one for them.
   *
   * This function is very specific to our sample importer. It expects that if
   * no Effect exists on a material that certain extra Params have been created
   * on the Material to give us instructions on what to Effects to create.
   *
   * @param {!o3d.Pack} pack Pack to prepare.
   * @param {!o3djs.rendergraph.ViewInfo} viewInfo as returned from
   *     o3djs.rendergraph.createView.
   * @param {!o3d.Pack} opt_effectPack Pack to create effects in. If this
   *     is not specifed the pack to prepare above will be used.
   *
   * @see o3djs.material.prepareMaterial
   */
  o3djs.material.prepareMaterials = function(pack,
                                             viewInfo,
                                             opt_effectPack) {
    var materials = pack.getObjectsByClassName('o3d.Material');
    for (var mm = 0; mm < materials.length; mm++) {
      o3djs.material.prepareMaterial(opt_effectPack || pack,
                                     viewInfo,
                                     materials[mm]);
    }
  };

  /**
   * Builds a standard effect for a given material.  The position of the
   * default light is set to the view position.  If the material already has
   * an effect, none is created.
   * @param {!o3d.Pack} pack Pack to manage created objects.
   * @param {!o3d.Material} material The material for which to create an
   *     effect.
   * @param {!o3djs.rendergraph.ViewInfo} viewInfo as returned from
   *     o3djs.rendergraph.createView.
   * @param {string} effectType Type of effect to create ('phong', 'lambert',
   *     'constant').
   *
   * @see o3djs.effect.attachStandardShader
   */
  o3djs.material.attachStandardEffect = function(pack,
                                                 material,
                                                 viewInfo,
                                                 effectType) {
    if (!material.effect) {
      var lightPos =
          o3djs.math.matrix4.getTranslation(
              o3djs.math.inverse(viewInfo.drawContext.view));
      if (!o3djs.effect.attachStandardShader(pack,
                                             material,
                                             lightPos,
                                             effectType)) {
        throw g_client.lastError;
      }
    }
  };


  /**
   * Prepares all the materials in the given pack by setting their
   * drawList.
   * @param {!o3d.Pack} pack Pack to manage created objects.
   * @param {!o3d.DrawList} drawList DrawList to assign to materials.
   */
  o3djs.material.setDrawListOnMaterials = function(pack, drawList) {
    var materials = pack.getObjectsByClassName('o3d.Material');
    for (var mm = 0; mm < materials.length; mm++) {
      var material = materials[mm];
      // TODO(gman): look at flags on the material left by the importer
      //   to decide which draw list to use.
      material.drawList = drawList;
    }
  };

  /**
   * This function creates a basic material for when you just want to get
   * something on the screen quickly without having to manually setup shaders.
   * You can call this function something like.
   *
   * <pre>
   * &lt;html&gt;&lt;body&gt;
   * &lt;script type="text/javascript" src="o3djs/all.js"&gt;
   * &lt;/script&gt;
   * &lt;script&gt;
   * window.onload = init;
   *
   * function init() {
   *   o3djs.base.makeClients(initStep2);
   * }
   *
   * function initStep2(clientElements) {
   *   var clientElement = clientElements[0];
   *   var client = clientElement.client;
   *   var pack = client.createPack();
   *   var viewInfo = o3djs.rendergraph.createBasicView(
   *       pack,
   *       client.root,
   *       client.renderGraphRoot);
   *   var material = o3djs.material.createBasicMaterial(
   *       pack,
   *       viewInfo,
   *       [1, 0, 0, 1]);  // red
   *   var shape = o3djs.primitives.createCube(pack, material, 10);
   *   var transform = pack.createObject('Transform');
   *   transform.parent = client.root;
   *   transform.addShape(shape);
   *   o3djs.camera.fitContextToScene(client.root,
   *                                  client.width,
   *                                  client.height,
   *                                  viewInfo.drawContext);
   * }
   * &lt;/script&gt;
   * &lt;div id="o3d" style="width: 600px; height: 600px"&gt;&lt;/div&gt;
   * &lt;/body&gt;&lt;/html&gt;
   * </pre>
   *
   * @param {!o3d.Pack} pack Pack to manage created objects.
   * @param {o3djs.rendergraph.ViewInfo} viewInfo as returned from
   *     o3djs.rendergraph.createBasicView.
   * @param {(!o3djs.math.Vector4|!o3d.Texture)} either a color in
   *     the format [r, g, b, a] or a o3d texture.
   * @param {bool} opt_transparent Whether or not the material is transparent.
   *     Defaults to false.
   * @return {!o3d.Material} The created material.
   */
  o3djs.material.createBasicMaterial = function(pack,
                                                viewInfo,
                                                colorOrTexture,
                                                opt_transparent) {
    var material = pack.createObject('Material');
    material.drawList = opt_transparent ? viewInfo.zOrderedDrawList :
                                          viewInfo.performanceDrawList;

    // If it has a length assume it's a color, otherwise assume it's a texture.
    if (colorOrTexture.length) {
      material.createParam('diffuse', 'ParamFloat4').value = colorOrTexture;
    } else {
      var paramSampler = material.createParam('diffuseSampler', 'ParamSampler');
      var sampler = pack.createObject('Sampler');
      paramSampler.value = sampler;
      sampler.texture = colorOrTexture;
    }

    // Create some suitable defaults for the material to save the user having
    // to know all this stuff right off the bat.
    material.createParam('emissive', 'ParamFloat4').value = [0, 0, 0, 1];
    material.createParam('ambient', 'ParamFloat4').value = [0, 0, 0, 1];
    material.createParam('specular', 'ParamFloat4').value = [1, 1, 1, 1];
    material.createParam('shininess', 'ParamFloat').value = 50;
    material.createParam('lightColor', 'ParamFloat4').value = [1, 1, 1, 1];
    var lightPositionParam = material.createParam('lightWorldPos',
                                                  'ParamFloat3');

    o3djs.material.attachStandardEffect(pack, material, viewInfo, 'phong');

    // We have to set the light position after calling attachStandardEffect
    // because attachStandardEffect sets it based on the view.
    lightPositionParam.value = [1000, 2000, 3000];

    return material;
  };
}

