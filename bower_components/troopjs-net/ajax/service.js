/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"troopjs-core/component/service",
	"jquery",
	"troopjs-util/merge"
], function (Service, $, merge) {
	"use strict";

	/**
	 * Provides ajax as a service
	 * @class net.ajax.service
	 * @extend core.component.service
	 */

	/**
	 * @method constructor
	 */
	return Service.extend({
		"displayName" : "net/ajax/service",

		/**
		 * The ajax event
		 * @event hub/ajax
		 * @param {Object} settings Ajax settings
		 */

		/**
		 * Make ajax request.
		 * @handler
		 * @inheritdoc #event-hub/ajax
		 */
		"hub/ajax" : function ajax(settings) {
			// Request
			return $.ajax(merge.call({
				"headers": {
					"x-troopjs-request-id": new Date().getTime()
				}
			}, settings));
		}
	});
});
