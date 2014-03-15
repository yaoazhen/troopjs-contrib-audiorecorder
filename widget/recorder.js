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
      return me.publish('troopjs-recorder/stop').then(function () {
        return me.publish('recorder/record')
            .then(function () {
              me.state(STATES.RECORDING);
            }).catch(function () {
              me.state(STATES.START);
            });
      });
    },

    stop: function () {
      this.publish('troopjs-recorder/stop');
    },

    play: function () {
      this.publish('recorder/play');
    },

    upload: function () {
      var me = this;
      var options = me[CONFIGURATION].upload;
      me.state(STATES.UPLOADING);
      this.publish('recorder/upload', options).then(function (data) {
        me.signal('upload', null, data);
      }).otherwise(function (err) {
        me.signal('upload', err);
      }).then(function () {
        me.state(STATES.START);
      });
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
    },

    'hub/recorder/stop/stopped': function () {
      this.state(STATES.START);
    },

    'hub/recorder/record/volume': function (volume) {
      var me = this;
      var state = me.state();
      // Amplification.
      switch (state) {
        case STATES.RECORDING:
          volume *= 5;
          me.signal('volume', volume);
      }
    },

    'hub/troopjs-recorder/stop': function () {
      var me = this;
      switch (me.state()) {
        case STATES.RECORDING:
        case STATES.PLAYING:
          me.publish('recorder/stop');
          break;
      }
    }

  });
});
