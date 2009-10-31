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
function chooseTower()
{
  if(!paused)
  {
  if(prevSelection)
  {
  if(g_rangeIcon)
  { g_rangeIcon.makeItGoAway(); }
  if(g_upgradeIcon)
  { g_upgradeIcon.makeItGoAway(); }
  prevSelection = null;
  }
  tower = g_selectedIndex+1

  for (var idx in world.cursorDrawings) {
    var d = world.cursorDrawings[idx];
    d.setDrawingShape("CURSOR"+tower);
    d.translate.visible = true;
    var base = world.cursorBaseDrawings[idx];
    base.setDrawingShape("CURSOR"+tower+"BASE");
    base.translate.visible = true;
    var shadow = world.shadowTransform;
    shadow.visible = true;
    var dummy = world.dummyDrawings[idx];
    dummy.translate.visible = false;
  }
  g_cursorRange = DrawnObj.newShape(
  clients[0],
  world,
  Shapes.RANGE_SHAPE,
  world.cursorI+0.5,
  world.cursorJ+0.5,
  O3D_TD_GRID_K,
  5.0*0.1,
  5.0*0.1,
  1,
  Drawing.Colors.EXIT);

  game.updateDisplayForCurTower(world.getSelectedTower());
  world.setCursorPos(24,28);
  }
}

function findTower(mX,mY)
{
  var newI = mX;
  var newJ = mY;

  var reducedI = newI*(O3D_TD_I_MAX/2);
  var i = reducedI+(O3D_TD_I_MAX/2)
  var reducedJ = newJ*(O3D_TD_J_MAX/2);
  var j = reducedJ+(O3D_TD_J_MAX/2)
  i = Math.round(i);
  j = Math.round(j);

  if(world.getTowerAtPos(i, j)){return world.getTowerAtPos(i,j);}
  i++;
  if(i>28){i=28;}
  if(world.getTowerAtPos(i, j)){return world.getTowerAtPos(i,j);}
  j--;
  if(j<4){j=4;}
  if(world.getTowerAtPos(i, j)){return world.getTowerAtPos(i,j);}
  i--;
  if(i<4){i=4;}
  if(world.getTowerAtPos(i, j)){return world.getTowerAtPos(i,j);}
  i--;
  if(i<4){i=4;}
  if(world.getTowerAtPos(i, j)){return world.getTowerAtPos(i,j);}
  j++;
  if(j>28){j=28;}
  if(world.getTowerAtPos(i, j)){return world.getTowerAtPos(i,j);}
  j++;
  if(j>28){j=28;}
  if(world.getTowerAtPos(i, j)){return world.getTowerAtPos(i,j);}
  i++;
  if(i>28){i=28;}
  if(world.getTowerAtPos(i, j)){return world.getTowerAtPos(i,j);}
  i++;
  if(i>28){i=28;}
  if(world.getTowerAtPos(i, j)){return world.getTowerAtPos(i,j);}
  return null;
}

function mouseOver(mX, mY)
{
  var percentHUDX = (mX/g_client.width)*100;
  var percentHUDY = (mY/g_client.height)*100;
  if(g_iconBacks[6] && g_iconBacks[5] && g_iconBacks[4])
  {
    if(percentHUDY > 85 &&
      (percentHUDX < 15 || percentHUDX > 77 ||
      (percentHUDX < 56 && percentHUDX > 43)))
    {
      if(percentHUDX < 15)
      {
        if(!pregame)
        {
          g_iconBacks[5].sampler.texture = g_textures[14];
        }
      }
      else if(percentHUDX > 77)
      {
        if(!paused)
        {
          g_iconBacks[4].sampler.texture = g_textures[15];
        }
      }
      else
      {
        if(!paused)
        {
          g_iconBacks[6].sampler.texture = g_textures[49];
        }
      }
    }
    else
    {
      if(!pregame)
      {
        if(g_iconBacks[5].sampler.texture == g_textures[14])
        {
          g_iconBacks[5].sampler.texture = g_textures[5];
        }
      }
      if(g_iconBacks[4].sampler.texture == g_textures[15])
      {
        g_iconBacks[4].sampler.texture = g_textures[6];
      }
      if(g_iconBacks[6].sampler.texture == g_textures[49])
      {
        g_iconBacks[6].sampler.texture = g_textures[48];
      }
    }
  }
  if(g_iconBacks[7] && g_resetSwitch)
  {
    if((percentHUDY > 70 && percentHUDY < 80) && (percentHUDX > 43 && percentHUDX < 56))
    {
      g_iconBacks[7].sampler.texture = g_textures[51];
    }
    else
    {
      if(g_iconBacks[7].sampler.texture == g_textures[51])
      {
        g_iconBacks[7].sampler.texture = g_textures[50];
      }
    }
  }
}

