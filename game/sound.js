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
 * @fileoverview This file contains the soundControl object, which abstracts
 * away all sound-related functionality.  It uses the free SoundManager tool to
 * play game sounds.
 * It's been written for Firefox 2, but should be easy to port to other
 * browsers.
 */

var soundControl = new Object();

// TODO(ericu): Do we have to worry about circular references caused by closure
// scope chains w.r.t. dumb garbage collectors, given that there's no dom node
// involved?
(function() {
  soundManager.debugMode = false;
  soundManager.url = 'third_party/soundmanagerv25b-20080505/soundmanager2.swf';
  soundManager.onload = function() {
    soundControl.initSounds();
  };

  soundControl.id = new Object();
  soundControl.records = new Object();
  soundControl.soundPoolSize = 8;

  /**
   * Creates an array of players for the sound described by soundRecord, such
   * that it can then be played on demand.
   *
   * @param {SoundRecord} soundRecord the sound for which to create players
   */
  soundControl.setupSoundFile = function(soundRecord) {
    var id = soundRecord.id;

    assert(soundControl.id.hasOwnProperty(id));
    assert(!soundControl.records.hasOwnProperty(id));
    soundControl.records[id] = soundRecord;
    for (var i = 0; i < soundControl.soundPoolSize; ++i) {
      // Create a pool of players for each sound effect, so that we can overlap
      // their playing.  SoundManager otherwise will restart a sound from the
      // beginning, which is really obvious if there's a barrage of bullets.
      soundControl.records[id].players[i] =
          soundManager.createSound({
            id: id + i,
            url: soundRecord.file,
            volume: soundRecord.volume,
            autoLoad: true});
    }
  };

  // We could also add position here and/or at play time, so that shots, death
  // cries, etc., would come from the correct side of the screen.

  /**
   * SoundRecord holds various parameters associated with a single sound file.
   * It holds an array of players so that we can have the same sound file
   * playing multiple times, overlapped.
   *
   * @constructor
   * @param {String} id the id of the sound
   * @param {String} file the path to the mp3 file
   * @param {number} a number between 0 [silent] and 100 [loud] describing how
   * loud to play the sound
   */
  function SoundRecord(id, file, volume) {
    this.id = id;
    this.file = file;
    this.volume = volume;
    this.players = [];
    this.curPlayer = 0;
    return this;
  }

  SoundRecord.prototype.play = function() {
    this.players[this.curPlayer++].play();
    if (this.curPlayer >= soundControl.soundPoolSize) {
      this.curPlayer = 0;
    }
  };

  var soundDirectory = 'third_party/soundsnap/';
  var sounds = [
    new SoundRecord('ARC_MISSILE_FIRE',
        soundDirectory + 'missile_hit-modified.mp3', 100),
    new SoundRecord('ARC_MISSILE_EXPLOSION',
        soundDirectory + 'cannon_fired_close-modified.mp3', 80),
    new SoundRecord('BASIC_MISSILE_FIRE',
        soundDirectory + 'WWMGA7CA4SSDP2-modified.mp3', 100),
    new SoundRecord('BASIC_MISSILE_EXPLOSION',
        soundDirectory + 'WOODEN_DOOR_PLANK_HITS-modified.mp3', 100),
    new SoundRecord('ZAP_MISSILE_FIRE',
        soundDirectory + 'SCIENCE_FICTION_LASER_GUN_BEAM_BLASTER_' +
        'SHOT_02-modified.mp3', 100),
    new SoundRecord('ZAP_MISSILE_EXPLOSION', '', 100), // Not needed
    new SoundRecord('UPGRADE_START', soundDirectory +
        'SCIENCE_FICTION_GLASS_TRANSISTION_05-modified.mp3', 100),
    new SoundRecord('UPGRADE_END', soundDirectory +
        'SCIENCE_FICTION_LEVITATION_MOVEMENT_SHORT_01.mp3', 100),
    new SoundRecord('SELL_TOWER',
        soundDirectory + 'cash_register-vintage-modified.mp3', 100),
    new SoundRecord('CONSTRUCTION_START', soundDirectory +
        'Hammering_Construction_Indoor-modified.mp3', 25),
    new SoundRecord('CONSTRUCTION_ALL_IN_ONE', soundDirectory +
        'Hammering_Construction_Indoor-modified.mp3', 25),
    new SoundRecord('CREEP_DIE',
        soundDirectory + 'HUMAN_VOICE_MALE_OUCH_01-modified.mp3', 30),
    new SoundRecord('CREEP_ESCAPE', soundDirectory +
        'HUMAN_VOICE_CLIP_MALE_MOCKING_HA_HA_01.mp3', 100),
    new SoundRecord('CREEP_WAVE_START', soundDirectory +
        '11118801-modified.mp3', 100),
    new SoundRecord('CREEP_SPROING', soundDirectory +
        '11115901.mp3', 100),
    new SoundRecord('GAME_WON', soundDirectory +
        'trumpets_fanfar-modified.mp3', 100),
    new SoundRecord('GAME_LOST', soundDirectory +
        'MUSICAL_STRINGS_ACCENT_SWELLS_MYSTERIOUS_SAD_01.mp3', 100),
  ];

  // Set up the sound IDs early, so that we can refer to them elsewhere.
  for (var idx in sounds) {
    var id = sounds[idx].id;
    assert(!soundControl.id.hasOwnProperty(id));
    soundControl.id[id] = id;
  }

  /**
   * Now that the soundManager has been initialized, we can add the sounds.  Up
   * until this point, anyone trying to play a sound would just get silence due
   * to the check on this.initialized in soundControl.play.
   */
  soundControl.initSounds = function() {
    this.initialized = true;
    for (var idx in sounds) {
      var sound = sounds[idx];
      soundControl.setupSoundFile(sound);
    }
  };

  var guidCounter = 0;
  soundControl.play = function(id) {
    if (this.initialized) {
      assert(this.id.hasOwnProperty(id));
      assert(this.records.hasOwnProperty(id));
      this.records[id].play();
    }
  };

}) ();
