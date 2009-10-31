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
 * @fileoverview This file contains drawing utility functions that create
 * viewable objects in a o3d plugin. It's been written for Firefox 2, but
 * should be easy to port to other browsers.
 */
o3djs.require('o3djs.io');

var Drawing = new Object();

var Shapes = {  // Should this be inside Drawing?
  RECT : 'RECT',
  BOX : 'BOX',
  PYRAMID : 'PYRAMID',
  OCT : 'OCT',
  SPHERE : 'SPHERE',

  OOZIE_IDLE : 'OOZIE_IDLE',
  OOZIE_IDLE_BASE : 'OOZIE_IDLE_BASE',
  OOZIE_BUILD : 'OOZIE_BUILD',
  OOZIE_BUILD_BASE : 'OOZIE_BUILD_BASE',
  OOZIE_FIRE : 'OOZIE_FIRE',
  OOZIE_FIRE_BASE : 'OOZIE_FIRE_BASE',
  OOZIE_UPGRADE01_IDLE : 'OOZIE_UPGRADE01_IDLE',
  OOZIE_UPGRADE01_IDLE_BASE : 'OOZIE_UPGRADE01_IDLE_BASE',
  OOZIE_UPGRADE01 : 'OOZIE_UPGRADE01',
  OOZIE_UPGRADE01_BASE : 'OOZIE_UPGRADE01_BASE',
  OOZIE_UPGRADE01_FIRE : 'OOZIE_UPGRADE01_FIRE',
  OOZIE_UPGRADE01_FIRE_BASE : 'OOZIE_UPGRADE01_FIRE_BASE',
  OOZIE_UPGRADE02 : 'OOZIE_UPGRADE02',
  OOZIE_UPGRADE02_BASE : 'OOZIE_UPGRADE02_BASE',
  OOZIE_UPGRADE02_IDLE : 'OOZIE_UPGRADE02_IDLE',
  OOZIE_UPGRADE02_IDLE_BASE : 'OOZIE_UPGRADE02_IDLE_BASE',
  OOZIE_UPGRADE02_FIRE : 'OOZIE_UPGRADE02_FIRE',
  OOZIE_UPGRADE02_FIRE_BASE : 'OOZIE_UPGRADE02_FIRE_BASE',

  BALL_AMMO : 'BALL_AMMO',
  BALL_IDLE : 'BALL_IDLE',
  BALL_IDLE_BASE : 'BALL_IDLE_BASE',
  BALL_IDLE_GRAY : 'BALL_IDLE_GRAY',
  BALL_IDLE_GRAY_BASE : 'BALL_IDLE_BASE_GRAY',
  BALL_BUILD : 'BALL_BUILD',
  BALL_BUILD_BASE : 'BALL_BUILD_BASE',
  BALL_FIRE : 'BALL_FIRE',
  BALL_FIRE_BASE : 'BALL_FIRE_BASE',
  BALL_UPGRADE01_IDLE : 'BALL_UPGRADE01_IDLE',
  BALL_UPGRADE01_IDLE_BASE : 'BALL_UPGRADE01_IDLE_BASE',
  BALL_UPGRADE01 : 'BALL_UPGRADE01',
  BALL_UPGRADE01_BASE : 'BALL_UPGRADE01_BASE',
  BALL_UPGRADE01_FIRE : 'BALL_UPGRADE01_FIRE',
  BALL_UPGRADE01_FIRE_BASE : 'BALL_UPGRADE01_FIRE_BASE',
  BALL_UPGRADE02 : 'BALL_UPGRADE02',
  BALL_UPGRADE02_BASE : 'BALL_UPGRADE02_BASE',
  BALL_UPGRADE02_IDLE : 'BALL_UPGRADE02_IDLE',
  BALL_UPGRADE02_IDLE_BASE : 'BALL_UPGRADE02_IDLE_BASE',
  BALL_UPGRADE02_FIRE : 'BALL_UPGRADE02_FIRE',
  BALL_UPGRADE02_FIRE_BASE : 'BALL_UPGRADE02_FIRE_BASE',

  LAUNCHER_AMMO : 'LAUNCHER_AMMO',
  LAUNCHER_IDLE : 'LAUNCHER_IDLE',
  LAUNCHER_IDLE_BASE : 'LAUNCHER_IDLE_BASE',
  LAUNCHER_IDLE_GRAY : 'LAUNCHER_IDLE_GRAY',
  LAUNCHER_IDLE_GRAY_BASE : 'LAUNCHER_IDLE_GRAY_BASE',
  LAUNCHER_BUILD : 'LAUNCHER_BUILD',
  LAUNCHER_BUILD_BASE : 'LAUNCHER_BUILD_BASE',
  LAUNCHER_FIRE : 'LAUNCHER_FIRE',
  LAUNCHER_FIRE_BASE : 'LAUNCHER_FIRE_BASE',
  LAUNCHER_UPGRADE01_IDLE : 'LAUNCHER_UPGRADE01_IDLE',
  LAUNCHER_UPGRADE01_IDLE_BASE : 'LAUNCHER_UPGRADE01_IDLE_BASE',
  LAUNCHER_UPGRADE01 : 'LAUNCHER_UPGRADE01',
  LAUNCHER_UPGRADE01_BASE : 'LAUNCHER_UPGRADE01_BASE',
  LAUNCHER_UPGRADE01_FIRE : 'LAUNCHER_UPGRADE01_FIRE',
  LAUNCHER_UPGRADE01_FIRE_BASE : 'LAUNCHER_UPGRADE01_FIRE_BASE',
  LAUNCHER_UPGRADE02 : 'LAUNCHER_UPGRADE02',
  LAUNCHER_UPGRADE02_BASE : 'LAUNCHER_UPGRADE02_BASE',
  LAUNCHER_UPGRADE02_IDLE : 'LAUNCHER_UPGRADE02_IDLE',
  LAUNCHER_UPGRADE02_IDLE_BASE : 'LAUNCHER_UPGRADE02_IDLE_BASE',
  LAUNCHER_UPGRADE02_FIRE : 'LAUNCHER_UPGRADE02_FIRE',
  LAUNCHER_UPGRADE02_FIRE_BASE : 'LAUNCHER_UPGRADE02_FIRE_BASE',

  RANGE_SHAPE : 'RANGE_SHAPE',

  DINO_WALK : 'DINO_WALK',
  DINO_DEATH : 'DINO_DEATH',
  DINO_JUMP : 'DINO_JUMP',

  PRINCESS_WALK : 'PRINCESS_WALK',
  PRINCESS_DEATH : 'PRINCESS_DEATH',

  RACECAR_WALK : 'RACECAR_WALK',
  RACECAR_DEATH : 'RACECAR_DEATH',
  RACECAR_TURNLEFT : 'RACECAR_TURNLEFT',
  RACECAR_TURNRIGHT : 'RACECAR_TURNRIGHT',

  CURSOR1 : 'CURSOR1',
  CURSOR2 : 'CURSOR2',
  CURSOR3 : 'CURSOR3',
  CURSOR1BASE : 'CURSOR1BASE',
  CURSOR2BASE : 'CURSOR2BASE',
  CURSOR3BASE : 'CURSOR3BASE',

  CURSOR1GRAY : 'CURSOR1GRAY',
  CURSOR2GRAY : 'CURSOR2GRAY',
  CURSOR3GRAY : 'CURSOR3GRAY',
  CURSOR1GRAYBASE : 'CURSOR1GRAYBASE',
  CURSOR2GRAYBASE : 'CURSOR2GRAYBASE',
  CURSOR3GRAYBASE : 'CURSOR3GRAYBASE',

  ROBOT_WALK : 'ROBOT_WALK',
  ROBOT_DEATH : 'ROBOT_DEATH',

  UPGRADE_SHAPE : 'UPGRADE_SHAPE',
  OOZE_SHAPE : 'OOZE_SHAPE',

  GRID_BLOCK : 'GRID_BLOCK',
  GRID_BLOCK_OFF : 'GRID_BLOCK_OFF',
};

