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
 * @fileoverview This is the file that contains top-level calls for game and
 * graphics initialization, the keyboard and timer event handlers, and otherwise
 * acts as the main, highest-level controller of the game.  It contains the Game
 * object, which handles some events and encapsulates some of the status UI.
 * It was written for Firefox 2, and may require a bit of work to run on other
 * browsers.
 */
o3djs.require('o3djs.util');
o3djs.require('o3djs.event');
o3djs.require('o3djs.math');
o3djs.require('o3djs.rendergraph');

// TODO: Game needs to absorb a lot of the remaining global UI stuff, and pull
// the non-board-related state out of World.

//
// Define some global variables that can be accessed by all functions.
// TODO: world is accessed both globally and via a passed-in reference.  The
// latter is necessary due to access during initialization of the global
// variable.  The former may not be necessary, although it does cut out a fair
// amount of parameter-passing.  Look into removing it.

function preGameIdle(render_event)
{
  animateObjects(render_event.elapsedTime);
}

function animateObjects(elapsedTime)
{
  if(g_mouseDelay > 3 && g_mouse == "DBLCLICK")
  {
    g_mouse = "UP";
  }
  else
  {
    g_mouseDelay += elapsedTime;
  }
  resetIcons();

  if(g_splashScreenA)
  {
    if(g_screenDelay > 3)
    {
      removeScreen(g_splashScreenA);
      g_screenDelay = 0;
    }
    else
    {
      g_screenDelay += elapsedTime;
    }
  }
  clients[0].setSlightView();
  redrawText();

  if(!paused)
  {
    for(ii = 0; ii < g_animTimeParam.length; ii++)
    {
      if(g_animateObject[ii])
      {
        g_animTimeParam[ii].value += elapsedTime * g_animSpeed[ii];
        g_animTimeParam[ii].value %= g_animLength[ii];
      }
    }
    g_clock += elapsedTime;
  }

  // Rotate/Scale the selected icon.
  var icon = g_icons[g_selectedIndex];
  icon.transform.identity();
  icon.transform.translate(g_client.width - (g_selectedIndex * 130) - 65, 65, -1);

  var scale = Math.sin(g_clock * 8) * 0.1 + 0.9;
  icon.transform.scale(scale, scale, 0);
  if(prevSelection)
  {
    if(prevSelection.i && prevSelection.j)
    {
      var reducedI = prevSelection.i-(O3D_TD_I_MAX/2)
      var newI = reducedI/(O3D_TD_I_MAX/2)
      var reducedJ = prevSelection.j-(O3D_TD_J_MAX/2)
      var newJ = reducedJ/(O3D_TD_J_MAX/2)

      newI /= 2;
      newJ /= 2;

      clients[0].horzMove = clients[0].horzMove + (newI - clients[0].horzMove) / 16;
      clients[0].horzPan = clients[0].horzPan + (newI - clients[0].horzPan) / 16;

      clients[0].vertPan = clients[0].vertPan + (newJ - clients[0].vertPan) / 16;

      clients[0].setSlightView();
    }
  }
  else
  {
      clients[0].horzMove = clients[0].horzMove + (0 - clients[0].horzMove) / 16;
      clients[0].horzPan = clients[0].horzPan + (0 - clients[0].horzPan) / 16;

      clients[0].vertPan = clients[0].vertPan + (0 - clients[0].vertPan) / 16;

      clients[0].setSlightView();
  }
}

function redrawText() {
    g_canvas.canvas.clear([1, 1, 1, 0]);
    g_canvas.canvas.drawText("$"+world.money.toString(), 60, 52.5, g_paint);

    g_canvas.updateTexture();
}
function resetIcons() {

  for (var ii = 0; ii < g_icons.length; ++ii) {
    g_icons[ii].transform.identity();
  g_icons[ii].transform.translate(g_client.width - (ii * 130) - 65, 65, -1);
  }
  for (var jj = 0; jj < 3; jj++) {
  g_iconBacks[jj].transform.identity();
  g_iconBacks[jj].transform.translate(g_client.width - (jj *  130) - 65, 65, -1);
  }
  for(kk = 0; kk < 3; kk++)
  {
    g_iconBacks[kk+8].transform.identity();
  g_iconBacks[kk+8].transform.translate(g_client.width - (kk * 130) - 30, 110, -1);
  }
  //health Bar/money GUI
  g_iconBacks[3].transform.identity();
  g_iconBacks[3].transform.translate(235, 45, -1);

  //Start button GUI
  g_iconBacks[4].transform.identity();
  g_iconBacks[4].transform.translate(g_client.width-180, g_client.height-50, -1);

  //Pause button GUI
  g_iconBacks[5].transform.identity();
  g_iconBacks[5].transform.translate(110, g_client.height-50, -1);

  //Help button GUI
  g_iconBacks[6].transform.identity();
  g_iconBacks[6].transform.translate(g_client.width/2, g_client.height-50, -1);
}