function updateCursorPosition(mX, mY)
{
  var percentX = (mX/g_client.width)*100;
  var percentY = (mY/g_client.height)*100;

  if(percentX > 24 && percentX < 80)
  {
    if(percentY > 22 && percentY < 85)
    {
      var x = null;
      var left = g_client.width/(100/24);
      var right = g_client.width/(100/80);
      var mouseX = mX;
      var width = right - left;
      var percentWidth = (mouseX-left)/width;
      var actual = width*percentWidth;
      var nodeWidth = width/O3D_TD_I_MAX;
      x = actual/nodeWidth;
      x = Math.round(x);
      if(x < 2) { x = 2; }
      if(x > O3D_TD_I_MAX-4) { x = O3D_TD_I_MAX-4; }

      var y = null;
      var top = g_client.height/(100/22);
      var bottom = g_client.height/(100/85);
      var mouseY = mY;
      var height = bottom - top;
      var percentHeight = (mouseY-top)/height;
      percentHeight = (percentHeight*-1)+1;
      var actual = height*percentHeight;
      var nodeHeight = height/O3D_TD_J_MAX;
      y = actual/nodeHeight;
      y = Math.round(y);
      if(y < 2) { y = 2; }
      if(y > O3D_TD_J_MAX-4) { y = O3D_TD_J_MAX-4; }

      //determine if there is new data
      if(x) { var newX = x; }
      else  { var newX = world.cursorI; }
      if(y) { var newY = y; }
      else  { var newY = world.cursorJ;  }

      //stuff in the new data
      world.setCursorPos(newX,newY);

      updateCursorShape();
    }
  }
}

function updateCursorShape()
{
  changeShape = true;

  for(i = -1; i < 2; i++)
  {
    for(j = -1; j < 2; j++)
    {
      if(world.getTowerAtPos(world.cursorI+i, world.cursorJ+j))
      {
        for (var idx in world.cursorDrawings)
        {
          var d = world.cursorDrawings[idx];
          var base = world.cursorBaseDrawings[idx];
          var dummy = world.dummyDrawings[idx];
          if(d.translate.visible)
          {
            var tower = g_selectedIndex+1;
            d.setDrawingShape("CURSOR"+tower.toString()+"GRAY");
            base.setDrawingShape("CURSOR"+tower.toString()+"GRAYBASE");
          }
          else if(dummy.translate.visible)
          {
            dummy.setDrawingShape("GRID_BLOCK_OFF");
          }
        }
        changeShape = false;
        overTower = true;
      }
    }
  }
  if(changeShape)
  {
    for (var idx in world.cursorDrawings)
    {
      var d = world.cursorDrawings[idx];
      var base = world.cursorBaseDrawings[idx];
      var dummy = world.dummyDrawings[idx];
      if(d.translate.visible)
      {
        var tower = g_selectedIndex+1;
        d.setDrawingShape("CURSOR"+tower.toString());
        base.setDrawingShape("CURSOR"+tower.toString()+"BASE");
      }
      else if(dummy.translate.visible)
      {
        dummy.setDrawingShape("GRID_BLOCK");
      }
    }
    overTower = false;
  }
}

function onWheel(wheel_event)
{
  if(wheel_event.ctrlKey) { var change = 0.1; }
  else { var change = 0.5; }

  if(wheel_event.deltaY > 0)
  {
    var newzoom = clients[0].zoom + change;
    if(newzoom > -2.0 + change)
    {
      clients[0].zoom -= change;
      clients[0].setSlightView();
    }
  }
  else
  {
    var newzoom = clients[0].zoom + change;
    if(newzoom < 2.5 - change)
    {
      clients[0].zoom += change;
      clients[0].setSlightView();
    }
  }
}

