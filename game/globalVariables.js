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
//client/o3d related global variables
var clients = [];
var g_pack;
var g_client;

//mouse click related global variables
var g_mouse = "UP";
var g_mouseDelay = 0;
var g_prevMouseX = 0;
var g_prevMouseY = 0;

//animation related global variables
var g_animTimeParam = [];
var g_animLength = [];
var g_animSpeed = [];
var g_animateObject = [];

//shadow related global variables
var SHADOW_IMAGE;

//loading related global variables
var g_loading = true;
var g_loaders = [];

//cinematic camera related global variables
var g_cameraTimer = 0;
var TIME_PER_CAMERA_MOVE = 0;
var g_cameraCounter = 0;
var endTimer = 0;

//shape instancing related global variables
var OOZIE = { build: 0 };
var BALL = { build: 0 };
var LAUNCHER = { build: 0 };
var ROBOT = { walk: 0 };
var DINO = { walk: 0 };
var PRINCESS = { walk: 0 };
var CAR = { walk: 0 };

var BALL_AMMO;
var GRID_BLOCK;
var GRID_BLOCK_OFF;
var LAUNCHER_AMMO;
var UPGRADE_SHAPE;
var RANGE_SHAPE;
var OOZE_SHAPE;
var FLOOR_SHAPE;

var g_objectNames = [
  "oozieLauncher_build",          //(0)
  "oozieLauncher_buildbase",        //(1)
  "oozieLauncher_idle",         //(2)
  "oozieLauncher_idlebase",       //(3)
  "oozieLauncher_fire",         //(4)
  "oozieLauncher_firebase",       //(5)
  "oozieLauncher_Upgrade01build",     //(6)
  "oozieLauncher_Upgrade01buildbase",   //(7)
  "oozieLauncher_Upgrade01idle",      //(8)
  "oozieLauncher_Upgrade01idlebase",    //(9)
  "oozieLauncher_Upgrade01fire",      //(10)
  "oozieLauncher_Upgrade01firebase",    //(11)
  "oozieLauncher_Upgrade02build",     //(12)
  "oozieLauncher_Upgrade02buildbase",   //(13)
  "oozieLauncher_Upgrade02idle",      //(14)
  "oozieLauncher_Upgrade02idlebase",    //(15)
  "oozieLauncher_Upgrade02fire",      //(16)
  "oozieLauncher_Upgrade02firebase",    //(17)

  "missileLauncher_build",        //(18)
  "missileLauncher_buildbase",      //(19)
  "missileLauncher_idle",         //(20)
  "missileLauncher_idlebase",       //(21)
  "missileLauncher_fire",         //(22)
  "missileLauncher_firebase",       //(23)
  "missileLauncher_upgrade01build",   //(24)
  "missileLauncher_upgrade01buildbase", //(25)
  "missileLauncher_upgrade01idle",    //(26)
  "missileLauncher_upgrade01idlebase",  //(27)
  "missileLauncher_upgrade01fire",    //(28)
  "missileLauncher_upgrade01firebase",  //(29)
  "missileLauncher_upgrade02build",   //(30)
  "missileLauncher_upgrade02buildbase", //(31)
  "missileLauncher_upgrade02idle",    //(32)
  "missileLauncher_upgrade02idlebase",  //(33)
  "missileLauncher_upgrade02fire",    //(34)
  "missileLauncher_upgrade02firebase",  //(35)

  "ballLauncher_build",         //(36)
  "ballLauncher_buildbase",       //(37)
  "ballLauncher_idle",          //(38)
  "ballLauncher_idlebase",        //(39)
  "ballLauncher_fire",          //(40)
  "ballLauncher_firebase",        //(41)
  "ballLauncher_upgrade01build",      //(42)
  "ballLauncher_upgrade01buildbase",    //(43)
  "ballLauncher_upgrade01idle",     //(44)
  "ballLauncher_upgrade01idlebase",   //(45)
  "ballLauncher_upgrade01fire",     //(46)
  "ballLauncher_upgrade01firebase",   //(47)
  "ballLauncher_upgrade02build",      //(48)
  "ballLauncher_upgrade02buildbase",    //(49)
  "ballLauncher_upgrade02idle",     //(50)
  "ballLauncher_upgrade02idlebase",   //(51)
  "ballLauncher_upgrade02fire",     //(52)
  "ballLauncher_upgrade02firebase",   //(53)

  "fx_range",               //(54)
  "ui_upgrade",             //(55)
  "obj_shadow",             //(56)  //should be removed

  "toyrobot_walk",            //(57)
  "toyrobot_death",           //(58)

  "dinosaur_walk",            //(59)
  "dinosaur_death",           //(60)
  "dinosaur_jump",            //(61)

  "princess_walk",            //(62)
  "princess_death",           //(63)

  "racecar_walk",             //(64)
  "racecar_death",            //(65)
  "racecar_turnleft",           //(66)
  "racecar_turnright",          //(67)

  "fx_gridBlock",             //(68)
  "fx_gridBlockOff",            //(69)

  "oozieLauncher_idlegray",       //(70)
  "oozieLauncher_idlebasegray",     //(71)
  "ballLauncher_idlegray",        //(72)
  "ballLauncher_idlebasegray",      //(73)
  "missileLauncher_idlegray",       //(74)
  "missileLauncher_idlebasegray",     //(75)
];

