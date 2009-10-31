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
 * @fileoverview This file contains the HighScoreEntry and HighScoreTable
 * classes, which are used to track high scores and record them in a cookie.
 * It's been written for Firefox 2, but should be easy to port to other
 * browsers.
 */

/**
 * HighScoreEntry is a single entry in the high score table.
 *
 * @constructor
 * @param {String} name the name of the player
 * @param {integer} score the score earned
 * @param {integer} wave in which wave the game ended
 * @param {integer} money how much money the player had when the game ended
 * @param {integer} hitPoints how many hit points the player had when the game
 * ended
 */
function HighScoreEntry(name, score, wave, money, hitPoints) {
  this.name = name; // This is an untrusted user-input string; be careful.
  this.score = score;
  this.wave = wave;
  this.money = money;
  this.hitPoints = hitPoints;
  return this;
}

/**
 * HighScoreTable is a serializable table of high scores.  This will load the
 * table from a cookie if found, else it will create a new empty table.
 *
 * @constructor
 */
function HighScoreTable() {
  var cookies = document.cookie.split(';');
  var tableString;
  for (var idx in cookies) {
    var keyValue = cookies[idx].split('=');
    if (keyValue[0] == HighScoreTable.HIGH_SCORE_COOKIE_NAME) {
      tableString = decodeURIComponent(keyValue[1]);
      break;
    }
  }
  this.table = [];
  if (tableString) {
    var rows = tableString.split(';');
    for (var idx in rows) {
      // Note the double-decode, so that you can have anything you want as your
      // name, but we can still count on : as a field separator and ; as a
      // record separator.  This could be done with more code and less blowup by
      // just encoding those two characters, but not right now.
      var fields = rows[idx].split(':');
      if (fields.length > 1) {
        this.table.push(
            new HighScoreEntry(
                decodeURIComponent(fields[0]),
                parseInt(fields[1]),
                parseInt(fields[3]),
                parseInt(fields[4]),
                parseInt(fields[2])));
      }
    }
  }
  this.sort();
  this.updateDisplay();
  return this;
}

(function() {

  HighScoreTable.HIGH_SCORE_COOKIE_NAME = 'O3DTD_SCORES';
  HighScoreTable.HIGH_SCORE_TABLE_SIZE = 10;

  HighScoreEntry.prototype.toString = function() {
    return [encodeURIComponent(this.name), this.score, this.hitPoints,
        this.wave, this.money].join(':') + ';';
  };

  HighScoreTable.prototype.sort = function() {
    this.table.sort(
        function(a, b) {
          return b.score - a.score;
        });
  };

  /**
   * Serializes the high score table to a string and stores that in a cookie.
   */
  HighScoreTable.prototype.saveScores = function() {
    if (this.table.length) {
      var s = '';
      for (var idx in this.table) {
        s += this.table[idx].toString();
      }
    }
    var expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    s = HighScoreTable.HIGH_SCORE_COOKIE_NAME + '=' + encodeURIComponent(s) +
        ';expires=' + expiry.toGMTString();
    document.cookie = s;
  };

  /**
   * Adds a new score to the high score table if it's high enough to make the
   * cut.  Keeps the table sorted and no larger than
   * HighScoreTable.HIGH_SCORE_TABLE_SIZE.
   *
   * @param {String} name the name of the player
   * @param {integer} score the score earned
   * @param {integer} wave in which wave the game ended
   * @param {integer} money how much money the player had when the game ended
   * @param {integer} hitPoints how many hit points the player had when the game
   * ended
   */
  HighScoreTable.prototype.addScore =
      function(name, score, wave, money, hitPoints) {
    var entry = new HighScoreEntry(name, score, wave, money, hitPoints);
    if (this.table.length < HighScoreTable.HIGH_SCORE_TABLE_SIZE) {
      this.table.push(entry);
    } else {
      if (score > this.table[this.table.length - 1].score) {
        this.table[this.table.length - 1] = entry;
      }
    }
    this.sort();
    this.updateDisplay();
    this.saveScores();
  };

  /**
   * Copies the info in the high score table to the dom for display.
   */
  HighScoreTable.prototype.updateDisplay = function() {
    var elt = document.getElementById('high_scores').rows;
    var table_offsets;
    if ((navigator.appVersion.indexOf('MSIE') != -1)) {
      table_offsets = new Array(0, 1, 2, 3, 4, 5);
    } else {
      table_offsets = new Array(1, 3, 5, 7, 9, 11);
    }
    for (var i = 0; i < HighScoreTable.HIGH_SCORE_TABLE_SIZE; ++i) {
      // todo: Boy, is this ugly.  The DOM interface for table objects requires
      // different children offsets for different browser platforms.
      elt[i + 1].childNodes[table_offsets[0]].innerHTML = i;
      if (i < this.table.length) {
        var entry = this.table[i];
        elt[i + 1].childNodes[table_offsets[1]].innerHTML = entry.name;
        elt[i + 1].childNodes[table_offsets[2]].innerHTML = entry.score;
        elt[i + 1].childNodes[table_offsets[3]].innerHTML = entry.hitPoints;
        elt[i + 1].childNodes[table_offsets[4]].innerHTML = entry.wave;
        elt[i + 1].childNodes[table_offsets[5]].innerHTML = entry.money;
      } else {
        elt[i + 1].childNodes[table_offsets[1]].innerHTML = '';
        elt[i + 1].childNodes[table_offsets[2]].innerHTML = '';
        elt[i + 1].childNodes[table_offsets[3]].innerHTML = '';
        elt[i + 1].childNodes[table_offsets[4]].innerHTML = '';
        elt[i + 1].childNodes[table_offsets[5]].innerHTML = '';
      }
    }
  };

}) ();