function onDoubleClick(mouse_event)
{
  switch(g_selectedIndex)
  {
    case 0:
      if(world.money < 20) { return; }
    case 1:
      if(world.money < 10) { return; }
    case 2:
      if(world.money < 5) { return; }
  }
  g_mouse = "DBLCLICK";

  var percentX = (mouse_event.x/g_client.width)*100;
  var percentY = (mouse_event.y/g_client.height)*100;

  if(!paused)
  {
    if(g_rangeIcon) { g_rangeIcon.makeItGoAway(); }
    if(g_upgradeIcon) { g_upgradeIcon.makeItGoAway(); }

    if(percentX > 25 && percentX < 75)
    {
      if(!world.getSelectedTower())
      {
        world.buildTower(game.towerType);

        if(g_cursorRange) { g_cursorRange.makeItGoAway(); }

        prevSelection = world.getSelectedTower();

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
        if(prevSelection.level < 2)
        {
          g_upgradeIcon = DrawnObj.newShape(
            clients[0],
            world,
            Shapes.UPGRADE_SHAPE,
            prevSelection.i+3,
            prevSelection.j,
            O3D_TD_GRID_K+3,
            0.1,
            0.1,
            0.1,
            Drawing.Colors.EXIT);
          g_upgradeIcon.shape.name = "upgradeIcon";
        }
      }
    }
  }
}

function onMouseUp(mouse_event)
{
  if(g_mouse == "DBLCLICK" || g_mouse == "CLICK")
  {
    return;
  }
  if(g_mouse == "MOVE")
  {
    g_mouse = "UP";
  }

  var percentX = (mouse_event.x/g_client.width)*100;
  var percentY = (mouse_event.y/g_client.height)*100;

  var percentHUDX = (mouse_event.x/g_client.width)*100;
  var percentHUDY = (mouse_event.y/g_client.height)*100;

  if(percentHUDY > 85)
  {
    if(percentHUDX < 15)
    {
      if(!pregame)
      {
        game.togglePause();
      }
    }
    if(!paused)
    {
      if(percentHUDX > 77)
      {
        if(pregame)
        {
          g_iconBacks[5].sampler.texture = g_textures[5];
          pregame = false;
        }
        world.nextWave();
      }
      if(percentHUDX > 43 && percentHUDX < 56)
      {
        if(g_splashScreenB) { removeScreen(g_splashScreenB); }

        g_splashScreenB = addScreen(g_textures[17]);
        setupControls("SPLASH");

        clients[0].client.clearRenderCallback();
        clients[0].client.setRenderCallback(helpScreen);
      }
    }
  }
  if(g_resetSwitch)
  {
    if(percentHUDY > 70 && percentHUDY < 80)
    {
      if(percentHUDX > 43 && percentHUDX < 56)
      {
        onResetGame();
      }
    }
  }

  if(!paused)
  {
    if(percentX > 25 && percentX < 75)
    {
      if(prevSelection)
      {
        var pickRay = o3djs.picking.clientPositionToWorldRay(
          mouse_event.x,
          mouse_event.y,
          clients[0].viewInfo.drawContext,
          g_client.width,
          g_client.height);
        unSelectAll();

        // Update the entire tree in case anything moved.
        g_TowerInfo.update();

        var pickInfo = g_TowerInfo.pick(pickRay);

        if (pickInfo)
        {
          var floorCollision = false;
          if(pickInfo.shapeInfo.shape.name == "env_obj")
          { floorCollision = true; }
          if(pickInfo.shapeInfo.shape.name == "fx_range")
          { floorCollision = true; }
          if(pickInfo.shapeInfo.shape.name == "env_floor")
          { floorCollision = true; }
          if(pickInfo.shapeInfo.shape.name == "env_reflection")
          { floorCollision = true; }

          if(!floorCollision)
          {
            //picked the upgrade button
            if(pickInfo.shapeInfo.shape.name == "upgradeIcon")
            {
              world.upgradeTower(prevSelection);
            }
            //picked a tower
            else
            {
              if(g_upgradeIcon) { g_upgradeIcon.makeItGoAway(); }
              if(g_rangeIcon) { g_rangeIcon.makeItGoAway(); }

              var nX = pickInfo.worldIntersectionPosition[0];
              var nY = pickInfo.worldIntersectionPosition[1];
              prevSelection = findTower(nX, nY);
              if(prevSelection)
              {
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
                if(prevSelection.level < 2)
                {
                  g_upgradeIcon = DrawnObj.newShape(
                    clients[0],
                    world,
                    Shapes.UPGRADE_SHAPE,
                    prevSelection.i+3,
                    prevSelection.j,
                    O3D_TD_GRID_K+3,
                    0.1,
                    0.1,
                    0.1,
                    Drawing.Colors.EXIT);
                  g_upgradeIcon.shape.name = "upgradeIcon";
                }
              }
              else
              {
                prevSelection = true;
              }
            }
          }
          else
          {
            if(g_rangeIcon)
            { g_rangeIcon.makeItGoAway(); }
            if(g_upgradeIcon)
            { g_upgradeIcon.makeItGoAway(); }
            prevSelection = null;
          }
        }
      }
      if(!prevSelection)
      {
        for (var idx in world.cursorDrawings)
        {
          var d = world.cursorDrawings[idx];
          if(!d.translate.visible) { prevSelection = true; return; }
        }

        world.buildTower(game.towerType);

        if(g_cursorRange) { g_cursorRange.makeItGoAway(); }

        prevSelection = world.getSelectedTower();

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
        if(prevSelection.level < 2)
        {
          g_upgradeIcon = DrawnObj.newShape(
            clients[0],
            world,
            Shapes.UPGRADE_SHAPE,
            prevSelection.i+3,
            prevSelection.j,
            O3D_TD_GRID_K+3,
            0.1,
            0.1,
            0.1,
            Drawing.Colors.EXIT);
          g_upgradeIcon.shape.name = "upgradeIcon";
        }
      }
    }

    else
    {
      if(g_rangeIcon) { g_rangeIcon.makeItGoAway(); }
      if(g_upgradeIcon) { g_upgradeIcon.makeItGoAway(); }
      prevSelection = null;
    }
    for (var idx in world.cursorDrawings)
    {
      var d = world.cursorDrawings[idx];
      d.translate.visible = false;
      var base = world.cursorBaseDrawings[idx];
      base.translate.visible = false;
      var shadow = world.shadowTransform;
      shadow.visible = true;
      var dummy = world.dummyDrawings[idx];
      dummy.translate.visible = true;
    }
  }
}

