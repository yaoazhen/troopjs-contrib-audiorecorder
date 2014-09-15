define('troopjs-recorder/widget/states',[],function () {
  

  return {
    START: 'START',
    STOPPED: 'STOPPED',
    DISABLE: 'DISABLE',
    RECORDING: 'RECORDING',
    PLAYING: 'PLAYING',
    UPLOADING: 'UPLOADING'
  };
});

define('troopjs-recorder/service/recorder',[
  'module',
  'troopjs-core/component/service',
  'recorder/require',
  'recorder',
  'when',
  'lodash'
], function (module, Service, recorderRequire, Recorder, when, _) {
  

  var moduleCfg = module.config();

  var uploadCfg = moduleCfg.upload;
  var downloadCfg = moduleCfg.download;


  var service = Service.create({
    'sig/start': function () {
      // Load the SWF for initializing recorder which sits by side of the module main js.
      var swfFilePath = recorderRequire.toUrl("recorder.swf");
      Recorder.initialize({
        swfSrc: swfFilePath
      });
    },

    'hub/recorder/record': function () {
      var me = this;
      return me.publish('recorder/stop').then(function () {
        return (me.recording = when.promise(function (resolve, reject) {
          Recorder.record({
            start: resolve,
            progress: function (milliseconds, volume) {
              me.publish('recorder/record/progress', milliseconds);
              me.publish('recorder/record/volume', volume);
            },
            cancel: reject
          });
        }));
      });
    },

    'hub/recorder/stop': function () {
      var me = this;
      // If there's really a recording or playing in progress.
      if (me.recording || me.playing) {
        Recorder.stop();
        Recorder.encode(Recorder.AUDIO_FORMAT_MP3);
        delete me.recording;
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
        var cfg = _.extend({}, uploadCfg, options, {
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
  service.start();
  return service;
});

/*
 * This file defines a Troop UI Widget which is woven into DOM.
 *
 */
define('troopjs-recorder/widget/recorder',[
  'troopjs-browser/component/widget',
  'when',
  './states',
  '../service/recorder'
], function (Widget, when, STATES) {
  

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
      return me.publish('recorder/record').then(function () {
        me.state(STATES.RECORDING);
      }).catch(function () {
        me.state(STATES.START);
      });
    },

    stop: function () {
      this.publish('recorder/stop');
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
      me.publish('recorder/upload', options).then(function (data) {
        me.signal('upload', null, data);
      }).otherwise(function (err) {
        me.signal('upload', err);
      });
      me.state(STATES.UPLOADING);
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

