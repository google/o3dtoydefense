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
 * @fileoverview This file contains the ShortestPathTree and SptState classes,
 * which are used for shortest-path-tree computations.  It's not quite a
 * stand-alone SPT implementation, as it assumes certain properties of the
 * underlying nodes that are game-specific [see all references to the world
 * object and POPULATED nodes, for starters].
 *
 * A shortest-path tree is valid if all entrance nodes and all populated nodes
 * are connected to exit nodes.  That is, any creeps on the board have a way off
 * it, and any creeps that will appear later at the entrance nodes do too.
 * Since we allow for multiple exit nodes, it's not truly a tree in all cases
 * [it can have multiple roots], but it's Dijkstra's Algorithm either way.
 */

/**
 * This class abstracts the shortest path tree's state.  It's initially an
 * in-progress computation; use this.run or repeated calls to this.step to
 * complete it.  When this.complete is true, it's done, and you should check
 * this.valid to see if the tree was fully-connected and legal.
 *
 * @constructor
 * @param {World} world The world holding the playing field on which to compute.
 * @param {boolean} drawSpt Whether to draw the lines of the SPT.
 */
o3d.towerdefense.ShortestPathTree = function(world, drawSpt) {
  /**
   * The game world on which we're to run our calculation.
   * @private
   * @type {World}
   */
  this.world_ = world;

  /**
   * The width of the game world, cached for convenience.
   * @private
   * @type {number}
   */
  this.cols_ = world.cols;

  /**
   * The height of the game world, cached for convenience.
   * @private
   * @type {number}
   */
  this.rows_ = world.rows;

  /**
   * A debugging flag: whether or not to draw the lines of the SPT on-screen.
   * @private
   * @type {boolean}
   */
  this.drawSpt = drawSpt;

  /**
   * Whether the calculation has completed.
   * @type {boolean}
   */
  this.complete = false;

  /**
   * The set of nodes known to be reachable from, but not yet in, the tree.
   * @private
   * @type {Array}
   */
  this.reachableSet_ = new o3d.towerdefense.HeapPriorityQueue();

  /**
   * The set of nodes containing creeps; these must have a path to the exit.
   * @private
   * @type {Array}
   */
  this.populatedNodes_ = [];

  /**
   * The set of entrance nodes; these must have a path to the exit.
   * @private
   * @type {Array}
   */
  this.entranceNodes_ = [];

  var startingSptNodes = [];
  this.grid = [];
  for (var i = 0; i < this.cols_; ++i) {
    this.grid[i] = [];
    for (var j = 0; j < this.rows_; ++j) {
      var gridNode = this.world_.getNode(i, j);
      var isExit = gridNode.state == States.EXIT;
      var sptNode = new o3d.towerdefense.SptState(i, j, isExit,
          isExit ? this.States.DONE : this.States.INIT);
      if (isExit) {
        startingSptNodes.push(sptNode);
      } else if (gridNode.state == States.POPULATED) {
        this.populatedNodes_.push(sptNode);
      } else if (gridNode.state == States.ENTRANCE) {
        this.entranceNodes_.push(sptNode);
      }
      if (World.isABlockedState(gridNode.state)) {
        sptNode.dI = 0;
        sptNode.dJ = 0;
        sptNode.state = this.States.DONE;
        sptNode.cost = Number.POSITIVE_INFINITY;
      }
      this.grid[i][j] = sptNode;
    }
  }
  for (var gridNode in startingSptNodes) {
    this.addToTree(startingSptNodes[gridNode]);
  }

  /**
   * Whether the object has been initialized, but not completed.
   * @type {boolean}
   */
  this.setUp = true;
};

/**
 * SptState holds the computation state of a single node of the shortest-path
 * tree.
 *
 * @constructor
 * @param {number} i The column [zero-based] of the node.
 * @param {number} j The row [zero-based] of the node.
 * @param {boolean} inSet Whether the node has been connected to the tree
 *     rooted at the exit node yet.
 * @param {number} state The initial state of the node, from
 *     o3d.towerdefense.ShortestPathTree.prototype.States.
 */
o3d.towerdefense.SptState = function(i, j, inSet, state) {
  /**
   * The column of the location represented by this object.
   * @type {number}
   */
  this.i = i;
  /**
   * The row of the location represented by this object.
   * @type {number}
   */
  this.j = j;
  /**
   * The set of visible lines used in debugging this code, if any.
   * @type {Array}
   */
  this.lines = [];
  if (inSet) {
    this.dI = 0;
    this.dJ = 0;
    this.cost = 0;
    this.state = state;
  } else {
    this.dI = null;
    this.dJ = null;
    this.cost = Number.POSITIVE_INFINITY;
    this.state = state;
  }
};

/**
 * These are the legal states of a ShortestPathTree node.
 * @enum {number}
 */
o3d.towerdefense.ShortestPathTree.prototype.States = {
  INIT : 0, // Initialized.
  REACHABLE : 1, // Reachable from the tree, but not yet added to it.
  DONE : 2 // In the tree.
};

/**
 * Adds a node to the shortest-path tree directly.  This is only done for the
 * exit nodes at the start, which are in the tree without having to have any
 * parent.  Later, as we process nodes, we add their neighbors.
 *
 * @param {o3d.towerdefense.SptState} sptNode The node to add.
 */
