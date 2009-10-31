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
function initializeTower(tower)
{
  var paramObject = g_pack.createObject('ParamObject');

  tower.build = paramObject.createParam(tower+'build', 'ParamTransform');
  tower.buildbase = paramObject.createParam(tower+'buildbase', 'ParamTransform');
  tower.idle = paramObject.createParam(tower+'idle', 'ParamTransform');
  tower.idlebase = paramObject.createParam(tower+'idlebase', 'ParamTransform');
  tower.idlegray = paramObject.createParam(tower+'cursorgrey', 'ParamTransform');
  tower.idlegraybase = paramObject.createParam(tower+'cursorgreybase', 'ParamTransform');
  tower.fire = paramObject.createParam(tower+'fire', 'ParamTransform');
  tower.firebase = paramObject.createParam(tower+'firebase', 'ParamTransform');
  tower.upgrade01 = paramObject.createParam(tower+'upgrade01', 'ParamTransform');
  tower.upgrade01base = paramObject.createParam(tower+'upgrade01base', 'ParamTransform');
  tower.upgrade01idle = paramObject.createParam(tower+'upgrade01idle', 'ParamTransform');
  tower.upgrade01idlebase = paramObject.createParam(tower+'upgrade01idlebase', 'ParamTransform');
  tower.upgrade01fire = paramObject.createParam(tower+'upgrade01fire', 'ParamTransform');
  tower.upgrade01firebase = paramObject.createParam(tower+'upgrade01firebase', 'ParamTransform');
  tower.upgrade02 = paramObject.createParam(tower+'upgrade02', 'ParamTransform');
  tower.upgrade02base = paramObject.createParam(tower+'upgrade02base', 'ParamTransform');
  tower.upgrade02idle = paramObject.createParam(tower+'upgrade02idle', 'ParamTransform');
  tower.upgrade02idlebase = paramObject.createParam(tower+'upgrade02idlebase', 'ParamTransform');
  tower.upgrade02fire = paramObject.createParam(tower+'upgrade02fire', 'ParamTransform');
  tower.upgrade02firebase = paramObject.createParam(tower+'upgrade02firebase', 'ParamTransform');
}

function initializeEnemy(enemy)
{
  var paramObject = g_pack.createObject('ParamObject');

  enemy.walk = paramObject.createParam('walk', 'ParamTransform');
  enemy.death = paramObject.createParam('death', 'ParamTransform');
}

function fileName(path, delimiter)
{
  var file = path;
  var index = path.lastIndexOf(delimiter);
  var end = path.lastIndexOf('.');
  file = file.substring(index+1, end);
  return file;
}

function makePath(name) {
  return o3djs.util.getAbsoluteURI(name);
}

