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
 * @fileoverview This file contains all the global [shared] constants for the
 * tower defense game.  It should work in any browser.
 */

/**
 * Set up a namespace for all the o3d code, if it's not already there.
 * @type {Object}
 */
var o3d = o3d || {};

/**
 * Set up a namespace for the tower defense code, if it's not already there.
 * @type {Object}
 */
o3d.towerdefense = o3d.towerdefense || {};

/**
 * How long you have between the beginnings of waves.
 * @type {number}
 */
O3D_TD_SECONDS_PER_WAVE = 45;

/**
 * How many hit points you have at the start of the game.
 * @type {number}
 */
O3D_TD_INIT_HIT_POINTS = 10;

/**
 * How much money you have at the start of the game.
 * @type {number}
 */
O3D_TD_INIT_MONEY = 50;

/**
 * Various constants that control the sizes and placements of game objects.
 * @type {number}
 */
O3D_TD_TOWER_DIAM = 1.0;
O3D_TD_TOWER_DEPTH = 1.0;
O3D_TD_CREEP_DIAM = 1.0;
O3D_TD_CREEP_DEPTH = 1.0;
O3D_TD_MISSILE_DIAM = 0.5;
O3D_TD_MISSILE_DEPTH = 1;
O3D_TD_OBJECT_HEIGHT = 2;
O3D_TD_OBJECT_DIAM = 2;
O3D_TD_CURSOR_ELEVATION = 1.8;
O3D_TD_FLYING_K = 4;
O3D_TD_I_MAX = 36;
O3D_TD_J_MAX = 36;
O3D_TD_LINE_K = 0.5;
O3D_TD_GRID_K = 0;
O3D_TD_CURSOR_SCALE = 2;
O3D_TD_CURSOR_DEPTH = 1.0;
O3D_TD_CURSOR_DIAM = 1.0;

/**
 * Offsets to account for where the walls are.
 * @type {number}
 */
O3D_TD_CURSOR_MIN_I_OFFSET = 2;
O3D_TD_CURSOR_MIN_J_OFFSET = 1;
O3D_TD_CURSOR_MAX_I_OFFSET = 2;
O3D_TD_CURSOR_MAX_J_OFFSET = 1;

/**
 * Frequently-used constants that need not be recomputed each time.
 * @type {number}
 */
O3D_TD_SQRT_2 = Math.sqrt(2);
O3D_TD_PI_OVER_TWO = Math.PI / 2;
O3D_TD_TWO_PI = 2 * Math.PI;
O3D_TD_THREE_PI_OVER_TWO = 3 * Math.PI / 2;
