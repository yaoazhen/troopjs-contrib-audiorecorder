/*
 * This file defines a Troop UI Widget which is woven into DOM.
 *
 */
define([
  'troopjs-dom/component/widget',
  'c3',
  'lodash'
], function (Widget, c3, _) {
  'use strict';

  var FREQ = 1000;

  /**
   * widget visualize recording volume with a animated line chart
   */
  return Widget.extend({
    column: function () {
      if(!this.volumes.length)
        return null;

      return [
        ['ellapsed'].concat(_.pluck(this.volumes, 'ellapsed')),
        ['volume'].concat(_.pluck(this.volumes, 'volume'))
      ];
    },
    flow: function () {
      var me = this;
      var nextColumns;

      if (!me.flowing && (nextColumns = me.column())) {
        me.chart.flow({
          columns: nextColumns,
          duration: FREQ,
          length: 0,
          done: function () {
           delete me.flowing;
          }
        });
        me.flowing = 1;
        me.length = me.volumes.length;
        me.volumes = [];
      }
    },
    'hub/recorder/record/started': function () {
      this.chart = c3.generate({
        bindTo: '#chart',
        data: {
          x: 'ellapsed',
          columns: [],
          type: 'spline'
        },
        axis: {
          y: {
            label: 'Volume (0-100)'
          },
          x: {
            type: 'timeseries',
            tick: {
              count: 10,
              format: '%S'
            },
            label: 'Recording Time (s)'
          }
        }
      });
      this.volumes = [];
    },
    'hub/recorder/record/progress': function (ellapsed, volume) {
      this.volumes.push({
        volume: volume,
        ellapsed: ellapsed
      });
      this.flow();
    }
  });
});
