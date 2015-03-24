define([
  'module',
  'troopjs-core/component/service',
  'recorder/require',
  'recorder',
  'when',
  'jquery'
], function (module, Service, recorderRequire, Recorder, when, $) {
  'use strict';

  var FLASH_CONTAINER = 'flashContainer';
  var ON_FLASH_SECURITY = 'onFlashSecurity';

  var moduleCfg = module.config();

  var uploadCfg = moduleCfg.upload;
  var downloadCfg = moduleCfg.download;

  var service = Service.create({
    'sig/initialize': function () {
      var me = this;
      // Load the SWF for initializing recorder which sits by side of the module main js.
      var swfFilePath = recorderRequire.toUrl("recorder.swf");
      var df = when.defer();
      var options = {
        swfSrc: swfFilePath,
        initialized: df.resolve,
        incompatible: function (reason) {
          var err = new Error('incompatible flash');
          err.reason = reason;
          df.reject(err);
        },

        onPrivacyChange: function (allowed) {
          me.publish('recorder/onPrivacyChange', allowed);
        },

        noMicrophone: function () {
          me.publish('recorder/noMicrophone');
        }
      };

      moduleCfg[FLASH_CONTAINER] && (options[FLASH_CONTAINER] = moduleCfg[FLASH_CONTAINER]);
      moduleCfg[ON_FLASH_SECURITY] && (options[ON_FLASH_SECURITY] = function () {
        me.publish('recorder/onFlashSecurity');
      });

      Recorder.initialize(options);
      return df.promise;
    },

    'sig/start': function () {
      // TODO: Hack for 2.x to notify when this service has initialized.
      this.emit("sig/started");
    },

    'hub/recorder/setupPrivacy': function () {
      Recorder.setupPrivacy();
    },

    'hub/recorder/hideFlash': function () {
      Recorder.triggerEvent('hideFlash');
    },

    'hub/recorder/record': function () {
      var me = this;
      return me.publish('recorder/stop').then(function () {
        return when.promise(function (resolve, reject) {
          Recorder.record({
            start: function () {
              me.recording = 1;
              me.publish('recorder/record/started');
              resolve();
            },
            progress: function (milliseconds, volume) {
              me.publish('recorder/record/progress', milliseconds, volume);
            },
            hold: function () {
              me.publish('recorder/record/hold');
            },
            cancel: reject
          });
        });
      });
    },

    'hub/recorder/stop': function () {
      var me = this;
      // check there's an actual recording or playing in progress.
      if (me.recording || me.playing) {
        Recorder.stop();
        Recorder.encode(Recorder.AUDIO_FORMAT_MP3);
        delete me.recording;
        me.publish('recorder/record/stopped');
      }
    },

    'hub/player/play': function () {
      var me = this;
      return me.publish('recorder/stop').then(function () {
        (me.playing = when.promise(function (resolve) {
          Recorder.play({
            progress: function onProgress(milliseconds) {
              me.publish('player/progress', milliseconds);
            },
            finished: function onFinished() {
              me.publish('player/complete').then(function () {
                resolve();
                delete me.playing;
              });
            }
          });
        }));
      });
    },

    'hub/recorder/upload': function (options) {

      return when.promise(function (resolve, reject, notify) {
        // Receive upload configuration in order of overrides:
        // 1. module config;
        // 2. function params;
        // 3. local callbacks.
        var cfg = $.extend({}, uploadCfg, options, {
          success: function (responseText) {
            var retval = JSON.parse(responseText);

            if (downloadCfg) {
              retval.id ? resolve(downloadCfg.url + retval.id) : reject(retval);
            }
            else {
              resolve(retval);
            }

          },
          progress: notify,
          error: reject
        });

        Recorder.upload(cfg);
      });
    }
  });
  return service.start();
});
