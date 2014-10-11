/* This is the RequireJS config file bootstraps TroopJS app. */

'use strict';

require.config({
  baseUrl: 'bower_components',
  packages: [
    {
      name: 'jquery',
      main: 'dist/jquery.js'
    },
    {
      name: 'tinycolor',
      main: 'tinycolor.js'
    },
    {
      name: 'recorder',
      location: 'recorder.js',
      main: 'recorder.js'
    },
    {
      name: 'lodash',
      main: 'dist/lodash.js'
    },
    {
      name: 'poly',
      main: 'poly.js'
    },
    {
      name: 'when',
      main: 'when.js'
    },
    {
      name: 'c3',
      main: 'c3.js'
    },
    {
      name: 'd3',
      main: 'd3.js'
    },
    {
      name: 'example',
      location: '../examples'
    },
    {
      name: 'troopjs-recorder',
      location: '../'
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
    'troopjs-recorder/service/recorder': {
      upload: {
        method: 'POST',
        audioParam: 'file',
        audioFormat: 1,
        url: 'http://up.qiniu.com',
        params: {
          token: 'WaUUPsnoEg6QXbzdO8sgIEgerhKUAaztnH_C-1Pk:VLPpjFyIVvjQd-PmNbLerpPe7_o=:eyJzY29wZSI6InRyb29wanMiLCJkZWFkbGluZSI6MTM5ODQ1MTQ3Nn0='
        }
      }
    }
  },
  callback: function loadDeps() {
  require([
    'jquery',
    'troopjs-dom/application/widget',
    'example/widget/main',
    'example/widget/volume'
  ], function Bootstrap(jQuery, Application) {
    jQuery(function ready($) {
      Application($('html'), 'bootstrap').start();
    });
  });
}
});