function Image(texture, opt_topLeft) {
  // create a transform for positioning
  this.transform = g_pack.createObject('Transform');
  this.transform.parent = g_hudRoot;

  // create a transform for scaling to the size of the image just so
  // we don't have to manage that manually in the transform above.
  this.scaleTransform = g_pack.createObject('Transform');
  this.scaleTransform.parent = this.transform;

  // setup the sampler for the texture
  this.sampler = g_pack.createObject('Sampler');
  this.sampler.addressModeU = clients[0].o3d.Sampler.CLAMP;
  this.sampler.addressModeV = clients[0].o3d.Sampler.CLAMP;
  this.paramSampler = this.scaleTransform.createParam('texSampler0',
                                                      'ParamSampler');
  this.paramSampler.value = this.sampler;

  // Setup our UV offsets and color multiplier
  this.paramColorMult = this.scaleTransform.createParam('colorMult',
                                                        'ParamFloat4');

  this.setColor(1, 1, 1, 1);

  this.sampler.texture = texture;
  this.scaleTransform.addShape(g_planeShape);
  if (opt_topLeft) {
    this.scaleTransform.translate(texture.width / 2, texture.height / 2, 0);
  }
  this.scaleTransform.scale(texture.width, -texture.height, 1);
}

Image.prototype.setColor = function(r, g, b, a) {
  this.paramColorMult.set(r, g, b, a);
};


var running;

/**
 * Resets the set of waves such that they start up again from the beginning and
 * continue play, even if the game had already been lost.  Resets hit points
 * back to full as well.
 */
function onSendAnExtraWave() {
  world.sendAnExtraWave();
}

/**
 * Brings on the next wave of creeps, if any.
 */
function onNextWave() {
  world.nextWave();
}

/**
 * Stops and resets the game back to the start.
 */
function onResetGame() {
  onStop();
  world.resetGame();
}

/**
 * Executes a single frame's worth of the game animation and actions.
 */
function onStep(elapsedTime) {
  try {
  clients[0].setSlightView();
  animateObjects(elapsedTime);
    world.stepGame(elapsedTime);
  } catch (ex) {
    onStop();
    throw ex;
  }
}

/**
 * Debugging function to animate a single frame, with the animation called from
 * the render callback.
 */
function fakeAStep() {
  clients[0].setSlightView();
  aborted = false;
  onStop();
  // The param renderEvent has an elapsedTime field that tells how many seconds
  // it's been since the last render.
  clients[0].client.setRenderCallback(
      function(renderEvent) {
        if (!aborted) {
          try {
            onStep(0.02);  // 20ms
          } catch (ex) {
            o3d.towerdefense.popup(stringifyObj(ex));
          }
          onStop();
        }
      });
  running = true;
}

var counter;
var lastTime;
/**
 * checkTime is used to compute and display how many frames per second we're
 * managing to display on average.  It should be called once per frame, and will
 * update the display periodically [currently every 3 seconds].
 */
function checkTime() {
  if (lastTime == null) {
    lastTime = new Date().getTime();
    counter = 0;
  } else if (++counter >= 300) { // Every 300 redraws, do the display.
    var now = new Date().getTime();
    lastTime = now;
    counter = 0;
  }
}

// This is a debugging hack.  Asserts set this to true, which causes the render
// callback not to call us.  That way I can put a Firebug breakpoint in the
// assert code for debugging without locking up Firefox with a shower of
// reentrant asserts.
var aborted = false;

/**
 * Call this to start the game animating.
 */
function onAnimate() {
  aborted = false;
  onStop();
  // The param renderEvent has an elapsedTime field that tells how many seconds
  // it's been since the last render.
  clients[0].client.setRenderCallback(
      function(renderEvent) {
        if (!aborted) {
          try {
            onStep(renderEvent.elapsedTime);
            checkTime();
          } catch (ex) {
            o3d.towerdefense.popup(stringifyObj(ex));
          }
        }
      });
  running = true;
}

/**
 * Call this to stop game animation.
 */
function onStop() {
  clients[0].setSlightView();
  if (running) {
    clients[0].client.clearRenderCallback();
  clients[0].client.setRenderCallback(preGameIdle);
    running = false;
  }
}

/**
 * Game handles some events and encapsulates some of the status UI.
 * TODO: Pull in all the rest of the UI.
 *
 * @constructor
 */
