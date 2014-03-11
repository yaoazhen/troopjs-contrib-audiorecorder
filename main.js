/* This is the RequireJS config file bootstraps TroopJS app. */

'use strict';

require.config({
  baseUrl: '.',
  paths:{
    jquery: '../bower_components/jquery/dist/jquery',
    lodash: 'bower_components/lodash/dist/lodash.compat'
  },
  packages: [
    {
      name: 'when',
      location: 'bower_components/when',
      main: 'when.js'
    },
    {
      name: 'poly',
      location: 'bower_components/poly',
      main: 'poly.js'
    },
    {
      name: 'troopjs-composer',
      location: 'bower_components/troopjs-composer'
    },
    {
      name: 'troopjs-core',
      location: 'bower_components/troopjs-core'
    },
    {
      name: 'troopjs-browser',
      location: 'bower_components/troopjs-browser'
    },
    {
      name: 'troopjs-jquery',
      location: 'bower_components/troopjs-jquery'
    },
    {
      name: 'troopjs-utils',
      location: 'bower_components/troopjs-utils'
    },
    {
      name: 'troopjs-requirejs',
      location: 'bower_components/troopjs-requirejs'
    },
    {
      name: 'mu-template',
      location: 'bower_components/mu-template'
    },
    {
      name: 'requirejs-text',
      location: 'bower_components/requirejs-text'
    },
    {
      "name": "recorder",
      "location": "bower_components/recorder.js",
      "main": "recorder.js"
    },
    {
      "name": "troopjs-recorder",
      location: '.'
    }
  ],
  deps: [
    'when/monitor/console'
  ],
  map: {
    '*': {
      template: 'mu-template/plugin',
      text: 'requirejs-text/text',
      logger: 'troopjs-core/logger/console'
    }
  },
  config: {
    'troopjs-browser/loom/config': {
      weave: 'data-weave-2',
      woven: 'data-woven-2',
      unweave: 'data-unweave-2'
    },

    // Configure recording audio upload server.
    'troopjs-recorder/widget/service': {
      upload: {
        method: 'POST',
        url: 'http://up.qiniu.com/',
        audioParam: 'file',
        audioFormat: 1 // mp3
      }
    }
  },
  callback: function loadDeps() {
    require([
      'jquery',
      'troopjs-browser/application/widget',
      'troopjs-recorder/widget/service'
    ], function Bootstrap(jQuery, Application, RecordingService) {
      jQuery(function ready($) {
        Application($('html'), 'bootstrap', RecordingService()).start();
      });
    });
  }
});
