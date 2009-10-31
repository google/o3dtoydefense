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
 * @fileoverview This file contains the HeapPriorityQueue class.
 */

/**
 * HeapPriorityQueue is a priority queue implemented using a heap living in an
 * array of fixed size.  Elements are sorted based on a field called "cost",
 * with the minimum-cost element being the one retured by pop().  The caller is
 * required to call rehash() manually for any stored element whose value has
 * changed.
 *
 * @constructor
 * @param {number} size The capacity of the heap.
 */
o3d.towerdefense.HeapPriorityQueue = function(size) {
  /**
   * The array that's the underlying storage for the queue.
   * @private
   * @type {Array}
   */
  this.elts_ = [];
  /**
   * The costs associated with the elements in the queue.
   * @private
   * @type {Array}
   */
  this.costs_ = [];
  /**
   * The number of elements currently stored in the queue.
   * @type {number}
   */
  this.size_ = 0;
};

/**
 * Bubbles a possibly-too-low-in-the-tree element all the way up to its proper
 * place, swapping as it goes.  This is a private utility function to maintain
 * heap invariants.
 *
 * @param {Object} elt The current element to check.
 * @param {number} cost The value by which to order elt.
 * @param {number} index The index where elt [or an obsolete version of elt]
 *     is currently stored.
 * @private
 */
o3d.towerdefense.HeapPriorityQueue.prototype.bubbleUp_ =
    function(elt, cost, index) {
  while (index > 0) {
    var parentIndex = Math.floor((index - 1) / 2);
    var parentNode = this.elts_[parentIndex];
    var parentCost = this.costs_[parentIndex];
    if (cost < parentCost) {
      this.elts_[parentIndex] = elt;
      this.costs_[parentIndex] = cost;
      this.elts_[index] = parentNode;
      this.costs_[index] = parentCost;
      index = parentIndex;
    } else {
      break;
    }
  }
};

/**
 * Pushes a new element onto the heap.
 *
 * @param {Object} elt The element to add.
 * @param {number} cost The value by which to order elt.
 */
o3d.towerdefense.HeapPriorityQueue.prototype.push = function(elt, cost) {
  var index = this.size_++;
  this.elts_[index] = elt;
  this.costs_[index] = cost;
  this.bubbleUp_(elt, cost, index);
};

/**
 * Bubbles a possibly-too-high-in-the-tree element all the way down to its
 * proper place, swapping as it goes.  This is a private utility function to
 * maintain heap invariants.
 *
 * @param {Object} elt The current element to check.
 * @param {number} cost The value by which to order elt.
 * @param {number} index The index where elt is currently stored.
 * @private
 */
o3d.towerdefense.HeapPriorityQueue.prototype.bubbleDown_ =
    function(elt, cost, index) {
  while (index * 2 + 1 < this.size_) {
    var childCost;
    var childCost0 = Number.POSITIVE_INFINITY;
    var childCost1 = Number.POSITIVE_INFINITY;
    var childIndex;
    var childIndex0 = index * 2 + 1;
    var childIndex1;
    var childNode, childNode0, childNode1;

    if (childIndex0 < this.size_) {
      childNode0 = this.elts_[childIndex0];
      childCost0 = this.costs_[childIndex0];
      childIndex1 = childIndex0 + 1;
      if (childIndex1 < this.size_) {
        childNode1 = this.elts_[childIndex1];
        childCost1 = this.costs_[childIndex1];
      }
    }
    if (childCost0 < childCost1) {
      childCost = childCost0;
      childIndex = childIndex0;
      childNode = childNode0;
    } else {
      childCost = childCost1;
      childIndex = childIndex1;
      childNode = childNode1;
    }
    if (childCost < cost) {
      this.elts_[childIndex] = elt;
      this.costs_[childIndex] = cost;
      this.elts_[index] = childNode;
      this.costs_[index] = childCost;
      index = childIndex;
      continue;
    }
    break;
  }
};

/**
 * Pops the lowest-cost element off the heap.
 * @return {Object} The next element in the queue.
 */
o3d.towerdefense.HeapPriorityQueue.prototype.pop = function() {
  if (this.size_ <= 0) {
    throw Error('Heap underflow!');
  }
  var ret = this.elts_[0];
  --this.size_;
  var elt = this.elts_[this.size_];
  var cost = this.costs_[this.size_];
  this.elts_[0] = elt;
  this.costs_[0] = cost;
  this.elts_[this.size_] = null; // Optional; frees memory but takes time.
  this.costs_[this.size_] = null; // Optional; frees memory but takes time.

  this.bubbleDown_(elt, cost, 0);

  return ret;
};

/**
 * Rehashes elements whose costs have decreased.
 *
 * @param {Object} elt The element to update.
 * @param {number} cost The value by which to order elt.
 */
o3d.towerdefense.HeapPriorityQueue.prototype.rehash =
    function(elt, cost) {
  var index = 0;
  // Can this be faster somehow?  We could store the index on each element,
  // but that's a lot of overhead.
  for (; index < this.size_; ++index) {
    if (elt === this.elts_[index]) {
      break;
    }
  }
  if (index >= this.size_) {
    throw Error('Can\'t rehash an object not in the queue.');
  }
  if (this.costs_[index] < cost) {
    throw Error('We don\'t support rehashing higher costs, only lower ones.');
  }
  this.bubbleUp_(elt, cost, index);
};

/**
 * Returns true if there are no elements stored in the queue.
 * @return {boolean} Whether the queue is empty.
 */
o3d.towerdefense.HeapPriorityQueue.prototype.empty = function() {
  return this.size_ == 0;
};

/**
 * Validates that the heap's invariants are currently valid.  Used for
 * debugging/testing only.  Call it with index==0 to verify the whole heap.
 *
 * @param {number} index The index of the head of the subtree to verify.
 * @return {boolean} Whether the invariants currently hold.
 */
o3d.towerdefense.HeapPriorityQueue.prototype.verify = function(index) {
  var childIndex = index * 2 + 1;
  var result = true;
  if (childIndex < this.size_) {
    if (this.costs_[childIndex] < this.costs_[index]) {
      return false; // failure
    }
    result &= this.verify(childIndex++);
  }
  if (result && childIndex < this.size_) {
    if (this.costs_[childIndex] < this.costs_[index]) {
      return false; // failure
    }
    result &= this.verify(childIndex++);
  }
  return result;
};
