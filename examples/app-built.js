/**
 *   ____ .     ____  ____  ____    ____.
 *   \   (/_\___\  (__\  (__\  (\___\  (/
 *   / ._/  ( . _   \  . /   . /  . _   \_
 * _/    ___/   /____ /  \_ /  \_    ____/
 * \   _/ \____/   \____________/   /
 *  \_t:_____r:_______o:____o:___p:/ [ troopjs - 3.0.0-pr.2+fa7fcdb ]
 *
 * @license http://troopjs.mit-license.org/ © Mikael Karon
 */


define('troopjs/version',[], "3.0.0-pr.2+fa7fcdb");

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/merge',[ "poly/object" ], function MergeModule() {
	

	/**
	 * @class util.merge
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_CONCAT = ARRAY_PROTO.concat;
	var OBJECT_PROTO = Object.prototype;
	var OBJECT_TOSTRING = OBJECT_PROTO.toString;
	var TOSTRING_OBJECT = OBJECT_TOSTRING.call(OBJECT_PROTO);
	var TOSTRING_ARRAY = OBJECT_TOSTRING.call(ARRAY_PROTO);
	var LENGTH = "length";

	/**
	 * Function that calls on an Object, to augments this object with enumerable properties from the source objects,
	 * subsequent sources will overwrite property assignments of previous sources on primitive values,
	 * while object and array values will get merged recursively.
	 * @method constructor
	 * @param {...Object} [source] One or more source objects.
	 * @return {*} Merged object
	 */
	return function merge(source) {
		var target = this;
		var key;
		var keys;
		var i;
		var j;
		var iMax;
		var jMax;
		var source_value;
		var target_value;
		var source_tostring;
		var target_tostring;

		// Check that we can use target
		if (target !== UNDEFINED && target !== NULL) {
			// Iterate arguments
			for (i = 0, iMax = arguments[LENGTH]; i < iMax; i++) {
				// Get source, and continue if it's UNDEFINED or NULL
				if ((source = arguments[i]) === UNDEFINED || source === NULL) {
					continue;
				}

				// Get source keys
				keys = Object.keys(source);

				// Iterate keys
				for (j = 0, jMax = keys[LENGTH]; j < jMax; j++) {
					key = keys[j];
					source_value = source[key];
					target_value = target[key];

					// No merge - copy source_value
					if (!(key in target)) {
						target[key] = source_value;
						continue;
					}

					// Get 'types'
					source_tostring = OBJECT_TOSTRING.call(source_value);
					target_tostring = OBJECT_TOSTRING.call(target_value);

					// Can we merge objects?
					if (target_tostring === TOSTRING_OBJECT && source_tostring === TOSTRING_OBJECT) {
						merge.call(target_value, source_value);
					}
					// Can we merge arrays?
					else if (target_tostring === TOSTRING_ARRAY && source_tostring === TOSTRING_ARRAY) {
						target[key] = ARRAY_CONCAT.call(target_value, source_value);
					}
					// No merge - override target[key]
					else {
						target[key] = source_value;
					}
				}
			}
		}

		return target;
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/mixin/config',[
	"module",
	"troopjs-util/merge"
], function (module, merge) {
	

	/**
	 * Provides configuration for the {@link compose.mixin.factory}
	 * @class compose.mixin.config
	 * @protected
	 * @alias feature.config
	 */

	return merge.call({
		/**
		 * @cfg {Object[]} pragmas Pragmas used to rewrite methods before processing
		 * @cfg {RegExp} pragmas.pattern Matching pattern
		 * @cfg {String|Function} pragmas.replace Replacement String or function
		 * @protected
		 */
		"pragmas": []
	}, module.config());
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/mixin/decorator',[ "poly/object" ], function DecoratorModule() {
	

	/**
	 * Decorator provides customized way to add properties/methods to object created by {@link compose.mixin.factory}.
	 * @class compose.mixin.decorator
	 */

	/**
	 * Creates a new decorator
	 * @method constructor
	 * @param {Function} decorate Function that defines how to override the original one.
	 * @param {Object} decorate.descriptor The object descriptor that is the current property.
	 * @param {String} decorate.name The property name.
	 * @param {Object} decorate.descriptors List of all property descriptors of the host object.
	 */
	return function Decorator(decorate) {

		// Define properties
		Object.defineProperties(this, {
			/**
			 * Function that decides what decoration is to make.
			 * @method decorate
			 * @param {Object} descriptor The object descriptor that is the current property.
			 * @param {String} name The property name.
			 * @param {Object} descriptors List of all property descriptors of the host object.
			 */
			"decorate": {
				"value": decorate
			}
		});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/unique',[],function UniqueModule() {
	

	/**
	 * @class util.unique
	 * @mixin Function
	 * @static
	 */

	var LENGTH = "length";

	/**
	 * Function that calls on an array to produces a duplicate-free version of this array, using the specified comparator otherwise
	 * strictly equals(`===`) to test object equality.
	 * @method constructor
	 * @param {Function} [fn] The comparator function.
	 * @param {Function} fn.one One element to compare.
	 * @param {Function} fn.other The other element to compare with.
	 * @return {Number} New length of array
	 */
	return function unique(comparator) {
		var arg;
		var args = this;
		var i;
		var j;
		var k;
		var iMax = args[LENGTH];

		// Did we provide a comparator?
		if (comparator) {
			comparator_outer: for (i = k = 0; i < iMax; i++) {
				arg = args[i];

				for (j = 0; j < i; j++) {
					if (comparator.call(args, arg, [j]) === true) {
						continue comparator_outer;
					}
				}

				args[k++] = arg;
			}
		}
		// Otherwise use strict equality
		else {
			outer: for (i = k = 0; i < iMax; i++) {
				arg = args[i];

				for (j = 0; j < i; j++) {
					if (arg === args[j]) {
						continue outer;
					}
				}

				args[k++] = arg;
			}
		}

		// Assign new length
		args[LENGTH] = k;

		// Return new length
		return k;
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/getargs',[],function GetArgsModule() {
	

	/**
	 * @class util.getargs
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var STR_SUBSTRING = String.prototype.substring;
	var STR_SLICE = String.prototype.slice;
	var RE_STRING = /^(["']).*\1$/;
	var RE_BOOLEAN = /^(?:false|true)$/i;
	var RE_BOOLEAN_TRUE = /^true$/i;
	var RE_DIGIT = /^\d+$/;

	/**
	 * Function that calls on a String, to parses it as function parameters delimited by commas.
	 *
	 * 	" 1  , '2' , 3  ,false,5 "
	 *
	 * results in
	 *
	 * 	[ 1, "2", 3, false, 5]
	 *
	 *
	 * and
	 *
	 * 	"'1, 2 ',  3,\"4\", 5 "
	 *
	 * results in
	 *
	 * 	[ "1, 2 ", 3, "4", 5 ]
	 *
	 * Also handles named parameters.
	 *
	 * 	"1, two=2, 3, 'key.four'=4, 5"
	 *
	 * results in
	 *
	 * 	result = [1, 2, 3, 4, 5]
	 * 	result["two"] === result[1]
	 * 	result["key.four"] === result[3]
	 *
	 * @method constructor
	 * @return {Array} the array of parsed params.
	 */
	return function getargs() {
		var me = this;
		var values = [];
		var from;
		var to;
		var index;
		var length;
		var quote = false;
		var key;
		var c;

		// Try to extract value from the specified string range.
		function extract(from, to) {
			// Nothing captured.
			if (from === to)
				return;

			var value = STR_SUBSTRING.call(me, from, to);
			if (RE_STRING.test(value)) {
				value = STR_SLICE.call(value, 1, -1);
			}
			else if (RE_BOOLEAN.test(value)) {
				value = RE_BOOLEAN_TRUE.test(value);
			}
			else if (RE_DIGIT.test(value)) {
				value = +value;
			}

			// Store value by index.
			values.push(value);

			// Store value with key or just index
			if (key !== UNDEFINED) {
				values[key] = value;
				// Reset key
				key = UNDEFINED;
			}
		}

		// Iterate string
		for (index = from = to = 0, length = me.length; index < length; index++) {

			// Get char
			c = me.charAt(index);

			switch(c) {
				case "\"" :
				/* falls through */
				case "'" :
					// If we are currently quoted...
					if (quote === c) {
						// Stop quote
						quote = false;

						// Update to
						to = index + 1;
					}
					// Otherwise
					else if (quote === false) {
						// Start quote
						quote = c;

						// Update from/to
						from = to = index;
					}
					break;

				case " " :
				/* falls through */
				case "\t" :
					// Continue if we're quoted
					if (quote) {
						to = index + 1;
						break;
					}

					// Update from/to
					if (from === to) {
						from = to = index + 1;
					}
					break;

				case "=":
					// Continue if we're quoted
					if (quote) {
						to = index + 1;
						break;
					}

					// If we captured something...
					if (from !== to) {
						// Extract substring
						key = STR_SUBSTRING.call(me, from, to);

						if (RE_STRING.test(key)) {
							key = STR_SLICE.call(key, 1, -1);
						}
					}

					from = index + 1;
					break;

				case "," :
					// Continue if we're quoted
					if (quote) {
						to = index + 1;
						break;
					}

					// If we captured something...
					extract(from, to);

					// Update from/to
					from = to = index + 1;
					break;

				default :
					// Update to
					to = index + 1;
			}
		}

		// If we captured something...
		extract(from, to);

		return values;
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/mixin/factory',[
	"./config",
	"./decorator",
	"troopjs-util/unique",
	"troopjs-util/getargs",
	"poly/object"
], function FactoryModule(config, Decorator, unique, getargs) {
	

	/**
	 * The factory module establishes the fundamental object composition in TroopJS:
	 *
	 *  - **First-class mixin** based on prototype, that supports deterministic multiple inheritance that:
	 *    - Eliminating the frustrating issues from multi-tiered, single-rooted ancestry;
	 *    - Avoid occasionally unexpected modification from prototype chain, from the prototype-based inheritance;
	 *    - Reduced the function creation overhead in classical inheritance pattern;
	 *  - **Advice decorator** for method overriding without the need for super call;
	 *  - **Declarative** "special" functions preserved for sending messages to object, that never overrides parent ones.
	 *
	 * Basically Factory takes objects or constructors as arguments and returns a new constructor, the arguments are
	 * composed from left to right, later arguments taken precedence (overriding) former arguments,
	 * and any functions be executed on construction from left to right.
	 *
	 *  		// Define the constructor.
	 *  		var MyClass = Factory(function() {
	 *  			// initialize the object...
	 *  			this.baz = "quz";
	 *  		},
	 *  		{
	 *  			foo: "bar",
	 *  			do: function(){
	 *  				return "work";
	 *  			},
	 *
	 *  			// a special handler for "signal" type with value "foo".
	 *  			"signal/foo": function() {}
	 *
	 *  		});
	 *
	 *  		var MyBehavior =  Factory({
	 *  			somethingElse: function(){}
	 *  		});
	 *
	 *  		// SubClass extends from MyClass and mixin MyBehavior
	 *  		var SubClass = MyClass.extend(function() {
	 *  			// initialize the object...
	 *  		},
	 *
	 *  		MyBehavior,
	 *  		{
	 *  			// Overwrite parent.
	 *  			foo: "baz",
	 *
	 *  			// Override parent with after call.
	 *  			do: Factory.after(function(retval) {
	 *  				return retval + "," + "play";
	 *  			}),
	 *
	 *  			move: function(){}
	 *  		});
	 *
	 *  		// Instantiate the subClass.
	 *  		var instance = SubClass.create({
	 *  			evenMore: function(){}
	 *  		});
	 *
	 *  		// "baz"
	 *  		instance.foo;
	 *
	 *  		// "quz"
	 *  		instance.baz;
	 *
	 *  		// "work play"
	 *  		instance.do();
	 *
	 *  		instance.somethingElse();
	 *  		instance.evenMore();
	 *
	 * @class compose.mixin.factory
	 * @mixin compose.mixin.config
	 * @static
	 */

	var PROTOTYPE = "prototype";
	var TOSTRING = "toString";
	var ARRAY_PROTO = Array[PROTOTYPE];
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_UNSHIFT = ARRAY_PROTO.unshift;
	var OBJECT_TOSTRING = Object[PROTOTYPE][TOSTRING];
	var TYPEOF_FUNCTION = "function";
	var DISPLAYNAME = "displayName";
	var LENGTH = "length";
	var EXTEND = "extend";
	var CREATE = "create";
	var DECORATE = "decorate";
	var CONSTRUCTOR = "constructor";
	var CONSTRUCTORS = "constructors";
	var SPECIALS = "specials";
	var GROUP = "group";
	var VALUE = "value";
	var ARGS = "args";
	var TYPE = "type";
	var TYPES = "types";
	var NAME = "name";
	var PRAGMAS = config["pragmas"];

	// A special must be in form of a function call (ended in parenthesis), and have an optional type following a slash,
	// <special>[/<type>](<arguments>)
	// e.g. sig/start(), hub(foo/bar/baz)
	var RE = /^(.*?)(?:\/([^\(]+))?\((.*)\)$/;

	/**
	 * Instantiate immediately after extending this constructor from multiple others constructors/objects.
	 * @method create
	 * @static
	 * @param {...(Function|Object)} mixin One or more constructors or objects to be mixed in.
	 * @return {Object} Object instance created out of the mixin of constructors and objects.
	 */
	function create(mixin) {
		/*jshint validthis:true*/
		return extend.apply(this, arguments)();
	}

	function extend(mixin) {
		/*jshint validthis:true*/
		var args = [ this ];
		ARRAY_PUSH.apply(args, arguments);
		return Factory.apply(null, args);
	}

	function ConstructorToString() {
		var me = this;
		var prototype = me[PROTOTYPE];

		return DISPLAYNAME in prototype
			? prototype[DISPLAYNAME]
			: OBJECT_TOSTRING.call(me);
	}

	/**
	 * Create a new constructor or to extend an existing one from multiple others constructors/objects.
	 * @method constructor
	 * @static
	 * @param {...(Function|Object)} mixin One or more constructors or objects to be mixed in.
	 * @return {compose.mixin} Object class created out of the mixin of constructors and objects.
	 */
	function Factory (mixin) {
		var special;
		var specials = [];
		var specialsLength;
		var arg;
		var args = arguments;
		var argsLength = args[LENGTH];
		var constructors = [];
		var constructorsLength;
		var name;
		var nameRaw;
		var names;
		var namesLength;
		var i;
		var j;
		var k;
		var pragma;
		var groups = specials[TYPES] = [];
		var group;
		var types;
		var type;
		var matches;
		var value;
		var descriptor;
		var prototype = {};
		var prototypeDescriptors = {};
		var constructorDescriptors = {};

		// Iterate arguments
		for (i = 0; i < argsLength; i++) {
			// Get arg
			arg = args[i];

			// If this is a function we're going to add it as a constructor candidate
			if(typeof arg === TYPEOF_FUNCTION) {
				// If this is a synthetic constructor then add (child) constructors
				if (CONSTRUCTORS in arg) {
					ARRAY_PUSH.apply(constructors, arg[CONSTRUCTORS]);
				}
				// Otherwise add as usual
				else {
					ARRAY_PUSH.call(constructors, arg);
				}

				// If we have SPECIALS then unshift arg[SPECIALS] onto specials
				if (SPECIALS in arg) {
					ARRAY_UNSHIFT.apply(specials, arg[SPECIALS]);
				}

				// Continue if this is a dead cause
				if (arg === arg[PROTOTYPE][CONSTRUCTOR]) {
					continue;
				}

				// Arg is now arg prototype
				arg = arg[PROTOTYPE];
			}

			// Get arg names
			names = Object.getOwnPropertyNames(arg);

			// Iterate names
			for (j = 0, namesLength = names[LENGTH]; j < namesLength; j++) {
				// Get name
				name = nameRaw = names[j];

				// Iterate PRAGMAS
				for (k = 0; k < PRAGMAS[LENGTH]; k++) {
					// Get pragma
					pragma = PRAGMAS[k];

					// Process name with pragma, break if replacement occurred
					if ((name = name.replace(pragma.pattern, pragma.replace)) !== nameRaw) {
						break;
					}
				}

				// Check if this matches a SPECIAL signature
				if ((matches = RE.exec(name))) {
					// Create special
					special = {};

					// Set special properties
					special[GROUP] = group = matches[1];
					// An optional type.
					if (type = matches[2]) {
						special[TYPE] = type;
					}
					special[NAME] = group + (type ? "/" + type : "");
					special[ARGS] = getargs.call(matches[3] || "");

					// If the VALUE of the special does not duck-type Function, we should not store it
					if (OBJECT_TOSTRING.call(special[VALUE] = arg[nameRaw]) !== "[object Function]") {
						continue;
					}

					// Unshift special onto specials
					ARRAY_UNSHIFT.call(specials, special);
				}
				// Otherwise just add to prototypeDescriptors
				else {
					// Get descriptor for arg
					descriptor = Object.getOwnPropertyDescriptor(arg, nameRaw);

					// Get value
					value = descriptor[VALUE];

					// If value is instanceof Advice, we should re-describe, otherwise just use the original descriptor
					prototypeDescriptors[name] = value instanceof Decorator
						? value[DECORATE](prototypeDescriptors[name] || {
							"enumerable" : true,
							"configurable" : true,
							"writable" : true
						}, name, prototypeDescriptors)
						: descriptor;
				}
			}
		}

		// Define properties on prototype
		Object.defineProperties(prototype, prototypeDescriptors);

		// Reduce constructors to unique values
		constructorsLength = unique.call(constructors);

		// Reduce specials to unique values
		specialsLength = unique.call(specials);

		// Iterate specials
		for (i = 0; i < specialsLength; i++) {
			// Get special
			special = specials[i];

			// Get special properties
			group = special[GROUP];
			type = special[TYPE];
			name = special[NAME];

			// Get or create group object
			group = group in specials
				? specials[group]
				: specials[groups[groups[LENGTH]] = group] = [];

			// Create an index for each type.
			// TODO: In the future we might want to index each nested sub type.
			if (type) {
				// Get or create types object
				types = TYPES in group
									? group[TYPES]
									: group[TYPES] = [];

				// Get or create type object
				type = type in group
								 ? group[type]
								 : group[types[types[LENGTH]] = type] = specials[name] = [];

				type[type[LENGTH]] = special;
			}

			// Store special in group/type
			group[group[LENGTH]] = special;
		}

		function Constructor () {
			// Allow to be created either via 'new' or direct invocation
			var instance = this instanceof Constructor
				? this
				: Object.create(prototype);

			var _args = arguments;
			var _i;

			// Set the constructor on instance
			Object.defineProperty(instance, CONSTRUCTOR, {
				"value" : Constructor
			});

			// Iterate constructors
			for (_i = 0; _i < constructorsLength; _i++) {
				// Capture result as _args to pass to next constructor
				_args = constructors[_i].apply(instance, _args) || _args;
			}

			return instance;
		}

		// Add PROTOTYPE to constructorDescriptors
		constructorDescriptors[PROTOTYPE] = {
			"value" : prototype
		};

		// Add CONSTRUCTORS to constructorDescriptors
		constructorDescriptors[CONSTRUCTORS] = {
			"value" : constructors
		};

		// Add SPECIALS to constructorDescriptors
		constructorDescriptors[SPECIALS] = {
			"value" : specials
		};

		constructorDescriptors[TOSTRING] = {
			"value" : ConstructorToString
		};

		// Add EXTEND to constructorDescriptors
		constructorDescriptors[EXTEND] = {
			"value" : extend
		};

		// Add CREATE to constructorDescriptors
		constructorDescriptors[CREATE] = {
			"value" : create
		};

		// Define prototypeDescriptors on Constructor
		Object.defineProperties(Constructor, constructorDescriptors);

		// Return Constructor
		return Constructor;
	}

	// Add CREATE to factoryDescriptors
	Object.defineProperty(Factory, CREATE, {
		"value": function FactoryCreate() {
			return Factory.apply(null, arguments)();
		}
	});

	return Factory;
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/sink/methods',[], function SinkMethodModule() {
	return [ "assert", "debug", "dir", "error", "info", "log", "time", "timeEnd", "trace", "warn" ]
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/sink/console',[
	"./methods",
	"poly/array",
	"poly/function"
], function ConsoleModule(METHODS) {
	

	/**
	 * This class implements the {@link log.console} API and can acts like a sink for {@link log.sink.forward}.
	 * @localdoc
	 * On platforms where the native `console` object doesn't support the full {@link log.console} API,
	 * this class acts like a polyfill for the missing methods.
	 * @class log.sink.console
	 * @implement log.console
	 * @singleton
	 * @alias feature.logger
	 */

	/**
	 * Creates a poly-filled version of the console object
	 * @method constructor
	 * @param {console} console Client console object
	 * @ignore
	 */
	return (function (console) {
		var me = this;
		var nop = function () {};

		METHODS.forEach(function (method) {
			me[method] = this.call(console[method] || nop, console);
		}, Function.prototype.bind);

		return me;
	}).call({}, ( this || window ).console || {});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/logger',[ "./sink/console" ], function LoggerModule(logger) {
	

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
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/mixin/base',[
	"troopjs-compose/mixin/factory",
	"troopjs-log/logger"
], function ObjectBaseModule(Factory, logger) {
	var INSTANCE_COUNTER = 0;
	var INSTANCE_COUNT = "instanceCount";

	/**
	 * Base object with instance count.
	 * @class core.mixin.base
	 * @implement compose.mixin
	 * @mixin log.logger
	 */

	/**
	 * @method create
	 * @static
	 * @inheritable
	 * @inheritdoc
	 * @return {core.mixin.base} Instance of this class
	 */

	/**
	 * @method extend
	 * @static
	 * @inheritable
	 * @inheritdoc
	 * @return {core.mixin.base} The extended subclass
	 */

	/**
	 * Creates a new component instance
	 * @method constructor
	 */
	return Factory(function ObjectBase() {
		// Update instance count
		this[INSTANCE_COUNT] = ++INSTANCE_COUNTER;
	}, logger, {
		/**
		 * Instance counter
		 * @private
		 * @readonly
		 * @property {Number}
		 */
		"instanceCount" : INSTANCE_COUNTER,

		/**
		 * The hierarchical namespace for this component that indicates it's functionality.
		 * @private
		 * @readonly
		 * @property {String}
		 */
		"displayName" : "core/mixin/base",

		/**
		 * Gives string representation of this component instance.
		 * @return {String} {@link #displayName}`@`{@link #instanceCount}
		 * @protected
		 */
		"toString" : function _toString() {
			var me = this;

			return me.displayName + "@" + me[INSTANCE_COUNT];
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/event/runner/sequence',[ "when" ], function SequenceModule(when) {
	

	/**
	 * @class core.event.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var HEAD = "head";
	var NEXT = "next";
	var CALLBACK = "callback";
	var CONTEXT = "context";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **asynchronously** in "sequence", passing to each handler the same arguments from emitting.
	 * @return {Promise}
	 */
	return function sequence(event, handlers, args) {
		var results = [];
		var resultsCount = 0;
		var candidates = [];
		var candidatesCount = 0;
		var handler;

		// Copy from handlers list to candidates array
		for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
			candidates[candidatesCount++] = handler;
		}

		// Reset candidate count
		candidatesCount = 0;

		/**
		 * Internal function for sequential execution of candidates
		 * @ignore
		 * @param {Array} [result] result from previous handler callback
		 * @param {Boolean} [skip] flag indicating if this result should be skipped
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (result, skip) {
			/*jshint curly:false*/
			var candidate;

			// Store result if no skip
			if (skip !== true) {
				results[resultsCount++] = result;
			}

			// Return promise of next callback, or a promise resolved with result
			return (candidate = candidates[candidatesCount++]) !== UNDEFINED
				? when(candidate[CALLBACK].apply(candidate[CONTEXT], args), next)
				: when.resolve(results);
		};

		return next(args, true);
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/event/emitter',[
	"../mixin/base",
	"./runner/sequence"
], function EventEmitterModule(Base, sequence) {
	

	/**
	 * This event module is heart of all TroopJS event-based whistles, from the API names it's aligned with Node's events module,
	 * while behind the regularity it's powered by a highly customizable **event runner** mechanism, which makes it supports for both:
	 *
	 *  - **synchronous event**: all your event handlers are run in a single loop.
	 *  - **async event with promise**: you can return a promise where the next handler will be called upon the
	 *  completion of that promise.
	 *
	 * Event runner can even determinate the **parameters passing** strategy among handlers, which forms in two flavours:
	 *
	 *  - sequence: where each handler receives the arguments passed to {@link #method-emit}.
	 *  - pipeline: where a handler receives the return value of the previous one.
	 *
	 * @class core.event.emitter
	 * @extend core.mixin.base
	 */

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";
	var HANDLERS = "handlers";
	var LENGTH = "length";
	var TYPE = "type";
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var TAIL = "tail";
	var NEXT = "next";

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Base.extend(function Emitter() {
		/**
		 * Handlers attached to this component, addressable either by key or index
		 * @protected
		 * @readonly
		 * @property {Array} handlers
		 */
		this[HANDLERS] = [];
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event type.
		 * @chainable
		 * @param {String} type The event type to subscribe to.
		 * @param {Object} context The context to scope the callback to.
		 * @param {Function} callback The event listener function.
		 * @param {*} [data] Handler data
		 */
		"on" : function on(type, context, callback, data) {
			var me = this;
			var handlers;
			var handler;

			// Get callback from next arg
			if (callback === UNDEFINED) {
				throw new Error("no callback provided");
			}

			// Have handlers
			if ((handlers = me[HANDLERS][type]) !== UNDEFINED) {
				// Create new handler
				handler = {};

				// Prepare handler
				handler[CALLBACK] = callback;
				handler[CONTEXT] = context;
				handler[DATA] = data;

				// Set tail handler
				handlers[TAIL] = TAIL in handlers
					// Have tail, update handlers[TAIL][NEXT] to point to handler
					? handlers[TAIL][NEXT] = handler
					// Have no tail, update handlers[HEAD] to point to handler
					: handlers[HEAD] = handler;
			}
			// No handlers
			else {
				// Get HANDLERS
				handlers = me[HANDLERS];

				// Create type handlers
				handlers = handlers[handlers[LENGTH]] = handlers[type] = {};

				// Prepare handlers
				handlers[TYPE] = type;
				handlers[HEAD] = handlers[TAIL] = handler = {};

				// Prepare handler
				handler[CALLBACK] = callback;
				handler[CONTEXT] = context;
				handler[DATA] = data;
			}

			return me;
		},

		/**
		 * Remove callback(s) from a subscribed event type, if no callback is specified,
		 * remove all callbacks of this type.
		 * @chainable
		 * @param {String} type The event type subscribed to
		 * @param {Object} [context] The context to scope the callback to remove
		 * @param {Function} [callback] The event listener function to remove
		 */
		"off" : function off(type, context, callback) {
			var me = this;
			var handlers;
			var handler;
			var head;
			var tail;

			// Have handlers
			if ((handlers = me[HANDLERS][type]) !== UNDEFINED) {
				// Have HEAD in handlers
				if (HEAD in handlers) {
					// Iterate handlers
					for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
						// Should we remove?
						remove : {
							// If no context or context does not match we should break
							if (context && handler[CONTEXT] !== context) {
								break remove;
							}

							// If no callback or callback does not match we should break
							if (callback && handler[CALLBACK] !== callback) {
								break remove;
							}

							// Remove this handler, just continue
							continue;
						}

						// It there's no head - link head -> tail -> handler
						if (!head) {
							head = tail = handler;
						}
						// Otherwise just link tail -> tail[NEXT] -> handler
						else {
							tail = tail[NEXT] = handler;
						}
					}

					// If we have both head and tail we should update handlers
					if (head && tail) {
						// Set handlers HEAD and TAIL
						handlers[HEAD] = head;
						handlers[TAIL] = tail;

						// Make sure to remove NEXT from tail
						delete tail[NEXT];
					}
					// Otherwise we remove the handlers list
					else {
						delete handlers[HEAD];
						delete handlers[TAIL];
					}
				}
			}

			return me;
		},

		/**
		 * Trigger an event which notifies each of the listeners of their subscribing,
		 * optionally pass data values to the listeners.
		 *
		 *  A sequential runner, is the default runner for this module, in which all handlers are running
		 *  with the same argument data specified by the {@link #emit} function.
		 *  Each handler will wait for the completion for the previous one if it returns a promise.
		 *
		 * @param {String|Object} event The event type to emit, or an event object
		 * @param {String} [event.type] The event type name.
		 * @param {Function} [event.runner] The runner function that determinate how the handlers are executed, overrides the
		 * default behaviour of the event emitting.
		 * @param {...*} [args] Data params that are passed to the listener function.
		 * @return {*} Result returned from runner.
		 */
		"emit" : function emit(event, args) {
			var me = this;
			var type = event;
			var handlers;
			var runner;

			// If event is a plain string, convert to object with props
			if (OBJECT_TOSTRING.call(event) === TOSTRING_STRING) {
				// Recreate event
				event = {};
				event[RUNNER] = runner = sequence;
				event[TYPE] = type;
			}
			// If event duck-types an event object we just override or use defaults
			else if (TYPE in event) {
				event[RUNNER] = runner = event[RUNNER] || sequence;
				type = event[TYPE];
			}
			// Otherwise something is wrong
			else {
				throw Error("first argument has to be of type '" + TOSTRING_STRING + "' or have a '" + TYPE + "' property");
			}

			// Get handlers[type] as handlers
			if ((handlers = me[HANDLERS][type]) === UNDEFINED) {
				// Get HANDLERS
				handlers = me[HANDLERS];

				// Create type handlers
				handlers = handlers[handlers[LENGTH]] = handlers[type] = {};

				// Prepare handlers
				handlers[TYPE] = type;
			}

			// Return result from runner
			return runner.call(me, event, handlers, ARRAY_SLICE.call(arguments, 1));
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/runner/sequence',[ "poly/array" ], function SequenceModule() {
	

	/**
	 * @class core.component.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var HEAD = "head";
	var NEXT = "next";
	var CALLBACK = "callback";
	var CONTEXT = "context";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **synchronously** in "sequence", passing to each handler the same arguments from emitting.
	 * @return {*[]} Result from each executed handler
	 */
	return function sequence(event, handlers, args) {
		var context = event[CONTEXT];
		var callback = event[CALLBACK];
		var candidate;
		var candidates = [];
		var candidatesCount = 0;
		var result;

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			// Filter candidate[CONTEXT] if we have context
			if (context !== UNDEFINED && candidate[CONTEXT] !== context) {
				continue;
			}

			// Filter candidate[CALLBACK] if we have callback
			if (callback && candidate[CALLBACK] !== callback) {
				continue;
			}

			candidates[candidatesCount++] = candidate;
		}

		// Reduce and return
		return candidates.reduce(function (current, candidate) {
			// Store result if not UNDEFINED
			if (current !== UNDEFINED) {
				result = current;
			}

			// If result is _not_ false, return result of candidate[CALLBACK], otherwise just false
			return result !== false
				? candidate[CALLBACK].apply(candidate[CONTEXT], args)
				: result;
		}, UNDEFINED);
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/registry/component',[
	"../mixin/base",
	"poly/array"
], function RegistryModule(Base) {
	

	/**
	 * A light weight implementation to register key/value pairs by key and index
	 * @class core.registry.component
	 * @extend core.mixin.base
	 */

	var UNDEFINED;
	var LENGTH = "length";
	var INDEX = "index";
	var KEY = "key";
	var VALUE = "value";
	var INDEX_KEY = "index_key";
	var INDEX_POS = "index_pos";
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Base.extend(function Registry() {
		/**
		 * Registry key storage
		 * @private
		 * @readonly
		 * @property {Object[]} index_key
		 * @property {String} index_key.key Entry key
		 * @property {Number} index_key.index Entry index
		 * @property {*} index_key.value Entry value
		 */
		this[INDEX_KEY] = {};

		/**
		 * Registry pos storage
		 * @private
		 * @readonly
		 * @property {Object[]} index_pos
		 * @property {String} index_pos.key Entry key
		 * @property {Number} index_pos.index Entry index
		 * @property {*} index_pos.value Entry value
		 */
		this[INDEX_POS] = [];
	}, {
		"displayName": "core/registry/component",

		/**
		 * Either gets or puts values into the registry.
		 *
		 * - If no key is provided, all entries in the registry are returned.
		 * - If no value is provided the current value for key is returned.
		 * - If value is provided it replaces the current value for the key
		 * @param {String|Number} [key] Entry key or index
		 * @param {*} [value] Entry value
		 * @return {*} All values if no key, current value for key if no value provided, otherwise the provided value if a new entry is created
		 * @throws Error if a new entry is created and key is not of type String
		 */
		"access": function access(key, value) {
			var index_key = this[INDEX_KEY];
			var index_pos = this[INDEX_POS];
			var result;
			var argc;

			// Reading _all_
			if ((argc = arguments[LENGTH]) === 0) {
				result = index_pos.map(function (item) {
					return item[VALUE];
				});
			}
			else {
				result = (typeof key === 'number' ? index_pos : index_key)[key];

				// Reading
				if (argc === 1) {
					result = result !== UNDEFINED ? result[VALUE] : UNDEFINED;
				}
				// Writing
				else {
					// Replace existing entry
					if (result !== UNDEFINED) {
						result = result[VALUE] = value;
					}
					// Check type of key (as now we're creating a new one)
					else if (OBJECT_TOSTRING.call(key) !== TOSTRING_STRING) {
						throw Error("key has to be of type String");
					}
					// Create new entry
					else {
						result = {};
						result = index_key[result[KEY] = key] = index_pos[result[INDEX] = index_pos[LENGTH]] = result;
						result = result[VALUE] = value;
					}
				}
			}

			return result;
		},

		/**
		 * Removes entries from the registry
		 * TODO: Fixed screwed up index when item is removed from registry.
		 *
		 * - If no key is provided, all entries in the registry are removed.
		 * - Otherwise only the corresponding entry for key is removed.
		 * @param {String|Number} [key] Entry key or index
		 *
		 */
		"remove": function remove(key) {
			var me = this;
			var result;
			var index_key = me[INDEX_KEY];
			var index_pos = me[INDEX_POS];

			// Remove all entries
			if (arguments[LENGTH] === 0) {
				me[INDEX_KEY] = {};
				me[INDEX_POS] = [];
			}
			// Remove entry by key
			else if ((result = index_key[key]) !== UNDEFINED) {
				delete index_key[result[KEY]];
				delete index_pos[result[INDEX]];
			}
		},

		"compact": function compact() {

		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/runner/pattern',[], function PatternModule() {
return /^(?:initi|fin)alized?$/;
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/runner/pipeline',[
	"./pattern",
	"when"
], function PipelineModule(RE_PHASE, when) {
	

	/**
	 * @class core.pubsub.runner.pipeline
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HEAD = "head";
	var NEXT = "next";
	var PHASE = "phase";
	var MEMORY = "memory";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that filters and executes candidates in pipeline without overlap
	 * @return {Promise}
	 */
	return function pipeline(event, handlers, args) {
		var context = event[CONTEXT];
		var callback = event[CALLBACK];
		var candidate;
		var candidates = [];
		var candidatesCount = 0;

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			// Filter candidate[CONTEXT] if we have context
			if (context !== UNDEFINED && candidate[CONTEXT] !== context) {
				continue;
			}

			// Filter candidate[CALLBACK] if we have callback
			if (callback !== UNDEFINED && candidate[CALLBACK] !== callback) {
				continue;
			}

			// Add to candidates
			candidates[candidatesCount++] = candidate;
		}

		// Reset candidatesCount
		candidatesCount = 0;

		/**
		 * Internal function for piped execution of candidates candidates
		 * @ignore
		 * @param {Array} [result] result from previous candidate callback
		 * @return {Promise} promise of next candidate callback execution
		 */
		var next = function (result) {
			/*jshint curly:false*/
			var context;
			var candidate;
			var type;

			// Check that result is not UNDEFINED and not equals to args
			if (result !== UNDEFINED && result !== args) {
				// Update args to either result or result wrapped in a new array
				args = (type = OBJECT_TOSTRING.call(result)) === TOSTRING_ARRAY  // if type is TOSTRING_ARRAY
					|| type === TOSTRING_ARGUMENTS                                 // or type is TOSTRING_ARGUMENTS
					? result                                                       // then result is array-like enough to be passed to .apply
					: [ result ];                                                  // otherwise we should just wrap it in a new array
			}

			// TODO Needs cleaner implementation
			// Iterate until we find a candidate in a blocked phase
			while ((candidate = candidates[candidatesCount++]) // Has next candidate
				&& (context = candidate[CONTEXT])                // Has context
				&& RE_PHASE.test(context[PHASE]));               // In blocked phase

			// Return promise of next callback, or promise resolved with args
			return candidate !== UNDEFINED
				? when(candidate[CALLBACK].apply(context, args), next)
				: when.resolve(handlers[MEMORY] = args);
		};

		return next(args);
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/from',[ "../mixin/decorator" ], function FromDecoratorModule(Decorator) {
	

	/**
	 * @class compose.decorator.from
	 * @static
	 * @alias feature.decorator
	 */

	var UNDEFINED;
	var VALUE = "value";
	var PROTOTYPE = "prototype";

	/**
	 * Create a decorator that is to lend from a particular property from this own or the other factory.
	 * @method constructor
	 * @param {Function} [which] The other class from which to borrow the method, otherwise to borrow from the host class.
	 * @param {String} [prop] The property name to borrow from, otherwise to borrow the same property name.
	 * @return {compose.mixin.decorator}
	 */
	return function from(which, prop) {
		// Shifting arguments.
		if (typeof which === "string") {
			prop = which;
			which = UNDEFINED;
		}

		return new Decorator(function (descriptor, name, descriptors) {
			// To override a specified property, otherwise simply this property.
			name = prop || name;

			// Property is from the the other's prototype, otherwise from own descriptor.
			descriptor[VALUE] = which
				? which[PROTOTYPE][name]
				: descriptors[name][VALUE];

			return descriptor;
		});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/hub',[
	"../event/emitter",
	"./runner/pipeline",
	"troopjs-compose/decorator/from"
], function HubModule(Emitter, pipeline, from) {
	

	/**
	 * The centric "bus" that handlers publishing and subscription.
	 *
	 * ## Memorized emitting
	 * A fired event will memorize the "current" value of each event. Each executor may have it's own interpretation
	 * of what "current" means.
	 *
	 * **Note:** It's NOT necessarily to pub/sub on this module, prefer to
	 * use methods like {@link core.component.gadget#publish publish} and {@link core.component.gadget#subscribe subscribe}
	 * that are provided as shortcuts.
	 *
	 * @class core.pubsub.hub
	 * @extend core.event.emitter
	 * @singleton
	 */

	var UNDEFINED;
	var MEMORY = "memory";
	var HANDLERS = "handlers";
	var RUNNER = "runner";
	var TYPE = "type";

	/**
	 * @method create
	 * @static
	 * @hide
	 */

	/**
	 * @method extend
	 * @static
	 * @hide
	 */

	/**
	 * @method constructor
	 * @hide
	 */

	/**
	 * @method on
	 * @inheritdoc
	 * @private
	 */

	/**
	 * @method off
	 * @inheritdoc
	 * @private
	 */

	/**
	 * @method emit
	 * @inheritdoc
	 * @private
	 */

	return Emitter.create({
		"displayName": "core/pubsub/hub",

		/**
		 * Listen to an event that are emitted publicly.
		 * @chainable
		 * @inheritdoc #on
		 * @method
		 */
		"subscribe" : from("on"),

		/**
		 * Remove a public event listener.
		 * @chainable
		 * @inheritdoc #off
		 * @method
		 */
		"unsubscribe" : from("off"),

		/**
		 * Emit a public event that can be subscribed by other components.
		 *
		 * Handlers are run in a pipeline, in which each handler will receive muted
		 * data params depending on the return value of the previous handler:
		 *
		 *   - The original data params from {@link #publish} if this's the first handler, or the previous handler returns `undefined`.
		 *   - One value as the single argument if the previous handler return a non-array.
		 *   - Each argument value deconstructed from the returning array of the previous handler.
		 *
		 * @param {String} type The topic to publish.
		 * @param {...*} [args] Additional params that are passed to the handler function.
		 * @return {Promise}
		 */
		"publish" : function publish(type, args) {
			var me = this;

			// Prepare event object
			var event = {};
			event[TYPE] = type;
			event[RUNNER] = pipeline;

			// Modify first argument
			arguments[0] = event;

			// Delegate the actual emitting to event emitter.
			return me.emit.apply(me, arguments);
		},

		/**
		 * Returns value in handlers MEMORY
		 * @param {String} type event type to peek at
		 * @param {*} [value] Value to use _only_ if no memory has been recorder
		 * @return {*} Value in MEMORY
		 */
		"peek": function peek(type, value) {
			var handlers;

			return (handlers = this[HANDLERS][type]) === UNDEFINED || !(MEMORY in handlers)
				? value
				: handlers[MEMORY];
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/registry',[
	"../registry/component",
	"../pubsub/hub"
], function ComponentRegistryModule(Registry, hub) {
	

	/**
	 * @class core.component.registry
	 * @extend core.registry.component
	 * @singleton
	 */

	/**
	 * @method create
	 * @static
	 * @hide
	 */

	/**
	 * @method extend
	 * @static
	 * @hide
	 */

	/**
	 * @method constructor
	 * @hide
	 */

	return Registry.create(function ComponentRegistry() {
		var me = this;

		// Register the hub
		me.access(hub.toString(), hub);

		// Register ourselves
		me.access(me.toString(), me);
	}, {
		"displayName": "core/component/registry"
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/task/registry',[
	"../registry/component",
	"../component/registry"
], function TaskRegistryModule(Registry, componentRegistry) {
	

	/**
	 * @class core.task.registry
	 * @extend core.registry.component
	 * @singleton
	 */

	/**
	 * @method create
	 * @static
	 * @hide
	 */

	/**
	 * @method extend
	 * @static
	 * @hide
	 */

	/**
	 * @method constructor
	 * @hide
	 */

	return Registry.create(function TaskRegistry() {
		var me = this;

		// Register ourselves
		componentRegistry.access(me.toString(), me);
	}, {
		"displayName": "core/task/registry"
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/around',[ "../mixin/decorator" ], function AroundDecoratorModule(Decorator) {
	

	/**
	 * @class compose.decorator.around
	 * @static
	 * @alias feature.decorator
	 */

	var VALUE = "value";
	var NOP = function () {};

	/**
	 * Create a decorator that is to override an existing method.
	 * @method constructor
	 * @param {Function} func The decorator function which receives the original function as parameter and is supposed to
	 * return a function that is to replace the original.
	 * @return {compose.mixin.decorator}
	 */
	return function around(func) {
		return new Decorator(function (descriptor) {
			descriptor[VALUE] = func(descriptor[VALUE] || NOP);
			return descriptor;
		});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/base',[
	"../event/emitter",
	"./runner/sequence",
	"troopjs-compose/mixin/config",
	"./registry",
	"../task/registry",
	"troopjs-util/merge",
	"troopjs-compose/decorator/around",
	"when",
	"poly/array"
], function ComponentModule(Emitter, sequence, COMPOSE_CONF, componentRegistry, taskRegistry, merge, around, when) {
	

	/**
	 * Imagine component as an object that has predefined life-cycle, with the following phases:
	 *
	 *   1. initialize
	 *   1. start
	 *   1. started
	 *   1. stop
	 *   1. finalize
	 *   1. finalized
	 *
	 * Calls on {@link #start} or {@link #stop} method of the component will trigger any defined signal
	 * handlers declared.
	 *
	 * 	var app = Component.extend({
	 * 		"displayName": "my/component/app",
	 *
	 * 		// Signal handler for "start" phase
	 * 		"sig/start": function start() {
	 * 			// bind resize handler.
	 * 			$(window).on('resize.app', $.proxy(this.onResize, this));
	 * 		},
	 *
	 * 		// Signal handler for "finalize" phase
	 * 		"sig/finalize": function finalize() {
	 * 			// cleanup the handler.
	 * 			$(window).off('resize.app');
	 * 		},
	 *
	 * 		"onResize": function onResize(argument) {
	 * 			// window resized.
	 * 		}
	 * 	});
	 *
	 * 	$.ready(function on_load() {
	 * 		app.start();
	 * 	});
	 *
	 * 	$(window).unload(function on_unload (argument) {
	 * 	  app.end();
	 * 	});
	 *
	 * @class core.component.base
	 * @extend core.event.emitter
	 */

	var UNDEFINED;
	var FALSE = false;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var CONFIGURATION = "configuration";
	var RUNNER = "runner";
	var HANDLERS = "handlers";
	var HEAD = "head";
	var TAIL = "tail";
	var CONTEXT = "context";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var PHASE = "phase";
	var TASK = "task";
	var STOP = "stop";
	var INITIALIZE = "initialize";
	var STARTED = "started";
	var FINALIZED = "finalized";
	var FINISHED = "finished";
	var SIG = "sig";
	var SIG_SETUP = SIG + "/setup";
	var SIG_ADD = SIG + "/add";
	var SIG_REMOVE = SIG + "/remove";
	var SIG_TEARDOWN = SIG + "/teardown";
	var ON = "on";
	var EVENT_TYPE_SIG = new RegExp("^" + SIG + "/(.+)");

	/**
	 * Current lifecycle phase
	 * @readonly
	 * @protected
	 * @property {"initialized"|"started"|"stopped"|"finalized"} phase
	 */

	/**
	 * Initialize signal
	 * @event sig/initialize
	 * @localdoc Triggered when this component enters the initialize phase
	 * @param {...*} [args] Initialize arguments
	 */

	/**
	 * Start signal
	 * @event sig/start
	 * @localdoc Triggered when this component enters the start phase
	 * @param {...*} [args] Initialize arguments
	 */

	/**
	 * Stop signal
	 * @localdoc Triggered when this component enters the stop phase
	 * @event sig/stop
	 * @param {...*} [args] Stop arguments
	 */

	/**
	 * Finalize signal
	 * @event sig/finalize
	 * @localdoc Triggered when this component enters the finalize phase
	 * @param {...*} [args] Finalize arguments
	 */

	/**
	 * Setup signal
	 * @event sig/setup
	 * @localdoc Triggered when the first event handler of a particular type is added via {@link #method-on}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 * @param {*} [data]
	 */

	/**
	 * Add signal
	 * @event sig/add
	 * @localdoc Triggered when a event handler of a particular type is added via {@link #method-on}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 * @param {*} [data]
	 */

	/**
	 * Remove signal
	 * @event sig/remove
	 * @localdoc Triggered when a event handler of a particular type is removed via {@link #method-off}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 */

	/**
	 * Teardown signal
	 * @event sig/teardown
	 * @localdoc Triggered when the last event handler of type is removed for a particular type via {@link #method-off}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 */

	/**
	 * Task signal
	 * @event sig/task
	 * @localdoc Triggered when this component starts a {@link #method-task}.
	 * @param {Promise} task Task
	 * @param {Object} task.context Task context
	 * @param {Date} task.started Task start date
	 * @param {String} task.name Task name
	 * @return {Promise}
	 */

	/**
	 * Handles the component start
	 * @handler sig/start
	 * @inheritdoc #event-sig/start
	 * @template
	 * @return {Promise}
	 */

	/**
	 * Handles the component stop
	 * @handler sig/stop
	 * @inheritdoc #event-sig/stop
	 * @template
	 * @return {Promise}
	 */

	/**
	 * Handles an event setup
	 * @handler sig/setup
	 * @inheritdoc #event-sig/setup
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * Handles an event add
	 * @handler sig/add
	 * @inheritdoc #event-sig/add
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * Handles an event remove
	 * @handler sig/remove
	 * @inheritdoc #event-sig/remove
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * Handles an event teardown
	 * @handler sig/teardown
	 * @inheritdoc #event-sig/teardown
	 * @template
	 * @return {*|Boolean}
	 */

	// Add pragma for signals and events.
	COMPOSE_CONF.pragmas.push({
		"pattern": /^(?:sig|on)\/.+/,
		"replace": "$&()"
	});

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Emitter.extend(function Component() {
		var me = this;
		var specials = me.constructor.specials[SIG] || ARRAY_PROTO;

		// Iterate specials
		specials.forEach(function (special) {
			me.on(special[NAME], special[VALUE]);
		});

		/**
		 * Configuration for this component, access via {@link #configure}
		 * @private
		 * @readonly
		 * @property {Object} configuration
		 */
		me[CONFIGURATION] = {};
	}, {
		"displayName" : "core/component/base",

		/**
		 * Handles the component initialization.
		 * @inheritdoc #event-sig/initialize
		 * @localdoc Registers event handlers declared ON specials
		 * @handler
		 * @return {Promise}
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;

			// Register component
			componentRegistry.access(me.toString(), me);

			// Initialize ON specials
			return when.map(me.constructor.specials[ON] || ARRAY_PROTO, function (special) {
				return me.on(special[TYPE], special[VALUE]);
			});
		},

		/**
		 * Handles the component finalization.
		 * @inheritdoc #event-sig/finalize
		 * @localdoc Un-registers all handlers
		 * @handler
		 * @return {Promise}
		 */
		"sig/finalize" : function onFinalize() {
			var me = this;

			// Unregister component
			componentRegistry.remove(me.toString());

			// Finialize all handlers, in reverse
			return when.map(me[HANDLERS].reverse(), function (handlers) {
				return me.off(handlers[TYPE]);
			});
		},

		/**
		 * Handles a component task
		 * @handler sig/task
		 * @inheritdoc #event-sig/task
		 * @template
		 * @return {Promise}
		 */
		"sig/task": function onTask(task) {
			// Compute task key
			var key = task[NAME] + "@" + task[STARTED];

			// Register task with remove callback
			return taskRegistry.access(key, task.ensure(function () {
				taskRegistry.remove(key);
			}));
		},

		/**
		 * Add to the component {@link #configuration configuration}, possibly {@link util.merge merge} with the existing one.
		 *
		 * 		var List = Component.extend({
		 * 			"sig/start": function start() {
		 * 				// configure the List.
		 * 				this.configure({
		 * 					"type": "list",
		 * 					"cls": ["list"]
		 * 				});
		 * 			}
		 * 		});
		 * 		var Dropdown = List.extend({
		 * 			"sig/start": function start() {
		 * 				// configure the Dropdown.
		 * 				this.configure({
		 * 					"type": "dropdown",
		 * 					"cls": ["dropdown"],
		 * 					"shadow": true
		 * 				});
		 * 			}
		 * 		});
		 *
		 * 		var dropdown = new Dropdown();
		 *
		 * 		// Overwritten: "dropdown"
		 * 		print(dropdown.configuration.id);
		 * 		// Augmented: ["list","dropdown"]
		 * 		print(dropdown.configuration.cls);
		 * 		// Added: true
		 * 		print(dropdown.configuration.shadow);
		 *
		 * @param {...Object} [config] Config(s) to add.
		 * @return {Object} The new configuration.
		 */
		"configure" : function configure(config) {
			return merge.apply(this[CONFIGURATION], arguments);
		},

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 * @param {String} type The event type to subscribe to.
		 * @param {Function} callback The event listener function.
		 * @param {*} [data] Handler data
		 * @fires sig/setup
		 * @fires sig/add
		 */
		"on": around(function (fn) {
			return function on(type, callback, data) {
				var me = this;
				var event;
				var handlers;
				var result;

				// If this type is NOT a signal we don't have to event try
				if (!EVENT_TYPE_SIG.test(type)) {
					// Initialize the handlers for this type if they don't exist.
					if ((handlers = me[HANDLERS][type]) === UNDEFINED) {
						handlers = {};
						handlers[TYPE] = type;
					}

					// Initialize event
					event = {};
					event[RUNNER] = sequence;

					// If this is the first handler signal SIG_SETUP
					if (!(HEAD in handlers)) {
						event[TYPE] = SIG_SETUP;
						result = me.emit(event, handlers, type, callback, data);
					}

					// If we were not interrupted
					if (result !== FALSE) {
						// Signal SIG_ADD
						event[TYPE] = SIG_ADD;
						result = me.emit(event, handlers, type, callback, data);
					}

					// If we were not interrupted and `handlers` is not the list for `type` append it
					if (result !== FALSE && me[HANDLERS][type] !== handlers) {
						ARRAY_PUSH.call(me[HANDLERS], me[HANDLERS][type] = handlers);
					}
				}

				// If we were not interrupted return result from super.on, otherwise just this
				return result !== FALSE
						? fn.call(me, type, me, callback, data)
						: me;
			};
		}),

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 * @param {String} type The event type subscribed to
		 * @param {Function} [callback] The event listener function to remove
		 * @fires sig/remove
		 * @fires sig/teardown
		 */
		"off": around(function(fn) {
			return function off(type, callback) {
				var me = this;
				var event;
				var handlers;
				var result;

				if (!EVENT_TYPE_SIG.test(type)) {
					// Initialize the handlers for this type if they don't exist.
					if ((handlers = me[HANDLERS][type]) === UNDEFINED) {
						handlers = {};
						handlers[TYPE] = type;
					}

					// Initialize event
					event = {};
					event[RUNNER] = sequence;

					// Signal SIG_REMOVE
					event[TYPE] = SIG_REMOVE;
					result = me.emit(event, handlers, type, callback);

					// If we were not interrupted and this is the last handler signal SIG_TEARDOWN
					if (result !== FALSE && handlers[HEAD] === handlers[TAIL]) {
						event[TYPE] = SIG_TEARDOWN;
						result = me.emit(event, handlers, type, callback);
					}

					// If we were not interrupted and `handlers` is not the list for `type` append it
					if (result !== FALSE && me[HANDLERS][type] !== handlers) {
						ARRAY_PUSH.call(me[HANDLERS], me[HANDLERS][type] = handlers);
					}
				}

				// If we were not interrupted return result from super.off, otherwise just this
				return result !== FALSE
					? fn.call(me, type, me, callback)
					: me;
			};
		}),

		/**
		 * Signals the component
		 * @param {String} _signal Signal
		 * @param {...*} [args] signal arguments
		 * @return {Promise}
		 */
		"signal": function signal(_signal, args) {
			var me = this;

			// Modify first argument
			arguments[0] = "sig/" + _signal;

			// Emit
			return me.emit.apply(me, arguments);
		},

		/**
		 * Start the component life-cycle, sends out {@link #event-sig/initialize} and then {@link #event-sig/start}.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 * @fires sig/initialize
		 * @fires sig/start
		 */
		"start" : function start(args) {
			var me = this;
			var signal = me.signal;
			var phase;

			// Check PHASE
			if ((phase = me[PHASE]) !== UNDEFINED && phase !== FINALIZED) {
				return when.resolve(UNDEFINED);
			}

			// Modify args to change signal (and store in PHASE)
			args = [ me[PHASE] = INITIALIZE ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function initialized(_initialized) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "start";

				return signal.apply(me, args).then(function started(_started) {
					// Update phase
					me[PHASE] = STARTED;

					// Return concatenated result
					return ARRAY_PROTO.concat(_initialized, _started);
				});
			});
		},

		/**
		 * Stops the component life-cycle.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 * @fires sig/stop
		 * @fires sig/finalize
		 */
		"stop" : function stop(args) {
			var me = this;
			var signal = me.signal;

			// Check PHASE
			if (me[PHASE] !== STARTED) {
				return when.resolve(UNDEFINED);
			}

			// Modify args to change signal (and store in PHASE)
			args = [ me[PHASE] = STOP ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function stopped(_stopped) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "finalize";

				return signal.apply(me, args).then(function finalized(_finalized) {
					// Update phase
					me[PHASE] = FINALIZED;

					// Return concatenated result
					return ARRAY_PROTO.concat(_stopped, _finalized);
				});
			});
		},

		/**
		 * Schedule a new promise that runs on this component, sends a {@link #event-sig/task} once finished.
		 *
		 * **Note:** It's recommended to use **this method instead of an ad-hoc promise** to do async lift on this component,
		 * since in additional to an ordinary promise, it also helps to track the context of any running promise,
		 * including it's name, completion time and a given ID.
		 *
		 * 	var widget = Widget.create({
		 * 		"sig/task" : function(promise) {
		 * 			print('task %s started at: %s, finished at: %s', promise.name, promise.started);
		 * 		}
		 * 	});
		 *
		 * 	widget.task(function(resolve) {
		 * 		$(this.$element).fadeOut(resolve);
		 * 	}, 'animate');
		 *
		 * @param {Resolver} resolver The task resolver.
		 * @param {String} [name]
		 * @return {Promise}
		 * @fires sig/task
		 */
		"task" : function task(resolver, name) {
			var me = this;

			var promise = when
				.promise(resolver)
				.ensure(function () {
					promise[FINISHED] = new Date();
				});

			promise[CONTEXT] = me;
			promise[STARTED] = new Date();
			promise[NAME] = name || TASK;

			return me.signal(TASK, promise).yield(promise);
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/runner/pipeline',[ "when" ], function PipelineModule(when) {
	

	/**
	 * @class core.component.runner.pipeline
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HEAD = "head";
	var NEXT = "next";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **asynchronously** in "pipeline", passing the resolved return value (unless it's undefined) of the previous listen to the next handler as arguments.
	 * @return {Promise}
	 */
	return function pipeline(event, handlers, args) {
		var context = event[CONTEXT];
		var callback = event[CALLBACK];
		var candidate;
		var candidates = [];
		var candidatesCount = 0;

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			// Filter candidate[CONTEXT] if we have context
			if (context !== UNDEFINED && candidate[CONTEXT] !== context) {
				continue;
			}

			// Filter candidate[CALLBACK] if we have callback
			if (callback && candidate[CALLBACK] !== callback) {
				continue;
			}

			// Add to candidates
			candidates[candidatesCount++] = candidate;
		}

		// Reset candidatesCount
		candidatesCount = 0;

		/**
		 * Internal function for piped execution of candidates candidates
		 * @ignore
		 * @param {Array} [result] result from previous candidate callback
		 * @return {Promise} promise of next candidate callback execution
		 */
		var next = function (result) {
			/*jshint curly:false*/
			var candidate;
			var type;

			// Check that result is not UNDEFINED and not equals to args
			if (result !== UNDEFINED && result !== args) {
				// Update args to either result or result wrapped in a new array
				args = (type = OBJECT_TOSTRING.call(result)) === TOSTRING_ARRAY  // if type is TOSTRING_ARRAY
					|| type === TOSTRING_ARGUMENTS                                 // or type is TOSTRING_ARGUMENTS
					? result                                                       // then result is array-like enough to be passed to .apply
					: [ result ];                                                  // otherwise we should just wrap it in a new array
			}

			// Return promise of next callback, or promise resolved with args
			return (candidate = candidates[candidatesCount++]) !== UNDEFINED
				? when(candidate[CALLBACK].apply(candidate[CONTEXT], args), next)
				: when.resolve(args);
		};

		return next(args);
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/gadget',[
	"./base",
	"./runner/pipeline",
	"troopjs-compose/mixin/config",
	"when",
	"../pubsub/hub"
],function GadgetModule(Component, pipeline, COMPOSE_CONF, when, hub) {
	

	/**
	 * Component that provides signal and hub features.
	 *
	 * 	var one = Gadget.create({
	 * 		"hub/kick/start": function(foo) {
	 * 			// handle kick start
	 * 		},
	 *
	 * 		"hub/piss/off": function() {
	 * 			// handle piss off
	 * 		},
	 *
	 * 		"sig/task": function() {
	 * 			// handle "bar" task.
	 * 		},
	 *
	 * 		"hub/task": function() {
	 * 			// handle both "foo" and "bar".
	 * 		}
	 * 	});
	 *
	 * 	var other = Gadget.create();
	 *
	 * 	other.publish("kick/start","foo");
	 * 	other.publish("piss/off");
	 * 	other.task("foo", function() {
	 * 		// some dirty lift.
	 * 	});
	 * 	one.task("bar", function() {
	 * 		// some dirty lift.
	 * 	});
	 *
	 * @class core.component.gadget
	 * @extend core.component.base
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var ARGS = "args";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var HUB = "hub";
	var RE = new RegExp("^" + HUB + "/(.+)");

	// Add pragma for HUB special
	COMPOSE_CONF.pragmas.push({
		"pattern": /^hub(?:\:(memory))?\/(.+)/,
		"replace": function ($0, $1, $2) {
			return HUB + "(\"" + $2 + "\", " + !!$1 + ")";
		}
	});

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Component.extend({
		"displayName" : "core/component/gadget",

		/**
		 * @inheritdoc
		 * @localdoc Registers event handlers declared HUB specials
		 * @handler
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[HUB] || ARRAY_PROTO, function (special) {
				return me.subscribe(special[ARGS][0], special[VALUE]);
			});
		},

		/**
		 * @inheritdoc
		 * @localdoc Triggers memorized values on HUB specials
		 * @handler
		 */
		"sig/start" : function onStart() {
			var me = this;
			var empty = {};
			var specials = me.constructor.specials[HUB] || ARRAY_PROTO;

			// Calculate specials
			specials = specials
				.map(function (special) {
					var memory;
					var result;
					var topic = special[ARGS][0];

					if (special[ARGS][1] === true && (memory = me.peek(topic, empty)) !== empty) {
						// Redefine result
						result = {};
						result[TYPE] = HUB + "/" + topic;
						result[RUNNER] = pipeline;
						result[CONTEXT] = me;
						result[CALLBACK] = special[VALUE];
						result = [ result ].concat(memory);
					}

					return result;
				})
				.filter(function (special) {
					return special !== UNDEFINED;
				});

			return when.map(specials, function (special) {
				return me.emit.apply(me, special);
			});
		},

		/**
		 * @inheritdoc
		 * @localdoc Registers subscription on the {@link core.pubsub.hub hub} for matching callbacks
		 * @handler
		 */
		"sig/add": function onAdd(handlers, type, callback) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				hub.subscribe(matches[1], me, callback);
			}
		},

		/**
		 * @inheritdoc
		 * @localdoc Removes remote subscription from the {@link core.pubsub.hub hub} that was previously registered in {@link #handler-sig/add}
		 * @handler
		 */
		"sig/remove": function onRemove(handlers, type, callback) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				hub.unsubscribe(matches[1], me, callback);
			}
		},

		/**
		 * @inheritdoc
		 * @localdoc Publishes `task` on the {@link core.pubsub.hub hub} whenever a {@link #event-sig/task task} event is emitted
		 * @handler
		 */
		"sig/task" : function onTask(task) {
			return this.publish("task", task);
		},

		/**
		 * @inheritdoc core.pubsub.hub#publish
		 */
		"publish" : function publish() {
			return hub.publish.apply(hub, arguments);
		},

		/**
		 * @chainable
		 * @inheritdoc core.pubsub.hub#subscribe
		 * @localdoc Subscribe to public events from this component, forcing the context of which to be this component.
		 */
		"subscribe" : function subscribe(event, callback, data) {
			return this.on(HUB + "/" + event, callback, data);
		},

		/**
		 * @chainable
		 * @inheritdoc core.pubsub.hub#unsubscribe
		 * @localdoc Unsubscribe from public events in context of this component.
		 */
		"unsubscribe" : function unsubscribe(event, callback) {
			return this.off(HUB + "/" + event, callback);
		},

		/**
		 * @inheritdoc core.pubsub.hub#peek
		 */
		"peek" : function peek(event, value) {
			return hub.peek(event, value);
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/css/selector',[ "troopjs-compose/mixin/factory" ], function (Factory) {
	

	/**
	 * An optimized CSS selector matcher that {@link dom.component.runner.sequence} relies on for
	 * delegating DOM event on {@link dom.component.widget}.
	 * @class dom.css.selector
	 * @implement compose.mixin
	 * @private
	 */

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var LENGTH = "length";
	var INDEXES = "indexes";
	var INDEXED = "indexed";
	var INDEXER = "indexer";
	var CLASS = "class";
	var ID = "id";
	var TAG = "tag";
	var UNIVERSAL = "universal";
	var SLASH = "\\";
	var SPACE = " ";
	var STAR = "*";
	var POUND = "#";
	var PERIOD = ".";
	var COLON = ":";
	var LEFT_BRACKET = "[";
	var RIGHT_BRACKET = "]";
	var COUNT = "count";
	var BASEVAL = "baseVal";
	var RE_SPACE = /\s+/;

	/**
	 * Extracts key for universal indexer
	 * @ignore
	 * @return {String[]}
	 */
	function getElementUniversal() {
		return [ STAR ];
	}

	/**
	 * Extracts key for tag indexer
	 * @ignore
	 * @param element
	 * @return {String[]}
	 */
	function getElementTagName(element) {
		return [ element.nodeName.toUpperCase() ];
	}

	/**
	 * Extracts key for class indexer
	 * @ignore
	 * @param element
	 * @return {String[]}
	 */
	function getElementClassNames(element) {
		var className;
		var result;

		// Do we have a `className` property
		if ((className = element.className) !== UNDEFINED) {
			// DOM `className`
			if (typeof className === "string") {
				result = className.split(RE_SPACE);
			}
			// SVG `className`
			else if (typeof className === "object" && BASEVAL in className) {
				result = className[BASEVAL].split(RE_SPACE);
			}
		}

		return result;
	}

	/**
	 * Extracts key for id indexer
	 * @ignore
	 * @param element
	 * @return {String[]}
	 */
	function getElementId(element) {
		var id;

		return (id = element.id) !== UNDEFINED && [ id ];
	}

	/**
	 * Gets the last **SIGNIFICANT** of a CSS selector, the "significant" is defined as - any leading id, class name or
	 * tag name component of the last selector.
	 *
	 * Examples:
	 *
	 * 	tail("div.bar");                  // "div"
	 * 	tail("#foo.bar");                 // "#foo"
	 * 	tail("p > div.bar");              // "div"
	 * 	tail("p > a:active");             // "a"
	 * 	tail(".bar");                     // ".bar"
	 * 	tail("input.foo[type='button']"); // "input"
	 * 	tail("[type='button']");          // "*"
	 *
	 * For more examples see [CSS3 selector spec](http://www.w3.org/TR/selectors/#w3cselgrammar)
	 * @private
	 * @static
	 * @param {String} selector CSS selector
	 * @return {String} last token
	 */
	function tail(selector) {
		var start = selector[LENGTH];
		var stop = start;
		var c = selector.charAt(--start);
		var skip = false;

		step: while (start >= 0) {
			switch (c) {
				case SPACE:
					/* Marks EOT if:
					 * * Next c is not SLASH
					 * * Not in skip mode
					 */
					if ((c = selector.charAt(--start)) !== SLASH && !skip) {
						// We're 2 steps passed the end of the selector so we should adjust for that
						start += 2;

						// Break the outer while
						break step;
					}
					break;

				case RIGHT_BRACKET:
					/* Marks begin of skip if:
					 * * Next c is not SLASH
					 */
					skip = (c = selector.charAt(--start)) !== SLASH;
					break;

				case LEFT_BRACKET:
					/* Marks end of skip if:
					 * * Next c is not SLASH
					 */
					if (!(skip = (c = selector.charAt(--start)) === SLASH)) {
						// Compensate for start already decreased
						stop = start + 1;
					}
					break;

				case POUND:
				case COLON:
				case PERIOD:
					/* Marks stop if:
					 * * Next c is not SLASH
					 * * Next c is not SPACE
					 * * Not in skip mode
					 */
					if ((c = selector.charAt(--start)) && c!== UNDEFINED && c!== SLASH && c !== SPACE && !skip) {
						// Compensate for start already decreased
						stop = start + 1;
					}
					break;

				default:
					// Store next c
					c = selector.charAt(--start);
					break;
			}
		}

		return selector.substring(start, stop) || STAR;
	}

	/**
	 * Compares candidates (that have COUNT properties)
	 * @ignore
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Number}
	 */
	function compareCandidates(a, b) {
		return a[COUNT] - b[COUNT];
	}

	/**
	 * @method constructor
	 */
	var Selector = Factory(function Selector() {
		var me = this;

		/**
		 * Cached indexes
		 * @protected
		 * @readonly
		 * @property {Array} indexes
		 */
		me[INDEXES] = [];

		/**
		 * Index counter
		 * @private
		 * @readonly
		 * @property {Number} count
		 */
		me[COUNT] = 0;
	}, {
		/**
		 * Adds candidate
		 * @chainable
		 * @param {String} selector CSS selector
		 * @param {...*} [args] Additional arguments attached with candidate
		 */
		"add": function add(selector, args) {
			var me = this;
			var indexes = me[INDEXES];
			var indexed;
			var indexer;
			var index;
			var name;
			var key = tail(selector);

			// Convert arguments to array
			args = ARRAY_SLICE.call(arguments);

			// Set COUNT on args
			args[COUNT] = me[COUNT]++;

			// Check the first char to determine name/indexer and transform key
			switch (key.charAt(0)) {
				case POUND:
					name = ID;
					indexer = getElementId;
					key = key.substring(1);
					break;

				case PERIOD:
					name = CLASS;
					indexer = getElementClassNames;
					key = key.substring(1);
					break;

				case STAR:
					name = UNIVERSAL;
					indexer = getElementUniversal;
					break;

				default:
					name = TAG;
					indexer = getElementTagName;
					key = key.toUpperCase();
					break;
			}

			// Get index and indexed
			if ((index = indexes[name]) !== UNDEFINED) {
				indexed = index[INDEXED];
			}
			// Or create index and indexed
			else {
				index = indexes[name] = indexes[indexes[LENGTH]] = {};
				index[INDEXER] = indexer;
				indexed = index[INDEXED] = {};
			}

			// Add args to index[key]
			if (key in indexed) {
				indexed[key].push(args);
			}
			// Or create index[key] and initialize with args
			else {
				indexed[key] = [ args ];
			}

			return me;
		},

		/**
		 * Matches candidates against element
		 * @param {Function} matchesSelector `matchesSelector` function
		 * @param {HTMLElement} element DOM Element
		 * @return {Array} Matching array of candidates
		 */
		"matches": function matches(matchesSelector, element) {
			var me = this;
			var indexer;
			var indexed;
			var indexes = me[INDEXES];
			var index;
			var indexCount = indexes[LENGTH];
			var keys;
			var keysCount;
			var candidates;
			var candidate;
			var candidateCount;
			var result = [];
			var resultCount = 0;

			if (!element) {
				return result;
			}

			while (indexCount--) {
				index = indexes[indexCount];
				indexer = index[INDEXER];
				indexed = index[INDEXED];

				keys = indexer(element);
				keysCount = keys[LENGTH];

				while (keysCount--) {

					if ((candidates = indexed[keys[keysCount]]) !== UNDEFINED) {
						candidateCount = candidates[LENGTH];

						while (candidateCount--) {
							candidate = candidates[candidateCount];

							if (matchesSelector(element, candidate[0])) {
								result[resultCount++] = candidate;
							}
						}
					}
				}
			}

			return result.sort(compareCandidates);
		}
	});

	Selector.tail = tail;

	return Selector;
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/component/runner/sequence',[
	"../../css/selector",
	"jquery",
	"poly/array"
], function SequenceModule(Selector, $) {
	

	/**
	 * @class dom.component.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var NEXT = "next";
	var SELECTOR = "selector";
	var MODIFIED = "modified";
	var MATCHES_SELECTOR = $.find.matchesSelector;

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that executes DOM candidates in sequence without overlap
	 * @return {*} Result from last handler
	 */
	return function sequence(event, handlers, args) {
		var modified = handlers[MODIFIED];
		var $event = args[0];
		var selector;
		var candidate;

		// Try get SELECTOR from handlers and check if MODIFIED
		if ((selector = handlers[SELECTOR]) === UNDEFINED || selector[MODIFIED] !== modified) {
			// Create and cache SELECTOR
			selector = handlers[SELECTOR] = Selector();

			// Set MODIFIED on selector
			selector[MODIFIED] = modified;

			// Iterate handlers
			for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
				// Add candidate with selector or default selector '*'
				selector.add(candidate[DATA] || "*", candidate);
			}
		}

		return selector
			// Filter to only selectors that match target
			.matches(MATCHES_SELECTOR, $event.target)
			// Reduce so we can catch the end value
			.reduce(function (result, selector) {
				// If immediate propagation is stopped we should just return last result
				if ($event.isImmediatePropagationStopped()) {
					return result;
				}

				// Did the previous candidate return false we should stopPropagation and preventDefault
				if (result === false) {
					$event.stopPropagation();
					$event.preventDefault();
				}

				// Get candidate from selector
				var candidate = selector[1];

				// Run candidate, provide result to next run
				return candidate[CALLBACK].apply(candidate[CONTEXT], args);
			}, UNDEFINED);
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/config',[
	"module",
	"troopjs-util/merge"
], function LoomConfigModule(module, merge) {
	

	/**
	 * Provides configuration for the loom package
	 * @class dom.loom.config
	 * @protected
	 * @alias feature.config
	 */

	return merge.call({
		/**
		 * @cfg {String} $warp Property of the element's data where the **warp** resides.
		 */
		"$warp" : "$warp",
		/**
		 * @cfg {String} $weft Property of the widget where the **weft** resides.
		 */
		"$weft" : "$weft",

		/**
		 * @cfg {String} weave Attribute name of the element where the **weave** resides.
		 */
		"weave" : "data-weave",

		/**
		 * @cfg {String} unweave Attribute name of the element where the **unweave** resides.
		 */
		"unweave" : "data-unweave",

		/**
		 * @cfg {String} woven Attribute name of the element where the **woven** resides.
		 */
		"woven" : "data-woven"
	}, module.config());
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/defer',[
	"when",
	"poly/array"
], function DeferModule(when) {
	

	/**
	 * `when.defer` patched with jQuery/deferred compatibility.
	 * @class util.defer
	 * @mixin Function
	 * @static
	 */

	var ARRAY_SLICE = Array.prototype.slice;

	/**
	 * Creates a wrapped when.defer object, which can be send to anything that expects a jQuery/deferred.
	 * @method constructor
	 * @return {Deferred}
	 */
	return function Defer() {
		// Create defer
		var defer = when.defer();

		[ "resolve", "reject", "progress" ].forEach(function (value) {
			var me = this;

			// Since the deferred implementation in jQuery (that we use in 1.x) allows
			// to resolve with optional context and multiple arguments, we monkey-patch resolve here
			var func = me.resolver[value];

			// Resolve/Reject/Progress with parameters:
			// http://api.jquery.com/deferred.resolve
			me[value] = function () {
				func.apply(me, arguments);
			};

			// Resolve/Reject/Progress with context and parameters:
			// http://api.jquery.com/deferred.resolveWith
			me[value + "With"] = function (context) {
				func.apply(context, ARRAY_SLICE.call(arguments, 1));
			};

		}, defer);

		return defer;
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/weave',[
	"./config",
	"require",
	"when",
	"jquery",
	"troopjs-util/getargs",
	"troopjs-util/defer",
	"poly/array"
], function WeaveModule(config, parentRequire, when, $, getargs, Defer) {
	

	/**
	 * @class dom.loom.weave
	 * @mixin dom.loom.config
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SHIFT = ARRAY_PROTO.shift;
	var WEAVE = "weave";
	var WOVEN = "woven";
	var LENGTH = "length";
	var $WARP = config["$warp"];
	var $WEFT = config["$weft"];
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var RE_SEPARATOR = /[\s,]+/;
	var CANCELED = "cancel";

	// collect the list of fulfilled promise values from a list of descriptors.
	function fulfilled(descriptors) {
		return descriptors.filter(function(d) {
			// Re-throw the rejection if it's not canceled.
			if (d.state === "rejected" && d.reason !== CANCELED) {
				throw d.reason;
			}
			return d.state === "fulfilled";
		}).map(function(d) {
			return d.value;
		});
	}

	/**
	 * Instantiate all {@link dom.component.widget widgets}  specified in the {@link dom.loom.config#weave weave attribute}
	 * of this element, and to signal the widget for start with the arguments.
	 *
	 * The weaving will result in:
	 *
	 *  - Updates the {@link dom.loom.config#weave woven attribute} with the created widget instances names.
	 *  - The {@link dom.loom.config#$warp $warp data property} will reference the widget instances.
	 *
	 * @localdoc
	 *
	 * It also lives as a jquery plugin as {@link $#method-weave}.
	 *
	 * **Note:** It's not commonly to use this method directly, use instead {@link $#method-weave jQuery.fn.weave}.
	 *
	 * 	// Create element for weaving.
	 * 	var $el = $('<div data-weave="my/widget(option)"></div>').data("option",{"foo":"bar"});
	 * 	// Instantiate the widget defined in "my/widget" module, with one param read from the element's custom data.
	 * 	$el.weave();
	 *
	 * @method constructor
	 * @param {...*} [start_args] Arguments that will be passed to each widget's {@link dom.component.widget#start start} method
	 * @return {Promise} Promise for the completion of weaving all widgets.
	 */
	return function weave(start_args) {
		// Store start_args for later
		start_args = arguments;

		// Map elements
		return when.all(ARRAY_MAP.call(this, function (element) {
			var $element = $(element);
			var $data = $element.data();
			var $warp = $data[$WARP] || ($data[$WARP] = []);
			var to_weave = [];
			var weave_attr = $element.attr(ATTR_WEAVE) || "";
			var weave_args;
			var re = /[\s,]*(((?:\w+!)?([\w\d_\/\.\-]+)(?:#[^(\s]+)?)(?:\(([^\)]+)\))?)/g;
			var matches;

			/*
			 * Updated attributes according to what have been weaved.
			 * @param {object} widgets List of started widgets.
			 * @private
			 */
			var update_attr = function (widgets) {
				var woven = [];
				var weaved = [];

				widgets.forEach(function (widget) {
					weaved.push(widget[$WEFT][WEAVE]);
					woven.push(widget[$WEFT][WOVEN]);
				});

				$element
					// Add those widgets to data-woven.
					.attr(ATTR_WOVEN, function (index, attr) {
						attr = (attr !== UNDEFINED ? attr.split(RE_SEPARATOR) : []).concat(woven).join(" ");
						return attr || null;
					})
					// Remove only those actually woven widgets from "data-weave".
					.attr(ATTR_WEAVE, function(index, attr) {
						var result = [];
						if (attr !== UNDEFINED) {
							result = to_weave.filter(function(args) {
								return weaved.indexOf(args[WEAVE]) < 0;
							}).map(function(args) { return args[WEAVE]; });
						}
						return result[LENGTH] === 0 ? null : result.join(" ");
					});
			};

			var args;

			// Iterate weave_attr (while re matches)
			// matches[1] : full widget module name (could be loaded from plugin) - "mv!widget/name#1.x(1, 'string', false)"
			// matches[2] : widget name and arguments - "widget/name(1, 'string', false)"
			// matches[3] : widget name - "widget/name"
			// matches[4] : widget arguments - "1, 'string', false"
			while ((matches = re.exec(weave_attr)) !== NULL) {
				/*jshint loopfunc:true*/
				// Create weave_args
				// Require module, add error handler
				// Arguments to pass to the widget constructor.
				args = matches[4];

				// module name, DOM element, widget display name.
				weave_args = [ matches[2], $element.get(0), matches[3] ];

				// Store matches[1] as WEAVE on weave_args
				weave_args[WEAVE] = matches[1];

				// If there were additional arguments
				if (args !== UNDEFINED) {
					// Parse matches[2] using getargs, map the values and append to weave_args
					ARRAY_PUSH.apply(weave_args, getargs.call(args).map(function (value) {
						// If value from $data if key exist
						return value in $data
							? $data[value]
							: value;
					}));
				}

				// Push on $weave
				ARRAY_PUSH.call(to_weave, weave_args);
			}

			// process with all successful weaving.
			return when.settle(to_weave.map(function (widget_args) {
				// Create deferred
				var deferred = when.defer();
				var resolver = deferred.resolver;
				var promise = deferred.promise;
				var module = ARRAY_SHIFT.call(widget_args);

				// Copy WEAVE
				promise[WEAVE] = widget_args[WEAVE];

				// Add promise to $warp, make sure this is called synchronously.
				ARRAY_PUSH.call($warp, promise);

				setTimeout(function() {
					parentRequire([ module ], function(Widget) {
						var widget;
						var startPromise;

						// detect if weaving has been canceled somehow.
						if ($warp.indexOf(promise) === -1) {
							resolver.reject(CANCELED);
						}

						try {
							// Create widget instance
							widget = Widget.apply(Widget, widget_args);

							// Add $WEFT to widget
							widget[$WEFT] = promise;

							// Add WOVEN to promise
							promise[WOVEN] = widget.toString();

							// TODO: Detecting TroopJS 1.x widget from *version* property.
							if (widget.trigger) {
								deferred = Defer();
								widget.start(deferred);
								startPromise = deferred.promise;
							}
							else {
								startPromise = widget.start.apply(widget, start_args);
							}

							resolver.resolve(startPromise.yield(widget));
						}
						catch (e) {
							resolver.reject(e);
						}
					}, resolver.reject);
				}, 0);

				// Return promise
				return promise;
			})).then(fulfilled)
			// Updating the element attributes with started widgets.
			.tap(update_attr);
		}));
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/unweave',[
	"./config",
	"when",
	"jquery",
	"poly/array",
	"troopjs-util/defer"
], function UnweaveModule(config, when, $, Defer) {
	

	/**
	 * @class dom.loom.unweave
	 * @mixin dom.loom.config
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var WEAVE = "weave";
	var UNWEAVE = "unweave";
	var WOVEN = "woven";
	var LENGTH = "length";
	var $WARP = config["$warp"];
	var $WEFT = config["$weft"];
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var ATTR_UNWEAVE = config[UNWEAVE];
	var RE_SEPARATOR = /[\s,]+/;
	var CANCELED = "cancel";

	// collect the list of fulfilled promise values from a list of descriptors.
	function fulfilled(descriptors) {
		return descriptors.filter(function(d) {
			// Re-throw the rejection if it's not canceled.
			if (d.state === "rejected" && d.reason !== CANCELED) {
				throw d.reason;
			}
			return d.state === "fulfilled";
		}).map(function(d) {
			return d.value;
		});
	}

	/**
	 * Destroy all widget instances living on this element, that are created
	 * by {@link dom.loom.weave}, it is also to clean up the attributes
	 * and data references to the previously instantiated widgets.
	 *
	 * @localdoc
	 *
	 * It also lives as a jquery plugin as {@link $#method-unweave}.
	 *
	 * @method constructor
	 * @param {...*} [stop_args] Arguments that will be passed to each widget's {@link dom.component.widget#stop stop} method
	 * @return {Promise} Promise to the completion of unweaving all woven widgets.
	 */
	return function unweave(stop_args) {
		// Store stop_args for later
		stop_args = arguments;

		// Map elements
		return when.all(ARRAY_MAP.call(this, function (element) {
			var $element = $(element);
			var $data = $element.data();
			var $warp = $data[$WARP] || ($data[$WARP] = []);
			var $unweave = [];
			var unweave_attr = $element.attr(ATTR_UNWEAVE);
			var unweave_re = [];
			var re = /[\s,]*([\w_\/\.\-]+)(?:@(\d+))?/g;
			var matches;
			var $weft;
			var iMax;
			var i;
			var j;

			/*
			 * Updated attributes according to what have been unweaved.
			 * @param {object} widgets List of stopped widgets.
			 * @private
			 */
			var update_attr = function (widgets) {
				var woven = {};
				var weave = [];
				widgets.forEach(function (widget) {
					var $promise = widget[$WEFT];
					woven[$promise[WOVEN]] = 1;
					weave.push($promise[WEAVE]);
				});

				$element
					// Remove those widgets from data-woven.
					.attr(ATTR_WOVEN, function (index, attr) {
						var result = [];

						if (attr !== UNDEFINED) {
							ARRAY_PUSH.apply(result, attr.split(RE_SEPARATOR).filter(function (part) {
								return !( part in woven );
							}));
						}

						return result[LENGTH] === 0
							? null
							: result.join(" ");
					})
					// Added back those widget names to data-weave.
					.attr(ATTR_WEAVE, function (index, attr) {
						var result = (attr !== UNDEFINED ? attr.split(RE_SEPARATOR) : []).concat(weave);
						return result[LENGTH] === 0 ? null : result.join(" ");
					});
			};

			// Make sure to remove ATTR_UNWEAVE (so we don't try processing this again)
			$element.removeAttr(ATTR_UNWEAVE);

			// Check if we should remove all widgets
			if (unweave_attr === UNDEFINED) {
				// Copy from $warp to $unweave
				ARRAY_PUSH.apply($unweave, $warp);

				// Truncate $warp
				$warp[LENGTH] = 0;
			} else {
				// Iterate unweave_attr (while re matches)
				// matches[1] : widget name - "widget/name"
				// matches[2] : widget instance id - "123"
				while ((matches = re.exec(unweave_attr)) !== NULL) {
					ARRAY_PUSH.call(unweave_re, "^" + matches[1] + "@" + (matches[2] || "\\d+") + "$");
				}

				// Redefine unweave_re as a regexp
				unweave_re = new RegExp(unweave_re.join("|"));

				// Move matching promises from $warp to $unweave
				for (i = j = 0, iMax = $warp[LENGTH]; i < iMax; i++) {
					$weft = $warp[i];

					if (!unweave_re.test($weft[WOVEN])) {
						// Move to new index
						$warp[j++] = $weft;
					}
					else {
						// Push on $weave
						ARRAY_PUSH.call($unweave, $weft);
					}
				}

				// Truncate $warp
				$warp[LENGTH] = j;
			}

			// process with all successful  weaving.
			return when.settle($unweave).then(fulfilled).then(function unweaveWidgets(widgets) {
				return when.map(widgets, function(widget) {
					var deferred;
					var stopPromise;

					// TODO: Detecting TroopJS 1.x widget from *version* property.
					if (widget.trigger) {
						deferred = Defer();
						widget.stop(deferred);
						stopPromise = deferred.promise;
					}
					else {
						stopPromise = widget.stop.apply(widget, stop_args);
					}
					// Add deferred update of attr
					return stopPromise.yield(widget);
				});
			})
			// Updating the weave/woven attributes with stopped widgets.
			.tap(update_attr);
		}));
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-jquery/destroy',[ "jquery" ], function DestroyModule($) {
	

	/**
	 * Extends {@link jQuery} with:
	 *
	 *  - {@link $#event-destroy} event
	 *
	 * @class jquery.destroy
	 * @static
	 * @alias plugin.jquery
	 */

	var DESTROY = "destroy";

	/**
	 * @class $
	 */

	/**
	 * A special jQuery event whose handler will be called, only when this handler it's removed from the element.
	 * @event destroy
	 */
	$.event.special[DESTROY] = {
		"noBubble" : true,

		"trigger" : function () {
			return false;
		},

		"remove" : function onDestroyRemove(handleObj) {
			var me = this;

			if (handleObj) {
				handleObj.handler.call(me, $.Event(handleObj.type, {
					"data" : handleObj.data,
					"namespace" : handleObj.namespace,
					"target" : me
				}));
			}
		}
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/component/widget',[
	"troopjs-core/component/gadget",
	"./runner/sequence",
	"troopjs-compose/mixin/config",
	"jquery",
	"when",
	"troopjs-util/merge",
	"../loom/config",
	"../loom/weave",
	"../loom/unweave",
	"troopjs-jquery/destroy"
], function WidgetModule(Gadget, sequence, COMPOSE_CONF, $, when, merge, LOOM_CONF, loom_weave, loom_unweave) {
	

	/**
	 * Component that attaches to an DOM element, considerably delegates all DOM manipulations.
	 * @class dom.component.widget
	 * @extend core.component.gadget
	 * @alias widget.component
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var $GET = $.fn.get;
	var TYPEOF_FUNCTION = "function";
	var $ELEMENT = "$element";
	var MODIFIED = "modified";
	var PROXY = "proxy";
	var DOM = "dom";
	var ARGS = "args";
	var NAME = "name";
	var VALUE = "value";
	var TYPE = "type";
	var RUNNER = "runner";
	var FINALIZE = "finalize";
	var SELECTOR_WEAVE = "[" + LOOM_CONF["weave"] + "]";
	var SELECTOR_WOVEN = "[" + LOOM_CONF["woven"] + "]";
	var RE = new RegExp("^" + DOM + "/(.+)");

	/**
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @ignore
	 * @param {Function} $fn jQuery method
	 * @return {Function} proxied render
	 */
	function $render($fn) {
		/**
		 * @ignore
		 * @param {Function|String|Promise} [contents] Contents to render or a Promise for contents
		 * @param {...*} [args] Template arguments
		 * @return {String|Promise} The returned content string or promise of rendering.
		 */
		function render(contents, args) {
			/*jshint validthis:true*/
			var me = this;

			// Retrieve HTML/Text.
			if (!arguments.length) {
				return $fn.call(me[$ELEMENT]);
			}

			return when
				// Wait for contents and args to resolve...
				.all(ARRAY_SLICE.call(arguments))
				.then(function (_args) {
					// First argument is the resolved value of contents
					var _contents = _args.shift();

					// If _contents is a function, apply it with _args, otherwise just pass it along to the callback
					return when(typeof _contents === TYPEOF_FUNCTION ? _contents.apply(me, _args) : contents, function (result) {
						// Call $fn in the context of me[$ELEMENT] with result as the only argument
						// Find something to weave
						// Pass it to loom_weave and return the result
						return loom_weave.call($fn.call(me[$ELEMENT], result).find(SELECTOR_WEAVE));
					});
				});
		}

		return render;
	}

	/**
	 * Sets MODIFIED on handlers
	 * @ignore
	 * @param {Object} handlers
	 * @param {String} type
	 */
	function set_modified(handlers, type) {
		if (RE.test(type)) {
			// Set modified
			handlers[MODIFIED] = new Date().getTime();
		}
	}

	// Add pragmas for DOM specials
	COMPOSE_CONF.pragmas.push({
		"pattern": /^dom(?:\:([^\/]+))?\/(.+)/,
		"replace": DOM + "/$2(\"$1\")"
	});

	/**
	 * Creates a new widget that attaches to a specified (jQuery) DOM element.
	 * @method constructor
	 * @param {jQuery|HTMLElement} $element The element that this widget should be attached to
	 * @param {String} [displayName] A friendly name for this widget
	 * @throws {Error} If no $element is provided
	 * @throws {Error} If $element is not of supported type
	 */
	return Gadget.extend(function Widget($element, displayName) {
		var me = this;
		var $get;

		// No $element
		if ($element === UNDEFINED) {
			throw new Error("No $element provided");
		}
		// Is _not_ a jQuery element
		else if (!$element.jquery) {
			// From a plain dom node
			if ($element.nodeType) {
				$element = $($element);
			}
			else {
				throw new Error("Unsupported widget element");
			}
		}
		// From a different jQuery instance
		else if (($get = $element.get) !== $GET) {
			$element = $($get.call($element, 0));
		}

		/**
		 * jQuery element this widget is attached to
		 * @property {jQuery} $element
		 * @readonly
		 * @protected
		 */
		me[$ELEMENT] = $element;

		if (displayName !== UNDEFINED) {
			me.displayName = displayName;
		}

	}, {
		"displayName" : "dom/component/widget",

		/**
		 * @handler
		 * @localdoc Registers event handlers that are declared as DOM specials.
		 * @inheritdoc
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[DOM] || ARRAY_PROTO, function (special) {
				return me.on(special[NAME], special[VALUE], special[ARGS][0]);
			});
		},

		/**
		 * @handler
		 * @localdoc Registers for each type of DOM event a proxy function on the DOM element that
		 * re-dispatches those events.
		 * @inheritdoc
		 */
		"sig/setup": function onSetup(handlers, type) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				// $element.on handlers[PROXY]
				me[$ELEMENT].on(matches[1], NULL, me, handlers[PROXY] = function dom_proxy($event) {
					var args = {};
					args[TYPE] = type;
					args[RUNNER] = sequence;
					args = [ args ];

					// Push original arguments on args
					ARRAY_PUSH.apply(args, arguments);

					// Return result of emit
					return me.emit.apply(me, args);
				});
			}
		},

		/**
		 * @handler
		 * @localdoc Sets MODIFIED on handlers for matching types
		 * @inheritdoc
		 */
		"sig/add": set_modified,

		/**
		 * @handler
		 * @localdoc Sets MODIFIED on handlers for matching types
		 * @inheritdoc
		 */
		"sig/remove": set_modified,

		/**
		 * @handler
		 * @localdoc Remove for the DOM event handler proxies that are registered on the DOM element.
		 * @inheritdoc
		 */
		"sig/teardown": function onTeardown(handlers, type) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				// $element.off handlers[PROXY]
				me[$ELEMENT].off(matches[1], NULL, handlers[PROXY]);
			}
		},

		/**
		 * @handler
		 * @localdoc Trigger a custom DOM event "task" whenever this widget performs a task.
		 * @inheritdoc
		 */
		"sig/task" : function onTask(task) {
			this[$ELEMENT].trigger("task", [ task ]);
		},

		/**
		 * Destroy DOM event
		 * @localdoc Triggered when {@link #$element} of this widget is removed from the DOM tree.
		 * @event dom/destroy
		 * @param {jQuery} $event jQuery event object
		 * @param {...*} [args] Event arguments
		 * @preventable
		 */

		/**
		 * Handles widget destruction from a DOM perspective
		 * @handler
		 * @inheritdoc #event-dom/destroy
		 * @localdoc Triggered when this widget is removed from the DOM
		 */
		"dom/destroy" : function onDestroy() {
			if (this.phase !== FINALIZE) {
				loom_unweave.call(this[$ELEMENT]);
			}
		},

		/**
		 * @inheritdoc dom.loom.weave#constructor
		 */
		"weave" : function weave() {
			return loom_weave.apply(this[$ELEMENT].find(SELECTOR_WEAVE), arguments);
		},

		/**
		 * @inheritdoc dom.loom.unweave#constructor
		 */
		"unweave" : function unweave() {
			return loom_unweave.apply(this[$ELEMENT].find(SELECTOR_WOVEN), arguments);
		},

		/**
		 * Renders content and inserts it before {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"before" : $render($.fn.before),

		/**
		 * Renders content and inserts it after {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"after" : $render($.fn.after),

		/**
		 * Renders content and replaces {@link #$element} html contents
		 * @method
		 * @param {Function|String} contents Template/String to render
		 * @param {...*} [args] Template arguments
		 * @return {Promise} Promise of  render
		 */
		"html" : $render($.fn.html),

		/**
		 * Renders content and replaces {@link #$element} text contents
		 * @method
		 * @inheritdoc #html
		 */
		"text" : $render($.fn.text),

		/**
		 * Renders content and appends it to {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"append" : $render($.fn.append),

		/**
		 * Renders content and prepends it to {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"prepend" : $render($.fn.prepend)
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/application/widget',[
	"../component/widget",
	"when"
], function ApplicationWidgetModule(Widget, when) {
	

	/**
	 * The application widget serves as a container for all troop components that bootstrap the page.
	 * @class dom.application.widget
	 * @extend dom.component.widget
	 * @alias widget.application
	 */

	var ARRAY_SLICE = Array.prototype.slice;
	var COMPONENTS = "components";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @param {jQuery|HTMLElement} $element The element that this widget should be attached to
	 * @param {String} displayName A friendly name for this widget
	 * @param {...core.component.base} component List of components to start before starting the application.
	 */
	return Widget.extend(function ApplicationWidget($element, displayName, component) {
		/**
		 * Application components
		 * @private
		 * @readonly
		 * @property {core.component.base[]} components
		 */
		this[COMPONENTS] = ARRAY_SLICE.call(arguments, 2);
	}, {
		"displayName" : "dom/application/widget",

		/**
		 * @handler
		 * @localdoc Initialize all registered components (widgets and services) that are passed in from the {@link #method-constructor}.
		 * @inheritdoc
		 */
		"sig/initialize" : function onInitialize() {
			var args = arguments;

			return when.map(this[COMPONENTS], function (component) {
				return component.signal("initialize", args);
			});
		},

		/**
		 * @handler
		 * @localdoc weave all widgets that are within this element.
		 * @inheritdoc
		 */
		"sig/start" : function onStart() {
			var me = this;
			var args = arguments;

			return when
				.map(me[COMPONENTS], function (component) {
					return component.signal("start", args);
				}).then(function started() {
					return me.weave.apply(me, args);
				});
		},

		/**
		 * @handler
		 * @localdoc stop all woven widgets that are within this element.
		 * @inheritdoc
		 */
		"sig/stop": function onStop() {
			var me = this;
			var args = arguments;

			return me.unweave.apply(me, args).then(function stopped() {
				return when.map(me[COMPONENTS], function (child) {
					return child.signal("stop", args);
				});
			});
		},

		/**
		 * @handler
		 * @localdoc finalize all registered components (widgets and services) that are registered from the {@link #method-constructor}.
		 * @inheritdoc
		 */
		"sig/finalize" : function onFinalize() {
			var args = arguments;

			return when.map(this[COMPONENTS], function (component) {
				return component.signal("finalize", args);
			});
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/after',[ "../mixin/decorator" ], function AfterDecoratorModule(Decorator) {
	

	/**
	 * @class compose.decorator.after
	 * @static
	 * @alias feature.decorator
	 */

	var UNDEFINED;
	var VALUE = "value";

	/**
	 * Create a decorator method that is to add code that will be executed after the original method.
	 * @method constructor
	 * @param {Function} func The decorator function which receives the arguments of the original, it's return value (if
	 * not undefined) will be the used as the new return value.
	 * @return {compose.mixin.decorator}
	 */
	return function after(func) {
		return new Decorator(function (descriptor) {
			var previous = descriptor[VALUE];

			descriptor[VALUE] = previous
				? function decorated_after() {
					var me = this;
					var retval = previous.apply(me, arguments);
					var newRet = func.apply(me, arguments);
					return newRet !== UNDEFINED ? newRet : retval;
				}
				: func;

			return descriptor;
		});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/before',[ "../mixin/decorator" ], function BeforeDecoratorModule(Decorator) {
	

	/**
	 * @class compose.decorator.before
	 * @static
	 * @alias feature.decorator
	 */

	var UNDEFINED;
	var VALUE = "value";

	/**
	 * Create a decorator method that is to add code that will be executed before the original method.
	 * @method constructor
	 * @param {Function} func The decorator function which receives the same arguments as with the original, it's return
	 * value (if not undefined) will be send as the arguments of original function.
	 * @return {compose.mixin.decorator}
	 */
	return function before(func) {
		return new Decorator(function (descriptor) {
			var next = descriptor[VALUE];

			descriptor[VALUE] = next
				? function decorated_before() {
					var me = this;
					var retval = func.apply(me, arguments);

					return next.apply(me, retval !== UNDEFINED ? retval : arguments);
				}
				: func;

			return descriptor;
		});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/extend',[
	"../mixin/decorator",
	"troopjs-util/merge"
], function ExtendDecoratorModule(Decorator, merge) {
	

	/**
	 * @class compose.decorator.extend
	 * @static
	 * @alias feature.decorator
	 */

	var UNDEFINED;
	var VALUE = "value";
	var ARRAY_CONCAT = Array.prototype.concat;

	/**
	 * Create a decorator that is to augment an existing Object property.
	 * @method constructor
	 * @param {Function|Object...} ext One or more objects to merge into this property, or a function that returns a new object to be used.
	 * @return {compose.mixin.decorator}
	 */
	return function extend(ext) {
		var args = arguments;

		return new Decorator(function (descriptor, name, descriptors) {
			var previous = descriptors[name][VALUE];
			var val;

			if (typeof ext === "function") {
				val = ext(previous);
			}
			else if (previous !== UNDEFINED) {
				val = merge.apply({}, ARRAY_CONCAT.apply([ previous ], args));
			}

			descriptor[VALUE] = val;

			return descriptor;
		});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/config',[
	"module",
	"troopjs-util/merge"
], function ConfigModule(module, merge) {
	/**
	 * Provides configuration for the logging package
	 * @class log.config
	 * @protected
	 * @alias feature.config
	 */

	return merge.call({
		/**
		 * Sinks that the {@link log.sink.forward} logger will use
		 * @cfg {log.console[]} sinks
		 */
		"sinks": []
	}, module.config());
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/sink/forward',[
	"./methods",
	"../config",
	"poly/array"
], function ForwardModule(METHODS, CONF) {
	

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
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/sink/null',[
	"./methods",
	"poly/array"
], function NullModule(METHODS) {
	

	/**
	 * @class log.sink.null
	 * @implement log.console
	 * @singleton
	 * @inheritdoc log.sink.console
	 * @localdoc
	 * This class maps every log method to a [nop](https://en.wikipedia.org/wiki/NOP) function,
	 * effectively suppressing all logging.
	 * @alias feature.logger
	 */

	return (function () {
		var me = this;
		var nop = function () {};

		METHODS.forEach(function (method) {
			me[method] = nop;
		});

		return me;
	}).call({});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/service',[ "./gadget" ], function ServiceModule(Gadget) {
	

	/**
	 * Base class for all service alike components.
	 *
	 * @class core.component.service
	 * @extend core.component.gadget
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Gadget.extend({
		"displayName" : "core/component/service"
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/pubsub/proxy/to1x',[
	"troopjs-core/component/service",
	"when",
	"poly/array",
	"poly/object"
], function To1xModule(Service, when) {
	

	/**
	 * Proxies to 1.x hub
	 * @class opt.pubsub.proxy.to1x
	 * @extend core.component.service
	 */

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var OBJECT_KEYS = Object.keys;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";
	var PUBLISH = "publish";
	var SUBSCRIBE = "subscribe";
	var HUB = "hub";
	var ROUTES = "routes";
	var LENGTH = "length";
	var RESOLVE = "resolve";
	var TOPIC = "topic";
	var DEFER = "defer";
	var MEMORY = "memory";

	/**
	 * @method constructor
	 * @param {...Object} routes Routes
	 */
	return Service.extend(function To1xService(routes) {
		var config = {};

		config[ROUTES] = ARRAY_SLICE.call(arguments);

		this.configure(config);
	}, {
		"displayName" : "opt/pubsub/proxy/to1x",

		/**
		 * @inheritdoc
		 * @localdoc Initializes proxy topics
		 * @handler
		 */
		"sig/initialize" : function () {
			var me = this;

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var publish = routes[PUBLISH] || {};
				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

				// Iterate publish keys
				OBJECT_KEYS(publish).forEach(function (source) {
					// Extract target
					var target = publish[source];
					var topic;
					var defer;

					// If target is a string set topic to target and defer to false
					if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
						topic = target;
						defer = false;
					}
					// Otherwise just grab topic and defer from target
					else {
						// Make sure we have a topic
						if (!(TOPIC in target)) {
							throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
						}

						// Get topic
						topic = target[TOPIC];
						// Make sure defer is a boolean
						defer = !!target[DEFER];
					}

					// Create callback
					var callback = publish[source] = function () {
						// Initialize args with topic as the first argument
						var args = [ topic ];
						var deferred;
						var resolve;

						// Push original arguments on args
						ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

						if (defer) {
							// Create deferred
							deferred = when.defer();

							// Store original resolve method
							resolve = deferred[RESOLVE];

							// Since the deferred implementation in jQuery (that we use in 1.x) allows
							// to resolve with multiple arguments, we monkey-patch resolve here
							deferred[RESOLVE] = deferred.resolver[RESOLVE] = function () {
								resolve(ARRAY_SLICE.call(arguments));
							};

							// Push deferred as last argument on args
							ARRAY_PUSH.call(args, deferred);
						}

						// Publish with args
						hub.publish.apply(hub, args);

						// Return promise
						return deferred
							? deferred.promise
							: UNDEFINED;
					};

					// Transfer topic and defer to callback
					callback[TOPIC] = topic;
					callback[DEFER] = defer;

					// Subscribe from me
					me.subscribe(source, callback);
				});

				// Iterate subscribe keys
				OBJECT_KEYS(subscribe).forEach(function (source) {
					// Extract target
					var target = subscribe[source];
					var topic;
					var memory;

					// If target is not a string, make it into an object
					if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
						topic = target;
						memory = false;
					}
					// Otherwise just grab from the properties
					else {
						// Make sure we have a topic
						if (!(TOPIC in target)) {
							throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
						}

						// Get topic
						topic = target[TOPIC];
						// Make sure memory is a boolean
						memory = !!target[MEMORY];
					}

					// Create callback
					var callback = subscribe[source] = function () {
						// Initialize args with topic as the first argument
						var args = [ topic ];
						var deferred;
						var result;

						// Push sliced (without topic) arguments on args
						ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

						// If the last argument look like a promise we pop and store as deferred
						if (when.isPromise(args[args[LENGTH] - 1])) {
							deferred = args.pop();
						}

						// Publish and store promise as result
						result = me.publish.apply(me, args);

						// If we have a deferred we should chain it to result
						if (deferred) {
							when(result, when.apply(deferred.resolve), deferred.reject, deferred.progress);
						}

						// Return result
						return result;
					};

					// Transfer topic and memory to callback
					callback[TOPIC] = topic;
					callback[MEMORY] = memory;

					// Subscribe from hub,notice that since we're pushing memory there _is_ a chance that
					// we'll get a callback before sig/start
					hub.subscribe(source, me, memory, callback);
				});
			});
		},

		/**
		 * @inheritdoc
		 * @localdoc Finalizes proxy topics
		 * @handler
		 */
		"sig/finalize" : function () {
			var me = this;

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var publish = routes[PUBLISH] || {};
				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

				// Iterate publish keys and unsubscribe
				OBJECT_KEYS(publish).forEach(function (source) {
					me.unsubscribe(source, publish[source]);
				});

				// Iterate subscribe keys and unsubscribe
				OBJECT_KEYS(subscribe).forEach(function (source) {
					hub.unsubscribe(source, me, subscribe[source]);
				});
			});
		}
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/pubsub/proxy/to2x',[
	"troopjs-core/component/service",
	"when",
	"poly/array",
	"poly/object"
], function To2xModule(Service, when) {
	

	/**
	 * Proxies to 2.x hub
	 * @class opt.pubsub.proxy.to2x
	 * @extend core.component.service
	 */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var OBJECT_KEYS = Object.keys;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";
	var PUBLISH = "publish";
	var SUBSCRIBE = "subscribe";
	var HUB = "hub";
	var ROUTES = "routes";
	var TOPIC = "topic";
	var REPUBLISH = "republish";

	/**
	 * @method constructor
	 * @param {...Object} routes Routes
	 */
	return Service.extend(function To2xService(routes) {
		var config = {};

		config[ROUTES] = ARRAY_SLICE.call(arguments);

		this.configure(config);
	}, {
		"displayName" : "opt/pubsub/proxy/to2x",

		/**
		 * @inheritdoc
		 * @localdoc Initializes proxy topics
		 * @handler
		 */
		"sig/initialize" : function ()  {
			var me = this;

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var publish = routes[PUBLISH] || {};
				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

				// Iterate publish keys
				OBJECT_KEYS(publish).forEach(function (source) {
					// Extract target
					var target = publish[source];
					var topic;

					// If target is a string set topic to target
					if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
						topic = target;
					}
					// Otherwise just grab topic from target
					else {
						// Make sure we have a topic
						if (!(TOPIC in target)) {
							throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
						}

						// Get topic
						topic = target[TOPIC];
					}

					// Create callback
					var callback = publish[source] = function () {
						// Initialize args with topic as the first argument
						var args = [ topic ];

						// Push original arguments on args
						ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

						return hub.publish.apply(hub, args);
					};

					// Transfer topic to callback
					callback[TOPIC] = topic;

					me.subscribe(source, callback);
				});

				// Iterate subscribe keys
				OBJECT_KEYS(subscribe).forEach(function (source) {
					// Extract target
					var target = subscribe[source];
					var topic;
					var republish;

					// If target is a string set topic to target and republish to false
					if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
						topic = target;
						republish = false;
					}
					// Otherwise just grab topic and republish from target
					else {
						// Make sure we have a topic
						if (!(TOPIC in target)) {
							throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
						}

						// Get topic
						topic = target[TOPIC];
						// Make sure republish is a boolean
						republish = !!target[REPUBLISH];
					}

					// Create callback
					var callback = subscribe[source] = function () {
						// Initialize args with topic as the first argument
						var args = [ topic ];

						// Push original arguments on args
						ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

						// Publish and store promise as result
						return me.publish.apply(me, args);
					};

					// Transfer topic and republish to callback
					callback[TOPIC] = topic;
					callback[REPUBLISH] = republish;

					hub.subscribe(source, me, callback);
				});
			});
		},

		/**
		 * @inheritdoc
		 * @localdoc Republishes memorized values
		 * @handler
		 */
		"sig/start" : function () {
			var me = this;
			var results = [];

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

				// Iterate subscribe keys
				OBJECT_KEYS(subscribe).forEach(function (source) {
					var callback = subscribe[source];

					// Check if we should republish
					if (callback[REPUBLISH] === true) {
						// Push result from republish on results
						results.push(hub.republish(source, me, callback));
					}
				});
			});

			// Return promise that will resolve once all results are resolved
			return when.all(results);
		},

		/**
		 * @inheritdoc
		 * @localdoc Finalizes proxy topics
		 * @handler
		 */
		"sig/finalize" : function () {
			var me = this;

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var publish = routes[PUBLISH] || {};
				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

				// Iterate publish keys and unsubscribe
				OBJECT_KEYS(publish).forEach(function (source) {
					me.unsubscribe(source, publish[source]);
				});

				// Iterate subscribe keys and unsubscribe
				OBJECT_KEYS(subscribe).forEach(function (source) {
					hub.unsubscribe(source, me, subscribe[source]);
				});
			});
		}
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/route/runner/sequence',[ "poly/array" ], function SequenceModule() {
	

	/**
	 * @class opt.route.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var NULL = null;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var NEXT = "next";
	var TYPE = "type";
	var TOKENS = "tokens";

	var RE_GROUP_START = /\(/g;
	var RE_TOKEN = /\:(\w+)(\?)?\/?/g;
	var RE_TOKEN_ESCAPED = /@(\w+)(\?)?\/?/g;
	var RE_COLON = /\:/g;
	var MARKER = "@";
	var RE_GROUPED_TOKEN = /\(([^)]+)\)\??\/?/g;
	var RE_ANY = /^.*$/;
	var RE_ESCAPE_REGEXP = /([\/.])/g;
	var RE_DUP_SLASH = /\/{2,}/;

	var RE_BOOLEAN = /^(?:false|true)$/i;
	var RE_BOOLEAN_TRUE = /^true$/i;
	var RE_DIGIT = /^\d+$/;

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that executes ROUTE candidates in sequence without overlap
	 * @return {*} Result from last handler
	 * @throws {Error} If `event.type` is an unknown type
	 */
	return function sequence(event, handlers, args) {
		var type = event[TYPE];
		var path = args.shift(); // Shift path and route of args
		var data;
		var matched;
		var candidate;
		var candidates = [];
		var fallbacks = [];
		var first_missed;

		// If this is a route/set we need to pre-process the path
		if (type === "route/set") {
			// route data is provided as the second arg, but we're already shifted above.
			data = args.shift() || {};

			// Populate path with data
			path = path
				// Replace grouped tokens.
				.replace(RE_GROUPED_TOKEN, function ($0, $1) {
					var group = $1.replace(RE_TOKEN, function($0, $1) {
						return $1 in data ? data[$1] + "/" : $0;
					});
					// mark the group as missed unless all params within have fulfilled.
					return !group.match(RE_COLON)? group + "/" : MARKER;
				})
				// Replace the rest of tokens.
				.replace(RE_TOKEN, function($0, $1) {
					// mark the parameters as missed.
					return $1 in data ? data[$1] + "/" : MARKER;
				})
				// Remove any duplicate slashes previously produced.
				.replace(RE_DUP_SLASH, "/");

			// Dump from before the first missed parameter.
			if ((first_missed = path.indexOf(MARKER)) > -1) {
				path = path.substring(0, first_missed);
			}
		}
		// If this is _not_ a route/change we should throw an error
		else if (type !== "route/change") {
			throw new Error("Unable to run type '" + type + "'");
		}

		// Copy handlers -> candidates
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			candidate[DATA] === "/404" ? fallbacks.push(candidate) : candidates.push(candidate);
		}

		// Run candidates and return
		var result = candidates.reduce(function(result, candidate) {
			var tokens;
			var matches;
			var re;

			// Only run if the reduced result is not `false`
			if (result !== false) {
				switch (OBJECT_TOSTRING.call(candidate[DATA])) {
					case "[object RegExp]":
						// Use cached regexp
						re = candidate[DATA];

						// Use cached tokens
						tokens = candidate[TOKENS];
						break;

					case "[object Undefined]":
					// phantom reported weird [object DOMWindow] for undefined property.
					case "[object DOMWindow]":
						// Match anything
						re = RE_ANY;

						// Empty tokens
						tokens = [];
						break;

					default:
						// Reset tokens
						tokens = candidate[TOKENS] = [];

						// Translate and cache pattern to regexp
						re = candidate[DATA] = new RegExp("^" + candidate[DATA]
							// Preserved colon to be used by regexp.
							.replace(RE_COLON, MARKER)
							// Translate grouping to non capturing regexp groups
							.replace(RE_GROUP_START, "(?:")
							// Capture tokens
							.replace(RE_TOKEN_ESCAPED, function($0, token, optional) {
								// Add token
								tokens.push(token);
								// Return replacement.
								return "(?:(\\w+)\/)" + (optional ? "?" : "");
							})
							.replace(RE_ESCAPE_REGEXP, "\\$1") + "$", "i");
				}

				// Match path
				if ((matches = re.exec(path)) !== NULL) {
					// Capture tokens in data
					tokens.forEach(function(token, index) {

						// Auto type convertion.
						var val = matches[index + 1];
						if (RE_BOOLEAN.test(val)) {
							val = RE_BOOLEAN_TRUE.test(val);
						}
						else if (RE_DIGIT.test(val)) {
							val = +val;
						}

						matches[index + 1] = matches[token] = val;
					});

					if (!matched) {
						matched = 1;
					}

					// Apply CALLBACK and store in result
					result = candidate[CALLBACK].apply(candidate[CONTEXT], [ path, matches ].concat(args));
				}
			}

			return result;
		}, UNDEFINED);

		// Run 404s if none of the candidate matches the route.
		if (!matched && type === "route/change") {
			return fallbacks.reduce(function(result, candidate) {
				result !== false ? candidate[CALLBACK].apply(candidate[CONTEXT], [ path ].concat(args)) : result;
			}, result);
		}

		return result;
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/route/gadget',[
	"troopjs-compose/mixin/config",
	"troopjs-core/component/gadget",
	"./runner/sequence",
	"when"
], function (COMPOSE_CONF, Gadget, sequence, when) {
	

	/**
	 * @class opt.route.gadget
	 * @extend core.component.gadget
	 */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ROUTE = "route";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var ARGS = "args";
	var RUNNER = "runner";

	/**
	 * Route set event
	 * @localdoc Triggered when a route set is requested
	 * @event route/set
	 * @param {String} route Route
	 * @param {Object} data Data
	 * @param {...*} [args] Additional arguments
	 * @preventable
	 */

	/**
	 * Route change event
	 * @localdoc Triggered when a route change is requested
	 * @event route/change
	 * @param {String} route Route
	 * @param {String[]} data Data
	 * @param {...*} [args] Additional arguments
	 * @preventable
	 */

	/**
	 * Route change handler
	 * @handler route/change
	 * @inheritdoc #event-route/change
	 * @localdoc Matches and executes route stored in data
	 * @template
	 * @return {*}
	 */

	/**
	 * To change the current route
	 * @event hub/route/set
	 * @param {String} The new uri
	 */

	/**
	 * Runs routes
	 * @ignore
	 * @param {String} op Operation
	 * @param {...*} [args] Additional arguments
	 * @return {*} Result from last handler
	 */
	function runRoute(op) {
		var me = this;

		// Prepare event object
		var event = {};
		event[TYPE] = ROUTE + "/" + op;
		event[RUNNER] = sequence;

		// Modify first argument
		arguments[0] = event;

		// Delegate the actual emitting to emit
		return me.emit.apply(me, arguments);
	}

	// Add pragma for ROUTE special
	COMPOSE_CONF.pragmas.push({
		"pattern": /^route\/(change|set)(\/.*)?$/,
		"replace": ROUTE + "/$1(\"$2\")"
	});

	return Gadget.extend({
		"displayName" : "opt/route/gadget",

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Registers event handlers declared ROUTE specials
		 */
		"sig/initialize": function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[ROUTE] || ARRAY_PROTO, function (special) {
				return me.on(special[NAME], special[VALUE], special[ARGS][0] || undefined);
			});
		},

		/**
		 * @handler hub/route/change
		 * @param {String} uri The new URI.
		 * Handles URI change to dispatch it to individual handlers by emitting a {@link #event-route/change} event
		 * synchronously, call each handler when the pattern matches the new URI.
		 */
		"hub:memory/route/change": function onHashChange(uri) {
			var me = this;
			var args = [ "change" ];
			ARRAY_PUSH.apply(args, arguments);
			return me.task(function(resolve) {
				resolve(runRoute.apply(me, args));
			}, ROUTE + "/change");
		},

		/**
		 * Handles route set
		 * @handler
		 * @inheritdoc #event-route/set
		 * @localdoc Translates {@link #event-route/set} to {@link dom.hash.widget#event-hub/hash/set}
		 * @fires hub/route/set
		 */
		"route/set": function onRouteSet(route, data) {
			var me = this;
			var args = [ "route/set" ];
			ARRAY_PUSH.apply(args, arguments);
			return this.publish.apply(me, args);
		},

		/**
		 * Navigate to a new URI by fulfill the route parameters with the specified list of values, after emitting
		 * a {@link #event-route/set} event synchronously, call each handler whose route pattern where the pattern matches it.
		 *
		 * @param {String} pattern The route pattern to construct the new route.
		 * @param {Object} params The data object contains the parameter values for routing.
		 * @return {Promise}
		 * @fires route/set
		 */
		"go": function go(pattern, params) {
			var me = this;
			var args = [ "set" ];
			ARRAY_PUSH.apply(args, arguments);
			return me.task(function (resolve) {
				resolve(runRoute.apply(me, args));
			}, ROUTE + "/set");
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/store/component',[
	"troopjs-core/mixin/base",
	"when",
	"poly/array"
], function StoreModule(Base, when) {
	

	/**
	 * A simple key-value store that supports **dot separated key** format.
	 * @class opt.store.component
	 * @extend core.mixin.base
	 */

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARRAY = "[object Array]";
	var TOSTRING_OBJECT = "[object Object]";
	var TOSTRING_FUNCTION = "[object Function]";
	var TOSTRING_STRING = "[object String]";
	var ARRAY_SLICE = Array.prototype.slice;
	var LENGTH = "length";
	var ADAPTERS = "adapters";
	var STORAGE = "storage";
	var BEFORE_GET = "beforeGet";
	var AFTER_PUT = "afterPut";
	var CLEAR = "clear";
	var LOCKS = "locks";

	/**
	 * Applies method to this (if it exists)
	 * @param {String} method Method name
	 * @return {Boolean|*}
	 * @ignore
	 */
	function applyMethod(method) {
		/*jshint validthis:true*/
		var me = this;

		return method in me && me[method].apply(me, ARRAY_SLICE.call(arguments, 1));
	}

	/**
	 * Puts value
	 * @param {String|null} key Key - can be dot separated for sub keys
	 * @param {*} value Value
	 * @return {Promise} Promise of put
	 * @ignore
	 */
	function put(key, value) {
		/*jshint validthis:true*/
		var me = this;
		var node = me[STORAGE];
		var parts = key
			? key.split(".")
			: [];
		var part;
		var last = parts.pop();

		while (node && (part = parts.shift())) {
			switch (OBJECT_TOSTRING.call(node)) {
				case TOSTRING_ARRAY :
				/* falls through */

				case TOSTRING_OBJECT :
					if (part in node) {
						node = node[part];
						break;
					}
				/* falls through */

				default :
					node = node[part] = {};
			}
		}

		// Evaluate value if needed
		if (OBJECT_TOSTRING.call(value) === TOSTRING_FUNCTION) {
			value = value.call(me, {
				"get" : function () {
					return get.apply(me, arguments);
				},
				"has" : function () {
					return has.apply(me, arguments);
				}
			}, key);
		}

		return last !== UNDEFINED
			// First store the promise, then override with the true value once resolved
			? when(value, function (result) {
				node[last] = result;

				return result;
			})
			// No key provided, just return a promise of the value
			: when(value);
	}

	/**
	 * Gets value
	 * @param {String} key Key - can be dot separated for sub keys
	 * @return {*} Value
	 * @ignore
	 */
	function get(key) {
		/*jshint validthis:true*/
		var node = this[STORAGE];
		var parts = key.split(".");
		var part;

		while (node && (part = parts.shift())) {
			switch (OBJECT_TOSTRING.call(node)) {
				case TOSTRING_ARRAY :
				/* falls through */

				case TOSTRING_OBJECT :
					if (part in node) {
						node = node[part];
						break;
					}
				/* falls through */

				default :
					node = UNDEFINED;
			}
		}

		return node;
	}

	/**
	 * Check is key exists
	 * @param key {String} key Key - can be dot separated for sub keys
	 * @return {Boolean}
	 * @ignore
	 */
	function has(key) {
		/*jshint validthis:true*/
		var node = this[STORAGE];
		var parts = key.split(".");
		var part;
		var last = parts.pop();

		while (node && (part = parts.shift())) {
			switch (OBJECT_TOSTRING.call(node)) {
				case TOSTRING_ARRAY :
				/* falls through */

				case TOSTRING_OBJECT :
					if (part in node) {
						node = node[part];
						break;
					}
				/* falls through */

				default :
					node = UNDEFINED;
			}
		}

		return node !== UNDEFINED && last in node;
	}

	/**
	 * @method constructor
	 * @param {...Object} adapter One or more adapters
	 * @throws {Error} If no adapter was provided
	 */
	return Base.extend(function StoreComponent(adapter) {
		if (arguments[LENGTH] === 0) {
			throw new Error("No adapter(s) provided");
		}

		var me = this;

		/**
		 * Current adapters
		 * @private
		 * @readonly
		 * @property {Array} adapters
		 */
		me[ADAPTERS] = ARRAY_SLICE.call(arguments);

		/**
		 * Current storage
		 * @private
		 * @readonly
		 * @property {Object} storage
		 */
		me[STORAGE] = {};

		/**
		 * Current locks
		 * @private
		 * @readonly
		 * @property {Object} locks
		 */
		me[LOCKS] = {};
	}, {
		"displayName" : "opt/store/component",

		/**
		 * Waits for store to be "locked"
		 * @param {String} key Key
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of ready
		 */
		"lock" : function (key, onFulfilled, onRejected, onProgress) {
			var locks = this[LOCKS];
			var result;

			if (OBJECT_TOSTRING.call(key) !== TOSTRING_STRING) {
				throw new Error("key has to be of type string");
			}

			result = locks[key] = when(locks[key], onFulfilled, onRejected, onProgress);

			return result;
		},

		/**
		 * Gets state value
		 * @param {...String} key Key - can be dot separated for sub keys
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of value
		 */
		"get" : function (key, onFulfilled, onRejected, onProgress) {
			/*jshint curly:false*/
			var me = this;
			var keys = ARRAY_SLICE.call(arguments);
			var i;
			var iMax;

			// Step until we hit the end or keys[i] is not a string
			for (i = 0, iMax = keys[LENGTH]; i < iMax && OBJECT_TOSTRING.call(keys[i]) === TOSTRING_STRING; i++);

			// Update callbacks
			onFulfilled = keys[i];
			onRejected = keys[i+1];
			onProgress = keys[i+2];

			// Set the new length of keys
			keys[LENGTH] = i;

			return when
				.map(keys, function (key) {
					return when
						// Map adapters and BEFORE_GET on each adapter
						.map(me[ADAPTERS], function (adapter) {
							return when(applyMethod.call(adapter, BEFORE_GET, me, key));
						})
						// Get value from STORAGE
						.then(function () {
							return get.call(me, key);
						});
				})
				// Add callbacks
				.then(onFulfilled && when.apply(onFulfilled), onRejected, onProgress);
		},

		/**
		 * Puts state value
		 * @param {String} key Key - can be dot separated for sub keys
		 * @param {*} value Value
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of value
		 */
		"put" : function (key, value, onFulfilled, onRejected, onProgress) {
			var me = this;

			return when(put.call(me, key, value), function (result) {
				return when
					// Map adapters and AFTER_PUT on each adapter
					.map(me[ADAPTERS], function (adapter) {
						return when(applyMethod.call(adapter, AFTER_PUT, me, key, result));
					})
					.yield(result);
			})
				// Add callbacks
				.then(onFulfilled, onRejected, onProgress);
		},

		/**
		 * Puts state value if key is UNDEFINED
		 * @param {String} key Key - can be dot separated for sub keys
		 * @param {*} value Value
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of value
		 */
		"putIfNotHas" : function (key, value, onFulfilled, onRejected, onProgress) {
			var me = this;

			return !me.has(key)
				? me.put(key, value, onFulfilled, onRejected, onProgress)
				: when(UNDEFINED, onFulfilled, onRejected, onProgress);
		},

		/**
		 * Checks if key exists
		 * @param {String} key Key - can be dot separated for sub keys
		 * @return {Boolean} True if key exists, otherwise false
		 */
		"has" : function (key) {
			return has.call(this, key);
		},

		/**
		 * Clears all adapters
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of clear
		 */
		"clear" : function (onFulfilled, onRejected, onProgress) {
			var me = this;

			return when
				.map(me[ADAPTERS], function (adapter) {
					return when(applyMethod.call(adapter, CLEAR, me));
				})
				// Add callbacks
				.then(onFulfilled && when.apply(onFulfilled), onRejected, onProgress);
		}
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-net/ajax/service',[
	"troopjs-core/component/service",
	"jquery",
	"troopjs-util/merge"
], function (Service, $, merge) {
	

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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-data/cache/component',[
	"troopjs-core/component/base",
	"poly/object",
	"poly/array"
], function CacheModule(Component) {
	

	/**
	 * Component for handling effective object caching with cycle references concerned.
	 * @class data.cache.component
	 * @extend core.component.base
	 */

	var UNDEFINED;
	var TRUE = true;
	var FALSE = false;
	var NULL = null;
	var OBJECT = Object;
	var ARRAY = Array;

	var SECOND = 1000;
	var GENERATIONS = "generations";
	var HEAD = "head";
	var NEXT = "next";
	var EXPIRES = "expires";
	var CONSTRUCTOR = "constructor";
	var LENGTH = "length";

	var _ID = "id";
	var _MAXAGE = "maxAge";
	var _EXPIRES = "expires";
	var _INDEXED = "indexed";
	var _COLLAPSED = "collapsed";

	/**
	 * Internal method to put a node in the cache
	 * @ignore
	 * @param node Node
	 * @param _constructor Constructor of value
	 * @param now Current time (seconds)
	 * @return Cached node
	 */
	function _put(node, _constructor, now) {
		/*jshint validthis:true, forin:false, curly:false, -W086*/
		var me = this;
		var result;
		var id;
		var i;
		var iMax;
		var expires;
		var expired;
		var head;
		var current;
		var next;
		var generation;
		var generations = me[GENERATIONS];
		var property;
		var value;

		// First add node to cache (or get the already cached instance)
		cache : {
			// Can't cache if there is no _ID
			if (!(_ID in node)) {
				result = node;          // Reuse ref to node (avoids object creation)
				break cache;
			}

			// Update _INDEXED
			node[_INDEXED] = now;

			// Get _ID
			id = node[_ID];

			// In cache, get it!
			if (id in me) {
				result = me[id];

				// Bypass collapsed object that already exists in cache.
				if(node[_COLLAPSED] === TRUE) {
					return result;
				}

				break cache;
			}

			// Not in cache, add it!
			result = me[id] = node;   // Reuse ref to node (avoids object creation)
		}

		// We have to deep traverse the graph before we do any expiration (as more data for this object can be available)

		// Check that this is an ARRAY
		if (_constructor === ARRAY) {
			// Index all values
			for (i = 0, iMax = node[LENGTH]; i < iMax; i++) {

				// Keep value
				value = node[i];

				// Get _constructor of value (safely, falling back to UNDEFINED)
				_constructor = value === NULL || value === UNDEFINED
					? UNDEFINED
					: value[CONSTRUCTOR];

				// Do magic comparison to see if we recursively put this in the cache, or plain put
				result[i] = (_constructor === OBJECT || _constructor === ARRAY && value[LENGTH] !== 0)
					? _put.call(me, value, _constructor, now)
					: value;
			}
		}

		// Check that this is an OBJECT
		else if (_constructor === OBJECT) {
			// Check if _not_ _COLLAPSED
			if (node[_COLLAPSED] === FALSE) {
				// Prune properties from result
				for (property in result) {
					// Except the _ID property
					// or the _COLLAPSED property
					// or the _EXPIRES property
					// if property is _not_ present in node
					if (property !== _ID
						&& property !== _COLLAPSED
						&& property !== _EXPIRES
						&& !(property in node)) {
						delete result[property];
					}
				}
			}

			// Index all properties
			for (property in node) {
				// Except the _ID property
				// or the _COLLAPSED property, if it's false
				if (property === _ID
					|| (property === _COLLAPSED && result[_COLLAPSED] === FALSE)) {
					continue;
				}

				// Keep value
				value = node[property];

				// Get _constructor of value (safely, falling back to UNDEFINED)
				_constructor = value === NULL || value === UNDEFINED
					? UNDEFINED
					: value[CONSTRUCTOR];

				// Do magic comparison to see if we recursively put this in the cache, or plain put
				result[property] = (_constructor === OBJECT || _constructor === ARRAY && value[LENGTH] !== 0)
					? _put.call(me, value, _constructor, now)
					: value;
			}
		}

		// Check if we need to move result between generations
		move : {
			// Break fast if id is UNDEFINED
			if (id === UNDEFINED) {
				break move;
			}

			// Calculate expiration and floor
			// '>>>' means convert anything other than posiitive integer into 0
			expires = 0 | now + (result[_MAXAGE] >>> 0);

			remove : {
				// Fail fast if there is no old expiration
				if (!(_EXPIRES in result)) {
					break remove;
				}

				// Get current expiration
				expired = result[_EXPIRES];

				// If expiration has not changed, we can continue
				if (expired === expires) {
					break move;
				}

				// Remove ref from generation (if that generation exists)
				if (expired in generations) {
					delete generations[expired][id];
				}
			}

			add : {
				// Collapsed object should not be collected by GC.
				if(result[_COLLAPSED] === TRUE) {
					break add;
				}

				// Update expiration time
				result[_EXPIRES] = expires;

				// Existing generation
				if (expires in generations) {
					// Add result to generation
					generations[expires][id] = result;
					break add;
				}

				// Create generation with expiration set
				(generation = generations[expires] = {})[EXPIRES] = expires;

				// Add result to generation
				generation[id] = result;

				// Short circuit if there is no head
				if (generations[HEAD] === UNDEFINED) {
					generations[HEAD] = generation;
					break add;
				}

				// Step through list as long as there is a next, and expiration is "older" than the next expiration
				for (current = head = generations[HEAD]; (next = current[NEXT]) !== UNDEFINED && next[EXPIRES] < expires; current = next);

				// Check if we're still on the head and if we're younger
				if (current === head && current[EXPIRES] > expires) {
					// Next generation is the current one (head)
					generation[NEXT] = current;

					// Reset head to new generation
					generations[HEAD] = generation;
					break add;
				}

				// Insert new generation between current and current.next
				generation[NEXT] = current[NEXT];
				current[NEXT] = generation;
			}
		}

		return result;
	}

	/**
	 * @method constructor
	 */
	return Component.extend(function CacheComponent() {
		/**
		 * Cache generations
		 * @private
		 * @readonly
		 * @property {Object} generations
		 */
		this[GENERATIONS] = {};
	}, {
		"displayName" : "data/cache/component",

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Purges all objects that duck-type cache-able
		 */
		"sig/finalize" : function finalize() {
			var me = this;

			// Iterate all properties on me
			Object.keys(me).forEach(function (property) {
				var value;

				// Check if we should delete this property
				if ((value = me[property]) !== UNDEFINED // value is not UNDEFINED
					&& [CONSTRUCTOR] === OBJECT            // and value[CONSTRUCTOR] is OBJECT
					&& value.hasOwnProperty(_ID)) {        // and value ducktypes cachable
					// Delete from me (cache)
					delete me[property];
				}
			});
		},

		/**
		 * Puts a node into the cache
		 * @param node Node to add (object || array)
		 * @return Cached node (if it existed in the cache before), otherwise the node sent in
		 */
		"put" : function put(node) {
			var me = this;

			// Get _constructor of node (safely, falling back to UNDEFINED)
			var _constructor = node === NULL || node === UNDEFINED
				? UNDEFINED
				: node[CONSTRUCTOR];

			// Do magic comparison to see if we should cache this object
			return _constructor === OBJECT || _constructor === ARRAY && node[LENGTH] !== 0
				? _put.call(me, node, _constructor, 0 | new Date().getTime() / SECOND)
				: node;
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-data/cache/service',[ "troopjs-core/component/service" ], function CacheServiceModule(Service) {
	

	/**
	 * Service for evicting values from one or more {@link data.cache.component caches}
	 * @class data.cache.service
	 * @extend core.component.service
	 */

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var CACHES = "_caches";
	var TIMEOUT = "_timeout";
	var SECOND = 1000;
	var GENERATIONS = "generations";
	var HEAD = "head";
	var NEXT = "next";
	var EXPIRES = "expires";
	var LENGTH = "length";

	function sweep(expires) {
		/*jshint forin:false*/
		var me = this;
		var generations = me[GENERATIONS];
		var property;
		var current;

		// Get head
		current = generations[HEAD];

		// Fail fast if there's no head
		if (current === UNDEFINED) {
			return;
		}

		do {
			// Exit if this generation is to young
			if (current[EXPIRES] > expires) {
				break;
			}

			// Iterate all properties on current
			for (property in current) {
				// And is it not a reserved property
				if (property === EXPIRES || property === NEXT || property === GENERATIONS) {
					continue;
				}

				// Delete from me (cache)
				delete me[property];
			}

			// Delete generation
			delete generations[current[EXPIRES]];
		}
			// While there's a next
		while ((current = current[NEXT]));

		// Reset head
		generations[HEAD] = current;
	}

	/**
	 * @method constructor
	 * @param {...data.cache.component} cache One or more cache components
	 */
	return Service.extend(function CacheService(cache) {
		/**
		 * Internal caches
		 * @private
		 * @readonly
		 * @property {data.cache.component[]} caches
		 */
		this[CACHES] = ARRAY_SLICE.call(arguments);
	}, {
		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Starts the cache eviction
		 * @param {Number} delay Delay between cache eviction sweeps
		 */
		"sig/start" : function start(delay) {
			var me = this;
			var caches = me[CACHES];

			if (delay === UNDEFINED) {
				delay = (60 * SECOND);
			}

			function loop() {
				// Calculate expiration of this generation
				var expires = 0 | new Date().getTime() / SECOND;
				var i;
				var iMax;

				//. Loop over caches
				for (i = 0, iMax = caches[LENGTH]; i < iMax; i++) {
					// Call sweep on each cache
					sweep.call(caches[i], expires);

					// Set timeout for next execution
					me[TIMEOUT] = setTimeout(loop, delay);
				}
			}

			// Start loop
			loop();
		},

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Stops the cache eviction
		 */
		"sig/stop" : function stop() {
			var me = this;

			// Clear timeout
			clearTimeout(me[TIMEOUT]);
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-data/query/component',[ "troopjs-core/mixin/base" ], function QueryModule(Base) {
	

	/**
	 * Component who understands the ubiquitous data query string format.
	 * @class data.query.component
	 * @extend core.mixin.base
	 */

	var UNDEFINED;
	var TRUE = true;
	var FALSE = false;
	var OBJECT = Object;
	var ARRAY = Array;
	var CONSTRUCTOR = "constructor";
	var LENGTH = "length";

	var OP = "op";
	var OP_ID = "!";
	var OP_PROPERTY = ".";
	var OP_PATH = ",";
	var OP_QUERY = "|";
	var TEXT = "text";
	var RAW = "raw";
	var RESOLVED = "resolved";
	var _ID = "id";
	var _EXPIRES = "expires";
	var _COLLAPSED = "collapsed";
	var _AST = "_ast";
	var _QUERY = "_query";

	var RE_TEXT = /("|')(.*?)\1/;
	var TO_RAW = "$2";
	var RE_RAW = /!(.*[!,|.\s]+.*)/;
	var TO_TEXT = "!'$1'";

	/**
	 * @method constructor
	 * @param {String} [query] data query
	 */
	return Base.extend(function QueryComponent(query) {
		var me = this;

		if (query !== UNDEFINED) {
			me[_QUERY] = query;
		}
	}, {
		"displayName" : "data/query/component",

		/**
		 * Parse the query string.
		 * @chainable
		 * @param {String} query data query
		 */
		"parse" : function parse(query) {
			var me = this;

			// Reset _AST
			delete me[_AST];

			// Set _QUERY
			query = me[_QUERY] = (query || me[_QUERY] || "");

			var i;          // Index
			var l;          // Length
			var c;          // Current character
			var m;          // Current mark
			var q;          // Current quote
			var o;          // Current operation
			var ast = [];   // _AST

			// Step through the query
			for (i = m = 0, l = query[LENGTH]; i < l; i++) {
				c = query.charAt(i);

				switch (c) {
					case "\"" : // Double quote
					/* falls through */
					case "'" :  // Single quote
						// Set / unset quote char
						q = q === c
							? UNDEFINED
							: c;
						break;

					case OP_ID :
						// Break fast if we're quoted
						if (q !== UNDEFINED) {
							break;
						}

						// Init new op
						o = {};
						o[OP] = c;
						break;

					case OP_PROPERTY :
					/* falls through */
					case OP_PATH :
						// Break fast if we're quoted
						if (q !== UNDEFINED) {
							break;
						}

						// If there's an active op, store TEXT and push on _AST
						if (o !== UNDEFINED) {
							o[RAW] = (o[TEXT] = query.substring(m, i)).replace(RE_TEXT, TO_RAW);
							ast.push(o);
						}

						// Init new op
						o = {};
						o[OP] = c;

						// Set mark
						m = i + 1;
						break;

					case OP_QUERY :
					/* falls through */
					case " " :  // Space
					/* falls through */
					case "\t" : // Horizontal tab
					/* falls through */
					case "\r" : // Carriage return
					/* falls through */
					case "\n" : // Newline
						// Break fast if we're quoted
						if (q !== UNDEFINED) {
							break;
						}

						// If there's an active op, store TEXT and push on _AST
						if (o !== UNDEFINED) {
							o[RAW] = (o[TEXT] = query.substring(m, i)).replace(RE_TEXT, TO_RAW);
							ast.push(o);
						}

						// Reset op
						o = UNDEFINED;

						// Set mark
						m = i + 1;
						break;
				}
			}

			// If there's an active op, store TEXT and push on _AST
			if (o !== UNDEFINED) {
				o[RAW] = (o[TEXT] = query.substring(m, l)).replace(RE_TEXT, TO_RAW);
				ast.push(o);
			}

			// Set _AST
			me[_AST] = ast;

			return me;
		},

		/**
		 * Further reduce the query string elements based on the cache content,
		 * to eliminate unnecessary queries made.
		 * @chainable
		 * @param {Object} cache The cache dictionary.
		 */
		"reduce" : function reduce(cache) {
			var me = this;
			var now = 0 | new Date().getTime() / 1000;

			// If we're not parsed - parse
			if (!(_AST in me)) {
				me.parse();
			}

			var ast = me[_AST]; // _AST
			var result = [];    // Result
			var i;              // Index
			var j;
			var c;
			var l;              // Length
			var o;              // Current operation
			var x;              // Current raw
			var r;              // Current root
			var n;              // Current node
			var d = FALSE;      // Dead flag
			var k = FALSE;      // Keep flag

			// First step is to resolve what we can from the _AST
			for (i = 0, l = ast[LENGTH]; i < l; i++) {
				o = ast[i];

				switch (o[OP]) {
					case OP_ID :
						// Set root
						r = o;

						// Get e from o
						x = o[RAW];

						// Do we have this item in cache
						if (x in cache) {
							// Set current node
							n = cache[x];
							// Set dead and RESOLVED if we're not collapsed or expired
							d = o[RESOLVED] = n[_COLLAPSED] !== TRUE && !(_EXPIRES in n && n[_EXPIRES] < now);
						}
						else {
							// Reset current root and node
							n = UNDEFINED;
							// Reset dead and RESOLVED
							d = o[RESOLVED] = FALSE;
						}
						break;

					case OP_PROPERTY :
						// Get e from o
						x = o[RAW];

						// Was previous op dead?
						if (!d) {
							o[RESOLVED] = FALSE;
						}
						// Do we have a node and this item in the node
						else if (n && x in n) {
							// Set current node
							n = n[x];

							// Get constructor
							c = n[CONSTRUCTOR];

							// If the constructor is an array
							if (c === ARRAY) {
								// Set naive resolved
								o[RESOLVED] = TRUE;

								// Iterate backwards over n
								for (j = n[LENGTH]; j-- > 0;) {
									// Get item
									c = n[j];

									// If the constructor is not an object
									// or the object does not duck-type _ID
									// or the object is not collapsed
									// and the object does not duck-type _EXPIRES
									// or the objects is not expired
									if (c[CONSTRUCTOR] !== OBJECT
										|| !(_ID in c)
										|| c[_COLLAPSED] !== TRUE
										&& !(_EXPIRES in c && c[_EXPIRES] < now)) {
										continue;
									}

									// Change RESOLVED
									o[RESOLVED] = FALSE;
									break;
								}
							}
							// If the constructor is _not_ an object or n does not duck-type _ID
							else if (c !== OBJECT || !(_ID in n)) {
								o[RESOLVED] = TRUE;
							}
							// We know c _is_ and object and n _does_ duck-type _ID
							else {
								// Change OP to OP_ID
								o[OP] = OP_ID;
								// Update RAW to _ID and TEXT to escaped version of RAW
								o[TEXT] = (o[RAW] = n[_ID]).replace(RE_RAW, TO_TEXT);
								// Set RESOLVED if we're not collapsed or expired
								o[RESOLVED] = n[_COLLAPSED] !== TRUE && !(_EXPIRES in n && n[_EXPIRES] < now);
							}
						}
						else {
							// Reset current node and RESOLVED
							n = UNDEFINED;
							o[RESOLVED] = FALSE;
						}
						break;

					case OP_PATH :
						// Get e from r
						x = r[RAW];

						// Set current node
						n = cache[x];

						// Change OP to OP_ID
						o[OP] = OP_ID;

						// Copy properties from r
						o[TEXT] = r[TEXT];
						o[RAW] = x;
						o[RESOLVED] = r[RESOLVED];
						break;
				}
			}

			// After that we want to reduce 'dead' operations from the _AST
			while (l-- > 0) {
				o = ast[l];

				switch(o[OP]) {
					case OP_ID :
						// If the keep flag is set, or the op is not RESOLVED
						if (k || o[RESOLVED] !== TRUE) {
							result.unshift(o);
						}

						// Reset keep flag
						k = FALSE;
						break;

					case OP_PROPERTY :
						result.unshift(o);

						// Set keep flag
						k = TRUE;
						break;
				}
			}

			// Update _AST
			me[_AST] = result;

			return me;
		},

		/**
		 * Retrieve the AST as the parsed result.
		 * @return {Array} the result AST.
		 */
		"ast" : function ast() {
			var me = this;

			// If we're not parsed - parse
			if (!(_AST in me)) {
				me.parse();
			}

			return me[_AST];
		},

		/**
		 * Rebuild the (reduced) query string.
		 * @return {String} new query string
		 */
		"rewrite" : function rewrite() {
			var me = this;

			// If we're not parsed - parse
			if (!(_AST in me)) {
				me.parse();
			}

			var ast = me[_AST]; // AST
			var result = "";    // Result
			var l;              // Current length
			var i;              // Current index
			var o;              // Current operation

			// Step through AST
			for (i = 0, l = ast[LENGTH]; i < l; i++) {
				o = ast[i];

				switch(o[OP]) {
					case OP_ID :
						// If this is the first OP_ID, there's no need to add OP_QUERY
						result += i === 0
							? o[TEXT]
							: OP_QUERY + o[TEXT];
						break;

					case OP_PROPERTY :
						result += OP_PROPERTY + o[TEXT];
						break;
				}
			}

			return result;
		}
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-data/query/service',[
	"module",
	"troopjs-core/component/service",
	"./component",
	"troopjs-util/merge",
	"when"
], function QueryServiceModule(module, Service, Query, merge, when) {
	

	/**
	 * Service that batch processes the query requests send to server and cache the results.
	 * @class data.query.service
	 * @extend core.component.service
	 * @uses net.ajax.service
	 */

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_CONCAT = ARRAY_PROTO.concat;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var LENGTH = "length";
	var BATCHES = "batches";
	var INTERVAL = "interval";
	var CACHE = "cache";
	var QUERIES = "queries";
	var RESOLVED = "resolved";
	var CONFIGURATION = "configuration";
	var RAW = "raw";
	var ID = "id";
	var Q = "q";
	var MODULE_CONFIG = module.config();

	/**
	 * @method constructor
	 * @param {data.cache.component} cache Cache
	 * @throws {Error} If no cache is provided
	 */
	return Service.extend(function QueryService(cache) {
		var me = this;

		if (cache === UNDEFINED) {
			throw new Error("No cache provided");
		}

		/**
		 * Current batches
		 * @private
		 * @readonly
		 * @property {Array} batches
		 */
		me[BATCHES] = [];

		/**
		 * Current cache
		 * @private
		 * @readonly
		 * @property {data.cache.component} cache
		 */
		me[CACHE] = cache;

		me.configure(MODULE_CONFIG);
	}, {
		"displayName" : "data/query/service",

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Starts batch interval
		 */
		"sig/start" : function start() {
			var me = this;
			var cache = me[CACHE];

			// Set interval (if we don't have one)
			me[INTERVAL] = INTERVAL in me
				? me[INTERVAL]
				: setInterval(function scan() {
				var batches = me[BATCHES];

				// Return fast if there is nothing to do
				if (batches[LENGTH] === 0) {
					return;
				}

				// Reset batches
				me[BATCHES] = [];

				/**
				 * Requests via ajax
				 * @ignore
				 * @fires net.ajax.service#event-hub/ajax
				 */
				function request() {
					var q = [];
					var i;

					// Iterate batches
					for (i = batches[LENGTH]; i--;) {
						// Add batch[Q] to q
						ARRAY_PUSH.apply(q, batches[i][Q]);
					}

					// Publish ajax
					return me.publish("ajax", merge.call({
						"data": {
							"q": q.join("|")
						}
					}, me[CONFIGURATION]));
				}

				function done(data) {
					var batch;
					var queries;
					var id;
					var i;
					var j;

					// Add all new data to cache
					cache.put(data);

					// Iterate batches
					for (i = batches[LENGTH]; i--;) {
						batch = batches[i];
						queries = batch[QUERIES];
						id = batch[ID];

						// Iterate queries
						for (j = queries[LENGTH]; j--;) {
							// If we have a corresponding ID, fetch from cache
							if (j in id) {
								queries[j] = cache[id[j]];
							}
						}

						// Resolve batch
						batch.resolve(queries);
					}
				}

				function fail() {
					var batch;
					var i;

					// Iterate batches
					for (i = batches[LENGTH]; i--;) {
						batch = batches[i];

						// Reject (with original queries as argument)
						batch.reject(batch[QUERIES]);
					}
				}

				// Request and handle response
				request().then(done, fail);
			}, 200);
		},

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Stops batch interval
		 */
		"sig/stop" : function stop() {
			var me = this;

			// Only do this if we have an interval
			if (INTERVAL in me) {
				// Clear interval
				clearInterval(me[INTERVAL]);

				// Reset interval
				delete me[INTERVAL];
			}
		},

		/**
		 * Handle query request on hub event.
		 * @handler
		 * @param {...String} query TroopJS data query
		 * @return {Promise}
		 */
		"hub/query" : function hubQuery(query) {
			var me = this;
			var batches = me[BATCHES];
			var cache = me[CACHE];
			var q = [];
			var id = [];
			var ast;
			var i;
			var j;
			var iMax;
			var queries;

			// Create deferred batch
			var deferred = when.defer();
			var resolver = deferred.resolver;

			try {
				// Slice and flatten queries
				queries = ARRAY_CONCAT.apply(ARRAY_PROTO, ARRAY_SLICE.call(arguments));

				// Iterate queries
				for (i = 0, iMax = queries[LENGTH]; i < iMax; i++) {
					// Init Query
					query = Query(queries[i]);

					// Get AST
					ast = query.ast();

					// If we have an ID
					if (ast[LENGTH] > 0) {
						// Store raw ID
						id[i] = ast[0][RAW];
					}

					// Get reduced AST
					ast = query.reduce(cache).ast();

					// Step backwards through AST
					for (j = ast[LENGTH]; j-- > 0;) {
						// If this op is not resolved
						if (!ast[j][RESOLVED]) {
							// Add rewritten (and reduced) query to q
							ARRAY_PUSH.call(q, query.rewrite());
							break;
						}
					}
				}

				// If all queries were fully reduced, we can quick resolve
				if (q[LENGTH] === 0) {
					// Iterate queries
					for (i = 0; i < iMax; i++) {
						// If we have a corresponding ID, fetch from cache
						if (i in id) {
							queries[i] = cache[id[i]];
						}
					}

					// Resolve batch resolver
					resolver.resolve(queries);
				}
				else {
					// Store properties on batch
					resolver[QUERIES] = queries;
					resolver[ID] = id;
					resolver[Q] = q;

					// Add batch to batches
					batches.push(resolver);
				}
			}
			catch (e) {
				resolver.reject(e);
			}

			// Return promise
			return deferred.promise;
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-jquery/hashchange',[ "jquery" ], function HashchangeModule($) {
	

	/**
	 * Normalized hashchange event. Extends {@link jQuery} with:
	 *
	 * - {@link $#event-hashchange} event
	 *
	 *
	 * <div class="notice">
	 * Heavily influenced by <a href="https://github.com/millermedeiros/Hasher">Hasher</a>
	 * which is available under <a href="ttp://www.opensource.org/licenses/mit-license.php">MIT license</a>.
	 * </div>
	 *
	 * @class jquery.hashchange
	 * @static
	 * @alias plugin.jquery
	 */

	var INTERVAL = "interval";
	var HASHCHANGE = "hashchange";
	var ONHASHCHANGE = "on" + HASHCHANGE;
	var RE_HASH = /#(.*)$/;
	var RE_LOCAL = /\?/;

	// hack based on this: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
	var _isIE = '\v' == 'v';

	function getHash(window) {
		// parsed full URL instead of getting location.hash because Firefox
		// decode hash value (and all the other browsers don't)
		// also because of IE8 bug with hash query in local file
		var result = RE_HASH.exec(window.location.href);

		return result && result[1]
			? decodeURIComponent(result[1])
			: "";
	}

	function Frame(document) {
		var me = this;
		var element;

		me.element = element = document.createElement("iframe");
		element.src = "about:blank";
		element.style.display = "none";
	}

	Frame.prototype = {
		"getElement" : function () {
			return this.element;
		},

		"getHash" : function () {
			return this.element.contentWindow.frameHash;
		},

		"update" : function (hash) {
			/*jshint evil:true*/
			var me = this;
			var document = me.element.contentWindow.document;

			// Quick return if hash has not changed
			if (me.getHash() === hash) {
				return;
			}

			// update iframe content to force new history record.
			// based on Really Simple History, SWFAddress and YUI.history.
			document.open();
			document.write("<html><head><title>' + document.title + '</title><script type='text/javascript'>var frameHash='" + hash + "';</script></head><body>&nbsp;</body></html>");
			document.close();
		}
	};

	/**
	 * @class $
	 */

	/**
	 * A special jQuery event fired ever when the URL hash has changed.
	 * @event hashchange
	 */
	$.event.special[HASHCHANGE] = {
		"setup" : function onHashChangeSetup() {
			var window = this;

			// Quick return if we support onHashChange natively
			// FF3.6+, IE8+, Chrome 5+, Safari 5+
			if (ONHASHCHANGE in window) {
				return false;
			}

			// Make sure we're always a window
			if (!$.isWindow(window)) {
				throw new Error("Unable to bind 'hashchange' to a non-window object");
			}

			var $window = $(window);
			var hash = getHash(window);
			var location = window.location;

			$window.data(INTERVAL, window.setInterval(_isIE
				? (function () {
					var document = window.document;
					var _isLocal = location.protocol === "file:";

					var frame = new Frame(document);
					document.body.appendChild(frame.getElement());
					frame.update(hash);

					return function () {
						var oldHash = hash;
						var newHash;
						var windowHash = getHash(window);
						var frameHash = frame.getHash();

						// Detect changes made pressing browser history buttons.
						// Workaround since history.back() and history.forward() doesn't
						// update hash value on IE6/7 but updates content of the iframe.
						if (frameHash !== hash && frameHash !== windowHash) {
							// Fix IE8 while offline
							newHash = decodeURIComponent(frameHash);

							if (hash !== newHash) {
								hash = newHash;
								frame.update(hash);
								$window.trigger(HASHCHANGE, [ newHash, oldHash ]);
							}

							// Sync location.hash with frameHash
							location.hash = "#" + encodeURI(_isLocal
								? frameHash.replace(RE_LOCAL, "%3F")
								: frameHash);
						}
						// detect if hash changed (manually or using setHash)
						else if (windowHash !== hash) {
							// Fix IE8 while offline
							newHash = decodeURIComponent(windowHash);

							if (hash !== newHash) {
								hash = newHash;
								$window.trigger(HASHCHANGE, [ newHash, oldHash ]);
							}
						}
					};
				})()
				: function () {
					var oldHash = hash;
					var newHash;
					var windowHash = getHash(window);

					if (windowHash !== hash) {
						// Fix IE8 while offline
						newHash = decodeURIComponent(windowHash);

						if (hash !== newHash) {
							hash = newHash;
							$window.trigger(HASHCHANGE, [ newHash, oldHash ]);
						}
					}
				}, 25));
		},

		"teardown" : function onHashChangeTeardown() {
			var window = this;

			// Quick return if we support onHashChange natively
			if (ONHASHCHANGE in window) {
				return false;
			}

			window.clearInterval($.data(window, INTERVAL));
		}
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/hash/widget',[
	"../component/widget",
	"troopjs-jquery/hashchange"
], function (Widget) {
	

	/**
	 * Widget that attaches to the window object in order to handle `window.location.hash` changes.
	 * @class dom.hash.widget
	 * @extend dom.component.widget
	 * @alias widget.hash
	 */

	var $ELEMENT = "$element";
	var HASH = "_hash";
	var RE = /^#/;

	/**
	 * Hash change event (global)
	 * @localdoc Triggered when a {@link #$element} with {@link dom.hash.widget} attached to it changes its hash
	 * @event hub/hash/change
	 * @param {String} hash The new hash
	 */

	/**
	 * Hash change event (local)
	 * @localdoc Triggered when the attached {@link #$element} hash is changed
	 * @event dom/hashchange
	 * @preventable
	 * @param {Object} $event {@link jQuery} event
	 * @param {String} hash The new hash
	 */

	/**
	 * Hash set event (global)
	 * @localdoc Triggered when a component wants to change the hash of an {@link #$element}'s with {@link dom.hash.widget} attached to it
	 * @event hub/hash/set
	 * @param {String} hash The new hash
	 * @param {Boolean} [silent=false] Change the hash silently without triggering {@link dom.hash.widget#event-hub/hash/change} event.
	 */

	/**
	 * Hash set event (local)
	 * @localdoc Triggered when a component wants to change the attached {@link #$element} hash
	 * @event dom/hashset
	 * @preventable
	 * @param {Object} $event {@link jQuery} event
	 * @param {String} hash The new hash
	 * @param {Boolean} [silent=false] Change the hash silently without triggering {@link dom.hash.widget#event-dom/hashchange} event.
	 */

	/**
	 * Fires whenever the browser route has changed
	 * @event hub/route/change
	 * @preventable
	 * @param {String} hash The new hash
	 */

	/**
	 * Hash change handler (global)
	 * @inheritdoc #event-hub/hash/change
	 * @handler hub/hash/change
	 * @template
	 * @return {Promise}
	 */

	return Widget.extend({
		"displayName" : "dom/hash/widget",

		/**
		 * @inheritdoc
		 * @handler
		 */
		"sig/start" : function () {
			this[$ELEMENT].trigger("hashchange");
		},

		/**
		 * Hash change handler (local)
		 * @handler
		 * @inheritdoc #event-dom/hashchange
		 * @localdoc Handles changing hash of the attached {@link #$element}
		 * @param {Object} $event {@link jQuery} event
		 * @fires hub/route/change
		 */
		"dom/hashchange": function ($event) {
			var me = this;
			var hash = me[$ELEMENT].get(0).location.hash.replace(RE, "");

			// Did anything change?
			if (hash !== me[HASH]) {
				// Store and publish new hash
				me.publish("route/change", me[HASH] = hash);
			}
			else {
				// Prevent further hashchange handlers from receiving this
				$event.stopImmediatePropagation();
			}
		},

		/**
		 * Hash set handler (local)
		 * @inheritdoc #event-dom/hashset
		 * @localdoc Handles setting hash of the attached {@link #$element}
		 * @handler
		 */
		"dom/hashset": function ($event, hash, silent) {
			this.publish("route/set", hash, null, silent);
		},

		/**
		 * Route set handler (global), implicitly translates to {@link #event-dom/hashset} by setting the {@link #$element} hash
		 * @handler hub/route/set
		 * @return {Promise}
		 */
		"hub/route/set": function (path, data, silent) {
			var me = this;

			// If we are silent we update the local me[HASH] to prevent change detection
			if (silent === true) {
				me[HASH] = path;
			}

			me[$ELEMENT].get(0).location.hash = path;
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/woven',[
	"./config",
	"when",
	"jquery",
	"poly/array"
], function WovenModule(config, when, $) {
	

	/**
	 * @class dom.loom.woven
	 * @mixin dom.loom.config
	 * @mixin Function
	 * @static
	 */

	var ARRAY_MAP = Array.prototype.map;
	var LENGTH = "length";
	var WOVEN = "woven";
	var $WARP = config["$warp"];

	/**
	 * Retrieve all or specific widget instances living on this element, that are
	 * created by {@link dom.loom.weave}.
	 *
	 * It also lives as a jquery plugin as {@link $#method-woven}.
	 * @method constructor
	 * @param {...String} [widget] One or more widget names to narrow down the returned ones.
	 * @return {Promise} Promise to the completion of retrieving the woven widgets array.
	 */
	return function woven() {
		var $woven = [];
		var $wovenLength = 0;
		var re;

		// If we have arguments we have convert and filter
		if (arguments[LENGTH] > 0) {
			// Map arguments to a regexp
			re = new RegExp(ARRAY_MAP.call(arguments, function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Iterate
			$(this).each(function (index, element) {
				// Filter widget promises
				var $widgets = ($.data(element, $WARP) || []).filter(function ($weft) {
					return re.test($weft[WOVEN]);
				});

				// Add promise of widgets to $woven
				$woven[$wovenLength++] = when.all($widgets);
			});
		}
		// Otherwise we can use a faster approach
		else {
			// Iterate
			$(this).each(function (index, element) {
				// Add promise of widgets to $woven
				$woven[$wovenLength++] = when.all($.data(element, $WARP));
			});
		}

		// Return promise of $woven
		return when.all($woven);
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/plugin',[
	"jquery",
	"when",
	"./config",
	"./weave",
	"./unweave",
	"./woven",
	"troopjs-util/getargs",
	"poly/array"
], function WeaveModule($, when, config, weave, unweave, woven, getargs) {
	

	/**
	 * Extends {@link jQuery} with:
	 *
	 *  - {@link $#property-weave} and {@link $#property-woven} properties
	 *  - {@link $#method-weave}, {@link $#method-unweave} and {@link $#method-woven} methods
	 *
	 * @class dom.loom.plugin
	 * @static
	 * @alias plugin.jquery
	 */

	var UNDEFINED;
	var $FN = $.fn;
	var $EXPR = $.expr;
	var $CREATEPSEUDO = $EXPR.createPseudo;
	var WEAVE = "weave";
	var UNWEAVE = "unweave";
	var WOVEN = "woven";
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var RE_SEPARATOR = /[\s,]+/;

	/**
	 * Tests if element has a data-weave attribute
	 * @param element to test
	 * @return {boolean}
	 * @ignore
	 */
	function hasDataWeaveAttr(element) {
		return $(element).attr(ATTR_WEAVE) !== UNDEFINED;
	}

	/**
	 * Tests if element has a data-woven attribute
	 * @param element to test
	 * @return {boolean}
	 * @ignore
	 */
	function hasDataWovenAttr(element) {
		return $(element).attr(ATTR_WOVEN) !== UNDEFINED;
	}

	/**
	 * @class $
	 */

	/**
	 * jQuery `:weave` expression
	 * @property weave
	 */
	$EXPR[":"][WEAVE] = $CREATEPSEUDO
		// If we have jQuery >= 1.8 we want to use .createPseudo
		? $CREATEPSEUDO(function (widgets) {
			// If we don't have widgets to test, quick return optimized expression
			if (widgets === UNDEFINED) {
				return hasDataWeaveAttr;
			}

			// Convert widgets to RegExp
			widgets = new RegExp(getargs.call(widgets).map(function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Return expression
			return function (element) {
				// Get weave attribute
				var weave = $(element).attr(ATTR_WEAVE);

				// Check that weave is not UNDEFINED, and that widgets test against a processed weave
				return weave !== UNDEFINED && widgets.test(weave.replace(RE_SEPARATOR, "\n"));
			};
		})
		// Otherwise fall back to legacy
		: function (element, index, match) {
			var weave = $(element).attr(ATTR_WEAVE);

			return weave === UNDEFINED
				? false
				: match === UNDEFINED
					? true
					: new RegExp(getargs.call(match[3]).map(function (widget) {
							return "^" + widget;
						}).join("|"), "m").test(weave.replace(RE_SEPARATOR, "\n"));
			};

	/**
	 * jQuery `:woven` expression
	 * @property woven
	 */
	$EXPR[":"][WOVEN] = $CREATEPSEUDO
		// If we have jQuery >= 1.8 we want to use .createPseudo
		? $CREATEPSEUDO(function (widgets) {
			// If we don't have widgets to test, quick return optimized expression
			if (widgets === UNDEFINED) {
				return hasDataWovenAttr;
			}

			// Convert widgets to RegExp
			widgets = new RegExp(getargs.call(widgets).map(function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Return expression
			return function (element) {
				var attr_woven = $(element).attr(ATTR_WOVEN);

				// Check that attr_woven is not UNDEFINED, and that widgets test against a processed attr_woven
				return attr_woven !== UNDEFINED && widgets.test(attr_woven.replace(RE_SEPARATOR, "\n"));
			};
		})
		// Otherwise fall back to legacy
		: function (element, index, match) {
			var attr_woven = $(element).attr(ATTR_WOVEN);

			return attr_woven === UNDEFINED
				? false
				: match === UNDEFINED
					? true
					: new RegExp(getargs.call(match[3]).map(function (widget) {
						return "^" + widget;
					}).join("|"), "m").test(attr_woven.replace(RE_SEPARATOR, "\n"));
		};

	/**
	 * @method weave
	 * @inheritdoc dom.loom.weave#constructor
	 */
	$FN[WEAVE] = weave;

	/**
	 * @method unweave
	 * @inheritdoc dom.loom.unweave#constructor
	 */
	$FN[UNWEAVE] = unweave;

	/**
	 * @method woven
	 * @inheritdoc dom.loom.woven#constructor
	 */
	$FN[WOVEN] = woven;
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-requirejs/multiversion',[],function MultiVersionModule() {
	

	/**
	 * RequireJS multiversion plugin
	 * @class requirejs.multiversion
	 * @static
	 * @alias plugin.requirejs
	 */

	//TODO Add usage docs

	var UNDEFINED;
	var RE = /(.+?)#(.+)$/;
	var RE_EMPTY = /^empty:/;
	var CONTEXTS = require.s.contexts;

	return {
		"load" : function (name, parentRequire, onload) {
			var context;
			var matches;

			// if name matches RE
			// matches[0] : module name with context - "module/name#context"
			// matches[1] : module name - "module/name"
			// matches[2] : context name - "context"
			if ((matches = RE.exec(name)) !== null) {
				name = matches[1];
				context = matches[2];

				if (context in CONTEXTS) {
					parentRequire = CONTEXTS[context].require;
				}
			}

			if (RE_EMPTY.test(parentRequire.toUrl(name + ".js"))) {
				onload(UNDEFINED);
			}
			else {
				parentRequire([ name ], function (module) {
					onload(module);
				}, onload.error);
			}
		}
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-requirejs/shadow',[ "text" ], function (text) {
	

	/**
	 * RequireJS shadow plugin
	 * @class requirejs.shadow
	 * @static
	 * @alias plugin.requirejs
	 */

	//TODO Add usage docs

	var UNDEFINED;
	var EXPORTS = "exports";
	var EXTENSION = ".js";
	var PATTERN = /(.+?)#(.+)$/;
	var RE_EMPTY = /^empty:/;
	var REQUIRE_VERSION = require.version;
	var buildMap = {};

	function amdify (scriptText, hashVal) {
		var pattern = /([^=&]+)=([^&]+)/g;
		var m;
		var deps = [];
		var args = [];

		while (hashVal && (m = pattern.exec(hashVal))) {
			if (m[1] === EXPORTS) {
				scriptText += ";\nreturn " + m[2] + ";\n";
			}
			else {
				deps.push("'" + m[2] + "'");
				args.push(m[1]);
			}
		}

		return "define([" + deps.join(", ") + "], function (" + args.join(", ") + ") {\n"
			+ scriptText
			+ "});";
	}

	function cmpVersion(a, b) {
		var result;
		var len;
		var i;

		a = a.split(".");
		b = b.split(".");
		len = Math.min(a.length, b.length);

		for (i = 0; i < len; i++) {
			result = parseInt(a[i], null) - parseInt(b[i], null);
			if (result !== 0) {
				return result;
			}
		}
		return a.length - b.length;
	}

	return {
		load : function (name, req, onLoad, config) {
			var m;
			var hashVal;
			var content;
			var url;
			var realName = name;

			// The name is like 'jquery.form#$=jquery&exports=$',
			// So, if macthed, m[1] is 'jquery.form', m[2] is '$=jquery&exports=$'
			if ((m = PATTERN.exec(name))) {
				realName = m[1];
				hashVal = m[2];
			}
			url = req.toUrl(realName + EXTENSION);

			// For Optimization. The url is "empty:" if excluded.
			if (RE_EMPTY.test(url)) {
				onLoad(UNDEFINED);
			}
			else {
				text.get(url, function(data) {
					content = amdify(data, hashVal);
					if (config.isBuild) {
						buildMap[name] = content;
					}

					onLoad.fromText(name, content);
					// On requirejs version below '2.1.0', 
					// need to manually require the module after the call to onLoad.fromText()
					if (cmpVersion(REQUIRE_VERSION, "2.1.0") < 0) {
						req([ name ], onLoad);
					}	
				});
			}
		},

		write : function (pluginName, moduleName, write) { 
			var content;

			if (moduleName in buildMap) {
				content = buildMap[moduleName];
				content = content.replace(/define\(/, function (match) {
					return match + '"' + [pluginName, moduleName].join('!') + '",';
				});
				write(content);
			}
		}
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/select',[],function SelectModule() {
	

	/**
	 * @class util.select
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var FALSE = false;
	var PERIOD = ".";
	var LEFT_BRACKET = "[";
	var RIGHT_BRACKET = "]";
	var SINGLE_QUOTE = "'";
	var DOUBLE_QUOTE = "\"";

	/**
	 * Function that traverses a JSON object
	 * @method constructor
	 * @param {String} query simple JSON query
	 * @return {*} Value from traversed query
	 */
	return function select(query) {
		var node = this;
		var c;
		var m;
		var i;
		var length;
		var skip = FALSE;

		for (i = m = 0, length = query.length; i < length && node !== UNDEFINED; i++) {
			switch(c = query.charAt(i)) {
				case PERIOD:
					if (skip === FALSE && i > m) {
						node = node[query.substring(m, i)];
						m = i + 1;
					}
					break;

				case LEFT_BRACKET:
					if (skip === FALSE) {
						skip = LEFT_BRACKET;
						m = i + 1;
					}
					break;

				case RIGHT_BRACKET:
					if (skip === LEFT_BRACKET && i > m) {
						node = node[query.substring(m, i)];
						skip = FALSE;
						m = i + 2;
					}
					break;

				case DOUBLE_QUOTE:
				case SINGLE_QUOTE:
					if (skip === c && i > m) {
						node = node[query.substring(m, i)];
						skip = FALSE;
						m = i + 2;
					}
					else {
						skip = c;
						m = i + 1;
					}
					break;
			}
		}

		if (i > m) {
			node = node[query.substring(m, i)];
		}

		return node;
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-requirejs/json',[
	"text",
	"troopjs-util/select",
	"poly/json"
], function (text, select) {
	

	/**
	 * RequireJS json plugin
	 * @class requirejs.json
	 * @static
	 * @alias plugin.requirejs
	 */

	//TODO Add usage docs

	var NULL = null;
	var PATTERN = /(.+?)#(.+)$/;
	var buildMap = {};


	return {
		"load": function (name, req, load, config) {
			var key = name;
			var query = "";
			var matches;

			if ((matches = PATTERN.exec(name)) !== NULL) {
				name = matches[1];
				query = matches[2];
			}

			text.get(req.toUrl(name), function (source) {
				var compiled = select.call(JSON.parse(source), query);

				if (config.isBuild) {
					buildMap[key] = compiled;
				}

				load(compiled);
			}, load.error);
		},

		write : function (pluginName, moduleName, write) {
			if (moduleName in buildMap) {
				write("define('" + pluginName + "!" + moduleName + "', function(){ return " + JSON.stringify(buildMap[moduleName]) + "});");
			}
		}
	};
});

define('troopjs', ['troopjs/maxi'], function (main) { return main; });

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/timer',['require'],function(require) {
	/*global setTimeout,clearTimeout*/
	var cjsRequire, vertx, setTimer, clearTimer;

	cjsRequire = require;

	try {
		vertx = cjsRequire('vertx');
		setTimer = function (f, ms) { return vertx.setTimer(ms, f); };
		clearTimer = vertx.cancelTimer;
	} catch (e) {
		setTimer = function(f, ms) { return setTimeout(f, ms); };
		clearTimer = function(t) { return clearTimeout(t); };
	}

	return {
		set: setTimer,
		clear: clearTimer
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/monitor/error',[],function() {

	var parse, captureStack, format;

	if(Error.captureStackTrace) {
		// Use Error.captureStackTrace if available
		parse = function(e) {
			return e && e.stack && e.stack.split('\n');
		};

		format = formatAsString;
		captureStack = Error.captureStackTrace;

	} else {
		// Otherwise, do minimal feature detection to determine
		// how to capture and format reasonable stacks.
		parse = function(e) {
			var stack = e && e.stack && e.stack.split('\n');
			if(stack && e.message) {
				stack.unshift(e.message);
			}
			return stack;
		};

		(function() {
			var e = new Error();
			if(typeof e.stack !== 'string') {
				format = formatAsString;
				captureStack = captureSpiderMonkeyStack;
			} else {
				format = formatAsErrorWithStack;
				captureStack = useStackDirectly;
			}
		}());
	}

	function captureSpiderMonkeyStack(host) {
		try {
			throw new Error();
		} catch(err) {
			host.stack = err.stack;
		}
	}

	function useStackDirectly(host) {
		host.stack = new Error().stack;
	}

	function formatAsString(longTrace) {
		return join(longTrace);
	}

	function formatAsErrorWithStack(longTrace) {
		var e = new Error();
		e.stack = formatAsString(longTrace);
		return e;
	}

	// About 5-10x faster than String.prototype.join o_O
	function join(a) {
		var sep = false;
		var s = '';
		for(var i=0; i< a.length; ++i) {
			if(sep) {
				s += '\n' + a[i];
			} else {
				s+= a[i];
				sep = true;
			}
		}
		return s;
	}

	return {
		parse: parse,
		format: format,
		captureStack: captureStack
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/monitor/PromiseMonitor',['require','../lib/timer','./error'],function(require) {

	var defaultStackJumpSeparator = 'from execution context:';
	var defaultStackFilter = /(node|module|timers)\.js:|when([\/\\]{1,2}(lib|monitor|es6-shim)[\/\\]{1,2}|\.js)|(new\sPromise)\b|(\b(PromiseMonitor|ConsoleReporter|Scheduler|RunHandlerTask|ProgressTask|Promise|.*Handler)\.[\w_]\w\w+\b)|\b(tryCatch\w+|getHandler\w*)\b/i;

	var setTimer = require('../lib/timer').set;
	var error = require('./error');

	function PromiseMonitor(reporter) {
		this._traces = {};
		this.traceTask = 0;
		this.logDelay = 100;
		this.stackFilter = defaultStackFilter;
		this.stackJumpSeparator = defaultStackJumpSeparator;
		this.filterDuplicateFrames = true;

		this._reporter = reporter;

		if(typeof reporter.configurePromiseMonitor === 'function') {
			reporter.configurePromiseMonitor(this);
		}

		var self = this;
		this._doLogTraces = function() {
			self._logTraces();
		};
	}

	PromiseMonitor.prototype.captureStack = function(host, at) {
		return error.captureStack(host, at);
	};

	PromiseMonitor.prototype.addTrace = function(handler, extraContext) {
		this._traces[handler.id] = {
			error: handler.value,
			context: handler.context,
			extraContext: extraContext
		};
		this.logTraces();
	};

	PromiseMonitor.prototype.removeTrace = function(handler) {
		if(handler.id in this._traces) {
			delete this._traces[handler.id];
			this.logTraces();
		}
	};

	PromiseMonitor.prototype.fatal = function(handler) {
		var err = new Error();
		err.stack = this._createLongTrace(handler.value, handler.context).join('\n');
		setTimer(function() {
			throw err;
		}, 0);
	};

	PromiseMonitor.prototype.logTraces = function() {
		if(!this.traceTask) {
			this.traceTask = setTimer(this._doLogTraces, this.logDelay);
		}
	};

	PromiseMonitor.prototype._logTraces = function() {
		this.traceTask = void 0;
		this._reporter.log(this.formatTraces(this._traces));
	};


	PromiseMonitor.prototype.formatTraces = function(traces) {
		var keys = Object.keys(traces);
		var formatted = [];
		var longTrace, t, i;

		for(i=0; i<keys.length; ++i) {
			t = traces[keys[i]];
			longTrace = this._createLongTrace(t.error, t.context, t.extraContext);
			formatted.push(longTrace);
		}

		return formatted;
	};

	PromiseMonitor.prototype._createLongTrace = function(e, context, extraContext) {
		var trace = error.parse(e) || [];
		trace = filterFrames(this.stackFilter, trace, 0);
		this._appendContext(trace, context);
		this._appendContext(trace, extraContext);
		return this.filterDuplicateFrames ? this._removeDuplicates(trace) : trace;
	};

	PromiseMonitor.prototype._removeDuplicates = function(trace) {
		var seen = {};
		var sep = this.stackJumpSeparator;
		var count = 0;
		return trace.reduceRight(function(deduped, line, i) {
			if(i === 0) {
				deduped.unshift(line);
			} else if(line === sep) {
				if(count > 0) {
					deduped.unshift(line);
					count = 0;
				}
			} else if(!seen[line]) {
				seen[line] = true;
				deduped.unshift(line);
				++count;
			}
			return deduped;
		}, []);
	};

	PromiseMonitor.prototype._appendContext = function(trace, context) {
		trace.push.apply(trace, this._createTrace(context));
	};

	PromiseMonitor.prototype._createTrace = function(traceChain) {
		var trace = [];
		var stack;

		while(traceChain) {
			stack = error.parse(traceChain);

			if (stack) {
				stack = filterFrames(this.stackFilter, stack);
				appendStack(trace, stack, this.stackJumpSeparator);
			}

			traceChain = traceChain.parent;
		}

		return trace;
	};

	function appendStack(trace, stack, separator) {
		if (stack.length > 1) {
			stack[0] = separator;
			trace.push.apply(trace, stack);
		}
	}

	function filterFrames(stackFilter, stack) {
		return stack.filter(function(frame) {
			return !stackFilter.test(frame);
		});
	}

	return PromiseMonitor;
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/monitor/ConsoleReporter',['require','./error'],function(require) {

	var error = require('./error');
	var unhandledRejectionsMsg = '[promises] Unhandled rejections: ';
	var allHandledMsg = '[promises] All previously unhandled rejections have now been handled';

	function ConsoleReporter() {
		this._previouslyReported = false;
	}

	ConsoleReporter.prototype = initDefaultLogging();

	ConsoleReporter.prototype.log = function(traces) {
		if(traces.length === 0) {
			if(this._previouslyReported) {
				this._previouslyReported = false;
				this.warn(allHandledMsg);
			}
			return;
		}

		this._previouslyReported = true;
		this.groupStart(unhandledRejectionsMsg + traces.length);
		try {
			this._log(traces);
		} finally {
			this.groupEnd();
		}
	};

	ConsoleReporter.prototype._log = function(traces) {
		for(var i=0; i<traces.length; ++i) {
			this.warn(error.format(traces[i]));
		}
	};

	function initDefaultLogging() {
		var warn, groupStart, groupEnd;

		if(typeof console === 'undefined') {
			warn = consoleNotAvailable;
		} else {
			if(typeof console.error === 'function'
				&& typeof console.dir === 'function') {
				warn = function(s) {
					console.error(s);
				};

				if(typeof console.groupCollapsed === 'function') {
					groupStart = function(s) {
						console.groupCollapsed(s);
					};
					groupEnd = function() {
						console.groupEnd();
					};
				}
			} else {
				// IE8 has console.log and JSON, so we can make a
				// reasonably useful warn() from those.
				// Credit to webpro (https://github.com/webpro) for this idea
				if (typeof console.log ==='function'
					&& typeof JSON !== 'undefined') {
					warn = function (x) {
						console.log(typeof x === 'string' ? x : JSON.stringify(x));
					};
				}
			}
		}

		return {
			warn: warn,
			groupStart: groupStart || warn,
			groupEnd: groupEnd || consoleNotAvailable
		};
	}

	function consoleNotAvailable() {}

	return ConsoleReporter;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/monitor/console',['require','./PromiseMonitor','./ConsoleReporter'],function(require) {

	var PromiseMonitor = require('./PromiseMonitor');
	var ConsoleReporter = require('./ConsoleReporter');

	var promiseMonitor = new PromiseMonitor(new ConsoleReporter());

	if(typeof console !== 'undefined') {
		console.promiseMonitor = promiseMonitor;
	}

	return promiseMonitor;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

/** @license MIT License (c) copyright 2013 original authors */
/**
 * poly common functions
 *
 * @author Brian Cavalier
 * @author John Hann
 */
(function (define) {
define('poly/lib/_base',['require','exports','module'],function (require, exports) {

	var toString;

	toString = ({}).toString;

	exports.isFunction = function (o) {
		return typeof o == 'function';
	};

	exports.isString = function (o) {
		return toString.call(o) == '[object String]';
	};

	exports.isArray = function (o) {
		return toString.call(o) == '[object Array]';
	};

	exports.toString = function (o) {
		return toString.apply(o);
	};

	exports.createCaster = function (caster, name) {
		return function cast (o) {
			if (o == null) throw new TypeError(name + ' method called on null or undefined');
			return caster(o);
		}
	};

	exports.isElement = function(o){
		return typeof HTMLElement == 'undefined'
			? 'tagName' in o && 'nodeName' in o
			: o instanceof HTMLELEMENT;
	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { factory(require, exports); }
));

/** @license MIT License (c) copyright 2013 original authors */
/**
 * Object polyfill / shims
 *
 * @author Brian Cavalier
 * @author John Hann
 */
/**
 * The goal of these shims is to emulate a JavaScript 1.8.5+ environments as
 * much as possible.  While it's not feasible to fully shim Object,
 * we can try to maximize code compatibility with older js engines.
 *
 * Note: these shims cannot fix `for (var p in obj) {}`. Instead, use this:
 *     Object.keys(obj).forEach(function (p) {}); // shimmed Array
 *
 * Also, these shims can't prevent writing to object properties.
 *
 * If you want your code to fail loudly if a shim can't mimic ES5 closely
 * then set the AMD loader config option `failIfShimmed`.  Possible values
 * for `failIfShimmed` include:
 *
 * true: fail on every shimmed Object function
 * false: fail never
 * function: fail for shims whose name returns true from function (name) {}
 *
 * By default, no shims fail.
 *
 * The following functions are safely shimmed:
 * create (unless the second parameter is specified since that calls defineProperties)
 * keys
 * getOwnPropertyNames
 * getPrototypeOf
 * isExtensible
 *
 * In order to play nicely with several third-party libs (including Promises/A
 * implementations), the following functions don't fail by default even though
 * they can't be correctly shimmed:
 * freeze
 * seal
 * isFrozen
 * isSealed
 *
 * The poly/strict module will set failIfShimmed to fail for some shims.
 * See the documentation for more information.
 *
 * IE missing enum properties fixes copied from kangax:
 * https://github.com/kangax/protolicious/blob/master/experimental/object.for_in.js
 *
 * TODO: fix Object#propertyIsEnumerable for IE's non-enumerable props to match Object.keys()
 */
(function (define) {
define('poly/object',['require','./lib/_base'],function (require) {


	var base = require('./lib/_base');

	var refObj,
		refProto,
		has__proto__,
		hasNonEnumerableProps,
		getPrototypeOf,
		keys,
		featureMap,
		shims,
		secrets,
		protoSecretProp,
		hasOwnProp = 'hasOwnProperty',
		doc = typeof document != 'undefined' && document,
		testEl = doc && doc.createElement('p'),
		undef;

	refObj = Object;
	refProto = refObj.prototype;

	has__proto__ = typeof {}.__proto__ == 'object';

	hasNonEnumerableProps = (function () {
		for (var p in { valueOf: 1 }) return false;
		return true;
	}());

	// TODO: this still doesn't work for IE6-8 since object.constructor && object.constructor.prototype are clobbered/replaced when using `new` on a constructor that has a prototype. srsly.
	// devs will have to do the following if they want this to work in IE6-8:
	// Ctor.prototype.constructor = Ctor
	getPrototypeOf = has__proto__
		? function (object) { assertIsObject(object); return object.__proto__; }
		: function (object) {
			assertIsObject(object);
			// return null according to the investigation result at:
			// https://github.com/cujojs/poly/pull/21
			if (object == refProto) {
				return null;
			}
			return protoSecretProp && object[protoSecretProp](secrets)
				? object[protoSecretProp](secrets.proto)
				: object.constructor ? object.constructor.prototype : refProto;
		};

	keys = !hasNonEnumerableProps
		? _keys
		: (function (masked) {
			return function (object) {
				var result = _keys(object), i = 0, m;
				while (m = masked[i++]) {
					if (hasProp(object, m)) result.push(m);
				}
				return result;
			}
		}([ 'constructor', hasOwnProp, 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf' ]));

	featureMap = {
		'object-create': 'create',
		'object-freeze': 'freeze',
		'object-isfrozen': 'isFrozen',
		'object-seal': 'seal',
		'object-issealed': 'isSealed',
		'object-getprototypeof': 'getPrototypeOf',
		'object-keys': 'keys',
		'object-getownpropertynames': 'getOwnPropertyNames',
		'object-isextensible': 'isExtensible',
		'object-preventextensions': 'preventExtensions',
		'object-defineproperty-obj': function () {
			return hasDefineProperty({});
		},
		'object-defineproperty-dom': function () {
			return doc && hasDefineProperty(testEl);
		},
		'object-defineproperties-obj': function () {
			return hasDefineProperties({});
		},
		'object-defineproperties-dom': function () {
			return doc && hasDefineProperties(testEl);
		},
		'object-getownpropertydescriptor-obj': function () {
			return hasGetOwnPropertyDescriptor({});
		},
		'object-getownpropertydescriptor-dom': function () {
			return doc && hasGetOwnPropertyDescriptor(testEl);
		}
	};

	shims = {};

	secrets = {
		proto: {}
	};

	protoSecretProp = !has('object-getprototypeof') && !has__proto__ && hasNonEnumerableProps && hasOwnProp;

	// we might create an owned property to hold the secrets, but make it look
	// like it's not an owned property.  (affects getOwnPropertyNames, too)
	if (protoSecretProp) (function (_hop) {
		refProto[hasOwnProp] = function (name) {
			if (name == protoSecretProp) return false;
			return _hop.call(this, name);
		};
	}(refProto[hasOwnProp]));

	if (!has('object-create')) {
		Object.create = shims.create = create;
	}

	if (!has('object-freeze')) {
		Object.freeze = shims.freeze = noop;
	}

	if (!has('object-isfrozen')) {
		Object.isFrozen = shims.isFrozen = nope;
	}

	if (!has('object-seal')) {
		Object.seal = shims.seal = noop;
	}

	if (!has('object-issealed')) {
		Object.isSealed = shims.isSealed = nope;
	}

	if (!has('object-getprototypeof')) {
		Object.getPrototypeOf = shims.getPrototypeOf = getPrototypeOf;
	}

	if (!has('object-keys')) {
		Object.keys = keys;
	}

	if (!has('object-getownpropertynames')) {
		Object.getOwnPropertyNames = shims.getOwnPropertyNames
			= getOwnPropertyNames;
	}

	if (!has('object-defineproperties-obj')) {
		// check if dom has it (IE8)
		Object.defineProperties = shims.defineProperties
			= has('object-defineproperties-dom')
				? useNativeForDom(Object.defineProperties, defineProperties)
				: defineProperties;
	}

	if (!has('object-defineproperty-obj')) {
		// check if dom has it (IE8)
		Object.defineProperty = shims.defineProperty
			= has('object-defineproperty-dom')
				? useNativeForDom(Object.defineProperty, defineProperty)
				: defineProperty;
	}

	if (!has('object-isextensible')) {
		Object.isExtensible = shims.isExtensible = isExtensible;
	}

	if (!has('object-preventextensions')) {
		Object.preventExtensions = shims.preventExtensions = preventExtensions;
	}

	if (!has('object-getownpropertydescriptor-obj')) {
		// check if dom has it (IE8)
		Object.getOwnPropertyDescriptor = shims.getOwnPropertyDescriptor
			= has('object-getownpropertydescriptor-dom')
				? useNativeForDom(Object.getOwnPropertyDescriptor, getOwnPropertyDescriptor)
				: getOwnPropertyDescriptor;
	}

	function hasDefineProperty (object) {
		if (('defineProperty' in Object)) {
			try {
				// test it
				Object.defineProperty(object, 'sentinel1', { value: 1 })
				return 'sentinel1' in object;
			}
			catch (ex) { /* squelch */ }
		}
	}

	// Note: MSDN docs say that IE8 has this function, but tests show
	// that it does not! JMH
	function hasDefineProperties (object) {
		if (('defineProperties' in Object)) {
			try {
				// test it
				Object.defineProperties(object, { 'sentinel2': { value: 1 } })
				return 'sentinel2' in object;
			}
			catch (ex) { /* squelch */ }
		}
	}

	function hasGetOwnPropertyDescriptor (object) {
		if (('getOwnPropertyDescriptor' in Object)) {
			object['sentinel3'] = true;
			try {
				return (Object.getOwnPropertyDescriptor(object, 'sentinel3').value);
			}
			catch (ex) { /* squelch */ }
		}
	}

	function PolyBase () {}

	// for better compression
	function hasProp (object, name) {
		return object.hasOwnProperty(name);
	}

	function _keys (object) {
		var result = [];
		for (var p in object) {
			if (hasProp(object, p)) {
				result.push(p);
			}
		}
		return result;
	}

	function create (proto, props) {
		var obj;

		if (typeof proto != 'object') throw new TypeError('prototype is not of type Object or Null.');

		PolyBase.prototype = proto;
		obj = new PolyBase();
		PolyBase.prototype = null;

		// provide a mechanism for retrieving the prototype in IE 6-8
		if (protoSecretProp) {
			var orig = obj[protoSecretProp];
			obj[protoSecretProp] = function (name) {
				if (name == secrets) return true; // yes, we're using secrets
				if (name == secrets.proto) return proto;
				return orig.call(this, name);
			};
		}

		if (arguments.length > 1) {
			// defineProperties could throw depending on `failIfShimmed`
			Object.defineProperties(obj, props);
		}

		return obj;
	}

	function defineProperties (object, descriptors) {
		var names, name;
		names = keys(descriptors);
		while ((name = names.pop())) {
			Object.defineProperty(object, name, descriptors[name]);
		}
		return object;
	}

	function defineProperty (object, name, descriptor) {
		object[name] = descriptor && descriptor.value;
		return object;
	}

	function getOwnPropertyDescriptor (object, name) {
		return hasProp(object, name)
			? {
				value: object[name],
				enumerable: true,
				configurable: true,
				writable: true
			}
			: undef;
	}

	function getOwnPropertyNames (object) {
		return keys(object);
	}

	function isExtensible (object) {
		var prop = '_poly_';
		try {
			// create unique property name
			while (prop in object) prop += '_';
			// try to set it
			object[prop] = 1;
			return hasProp(object, prop);
		}
		catch (ex) { return false; }
		finally {
			try { delete object[prop]; } catch (ex) { /* squelch */ }
		}
	}

	function preventExtensions (object) {
		return object;
	}

	function useNativeForDom (orig, shim) {
		return function (obj) {
			if (base.isElement(obj)) return orig.apply(this, arguments);
			else return shim.apply(this, arguments);
		};
	}

	function failIfShimmed (failTest) {
		var shouldThrow;

		if (typeof failTest == 'function') {
			shouldThrow = failTest;
		}
		else {
			// assume truthy/falsey
			shouldThrow = function () { return failTest; };
		}

		// create throwers for some features
		for (var feature in shims) {
			Object[feature] = shouldThrow(feature)
				? createFlameThrower(feature)
				: shims[feature];
		}
	}

	function assertIsObject (o) {
		if (typeof o != 'object') {
			throw new TypeError('Object.getPrototypeOf called on non-object');
		}
	}

	function createFlameThrower (feature) {
		return function () {
			throw new Error('poly/object: ' + feature + ' is not safely supported.');
		}
	}

	function has (feature) {
		var ret;
		var prop = featureMap[feature];

		if (base.isFunction(prop)) {
			// cache return value, ensure boolean
			ret = featureMap[feature] = !!prop(refObj);
		}
		else if (base.isString(prop)) {
			ret = featureMap[feature] = prop in refObj;
		}
		else {
			// return cached evaluate result
			ret = prop;
		}

		return ret;
	}

	function noop (it) { return it; }

	function nope (it) { return false; }

	return {
		failIfShimmed: failIfShimmed
	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

/** @license MIT License (c) copyright 2013 original authors */
/**
 * poly common array functions
 *
 * @author Jared Cacurak
 * @author Brian Cavalier
 * @author John Hann
 */
(function (define) {
define('poly/lib/_array',['require','./_base'],function (require) {

	var base = require('./_base');

	var toObject = base.createCaster(Object, 'Array'),
		isFunction = base.isFunction,
		undef;

	return {
		returnValue: returnValue,
		iterate: iterate,
		toArrayLike: toArrayLike
	};

	function toArrayLike (o) {
		return (base.toString(o) == '[object String]')
			? o.split('')
			: toObject(o);
	}

	function returnValue (val) {
		return val;
	}

	function iterate (arr, lambda, continueFunc, context, start, inc) {

		var alo, len, i, end;

		alo = toArrayLike(arr);
		len = alo.length >>> 0;

		if (start === undef) start = 0;
		if (!inc) inc = 1;
		end = inc < 0 ? -1 : len;

		if (!isFunction(lambda)) {
			throw new TypeError(lambda + ' is not a function');
		}
		if (start == end) {
			return false;
		}
		if ((start <= end) ^ (inc > 0)) {
			throw new TypeError('Invalid length or starting index');
		}

		for (i = start; i != end; i = i + inc) {
			if (i in alo) {
				if (!continueFunc(lambda.call(context, alo[i], i, alo), i, alo[i])) {
					return false;
				}
			}
		}

		return true;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

/** @license MIT License (c) copyright 2013 original authors */
/**
 * Array -- a stand-alone module for using Javascript 1.6 array features
 * in lame-o browsers that don't support Javascript 1.6
 *
 * @author Jared Cacurak
 * @author Brian Cavalier
 * @author John Hann
 */
/*
	define(['poly!poly/array'], function () {
		var items = [1, 2, 3];
		items.forEach(function (item) {
			console.log(item);
		};
	});

	All of the wrapper API methods are shimmed and are reasonably close to
	the ES5 specification, but may vary slightly in unforeseen edge cases:

	var array = [1, 2, 3];

	array.forEach(lambda [, context]);
	array.every(lambda [, context]);
	array.some(lambda [, context]);
	array.filter(lambda [, context]);
	array.map(lambda [, context]);
	array.indexOf(item [, fromIndex]);
	array.lastIndexOf(item [, fromIndex]);
	array.reduce(reduceFunc [, initialValue]);
	array.reduceRight(reduceFunc [, initialValue]);
	Array.isArray(object)

 */
(function (define) {
define('poly/array',['require','./lib/_base','./lib/_array'],function (require) {


	var base = require('./lib/_base');
	var array = require('./lib/_array');

	var proto = Array.prototype,
		featureMap,
		_reduce,
		_find;

	featureMap = {
		'array-foreach': 'forEach',
		'array-every': 'every',
		'array-some': 'some',
		'array-map': 'map',
		'array-filter': 'filter',
		'array-reduce': 'reduce',
		'array-reduceright': 'reduceRight',
		'array-indexof': 'indexOf',
		'array-lastindexof': 'lastIndexOf'
	};

	function has (feature) {
		var prop = featureMap[feature];
		return base.isFunction(proto[prop]);
	}

	function returnTruthy () {
		return 1;
	}

	/***** iterators *****/

	if (!has('array-foreach')) {
		proto.forEach = function forEach (lambda) {
			// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
			array.iterate(this, lambda, returnTruthy, arguments[+1]);
		};
	}

	if (!has('array-every')) {
		proto.every = function every (lambda) {
			// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
			return array.iterate(this, lambda, array.returnValue, arguments[+1]);
		};
	}

	if (!has('array-some')) {
		proto.some = function some (lambda) {
			// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
			return array.iterate(this, lambda, function (val) { return !val; }, arguments[+1]);
		};
	}

	/***** mutators *****/

	if(!has('array-map')) {
		proto.map = function map (lambda) {
			var arr, result;

			arr = this;
			result = new Array(arr.length);

			// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
			array.iterate(arr, lambda, function (val, i) { result[i] = val; return 1; }, arguments[+1]);

			return result;
		};
	}

	if (!has('array-filter')) {
		proto.filter = function filter (lambda) {
			var arr, result;

			arr = this;
			result = [];

			array.iterate(arr, lambda, function (val, i, orig) {
				// use a copy of the original value in case
				// the lambda function changed it
				if (val) {
					result.push(orig);
				}
				return 1;
			}, arguments[1]);

			return result;
		};
	}

	/***** reducers *****/

	if (!has('array-reduce') || !has('array-reduceright')) {

		_reduce = function _reduce (reduceFunc, inc, initialValue, hasInitialValue) {
			var reduced, startPos, initialValuePos;

			startPos = initialValuePos = inc > 0 ? -1 : array.toArrayLike(this).length >>> 0;

			// If no initialValue, use first item of array (we know length !== 0 here)
			// and adjust i to start at second item
			if (!hasInitialValue) {
				array.iterate(this, array.returnValue, function (val, i) {
					reduced = val;
					initialValuePos = i;
				}, null, startPos + inc, inc);
				if (initialValuePos == startPos) {
					// no intial value and no items in array!
					throw new TypeError();
				}
			}
			else {
				// If initialValue provided, use it
				reduced = initialValue;
			}

			// Do the actual reduce
			array.iterate(this, function (item, i, arr) {
				reduced = reduceFunc(reduced, item, i, arr);
			}, returnTruthy, null, initialValuePos + inc, inc);

			// we have a reduced value!
			return reduced;
		};

		if (!has('array-reduce')) {
			proto.reduce = function reduce (reduceFunc /*, initialValue */) {
				return _reduce.call(this, reduceFunc, 1, arguments[+1], arguments.length > 1);
			};
		}

		if (!has('array-reduceright')) {
			proto.reduceRight = function reduceRight (reduceFunc /*, initialValue */) {
				return _reduce.call(this, reduceFunc, -1, arguments[+1], arguments.length > 1);
			};
		}
	}

	/***** finders *****/

	if (!has('array-indexof') || !has('array-lastindexof')) {

		_find = function _find (arr, item, from, forward) {
			var len = array.toArrayLike(arr).length >>> 0, foundAt = -1;

			// convert to number, or default to start or end positions
			from = isNaN(from) ? (forward ? 0 : len - 1) : Number(from);
			// negative means it's an offset from the end position
			if (from < 0) {
				from = len + from - 1;
			}

			array.iterate(arr, array.returnValue, function (val, i) {
				if (val === item) {
					foundAt = i;
				}
				return foundAt == -1;
			}, null, from, forward ? 1 : -1);

			return foundAt;
		};

		if (!has('array-indexof')) {
			proto.indexOf = function indexOf (item) {
				// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
				return _find(this, item, arguments[+1], true);
			};
		}

		if (!has('array-lastindexof')) {
			proto.lastIndexOf = function lastIndexOf (item) {
				// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
				return _find(this, item, arguments[+1], false);
			};
		}
	}

	if (!Array.isArray) {
		Array.isArray = base.isArray;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

/** @license MIT License (c) copyright 2013 original authors */
/**
 * Function polyfill / shims
 *
 * @author Brian Cavalier
 * @author John Hann
 */
(function (define) {
define('poly/function',['require','./lib/_base'],function (require) {


	var base = require('./lib/_base');

	var bind,
		slice = [].slice,
		proto = Function.prototype,
		featureMap;

	featureMap = {
		'function-bind': 'bind'
	};

	function has (feature) {
		var prop = featureMap[feature];
		return base.isFunction(proto[prop]);
	}

	// check for missing features
	if (!has('function-bind')) {
		// adapted from Mozilla Developer Network example at
		// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
		bind = function bind (obj) {
			var args = slice.call(arguments, 1),
				self = this,
				nop = function () {},
				bound = function () {
				  return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
				};
			nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
			bound.prototype = new nop();
			return bound;
		};
		proto.bind = bind;
	}

	return {};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/decorators/timed',['require','../timer'],function(require) {

	var timer = require('../timer');

	return function timed(Promise) {
		/**
		 * Return a new promise whose fulfillment value is revealed only
		 * after ms milliseconds
		 * @param {number} ms milliseconds
		 * @returns {Promise}
		 */
		Promise.prototype.delay = function(ms) {
			var p = this._beget();

			this._handler.chain(p._handler,
				function delay(x) {
					var h = this; // this = p._handler
					timer.set(function() { h.resolve(x); }, ms);
				},
				p._handler.reject, p._handler.notify);

			return p;
		};

		/**
		 * Return a new promise that rejects after ms milliseconds unless
		 * this promise fulfills earlier, in which case the returned promise
		 * fulfills with the same value.
		 * @param {number} ms milliseconds
		 * @param {Error|*=} reason optional rejection reason to use, defaults
		 *   to an Error if not provided
		 * @returns {Promise}
		 */
		Promise.prototype.timeout = function(ms, reason) {
			var hasReason = arguments.length > 1;
			var p = this._beget();

			var t = timer.set(onTimeout, ms);

			this._handler.chain(p._handler,
				function onFulfill(x) {
					timer.clear(t);
					this.resolve(x); // this = p._handler
				},
				function onReject(x) {
					timer.clear(t);
					this.reject(x); // this = p._handler
				},
				p._handler.notify);

			return p;

			function onTimeout() {
				p._handler.reject(hasReason
					? reason : new Error('timed out after ' + ms + 'ms'));
			}
		};

		return Promise;

	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/decorators/array',[],function() {

	return function array(Promise) {

		var arrayMap = Array.prototype.map;
		var arrayReduce = Array.prototype.reduce;
		var arrayReduceRight = Array.prototype.reduceRight;
		var arrayForEach = Array.prototype.forEach;

		var toPromise = Promise.resolve;
		var all = Promise.all;

		// Additional array combinators

		Promise.any = any;
		Promise.some = some;
		Promise.settle = settle;

		Promise.map = map;
		Promise.reduce = reduce;
		Promise.reduceRight = reduceRight;

		/**
		 * When this promise fulfills with an array, do
		 * onFulfilled.apply(void 0, array)
		 * @param (function) onFulfilled function to apply
		 * @returns {Promise} promise for the result of applying onFulfilled
		 */
		Promise.prototype.spread = function(onFulfilled) {
			return this.then(all).then(function(array) {
				return onFulfilled.apply(void 0, array);
			});
		};

		return Promise;

		/**
		 * One-winner competitive race.
		 * Return a promise that will fulfill when one of the promises
		 * in the input array fulfills, or will reject when all promises
		 * have rejected.
		 * @param {array} promises
		 * @returns {Promise} promise for the first fulfilled value
		 */
		function any(promises) {
			return new Promise(function(resolve, reject) {
				var pending = 0;
				var errors = [];

				arrayForEach.call(promises, function(p) {
					++pending;
					toPromise(p).then(resolve, handleReject);
				});

				if(pending === 0) {
					resolve();
				}

				function handleReject(e) {
					errors.push(e);
					if(--pending === 0) {
						reject(errors);
					}
				}
			});
		}

		/**
		 * N-winner competitive race
		 * Return a promise that will fulfill when n input promises have
		 * fulfilled, or will reject when it becomes impossible for n
		 * input promises to fulfill (ie when promises.length - n + 1
		 * have rejected)
		 * @param {array} promises
		 * @param {number} n
		 * @returns {Promise} promise for the earliest n fulfillment values
		 */
		function some(promises, n) {
			return new Promise(function(resolve, reject, notify) {
				var nFulfill = 0;
				var nReject;
				var results = [];
				var errors = [];

				arrayForEach.call(promises, function(p) {
					++nFulfill;
					toPromise(p).then(handleResolve, handleReject, notify);
				});

				n = Math.max(n, 0);
				nReject = (nFulfill - n + 1);
				nFulfill = Math.min(n, nFulfill);

				if(nFulfill === 0) {
					resolve(results);
					return;
				}

				function handleResolve(x) {
					if(nFulfill > 0) {
						--nFulfill;
						results.push(x);

						if(nFulfill === 0) {
							resolve(results);
						}
					}
				}

				function handleReject(e) {
					if(nReject > 0) {
						--nReject;
						errors.push(e);

						if(nReject === 0) {
							reject(errors);
						}
					}
				}
			});
		}

		/**
		 * Apply f to the value of each promise in a list of promises
		 * and return a new list containing the results.
		 * @param {array} promises
		 * @param {function} f
		 * @param {function} fallback
		 * @returns {Promise}
		 */
		function map(promises, f, fallback) {
			return all(arrayMap.call(promises, function(x) {
				return toPromise(x).then(f, fallback);
			}));
		}

		/**
		 * Return a promise that will always fulfill with an array containing
		 * the outcome states of all input promises.  The returned promise
		 * will never reject.
		 * @param {array} promises
		 * @returns {Promise}
		 */
		function settle(promises) {
			return all(arrayMap.call(promises, function(p) {
				p = toPromise(p);
				return p.then(inspect, inspect);

				function inspect() {
					return p.inspect();
				}
			}));
		}

		function reduce(promises, f) {
			return arguments.length > 2
				? arrayReduce.call(promises, reducer, arguments[2])
				: arrayReduce.call(promises, reducer);

			function reducer(result, x, i) {
				return toPromise(result).then(function(r) {
					return toPromise(x).then(function(x) {
						return f(r, x, i);
					});
				});
			}
		}

		function reduceRight(promises, f) {
			return arguments.length > 2
				? arrayReduceRight.call(promises, reducer, arguments[2])
				: arrayReduceRight.call(promises, reducer);

			function reducer(result, x, i) {
				return toPromise(result).then(function(r) {
					return toPromise(x).then(function(x) {
						return f(r, x, i);
					});
				});
			}
		}
	};


});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/decorators/flow',['require','../timer'],function(require) {

	var setTimer = require('../timer').set;

	return function flow(Promise) {

		var resolve = Promise.resolve;
		var reject = Promise.reject;
		var origCatch = Promise.prototype['catch'];

		/**
		 * Handle the ultimate fulfillment value or rejection reason, and assume
		 * responsibility for all errors.  If an error propagates out of result
		 * or handleFatalError, it will be rethrown to the host, resulting in a
		 * loud stack track on most platforms and a crash on some.
		 * @param {function?} onResult
		 * @param {function?} onError
		 * @returns {undefined}
		 */
		Promise.prototype.done = function(onResult, onError) {
			var h = this._handler;
			h.when(this._maybeFatal, noop, this, h.receiver, onResult, onError);
		};

		/**
		 * Check if x is a rejected promise, and if so, delegate to this._fatal
		 * @private
		 * @param {*} x
		 */
		Promise.prototype._maybeFatal = function(x) {
			if((typeof x === 'object' || typeof x === 'function') && x !== null) {
				// Delegate to promise._fatal in case it has been overridden
				resolve(x)._handler.chain(this, void 0, this._fatal);
			}
		};

		/**
		 * Propagate fatal errors to the host environment.
		 * @private
		 */
		Promise.prototype._fatal = function(e) {
			if(this._handler._isMonitored()) {
				this._handler.join()._fatal(e);
			} else {
				setTimer(function() { throw e; }, 0);
			}
		};

		/**
		 * Add Error-type and predicate matching to catch.  Examples:
		 * promise.catch(TypeError, handleTypeError)
		 *   .catch(predicate, handleMatchedErrors)
		 *   .catch(handleRemainingErrors)
		 * @param onRejected
		 * @returns {*}
		 */
		Promise.prototype['catch'] = Promise.prototype.otherwise = function(onRejected) {
			if (arguments.length === 1) {
				return origCatch.call(this, onRejected);
			} else {
				if(typeof onRejected !== 'function') {
					return this.ensure(rejectInvalidPredicate);
				}

				return origCatch.call(this, createCatchFilter(arguments[1], onRejected));
			}
		};

		/**
		 * Wraps the provided catch handler, so that it will only be called
		 * if the predicate evaluates truthy
		 * @param {?function} handler
		 * @param {function} predicate
		 * @returns {function} conditional catch handler
		 */
		function createCatchFilter(handler, predicate) {
			return function(e) {
				return evaluatePredicate(e, predicate)
					? handler.call(this, e)
					: reject(e);
			};
		}

		/**
		 * Ensures that onFulfilledOrRejected will be called regardless of whether
		 * this promise is fulfilled or rejected.  onFulfilledOrRejected WILL NOT
		 * receive the promises' value or reason.  Any returned value will be disregarded.
		 * onFulfilledOrRejected may throw or return a rejected promise to signal
		 * an additional error.
		 * @param {function} handler handler to be called regardless of
		 *  fulfillment or rejection
		 * @returns {Promise}
		 */
		Promise.prototype['finally'] = Promise.prototype.ensure = function(handler) {
			if(typeof handler !== 'function') {
				// Optimization: result will not change, return same promise
				return this;
			}

			handler = isolate(handler, this);
			return this.then(handler, handler);
		};

		/**
		 * Recover from a failure by returning a defaultValue.  If defaultValue
		 * is a promise, it's fulfillment value will be used.  If defaultValue is
		 * a promise that rejects, the returned promise will reject with the
		 * same reason.
		 * @param {*} defaultValue
		 * @returns {Promise} new promise
		 */
		Promise.prototype['else'] = Promise.prototype.orElse = function(defaultValue) {
			return this.then(void 0, function() {
				return defaultValue;
			});
		};

		/**
		 * Shortcut for .then(function() { return value; })
		 * @param  {*} value
		 * @return {Promise} a promise that:
		 *  - is fulfilled if value is not a promise, or
		 *  - if value is a promise, will fulfill with its value, or reject
		 *    with its reason.
		 */
		Promise.prototype['yield'] = function(value) {
			return this.then(function() {
				return value;
			});
		};

		/**
		 * Runs a side effect when this promise fulfills, without changing the
		 * fulfillment value.
		 * @param {function} onFulfilledSideEffect
		 * @returns {Promise}
		 */
		Promise.prototype.tap = function(onFulfilledSideEffect) {
			return this.then(onFulfilledSideEffect)['yield'](this);
		};

		return Promise;
	};

	function rejectInvalidPredicate() {
		throw new TypeError('catch predicate must be a function');
	}

	function evaluatePredicate(e, predicate) {
		return isError(predicate) ? e instanceof predicate : predicate(e);
	}

	function isError(predicate) {
		return predicate === Error
			|| (predicate != null && predicate.prototype instanceof Error);
	}

	// prevent argument passing to f and ignore return value
	function isolate(f, x) {
		return function() {
			f.call(this);
			return x;
		};
	}

	function noop() {}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/decorators/inspect',[],function() {

	return function inspect(Promise) {

		Promise.prototype.inspect = function() {
			return this._handler.inspect();
		};

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/decorators/iterate',[],function() {

	return function generate(Promise) {

		var resolve = Promise.resolve;

		Promise.iterate = iterate;
		Promise.unfold = unfold;

		return Promise;

		/**
		 * Generate a (potentially infinite) stream of promised values:
		 * x, f(x), f(f(x)), etc. until condition(x) returns true
		 * @param {function} f function to generate a new x from the previous x
		 * @param {function} condition function that, given the current x, returns
		 *  truthy when the iterate should stop
		 * @param {function} handler function to handle the value produced by f
		 * @param {*|Promise} x starting value, may be a promise
		 * @return {Promise} the result of the last call to f before
		 *  condition returns true
		 */
		function iterate(f, condition, handler, x) {
			return resolve(x).then(function(x) {
				return resolve(condition(x)).then(function(done) {
					return done ? x : next(x);
				});
			});

			function next(nextValue) {
				return resolve(handler(nextValue)).then(function() {
					return iterate(f, condition, handler, f(nextValue));
				});
			}
		}

		/**
		 * Generate a (potentially infinite) stream of promised values
		 * by applying handler(generator(seed)) iteratively until
		 * condition(seed) returns true.
		 * @param {function} unspool function that generates a [value, newSeed]
		 *  given a seed.
		 * @param {function} condition function that, given the current seed, returns
		 *  truthy when the unfold should stop
		 * @param {function} handler function to handle the value produced by unspool
		 * @param x {*|Promise} starting value, may be a promise
		 * @return {Promise} the result of the last value produced by unspool before
		 *  condition returns true
		 */
		function unfold(unspool, condition, handler, x) {
			return resolve(x).then(function(seed) {
				return resolve(condition(seed)).then(function(done) {
					return done ? seed : resolve(unspool(seed)).spread(next);
				});
			});

			function next(item, newSeed) {
				return resolve(handler(item)).then(function() {
					return unfold(unspool, condition, handler, newSeed);
				});
			}
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/decorators/progress',[],function() {

	return function progress(Promise) {

		/**
		 * Register a progress handler for this promise
		 * @param {function} onProgress
		 * @returns {Promise}
		 */
		Promise.prototype.progress = function(onProgress) {
			return this.then(void 0, void 0, onProgress);
		};

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/decorators/with',[],function() {

	return function addWith(Promise) {
		/**
		 * Returns a promise whose handlers will be called with `this` set to
		 * the supplied `thisArg`.  Subsequent promises derived from the
		 * returned promise will also have their handlers called with `thisArg`.
		 * Calling `with` with undefined or no arguments will return a promise
		 * whose handlers will again be called in the usual Promises/A+ way (no `this`)
		 * thus safely undoing any previous `with` in the promise chain.
		 *
		 * WARNING: Promises returned from `with`/`withThis` are NOT Promises/A+
		 * compliant, specifically violating 2.2.5 (http://promisesaplus.com/#point-41)
		 *
		 * @param {object} thisArg `this` value for all handlers attached to
		 *  the returned promise.
		 * @returns {Promise}
		 */
		Promise.prototype['with'] = Promise.prototype.withThis
			= Promise.prototype._bindContext;

		return Promise;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));


/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/makePromise',[],function() {

	return function makePromise(environment) {

		var tasks = environment.scheduler;

		var objectCreate = Object.create ||
			function(proto) {
				function Child() {}
				Child.prototype = proto;
				return new Child();
			};

		/**
		 * Create a promise whose fate is determined by resolver
		 * @constructor
		 * @returns {Promise} promise
		 * @name Promise
		 */
		function Promise(resolver) {
			this._handler = arguments.length === 0
				? foreverPendingHandler : init(resolver);
		}

		/**
		 * Run the supplied resolver
		 * @param resolver
		 * @returns {makePromise.DeferredHandler}
		 */
		function init(resolver) {
			var handler = new DeferredHandler();

			try {
				resolver(promiseResolve, promiseReject, promiseNotify);
			} catch (e) {
				promiseReject(e);
			}

			return handler;

			/**
			 * Transition from pre-resolution state to post-resolution state, notifying
			 * all listeners of the ultimate fulfillment or rejection
			 * @param {*} x resolution value
			 */
			function promiseResolve (x) {
				handler.resolve(x);
			}
			/**
			 * Reject this promise with reason, which will be used verbatim
			 * @param {Error|*} reason rejection reason, strongly suggested
			 *   to be an Error type
			 */
			function promiseReject (reason) {
				handler.reject(reason);
			}

			/**
			 * Issue a progress event, notifying all progress listeners
			 * @param {*} x progress event payload to pass to all listeners
			 */
			function promiseNotify (x) {
				handler.notify(x);
			}
		}

		// Creation

		Promise.resolve = resolve;
		Promise.reject = reject;
		Promise.never = never;

		Promise._defer = defer;

		/**
		 * Returns a trusted promise. If x is already a trusted promise, it is
		 * returned, otherwise returns a new trusted Promise which follows x.
		 * @param  {*} x
		 * @return {Promise} promise
		 */
		function resolve(x) {
			return x instanceof Promise ? x
				: promiseFromHandler(new AsyncHandler(getHandlerUnchecked(x)));
		}

		/**
		 * Return a reject promise with x as its reason (x is used verbatim)
		 * @param {*} x
		 * @returns {Promise} rejected promise
		 */
		function reject(x) {
			return promiseFromHandler(new AsyncHandler(new RejectedHandler(x)));
		}

		/**
		 * Return a promise that remains pending forever
		 * @returns {Promise} forever-pending promise.
		 */
		function never() {
			return foreverPendingPromise; // Should be frozen
		}

		/**
		 * Creates an internal {promise, resolver} pair
		 * @private
		 * @returns {{_handler: DeferredHandler, promise: Promise}}
		 */
		function defer() {
			return promiseFromHandler(new DeferredHandler());
		}

		/**
		 * Create a new promise with the supplied handler
		 * @private
		 * @param {object} handler
		 * @returns {Promise}
		 */
		function promiseFromHandler(handler) {
			return configurePromise(handler, new Promise());
		}

		function configurePromise(handler, p) {
			p._handler = handler;
			return p;
		}

		// Transformation and flow control

		/**
		 * Transform this promise's fulfillment value, returning a new Promise
		 * for the transformed result.  If the promise cannot be fulfilled, onRejected
		 * is called with the reason.  onProgress *may* be called with updates toward
		 * this promise's fulfillment.
		 * @param [onFulfilled] {Function} fulfillment handler
		 * @param [onRejected] {Function} rejection handler
		 * @param [onProgress] {Function} progress handler
		 * @return {Promise} new promise
		 */
		Promise.prototype.then = function(onFulfilled, onRejected, onProgress) {
			var p = this._beget();
			var parent = this._handler;
			var child = p._handler;

			parent.when(child.resolve, child.notify, child,
				parent.receiver, onFulfilled, onRejected, onProgress);

			return p;
		};

		/**
		 * If this promise cannot be fulfilled due to an error, call onRejected to
		 * handle the error. Shortcut for .then(undefined, onRejected)
		 * @param {function?} onRejected
		 * @return {Promise}
		 */
		Promise.prototype['catch'] = function(onRejected) {
			return this.then(void 0, onRejected);
		};

		/**
		 * Private function to bind a thisArg for this promise's handlers
		 * @private
		 * @param {object} thisArg `this` value for all handlers attached to
		 *  the returned promise.
		 * @returns {Promise}
		 */
		Promise.prototype._bindContext = function(thisArg) {
			return promiseFromHandler(new BoundHandler(this._handler, thisArg));
		};

		/**
		 * Creates a new, pending promise of the same type as this promise
		 * @private
		 * @returns {Promise}
		 */
		Promise.prototype._beget = function() {
			var p = new this.constructor();
			var parent = this._handler;
			var child = new DeferredHandler(parent.receiver, parent.join().context);
			return configurePromise(child, p);
		};

		// Array combinators

		Promise.all = all;
		Promise.race = race;

		/**
		 * Return a promise that will fulfill when all promises in the
		 * input array have fulfilled, or will reject when one of the
		 * promises rejects.
		 * @param {array} promises array of promises
		 * @returns {Promise} promise for array of fulfillment values
		 */
		function all(promises) {
			/*jshint maxcomplexity:6*/
			var resolver = new DeferredHandler();
			var len = promises.length >>> 0;
			var pending = len;
			var results = [];
			var i, h;

			for (i = 0; i < len; ++i) {
				if (i in promises) {
					h = getHandlerUnchecked(promises[i]);
					if(h.state === 0) {
						resolveOne(resolver, results, h, i);
					} else if (h.state === 1) {
						results[i] = h.value;
						--pending;
					} else {
						h.chain(resolver, void 0, resolver.reject);
						break;
					}
				} else {
					--pending;
				}
			}

			if(pending === 0) {
				resolver.resolve(results);
			}

			return promiseFromHandler(resolver);

			function resolveOne(resolver, results, handler, i) {
				handler.chain(resolver, function(x) {
					results[i] = x;
					if(--pending === 0) {
						this.resolve(results);
					}
				}, resolver.reject, resolver.notify);
			}
		}

		/**
		 * Fulfill-reject competitive race. Return a promise that will settle
		 * to the same state as the earliest input promise to settle.
		 *
		 * WARNING: The ES6 Promise spec requires that race()ing an empty array
		 * must return a promise that is pending forever.  This implementation
		 * returns a singleton forever-pending promise, the same singleton that is
		 * returned by Promise.never(), thus can be checked with ===
		 *
		 * @param {array} promises array of promises to race
		 * @returns {Promise} if input is non-empty, a promise that will settle
		 * to the same outcome as the earliest input promise to settle. if empty
		 * is empty, returns a promise that will never settle.
		 */
		function race(promises) {
			// Sigh, race([]) is untestable unless we return *something*
			// that is recognizable without calling .then() on it.
			if(Object(promises) === promises && promises.length === 0) {
				return never();
			}

			var h = new DeferredHandler();
			for(var i=0; i<promises.length; ++i) {
				getHandler(promises[i]).chain(h, h.resolve, h.reject);
			}

			return promiseFromHandler(h);
		}

		// Promise internals

		/**
		 * Get an appropriate handler for x, checking for untrusted thenables
		 * and promise graph cycles.
		 * @private
		 * @param {*} x
		 * @param {object?} h optional handler to check for cycles
		 * @returns {object} handler
		 */
		function getHandler(x, h) {
			if(x instanceof Promise) {
				return getHandlerChecked(x, h);
			}
			return maybeThenable(x) ? getHandlerUntrusted(x) : new FulfilledHandler(x);
		}

		/**
		 * Get an appropriate handler for x, without checking for cycles
		 * @private
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandlerUnchecked(x) {
			if(x instanceof Promise) {
				return x._handler.join();
			}
			return maybeThenable(x) ? getHandlerUntrusted(x) : new FulfilledHandler(x);
		}

		/**
		 * Get x's handler, checking for cycles
		 * @param {Promise} x
		 * @param {object?} h handler to check for cycles
		 * @returns {object} handler
		 */
		function getHandlerChecked(x, h) {
			var xh = x._handler.join();
			return h === xh ? promiseCycleHandler() : xh;
		}

		/**
		 * Get a handler for potentially untrusted thenable x
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandlerUntrusted(x) {
			try {
				var untrustedThen = x.then;
				return typeof untrustedThen === 'function'
					? new ThenableHandler(untrustedThen, x)
					: new FulfilledHandler(x);
			} catch(e) {
				return new RejectedHandler(e);
			}
		}

		/**
		 * Handler for a promise that is pending forever
		 * @private
		 * @constructor
		 */
		function Handler() {
			this.state = 0;
		}

		Handler.prototype.when
			= Handler.prototype.resolve
			= Handler.prototype.reject
			= Handler.prototype.notify
			= Handler.prototype._fatal
			= Handler.prototype._removeTrace
			= Handler.prototype._reportTrace
			= noop;

		Handler.prototype.inspect = toPendingState;

		Handler.prototype.join = function() { return this; };

		Handler.prototype.chain = function(to, f, r, u) {
			this.when(noop, noop, void 0, to, f, r, u);
		};

		Handler.prototype._env = environment.monitor || Promise;
		Handler.prototype._isMonitored = function() {
			return typeof this._env.promiseMonitor !== 'undefined';
		};

		Handler.prototype._createContext = function(fromContext) {
			var parent = fromContext || executionContext[executionContext.length - 1];
			this.context = { stack: void 0, parent: parent };
			this._env.promiseMonitor.captureStack(this.context, this.constructor);
		};

		Handler.prototype._enterContext = function() {
			executionContext.push(this.context);
		};

		Handler.prototype._exitContext = function() {
			executionContext.pop();
		};

		/**
		 * Handler that manages a queue of consumers waiting on a pending promise
		 * @private
		 * @constructor
		 */
		function DeferredHandler(receiver, inheritedContext) {
			this.consumers = [];
			this.receiver = receiver;
			this.handler = void 0;
			this.resolved = false;
			this.state = 0;
			if(this._isMonitored()) {
				this._createContext(inheritedContext);
			}
		}

		inherit(Handler, DeferredHandler);

		DeferredHandler.prototype.inspect = function() {
			return this.resolved ? this.join().inspect() : toPendingState();
		};

		DeferredHandler.prototype.resolve = function(x) {
			this._join(getHandler(x, this));
		};

		DeferredHandler.prototype.reject = function(x) {
			this._join(new RejectedHandler(x));
		};

		DeferredHandler.prototype.join = function() {
			if (this.resolved) {
				this.handler = this.handler.join();
				return this.handler;
			} else {
				return this;
			}
		};

		DeferredHandler.prototype.run = function() {
			var q = this.consumers;
			var handler = this.handler = this.handler.join();
			this.consumers = void 0;

			for (var i = 0; i < q.length; i+=7) {
				handler.when(q[i], q[i+1], q[i+2], q[i+3], q[i+4], q[i+5], q[i+6]);
			}
		};

		DeferredHandler.prototype._join = function(handler) {
			if(this.resolved) {
				return;
			}

			this.resolved = true;
			this.handler = handler;
			tasks.enqueue(this);

			if(this._isMonitored()) {
				handler._reportTrace(this.context);
				this.context = void 0;
			}
		};

		DeferredHandler.prototype.when = function(resolve, notify, t, receiver, f, r, u) {
			if(this._isMonitored()) { this.context = void 0; }

			if(this.resolved) {
				tasks.enqueue(new RunHandlerTask(resolve, notify, t, receiver, f, r, u, this.handler));
			} else {
				this.consumers.push(resolve, notify, t, receiver, f, r, u);
			}
		};

		DeferredHandler.prototype.notify = function(x) {
			if(!this.resolved) {
				tasks.enqueue(new ProgressTask(this.consumers, x));
			}
		};

		DeferredHandler.prototype._reportTrace = function(context) {
			this.resolved && this.handler.join()._reportTrace(context);
		};

		DeferredHandler.prototype._removeTrace = function() {
			this.resolved && this.handler.join()._removeTrace();
		};

		/**
		 * Abstract base for handler that delegates to another handler
		 * @private
		 * @param {object} handler
		 * @constructor
		 */
		function DelegateHandler(handler) {
			this.handler = handler;
			this.state = 0;
		}

		inherit(Handler, DelegateHandler);

		DelegateHandler.prototype.join = function() {
			return this.handler.join();
		};

		DelegateHandler.prototype.inspect = function() {
			return this.join().inspect();
		};

		DelegateHandler.prototype._reportTrace = function(context) {
			this.join()._reportTrace(context);
		};

		DelegateHandler.prototype._removeTrace = function() {
			this.join()._removeTrace();
		};

		/**
		 * Wrap another handler and force it into a future stack
		 * @private
		 * @param {object} handler
		 * @constructor
		 */
		function AsyncHandler(handler) {
			DelegateHandler.call(this, handler);
		}

		inherit(DelegateHandler, AsyncHandler);

		AsyncHandler.prototype.when = function(resolve, notify, t, receiver, f, r, u) {
			tasks.enqueue(new RunHandlerTask(resolve, notify, t, receiver, f, r, u, this.join()));
		};

		/**
		 * Handler that follows another handler, injecting a receiver
		 * @private
		 * @param {object} handler another handler to follow
		 * @param {object=undefined} receiver
		 * @constructor
		 */
		function BoundHandler(handler, receiver) {
			DelegateHandler.call(this, handler);
			this.receiver = receiver;
		}

		inherit(DelegateHandler, BoundHandler);

		BoundHandler.prototype.when = function(resolve, notify, t, receiver, f, r, u) {
			// Because handlers are allowed to be shared among promises,
			// each of which possibly having a different receiver, we have
			// to insert our own receiver into the chain if it has been set
			// so that callbacks (f, r, u) will be called using our receiver
			if(this.receiver !== void 0) {
				receiver = this.receiver;
			}
			this.join().when(resolve, notify, t, receiver, f, r, u);
		};

		/**
		 * Handler that wraps an untrusted thenable and assimilates it in a future stack
		 * @private
		 * @param {function} then
		 * @param {{then: function}} thenable
		 * @constructor
		 */
		function ThenableHandler(then, thenable) {
			DeferredHandler.call(this);
			this.assimilated = false;
			this.untrustedThen = then;
			this.thenable = thenable;
		}

		inherit(DeferredHandler, ThenableHandler);

		ThenableHandler.prototype.when = function(resolve, notify, t, receiver, f, r, u) {
			if(!this.assimilated) {
				this.assimilated = true;
				this._assimilate();
			}
			DeferredHandler.prototype.when.call(this, resolve, notify, t, receiver, f, r, u);
		};

		ThenableHandler.prototype._assimilate = function() {
			var h = this;
			this._try(this.untrustedThen, this.thenable, _resolve, _reject, _notify);

			function _resolve(x) { h.resolve(x); }
			function _reject(x)  { h.reject(x); }
			function _notify(x)  { h.notify(x); }
		};

		ThenableHandler.prototype._try = function(then, thenable, resolve, reject, notify) {
			try {
				then.call(thenable, resolve, reject, notify);
			} catch (e) {
				reject(e);
			}
		};

		/**
		 * Handler for a fulfilled promise
		 * @private
		 * @param {*} x fulfillment value
		 * @constructor
		 */
		function FulfilledHandler(x) {
			this.value = x;
			this.state = 1;

			if(this._isMonitored()) {
				this._createContext();
			}
		}

		inherit(Handler, FulfilledHandler);

		FulfilledHandler.prototype.inspect = function() {
			return { state: 'fulfilled', value: this.value };
		};

		FulfilledHandler.prototype.when = function(resolve, notify, t, receiver, f) {
			if(this._isMonitored()) { this._enterContext(); }

			var x = typeof f === 'function'
				? tryCatchReject(f, this.value, receiver)
				: this.value;

			if(this._isMonitored()) { this._exitContext(); }

			resolve.call(t, x);
		};

		/**
		 * Handler for a rejected promise
		 * @private
		 * @param {*} x rejection reason
		 * @constructor
		 */
		function RejectedHandler(x) {
			this.value = x;
			this.state = -1;

			if(this._isMonitored()) {
				this.id = errorId++;
				this._createContext();
				this._reportTrace();
			}
		}

		inherit(Handler, RejectedHandler);

		RejectedHandler.prototype.inspect = function() {
			return { state: 'rejected', reason: this.value };
		};

		RejectedHandler.prototype.when = function(resolve, notify, t, receiver, f, r) {
			if(this._isMonitored()) {
				this._removeTrace();
				this._enterContext();
			}

			var x = typeof r === 'function'
				? tryCatchReject(r, this.value, receiver)
				: promiseFromHandler(this);

			if(this._isMonitored()) { this._exitContext(); }

			resolve.call(t, x);
		};

		RejectedHandler.prototype._reportTrace = function(context) {
			this._env.promiseMonitor.addTrace(this, context);
		};

		RejectedHandler.prototype._removeTrace = function() {
			this._env.promiseMonitor.removeTrace(this);
		};

		RejectedHandler.prototype._fatal = function() {
			this._env.promiseMonitor.fatal(this);
		};

		// Execution context tracking for long stack traces

		var executionContext = [];
		var errorId = 0;

		// Errors and singletons

		var foreverPendingHandler = new Handler();
		var foreverPendingPromise = promiseFromHandler(foreverPendingHandler);

		function promiseCycleHandler() {
			return new RejectedHandler(new TypeError('Promise cycle'));
		}

		// Snapshot states

		/**
		 * Creates a pending state snapshot
		 * @private
		 * @returns {{state:'pending'}}
		 */
		function toPendingState() {
			return { state: 'pending' };
		}

		// Task runners

		/**
		 * Run a single consumer
		 * @private
		 * @constructor
		 */
		function RunHandlerTask(a, b, c, d, e, f, g, handler) {
			this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;this.g=g;
			this.handler = handler;
		}

		RunHandlerTask.prototype.run = function() {
			this.handler.join().when(this.a,this.b,this.c,this.d,this.e,this.f,this.g);
		};

		/**
		 * Run a queue of progress handlers
		 * @private
		 * @constructor
		 */
		function ProgressTask(q, value) {
			this.q = q;
			this.value = value;
		}

		ProgressTask.prototype.run = function() {
			var q = this.q;
			// First progress handler is at index 1
			for (var i = 1; i < q.length; i+=7) {
				this._notify(q[i], q[i+1], q[i+2], q[i+5]);
			}
		};

		ProgressTask.prototype._notify = function(notify, t, receiver, u) {
			var x = typeof u === 'function'
				? tryCatchReturn(u, this.value, receiver)
				: this.value;

			notify.call(t, x);
		};

		// Other helpers

		/**
		 * @param {*} x
		 * @returns {boolean} false iff x is guaranteed not to be a thenable
		 */
		function maybeThenable(x) {
			return (typeof x === 'object' || typeof x === 'function') && x !== null;
		}

		/**
		 * Return f.call(thisArg, x), or if it throws return a rejected promise for
		 * the thrown exception
		 * @private
		 */
		function tryCatchReject(f, x, thisArg) {
			try {
				return f.call(thisArg, x);
			} catch(e) {
				return reject(e);
			}
		}

		/**
		 * Return f.call(thisArg, x), or if it throws, *return* the exception
		 * @private
		 */
		function tryCatchReturn(f, x, thisArg) {
			try {
				return f.call(thisArg, x);
			} catch(e) {
				return e;
			}
		}

		function inherit(Parent, Child) {
			Child.prototype = objectCreate(Parent.prototype);
			Child.prototype.constructor = Child;
		}

		function noop() {}

		return Promise;
	};
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/Queue',[],function() {
	/**
	 * Circular queue
	 * @param {number} capacityPow2 power of 2 to which this queue's capacity
	 *  will be set initially. eg when capacityPow2 == 3, queue capacity
	 *  will be 8.
	 * @constructor
	 */
	function Queue(capacityPow2) {
		this.head = this.tail = this.length = 0;
		this.buffer = new Array(1 << capacityPow2);
	}

	Queue.prototype.push = function(x) {
		if(this.length === this.buffer.length) {
			this._ensureCapacity(this.length * 2);
		}

		this.buffer[this.tail] = x;
		this.tail = (this.tail + 1) & (this.buffer.length - 1);
		++this.length;
		return this.length;
	};

	Queue.prototype.shift = function() {
		var x = this.buffer[this.head];
		this.buffer[this.head] = void 0;
		this.head = (this.head + 1) & (this.buffer.length - 1);
		--this.length;
		return x;
	};

	Queue.prototype._ensureCapacity = function(capacity) {
		var head = this.head;
		var buffer = this.buffer;
		var newBuffer = new Array(capacity);
		var i = 0;
		var len;

		if(head === 0) {
			len = this.length;
			for(; i<len; ++i) {
				newBuffer[i] = buffer[i];
			}
		} else {
			capacity = buffer.length;
			len = this.tail;
			for(; head<capacity; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}

			for(head=0; head<len; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}
		}

		this.buffer = newBuffer;
		this.head = 0;
		this.tail = this.length;
	};

	return Queue;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/scheduler',['require','./Queue'],function(require) {

	var Queue = require('./Queue');

	// Credit to Twisol (https://github.com/Twisol) for suggesting
	// this type of extensible queue + trampoline approach for next-tick conflation.

	function Scheduler(enqueue) {
		this._enqueue = enqueue;
		this._handlerQueue = new Queue(15);

		var self = this;
		this.drainQueue = function() {
			self._drainQueue();
		};
	}

	/**
	 * Enqueue a task. If the queue is not currently scheduled to be
	 * drained, schedule it.
	 * @param {function} task
	 */
	Scheduler.prototype.enqueue = function(task) {
		if(this._handlerQueue.push(task) === 1) {
			this._enqueue(this.drainQueue);
		}
	};

	/**
	 * Drain the handler queue entirely, being careful to allow the
	 * queue to be extended while it is being processed, and to continue
	 * processing until it is truly empty.
	 */
	Scheduler.prototype._drainQueue = function() {
		var q = this._handlerQueue;
		while(q.length > 0) {
			q.shift().run();
		}
	};

	return Scheduler;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/async',['require'],function(require) {

	// Sniff "best" async scheduling option
	// Prefer process.nextTick or MutationObserver, then check for
	// vertx and finally fall back to setTimeout

	/*jshint maxcomplexity:6*/
	/*global process,document,setTimeout,MutationObserver,WebKitMutationObserver*/
	var nextTick, MutationObs;

	if (typeof process !== 'undefined' && process !== null &&
		typeof process.nextTick === 'function') {
		nextTick = function(f) {
			process.nextTick(f);
		};

	} else if (MutationObs =
		(typeof MutationObserver === 'function' && MutationObserver) ||
		(typeof WebKitMutationObserver === 'function' && WebKitMutationObserver)) {
		nextTick = (function (document, MutationObserver) {
			var scheduled;
			var el = document.createElement('div');
			var o = new MutationObserver(run);
			o.observe(el, { attributes: true });

			function run() {
				var f = scheduled;
				scheduled = void 0;
				f();
			}

			return function (f) {
				scheduled = f;
				el.setAttribute('class', 'x');
			};
		}(document, MutationObs));

	} else {
		nextTick = (function(cjsRequire) {
			try {
				// vert.x 1.x || 2.x
				return cjsRequire('vertx').runOnLoop || cjsRequire('vertx').runOnContext;
			} catch (ignore) {}

			// capture setTimeout to avoid being caught by fake timers
			// used in time based tests
			var capturedSetTimeout = setTimeout;
			return function (t) {
				capturedSetTimeout(t, 0);
			};
		}(require));
	}

	return nextTick;
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 
define('when/lib/Promise',['require','./makePromise','./scheduler','./async'],function (require) {

	var makePromise = require('./makePromise');
	var Scheduler = require('./scheduler');
	var async = require('./async');

	return makePromise({
		scheduler: new Scheduler(async),
		monitor: typeof console !== 'undefined' ? console : void 0
	});

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

/** @license MIT License (c) copyright 2010-2014 original author or authors */

/**
 * Promises/A+ and when() implementation
 * when is part of the cujoJS family of libraries (http://cujojs.com/)
 * @author Brian Cavalier
 * @author John Hann
 * @version 3.1.0
 */
(function(define) { 
define('when/when',['require','./lib/decorators/timed','./lib/decorators/array','./lib/decorators/flow','./lib/decorators/inspect','./lib/decorators/iterate','./lib/decorators/progress','./lib/decorators/with','./lib/Promise'],function (require) {

	var timed = require('./lib/decorators/timed');
	var array = require('./lib/decorators/array');
	var flow = require('./lib/decorators/flow');
	var inspect = require('./lib/decorators/inspect');
	var generate = require('./lib/decorators/iterate');
	var progress = require('./lib/decorators/progress');
	var withThis = require('./lib/decorators/with');

	var Promise = [array, flow, generate, progress, inspect, withThis, timed]
		.reduceRight(function(Promise, feature) {
			return feature(Promise);
		}, require('./lib/Promise'));

	var resolve = Promise.resolve;
	var slice = Array.prototype.slice;

	// Public API

	when.promise     = promise;              // Create a pending promise
	when.resolve     = Promise.resolve;      // Create a resolved promise
	when.reject      = Promise.reject;       // Create a rejected promise

	when.lift        = lift;                 // lift a function to return promises
	when['try']      = tryCall;              // call a function and return a promise
	when.attempt     = tryCall;              // alias for when.try

	when.iterate     = Promise.iterate;      // Generate a stream of promises
	when.unfold      = Promise.unfold;       // Generate a stream of promises

	when.join        = join;                 // Join 2 or more promises

	when.all         = all;                  // Resolve a list of promises
	when.settle      = settle;               // Settle a list of promises

	when.any         = lift(Promise.any);    // One-winner race
	when.some        = lift(Promise.some);   // Multi-winner race

	when.map         = map;                  // Array.map() for promises
	when.reduce      = reduce;               // Array.reduce() for promises
	when.reduceRight = reduceRight;          // Array.reduceRight() for promises

	when.isPromiseLike = isPromiseLike;      // Is something promise-like, aka thenable

	when.Promise     = Promise;              // Promise constructor
	when.defer       = defer;                // Create a {promise, resolve, reject} tuple

	/**
	 * When x, which may be a promise, thenable, or non-promise value,
	 *
	 * @param {*} x
	 * @param {function?} onFulfilled callback to be called when x is
	 *   successfully fulfilled.  If promiseOrValue is an immediate value, callback
	 *   will be invoked immediately.
	 * @param {function?} onRejected callback to be called when x is
	 *   rejected.
	 * @param {function?} onProgress callback to be called when progress updates
	 *   are issued for x.
	 * @returns {Promise} a new promise that will fulfill with the return
	 *   value of callback or errback or the completion value of promiseOrValue if
	 *   callback and/or errback is not supplied.
	 */
	function when(x, onFulfilled, onRejected, onProgress) {
		var p = resolve(x);
		return arguments.length < 2 ? p : p.then(onFulfilled, onRejected, onProgress);
	}

	/**
	 * Creates a new promise whose fate is determined by resolver.
	 * @param {function} resolver function(resolve, reject, notify)
	 * @returns {Promise} promise whose fate is determine by resolver
	 */
	function promise(resolver) {
		return new Promise(resolver);
	}

	/**
	 * Lift the supplied function, creating a version of f that returns
	 * promises, and accepts promises as arguments.
	 * @param {function} f
	 * @returns {Function} version of f that returns promises
	 */
	function lift(f) {
		return function() {
			return _apply(f, this, slice.call(arguments));
		};
	}

	/**
	 * Call f in a future turn, with the supplied args, and return a promise
	 * for the result.
	 * @param {function} f
	 * @returns {Promise}
	 */
	function tryCall(f /*, args... */) {
		/*jshint validthis:true */
		return _apply(f, this, slice.call(arguments, 1));
	}

	/**
	 * try/lift helper that allows specifying thisArg
	 * @private
	 */
	function _apply(func, thisArg, args) {
		return Promise.all(args).then(function(args) {
			return func.apply(thisArg, args);
		});
	}

	/**
	 * Creates a {promise, resolver} pair, either or both of which
	 * may be given out safely to consumers.
	 * @return {{promise: Promise, resolve: function, reject: function, notify: function}}
	 */
	function defer() {
		return new Deferred();
	}

	function Deferred() {
		var p = Promise._defer();

		function resolve(x) { p._handler.resolve(x); }
		function reject(x) { p._handler.reject(x); }
		function notify(x) { p._handler.notify(x); }

		this.promise = p;
		this.resolve = resolve;
		this.reject = reject;
		this.notify = notify;
		this.resolver = { resolve: resolve, reject: reject, notify: notify };
	}

	/**
	 * Determines if x is promise-like, i.e. a thenable object
	 * NOTE: Will return true for *any thenable object*, and isn't truly
	 * safe, since it may attempt to access the `then` property of x (i.e.
	 *  clever/malicious getters may do weird things)
	 * @param {*} x anything
	 * @returns {boolean} true if x is promise-like
	 */
	function isPromiseLike(x) {
		return x && typeof x.then === 'function';
	}

	/**
	 * Return a promise that will resolve only once all the supplied arguments
	 * have resolved. The resolution value of the returned promise will be an array
	 * containing the resolution values of each of the arguments.
	 * @param {...*} arguments may be a mix of promises and values
	 * @returns {Promise}
	 */
	function join(/* ...promises */) {
		return Promise.all(arguments);
	}

	/**
	 * Return a promise that will fulfill once all input promises have
	 * fulfilled, or reject when any one input promise rejects.
	 * @param {array|Promise} promises array (or promise for an array) of promises
	 * @returns {Promise}
	 */
	function all(promises) {
		return when(promises, Promise.all);
	}

	/**
	 * Return a promise that will always fulfill with an array containing
	 * the outcome states of all input promises.  The returned promise
	 * will only reject if `promises` itself is a rejected promise.
	 * @param {array|Promise} promises array (or promise for an array) of promises
	 * @returns {Promise}
	 */
	function settle(promises) {
		return when(promises, Promise.settle);
	}

	/**
	 * Promise-aware array map function, similar to `Array.prototype.map()`,
	 * but input array may contain promises or values.
	 * @param {Array|Promise} promises array of anything, may contain promises and values
	 * @param {function} mapFunc map function which may return a promise or value
	 * @returns {Promise} promise that will fulfill with an array of mapped values
	 *  or reject if any input promise rejects.
	 */
	function map(promises, mapFunc) {
		return when(promises, function(promises) {
			return Promise.map(promises, mapFunc);
		});
	}

	/**
	 * Traditional reduce function, similar to `Array.prototype.reduce()`, but
	 * input may contain promises and/or values, and reduceFunc
	 * may return either a value or a promise, *and* initialValue may
	 * be a promise for the starting value.
	 *
	 * @param {Array|Promise} promises array or promise for an array of anything,
	 *      may contain a mix of promises and values.
	 * @param {function} f reduce function reduce(currentValue, nextValue, index)
	 * @returns {Promise} that will resolve to the final reduced value
	 */
	function reduce(promises, f /*, initialValue */) {
		/*jshint unused:false*/
		var args = slice.call(arguments, 1);
		return when(promises, function(array) {
			args.unshift(array);
			return Promise.reduce.apply(Promise, args);
		});
	}

	/**
	 * Traditional reduce function, similar to `Array.prototype.reduceRight()`, but
	 * input may contain promises and/or values, and reduceFunc
	 * may return either a value or a promise, *and* initialValue may
	 * be a promise for the starting value.
	 *
	 * @param {Array|Promise} promises array or promise for an array of anything,
	 *      may contain a mix of promises and values.
	 * @param {function} f reduce function reduce(currentValue, nextValue, index)
	 * @returns {Promise} that will resolve to the final reduced value
	 */
	function reduceRight(promises, f /*, initialValue */) {
		/*jshint unused:false*/
		var args = slice.call(arguments, 1);
		return when(promises, function(array) {
			args.unshift(array);
			return Promise.reduceRight.apply(Promise, args);
		});
	}

	return when;
});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

define('when', ['when/when'], function (main) { return main; });

/*!
 * jQuery JavaScript Library v2.1.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-05-01T17:11Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper window is present,
		// execute the factory and get jQuery
		// For environments that do not inherently posses a window with a document
		// (such as Node.js), expose a jQuery-making factory as module.exports
		// This accentuates the need for the creation of a real window
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//

var arr = [];

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	version = "2.1.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		return !jQuery.isArray( obj ) && obj - parseFloat( obj ) >= 0;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		// Support: Android < 4.0, iOS < 6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v1.10.19
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-04-18
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== strundefined && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare,
		doc = node ? node.ownerDocument || node : preferredDoc,
		parent = doc.defaultView;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", function() {
				setDocument();
			}, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", function() {
				setDocument();
			});
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName ) && assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select msallowclip=''><option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowclip^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is no seed and only one group
	if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[0], key ) : emptyGet;
};


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};


function Data() {
	// Support: Android < 4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Math.random();
}

Data.uid = 1;
Data.accepts = jQuery.acceptData;

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android < 4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};
var data_priv = new Data();

var data_user = new Data();



/*
	Implementation Summary

	1. Enforce API surface and semantic compatibility with 1.9.x branch
	2. Improve the module's maintainability by reducing the storage
		paths to a single mechanism.
	3. Use the same single mechanism to support "private" and "user" data.
	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	5. Avoid exposing implementation details on user objects (eg. expando properties)
	6. Provide a clear path for implementation upgrade to WeakMap in 2014
*/
var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend({
	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice(5) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};

var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	// Support: Windows Web Apps (WWA)
	// `name` and `type` need .setAttribute for WWA
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE9-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
})();
var strundefined = typeof undefined;



support.focusinBubbles = "onfocusin" in window;


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome < 28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Create "bubbling" focus and blur events
// Support: Firefox, Chrome, Safari
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				data_priv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					data_priv.remove( doc, fix );

				} else {
					data_priv.access( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE 9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE 9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = data_priv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}

function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Support: IE >= 9
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Support: IE >= 9
		// Fix Cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit
					// jQuery.merge because push.apply(_, arraylike) throws
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: QtWebKit
					// jQuery.merge because push.apply(_, arraylike) throws
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Fixes #12346
					// Support: Webkit, IE
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type, key,
			special = jQuery.event.special,
			i = 0;

		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
			if ( jQuery.acceptData( elem ) ) {
				key = elem[ data_priv.expando ];

				if ( key && (data = data_priv.cache[ key ]) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}
					if ( data_priv.cache[ key ] ) {
						// Discard any remaining `private` data
						delete data_priv.cache[ key ];
					}
				}
			}
			// Discard any remaining `user` data
			delete data_user.cache[ elem[ data_user.expando ] ];
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each(function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				});
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var style,
		elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

			// Use of this method is a temporary fix (more like optmization) until something better comes along,
			// since it was removed from specification and supported only in FF
			style.display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {
		return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
	};



function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') in IE9, see #12537
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];
	}

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: iOS < 6
		// A tribute to the "awesome hack by Dean Edwards"
		// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?
		// Support: IE
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {
				// Hook not needed (or it's not possible to use it due to missing dependency),
				// remove it.
				// Since there are no other hooks for marginRight, remove the whole object.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.

			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	var pixelPositionVal, boxSizingReliableVal,
		docElem = document.documentElement,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	if ( !div.style ) {
		return;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
		"position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computePixelPositionAndBoxSizingReliable() {
		div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
			"box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
			"border:1px;padding:1px;width:4px;position:absolute";
		div.innerHTML = "";
		docElem.appendChild( container );

		var divStyle = window.getComputedStyle( div, null );
		pixelPositionVal = divStyle.top !== "1%";
		boxSizingReliableVal = divStyle.width === "4px";

		docElem.removeChild( container );
	}

	// Support: node.js jsdom
	// Don't assume that getComputedStyle is a property of the global object
	if ( window.getComputedStyle ) {
		jQuery.extend( support, {
			pixelPosition: function() {
				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computePixelPositionAndBoxSizingReliable();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computePixelPositionAndBoxSizingReliable();
				}
				return boxSizingReliableVal;
			},
			reliableMarginRight: function() {
				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
					// Support: Firefox<29, Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
					"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				docElem.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv, null ).marginRight );

				docElem.removeChild( container );

				return ret;
			}
		});
	}
})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name[0].toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// Work around by temporarily setting element display to inline-block
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*
					// Use a string for doubling factor so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur()
				// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = data_priv.get( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			data_priv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = data_priv.access( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS 5.1, Android 4.x, Android 2.3
	// Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
	support.checkOn = input.value !== "";

	// Must access the parent to make an option select properly
	// Support: IE9, IE10
	support.optSelected = opt.selected;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Check if an input maintains its value after becoming a radio
	// Support: IE9, IE10
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
})();


var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {
			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
});




var rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

// Support: IE9+
// Selectedness for an option in an optgroup can be inaccurate
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = arguments.length === 0 || typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( option.value, values ) >= 0) ) {
						optionSet = true;
					}
				}

				// force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			// Support: Webkit
			// "" is returned instead of "on" if a value isn't specified
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		tmp = new DOMParser();
		xml = tmp.parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
};
jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrId = 0,
	xhrCallbacks = {},
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE9
// Open requests must be manually aborted on unload (#5280)
if ( window.ActiveXObject ) {
	jQuery( window ).on( "unload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
	});
}

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr(),
					id = ++xhrId;

				xhr.open( options.type, options.url, options.async, options.username, options.password );

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file: protocol always yields status 0; see #8605, #14207
									xhr.status,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// Accessing binary-data responseText throws an exception
									// (#11426)
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");

				// Create the abort callback
				callback = xhrCallbacks[ id ] = callback("abort");

				try {
					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {
					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};




var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// We assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

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

define('recorder/require',["require"], function(require) {
	return require;
});

// Generated by uRequire v0.6.14 - template: 'AMD' 
(function (window, global) {
  
var __isAMD = !!(typeof define === 'function' && define.amd),
    __isNode = (typeof exports === 'object'),
    __isWeb = !__isNode;
define('recorder/recorder',['require','exports','module'],function (require, exports, module) {
  var __umodule__ = (function (require, exports, module) {
  

var prefixes = [
    "",
    "webkit",
    "moz",
    "ms",
    "o"
  ];
var el = document.createElement("div");
function testProp(prop) {
  for (var p = 0, pl = prefixes.length; p < pl; p++) {
    var prefixedProp = prefixes[p] ? prefixes[p] + prop.charAt(0).toUpperCase() + prop.slice(1) : prop;
    if (el.style[prefixedProp] != null) {
      return prefixedProp;
    }
  }
}
var TRANSFORM = testProp("transform");
var Recorder = {
    version: 1.13,
    swfObject: null,
    _callbacks: {},
    _events: {},
    _initialized: false,
    _flashBlockCatched: false,
    options: {},
    initialize: function (options) {
      this.options = options || {};
      if (window.location.protocol === "file:") {
        throw new Error("Due to Adobe Flash restrictions it is not possible to use the Recorder through the file:// protocol. Please use an http server.");
      }
      if (!this.options.flashContainer) {
        this._setupFlashContainer();
      }
      this.bind("initialized", function () {
        Recorder._initialized = true;
        if (Recorder._flashBlockCatched) {
          Recorder._defaultOnHideFlash();
        }
        if (options.initialized) {
          options.initialized();
        }
      });
      this.bind("showFlash", this.options.onFlashSecurity || this._defaultOnShowFlash);
      this.bind("hideFlash", this._defaultOnHideFlash);
      this._loadFlash();
    },
    clear: function () {
      Recorder._events = {};
    },
    record: function (options) {
      options = options || {};
      this.clearBindings("recordingStart");
      this.clearBindings("recordingProgress");
      this.clearBindings("recordingCancel");
      this.bind("recordingStart", this._defaultOnHideFlash);
      this.bind("recordingCancel", this._defaultOnHideFlash);
      this.bind("recordingCancel", this._loadFlash);
      this.bind("recordingStart", options["start"]);
      this.bind("recordingProgress", options["progress"]);
      this.bind("recordingCancel", options["cancel"]);
      this.flashInterface().record();
    },
    stop: function () {
      return this.flashInterface()._stop();
    },
    play: function (options) {
      options = options || {};
      this.clearBindings("playingProgress");
      this.bind("playingProgress", options["progress"]);
      this.bind("playingStop", options["finished"]);
      this.flashInterface()._play();
    },
    upload: function (options) {
      options.audioParam = options.audioParam || "audio";
      options.params = options.params || {};
      options.audioFormat = options.audioFormat || Recorder.AUDIO_FORMAT_WAV;
      this.clearBindings("uploadSuccess");
      this.bind("uploadSuccess", function (responseText) {
        options.success(Recorder._externalInterfaceDecode(responseText));
      });
      this.bind("uploadFailure", function (httpStatus) {
        options.error(httpStatus);
      });
      this.flashInterface().upload(options.url, options.audioParam, options.params, options.audioFormat);
    },
    encode: function (audioFormat) {
      var audioFormat = audioFormat || Recorder.AUDIO_FORMAT_WAV;
      this.flashInterface().encode(audioFormat);
    },
    audioData: function (newData) {
      var delimiter = ";", newDataSerialized, stringData, data = [], sample;
      if (newData) {
        newDataSerialized = newData.join(";");
      }
      stringData = this.flashInterface().audioData(newDataSerialized).split(delimiter);
      for (var i = 0; i < stringData.length; i++) {
        sample = parseFloat(stringData[i]);
        if (!isNaN(sample)) {
          data.push(sample);
        }
      }
      return data;
    },
    request: function (method, uri, contentType, data, callback) {
      var callbackName = this.registerCallback(callback);
      this.flashInterface().request(method, uri, contentType, data, callbackName);
    },
    clearBindings: function (eventName) {
      Recorder._events[eventName] = [];
    },
    bind: function (eventName, fn) {
      if (!Recorder._events[eventName]) {
        Recorder._events[eventName] = [];
      }
      Recorder._events[eventName].push(fn);
    },
    triggerEvent: function (eventName, arg0, arg1) {
      Recorder._executeInWindowContext(function () {
        if (!Recorder._events[eventName]) {
          return;
        }
        for (var i = 0, len = Recorder._events[eventName].length; i < len; i++) {
          if (Recorder._events[eventName][i]) {
            Recorder._events[eventName][i].apply(Recorder, [
              arg0,
              arg1
            ]);
          }
        }
      });
    },
    triggerCallback: function (name, args) {
      Recorder._executeInWindowContext(function () {
        Recorder._callbacks[name].apply(null, args);
      });
    },
    registerCallback: function (fn) {
      var name = "CB" + parseInt(Math.random() * 999999, 10);
      Recorder._callbacks[name] = fn;
      return name;
    },
    flashInterface: function () {
      if (!this.swfObject) {
        return null;
      } else if (this.swfObject.record) {
        return this.swfObject;
      } else if (this.swfObject.children[3].record) {
        return this.swfObject.children[3];
      }
    },
    _executeInWindowContext: function (fn) {
      window.setTimeout(fn, 1);
    },
    _setupFlashContainer: function () {
      this.options.flashContainer = document.createElement("div");
      this.options.flashContainer.setAttribute("id", "recorderFlashContainer");
      this.options.flashContainer.setAttribute("style", "position: fixed; left: -9999px; top: -9999px; width: 231px; height: 153px; border-top: 6px solid rgba(128, 128, 128, 0.6); border-bottom: 6px solid rgba(128, 128, 128, 0.6); border-radius: 5px 5px; padding-bottom: 1px; padding-right: 1px;");
      document.body.appendChild(this.options.flashContainer);
    },
    _clearFlash: function () {
      var flashElement = this.options.flashContainer.children[0];
      if (flashElement) {
        this.options.flashContainer.removeChild(flashElement);
      }
    },
    _loadFlash: function () {
      this._clearFlash();
      var flashElement = document.createElement("div");
      flashElement.setAttribute("id", "recorderFlashObject");
      this.options.flashContainer.appendChild(flashElement);
      swfobject.embedSWF(this.options.swfSrc, "recorderFlashObject", "231", "141", "10.1.0", undefined, undefined, { allowscriptaccess: "always" }, undefined, function (e) {
        if (e.success) {
          Recorder.swfObject = e.ref;
          Recorder._checkForFlashBlock();
        } else {
          Recorder._showFlashRequiredDialog();
        }
      });
    },
    _defaultOnShowFlash: function () {
      var flashContainer = Recorder.options.flashContainer;
      flashContainer.style.left = "50%";
      flashContainer.style.top = "50%";
      flashContainer.style.marginLeft = "-115px";
      flashContainer.style.marginTop = "-70px";
      flashContainer.style.width = "231px";
      flashContainer.style.height = "153px";
      flashContainer.style.borderStyle = "solid";
    },
    _defaultOnHideFlash: function () {
      var flashContainer = Recorder.options.flashContainer;
      flashContainer.style.left = "115px";
      flashContainer.style.top = "70px";
      flashContainer.style.width = "1px";
      flashContainer.style.height = "1px";
      flashContainer.style.overflow = "hidden";
      flashContainer.style.borderStyle = "none";
    },
    _checkForFlashBlock: function () {
      var swf = Recorder.swfObject;
      setTimeout(function () {
        if (typeof swf.PercentLoaded !== "undefined" && swf.PercentLoaded()) {
          var loadCheckInterval = setInterval(function () {
              if (swf.PercentLoaded() === 100) {
                if (!Recorder._initialized) {
                  Recorder._flashBlockCatched = true;
                  Recorder.triggerEvent("showFlash");
                }
                clearInterval(loadCheckInterval);
              }
            }, 500);
        }
      }, 200);
    },
    _showFlashRequiredDialog: function () {
      Recorder.options.flashContainer.innerHTML = "<p>Adobe Flash Player 10.1 or newer is required to use this feature.</p><p><a href='http://get.adobe.com/flashplayer' target='_top'>Get it on Adobe.com.</a></p>";
      Recorder.options.flashContainer.style.color = "white";
      Recorder.options.flashContainer.style.backgroundColor = "#777";
      Recorder.options.flashContainer.style.textAlign = "center";
      Recorder.triggerEvent("showFlash");
    },
    _externalInterfaceDecode: function (data) {
      return data.replace(/%22/g, "\"").replace(/%5c/g, "\\").replace(/%26/g, "&").replace(/%25/g, "%");
    }
  };
Recorder.AUDIO_FORMAT_WAV = 0;
Recorder.AUDIO_FORMAT_MP3 = 1;
window.Recorder = Recorder;
if (swfobject == undefined) {
  var swfobject = function () {
      var D = "undefined", r = "object", S = "Shockwave Flash", W = "ShockwaveFlash.ShockwaveFlash", q = "application/x-shockwave-flash", R = "SWFObjectExprInst", x = "onreadystatechange", O = window, j = document, t = navigator, T = false, U = [h], o = [], N = [], I = [], l, Q, E, B, J = false, a = false, n, G, m = true, M = function () {
          var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D, ah = t.userAgent.toLowerCase(), Y = t.platform.toLowerCase(), ae = Y ? /win/.test(Y) : /win/.test(ah), ac = Y ? /mac/.test(Y) : /mac/.test(ah), af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, X = !+"1", ag = [
              0,
              0,
              0
            ], ab = null;
          if (typeof t.plugins != D && typeof t.plugins[S] == r) {
            ab = t.plugins[S].description;
            if (ab && !(typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
              T = true;
              X = false;
              ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
              ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
              ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
              ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
            }
          } else {
            if (typeof O.ActiveXObject != D) {
              try {
                var ad = new ActiveXObject(W);
                if (ad) {
                  ab = ad.GetVariable("$version");
                  if (ab) {
                    X = true;
                    ab = ab.split(" ")[1].split(",");
                    ag = [
                      parseInt(ab[0], 10),
                      parseInt(ab[1], 10),
                      parseInt(ab[2], 10)
                    ];
                  }
                }
              } catch (Z) {
              }
            }
          }
          return {
            w3: aa,
            pv: ag,
            wk: af,
            ie: X,
            win: ae,
            mac: ac
          };
        }(), k = function () {
          if (!M.w3) {
            return;
          }
          if (typeof j.readyState != D && j.readyState == "complete" || typeof j.readyState == D && (j.getElementsByTagName("body")[0] || j.body)) {
            f();
          }
          if (!J) {
            if (typeof j.addEventListener != D) {
              j.addEventListener("DOMContentLoaded", f, false);
            }
            if (M.ie && M.win) {
              j.attachEvent(x, function () {
                if (j.readyState == "complete") {
                  j.detachEvent(x, arguments.callee);
                  f();
                }
              });
              if (O == top) {
                (function () {
                  if (J) {
                    return;
                  }
                  try {
                    j.documentElement.doScroll("left");
                  } catch (X) {
                    setTimeout(arguments.callee, 0);
                    return;
                  }
                  f();
                }());
              }
            }
            if (M.wk) {
              (function () {
                if (J) {
                  return;
                }
                if (!/loaded|complete/.test(j.readyState)) {
                  setTimeout(arguments.callee, 0);
                  return;
                }
                f();
              }());
            }
            s(f);
          }
        }();
      function f() {
        if (J) {
          return;
        }
        try {
          var Z = j.getElementsByTagName("body")[0].appendChild(C("span"));
          Z.parentNode.removeChild(Z);
        } catch (aa) {
          return;
        }
        J = true;
        var X = U.length;
        for (var Y = 0; Y < X; Y++) {
          U[Y]();
        }
      }
      function K(X) {
        if (J) {
          X();
        } else {
          U[U.length] = X;
        }
      }
      function s(Y) {
        if (typeof O.addEventListener != D) {
          O.addEventListener("load", Y, false);
        } else {
          if (typeof j.addEventListener != D) {
            j.addEventListener("load", Y, false);
          } else {
            if (typeof O.attachEvent != D) {
              i(O, "onload", Y);
            } else {
              if (typeof O.onload == "function") {
                var X = O.onload;
                O.onload = function () {
                  X();
                  Y();
                };
              } else {
                O.onload = Y;
              }
            }
          }
        }
      }
      function h() {
        if (T) {
          V();
        } else {
          H();
        }
      }
      function V() {
        var X = j.getElementsByTagName("body")[0];
        var aa = C(r);
        aa.setAttribute("type", q);
        var Z = X.appendChild(aa);
        if (Z) {
          var Y = 0;
          (function () {
            if (typeof Z.GetVariable != D) {
              var ab = Z.GetVariable("$version");
              if (ab) {
                ab = ab.split(" ")[1].split(",");
                M.pv = [
                  parseInt(ab[0], 10),
                  parseInt(ab[1], 10),
                  parseInt(ab[2], 10)
                ];
              }
            } else {
              if (Y < 10) {
                Y++;
                setTimeout(arguments.callee, 10);
                return;
              }
            }
            X.removeChild(aa);
            Z = null;
            H();
          }());
        } else {
          H();
        }
      }
      function H() {
        var ag = o.length;
        if (ag > 0) {
          for (var af = 0; af < ag; af++) {
            var Y = o[af].id;
            var ab = o[af].callbackFn;
            var aa = {
                success: false,
                id: Y
              };
            if (M.pv[0] > 0) {
              var ae = c(Y);
              if (ae) {
                if (F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
                  w(Y, true);
                  if (ab) {
                    aa.success = true;
                    aa.ref = z(Y);
                    ab(aa);
                  }
                } else {
                  if (o[af].expressInstall && A()) {
                    var ai = {};
                    ai.data = o[af].expressInstall;
                    ai.width = ae.getAttribute("width") || "0";
                    ai.height = ae.getAttribute("height") || "0";
                    if (ae.getAttribute("class")) {
                      ai.styleclass = ae.getAttribute("class");
                    }
                    if (ae.getAttribute("align")) {
                      ai.align = ae.getAttribute("align");
                    }
                    var ah = {};
                    var X = ae.getElementsByTagName("param");
                    var ac = X.length;
                    for (var ad = 0; ad < ac; ad++) {
                      if (X[ad].getAttribute("name").toLowerCase() != "movie") {
                        ah[X[ad].getAttribute("name")] = X[ad].getAttribute("value");
                      }
                    }
                    P(ai, ah, Y, ab);
                  } else {
                    p(ae);
                    if (ab) {
                      ab(aa);
                    }
                  }
                }
              }
            } else {
              w(Y, true);
              if (ab) {
                var Z = z(Y);
                if (Z && typeof Z.SetVariable != D) {
                  aa.success = true;
                  aa.ref = Z;
                }
                ab(aa);
              }
            }
          }
        }
      }
      function z(aa) {
        var X = null;
        var Y = c(aa);
        if (Y && Y.nodeName == "OBJECT") {
          if (typeof Y.SetVariable != D) {
            X = Y;
          } else {
            var Z = Y.getElementsByTagName(r)[0];
            if (Z) {
              X = Z;
            }
          }
        }
        return X;
      }
      function A() {
        return !a && F("6.0.65") && (M.win || M.mac) && !(M.wk && M.wk < 312);
      }
      function P(aa, ab, X, Z) {
        a = true;
        E = Z || null;
        B = {
          success: false,
          id: X
        };
        var ae = c(X);
        if (ae) {
          if (ae.nodeName == "OBJECT") {
            l = g(ae);
            Q = null;
          } else {
            l = ae;
            Q = X;
          }
          aa.id = R;
          if (typeof aa.width == D || !/%$/.test(aa.width) && parseInt(aa.width, 10) < 310) {
            aa.width = "310";
          }
          if (typeof aa.height == D || !/%$/.test(aa.height) && parseInt(aa.height, 10) < 137) {
            aa.height = "137";
          }
          j.title = j.title.slice(0, 47) + " - Flash Player Installation";
          var ad = M.ie && M.win ? "ActiveX" : "PlugIn", ac = "MMredirectURL=" + encodeURI(O.location).toString().replace(/&/g, "%26") + "&MMplayerType=" + ad + "&MMdoctitle=" + j.title;
          if (typeof ab.flashvars != D) {
            ab.flashvars += "&" + ac;
          } else {
            ab.flashvars = ac;
          }
          if (M.ie && M.win && ae.readyState != 4) {
            var Y = C("div");
            X += "SWFObjectNew";
            Y.setAttribute("id", X);
            ae.parentNode.insertBefore(Y, ae);
            ae.style.display = "none";
            (function () {
              if (ae.readyState == 4) {
                ae.parentNode.removeChild(ae);
              } else {
                setTimeout(arguments.callee, 10);
              }
            }());
          }
          u(aa, ab, X);
        }
      }
      function p(Y) {
        if (M.ie && M.win && Y.readyState != 4) {
          var X = C("div");
          Y.parentNode.insertBefore(X, Y);
          X.parentNode.replaceChild(g(Y), X);
          Y.style.display = "none";
          (function () {
            if (Y.readyState == 4) {
              Y.parentNode.removeChild(Y);
            } else {
              setTimeout(arguments.callee, 10);
            }
          }());
        } else {
          Y.parentNode.replaceChild(g(Y), Y);
        }
      }
      function g(ab) {
        var aa = C("div");
        if (M.win && M.ie) {
          aa.innerHTML = ab.innerHTML;
        } else {
          var Y = ab.getElementsByTagName(r)[0];
          if (Y) {
            var ad = Y.childNodes;
            if (ad) {
              var X = ad.length;
              for (var Z = 0; Z < X; Z++) {
                if (!(ad[Z].nodeType == 1 && ad[Z].nodeName == "PARAM") && !(ad[Z].nodeType == 8)) {
                  aa.appendChild(ad[Z].cloneNode(true));
                }
              }
            }
          }
        }
        return aa;
      }
      function u(ai, ag, Y) {
        var X, aa = c(Y);
        if (M.wk && M.wk < 312) {
          return X;
        }
        if (aa) {
          if (typeof ai.id == D) {
            ai.id = Y;
          }
          if (M.ie && M.win) {
            var ah = "";
            for (var ae in ai) {
              if (ai[ae] != Object.prototype[ae]) {
                if (ae.toLowerCase() == "data") {
                  ag.movie = ai[ae];
                } else {
                  if (ae.toLowerCase() == "styleclass") {
                    ah += " class=\"" + ai[ae] + "\"";
                  } else {
                    if (ae.toLowerCase() != "classid") {
                      ah += " " + ae + "=\"" + ai[ae] + "\"";
                    }
                  }
                }
              }
            }
            var af = "";
            for (var ad in ag) {
              if (ag[ad] != Object.prototype[ad]) {
                af += "<param name=\"" + ad + "\" value=\"" + ag[ad] + "\" />";
              }
            }
            aa.outerHTML = "<object classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\"" + ah + ">" + af + "</object>";
            N[N.length] = ai.id;
            X = c(ai.id);
          } else {
            var Z = C(r);
            Z.setAttribute("type", q);
            for (var ac in ai) {
              if (ai[ac] != Object.prototype[ac]) {
                if (ac.toLowerCase() == "styleclass") {
                  Z.setAttribute("class", ai[ac]);
                } else {
                  if (ac.toLowerCase() != "classid") {
                    Z.setAttribute(ac, ai[ac]);
                  }
                }
              }
            }
            for (var ab in ag) {
              if (ag[ab] != Object.prototype[ab] && ab.toLowerCase() != "movie") {
                e(Z, ab, ag[ab]);
              }
            }
            aa.parentNode.replaceChild(Z, aa);
            X = Z;
          }
        }
        return X;
      }
      function e(Z, X, Y) {
        var aa = C("param");
        aa.setAttribute("name", X);
        aa.setAttribute("value", Y);
        Z.appendChild(aa);
      }
      function y(Y) {
        var X = c(Y);
        if (X && X.nodeName == "OBJECT") {
          if (M.ie && M.win) {
            X.style.display = "none";
            (function () {
              if (X.readyState == 4) {
                b(Y);
              } else {
                setTimeout(arguments.callee, 10);
              }
            }());
          } else {
            X.parentNode.removeChild(X);
          }
        }
      }
      function b(Z) {
        var Y = c(Z);
        if (Y) {
          for (var X in Y) {
            if (typeof Y[X] == "function") {
              Y[X] = null;
            }
          }
          Y.parentNode.removeChild(Y);
        }
      }
      function c(Z) {
        var X = null;
        try {
          X = j.getElementById(Z);
        } catch (Y) {
        }
        return X;
      }
      function C(X) {
        return j.createElement(X);
      }
      function i(Z, X, Y) {
        Z.attachEvent(X, Y);
        I[I.length] = [
          Z,
          X,
          Y
        ];
      }
      function F(Z) {
        var Y = M.pv, X = Z.split(".");
        X[0] = parseInt(X[0], 10);
        X[1] = parseInt(X[1], 10) || 0;
        X[2] = parseInt(X[2], 10) || 0;
        return Y[0] > X[0] || Y[0] == X[0] && Y[1] > X[1] || Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2] ? true : false;
      }
      function v(ac, Y, ad, ab) {
        if (M.ie && M.mac) {
          return;
        }
        var aa = j.getElementsByTagName("head")[0];
        if (!aa) {
          return;
        }
        var X = ad && typeof ad == "string" ? ad : "screen";
        if (ab) {
          n = null;
          G = null;
        }
        if (!n || G != X) {
          var Z = C("style");
          Z.setAttribute("type", "text/css");
          Z.setAttribute("media", X);
          n = aa.appendChild(Z);
          if (M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
            n = j.styleSheets[j.styleSheets.length - 1];
          }
          G = X;
        }
        if (M.ie && M.win) {
          if (n && typeof n.addRule == r) {
            n.addRule(ac, Y);
          }
        } else {
          if (n && typeof j.createTextNode != D) {
            n.appendChild(j.createTextNode(ac + " {" + Y + "}"));
          }
        }
      }
      function w(Z, X) {
        if (!m) {
          return;
        }
        var Y = X ? "visible" : "hidden";
        if (J && c(Z)) {
          c(Z).style.visibility = Y;
        } else {
          v("#" + Z, "visibility:" + Y);
        }
      }
      function L(Y) {
        var Z = /[\\\"<>\.;]/;
        var X = Z.exec(Y) != null;
        return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y;
      }
      var d = function () {
          if (M.ie && M.win) {
            window.attachEvent("onunload", function () {
              var ac = I.length;
              for (var ab = 0; ab < ac; ab++) {
                I[ab][0].detachEvent(I[ab][1], I[ab][2]);
              }
              var Z = N.length;
              for (var aa = 0; aa < Z; aa++) {
                y(N[aa]);
              }
              for (var Y in M) {
                M[Y] = null;
              }
              M = null;
              for (var X in swfobject) {
                swfobject[X] = null;
              }
              swfobject = null;
            });
          }
        }();
      return {
        registerObject: function (ab, X, aa, Z) {
          if (M.w3 && ab && X) {
            var Y = {};
            Y.id = ab;
            Y.swfVersion = X;
            Y.expressInstall = aa;
            Y.callbackFn = Z;
            o[o.length] = Y;
            w(ab, false);
          } else {
            if (Z) {
              Z({
                success: false,
                id: ab
              });
            }
          }
        },
        getObjectById: function (X) {
          if (M.w3) {
            return z(X);
          }
        },
        embedSWF: function (ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
          var X = {
              success: false,
              id: ah
            };
          if (M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
            w(ah, false);
            K(function () {
              ae += "";
              ag += "";
              var aj = {};
              if (af && typeof af === r) {
                for (var al in af) {
                  aj[al] = af[al];
                }
              }
              aj.data = ab;
              aj.width = ae;
              aj.height = ag;
              var am = {};
              if (ad && typeof ad === r) {
                for (var ak in ad) {
                  am[ak] = ad[ak];
                }
              }
              if (Z && typeof Z === r) {
                for (var ai in Z) {
                  if (typeof am.flashvars != D) {
                    am.flashvars += "&" + ai + "=" + Z[ai];
                  } else {
                    am.flashvars = ai + "=" + Z[ai];
                  }
                }
              }
              if (F(Y)) {
                var an = u(aj, am, ah);
                if (aj.id == ah) {
                  w(ah, true);
                }
                X.success = true;
                X.ref = an;
              } else {
                if (aa && A()) {
                  aj.data = aa;
                  P(aj, am, ah, ac);
                  return;
                } else {
                  w(ah, true);
                }
              }
              if (ac) {
                ac(X);
              }
            });
          } else {
            if (ac) {
              ac(X);
            }
          }
        },
        switchOffAutoHideShow: function () {
          m = false;
        },
        ua: M,
        getFlashPlayerVersion: function () {
          return {
            major: M.pv[0],
            minor: M.pv[1],
            release: M.pv[2]
          };
        },
        hasFlashPlayerVersion: F,
        createSWF: function (Z, Y, X) {
          if (M.w3) {
            return u(Z, Y, X);
          } else {
            return undefined;
          }
        },
        showExpressInstall: function (Z, aa, X, Y) {
          if (M.w3 && A()) {
            P(Z, aa, X, Y);
          }
        },
        removeSWF: function (X) {
          if (M.w3) {
            y(X);
          }
        },
        createCSS: function (aa, Z, Y, X) {
          if (M.w3) {
            v(aa, Z, Y, X);
          }
        },
        addDomLoadEvent: K,
        addLoadEvent: s,
        getQueryParamValue: function (aa) {
          var Z = j.location.search || j.location.hash;
          if (Z) {
            if (/\?/.test(Z)) {
              Z = Z.split("?")[1];
            }
            if (aa == null) {
              return L(Z);
            }
            var Y = Z.split("&");
            for (var X = 0; X < Y.length; X++) {
              if (Y[X].substring(0, Y[X].indexOf("=")) == aa) {
                return L(Y[X].substring(Y[X].indexOf("=") + 1));
              }
            }
          }
          return "";
        },
        expressInstallCallback: function () {
          if (a) {
            var X = c(R);
            if (X && l) {
              X.parentNode.replaceChild(l, X);
              if (Q) {
                w(Q, true);
                if (M.ie && M.win) {
                  l.style.display = "block";
                }
              }
              if (E) {
                E(B);
              }
            }
            a = false;
          }
        }
      };
    }();
}

module.exports = Recorder;

return module.exports;

}).call(this, require, exports, module);
var __old__recorder0 = window['Recorder'];
window['Recorder'] = __umodule__;

__umodule__.noConflict = function () {
  window['Recorder'] = __old__recorder0;
return __umodule__;
};
return __umodule__;
})
}).call(this, (typeof exports === 'object' ? global : window), (typeof exports === 'object' ? global : window));
define('recorder', ['recorder/recorder'], function (main) { return main; });

/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define('lodash/dist/lodash',[],function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

define('lodash', ['lodash/dist/lodash'], function (main) { return main; });

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
    'sig/initialize': function () {
      // Load the SWF for initializing recorder which sits by side of the module main js.
      var swfFilePath = recorderRequire.toUrl("recorder.swf");
      var df = when.defer();
      Recorder.initialize({
        swfSrc: swfFilePath,
        initialized: df.resolve
      });
      return df.promise;
    },

    'sig/start': function () {
      // TODO: Hack for 2.x to notify when this service has initialized.
      this.emit("sig/started");
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
  'troopjs-dom/component/widget',
  'when',
  './states',
  '../service/recorder'
], function (Widget, when, STATES, Service) {
  

  var CONFIGURATION = 'configuration';
  var PHASE = 'phase';

  // Handles the widget instantiation.
  return Widget.extend(function ($element, name, options) {
    this.configure(options || {});
  }, {
    'sig/start': function () {
      this.cls = this.$element.attr('class');
      var me = this;
      if(Service[PHASE] !== 'started'){
        Service.on('sig/started', function() {
          me.state(STATES.START);
        });
        me.state(STATES.DISABLE);
        return;
      }
      me.state(STATES.START);
    },

    record: function () {
      var me = this;
      var p = me.publish('recorder/record');
      p.then(function () {
        me.state(STATES.RECORDING);
      });
      p.otherwise(function () {
        me.state(STATES.START);
      });
      return p;
    },

    stopRecord: function () {
      return this.publish('recorder/stop');
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
    'hub/recorder/record/progress': function (ellapsed, volume) {
      var me = this;
      var state = me.state();
      if (state === STATES.RECORDING) {
        me.signal('progress', ellapsed);
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
      var p = me.publish('recorder/upload', options);
      p.then(function (data) {
        me.signal('upload', null, data);
      });
      p.otherwise(function (err) {
        me.signal('upload', err);
      });
      me.state(STATES.UPLOADING);
      return p;
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

