/*
 * This file defines a Troop UI Widget which is woven into DOM.
 *
 */
define([
  'troopjs-recorder/widget/recorder',
  'troopjs-recorder/widget/states',
  'tinycolor',
  'template!./main.html'
], function (Recorder, STATES, color, tHtml) {
  'use strict';

  var SEL_BTN = '.btn.primary';
  var SEL_TIMER = '.timer';
  var SEL_INDICATOR = '.icon';

  var $ELEMENT = '$element';

  var CLS_DISABLED = 'disabled';
  var CLS_ERROR = 'error';
  var CLS_UPLOAD = 'upload';

  // Handles the widget instantiation.
  return Recorder.extend({

    // Handles the widget starting.
    'sig/start': function initialize() {
      var me = this;
      me.html(tHtml);
      var $el = me[$ELEMENT];
      me.$btn = $el.find(SEL_BTN);
      me.$timer = $el.find(SEL_TIMER);
      me.$indicator = $el.find(SEL_INDICATOR);
    },

    'dom:.btn.primary/click': function () {
      var me = this;
      var action = me[me.$btn.attr('data-action')];
      if (action) {
        action.call(me);
      }
    },

    'dom:.btn.upload/click': function () {
      this.upload();
    },

    /**
     * Handles recorder state transition to determinate what to do next on the button.
     * @handler
     */
    'sig/state': function (state) {

      var me = this;
      function toggleAction(action) {
        me.$btn.attr('data-action', action || false);
      }

      switch (state) {
        case STATES.START:
          toggleAction('record');
          break;
        case STATES.RECORDING:
          toggleAction('stop');
          break;
        case STATES.PLAYING:
          toggleAction('stop');
          break;
        case STATES.STOPPED:
          // play just once then to upload.
          if(me.played) {
            me.toggleState(CLS_UPLOAD);
            toggleAction('upload');
          }
          else
            toggleAction('play');
          break;
        case STATES.UPLOADING:
          // button disabled when uploading.
          toggleAction();
          break;
        default:
          throw new Error('unknown recorder state:' + me.state());
          break;
      }
    },

    'hub/recorder/record': function () {
      this.played = false;
      this.iconBg = color(this.$indicator.css('background-color'));
    },

    'hub/recorder/stop': function () {
      this.$indicator.css('background-color', '');
    },

    'hub/player/complete': function () {
      this.played = true;
    },

    /**
     * Handle volume change, indicating by opacity of the icon color.
     * @handler
     */
    'sig/volume': function (volume) {
      this.$indicator.css('background-color', color.darken(this.iconBg, volume * 3).toRgbString());
    },

    'sig/upload': function (err, data) {
      if(err){
        // Display the error message with disabled state for 2s and recover.
        this.toggleState([CLS_DISABLED, CLS_ERROR].join(' '));
      }
      this.state(STATES.START);
    },

    'sig/stop': function () {
      this.played = false;
      return this.publish('recorder/stop');
    }
  });
});
