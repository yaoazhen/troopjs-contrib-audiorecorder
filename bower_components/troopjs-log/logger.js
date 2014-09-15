/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "./sink/console" ], function LoggerModule(logger) {
	"use strict";

	/**
	 * This is a _virtual_ class that under normal circumstances is an alias for the {@link log.sink.console} sink.
	 *
	 * If you want to change logger sink in your application you should use the [requirejs map config](http://requirejs.org/docs/api.html#config-map)
	 * to map this class to any module that implements the {@link log.console} API.
	 *
	 * An example configuration that would change the logger to {@link log.sink.null} would look like this:
	 *
	 *     requirejs.config({
	 *       "map": {
	 *         "*": {
	 *           "troopjs-log/logger": "troopjs-log/null"
	 *         }
	 *       }
	 *     });
	 *
	 * @class log.logger
	 * @implement log.console
	 * @singleton
	 * @alias feature.logger
	 */

	return logger;
});