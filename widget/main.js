/*
 * This file defines a Troop UI Widget which is woven into DOM.
 *
 */
define([
  'troopjs-browser/component/widget',
  'when',
  'lodash',
  './states',
  'template!./main.html'
], function (Widget, when, _, STATES, tHtml) {
  'use strict';

  var SEL_RECORDER = '.et-recorder';
  var SEL_BTN = '.et-recorder-btn';
  var SEL_TIMER = ".et-recorder-timer";
  var SEL_INDICATOR = ".et-recorder-indicator span";

  var $ELEMENT = '$element';
  var CONFIGURATION = 'configuration';


  var CLS_BASE = 'et-recorder';

  var CLS_START = 'et-recorder-init';
  var CLS_DISABLED = 'et-recorder-disabled';
  var CLS_STOPPED = 'et-recorder-stop';
  var CLS_RECODING = 'et-recorder-recording';
  var CLS_PLAYING = 'et-recorder-playing';
  var CLS_PROCESSING = 'et-recorder-uploading';
  var CLS_ERROR = 'et-recorder-error';

  // Handles the widget instantiation.
  return Widget.extend(function ($element, name, options) {
    this.configure(options || {});
  }, {

    // Handles the widget starting.
    'sig/start': function initialize() {
      var me = this;
      me.html(tHtml());
      var $el = me[$ELEMENT];

      me.$recorder = $el.find(SEL_RECORDER);
      me.$btn = $el.find(SEL_BTN);
      me.$timer = $el.find(SEL_TIMER);
      me.$indicator = $el.find(SEL_INDICATOR);

      this.state(STATES.START);
    },

    'dom:.primary/click': function () {
      var me = this;
      var action = me[me.$btn.attr('data-action')];
      if (action) {
        action.call(me);
      }
    },
    'dom:.et-recorder-reset-btn/click': function () {
      this.state(STATES.START);
    },

    'dom:.et-recorder-upload-btn/click': function () {
      this.upload();
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
          this.$indicator.animate({'width': volume + '%'}, { duration: 50});
      }
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

    'hub/troopjs-recorder/stop': function () {
      var me = this;
      switch (me.state()) {
        case STATES.RECORDING:
        case STATES.PLAYING:
          me.publish('recorder/stop');
          break;
        default:
          break;
      }
    },

    stop: function () {
      this.publish('troopjs-recorder/stop');
    },

    play: function () {
      var me = this;
      me.publish('recorder/play');
    },

    upload: function () {
      var me = this;
      var options = me[CONFIGURATION].upload;
      me.state(STATES.UPLOADING);
      this.publish('recorder/upload', options).then(function (data) {

        // Handle upload success.
        me.publish('recorder/upload/success', data);
        me.state(STATES.START);

      }).otherwise(function () {
          // Display the error message with disabled state for 2s and recover.
          me.toggleCls([CLS_DISABLED, CLS_ERROR].join(' '));
          _.delay(function() {
            me.state(STATES.START);
          }, 2000);
        });
    },

    updateUI: function () {
      var me = this;
      switch (me.state()) {
        case STATES.START:
          me.toggleCls(CLS_START);
          me.toggleAction('record');
          break;
        case STATES.DISABLE:
          me.toggleCls(CLS_DISABLED);
          break;
        case STATES.RECORDING:
          me.toggleCls(CLS_RECODING);
          me.toggleAction('stop');
          break;
        case STATES.PLAYING:
          me.toggleCls(CLS_PLAYING);
          me.toggleAction('stop');
          break;
        case STATES.STOPPED:
          me.toggleCls(CLS_STOPPED);
          me.toggleAction('play');
          break;
        case STATES.UPLOADING:
          me.toggleCls(CLS_PROCESSING);
          me.toggleAction();
          break;
        default:
          throw new Error('unknow recorder state:' + me.state());
          break;
      }
    },

    state: function (state) {
      if (state && this._state !== state) {
        this._state = state;
        this.updateUI(state);
      }

      return this._state;
    },

    toggleAction: function (action) {
      this.$btn.attr('data-action', action || false);
    },

    toggleCls: function (cls) {
      this.$recorder.attr('class', [CLS_BASE, cls || ''].join(' '));
    }
  });
});