function Game() {
  this.selectTowerType(0);
  return this;
}

var game;

(function() {
  Game.prototype.selectTowerType = function(index) {
    switch (index) {
    case 0:
      this.towerType = Tower.Type.CANNON;
      break;
    case 1:
      this.towerType = Tower.Type.FAST;
      break;
    case 2:
      this.towerType = Tower.Type.HEAVY;
      break;
    default:
      assert(false);
    }
  };

  /**
   * Displays one of several status panes.
   * TODO: Since the elements aren't yet all the same size, swapping the active
   * one causes some reflow twitch.
   *
   * @param {String} paneId the id of the div to display
   */
  Game.prototype.setActivePane = function(paneId) {
    this.activePaneId = paneId;
    var container = document.getElementById('switch_pane');
    var divs = container.getElementsByTagName('div');
    for (var div = 0; div < divs.length; ++div) {
      if (divs[div].id == paneId) {
        divs[div].style.display = 'block';
      } else {
        divs[div].style.display = 'none';
      }
    }
  };

  Game.prototype.towerPanes = new Object();

  var NA = 'N/A';
  var BLANK = '';
  /**
   * Generates a div to display info about an existing tower.
   *
   * @param {Tower} tower the tower about which to display info
   */
  Game.prototype.generatePlacedTowerPane = function(tower) {
    var container = document.getElementById('switch_pane');
    assert(container);
    var div0 = document.getElementById('tower_base');
    assert(div0 && div0.parentNode == container);
    var myDiv = div0.cloneNode(true);
    myDiv.id = 'tower_pane_' + getPlacedTowerPaneId(tower);
    var tds = myDiv.getElementsByTagName('td');
    for (var idx = 0; idx < tds.length; ++idx) {
      var td = tds[idx];
      var info = tower.levels[tower.level];
      var upgradeLevel = BLANK;
      var upgradeRange = BLANK;
      var upgradeSpeed = BLANK;
      var upgradeDamage = BLANK;
      var upgradeCost = NA;
      var upgradeUpgradeCost = BLANK;
      var upgradeResaleCost = BLANK;
      if (tower.levels.length > tower.level + 1) {
        var up = tower.levels[tower.level + 1];
        upgradeLevel = tower.level + 1;
        upgradeRange = up.range;
        upgradeSpeed = up.repeatDelay.toPrecision(2);
        upgradeDamage = up.damage;
        upgradeResaleCost = Math.floor((tower.cost + up.costIncrement) / 2);
        upgradeCost = up.costIncrement;
        if (tower.levels.length > tower.level + 2) {
          upgradeUpgradeCost = tower.levels[tower.level + 2].costIncrement;
        } else {
          upgradeUpgradeCost = NA;
        }
      }
      switch (td.getAttribute('name')) {
        case 'type':
          td.innerHTML = tower.typeDisplayName;
          break;
        case 'level':
          td.innerHTML = tower.level;
          break;
        case 'range':
          td.innerHTML = info.range;
          break;
        case 'rate':
          td.innerHTML = info.repeatDelay.toPrecision(2);
          break;
        case 'damage':
          td.innerHTML = info.damage;
          break;
        case 'value':
          td.innerHTML = Math.floor(tower.cost / 2);
          break;
        case 'cost':
          td.innerHTML = upgradeCost;
          break;
        case 'upgrade_level':
          td.innerHTML = upgradeLevel;
          break;
        case 'upgrade_range':
          td.innerHTML = upgradeRange;
          break;
        case 'upgrade_rate':
          td.innerHTML = upgradeSpeed;
          break;
        case 'upgrade_damage':
          td.innerHTML = upgradeDamage;
          break;
        case 'upgrade_cost':
          td.innerHTML = upgradeUpgradeCost;
          break;
        case 'upgrade_value':
          td.innerHTML = upgradeResaleCost;
          break;
        default:
          break;
      }
    }

    container.appendChild(myDiv);
    this.towerPanes[getPlacedTowerPaneId(tower)] = myDiv;
    return myDiv;
  };

  /**
   * Generates a div to display info about a tower which could be built.
   *
   * @param {String} towerType a field of Tower.Type
   */
  Game.prototype.generateInitTowerPane = function(towerType) {
    var container = document.getElementById('switch_pane');
    assert(container);
    var div0 = document.getElementById('tower_init_base');
    assert(div0 && div0.parentNode == container);
    var myDiv = div0.cloneNode(true);
    myDiv.id = 'tower_init_pane_' + towerType;
    var tds = myDiv.getElementsByTagName('td');
    for (var idx = 0; idx < tds.length; ++idx) {
      var td = tds[idx];
      var info = Tower.getLevelInfo(towerType, 0);
      var up = Tower.getLevelInfo(towerType, 1);
      switch (td.getAttribute('name')) {
        case 'type':
          td.innerHTML = Tower.getDisplayName(towerType);
          break;
        case 'range':
          td.innerHTML = info.range;
          break;
        case 'rate':
          td.innerHTML = info.repeatDelay.toPrecision(2);
          break;
        case 'damage':
          td.innerHTML = info.damage;
          break;
        case 'cost':
          td.innerHTML = info.costIncrement;
          break;
        case 'upgrade_cost':
          td.innerHTML = up.costIncrement;
          break;
        default:
          break;
      }
    }

    container.appendChild(myDiv);
    this.towerPanes[getInitTowerPaneId(towerType)] = myDiv;
    return myDiv;
  };

  // TODO: Remove this string addition if it turns out to be needed.
  function getPlacedTowerPaneId(tower) {
    return tower.type + tower.level;
  }

  function getInitTowerPaneId(towerType) {
    return towerType;
  }

  Game.prototype.selectInitTowerPane = function(towerType) {
    var pane = this.towerPanes[getInitTowerPaneId(towerType)];
    if (pane) {
      if (this.activePaneId != pane.id) {
      }
    }
  };

  Game.prototype.selectPlacedTowerPane = function(tower) {
    var pane = this.towerPanes[getPlacedTowerPaneId(tower)];
    if (pane) {
      if (this.activePaneId != pane.id) {
      }
    } else {
    }
  };

  // TODO: Update displays based on whether or not we have enough money to
  // build/upgrade the current selection.  Make sure to make live updates as we
  // earn money.
  Game.prototype.updateDisplayForCurTower = function(tower) {
    if (tower) {
    } else {
    }
  };

  Game.prototype.showHighScores = function() {
  };

  Game.prototype.togglePause = function() {
    if (!paused)
  {
    newY = g_client.height - (g_client.height/4);
    //Restart button GUI
    g_iconBacks[7] = new Image(g_textures[50], false);
    g_iconBacks[7].transform.translate(g_client.width/2, newY, -1);
    g_resetSwitch = true;

    greyIcons(true);

    paused = !paused;
    g_splashScreenB = addScreen(g_textures[21]);
      onStop();
    } else {

    greyIcons(false);

    paused = !paused;
    removeScreen(g_splashScreenB);
    g_resetSwitch = false;
    g_iconBacks[7].visible = false;
    g_iconBacks[7].transform.parent = null;
      onAnimate();
    }
  };

}) ();

