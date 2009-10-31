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
 * @fileoverview This file contains the GridNode class.  It's been written for
 * Firefox 2, but should be easy to port to other browsers.
 */

/**
 * The GridNode class represents a single location on the game board.  It keeps
 * track of what's on it [creeps, walls, etc.] and which Towers can hit it.
 *
 * @constructor
 * @param {World} world the world in which this node lives
 * @param {integer} i the column coordinate of this node [zero-based]
 * @param {integer} j the row coordinate of this node [zero-based]
 */
function GridNode(world, i, j) {
  this.state = States.OPEN;
  this.guid = guidForType('node');
  this.creepGuids = new Object();
  this.creepCount = 0;
  this.flyingCreepCount = 0;
  this.targetingTowerGuids = new Object();
  this.objGuid = null;
  this.i = i;
  this.j = j;
  return this;
}

(function() {
  /**
   * Used for init and adding walls.  For adding creeps, this shouldn't be
   * called directly.
   *
   * @param {String} state the state [from world.js: States]
   */
  GridNode.prototype.setState = function(state) {
    this.state = state;
  };

  /**
   * Used to register a creep with its creation node.  Don't use this to move a
   * creep between grid nodes.
   *
   * @param {Creep} creep the creep on its way in
   */
  GridNode.prototype.addCreep = function(creep) {
    assert(this.state == States.OPEN || this.state == States.POPULATED ||
        this.state == States.ENTRANCE || creep.flying);
    assert(!this.creepGuids.hasOwnProperty(creep.guid));
    this.creepGuids[creep.guid] = true;
    if (creep.flying) {
      ++this.flyingCreepCount;
    } else {
      ++this.creepCount;
      if (this.state == States.OPEN) { // Don't change ENTRANCEs because of me.
        this.setState(States.POPULATED);
      }
    }
    for (guid in this.targetingTowerGuids) {
      world.towersByGuid[guid].registerTargetCreep(creep);
    }
  };

  /**
   * Used to remove a creep's registration when it's destroyed or exits the game
   * board.  Don't use this to move a creep between grid nodes.
   *
   * @param {Creep} creep the creep on its way out
   */
  GridNode.prototype.removeCreep = function(creep) {
    assert(this.creepGuids.hasOwnProperty(creep.guid));
    delete this.creepGuids[creep.guid];
    if (creep.flying) {
      assert(this.flyingCreepCount > 0);
      --this.flyingCreepCount;
    } else {
      assert(this.creepCount > 0);
      --this.creepCount;
      if (this.state == States.POPULATED && !this.creepCount) {
        this.setState(States.OPEN);
      }
    }
    for (guid in this.targetingTowerGuids) {
      world.towersByGuid[guid].unregisterTargetCreep(creep);
    }
  };

  /**
   * Used to move a creep between grid nodes as it travels across the board.
   * Don't use addCreep and removeCreep, as they're just for creation and
   * destruction of creeps.  This only affects creep registration; it doesn't do
   * any physical relocation.
   *
   * @param {GridNode} fromNode the node where the creep currently is
   * @param {GridNode} toNode the node where you want the creep to be registered
   * @param {Creep} the creep to re-register
   */
  GridNode.MoveCreepBetweenGridNodes = function(fromNode, toNode, creep) {
    if (creep.flying) {
      assert(fromNode.flyingCreepCount > 0);
    } else {
      assert(fromNode.creepCount > 0);
    }
    assert(fromNode.creepGuids.hasOwnProperty(creep.guid));
    assert(toNode.state == States.OPEN || toNode.state == States.POPULATED ||
        toNode.state == States.ENTRANCE || creep.flying);
    assert(!toNode.creepGuids.hasOwnProperty(creep.guid));

    delete fromNode.creepGuids[creep.guid];
    if (creep.flying) {
      --fromNode.flyingCreepCount;
      ++toNode.flyingCreepCount;
    } else {
      --fromNode.creepCount;
      if (fromNode.state == States.POPULATED && !fromNode.creepCount) {
        fromNode.setState(States.OPEN);
      }
      ++toNode.creepCount;
      if (toNode.state == States.OPEN) {
        // Don't change ENTRANCEs just because of me.
        toNode.setState(States.POPULATED);
      }
    }

    toNode.creepGuids[creep.guid] = true;

  for (guid in fromNode.targetingTowerGuids) {
    if (!toNode.targetingTowerGuids.hasOwnProperty(guid)) {
    world.towersByGuid[guid].unregisterTargetCreep(creep);
    }
  }
  for (guid in toNode.targetingTowerGuids) {
    if (!fromNode.targetingTowerGuids.hasOwnProperty(guid)) {
    world.towersByGuid[guid].registerTargetCreep(creep);
    }
  }
  };

  GridNode.prototype.addTower = function(tower) {
    this.addObject(tower, States.TOWER);
  };

  /**
   * Used to add any non-creep object that needs to be registered with a node
   * [towers, entrances, exits, blocking walls].
   *
   * @param {Object} obj the object to add; it must have a guid field
   * @param {String} state from world.js: States
   */
  GridNode.prototype.addObject = function(obj, state) {
    assert(this.state == States.OPEN);
    assert(!this.objGuid);
    assert(!this.creepCount);
    this.objGuid = obj.guid;
    this.setState(state);
    assert(this.state != States.OPEN);
  };

  /**
   * Used to remove any non-creep object from a node.
   */
  GridNode.prototype.removeObject = function(obj) {
    assert(this.objGuid == obj.guid);
    assert(!this.creepCount);
    this.objGuid = null;
    this.setState(States.OPEN);
  };

  /**
   * Here just for symmetry; clearly you can just call removeObject on a tower.
   */
  GridNode.prototype.removeTower = function(tower) {
    this.removeObject(tower);
  };

  /**
   * Tells a grid node of a tower that is in range to shoot at creeps located in
   * that node.  Returns an array of guids of all local creeps, so that the
   * tower can choose a target from among them.
   *
   * @param {Tower} tower the tower being registered
   */
  GridNode.prototype.registerTargetingTower = function(tower) {
    assert(!this.targetingTowerGuids.hasOwnProperty(tower.guid));
    this.targetingTowerGuids[tower.guid] = true;
    return this.creepGuids;
  };

  /**
   * Removes a tower registration; generally only used when the tower is being
   * deleted.
   *
   * @param {Tower} tower the tower being registered
   */
  GridNode.prototype.unregisterTargetingTower = function(tower) {
    assert(this.targetingTowerGuids.hasOwnProperty(tower.guid));
    delete this.targetingTowerGuids[tower.guid];
  };

}) ();
