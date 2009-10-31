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
 * This function runs an SPT calculation to completion and asserts that the
 * validity of the SPT matches the expected result.
 *
 * @param {[[String]]} states A 2D array of members of States, representing
 *     the game grid.
 * @param {boolean} result Whether this grid of states should represent a
 *     valid game board w.r.t. the ShortestPathTree.
 * @return {ShortestPathTree} The ShortestPathTree, valid or not.
 */
function runAndVerify(states, result) {
  var rows = states.length;
  assertTrue(rows > 0);
  var cols = states[0].length;
  assertTrue(cols > 0);
  for (var row in rows) {
    assertEquals(states[row].length, cols);
  }
  var world = new MockWorld(rows, cols, states);
  var spt = new o3d.towerdefense.ShortestPathTree(world, false);
  spt.run();
  assertEquals(spt.isValid(), result);
  return spt;
}

/**
 * Test one simple legal grid.
 */
function testSimpleGrid0() {
  var states = [ // Due to the layout, each line here is a column.
    [States.ENTRANCE, States.OPEN, States.OPEN],
    [States.OPEN, States.OPEN, States.OPEN],
    [States.OPEN, States.OPEN, States.EXIT],
  ];
  var spt = runAndVerify(states, true);
  assertEquals(spt.grid[2][0].cost, 2);
}

/**
 * Test another simple legal grid.
 */
function testSimpleGrid1() {
  var states = [ // Due to the layout, each line here is a column.
    [States.ENTRANCE, States.EXIT, States.OPEN],
    [States.OPEN, States.OPEN, States.OPEN],
    [States.OPEN, States.OPEN, States.OPEN],
  ];
  var spt = runAndVerify(states, true);
  assertEquals(spt.grid[2][1].cost, 2);
}

/**
 * Test that it's legal to isolate an empty node.
 */
function testCutOffEmptyCorner() {
  var states = [ // Due to the layout, each line here is a column.
    [States.ENTRANCE, States.BLOCKED, States.OPEN],
    [States.OPEN, States.OPEN, States.BLOCKED],
    [States.BLOCKED, States.OPEN, States.EXIT],
  ];
  var spt = runAndVerify(states, true);
  assertEquals(spt.grid[0][0].cost, 4);
}

/**
 * Test that it's illegal to isolate a populated node.
 */
function testCutOffPopulatedCorner() {
  var states = [ // Due to the layout, each line here is a column.
    [States.ENTRANCE, States.BLOCKED, States.POPULATED],
    [States.OPEN, States.OPEN, States.BLOCKED],
    [States.BLOCKED, States.OPEN, States.EXIT],
  ];
  runAndVerify(states, false);
}

/**
 * Test that it's legal to have multiple entrances and exits.
 */
function testMultipleInAndOut() {
  var states = [ // Due to the layout, each line here is a column.
    [States.ENTRANCE, States.OPEN, States.EXIT],
    [States.OPEN, States.OPEN, States.OPEN],
    [States.EXIT, States.OPEN, States.ENTRANCE],
  ];
  var spt = runAndVerify(states, true);
  assertEquals(spt.grid[1][0].cost, 1);
}

/**
 * Test that it's illegal to block the entrance from the exit.
 */
function testBlocked() {
  var states = [ // Due to the layout, each line here is a column.
    [States.ENTRANCE, States.BLOCKED, States.OPEN],
    [States.OPEN, States.BLOCKED, States.OPEN],
    [States.OPEN, States.BLOCKED, States.EXIT],
  ];
  runAndVerify(states, false);
}

/**
 * Test that it's legal to partition the grid, as long as each entrance has an
 * exit it can reach.
 */
function testPartitioned() {
  var states = [ // Due to the layout, each line here is a column.
    [States.ENTRANCE, States.BLOCKED, States.ENTRANCE],
    [States.OPEN, States.BLOCKED, States.OPEN],
    [States.EXIT, States.BLOCKED, States.EXIT],
  ];
  runAndVerify(states, true);
}

/**
 * Test that it's illegal to partition the grid, if the entrances and exits
 * are separated.
 */
function testPartitionedBadly() {
  var states = [ // Due to the layout, each line here is a column.
    [States.ENTRANCE, States.OPEN, States.ENTRANCE],
    [States.BLOCKED, States.BLOCKED, States.BLOCKED],
    [States.EXIT, States.OPEN, States.EXIT],
  ];
  runAndVerify(states, false);
}

/**
 * MockWorld mocks out the World class for the ShortestPathTree tests.
 *
 * @constructor
 * @param {integer} cols The width of the world game grid.
 * @param {integer} rows The height of the world game grid.
 * @param {[[String]]} nodeStates The state of each node, as a 2D array.
 */
function MockWorld(cols, rows, nodeStates) {
  this.cols = cols;
  this.rows = rows;
  this.grid = [];
  for (var i = 0; i < cols; ++i) {
    this.grid[i] = [];
    for (var j = 0; j < rows; ++j) {
      var node = new GridNode(this, i, j);
      node.state = nodeStates[i][j];
      this.grid[i][j] = node;
    }
  }
}

/**
 * Gets the node at row i, column j.
 *
 * @param {integer} i The row.
 * @param {integer} j The column.
 * @return {GridNode} The node at that location.
 */
MockWorld.prototype.getNode = function(i, j) {
  assertTrue(i >= 0 && i < this.cols);
  assertTrue(j >= 0 && j < this.rows);
  return this.grid[i][j];
};

/**
 * Tells whether the node at (i, j) is blocked.
 *
 * @param {integer} i The row.
 * @param {integer} j The column.
 * @return {boolean} Whether the node specified is in a blocked state.
 */
MockWorld.prototype.isBlocked = function(i, j) {
  return World.isABlockedState(this.getNode(i, j).state);
};