//hud related global variables
var g_hudRoot;
var g_planeShape;
var g_materialUrls = [
  'shaders/texture-colormult.shader',    // 0
  'shaders/phong-with-colormult.shader'  // 1
];
var g_materials = [];
var g_textures = [];
var g_textureUrls = [
  'assets/UI/missileLauncher_icon.png',     // 0
  'assets/UI/oozie_icon.png',             // 1
  'assets/UI/ballLauncher_icon.png',    // 2
  'assets/UI/lifeBar.png',              // 3
  'assets/UI/towerBack.png',            // 4
  'assets/UI/pause.png',              // 5
  'assets/UI/start.png',              // 6
  'assets/UI/info.png',             // 7
  'assets/UI/ui_tower_20dollars.png',   // 8
  'assets/UI/ui_tower_10dollars.png',       // 9
  'assets/UI/ui_tower_5dollars.png',        // 10
  'assets/UI/ui_splash.png',        // 11
  'assets/UI/ui_youLose.png',       // 12
  'assets/UI/ui_youWin.png',        // 13
  'assets/UI/pause_over.png',       // 14
  'assets/UI/start_over.png',       // 15
  'assets/UI/towerBack_selected.png',   // 16
  'assets/UI/ui_tutorial.png',        // 17
  'assets/UI/ui_tower_20dollarsGray.png', // 18
  'assets/UI/ui_tower_10dollarsGray.png', // 19
  'assets/UI/ui_tower_5dollarsGray.png',  // 20
  'assets/UI/ui_paused.png',        // 21
  'assets/UI/ui_wave1.png',       // 22
  'assets/UI/ui_wave2.png',       // 23
  'assets/UI/ui_wave3.png',       // 24
  'assets/UI/ui_wave4.png',       // 25
  'assets/UI/ui_wave5.png',       // 26
  'assets/UI/ui_wave6.png',       // 27
  'assets/UI/ui_wave7.png',       // 28
  'assets/UI/ui_wave8.png',       // 29
  'assets/UI/ui_wave9.png',       // 30
  'assets/UI/ui_wave10.png',        // 31
  'assets/UI/ui_wave11.png',        // 32
  'assets/UI/ui_wave12.png',        // 33
  'assets/UI/ui_wave13.png',        // 34
  'assets/UI/ui_wave14.png',        // 35
  'assets/UI/ui_wave15.png',        // 36
  'assets/UI/ui_wave16.png',        // 37
  'assets/UI/ui_wave17.png',        // 38
  'assets/UI/ui_wave18.png',        // 39
  'assets/UI/ui_wave19.png',        // 40
  'assets/UI/ui_wave20.png',        // 41
  'assets/UI/ui_wave21.png',        // 42
  'assets/UI/ui_wave22.png',        // 43
  'assets/UI/ui_wave23.png',        // 44
  'assets/UI/ui_wave24.png',        // 45
  'assets/UI/ui_wave25.png',        // 46
  'assets/fx_particle.png',       // 47
  'assets/UI/help.png',             // 48
  'assets/UI/help_over.png',          // 49
  'assets/UI/reset.png',              // 50
  'assets/UI/reset_over.png',           // 51
  'assets/objShadow.png',             // 52
  'assets/UI/start_gray.png',         // 53
  'assets/UI/pause_gray.png',         // 54
  'assets/UI/help_gray.png',          // 55
  'assets/UI/towerBack_gray.png',         // 57
];
var g_gaugeBack;
var g_gaugeFrames = [];
var g_iconBacks = [];
var g_icons = [];
var playerGauge;
var g_clock = 0;
var paused = false;
var pregame = true;
var g_resetSwitch = false;

//selected tower related global variables
var prevSelection;
var g_upgradeIcon;
var g_rangeIcon;
var g_life = 1;
var g_selectedIndex = 2;    //used to change icon
var g_TowerInfo;
var g_thingsToNotPick = [];
var g_cursorRange;
var overTower = false;
var changeShape = true;

//text related global variables
var g_canvasLib;
var g_canvas;
var g_paint;

//splash screen related global variables
var g_screenDelay = 5;
var g_splashScreenA;
var g_splashScreenB;
var g_splashState = "RUNNING";

//game related global variable
var world;

//particle related global variable
var g_particleSystem;