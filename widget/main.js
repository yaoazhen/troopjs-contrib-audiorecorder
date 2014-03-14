/*
 * This file defines a Troop UI Widget which is woven into DOM.
 *
 */
define([
  'module',
  'troopjs-browser/component/widget',
  'when',
  'lodash',
  './states',
  'template!./main.html'
], function (module, Widget, when, _, STATES, tHtml) {
  'use strict';

  var CLS = (module.config()['cls'] || 'et-recorder');
  var SEL_BASE = '.' + CLS;
  var prefix = '.' + CLS + '-';
  var SEL_BTN = prefix + 'btn';
  var SEL_TIMER = prefix + 'timer';
  var SEL_INDICATOR = prefix + 'indicator span';

  var $ELEMENT = '$element';
  var CONFIGURATION = 'configuration';

  var CLS_START = 'init';
  var CLS_DISABLED = 'disabled';
  var CLS_STOPPED = 'stop';
  var CLS_RECODING = 'recording';
  var CLS_PLAYING = 'playing';
  var CLS_PROCESSING = 'uploading';
  var CLS_ERROR = 'error';

  var reset = 'dom:' + prefix + 'reset-btn/click';
  var upload = 'dom:' + prefix + 'upload-btn/click';

  var DOM_HANDLERS = {};
  DOM_HANDLERS[reset] = function () {
    this.state(STATES.START);
  };
  DOM_HANDLERS[upload] = function () {
    this.upload();
  };

  // Handles the widget instantiation.
  return Widget.extend(function ($element, name, options) {
    this.configure(options || {});
  }, {

    // Handles the widget starting.
    'sig/start': function initialize() {
      var me = this;
      me.html(tHtml({ cls : CLS}));
      var $el = me[$ELEMENT];

      me.$recorder = $el.find(SEL_BASE);
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
            _.delay(function () {
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
      cls = [CLS, cls || ''].join(' ');
      this.$recorder.attr('class', cls);
    }
  }, DOM_HANDLERS);
});