var globalGuidCount = 0;

function guidForType(type) {
  return type.toUpperCase() + '_GUID_' + globalGuidCount++;
}

function getIntegerField(name) {
  return parseInt(getStringField(name));
}

function getStringField(name) {
  var elt = document.getElementById(name).firstChild;
  var value;
  if (elt.textValue) {
    value = elt.textValue;
  } else {
    value = elt.data;
  }
  return value;
}

function greyIcons(grey)
{
  if(grey)
  {
    if(g_iconBacks[0] && g_iconBacks[1] && g_iconBacks[2])
    {
      for(ii = 0; ii < 3; ii++)
      {
        g_iconBacks[ii].sampler.texture = g_textures[56];
      }
    }
    if(g_iconBacks[4])
    {
      g_iconBacks[4].sampler.texture = g_textures[53];
    }
    if(g_iconBacks[6])
    {
      g_iconBacks[6].sampler.texture = g_textures[55];
    }
    if(g_iconBacks[8] && g_iconBacks[9] && g_iconBacks[10])
    {
      for(ii = 0; ii < 3; ii++)
      {
        g_iconBacks[ii+8].sampler.texture = g_textures[ii+18];
      }
    }
  }
  else
  {
    if(g_iconBacks[0] && g_iconBacks[1] && g_iconBacks[2])
    {
      for(ii = 0; ii < 3; ii++)
      {
        g_iconBacks[ii].sampler.texture = g_textures[4];
      }
    }
    if(g_iconBacks[4])
    {
      g_iconBacks[4].sampler.texture = g_textures[6];
    }
    if(g_iconBacks[6])
    {
      g_iconBacks[6].sampler.texture = g_textures[48];
    }
    var val = world.money;
    //missile tower
    if(val >= 20){ g_iconBacks[8].sampler.texture = g_textures[8]; }
    //oozie tower
    if(val >= 10){ g_iconBacks[9].sampler.texture = g_textures[9]; }
    //ball tower
    if(val >= 5){ g_iconBacks[10].sampler.texture = g_textures[10]; }
  }
}