(function() {
  /**
   * makeColorArray is used to create a color array for use by functions in
   * drawnobj.
   * TODO: This is inefficient; it makes a huge array whether it's needed or
   * not, and needs to get made even bigger each time we define a new, larger
   * shape.  It should be adaptive, but cache the largest-ever array for later
   * use.
   */
  Drawing.makeColorArray = function(color) {
    var c = color;
    c = c.concat(c, c); // x3 for triangle
    c = c.concat(c); // x2 for square
    c = c.concat(c, c, c, c, c); // x6 for box
    // Now we need x32 for a one-iteration sphere [8->32 sides]
    c = c.concat(c, c, c, c, c, c, c);
    c = c.concat(c, c, c);
    return c;
  };

  Drawing.Colors = {
    BLOCKED: 'BLOCKED',
    HIGHLIGHTED: 'HIGHLIGHTED',
    ENTRANCE: 'ENTRANCE',
    EXIT: 'EXIT',
    REACHABLE: 'REACHABLE',
    DONE: 'DONE',
    BASIC_CREEP: 'BASIC_CREEP',
    FAST_CREEP: 'FAST_CREEP',
    FLYING_CREEP: 'FLYING_CREEP',
    JUMPING_CREEP: 'JUMPING_CREEP',
    BASIC_MISSILE: 'BASIC_MISSILE',
    ARC_MISSILE: 'ARC_MISSILE',
    ZAP_MISSILE: 'ZAP_MISSILE',
    CANNON_TOWER: 'CANNON_TOWER',
    CANNON_TOWER_UPGRADE: 'CANNON_TOWER_UPGRADE',
    FAST_TOWER: 'FAST_TOWER',
    FAST_TOWER_UPGRADE: 'FAST_TOWER_UPGRADE',
    HEAVY_TOWER: 'HEAVY_TOWER',
    HEAVY_TOWER_UPGRADE: 'HEAVY_TOWER_UPGRADE'
  };

  Drawing.colorArrays = {};
  Drawing.colorArrays[Drawing.Colors.BLOCKED] =
      Drawing.makeColorArray([0.2, 0.2, 0.1, 1]);
  Drawing.colorArrays[Drawing.Colors.HIGHLIGHTED] =
      Drawing.makeColorArray([0, 1, 0, 0.5]); //CURSOR COLOR
  Drawing.colorArrays[Drawing.Colors.ENTRANCE] =
      Drawing.makeColorArray([0, 0, 1, 1]);
  Drawing.colorArrays[Drawing.Colors.EXIT] =
      Drawing.makeColorArray([1, 0, 0, 1]);
  Drawing.colorArrays[Drawing.Colors.REACHABLE] =
      Drawing.makeColorArray([1, 1, 1, 1]);
  Drawing.colorArrays[Drawing.Colors.DONE] =
      Drawing.makeColorArray([0, 0, 0, 1]);
  Drawing.colorArrays[Drawing.Colors.BASIC_CREEP] =
      Drawing.makeColorArray([0.1, 0.4, 0.1, 1]);
  Drawing.colorArrays[Drawing.Colors.FAST_CREEP] =
      Drawing.makeColorArray([0.4, 0.3, 0.1, 1]);
  Drawing.colorArrays[Drawing.Colors.FLYING_CREEP] =
      Drawing.makeColorArray([0.1, 0.1, 0.4, 1]);
  Drawing.colorArrays[Drawing.Colors.JUMPING_CREEP] =
      Drawing.makeColorArray([0.7, 0.4, 0.2, 1]);
  Drawing.colorArrays[Drawing.Colors.BASIC_MISSILE] =
      Drawing.makeColorArray([1.0, 1.0, 0, 1]);
  Drawing.colorArrays[Drawing.Colors.ARC_MISSILE] =
      Drawing.makeColorArray([1.0, 1.0, 0, 1]);
  Drawing.colorArrays[Drawing.Colors.ZAP_MISSILE] =
      Drawing.makeColorArray([0, 1.0, 0, 1]);
  Drawing.colorArrays[Drawing.Colors.CANNON_TOWER] =
      Drawing.makeColorArray([0.3, 0.2, 0.3, 1]);
  Drawing.colorArrays[Drawing.Colors.CANNON_TOWER_UPGRADE] =
      Drawing.makeColorArray([0.5, 0.3, 0.5, 1]);
  Drawing.colorArrays[Drawing.Colors.FAST_TOWER] =
      Drawing.makeColorArray([0.1, 0.1, 0.05, 1]);
  Drawing.colorArrays[Drawing.Colors.FAST_TOWER_UPGRADE] =
      Drawing.makeColorArray([0.3, 0.3, 0.15, 1]);
  Drawing.colorArrays[Drawing.Colors.HEAVY_TOWER] =
      Drawing.makeColorArray([0.15, 0.3, 0.3, 1]);
  Drawing.colorArrays[Drawing.Colors.HEAVY_TOWER_UPGRADE] =
      Drawing.makeColorArray([0.25, 0.5, 0.5, 1]);

  /**
   * This function is used only to get the drawing color of permanent board
   * structures, not anything that changes during the game.
   *
   * @param {String} type which type of structure we're drawing
   */
  Drawing.getColorNameForState = function(type) {
    switch (type) {
      case States.BLOCKED:
        return Drawing.Colors.BLOCKED;
      case States.ENTRANCE:
        return Drawing.Colors.ENTRANCE;
      case States.EXIT:
        return Drawing.Colors.EXIT;
      default:
        assert(false);
    }
  };

  var textureField = "texture";

  /**
   * Creates a o3d Shape object for the given params, and stores it for
   * later use.
   * Exactly one of color and url should be non-null.
   * TODO: Allow the use of more than one texture per shape.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {String} shape the name of the shape we're creating
   * @param {String} color the name of the color array to use, from
   * @param {String} url the url of a texture, or null
   */
  Drawing.setupShape = function(client, shape, color, url) {
  assert((color == null) != (url == null));
    var index = client.index;
    Drawing.ShapeCache = Drawing.ShapeCache || [];
    Drawing.ShapeCache[index] = Drawing.ShapeCache[index] || {};
    Drawing.ShapeCache[index][shape] = Drawing.ShapeCache[index][shape] || {};
    var holder = Drawing.ShapeCache[index][shape];
    var field = color || url;
    assert(field);
    switch (shape) {
      case Shapes.RECT:
        vertsArray = unitSquareVertsArray;
        indicesArray = quadIndicesArray;
    holder[field] = drawShape(client, color, url, vertsArray, indicesArray);
        break;
      case Shapes.BOX:
        vertsArray = unitBoxVertsArray;
        indicesArray = boxIndicesArray;
    holder[field] = drawShape(client, color, url, vertsArray, indicesArray);
        break;
      case Shapes.PYRAMID:
        vertsArray = unitPyramidVertsArray;
        indicesArray = pyramidIndicesArray;
    holder[field] = drawShape(client, color, url, vertsArray, indicesArray);
        break;
      case Shapes.OCT:
        vertsArray = unitOctahedronVertsArray;
        indicesArray = octahedronIndicesArray;
    holder[field] = drawShape(client, color, url, vertsArray, indicesArray);
        break;
      case Shapes.SPHERE:
        vertsArray = unitSphereVertsArray;
        indicesArray = sphereIndicesArray;
    holder[field] = drawShape(client, color, url, vertsArray, indicesArray);
        break;

    case Shapes.BALL_AMMO:
      holder[field] = BALL_AMMO;
    break;
    case Shapes.BALL_BUILD:
    holder[field] = BALL.build;
    break;
    case Shapes.BALL_BUILD_BASE:
    holder[field] = BALL.buildbase;
    break;
    case Shapes.BALL_IDLE:
    holder[field] = BALL.idle;
    break;
    case Shapes.BALL_IDLE_BASE:
    holder[field] = BALL.idlebase;
    break;
    case Shapes.BALL_IDLE_GRAY:
    holder[field] = BALL.idlegray;
    break;
    case Shapes.BALL_IDLE_GRAY_BASE:
    holder[field] = BALL.idlegraybase;
    break;
    case Shapes.BALL_FIRE:
    holder[field] = BALL.fire;
    break;
    case Shapes.BALL_FIRE_BASE:
    holder[field] = BALL.firebase;
    break;
    case Shapes.BALL_UPGRADE01:
    holder[field] = BALL.upgrade01;
    break;
    case Shapes.BALL_UPGRADE01_BASE:
    holder[field] = BALL.upgrade01base;
    break;
    case Shapes.BALL_UPGRADE01_IDLE:
    holder[field] = BALL.upgrade01idle;
    break;
    case Shapes.BALL_UPGRADE01_IDLE_BASE:
    holder[field] = BALL.upgrade01idlebase;
    break;
    case Shapes.BALL_UPGRADE01_FIRE:
    holder[field] = BALL.upgrade01fire;
    break;
    case Shapes.BALL_UPGRADE01_FIRE_BASE:
    holder[field] = BALL.upgrade01firebase;
    break;
    case Shapes.BALL_UPGRADE02:
    holder[field] = BALL.upgrade02;
    break;
    case Shapes.BALL_UPGRADE02_BASE:
    holder[field] = BALL.upgrade02base;
    break;
    case Shapes.BALL_UPGRADE02_IDLE:
    holder[field] = BALL.upgrade02idle;
    break;
    case Shapes.BALL_UPGRADE02_IDLE_BASE:
    holder[field] = BALL.upgrade02idlebase;
    break;
    case Shapes.BALL_UPGRADE02_FIRE:
    holder[field] = BALL.upgrade02fire;
    break;
    case Shapes.BALL_UPGRADE02_FIRE_BASE:
    holder[field] = BALL.upgrade02firebase;
    break;

    case Shapes.LAUNCHER_AMMO:
      holder[field] = LAUNCHER_AMMO;
    break;
    case Shapes.LAUNCHER_BUILD:
    holder[field] = LAUNCHER.build;
    break;
    case Shapes.LAUNCHER_BUILD_BASE:
    holder[field] = LAUNCHER.buildbase;
    break;
    case Shapes.LAUNCHER_IDLE_GRAY:
    holder[field] = LAUNCHER.idlegray;
    break;
    case Shapes.LAUNCHER_IDLE_GRAY_BASE:
    holder[field] = LAUNCHER.idlegraybase;
    break;
    case Shapes.LAUNCHER_IDLE:
    holder[field] = LAUNCHER.idle;
    break;
    case Shapes.LAUNCHER_IDLE_BASE:
    holder[field] = LAUNCHER.idlebase;
    break;
    case Shapes.LAUNCHER_FIRE:
    holder[field] = LAUNCHER.fire;
    break;
    case Shapes.LAUNCHER_FIRE_BASE:
    holder[field] = LAUNCHER.firebase;
    break;
    case Shapes.LAUNCHER_UPGRADE01:
    holder[field] = LAUNCHER.upgrade01;
    break;
    case Shapes.LAUNCHER_UPGRADE01_BASE:
    holder[field] = LAUNCHER.upgrade01base;
    break;
    case Shapes.LAUNCHER_UPGRADE01_IDLE:
    holder[field] = LAUNCHER.upgrade01idle;
    break;
    case Shapes.LAUNCHER_UPGRADE01_IDLE_BASE:
    holder[field] = LAUNCHER.upgrade01idlebase;
    break;
    case Shapes.LAUNCHER_UPGRADE01_FIRE:
    holder[field] = LAUNCHER.upgrade01fire;
    break;
    case Shapes.LAUNCHER_UPGRADE01_FIRE_BASE:
    holder[field] = LAUNCHER.upgrade01firebase;
    break;
    case Shapes.LAUNCHER_UPGRADE02:
    holder[field] = LAUNCHER.upgrade02;
    break;
    case Shapes.LAUNCHER_UPGRADE02_BASE:
    holder[field] = LAUNCHER.upgrade02base;
    break;
    case Shapes.LAUNCHER_UPGRADE02_IDLE:
    holder[field] = LAUNCHER.upgrade02idle;
    break;
    case Shapes.LAUNCHER_UPGRADE02_IDLE_BASE:
    holder[field] = LAUNCHER.upgrade02idlebase;
    break;
    case Shapes.LAUNCHER_UPGRADE02_FIRE:
    holder[field] = LAUNCHER.upgrade02fire;
    break;
    case Shapes.LAUNCHER_UPGRADE02_FIRE_BASE:
    holder[field] = LAUNCHER.upgrade02firebase;
    break;

    case Shapes.OOZIE_BUILD:
    holder[field] = OOZIE.build;
    break;
    case Shapes.OOZIE_BUILD_BASE:
    holder[field] = OOZIE.buildbase;
    break;
    case Shapes.OOZIE_IDLE:
    holder[field] = OOZIE.idle;
    break;
    case Shapes.OOZIE_IDLE_BASE:
    holder[field] = OOZIE.idlebase;
    break;
    case Shapes.OOZIE_IDLE_GRAY:
    holder[field] = OOZIE.idlegray;
    break;
    case Shapes.OOZIE_IDLE_GRAY_BASE:
    holder[field] = OOZIE.idlegraybase;
    break;
    case Shapes.OOZIE_FIRE:
    holder[field] = OOZIE.fire;
    break;
    case Shapes.OOZIE_FIRE_BASE:
    holder[field] = OOZIE.firebase;
    break;
    case Shapes.OOZIE_UPGRADE01:
    holder[field] = OOZIE.upgrade01;
    break;
    case Shapes.OOZIE_UPGRADE01_BASE:
    holder[field] = OOZIE.upgrade01base;
    break;
    case Shapes.OOZIE_UPGRADE01_IDLE:
    holder[field] = OOZIE.upgrade01idle;
    break;
    case Shapes.OOZIE_UPGRADE01_IDLE_BASE:
    holder[field] = OOZIE.upgrade01idlebase;
    break;
    case Shapes.OOZIE_UPGRADE01_FIRE:
    holder[field] = OOZIE.upgrade01fire;
    break;
    case Shapes.OOZIE_UPGRADE01_FIRE_BASE:
    holder[field] = OOZIE.upgrade01firebase;
    break;
    case Shapes.OOZIE_UPGRADE02:
    holder[field] = OOZIE.upgrade02;
    break;
    case Shapes.OOZIE_UPGRADE02_BASE:
    holder[field] = OOZIE.upgrade02base;
    break;
    case Shapes.OOZIE_UPGRADE02_IDLE:
    holder[field] = OOZIE.upgrade02idle;
    break;
    case Shapes.OOZIE_UPGRADE02_IDLE_BASE:
    holder[field] = OOZIE.upgrade02idlebase;
    break;
    case Shapes.OOZIE_UPGRADE02_FIRE:
    holder[field] = OOZIE.upgrade02fire;
    break;
    case Shapes.OOZIE_UPGRADE02_FIRE_BASE:
    holder[field] = OOZIE.upgrade02firebase;
    break;


    case Shapes.DINO_WALK:
    holder[field] = DINO.walk;
    break;
    case Shapes.DINO_DEATH:
    holder[field] = DINO.death;
    break;
    case Shapes.DINO_JUMP:
    holder[field] = DINO.jump;
    break;

    case Shapes.PRINCESS_WALK:
    holder[field] = PRINCESS.walk;
    break;
    case Shapes.PRINCESS_DEATH:
    holder[field] = PRINCESS.death;
    break;

    case Shapes.RACECAR_WALK:
    holder[field] = CAR.walk;
    break;
    case Shapes.RACECAR_DEATH:
    holder[field] = CAR.death;
    break;
    case Shapes.RACECAR_TURNLEFT:
    holder[field] = CAR.turnleft;
    break;
    case Shapes.RACECAR_TURNRIGHT:
    holder[field] = CAR.turnright;
    break;

    case Shapes.ROBOT_WALK:
    holder[field] = ROBOT.walk;
    break;
    case Shapes.ROBOT_DEATH:
    holder[field] = ROBOT.death;
    break;

    case Shapes.OOZE_SHAPE:
      holder[field] = OOZE_SHAPE;
    break;
    case Shapes.UPGRADE_SHAPE:
      holder[field] = UPGRADE_SHAPE;
    break;
    case Shapes.RANGE_SHAPE:
    holder[field] = RANGE_SHAPE;
    break;
    case Shapes.GRID_BLOCK:
    holder[field] = GRID_BLOCK;
    break;
    case Shapes.GRID_BLOCK_OFF:
    holder[field] = GRID_BLOCK_OFF;
    break;

    case Shapes.CURSOR1:
    holder[field] = LAUNCHER.idle;
    break;
    case Shapes.CURSOR2:
      holder[field] = OOZIE.idle;
    break;
    case Shapes.CURSOR3:
      holder[field] = BALL.idle;
    break;

    case Shapes.CURSOR1BASE:
    holder[field] = LAUNCHER.idlebase;
    break;
    case Shapes.CURSOR2BASE:
      holder[field] = OOZIE.idlebase;
    break;
    case Shapes.CURSOR3BASE:
      holder[field] = BALL.idlebase;
    break;

    case Shapes.CURSOR1GRAY:
    holder[field] = LAUNCHER.idlegray;
    break;
    case Shapes.CURSOR2GRAY:
      holder[field] = OOZIE.idlegray;
    break;
    case Shapes.CURSOR3GRAY:
      holder[field] = BALL.idlegray;
    break;

    case Shapes.CURSOR1GRAYBASE:
    holder[field] = LAUNCHER.idlegraybase;
    break;
    case Shapes.CURSOR2GRAYBASE:
      holder[field] = OOZIE.idlegraybase;
    break;
    case Shapes.CURSOR3GRAYBASE:
      holder[field] = BALL.idlegraybase;
    break;

    default:
        assert(false);
        break;
    };
  };

  Drawing.getShape = function(client, shape, color, url) {
    return Drawing.ShapeCache[client.index][shape][color || url];
  };

  /**
   * This ties the shape to its transform and the world projection.
   *
   * @param {Client} client the o3d plugin wrapper
   * @param {o3d transform} transform the bottom transform for shape
   * @param {o3d shape} shape the shape we're drawing
   */
  Drawing.setupTransformParams = function(client, transform, shape) {
    transform.addShape(shape);
    shape.createParam('worldViewProjMatrix', 'WorldViewProjectionParamMatrix4');
  };

  // This is an octahedron of radius 0.5, centered on the origin in x-y-z space.

  var unitOctahedronVertsArray = [
      -0.5, 0.0, 0.0, // 0
      0.0, -0.5, 0.0, // 1
      0.0, 0.0, -0.5, // 2
      0.5, 0.0, 0.0, // 3
      0.0, 0.5, 0.0, // 4
      0.0, 0.0, 0.5 // 5
  ];

  var octahedronIndicesArray = [
      0, 1, 2,
      2, 1, 0,
      1, 2, 3,
      3, 2, 1,
      2, 3, 4,
      4, 3, 2,
      0, 2, 4,
      4, 2, 0,
      0, 1, 5,
      5, 1, 0,
      1, 5, 3,
      3, 5, 1,
      5, 3, 4,
      4, 3, 5,
      0, 5, 4,
      4, 5, 0
  ];

  // This is a unit [1x1] square centered on the origin in x-y space, but
  // resting on the z=0 plane.

  var unitSquareVertsArray = [
      -0.5 + 1, -0.5 + 1, 0, // 0
      -0.5 + 0, -0.5 + 1, 0, // 1
      -0.5 + 0, -0.5 + 0, 0, // 2
      -0.5 + 1, -0.5 + 0, 0 // 3
  ];

  var quadIndicesArray = [
    0, 1, 2, 2, 3, 0
  ];

  // This is a unit [1x1x1] pyramid centered on the origin in x-y space, but
  // resting on the z=0 plane.

  var unitPyramidVertsArray = [
      -0.5 + 0, -0.5 + 0, 0, // 0
      -0.5 + 1, -0.5 + 0, 0, // 1
      -0.5 + 0.5, -0.5 + 0.5, 1, // 2
      //-0.5 + 0, -0.5 + 0, 1, // 3
      -0.5 + 0, -0.5 + 1, 0, // 4
      -0.5 + 1, -0.5 + 1, 0 // 5
      //-0.5 + 1, -0.5 + 1, 1, // 6
      //-0.5 + 0, -0.5 + 1, 1, // 7
  ];

  var pyramidIndicesArray = [
      0, 1, 2, /*1, 2, 3,*/ // front
      0, 2, 1, /*1, 3, 2,*/ // frontb

      4, 3, 2, /*4, 7, 6,*/ // back
      4, 2, 3, /*4, 6, 7,*/ // backb

      3, 0, 2, /*0, 3, 7,*/ // left
      3, 2, 0, /*0, 7, 3,*/ // leftb

      1, 4, 2, /*5, 6, 2,*/ // right
      1, 2, 4, /*5, 2, 6,*/ // rightb

      3, 4, 0, 4, 1, 0, // bottom
      3, 0, 4, 4, 0, 1 // bottom2

      //6, 7, 2, 7, 3, 2,  // bottom
      //6, 2, 7, 7, 2, 3  // bottom2
  ];

  // This is a unit cube centered on the origin in x-y space, but resting on the
  // z=0 plane.
  var unitBoxVertsArray = [
      -0.5 + 0, -0.5 + 0, 0, // 0
      -0.5 + 1, -0.5 + 0, 0, // 1
      -0.5 + 1, -0.5 + 0, 1, // 2
      -0.5 + 0, -0.5 + 0, 1, // 3
      -0.5 + 0, -0.5 + 1, 0, // 4
      -0.5 + 1, -0.5 + 1, 0, // 5
      -0.5 + 1, -0.5 + 1, 1, // 6
      -0.5 + 0, -0.5 + 1, 1 // 7
  ];

  var boxIndicesArray = [
      0, 1, 3, 1, 2, 3, // front
      0, 3, 1, 1, 3, 2, // frontb

      5, 4, 6, 4, 7, 6, // back
      5, 6, 4, 4, 6, 7, // backb

      4, 0, 7, 0, 3, 7, // left
      4, 7, 0, 0, 7, 3, // leftb

      1, 5, 2, 5, 6, 2, // right
      1, 2, 5, 5, 2, 6, // rightb

      4, 5, 0, 5, 1, 0, // bottom
      4, 0, 5, 5, 0, 1, // bottom2

      6, 7, 2, 7, 3, 2,  // top
      6, 2, 7, 7, 2, 3  // top2
  ];

  function dotProdV(v0, v1) {
    return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
  }

  function addV(v0, v1) {
    return [v0[0] + v1[0], v0[1] + v1[1], v0[2] + v1[2]];
  }

  function scaleV(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
  }

  /**
   * Assumes the inputs are two vectors of identical length.
   * Produces a third vector that's of the same length, with a direction that's
   * the average of the inputs.
   */
  function bisectAngle(v0, v1) {
    var len = Math.sqrt(dotProdV(v0, v0));
    var nonNorm = addV(v0, v1);
    var newLen = Math.sqrt(dotProdV(nonNorm, nonNorm));
    return scaleV(nonNorm, len / newLen);
  }

  function getVertex(verts, index) {
    return [verts[index * 3 + 0], verts[index * 3 + 1], verts[index * 3 + 2]];
  }

  /**
   * Returns the index in outputVerts of the point that's the bisector of the
   * spherical curve from the vertex at i0 to the vertex at i1.  If that vertex
   * doesn't yet exist in our data structures, this creates it and adds it to
   * outputVerts.
   */
  function getBisectorIndex(outputVerts, newVertTable, i0, i1) {
    var i01;
    var s = i0 + '_' + i1;
    if (newVertTable.hasOwnProperty(s)) {
      i01 = newVertTable[s];
    } else {
      // Must create the new vertex and record its index [in both orders].
      var v = bisectAngle(getVertex(outputVerts, i0),
          getVertex(outputVerts, i1));
      i01 = newVertTable[i1 + '_' + i0] = newVertTable[s] =
          outputVerts.length / 3;
      outputVerts.push(v[0]);
      outputVerts.push(v[1]);
      outputVerts.push(v[2]);
    }
    return i01;
  }

  /**
   * Given a shape somewhere on the road from octahedron to sphere, break all
   * the triangles in 4 to make the sphere smoother.
   *
   * @param {[number]} verts an array of vertices
   * @param {[integer]} indices indices into the vertex array
   */
  function iterateToSphere(verts, indices) {
    var outputVerts = [].concat(verts);
    var outputIndices = [];
    var newVertTable = new Object();
    for (var i = 0; i < indices.length; i += 3) {
      var i0 = indices[i + 0];
      var i1 = indices[i + 1];
      var i2 = indices[i + 2];
      var i01 = getBisectorIndex(outputVerts, newVertTable, i0, i1);
      var i12 = getBisectorIndex(outputVerts, newVertTable, i1, i2);
      var i20 = getBisectorIndex(outputVerts, newVertTable, i2, i0);
      outputIndices = outputIndices.concat([i0, i01, i20]);
      outputIndices = outputIndices.concat([i01, i1, i12]);
      outputIndices = outputIndices.concat([i01, i12, i20]);
      outputIndices = outputIndices.concat([i20, i12, i2]);
    }
    return { verts: outputVerts, indices: outputIndices };
  }

  var unitSphereVertsArray;
  var sphereIndicesArray;

  function setupSphereData() {
    var next = iterateToSphere(unitOctahedronVertsArray,
        octahedronIndicesArray);
    unitSphereVertsArray = next.verts;
    sphereIndicesArray = next.indices;
  }

  setupSphereData();

  /**
   * Draws a shape described by the vertex and index set passed in.
   * Exactly one of color and url should be non-null.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {String} color the name of the color array to use, from
   * @param {String} url the url of a texture, or null
   * @param {[number]} verts an array of vertex coordinates
   * @param {[integer]} indices an array of indices into the verts array
   */
  function drawShape(client, color, url, verts, indices) {
  var shape_and_prim = createShapeBase(client, verts, indices);
  var shape = shape_and_prim.shape;
  var primitive = shape_and_prim.primitive;
  var vertBuffer = client.pack.createObject('VertexBuffer');
  var positionField = vertBuffer.createField('FloatField', 3);
  vertBuffer.set(verts);

  var indexBuffer = client.pack.createObject('IndexBuffer');
  indexBuffer.set(indices);

  primitive.streamBank.setVertexStream(client.o3d.Stream.POSITION, 0,
                     positionField, 0);
  primitive.indexBuffer = indexBuffer;

  var colorBuffer;
  if (color) {
    colorBuffer = client.pack.createObject('VertexBuffer');
    var colorField = colorBuffer.createField('FloatField', 4);
    colorBuffer.set(Drawing.colorArrays[color]);
    primitive.streamBank.setVertexStream(client.o3d.Stream.COLOR, 0,
                       colorField, 0);
  } else {
    assert(url);
    var texBuffer = client.pack.createObject('VertexBuffer');
    var texField = texBuffer.createField('FloatField', 2);
    texBuffer.set(rectTexArray);
    primitive.streamBank.setVertexStream(
      client.o3d.Stream.TEXCOORD,
      0,
      texField,
      0);
    primitive.material = client.textureMaterial;

    // Load our texture.  TODO: Support more than one texture at a time.
    // Currently we've just got the one textured material.
    var sampler_param = primitive.material.getParam('texSampler0');
    var sampler = client.pack.createObject('Sampler');
    sampler_param.value = sampler;

    o3djs.io.loadTexture(client.pack, url, function(texture, exception) {
      if (!exception) {
      texture = texture;
      } else {
      throw('Load texture file returned failure.');
      }
    });
  }
  shape.createDrawElements(client.pack, null);
    return shape;
  }

  // Used for texture-mapping rectangles.  TODO(ericu): Handle other shapes.
  var rectTexArray = [
    1, 1,
    0, 1,
    0, 0,
    1, 0
  ];

  /**
   * This draws a shape centered at (x, y), resting on z, with dimensions
   * w, h, d.  EXCEPT that octahedrons and spheres are centered at (x, y, z).
   * Note that i, j, k refer to game coordinates and x, y, z are drawing
   * coordinates.
   *
   * Exactly one of color and url should be non-null.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {String} shape which shape to create
   * @param {number} x the x-coordinate of the shape
   * @param {number} y the y-coordinate of the shape
   * @param {number} z the z-coordinate of the shape
   * @param {number} w the width [x extent] of the shape
   * @param {number} h the height [y extent] of the shape
   * @param {number} d the depth [z extent] of the shape
   * @param {String} color the name of the color array to use, from
   * @param {String} url the url of a texture, or null
   */
  function drawShapeWithOffset(client, shape, x, y, z, w, h, d, color, url) {

    var translate =
        client.pack.createObject('Transform');
    translate.localMatrix =
      client.math.matrix4.translation([x, y, z]);

    var rotZ = client.pack.createObject('Transform');

    var rotY = client.pack.createObject('Transform');

    var scale = client.pack.createObject('Transform');
    scale.localMatrix =
      client.math.matrix4.scaling([w, h, d]);

    scale.parent = rotY;
    rotY.parent = rotZ;
    rotZ.parent = translate;
    translate.parent = client.root;

    var shape = Drawing.getShape(client, shape, color, url);
    return {
      translate: translate,
      scale: scale,
      shape: shape,
      rotY: rotY,
      rotZ: rotZ
    };
  }

  function createShapeBase(client, verts, indices) {
    // First, create a shape and primitive to store our triangles.
    var shape = client.pack.createObject('Shape');
    var primitive = client.pack.createObject('Primitive');
    var streamBank = client.pack.createObject('StreamBank');
    primitive.owner = shape;
    primitive.streamBank = streamBank;

    // Apply our default effect to this shape. The effect tells the 3D hardware
    // which shader to use.
    primitive.material = client.defaultMaterial;

    // Now set some basic info about our shape. (Forgive the magic numbers...)
    // Our shape is made of triangles.
    primitive.primitiveType = client.o3d.Primitive.TRIANGLELIST;
    primitive.numberPrimitives = indices.length / 3;
    primitive.numberVertices = verts.length / 3;

    return {shape: shape, primitive: primitive};
  }

  /**
   * This draws a shape centered at (i, j), resting on k, with dimensions
   * di, dj, dk.  EXCEPT that octahedrons and spheres are centered at (i, j, k).
   * Note that i, j, k refer to game coordinates and x, y, z are drawing
   * coordinates.
   *
   * Exactly one of color and url should be non-null.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {World} world the game board on which we're drawing
   * @param {String} shape which shape to create
   * @param {number} i the i-coordinate of the shape
   * @param {number} j the j-coordinate of the shape
   * @param {number} k the k-coordinate of the shape
   * @param {number} di the width [i extent] of the shape
   * @param {number} dj the height [j extent] of the shape
   * @param {number} dk the depth [k extent] of the shape
   * @param {String} color the name of the color array to use, from
   * @param {String} url the url of a texture, or null
   */
  Drawing.drawShapeInGrid = function(client, world, shape, i, j, k,
      di, dj, dk, color, url) {
    var coords = world.gridToDrawingCoords(i, j, k);
    var x = coords[0];
    var y = coords[1];
    var z = coords[2];

    coords = world.gridToDrawingScale(di, dj, dk);
    var w = coords[0];
    var h = coords[1];
    var d = coords[2];
    return drawShapeWithOffset(client, shape, x, y, z, w, h, d, color, url);
  };

  /**
   * Used to reinitialize a shape that's being reused.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {World} world the game board on which we're drawing
   * @param {o3d transform} translate the translation transform
   * [which should be the top transform of this shape]
   * @param {o3d transform} scale the scale transform
   * @param {number} i the i-coordinate of the shape
   * @param {number} j the j-coordinate of the shape
   * @param {number} k the k-coordinate of the shape
   * @param {number} di the width [i extent] of the shape
   * @param {number} dj the height [j extent] of the shape
   * @param {number} dk the depth [k extent] of the shape
   */
  Drawing.reinitShapeParams = function(client, world, drawnObj, i, j, k,
      di, dj, dk) {
    var coords = world.gridToDrawingCoords(i, j, k);
    var x = coords[0];
    var y = coords[1];
    var z = coords[2];
    coords = world.gridToDrawingScale(di, dj, dk);
    var w = coords[0];
    var h = coords[1];
    var d = coords[2];
    drawnObj.translate.localMatrix =
      client.math.matrix4.translation([x, y, z]);
    drawnObj.scale.localMatrix =
      client.math.matrix4.scaling([w, h, d]);
    drawnObj.translate.visible = true;
    drawnObj.translate.parent = client.root;
  };

  /**
   * This changes the color of the object.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {o3d primitive} shape the shape we're re-coloring
   * @param {String} color the name of the color array to use, from
   */
  Drawing.setDrawingColor = function(client, primitive, color) {
    var colorBuffer = client.pack.createObject('VertexBuffer');
    var colorField = colorBuffer.createField('FloatField', 4);
    colorBuffer.set(Drawing.colorArrays[color]);
    assert(primitive);
    primitive.streamBank.setVertexStream(client.o3d.Stream.COLOR, 0,
                                         colorField, 0);
  };

  var LINE_DIAM = 0.1;
  /**
   * This draws a thin line from c0 to c1 in game-space coordinates.
   *
   * @param {Client} the wrapper around the o3d plugin
   * @param {World} world the game board on which we're drawing
   * @param {[number, number, number]} c0 [i, j, k] of one end of the line
   * @param {[number, number, number]} c1 [i, j, k] of other end of the line
   * @param {String} color the name of the color array to use, from
   */
  Drawing.drawLineInGrid = function(client, world, c0, c1, color) {
    var dI = c1[0] - c0[0];
    var dJ = c1[1] - c0[1];
    var dK = c1[2] - c0[2];
    assert (dI || dJ || dK);
    var dI2 = dI * dI;
    var dJ2 = dJ * dJ;
    var dK2 = dK * dK;
    var dIJK = Math.sqrt(dI2 + dJ2 + dK2);
    var tuple = Drawing.drawShapeInGrid(
        client,
        world,
        Shapes.BOX,
        c0[0],
        c0[1],
        c0[2],
        LINE_DIAM,
        LINE_DIAM,
        dIJK,
        color);

    var translate = tuple.translate;
    var rotZ = tuple.rotZ;
    var rotY = tuple.rotY;
    var scale = tuple.scale;
    var shape = tuple.shape;
    Drawing.setupTransformParams(client, scale, shape);

    var theta;

    var dIJ = Math.sqrt(dI2 + dJ2);
    if (!dK) {
      theta = Math.PI / 2;
    } else {
      theta = Math.atan2(dIJ, dK);
    }
    rotY.localMatrix = client.math.matrix4.rotationY(theta);

    if (!dI) {
      if (dJ < 0) {
        theta = -Math.PI / 2;
      } else {
        theta = Math.PI / 2;
      }
    } else {
      theta = Math.atan2(dJ, dI);
    }
    rotZ.localMatrix = client.math.matrix4.rotationZ(theta);
    return tuple;
  };

}) ();
