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
 * @fileoverview This file contains tests for the HeapPriorityQueue class.
 * It's been written for Firefox 2, but should work in any modern browser.
 */

/**
 * Create a HeapPriorityQueue and do some basic checks on it.
 * @return {o3d.towerdefense.HeapPriorityQueue} A new HeapPriorityQueue.
 */
function createQueue() {
  var hpq = new o3d.towerdefense.HeapPriorityQueue();
  assertTrue(hpq.verify());
  assertTrue(hpq.empty());
  return hpq;
}

/**
 * Push an element with cost num onto the supplied HeapPriorityQueue, then
 * verify the queue's validity.
 *
 * @param {o3d.towerdefense.HeapPriorityQueue} hpq The queue to test.
 * @param {Number} num The number to put in the element pushed.
 */
function push(hpq, num) {
  hpq.push(num, num);
  assertTrue(hpq.verify());
}

/**
 * Pop an element from the supplied HeapPriorityQueue, then verify the queue's
 * validity.
 *
 * @param {o3d.towerdefense.HeapPriorityQueue} hpq The queue to test.
 * @return {Object} The number popped.
 */
function pop(hpq) {
  var elt = hpq.pop();
  assertTrue(hpq.verify());
  return elt;
}

/**
 * Do a simple series of actions that fills, then empties, a queue.
 */
function testSimpleSeries() {
  var hpq = createQueue();
  push(hpq, 7);
  assertFalse(hpq.empty());
  push(hpq, 5);
  push(hpq, 1);
  push(hpq, 3);
  push(hpq, 4);
  push(hpq, 1);
  push(hpq, 2);
  push(hpq, 1);
  assertEquals(1, pop(hpq));
  assertEquals(1, pop(hpq));
  assertEquals(1, pop(hpq));
  assertEquals(2, pop(hpq));
  assertEquals(3, pop(hpq));
  assertEquals(4, pop(hpq));
  assertEquals(5, pop(hpq));
  assertFalse(hpq.empty());
  assertEquals(7, pop(hpq));
  assertTrue(hpq.empty());
}

/**
 * Do a series of interspersed pushes and pops.
 */
function testMixedPushAndPop() {
  var hpq = createQueue();
  push(hpq, -7);
  assertFalse(hpq.empty());
  assertEquals(-7, pop(hpq));
  assertTrue(hpq.empty());
  push(hpq, 5);
  assertEquals(5, pop(hpq));
  assertTrue(hpq.empty());
  push(hpq, 4);
  push(hpq, -1);
  push(hpq, 0);
  push(hpq, 6);
  push(hpq, 100);
  assertEquals(-1, pop(hpq));
  push(hpq, 9);
  assertEquals(0, pop(hpq));
  assertEquals(4, pop(hpq));
  assertEquals(6, pop(hpq));
  assertEquals(9, pop(hpq));
  assertFalse(hpq.empty());
  assertEquals(100, pop(hpq));
  assertTrue(hpq.empty());
}

/**
 * Test the error handling on the boundaries of the queue.
 */
function testUnderflow() {
  var hpq = createQueue();
  try {
    pop(hpq);
    fail();
  } catch (ex) {
  }
}