function onClick(mouse_event)
{
  if(!paused)
  {
    if(g_mouse == "CLICK" && g_mouse != "DBLCLICK")
    {
      g_mouse = "UP";
      var percentX = (mouse_event.x/g_client.width)*100;
      var percentY = (mouse_event.y/g_client.height)*100;

      if(percentX > 25 && percentX < 75)
      {
        if(!world.getSelectedTower())
        {
          world.buildTower(game.towerType);

          if(g_cursorRange) { g_cursorRange.makeItGoAway(); }

          prevSelection = world.getSelectedTower();

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
          if(prevSelection.level < 2)
          {
            g_upgradeIcon = DrawnObj.newShape(
              clients[0],
              world,
              Shapes.UPGRADE_SHAPE,
              prevSelection.i+3,
              prevSelection.j,
              O3D_TD_GRID_K+3,
              0.1,
              0.1,
              0.1,
              Drawing.Colors.EXIT);
            g_upgradeIcon.shape.name = "upgradeIcon";
          }
          for (var idx in world.cursorDrawings)
          {
            var d = world.cursorDrawings[idx];
            d.translate.visible = false;
            var base = world.cursorBaseDrawings[idx];
            base.translate.visible = false;
            var shadow = world.shadowTransform;
            shadow.visible = true;
            var dummy = world.dummyDrawings[idx];
            dummy.translate.visible = true;
          }
        }
      }
    }
    if(g_mouse == "DOWN")
    {
      g_mouse = "CLICK";
      switch(g_selectedIndex)
      {
        case 0:
          if(world.money >= 5)
          {
            chooseTower();
            break;
          }
        case 1:
          if(world.money >= 10)
          {
            chooseTower();
            break;
          }
        case 2:
          if(world.money >= 20)
          {
            chooseTower();
            break;
          }
      }
    }
  }
}

