define([
  'module',
  'troopjs-core/component/service',
  'recorder/require',
  'recorder',
  'when',
  'lodash'
], function (module, Service, recorderRequire, Recorder, when, _) {
  'use strict';

  var moduleCfg = module.config().upload;

  return Service.extend({
    'sig/start': function () {
      // Load the SWF for initializing recorder which sits by side of the module main js.
      var swfFilePath = recorderRequire.toUrl("recorder.swf");
      Recorder.initialize({
        swfSrc: swfFilePath
      });
    },

    'hub/recorder/record': function () {
      var me = this;
      return when.promise(function (resolve, reject) {
        Recorder.record({
          start: resolve,
          progress: function (milliseconds, volume) {
            me.publish('recorder/record/progress', milliseconds);
            me.publish('recorder/record/volume', volume);
          },
          cancel: reject
        });
      });
    },

    'hub/recorder/stop': function () {
      Recorder.stop();
      Recorder.encode(Recorder.AUDIO_FORMAT_MP3);
      this.publish('recorder/stop/stopped');
    },

    'hub/recorder/replay-stop': function () {
      Recorder.stop();
      this.publish('recorder/stop/stopped');
    },

    'hub/record/play': function () {
      var me = this;
      Recorder.stop();
      Recorder.play({
        progress: function (milliseconds) {
          me.publish('recorder/play/progress', milliseconds);
        }
      });
    },

    'hub/recorder/upload': function (options) {

      return when.promise(function (resolve, reject, notify) {
        // Receive upload configuration in order of overrides:
        // 1. module config;
        // 2. function params;
        // 3. local callbacks.
        var cfg = _.extend({}, moduleCfg, options, {
          success: function (responseText) {
            var retval = JSON.parse(responseText);
            retval.success ? resolve(retval) : reject(retval);
          },
          progress: notify,
          error: reject
        });

        Recorder.upload(cfg);
      });
    }
  });
});