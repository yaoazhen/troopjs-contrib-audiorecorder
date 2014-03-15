/*
 * This file defines a Troop UI Widget which is woven into DOM.
 *
 */
define([
  'troopjs-recorder/widget/recorder',
  'troopjs-recorder/widget/states',
  'template!./main.html'
], function (Recorder, STATES, tHtml) {
  'use strict';

  var SEL_BTN = '.btn.primary';
  var SEL_TIMER = '.timer';
  var SEL_INDICATOR = '.indicator span';

  var $ELEMENT = '$element';

  var CLS_DISABLED = 'disabled';
  var CLS_ERROR = 'error';

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

    'dom:.btn.reset/click': function () {
    },
    'dom:.btn.upload/click': function () {
      this.upload();
    },
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
          toggleAction('play');
          break;
        case STATES.UPLOADING:
          toggleAction();
          break;
        default:
          throw new Error('unknown recorder state:' + me.state());
          break;
      }
    },
    
    'sig/volumn': function (volume) {
      this.$indicator.animate({'width': volume + '%'}, { duration: 50});
    },
    'sig/upload': function (err, data) {
      if(err){
        // Display the error message with disabled state for 2s and recover.
        this.toggleState([CLS_DISABLED, CLS_ERROR].join(' '));
      }
    }
  });
});