o3d.towerdefense.ShortestPathTree.prototype.addToTree =
    function(sptNode) {
  var iMin = Math.max(sptNode.i - 1, 0);
  var jMin = Math.max(sptNode.j - 1, 0);
  var iMax = Math.min(sptNode.i + 1, this.cols_ - 1);
  var jMax = Math.min(sptNode.j + 1, this.rows_ - 1);

  // Add all neighbors to the reachable set.
  for (var i = iMin; i <= iMax; ++i) {
    for (var j = jMin; j <= jMax; ++j) {
      if (i == sptNode.i && j == sptNode.j) {
        continue;
      }
      var neighbor = this.grid[i][j];
      if (neighbor.state != this.States.DONE) {
        var dI = sptNode.i - i;
        var dJ = sptNode.j - j;
        var cost = sptNode.cost;
        if (!dI == !dJ) {
          // Diagonal move--make sure that nearby blocks don't get in the way.
          if (this.world_.isBlocked(sptNode.i, j) ||
              this.world_.isBlocked(i, sptNode.j)) {
            continue;
          }
          cost += O3D_TD_SQRT_2;
        } else {
          cost += 1;
        }
        var wasInit = neighbor.state == this.States.INIT;
        if (wasInit || neighbor.cost > cost) {
          neighbor.cost = cost;
          neighbor.state = this.States.REACHABLE;
          neighbor.dI = dI;
          neighbor.dJ = dJ;
          if (wasInit) {
            this.reachableSet_.push(neighbor, neighbor.cost);
          } else {
            this.reachableSet_.rehash(neighbor, neighbor.cost);
          }
          if (this.drawSpt) {
            if (neighbor.lines[0]) { // Get rid of the old line.
              for (var index in neighbor.lines) {
                neighbor.lines[index].makeItGoAway();
              }
            }
            for (var index in clients) {
              var c = clients[index];
              var d = DrawnObj.newLine(
                  c,
                  this.world_,
                  [i, j, O3D_TD_LINE_K],
                  [i + dI, j + dJ, O3D_TD_LINE_K],
                  Drawing.Colors.REACHABLE);
        g_thingsToNotPick[d.clientId] = true;
              neighbor.lines[index] = d;
            }
          }
        }
      }
    }
  }
  if (this.drawSpt) {
    if (sptNode.lines[0]) { // Get rid of the old line.
      for (var index in sptNode.lines) {
        sptNode.lines[index].makeItGoAway();
      }
    }
    if (sptNode.dI || sptNode.dJ) { // Only draw non-exit nodes.
      for (var index in clients) {
        var c = clients[index];
        var d = DrawnObj.newLine(
            c,
            this.world_,
            [sptNode.i, sptNode.j, O3D_TD_LINE_K],
            [sptNode.i + sptNode.dI, sptNode.j + sptNode.dJ, O3D_TD_LINE_K],
            Drawing.Colors.DONE);
    g_thingsToNotPick[d.clientId] = true;

        sptNode.lines[index] = d;
      }
    }
  }
  sptNode.state = this.States.DONE;
  if (this.setUp && this.reachableSet_.empty()) {
    this.setUp = false;
    this.complete = true;
  }
};

/**
 * Updates the display of SPT lines on the game board, either by drawing their
 * current state or by erasing them.
 *
 * @param {boolean} on Whether to display lines.
 */
o3d.towerdefense.ShortestPathTree.prototype.updateDisplay =
    function(on) {
  for (var i = 0; i < this.cols_; ++i) {
    for (var j = 0; j < this.rows_; ++j) {
      var node = this.grid[i][j];
      if (node.lines[0]) { // Get rid of the old line.
        for (var index in node.lines) {
          node.lines[index].makeItGoAway();
          node.lines[index] = null;
        }
      }
    }
  }
};

/**
 * This is a callback function, to be attached to a UI checkbox that toggles
 * display of the ShortestPathTree's debugging lines.
 */
o3d.towerdefense.ShortestPathTree.prototype.onToggleDisplay =
    function() {
  this.updateDisplay();
};

/**
 * Tells whether the full calculation of this shortest path tree resulted in a
 * tree that reached all entrance nodes and all nodes in the populated state.
 *
 * @return {boolean} Whether we have a valid solution.
 */
o3d.towerdefense.ShortestPathTree.prototype.isValid = function() {
  if (!this.complete) {
    return false;
  }
  for (var index in this.populatedNodes_) {
    var node = this.populatedNodes_[index];
    if (node.state != this.States.DONE) {
      return false;
    }
  }
  for (var index in this.entranceNodes_) {
    var node = this.entranceNodes_[index];
    if (node.state != this.States.DONE) {
      return false;
    }
  }
  return true;
};

/**
 * Executes a single iteration of the calculation, adding a single reachable
 * node to the tree, with all its ramifications.
 */
o3d.towerdefense.ShortestPathTree.prototype.step = function() {
  if (!this.setUp) {
    if (!this.complete) {
      throw Error('The tree is neither initialized or complete!');
    }
    return; // Already done.
  }
  if (this.reachableSet_.empty()) {
    throw Error('No reachable nodes, yet we\'re not complete!');
  }
  var node = this.reachableSet_.pop();
  this.addToTree(node);
};

/**
 * Executes the entire calculation through completion.
 */
o3d.towerdefense.ShortestPathTree.prototype.run = function() {
  if (!this.setUp) {
    if (!this.complete) {
      throw Error('The tree is neither initialized or complete!');
    }
    return; // Already done.
  }
  while (!this.complete) {
    this.step();
  }
};

/**
 * Dumps the ShortestPathTree's state to the debugging console as text.
 */
o3d.towerdefense.ShortestPathTree.prototype.dumpSptGrid = function() {
  o3d.towerdefense._debug('Grid of costs:');
  for (var j = this.rows_ - 1; j >= 0; --j) {
    var s = '';
    for (var i = 0; i < this.cols_; ++i) {
      s += this.grid[i][j].cost + ' ';
    }
    o3d.towerdefense._debug(s);
  }
  o3d.towerdefense._debug('');
};