function onMouseMove(mouse_event)
{
  mouseOver(mouse_event.x, mouse_event.y);
  if(g_mouse == "DOWN" || g_mouse == "MOVE")
  {
    var newMouseX = mouse_event.x;
    var newMouseY = mouse_event.y;

    if(!paused)
    {
      if((Math.abs(newMouseX - g_prevMouseX) > 100) &&
         (Math.abs(newMouseY - g_prevMouseY) > 100))
      {
        g_mouse = "MOVE";

        var percentX = (mouse_event.x/g_client.width)*100;
        var percentY = (mouse_event.y/g_client.height)*100;

        var offsetHUDX = (125/g_client.width)*100; //the width of the selector
        var offsetHUDY = (125/g_client.height)*100; //the height of the selector

        var newPercentX = 100 - (offsetHUDX*1);
        var newPercentY = offsetHUDY;

        if(percentY < newPercentY)
        {
          var newPercentXlow = 100 - (offsetHUDX*3);
          var newPercentXhigh = 100 - (offsetHUDX*2);
          if(percentX > newPercentXlow && percentX < newPercentXhigh)
          {
            if(world.money >= 5)
            {
              chooseTower();
            }
          }

          var newPercentXlow = 100 - (offsetHUDX*2);
          var newPercentXhigh = 100 - (offsetHUDX*1);
          if(percentX > newPercentXlow && percentX < newPercentXhigh)
          {
            if(world.money >= 10)
            {
              chooseTower();
            }
          }

          var newPercentXlow = 100 - (offsetHUDX*1);
          var newPercentXhigh = 100 - (offsetHUDX*0);
          if(percentX > newPercentXlow && percentX < newPercentXhigh)
          {
            if(world.money >= 20)
            {
              chooseTower();
            }
          }
        }

        g_prevMouseX = mouse_event.x;
        g_prevMouseY = mouse_event.y;

      }
    }
  }
  updateCursorPosition(mouse_event.x, mouse_event.y);
}
function onSplashMouseUp(mouse_event)
{
  g_splashState = "DONE";
}

function onMouseDown(mouse_event)
{
    if(g_cursorRange) { g_cursorRange.makeItGoAway(); }

  var percentX = (mouse_event.x/g_client.width)*100;
  var percentY = (mouse_event.y/g_client.height)*100;

  var offsetHUDX = (125/g_client.width)*100; //the width of the selector
  var offsetHUDY = (125/g_client.height)*100; //the height of the selector

  var newPercentX = 100 - (offsetHUDX*1);
  var newPercentY = offsetHUDY;

  if(percentY < newPercentY)
  {
    var newPercentXlow = 100 - (offsetHUDX*3);
    var newPercentXhigh = 100 - (offsetHUDX*2);
    if(percentX > newPercentXlow && percentX < newPercentXhigh)
    {
      if(world.money >= 5)
      {
        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[4];

        g_selectedIndex = 2;

        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[16];

        game.selectTowerType(g_selectedIndex);
      }
    }

    var newPercentXlow = 100 - (offsetHUDX*2);
    var newPercentXhigh = 100 - (offsetHUDX*1);
    if(percentX > newPercentXlow && percentX < newPercentXhigh)
    {
      if(world.money >= 10)
      {
        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[4];

        g_selectedIndex = 1;

        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[16];

        game.selectTowerType(g_selectedIndex);
      }
    }

    var newPercentXlow = 100 - (offsetHUDX*1);
    var newPercentXhigh = 100 - (offsetHUDX*0);
    if(percentX > newPercentXlow && percentX < newPercentXhigh)
    {
      if(world.money >= 20)
      {
        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[4];

        g_selectedIndex = 0;

        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[16];

        game.selectTowerType(g_selectedIndex);
      }
    }
    g_mouse = "DOWN";
  }
}

function unSelectAll() {
}

function select(pickInfo) {
  unSelectAll();
  if (pickInfo) {
  }
}
/**
 * Gets the character code from the keyboard event.  Does any needed
 * translations to make processing easier.
 */
