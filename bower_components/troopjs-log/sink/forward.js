/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./methods",
	"../config",
	"poly/array"
], function ForwardModule(METHODS, CONF) {
	"use strict";

	/**
	 * The forward log sink acts as a forwarder to other log sinks.
	 *
	 * It's mainly configured via the {@link log.config#sinks} configuration.
	 * To configure the forwarder for both the {@link log.sink.console} and the {@link log.sink.null} sink, one could
	 * do this:
	 *
	 *     require.config({
	 *       "map": {
	 *         "*": {
	 *           "troopjs-log/logger": "troopjs-log/sink/forward" // Changes the framework logger
	 *         }
	 *       },
	 *       "deps": [ "troopjs-log/config", "troopjs-log/sink/console", "troopjs-log/sink/null" ],
	 *       "callback": function (loggingConfig, consoleSink, nullSink) {
	 *         loggingConfig.sinks.push(consoleSink, nullSink); // Add sinks
	 *       }
	 *     });
	 *
	 * @class log.sink.forward
	 * @implement log.console
	 * @mixin log.config
	 * @singleton
	 * @inheritdoc log.sink.console
	 * @alias feature.logger
	 */

	var FUNCTION_APPLY = Function.apply;
	var ARRAY_SLICE = Array.prototype.slice;
	var SINKS = CONF["sinks"];

	return (function () {
		var me = this;
		var forward = function (method) {
			var args = ARRAY_SLICE.call(arguments, 1);

			SINKS.forEach(function (sink) {
				FUNCTION_APPLY.call(sink[method], me, args);
			});
		};

		METHODS.forEach(function (method) {
			me[method] = forward.bind(me, method);
		});

		return me;
	}).call({});
});