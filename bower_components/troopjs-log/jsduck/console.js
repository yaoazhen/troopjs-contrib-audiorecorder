/**
 * The console interface describes the API of the client's debugging console
 * (e.g. the [Web Console](https://developer.mozilla.org/en-US/docs/Tools/Web_Console) in Firefox).
 * The specifics of how it works vary from client to client, but there is a _de facto_ set of features that are
 * typically provided.
 *
 * ## Outputting text to the console
 *
 * The most frequently-used feature of the console is logging of text and other data.
 * There are four categories of output you can generate, using the {@link #log}, {@link #info}, {@link #warn},
 * and {@link #error} methods. Each of these results in output that's styled differently in the log,
 * and you can use the filtering controls provided by your client to only view the kinds of output that interest you.
 *
 * There are two ways to use each of the output methods; you can simply pass in a list of objects whose
 * string representations get concatenated into one string then output to the console, or you can pass in a string
 * containing zero or more substitution strings followed by a list of the objects with which to replace them.
 *
 * ### Writing a single object
 *
 * The simplest way to use the logging methods is to output a single object:
 *
 *     var someObject = { str: "Some text", id: 5 };
 *     logger.log(someObject);
 *
 * The output looks something like this:
 *
 *     [09:27:13.475] ({str:"Some text", id:5})
 *
 * ### Writing multiple objects
 *
 * You can also output multiple objects by simply listing them when calling the logging method, like this:
 *
 *     var car = "Dodge Charger";
 *     var someObject = {str:"Some text", id:5};
 *     console.info("My first car was a", car, ". The object is: ", someObject);
 *
 * This output will look like this:
 *
 *     [09:28:22.711] My first car was a Dodge Charger . The object is:  ({str:"Some text", id:5})
 *
 * ### Using string substitutions
 *
 * When passing a string to one of the console methods that accepts a string, you may use these substitution strings:
 *
 * - `%o`         : Outputs a hyperlink to a JavaScript object. Clicking the link opens an inspector.
 * - `%d` or `%i` : Outputs an integer. Formatting is not yet supported.
 * - `%s`         : Outputs a string.
 * - `%f`         : Outputs a floating-point value. Formatting is not yet supported.
 *
 * Each of these pulls the next argument after the format string off the parameter list. For example:
 *
 *     for (var i=0; i<5; i++) {
	 *       console.log("Hello, %s. You've called me %d times.", "Bob", i+1);
	 *     }
 *
 * The output looks like this:
 *
 *     [13:14:13.481] Hello, Bob. You've called me 1 times.
 *     [13:14:13.483] Hello, Bob. You've called me 2 times.
 *     [13:14:13.485] Hello, Bob. You've called me 3 times.
 *     [13:14:13.487] Hello, Bob. You've called me 4 times.
 *     [13:14:13.488] Hello, Bob. You've called me 5 times.
 *
 * ## Timers
 *
 * In order to calculate the duration of a specific operation, you can use timers.
 * To start a timer, call the {@link #time} method, giving it a name as only parameter.
 * To stop the timer, and to get the elapsed time in miliseconds, just call the {@link #timeEnd} method,
 * again passing the timer's name as the parameter.
 * Up to 10,000 timers can run simultaneously on a given page.
 *
 * For example, given this code:
 *
 *     console.time("answer time");
 *     alert("Click to continue");
 *     console.timeEnd("answer time");
 *
 * will log the time needed by the user to discard the alert box:
 *
 *     13:50:42.246: answer time: timer started
 *     13:50:43.243: answer time: 998ms
 *
 * Notice that the timer's name is displayed both when the timer is started and when it's stopped.
 *
 * ## Stack traces
 *
 * The console also supports outputting a stack trace; this will show you the call path taken to reach the point at
 * which you call {@link #trace}. Given code like this:
 *
 *     foo();
 *       function foo() {
	 *         function bar() {
	 *           console.trace();
	 *         }
	 *       bar();
	 *     }
 *
 * The output in the console looks something like this:
 *
 *     console.trace():   main.js:46
 *       bar()           main.js:46
 *       foo()           main.js:48
 *       <anonymous>     main.js:42
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://developer.mozilla.org/en-US/docs/Web/API/console">MDN</a>
 * and is available under <a href="http://creativecommons.org/licenses/by-sa/2.0/">Creative Commons: Attribution-Sharealike license</a>.
 * </div>
 *
 * @class log.console
 * @interface
 */

/**
 * Writes a message and stack trace to the log if first argument is false
 * @method assert
 * @param {Boolean} expression Conditional expression
 * @param {Object|String} payload Initial payload
 * @param {Object...} [obj] Supplementary payloads
 *
 * - If `payload` is of type `Object` the string representations of each of these objects are appended together in the order listed and output.
 * - If `payload` is of type `String` these are JavaScript objects with which to replace substitution strings within payload.
 */

/**
 * Writes a message to the log with level `debug`
 * @method debug
 * @inheritdoc #log
 * @deprecated An alias for {@link #log}. This was added to improve compatibility with existing sites already using `debug()`. However, you should use {@link #log} instead.
 */

/**
 * Displays an interactive list of the properties of the specified JavaScript object. The output is presented as a hierarchical listing that let you see the contents of child objects.
 * @method dir
 * @param {Object} object A JavaScript object whose properties should be output
 */

/**
 * Writes a message to the log with level `error`
 * @method error
 * @inheritdoc #log
 */

/**
 * Writes a message to the log with level `info`.
 * @method info
 * @inheritdoc #log
 */

/**
 * Writes a message to the log with level `log`
 * @method log
 * @param {Object|String} payload Initial payload
 * @param {Object...} [obj] Supplementary payloads
 *
 * - If `payload` is of type `Object` the string representations of each of these objects are appended together in the order listed and output.
 * - If `payload` is of type `String` these are JavaScript objects with which to replace substitution strings within payload.
 */

/**
 * Starts a timer you can use to track how long an operation takes. You give each timer a unique name, and may have up to 10,000 timers running on a given page.
 * When you call {@link #timeEnd} with the same name, the log will output the time, in milliseconds, that elapsed since the timer was started.
 * @method time
 * @param {String} timerName The name to give the new timer. This will identify the timer; use the same name when calling {@link #timeEnd} to stop the timer and get the time written to the log
 */

/**
 * Stops a timer that was previously started by calling {@link #time}.
 * @method timeEnd
 * @param {String} timerName The name of the timer to stop. Once stopped, the elapsed time is automatically written to the log
 */

/**
 * Outputs a stack trace to the log.
 * @method trace
 */

/**
 * Writes a message to the log with level `warn`
 * @method warn
 * @inheritdoc #log
 */
