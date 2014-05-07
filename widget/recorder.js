/*
 * This file defines a Troop UI Widget which is woven into DOM.
 *
 */
define([
  'troopjs-browser/component/widget',
  'when',
  './states',
  '../service/recorder'
], function (Widget, when, STATES) {
  'use strict';

  var CONFIGURATION = 'configuration';

  // Handles the widget instantiation.
  return Widget.extend(function ($element, name, options) {
    this.configure(options || {});
  }, {
    'sig/start': function () {
      this.cls = this.$element.attr('class');
      this.state(STATES.START);
    },

    record: function () {
      var me = this;
      var p = me.publish('recorder/record');
      p.then(function () {
        me.state(STATES.RECORDING);
      });
      p.otherwise(function () {
        me.state(STATES.START);
      });
      return p;
    },

    stop: function () {
      return this.publish('recorder/stop');
    },

    /**
     * Handle recorder has stopped recording.
     * @handler
     */
    'hub/recorder/stop': function () {
      var me = this;
      if (me.state() === STATES.RECORDING) {
        me.state(STATES.STOPPED);
      }
    },

    /**
     * Handle recorder notify recording volume in progress.
     * @handler
     */
    'hub/recorder/record/volume': function (volume) {
      var me = this;
      var state = me.state();
      if (state === STATES.RECORDING) {
        me.signal('volume', volume);
      }
    },

    play: function () {
      var me = this;
      me.publish('player/play').then(function () {
        me.state(STATES.PLAYING);
      }).otherwise(function () {
        me.state(STATES.STOPPED);
      });
    },

    /**
     * Handle player has completed playing the record.
     * @handler
     */
    'hub/player/complete': function () {
      var me = this;
      if (me.state() === STATES.PLAYING) {
        me.state(STATES.STOPPED);
      }
    },

    upload: function () {
      var me = this;
      var options = me[CONFIGURATION].upload;
      var p = me.publish('recorder/upload', options);
      p.then(function (data) {
        me.signal('upload', null, data);
      });
      p.otherwise(function (err) {
        me.signal('upload', err);
      });
      me.state(STATES.UPLOADING);
      return p;
    },

    state: function (state) {
      var me = this;
      if (state && me._state !== state) {
        this.toggleState(me._state = state);
        me.signal('state', state);
      }
      return me._state;
    },

    toggleState: function (state) {
      var me = this;
      me.$element.attr('class', [me.cls, state.toLowerCase() || ''].join(' '));
    }
  });
});