function getCharCode(event) {
  var code = o3djs.event.getEventKeyChar(event);
  if (event.ctrlKey && code >= 'a' && code <= 'z') {
    code = code - 'a' + 1; // Convert to control key, with ^a being 1.
    // We don't ctrl-convert capital letters, so as not to lose the shift.
  }
  switch (event.keyCode) {
  case 37: // Left arrow
  code = 104; // h
    break;
  case 38: // Up arrow
    code = 107; // k
    break;
  case 39: // Right arrow
    code = 108; // l
    break;
  case 40: // Down arrow
    code = 106; // j
    break;
  }
  return code;
}
function onKeyDown(event) {
  if (event.ctrlKey || event.altKey) {
    return;
  }
  var id;
  if (event.originalTarget) { // Firefox
    id = event.originalTarget.id;
  } else if (event.target) { // Safari
    id = event.target.id;
  }
  if (id == 'player_name') {
    return;
  }
  var inputChar = String.fromCharCode(getCharCode(event)).toLowerCase();
  try {
    if (inputChar) {
      switch (inputChar) {
        case 'a':
        case 'h':
      world.handleMotion(-1, 0);
      updateCursorShape();
      break;
        case 's':
        case 'j':
      world.handleMotion(0, -1);
      updateCursorShape();
      break;
        case 'w':
        case 'k':
      world.handleMotion(0, 1);
      updateCursorShape();
      break;
        case 'd':
        case 'l':
      world.handleMotion(1, 0);
      updateCursorShape();
      break;
    case 'm':
        case 'n':
      if(pregame)
      {
      g_iconBacks[5].sampler.texture = g_textures[5];
      pregame = false;
      }
          world.nextWave();
        break;
        case 'r':
      onResetGame();
          break;
        case 't':
      if(world.getTowerAtPos(world.cursorI,world.cursorJ))
          {
      prevSelection =  world.getTowerAtPos(world.cursorI, world.cursorJ);
      world.upgradeTower();
      }
      else
      {
            for (var idx in world.cursorDrawings)
      {
        var d = world.cursorDrawings[idx];
        var dummy = world.dummyDrawings[idx];
        if(dummy.translate.visible = true)
        {
          g_mouse = "UP";
        }
      }
        world.buildTower(game.towerType);
      prevSelection =  world.getTowerAtPos(world.cursorI, world.cursorJ);
      }
          break;
        case ' ':
      if(!pregame)
      {
      game.togglePause();
      break;
      }
        case '3':
          for (var idx in world.cursorDrawings) {
            var d = world.cursorDrawings[idx];
        d.setDrawingShape("CURSOR1");
      var base = world.cursorBaseDrawings[idx];
      base.setDrawingShape("CURSOR1BASE");
      }
      if(g_cursorRange) { g_cursorRange.makeItGoAway(); }

        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[4];

      g_selectedIndex = 0;

        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[16];

          game.selectTowerType(0);
      g_upgradeIcon.makeItGoAway();
          game.updateDisplayForCurTower(world.getSelectedTower());
          break;
        case '2':
          for (var idx in world.cursorDrawings) {
            var d = world.cursorDrawings[idx];
        d.setDrawingShape("CURSOR2");
      var base = world.cursorBaseDrawings[idx];
      base.setDrawingShape("CURSOR2BASE");
      }
      if(g_cursorRange) { g_cursorRange.makeItGoAway(); }

      g_iconBacks[g_selectedIndex].sampler.texture = g_textures[4];

      g_selectedIndex = 1;

        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[16];

          game.selectTowerType(1);
      g_upgradeIcon.makeItGoAway();
          game.updateDisplayForCurTower(world.getSelectedTower());
          break;
        case '1':
          for (var idx in world.cursorDrawings) {
            var d = world.cursorDrawings[idx];
        d.setDrawingShape("CURSOR3");
      var base = world.cursorBaseDrawings[idx];
      base.setDrawingShape("CURSOR3BASE");
      }
      if(g_cursorRange) { g_cursorRange.makeItGoAway(); }

      g_iconBacks[g_selectedIndex].sampler.texture = g_textures[4];

      g_selectedIndex = 2;

        g_iconBacks[g_selectedIndex].sampler.texture = g_textures[16];

          game.selectTowerType(2);
      g_upgradeIcon.makeItGoAway();
          game.updateDisplayForCurTower(world.getSelectedTower());
          break;
        case '4':
          break;
        case '9':
          break;
        case '0':
          break;
        default:
          return;
      }
    }
  } catch (ex) {
    if (ex instanceof UserError) {
      o3d.towerdefense.debug('User error: ' + ex.s);
    } else {
      throw ex;
    }
  }
  if (event.preventDefault) {
    event.preventDefault();
  }
  if (event.stopPropagation) {
    event.stopPropagation();
  }
}
