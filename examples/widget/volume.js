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

  var FREQ = 2500;

  /**
   * widget visualize recording volume with a animated line chart
   */
  return Widget.extend({
    column: function getColumnDate() {
      if(!this.volumes.length)
        return null;

      var me = this;
      var frames = this.volumes.slice(this.index);
      this.index = this.volumes.length;
      var avgs = _.range(0, frames.length).map(function () { return me.avgVolume || 0; });
      return [
        ['ellapsed'].concat(_.pluck(frames, 'ellapsed')),
        ['volume'].concat(_.pluck(frames, 'volume')),
        ['avg'].concat(avgs)
      ];
    },
    avg: function () {
      var frames = this.volumes.slice(this.avgIndex);
      this.avgVolume  = _.reduce(frames, function (sum, data) {
        return sum + data.volume;
      }, 0) / frames.length;
      this.avgIndex = this.volumes.length;
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
      }
    },
    'hub/recorder/record/started': function () {
      clearInterval(this.interval_avg);
      delete this.avgVolume;
      this.index = 0;
      this.avgIndex = 0;

      this.chart = c3.generate({
        bindTo: '#chart',
        data: {
          x: 'ellapsed',
          columns: [],
          type: 'spline',
          types: {
            'avg': 'step'
          },
          names: {
            volume: 'Volume',
            avg: 'Avg. Volume'
          }
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
      this.interval_avg = setInterval(this.avg.bind(this), FREQ);
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
