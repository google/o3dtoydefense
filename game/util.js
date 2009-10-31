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
 * @fileoverview  This file contains a variety of utility methods mostly used
 * for debugging, profiling, and error-handling.  It was written for Firefox 2,
 * and may require a bit of work to run on other browsers.
 */

/**
 * This is used in various places to nop out methods that might get called, but
 * shouldn't do anything.
 */
function nop() {
}

/**
 * Each platform likely has its own logging function; use the ones we recognize.
 */
if (!window.dump) {  // Not Firefox
  if (window.console && window.console.log) {  // Safari
    window.dump = function(s) {
      window.console.log(s);
    }
  } else {
    window.dump = nop;
  }
}

/**
 * This dumps a string to the console, adding a trailing newline.
 *
 * @param {String} s The string to dump.
 */
o3d.towerdefense._debug = function(s) {
  dump(s + '\n');
};

/**
 * I use debug for temporary debugging dumps, so that I can grep for them to
 * remove them easily.  I use _debug for dumps that will stick around for a long
 * time, so as not to clutter up my grep output.
 */
o3d.towerdefense.debug = o3d.towerdefense._debug;

/**
 * A renderer-safe function to pop up an alert.
 * @param {String} s A string to display.
 */
o3d.towerdefense.popup = function(s) {
  aborted = true; // This deactivates the render callback in main.js.
  var str = s + '\n' + stringifyObj(new Error());
  o3d.towerdefense._debug(str);
  alert(str);
};

/**
 * A renderer-safe assert function.
 * @param {boolean} v A value to test.
 */
function assert(v) {
  if (!v) {
    o3d.towerdefense.popup("Assertion failed: '" + v + "'");
    throw new Error(v);
  }
}

/**
 * This function produces a string containing all the enumerable properties in
 * an object along with their values.
 *
 * @param {Object} obj The object to convert.
 * @return {String} The string representation of the object.
 */
function stringifyObj(obj) {
  if (!obj) {
    return 'null object';
  }
  var str = '';
  for (var i in obj) {
    str += i + ':\t';
    try {
      str += obj[i] + '\n';
    } catch (ex) {
      str += typeof obj;
    }
  }
  return str;
}

/**
 * This function works like a toString for a O3D vector.
 *
 * @param {Array} v A Vector.
 * @return {String} The string representation of the vector.
 */
function stringifyVector3(v) {
  return ['V3[', v[0], v[1], v[2], ']'].join(' ');
}

/**
 * This function works like a toString for a O3D vector.
 *
 * @param {Array} v A Vector.
 * @return {String} The string representation of the vector.
 */
function stringifyVector4(v) {
  return ['V4[', v[0], v[1], v[2], v[3], ']'].join(' ');
}

var stringifyQuat = stringifyVector4;

/**
 * An array that holds timing information for profiling javascript code.
 */
var timingEvents;

/**
 * The functions initTiming, pushTimingEvent, and dumpTimingEvents are used for
 * profiling, to figure out how long various parts of the program are taking.
 */
function initTiming() {
  timingEvents = [];
}

/**
 * Add a timestamped event to the record.
 *
 * @param {String} text Some identifying text to dump with the event timing
 *     info.
 */
function pushTimingEvent(text) {
  if (timingEvents) {
    timingEvents.push([text, new Date().getTime()]);
  }
}

/**
 * Dumps the array of recorded timing events and clears the record.
 * If the timing system hadn't previously been initialized, initializes it.
 */
function dumpTimingEvents() {
  if (timingEvents) {
    var lastTime = 0;
    timingEvents.reverse();
    o3d.towerdefense._debug('');
    while (timingEvents.length) {
      var record = timingEvents.pop();
      var text = record[0];
      var time = record[1];
      o3d.towerdefense._debug(
          text + ',\t' + time + ',\t' + (time - lastTime));
      lastTime = time;
    }
    o3d.towerdefense._debug('');
  } else {
    initTiming();
  }
}

/**
 * Error to throw when the user tries to do something that's not allowed, that
 * you'd like to signal in some gentle fashion.
 *
 * @constructor
 * @param {String} s A string that the catcher may optionally display.
 */
function UserError(s) {
  this.s = s;
}

/**
 * The exception to throw when you detect that the game has ended and want to
 * stop everything.
 *
 * @constructor
 * @param {String} s A string that the catcher may optionally display.
 */
function GameOverException(s) {
  this.s = s;
}