function loadFiles()
{
  //PATH VARIABLE TO LOCATE THE OBJECT TO LOAD INTO THE SCENE
  var path;

  initializeTower(OOZIE);
  initializeTower(LAUNCHER);
  initializeTower(BALL);

  initializeEnemy(DINO);
  initializeEnemy(PRINCESS);
  initializeEnemy(ROBOT);
  initializeEnemy(CAR);

  path = makePath('assets/Oozie/oozieLauncher_build.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 0);
  path = makePath('assets/Oozie/oozieLauncher_idle.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 2);
  path = makePath('assets/Oozie/oozieLauncher_idleGray.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 70);
  path = makePath('assets/Oozie/oozieLauncher_fire.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 4);
  path = makePath('assets/Oozie/oozieLauncher_upgrade01build.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 6);
  path = makePath('assets/Oozie/oozieLauncher_upgrade01idle.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 8);
  path = makePath('assets/Oozie/oozieLauncher_upgrade01fire.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 10);
  path = makePath('assets/Oozie/oozieLauncher_upgrade02build.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 12);
  path = makePath('assets/Oozie/oozieLauncher_upgrade02idle.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 14);
  path = makePath('assets/Oozie/oozieLauncher_upgrade02fire.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, OOZIE, 16);

  path = makePath('assets/MissileLauncher/missileLauncher_build.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 18);
  path = makePath('assets/MissileLauncher/missileLauncher_idle.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 20);
  path = makePath('assets/MissileLauncher/missileLauncher_idleGray.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 74);
  path = makePath('assets/MissileLauncher/missileLauncher_fire.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 22);
  path = makePath('assets/MissileLauncher/missileLauncher_upgrade01build.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 24);
  path = makePath('assets/MissileLauncher/missileLauncher_upgrade01idle.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 26);
  path = makePath('assets/MissileLauncher/missileLauncher_upgrade01fire.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 28);
  path = makePath('assets/MissileLauncher/missileLauncher_upgrade02build.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 30);
  path = makePath('assets/MissileLauncher/missileLauncher_upgrade02idle.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 32);
  path = makePath('assets/MissileLauncher/missileLauncher_upgrade02fire.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, LAUNCHER, 34);

  path = makePath('assets/BallLauncher/ballLauncher_build.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 36);
  path = makePath('assets/BallLauncher/ballLauncher_idle.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 38);
  path = makePath('assets/BallLauncher/ballLauncher_idleGray.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 72);
  path = makePath('assets/BallLauncher/ballLauncher_fire.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 40);
  path = makePath('assets/BallLauncher/ballLauncher_upgrade01build.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 42);
  path = makePath('assets/BallLauncher/ballLauncher_upgrade01idle.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 44);
  path = makePath('assets/BallLauncher/ballLauncher_upgrade01fire.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 46);
  path = makePath('assets/BallLauncher/ballLauncher_upgrade02build.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 48);
  path = makePath('assets/BallLauncher/ballLauncher_upgrade02idle.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 50);
  path = makePath('assets/BallLauncher/ballLauncher_upgrade02fire.o3dtgz');
  loadFile2(clients[0].viewInfo.drawContext, path, BALL, 52);

  path = makePath('assets/Projectiles/ball.o3dtgz');
  loadFile(clients[0].viewInfo.drawContext, path, 54);
  path = makePath('assets/Projectiles/missile.o3dtgz');
  loadFile(clients[0].viewInfo.drawContext, path, 54);

  path = makePath('assets/UI/fx_gridBlock.o3dtgz');
  loadFile(clients[0].viewInfo.drawContext, path, 68);
  path = makePath('assets/UI/fx_gridBlockOff.o3dtgz');
  loadFile(clients[0].viewInfo.drawContext, path, 69);
  path = makePath('assets/fx_range.o3dtgz');
  loadFile(clients[0].viewInfo.drawContext, path, 54);
  path = makePath('assets/ui_upgrade.o3dtgz');
  loadFile(clients[0].viewInfo.drawContext, path, 55);
  path = makePath('assets/ooze.o3dtgz');
  loadFile(clients[0].viewInfo.drawContext, path, 56);

  path = makePath('assets/Creeps/toyrobot_walk.o3dtgz');
  loadFile3(clients[0].viewInfo.drawContext, path, ROBOT, 57);
  path = makePath('assets/Creeps/toyrobot_death.o3dtgz');
  loadFile3(clients[0].viewInfo.drawContext, path, ROBOT, 58);

  path = makePath('assets/Creeps/dinosaur_walk.o3dtgz');
  loadFile3(clients[0].viewInfo.drawContext, path, DINO, 59);
  path = makePath('assets/Creeps/dinosaur_death.o3dtgz');
  loadFile3(clients[0].viewInfo.drawContext, path, DINO, 60);
  path = makePath('assets/Creeps/dinosaur_jump.o3dtgz');
  loadFile3(clients[0].viewInfo.drawContext, path, DINO, 61);

  path = makePath('assets/Creeps/princess_walk.o3dtgz');
  loadFile3(clients[0].viewInfo.drawContext, path, PRINCESS, 62);
  path = makePath('assets/Creeps/princess_death.o3dtgz');
  loadFile3(clients[0].viewInfo.drawContext, path, PRINCESS, 63);

  path = makePath('assets/Creeps/racecar_walk.o3dtgz');
  loadFile3(clients[0].viewInfo.drawContext, path, CAR, 64);
  path = makePath('assets/Creeps/racecar_death.o3dtgz');
  loadFile3(clients[0].viewInfo.drawContext, path, CAR, 65);

  path = makePath('assets/Environment/toyRoom.o3dtgz');
  loadFloor(clients[0].viewInfo.drawContext, path);
}

function loadFloor(context, path)
{
  function loadCallback(pack, parent, exception)
  {
    if (exception)
  {
      alert("Could not load: " + path + "\n" + exception);
    }
  else
  {
      // Generate draw elements and setup material draw lists.
      o3djs.pack.preparePack(pack, clients[0].viewInfo);

   test = g_pack.getObjects("env_floor|floor", "o3d.Primitive");
    if(test.length)
    {
    test[0].zSortPoint = [0, 0, -100];
    }

    test1 = g_pack.getObjects("env_obj|Standard_4", "o3d.Primitive");
    if(test1.length)
    {
    test1[0].zSortPoint = [0, 0, -100];
    }
  }
  }
  transform = g_pack.createObject('Transform');
  transform.parent = clients[0].root;

  if (path != null) {
    try
  {
    var paramObject = g_pack.createObject('ParamObject');
    g_animTimeParam[g_animTimeParam.length] = paramObject.createParam("anim_floor", 'ParamFloat');
    g_animateObject[g_animateObject.length] = true;

    g_loaders[g_loaders.length] = o3djs.scene.loadScene(clients[0].client, g_pack, transform, path, loadCallback, { opt_animSource: g_animTimeParam[g_animTimeParam.length-1]});
    }
  catch (e) {
    }
  }
}

function loadFile2(context, path, towerName, index)
{
  function loadCallback(pack, parent, exception)
  {
  if (exception)
  {
    alert("Could not load: " + path + "\n" + exception);
  }
  else
  {
    o3djs.pack.preparePack(pack, clients[0].viewInfo);

    var file = fileName(path, '_');
    file = file.toLowerCase();

    test = g_pack.getObjects(g_objectNames[index], "o3d.Transform");
    testbase = g_pack.getObjects(g_objectNames[index+1], "o3d.Transform");
    if(test.length)
    {
      switch(file)
      {
        case "build":
        towerName.build = test[0].shapes[0];
        towerName.buildbase = testbase[0].shapes[0];
        break;
        case "idle":
        towerName.idle = test[0].shapes[0];
        towerName.idlebase = testbase[0].shapes[0];
        break;
        case "idlegray":
        towerName.idlegray = test[0].shapes[0];
        towerName.idlegraybase = testbase[0].shapes[0];
        break;
        case "fire":
        towerName.fire = test[0].shapes[0];
        towerName.firebase = testbase[0].shapes[0];
        break;
        case "upgrade01build":
        towerName.upgrade01 = test[0].shapes[0];
        towerName.upgrade01base = testbase[0].shapes[0];
        break;
        case "upgrade01idle":
        towerName.upgrade01idle = test[0].shapes[0];
        towerName.upgrade01idlebase = testbase[0].shapes[0];
        break;
        case "upgrade01fire":
        towerName.upgrade01fire = test[0].shapes[0];
        towerName.upgrade01firebase = testbase[0].shapes[0];
        break;
        case "upgrade02build":
        towerName.upgrade02 = test[0].shapes[0];
        towerName.upgrade02base = testbase[0].shapes[0];
        break;
        case "upgrade02idle":
        towerName.upgrade02idle = test[0].shapes[0];
        towerName.upgrade02idlebase = testbase[0].shapes[0];
        break;
        case "upgrade02fire":
        towerName.upgrade02fire = test[0].shapes[0];
        towerName.upgrade02firebase = testbase[0].shapes[0];
        break;
      }
    }
  }
  }
  transform = g_pack.createObject('Transform');

  if (path != null) {
    try
  {
    var paramObject = g_pack.createObject('ParamObject');
    g_animTimeParam[g_animTimeParam.length] = paramObject.createParam("anim_"+g_objectNames[index], 'ParamFloat');
    g_animateObject[g_animateObject.length] = true;

    g_loaders[g_loaders.length] = o3djs.scene.loadScene(clients[0].client, g_pack, transform, path,
    loadCallback, { opt_animSource: g_animTimeParam[g_animTimeParam.length-1]});
    }
  catch (e) {
    }
  }
}

function loadFile3(context, path, enemyName, index)
{
  function loadCallback(pack, parent, exception)
  {
  if (exception)
  {
    alert("Could not load: " + path + "\n" + exception);
  }
  else
  {
    o3djs.pack.preparePack(pack, clients[0].viewInfo);

    var file = fileName(path, '_');

    test = g_pack.getObjects(g_objectNames[index], "o3d.Transform");
    if(test.length)
    {
      switch(file)
      {
        case "walk":
        enemyName.walk = test[0].shapes[0];
        break;
        case "death":
        enemyName.death = test[0].shapes[0];
        break;
        case "jump":
        enemyName.jump = test[0].shapes[0];
        break;
      }
    }
  }
  }
  transform = g_pack.createObject('Transform');

  if (path != null) {
    try
  {
    var paramObject = g_pack.createObject('ParamObject');
    g_animTimeParam[g_animTimeParam.length] = paramObject.createParam("anim_"+g_objectNames[index], 'ParamFloat');

    g_animateObject[g_animateObject.length] = true;

    g_loaders[g_loaders.length] = o3djs.scene.loadScene(clients[0].client, g_pack, transform, path,
    loadCallback, { opt_animSource: g_animTimeParam[g_animTimeParam.length-1]});
    }
  catch (e) {
    }
  }
}

function loadFile(context, path, index)
{
  function loadCallback(pack, parent, exception)
  {
    if (exception)
  {
      alert("Could not load: " + path + "\n" + exception);
    }
  else
  {
      // Generate draw elements and setup material draw lists.
      o3djs.pack.preparePack(pack, clients[0].viewInfo);

    if(!RANGE_SHAPE)
    {
      test = g_pack.getObjects(g_objectNames[54], "o3d.Transform");
    if(test.length)
    {
      RANGE_SHAPE = test[0].shapes[0];
    }
    }

    if(!UPGRADE_SHAPE)
    {
      test = g_pack.getObjects(g_objectNames[55], "o3d.Transform");
    if(test.length)
    {
      UPGRADE_SHAPE = test[0].shapes[0];
    }
    }

    if(!OOZE_SHAPE)
    {
      test = g_pack.getObjects("ooze", "o3d.Transform");
    if(test.length)
    {
      OOZE_SHAPE = test[0].shapes[0];
    }
    }

    if(!BALL_AMMO)
    {
    test = g_pack.getObjects("ball", "o3d.Transform");
    if(test.length)
    {
      BALL_AMMO = test[0].shapes[0];
    }
    }

    if(!LAUNCHER_AMMO)
    {
    test = g_pack.getObjects("missile", "o3d.Transform");
    if(test.length)
    {
      LAUNCHER_AMMO = test[0].shapes[0];
    }
    }

    if(!GRID_BLOCK)
    {
    test = g_pack.getObjects(g_objectNames[68], "o3d.Transform");
    if(test.length)
    {
      GRID_BLOCK = test[0].shapes[0];
    }
    }
    if(!GRID_BLOCK_OFF)
    {
    test = g_pack.getObjects(g_objectNames[69], "o3d.Transform");
    if(test.length)
    {
      GRID_BLOCK_OFF = test[0].shapes[0];
    }
    }
  }
  }

  transform = g_pack.createObject('Transform');

  if (path != null) {
    try
  {

    var paramObject = g_pack.createObject('ParamObject');
    g_animTimeParam[g_animTimeParam.length] = paramObject.createParam("anim_"+g_objectNames[index], 'ParamFloat');
    g_animateObject[g_animateObject.length] = true;

    g_loaders[g_loaders.length] = o3djs.scene.loadScene(clients[0].client, g_pack, transform, path,
    loadCallback, { opt_animSource: g_animTimeParam[g_animTimeParam.length-1]});
    }
  catch (e) {
    }
  }
}

function loadTexture(loader, url, index)
{
  loader.loadTexture(g_pack, url, function(texture, exception)
  {
    if (exception) {
      alert(exception);
    } else {
      g_textures[index] = texture;
    }
  });
}

function loadGame(render_event)
{
  if(!g_loading)
  {
    for(ii = 0; ii < g_animTimeParam.length; ii++)
    {
      if(g_animTimeParam[ii])
      {
        switch(g_animTimeParam[ii].name)
        {
          case "anim_floor":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 14 / 30;
            break;

          case "anim_oozieLauncher_build":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 55 / 30;
            break;
          case "anim_oozieLauncher_idle":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 79 / 30;
            break;
          case "anim_oozieLauncher_idlegray":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 79 / 30;
            break;
          case "anim_oozieLauncher_fire":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 12 / 30;
            break;
          case "anim_oozieLauncher_Upgrade01build":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 40 / 30;
            break;
          case "anim_oozieLauncher_Upgrade01idle":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 79 / 30;
            break;
          case "anim_oozieLauncher_Upgrade01fire":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 12 / 30;
            break;
          case "anim_oozieLauncher_Upgrade02build":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 68 / 30;
            break;
          case "anim_oozieLauncher_Upgrade02idle":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 79 / 30;
            break;
          case "anim_oozieLauncher_Upgrade02fire":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 12 / 30;
            break;

          case "anim_missileLauncher_build":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 80 / 30;
            break;
          case "anim_missileLauncher_idle":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 120 / 30;
            break;
          case "anim_missileLauncher_idlegray":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 120 / 30;
            break;
          case "anim_missileLauncher_fire":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 20 / 30;
            break;
          case "anim_missileLauncher_upgrade01build":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 65 / 30;
            break;
          case "anim_missileLauncher_upgrade01idle":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 120 / 30;
            break;
          case "anim_missileLauncher_upgrade01fire":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 20 / 30;
            break;
          case "anim_missileLauncher_upgrade02build":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 65 / 30;
            break;
          case "anim_missileLauncher_upgrade02idle":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 120 / 30;
            break;
          case "anim_missileLauncher_upgrade02fire":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 20 / 30;
            break;

          case "anim_ballLauncher_build":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 59 / 30;
            break;
          case "anim_ballLauncher_idle":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 60 / 30;
            break;
          case "anim_ballLauncher_idlegray":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 60 / 30;
            break;
          case "anim_ballLauncher_fire":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 12 / 30;
            break;
          case "anim_ballLauncher_upgrade01build":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 18 / 30;
            break;
          case "anim_ballLauncher_upgrade01idle":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 47 / 30;
            break;
          case "anim_ballLauncher_upgrade01fire":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 12 / 30;
            break;
          case "anim_ballLauncher_upgrade02build":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 18 / 30;
            break;
          case "anim_ballLauncher_upgrade02idle":
            g_animSpeed[ii] = 0.7;
            g_animLength[ii] = 32 / 30;
            break;
          case "anim_ballLauncher_upgrade02fire":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 12 / 30;
            break;

          case "anim_toyrobot_walk":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 121 / 30;
            break;
          case "anim_toyrobot_death":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 81 / 30;
            break;

          case "anim_dinosaur_walk":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 81 / 30;
            break;
          case "anim_dinosaur_death":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 70 / 30;
            break;
          case "anim_dinosaur_jump":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 81 / 30;
            break;

          case "anim_princess_walk":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 31 / 30;
            break;
          case "anim_princess_death":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 56 / 30;
            break;

          case "anim_racecar_walk":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 10 / 30;
            break;
          case "anim_racecar_death":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 91 / 30;
            break;
          case "anim_racecar_turnleft":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 91 / 30;
            break;
          case "anim_racecar_turnright":
            g_animSpeed[ii] = 1;
            g_animLength[ii] = 91 / 30;
            break;

          default:
            g_animSpeed[ii] = 7;
            g_animLength[ii] = 30 / 30
            break;
        }
      }
    }

    //health Bar/money GUI
    g_iconBacks[3] = new Image(g_textures[7], false);
    g_iconBacks[3].transform.translate(100, 50, -1);

    playerGauge = new Image(g_textures[3], true)
    playerGauge.setColor(0, 1, 0, 1);
    playerGauge.transform.identity();
    playerGauge.transform.translate(130,32,-1);

    for (var ii = 0; ii < 3; ++ii) {

      g_iconBacks[ii] = new Image(g_textures[4], false);
      g_iconBacks[ii].transform.translate(g_client.width - (ii * 80) - 50, 50, -1);

      g_icons[ii] = new Image(g_textures[ii], false);
    }
    g_iconBacks[2].sampler.texture = g_textures[16];

    //Start button GUI
    g_iconBacks[4] = new Image(g_textures[6], false);
    g_iconBacks[4].transform.translate(g_client.width-100, g_client.height-50, -1);

    //Pause button GUI
    g_iconBacks[5] = new Image(g_textures[54], false);
    g_iconBacks[5].transform.translate(100, g_client.height-50, -1);

    //Help button GUI
    g_iconBacks[6] = new Image(g_textures[48], false);
    g_iconBacks[6].transform.translate(g_client.width/2, g_client.height-50, -1);

    for(jj = 0; jj < 3; jj++)
    {
      g_iconBacks[jj+8] = new Image(g_textures[8+jj], false);
      g_iconBacks[jj+8].transform.translate(g_client.width - (jj * 80) - 50, 75, -1);
    }

    resetIcons();

    // Creates an instance of the canvas utilities library.
    g_canvasLib = o3djs.canvas.create(g_pack, g_hudRoot, g_hudViewInfo);

    // Create a 600 x 400 canvas that can host transparent content.
    g_canvas = g_canvasLib.createXYQuad(0, 0, -1, g_client.width, g_client.height, true);

    g_paint = g_pack.createObject('CanvasPaint');

    g_paint.textAlign = o3djs.base.o3d.CanvasPaint.CENTER;
    g_paint.textSize = 20;
    g_paint.textTypeface = 'Gill Sans Ultra Bold';
    g_paint.color = [1, 1, 1, 1];
    g_paint.setShadow(3, 3, 3, [0, 0, 0, 1]);

    g_canvas.updateTexture();

    redrawText();

    setupControls("GAME");
    g_splashState = "RUNNING";

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

    clients[0].client.clearRenderCallback();
    clients[0].client.setRenderCallback(preGameIdle);
  }
  animateObjects(render_event.elapsedTime);
}

