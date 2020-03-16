/**
 * DataFormsJS jsxLoader and compiler for React/JSX Code
 *
 * This script runs in a browser and converts JSX inside of <script type="text/babel">
 * elements to plain JavaScript. For modern Browsers [Chrome, Firefox, Edge, recent versions
 * of Safari, etc] a fast built-in compiler/transpiler is used to quickly convert JSX to JS.
 * For older browsers which typically are IE and older versions of Safari/iOS Polyfills are
 * and Babel Standalone are downloaded from a CDN and used to convert the JSX code to JS.
 *
 * The result of this script is that React/JSX can be used directly in production webpages
 * without having to use a large build process and dependancy download to convert JSX to JS.
 *
 * Documentation:
 *     https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.md
 *
 * The starting point and core structure of this compiler is based on (The Super Tiny Compiler)
 * [jamiebuilds/the-super-tiny-compiler]:
 *     https://git.io/compiler
 *     https://github.com/jamiebuilds/the-super-tiny-compiler
 *
 * [The Super Tiny Compiler] is a great project to review if you would like to understand
 * how compilers work.
 *
 * Copyright Conrad Sollitt and Authors. For full details of copyright
 * and license, view the LICENSE file that is distributed with DataFormsJS.
 *
 * @link     https://www.dataformsjs.com
 * @author   Conrad Sollitt (http://www.conradsollitt.com)
 * @license  MIT
 */

/* Validates with both [jshint] and [eslint] */
/* global Babel, Promise */
/* jshint evil:true */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* eslint no-prototype-builtins: "off" */

(function() {
    'use strict';

    // Enums "JavaScript Objects" for Tokens and AST.
    // This makes typing and searching for related code easier.
    var tokenTypes = {
        js: 0,
        e_start: 1,
        e_end: 2,
        e_prop: 3,
        e_value: 4,
        e_child_text: 5,
        e_child_js: 6,
        e_child_whitespace: 7,
        e_child_js_start: 8,
        e_child_js_end: 9,
    };
    var astTypes = {
        program: 0,
        js: 1,
        createElement: 2,
    };

    // Convert enum props to strings so they can be viewed easily from DevTools
    var enums = [tokenTypes, astTypes];
    for (var n = 0, m = enums.length; n < m; n++) {
        var obj = enums[n];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                obj[prop] = prop;
            }
        }
    }

    /**
     * [jsxLoader] Object
     *
     * If using optional properties or functions then the should be set immediately after this
     * script is defined and before the [DOMContentLoaded] event is triggered. Example:
     *
     * <script src="jsxLoader.js"></script>
     * <script>
     *     jsxLoader.polyfillUrl = '{url}';
     *     jsxLoader.needsPolyfill = true;
     *     jsxLoader.babelUrl = '{url}';
     *     jsxLoader.logCompileTime = true;
     *     jsxLoader.logCompileDetails = true;
     *     jsxLoader.evalCode = '{string}';
     *     jsxLoader.jsUpdates.push({ find:/regex_search/g, replace:'{string}' });
     *     jsxLoader.usePreact();
     *     jsxLoader.addBabelPolyfills = function() { '...'; }
     * </script>
     */
    var jsxLoader = {
        /**
         * Polyfill URL that is used for older browsers
         */
        polyfillUrl: 'https://polyfill.io/v3/polyfill.min.js?features=Array.from,Array.isArray,Array.prototype.find,Object.assign,Object.keys,URL,fetch,Promise,Promise.prototype.finally,String.prototype.endsWith,String.prototype.startsWith,String.prototype.includes,String.prototype.repeat,WeakSet,Symbol,Number.isInteger,String.prototype.codePointAt,String.fromCodePoint',

        /**
         * Babel URL and options used for older browsers.
         */
        babelUrl: 'https://unpkg.com/@babel/standalone@7.8.4/babel.min.js',
        babelOptions: { presets: ['es2015', 'react'] },

        /**
         * Print compile start, end, and time taken to console.
         */
        logCompileTime: false,

        /**
         * Print compile tokens and Abstract Syntax Tree (AST) to the console.
         * If `true` then `logCompileTime` will also run.
         */
        logCompileDetails: false,

        /**
         * Code here is evaluated when the [DOMContentLoaded()] event is triggered on
         * page load. If the code does not error then the internal compiler will be
         * used to convert JSX to JS, however if there is an error then Polyfills
         * and Babel will be downloaded and used.
         *
         * This property can be overwritten before the page finishes loading in case you would
         * like to target specific browsers or featuers. In the first example below Firefox, Edge
         * and other supported Browsers will use Babel because Chrome version 79 is being targeted.
         *
         *     window.jsxLoader.evalCode = "if (!navigator.userAgent.includes('Chrome/79')) throw 'Test';";
         *     window.jsxLoader.evalCode = "throw 'Test';";   // Use Babel for all Browsers
         *
         * This example (`class` check only) would allow jsxLoader to be used over Babel in old Safari
         * (example: iOS 9, iPad 2, iPhone 6 without upgrades, etc) however all JSX code would have to
         * use `var` instead of `const|let` and could not uses `=>` arrow functions.
         *
         *     window.jsxLoader.evalCode = 'class foo {}';
         *
         * For additional options and uses see the documentation (link near top of this file).
         */
        evalCode: 'class foo {}; let result = 1 + 1;',

        /**
         * Condition to check for if the browser needs a Polyfill or not
         */
        needsPolyfill: (Array.from && window.Promise && window.fetch && Promise.prototype.finally ? false : true),

        /**
         * When using the compiler from jsxLoader specific code for ES or node modules should
         * be updated or removed. This includes the `import React from 'react'` that used when
         * building React Apps from Node. When used in a Browser `React` will already exist as
         * a Global and `import` doesn't work with node modules. A calling app can modify this
         * list as needed for custom generated code to work.
         *
         * Additionally this can be used to support React Alternatives such as Preact and Rax.
         * See demos and Unit Tests for usage. When calling `jsxLoader.usePreact()` this list
         * will be automatically updated for Preact.
         */
        jsUpdates: [
            { find: /export function/g,             replace: 'function' },
            { find: /export default class/g,        replace: 'class' },
            { find: /import React from 'react';/g,  replace: '' },
            { find: /import React from"react";/g,   replace: '' },
        ],

        /**
         * This property gets set to either `true` or `false` depending on `evalCode`.
         * When `false` it means that Babel was downloaded and used to compile JSX.
         */
        isSupportedBrowser: null,

        /**
         * Maximum number of calls for recursive functions.
         */
        maxRecursiveCalls: 1000,

        /**
         * Setup the compiler to use Preact instead of React. This function is designed
         * for good compatability between React Components and Preact and it will allow
         * React Components to be used for Preact without defining an alias variable.
         *
         * If you are developing a Preact app that has different needs then this function
         * can be copied and easily modified for your app or site.
         *
         * See Preact demos for usage.
         */
        usePreact: function () {
            // Replace commonly used React API's with Preact once code is compiled
            this.jsUpdates.push({ find: /ReactDOM\.render/g, replace: 'preact.render' });
            this.jsUpdates.push({ find: /React\.Component/g, replace: 'preact.Component' });
            this.jsUpdates.push({ find: /React\.Fragment/g, replace: 'preact.Fragment' });
            this.jsUpdates.push({ find: /React\.createElement/g, replace: 'preact.createElement' });
            this.jsUpdates.push({ find: /React\.cloneElement/g, replace: 'preact.cloneElement' });
            this.jsUpdates.push({ find: /React\.createRef/g, replace: 'preact.createRef' });
            this.jsUpdates.push({ find: /onChange:/g, replace: 'onInput:' });
            this.jsUpdates.push({ find: /import preact from 'preact';/g, replace: '' });
            this.jsUpdates.push({ find: /import preact from"preact";/g, replace: '' });

            // Overwrite the Pollyfill function for React when Babel is used (IE 11, old iOS/Safari, etc)
            this.addBabelPolyfills = function() {
                window.exports = window;
                window.require = function(module) {
                    switch (module) {
                        case 'react':
                        case 'react-dom':
                            return window.preact;
                        default:
                            return window[module];
                    }
                };
            };
        },

        /**
         * Return `true|false` depending on whether or not all scripts can be loaded.
         * This can be used by the calling page to determine if scripts are still being
         * compiled. This would not commonly be used and is intended for Unit Testing.
         *
         * @return {bool}
         */
        hasPendingScripts: function () {
            var scripts = document.querySelectorAll('script[type="text/babel"]:not([data-added-to-page])');
            return (scripts.length > 0);
        },

        /**
         * Setup Event
         *
         * This gets called automatically when the page is loaded from the
         * [DOMContentLoaded] event or it can be called manually if needed.
         *
         * It will automatically download and load all <script type="text/babel"> scripts
         * in the order that they are defined on the page.
         */
        setup: function() {
            // Get all scripts and if there is only one then load it
            var scripts = document.querySelectorAll('script[type="text/babel"]:not([data-added-to-page])');
            if (scripts.length === 1) {
                jsxLoader.loadScript(scripts[0]);
                return;
            }

            // First asynchronously download all scripts that contain the [src] attribute.
            // Scripts that contain embedded content will run after all downloads finish.
            // The reason is inline scripts are expected to be dependent on the downloaded scripts.
            var promisesSrc = [];
            var scriptsNoSrc = [];
            Array.prototype.forEach.call(scripts, function(script) {
                if (script.src === '') {
                    scriptsNoSrc.push(script);
                } else {
                    promisesSrc.push(jsxLoader.loadScript(script));
                }
            });

            // After all [src] scripts are loaded then compile and include inline scripts.
            Promise.all(promisesSrc).finally(function () {
                scriptsNoSrc.forEach(function(script) {
                    jsxLoader.loadScript(script);
                });
            });
        },

        /**
         * Load a Babel Script and add it to the page as JavaScript. This function
         * gets called by [setup()] for each <script type="text/babel"> on the page.
         *
         * This function returns a Promise that resolves once the script has been
         * added to the page regardless of whether or not it had an error. This
         * behavior is used so that `Promise.all(scripts).finally()` logic can be
         * used when loading multiple scripts.
         *
         * @param {HTMLScriptElement} element
         * @return {Promise}
         */
        loadScript: function(element) {
            function addToPage(text, callback, src) {
                // Status
                var startTime = new Date();
                if (jsxLoader.logCompileTime || jsxLoader.logCompileDetails) {
                    console.log('='.repeat(80));
                    console.log(element.src);
                    console.log('Start time: ' + startTime.getTime());
                }

                // Compile the React/JSX Code to JavaScript
                var js, compilerType;
                try {
                    if (jsxLoader.isSupportedBrowser) {
                        js = jsxLoader.compiler.compile(text);
                        compilerType = 'jsxLoader';
                    } else {
                        js = Babel.transform(text, jsxLoader.babelOptions).code;
                        compilerType = 'Babel';
                    }
                } catch (e) {
                    console.log('-'.repeat(80));
                    console.log('Compile Error:');
                    console.log(element);
                    console.error(e);
                    element.setAttribute('data-error', e.toString());
                    js = null;
                }

                // Status
                if (jsxLoader.logCompileDetails) {
                    console.log(js);
                }
                if (jsxLoader.logCompileTime || jsxLoader.logCompileDetails) {
                    var endTime = new Date();
                    console.log('End time: ' + endTime.getTime());
                    console.log('Time taken (in milliseconds): ' + (endTime.getTime() - startTime.getTime()));
                }

                // Exit if there was a JavaScript compile error
                if (js === null) {
                    callback();
                    return;
                }

                // Find and replace contents in the generated JavaScript. See comments in the [jsUpdates] property
                jsxLoader.jsUpdates.forEach(function(item) {
                    js = js.replace(item.find, item.replace);
                });

                // Add compiled JS ad a new <script> on the page.
                // If the JSX compiles correctly but there is a JavaScript error then
                // it will not be caught here and the calling app would have to use
                // global error handling `window.onerror` to catch the error. Becauese
                // it is not caught [data-error] will not appear on the <script> element.
                var script = document.createElement('script');
                if (src) {
                    script.setAttribute('data-src', src);
                }
                script.setAttribute('data-compiler', compilerType);
                script.innerHTML = js;
                document.head.appendChild(script);
                callback();
            }

            return new Promise(function(resolve) {
                // Inline JSX in the <script> Element
                if (element.src === '') {
                    addToPage(element.innerHTML, resolve);
                    element.setAttribute('data-added-to-page', '');
                    return;
                }

                // Download JSX Source based on <script src="{url}">
                fetch(element.src, null, 'text/plain')
                .then(function(res) {
                    var status = res.status;
                    if ((status >= 200 && status < 300) || status === 304) {
                        return res.text();
                    } else {
                        throw new Error('Error loading data. Server Response Code: ' + status + ', Response Text: ' + res.statusText);
                    }
                })
                .then(function(text) {
                    addToPage(text, resolve, element.getAttribute('src'));
                    element.setAttribute('data-added-to-page', '');
                })
                .catch(function(error) {
                    console.error(error);
                    element.setAttribute('data-added-to-page', '');
                    element.setAttribute('data-error', error.toString());
                    resolve();
                });
            });
        },

        /**
         * Allow [babel-standalone] to use [import and exports] with JSX files.
         * This function is called automatically if needed when the page loads
         * if Babel is being used and it can be overwritten if needed by the
         * calling page before the `DOMContentLoaded` even runs.
         */
        addBabelPolyfills: function() {
            window.exports = window;
            window.require = function(module) {
                switch (module) {
                    case 'react':
                        return window.React;
                    case 'react-dom':
                        return window.ReactDOM;
                    default:
                        return window[module];
                }
            };
        },

        /**
         * Add a <script> element to the page from a URL. This function is used
         * internally for loading [polyfillUrl] and [babelUrl]. It only handles regular
         * JavaScript and not JSX. For JSX Scripts see the [loadScript()] function.
         *
         * @param {string} url
         * @param {function} callback
         */
        downloadScript: function(url, callback) {
            var script = document.createElement('script');
            script.onload = callback;
            script.onerror = function () {
                console.error('Error loading Script: ' + url);
                callback();
            };
            script.src = url;
            document.head.appendChild(script);
        },

        /**
         * Add additional polyfills needed for Babel that are not included from [polyfill.io].
         * This function can be overwritten by the app if needed. As of early 2020 [polyfill.io]
         * now includes the new `trimStart()` and `trimEnd()` functions, however Babel 7 uses
         * the non-standard `trimLeft()` and `trimRight()`.
         */
        addAdditionalPolyfills: function() {
            if (String.prototype.trimLeft === undefined) {
                String.prototype.trimLeft = function() {
                    return this.replace(/^\s+/, '');
                };
            }
            if (String.prototype.trimStart === undefined) {
                String.prototype.trimStart = String.prototype.trimLeft;
            }
            if (String.prototype.trimRight === undefined) {
                String.prototype.trimRight = function() {
                    return this.replace(/\s+$/, '');
                };
            }
            if (String.prototype.trimEnd === undefined) {
                String.prototype.trimEnd = String.prototype.trimRight;
            }
        },

        /**
         * Compiler for converting React/JSX Code to JavaScript. See comments
         * near the top of this file for info on the compiler.
         */
        compiler: {
            /**
             * Compile JSX to JS
             *
             * @param {string} input
             * @return {string}
             */
            compile: function(input) {
                // If code appears to be minimized return it without attempting to parse it.
                if (this.isMinimized(input)) {
                    return input;
                }

                // Compiler Step 1 - Remove Comments from the Code
                var newInput = this.removeComments(input);

                // Compiler Step 2 (Lexical Analysis) - Convert JSX Code to an array of tokens
                var tokens = this.tokenizer(newInput);
                if (jsxLoader.logCompileDetails) {
                    console.log(tokens);
                }

                // Compiler Step 3 (Syntactic Analysis) - Convert Tokens to an Abstract Syntax Tree (AST)
                var ast = this.parser(tokens, input);
                if (jsxLoader.logCompileDetails) {
                    console.log(ast);
                }

                // Compiler Step 4 (Code Generation) - Convert AST to Code
                var output = this.codeGenerator(ast, input);
                return output;
            },

            /**
             * Helper function to return line/column numbers when an error occurs
             *
             * @param {string} input
             * @param {int} pos
             * @return {string}
             */
            getTextPosition: function(input, pos) {
                var lines = input.substr(0, pos).split('\n');
                var lineCount = lines.length;
                var line = lines[lineCount - 1];
                return ' at Line #: ' + lineCount + ', Column #: ' + (line.length - 1) + ', Line: ' + line.trim();
            },

            /**
             * Check if the contents of a script appear to be minimized. If so it's likely JavaScript
             * and should not be processed by the compiler. This function can be overwritten by a calling
             * app if needed in case it has specific logic or comments are embedded in the minimized code.
             *
             * @param {string} input
             * @return {bool}
             */
            isMinimized: function(input) {
                if (input.indexOf('\n') === -1 && (input.indexOf('if(') !== -1 || input.indexOf('}render(){return') !== -1)) {
                    return true;
                }
                return false;
            },

            /**
             * Compiler Step 1 - Remove Comments from the Code
             *
             * All Code Comments are simply replaced with whitespace. This keeps the
             * original structure of the code and allows for error messages to report on
             * the correct line/column position of the error. Additionally it simplifies
             * lexical analysis because there is no need to tokenize the comments.
             *
             * Note - this function should handle most but may not handle all comments.
             * If new issues parsing are discovered this function needs to be updated to
             * better handle them.
             *
             * @param {string} input
             * @return {string}
             */
            removeComments: function(input) {
                var length = input.length,
                    newInput = new Array(length),
                    state = {
                        inCommentReact: false,
                        inCommentSingleLine: false,
                        inCommentMultiLine: false,
                        inStringSingleQuote: false,
                        inStringDoubleQuote: false,
                        inStringMultiLine: false,
                        elementCount: 0,
                        jsCount: 0,
                    },
                    current = 0,
                    char,
                    charNext;

                function peekNext() {
                    return (current < length-1 ? input[current+1] : null);
                }
                function peekNext2() {
                    return (current < length-2 ? input[current+1] + input[current+2] : null);
                }

                while (current < length) {
                    char = input[current];
                    if (state.inCommentReact) {
                        if (char === '*' && peekNext2() === '/}') {
                            newInput[current] = ' ';
                            newInput[current + 1] = ' ';
                            current += 2;
                            char = ' ';
                            state.inCommentReact = false;
                        } else if (char !== '\n') {
                            char = ' ';
                        }
                    } else if (state.inCommentSingleLine) {
                        if (char === '\n') {
                            state.inCommentSingleLine = false;
                        } else {
                            char = ' ';
                        }
                    } else if (state.inCommentMultiLine) {
                        if (char == '*' && peekNext() === '/') {
                            newInput[current] = ' ';
                            current++;
                            char = ' ';
                            state.inCommentMultiLine = false;
                        } else if (char !== '\n') {
                            char = ' ';
                        }
                    } else if (state.inStringDoubleQuote) {
                        if (char === '"' && input[current-1] !== '\\') {
                            state.inStringDoubleQuote = false;
                        }
                    } else if (state.inStringSingleQuote) {
                        if (char === "'" && input[current-1] !== '\\') {
                            state.inStringSingleQuote = false;
                        }
                    } else if (state.inStringMultiLine) {
                        if (char === '`') {
                            state.inStringMultiLine = false;
                        }
                    } else {
                        switch (char) {
                            case '{':
                                if (peekNext2() === '/*') {
                                    newInput[current] = ' ';
                                    newInput[current + 1] = ' ';
                                    current += 2;
                                    char = ' ';
                                    state.inCommentReact = true;
                                } else if (state.elementCount > 0) {
                                    state.jsCount++;
                                }
                                break;
                            case '}':
                                if (state.elementCount > 0 && state.jsCount > 0) {
                                    state.jsCount--;
                                }
                                break;
                            case '/':
                                if (state.elementCount === 0 || state.jsCount > 0) {
                                    var next = peekNext();
                                    state.inCommentSingleLine = (next === '/');
                                    if (!state.inCommentSingleLine) {
                                        state.inCommentMultiLine = (next === '*');
                                    }
                                    if (state.inCommentSingleLine || state.inCommentMultiLine) {
                                        newInput[current] = ' ';
                                        current++;
                                        char = ' ';
                                    }
                                }
                                break;
                            case '"':
                                state.inStringDoubleQuote = true;
                                break;
                            case "'":
                                state.inStringSingleQuote = true;
                                break;
                            case '`':
                                state.inStringMultiLine = true;
                                break;
                            case '<':
                                charNext = peekNext();
                                if (/[a-zA-Z]/.test(charNext) || charNext === '>') {
                                    state.elementCount++;
                                } else if (charNext === '/') {
                                    state.elementCount--;
                                }
                                break;
                            case '>':
                                if (input[current-1] === '/' && state.elementCount > 0) {
                                    state.elementCount--;
                                }
                                break;
                        }
                    }
                    newInput[current] = char;
                    current++;
                }
                return newInput.join('');
            },

            /**
             * Compiler Step 2 (Lexical Analysis) - Convert JSX Code to an array of tokens.
             *
             * Warning, this function is large, contains recursive private functions, and is
             * built for speed and features over readability. Using breakpoints with DevTools
             * is recommended when making changes and to better understand how the code works.
             *
             * @param {string} input
             * @return {array}
             */
            tokenizer: function(input) {
                var length = input.length,
                    current = 0,
                    tokens = [],
                    char,
                    pos,
                    loopCount = 0,
                    callCount = 0,
                    nextChar;

                // Private function to return the next React/JSX Element
                function nextElementPos() {
                    var c = current,
                        char,
                        state = {
                            inStringSingleQuote: false,
                            inStringDoubleQuote: false,
                            inStringMultiLine: false,
                        };

                    while (c < length - 1) {
                        char = input[c];
                        if (state.inStringDoubleQuote) {
                            if (char === '"' && input[c-1] !== '\\') {
                                state.inStringDoubleQuote = false;
                            }
                        } else if (state.inStringSingleQuote) {
                            if (char === "'" && input[c-1] !== '\\') {
                                state.inStringSingleQuote = false;
                            }
                        } else if (state.inStringMultiLine) {
                            if (char === '`') {
                                state.inStringMultiLine = false;
                            }
                        } else {
                            switch (char) {
                                case '"':
                                    state.inStringDoubleQuote = true;
                                    break;
                                case "'":
                                    state.inStringSingleQuote = true;
                                    break;
                                case '`':
                                    state.inStringMultiLine = true;
                                    break;
                                case '<':
                                    if (input[c + 1] !== ' ') {
                                        return c; // Start of Element found
                                    }
                                    break;
                            }
                        }
                        c++;
                    }
                    return null;
                }

                // Private function to return the next character without
                // incrementing the counter for the current position.
                function peekNext() {
                    return (current < length ? input[current] : null);
                }

                // Safety check to prevent endless loops on unexpected errors.
                // The number of loops should always be less that then string length.
                function loopCheck() {
                    loopCount++;
                    if (loopCount > length) {
                        throw new Error('Endless loop encountered in tokenizer');
                    }
                }

                function tokenizeElement(startPosition, firstNode) {
                    // Safety check
                    callCount++;
                    if (callCount > jsxLoader.maxRecursiveCalls) {
                        throw new Error('Call count exceeded in tokenizer. If you have a large JSX file that is valid you can increase them limit using the property `jsxLoader.maxRecursiveCalls`.');
                    }

                    // Current state of the processed text
                    var state = {
                        value: input[pos],
                        elementStack: 0,
                        elementState: [],
                        currentElementState: null,
                        inElement: true,
                        hasElementName: false,
                        elementClosed: false,
                        closeElement: false,
                        closingElement: false,
                        fatalError: false,
                        errorMessage: null,
                        addElementEnd: false,
                        breakLoop: false,
                        addChild: false,
                        addChar: true,
                        hasProp: false,
                        inValue: false,
                        inPropString: false,
                        propStringChar: null,
                        jsWithElement: false,
                    };

                    // Add text up to the matched position as JavaScript
                    if (current < startPosition && firstNode) {
                        tokens.push({
                            type: tokenTypes.js,
                            value: input.substring(current, startPosition),
                            pos: current,
                        });
                    }

                    // Tokenize the current React element. This loop inside the recusive function
                    // provides core logic to process characters one at a time. The loop from the main
                    // calling function is used to find JSX elements.
                    current = startPosition + 1;
                    while (current < length) {
                        loopCheck();

                        // Get the character at the current position in the input string
                        char = input[current];

                        // Handle character differently depending on if the current
                        // position is still inside the <element> `state.inElement`
                        // or if it is in a child/code section <element>{code}</element>
                        if (state.inElement) {
                            if (state.hasElementName) {
                                state.value += char;
                                current++;
                                state.breakLoop = false;
                                state.hasProp = false;
                                state.inValue = false;
                                while (current < length) {
                                    loopCheck();
                                    char = input[current];
                                    current++;
                                    if (state.inPropString && char !== state.propStringChar) {
                                        state.value += char;
                                        continue;
                                    }
                                    switch (char) {
                                        case '=':
                                            if (state.currentElementState.inPropJs) {
                                                break;
                                            }
                                            if (state.value.trim() !== '') {
                                                tokens.push({
                                                    type: tokenTypes.e_prop,
                                                    value: state.value,
                                                    pos: current,
                                                });
                                                state.hasProp = true;
                                                state.inValue = true;
                                            }
                                            state.value = '';
                                            nextChar = peekNext();
                                            if (nextChar === '"' || nextChar === "'") {
                                                state.inPropString = true;
                                                state.propStringChar = nextChar;
                                                current++;
                                            } else if (nextChar === '{') {
                                                state.currentElementState.inPropJs = true;
                                                state.currentElementState.jsPropBracketCount = 0;
                                                current++;
                                            }
                                            continue;
                                        case state.propStringChar:
                                            if (state.inPropString) {
                                                state.inPropString = false;
                                                tokens.push({
                                                    type: (state.hasProp ? tokenTypes.e_value : tokenTypes.e_prop),
                                                    value: JSON.stringify(state.value),
                                                    pos: current,
                                                });
                                                state.inValue = false;
                                                state.hasProp = false;
                                                state.value = '';
                                                continue;
                                            }
                                            break;
                                        case '}':
                                            if (state.currentElementState.inPropJs) {
                                                if (state.currentElementState.jsPropBracketCount === 0) {
                                                    state.currentElementState.inPropJs = false;
                                                    if (state.value.trim() !== '') {
                                                        if (state.jsWithElement) {
                                                            tokens.push({
                                                                type: tokenTypes.e_child_js_end,
                                                                value: state.value,
                                                                pos: current,
                                                            });
                                                            state.jsWithElement = false;
                                                        } else {
                                                            if (state.value.trim() !== '>') {
                                                                tokens.push({
                                                                    type: tokenTypes.e_value,
                                                                    value: state.value,
                                                                    pos: current,
                                                                });
                                                                state.hasProp = false;
                                                            }
                                                        }
                                                    }
                                                    state.inValue = false;
                                                    state.value = '';
                                                    continue;
                                                } else {
                                                    state.currentElementState.jsPropBracketCount--;
                                                }
                                            }
                                            break;
                                        case ' ':
                                        case '\t':
                                        case '\r':
                                        case '\n':
                                            if (!state.currentElementState.inPropJs) {
                                                if (state.value.trim() !== '') {
                                                    tokens.push({
                                                        type: (state.hasProp ? tokenTypes.e_value : tokenTypes.e_prop),
                                                        value: state.value,
                                                        pos: current,
                                                    });
                                                }
                                                state.inValue = false;
                                                state.value = '';
                                            }
                                            break;
                                        case '/':
                                            if (peekNext() === '>') {
                                                current--;
                                                state.breakLoop = true;
                                                state.hasElementName = false;
                                            }
                                            break;
                                        case '<':
                                            if (state.currentElementState.inPropJs && peekNext() !== ' ') {
                                                if (state.value.trim() !== '') {
                                                    tokens.push({
                                                        type: tokenTypes.e_child_js_start,
                                                        value: state.value,
                                                        pos: current,
                                                    });
                                                    state.value = '';
                                                    state.jsWithElement = true;
                                                }
                                                current--;
                                                tokenizeElement(current, false);
                                                char = '';
                                                if (state.jsWithElement) {
                                                    current++;
                                                }
                                            }
                                            break;
                                        case '{':
                                            if (state.currentElementState.inPropJs) {
                                                state.currentElementState.jsPropBracketCount++;
                                            }
                                            break;
                                        case '>':
                                            if (!state.currentElementState.inPropJs) {
                                                state.breakLoop = true;
                                                state.hasElementName = false;
                                            }
                                            break;
                                    }
                                    if (state.breakLoop) {
                                        if (state.value === '/' && char === '>' && tokens[tokens.length-1].type === tokenTypes.e_start) {
                                            tokens.push({
                                                type: tokenTypes.e_end,
                                                value: state.value + char,
                                                pos: current,
                                            });
                                            if (state.elementStack <= 1) {
                                                if (peekNext() !== '}') {
                                                    current--;
                                                }
                                                return;
                                            } else {
                                                state.elementStack--;
                                                state.elementState.pop();
                                                state.currentElementState = (state.elementStack === 0 ? null : state.elementState[state.elementStack - 1]);
                                            }
                                        } else if (char === '>' && (/^[a-zA-Z1-9-_]*$/.test(state.value) || /{\.\.\.(.+)}/.test(state.value)) && tokens[tokens.length-1].type === tokenTypes.e_start) {
                                            tokens.push({
                                                type: tokenTypes.e_prop,
                                                value: state.value,
                                                pos: current,
                                            });
                                        } else if (state.value.trim() !== '') {
                                            console.log(tokens);
                                            throw new Error('Unhandled character in element properties: `' + state.value + '`' + jsxLoader.compiler.getTextPosition(input, current));
                                        }
                                        state.value = '';
                                        state.breakLoop = false;
                                        break;
                                    }
                                    state.value += char;
                                }
                            }
                            switch (char) {
                                case '/':
                                    if (state.value === '' || state.value === '<') {
                                        state.closingElement = true;
                                    } else if (peekNext() === '>') {
                                        state.closeElement = true;
                                        state.inElement = false;
                                        state.addElementEnd = true;
                                    } else {
                                        state.fatalError = true;
                                        state.errorMessage = 'Error found a "/" character in element [' + state.value + '] but not closing "/>"' + jsxLoader.compiler.getTextPosition(input, current);
                                    }
                                    break;
                                case '>':
                                    state.closeElement = true;
                                    state.inElement = false;
                                    break;
                                case ' ':
                                case '\t':
                                case '\n':
                                case '\r':
                                    state.hasElementName = true;
                                    state.closeElement = true;
                                    break;
                            }
                        } else {
                            switch (char) {
                                case '}':
                                    if (state.currentElementState.inJs) {
                                        if (state.currentElementState.jsBracketCount === 0) {
                                            state.currentElementState.inJs = false;
                                            state.currentElementState.closeJs = true;
                                            state.addChild = true;
                                            state.addChar = false;
                                        } else {
                                            state.currentElementState.jsBracketCount--;
                                        }
                                    }
                                    break;
                                case '{':
                                    if (state.currentElementState.inJs) {
                                        state.currentElementState.jsBracketCount++;
                                    } else {
                                        state.currentElementState.inJs = true;
                                        state.currentElementState.jsBracketCount = 0;
                                        state.addChild = true;
                                        state.addChar = false;
                                    }
                                    break;
                                case '<':
                                    if (peekNext() !== ' ') {
                                        state.addChild = true;
                                        state.inElement = true;
                                    }
                                    break;
                            }
                            if (state.addChild) {
                                if (state.value.trim() === '') {
                                    if (state.value !== '') {
                                        tokens.push({
                                            type: tokenTypes.e_child_whitespace,
                                            value: state.value,
                                            pos: current,
                                        });
                                    }
                                } else {
                                    var isJS = (state.currentElementState.closeJs || (state.currentElementState.inJs && state.currentElementState.jsBracketCount > 0) || (state.currentElementState.inJs && state.inElement));
                                    tokens.push({
                                        type: (isJS ? tokenTypes.e_child_js : tokenTypes.e_child_text),
                                        value: state.value,
                                        pos: current,
                                    });
                                }
                                state.addChild = false;
                                state.value = '';
                                if (state.currentElementState.closeJs) {
                                    state.currentElementState.closeJs = false;
                                    state.currentElementState.inJs = false;
                                }
                            }
                        }

                        // Should the current element be closed?
                        if (state.closeElement) {
                            if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
                                state.value += char;
                            }
                            if (state.closingElement) {
                                tokens.push({
                                    type: tokenTypes.e_end,
                                    value: state.value,
                                    pos: current,
                                });
                                state.hasElementName = false;
                                state.elementStack--;
                                state.elementState.pop();
                                state.currentElementState = (state.elementStack === 0 ? null : state.elementState[state.elementStack - 1]);
                                if (state.elementStack === 0) {
                                    state.elementClosed = true;
                                }
                            } else {
                                if (state.value === '>') {
                                    current--;
                                } else {
                                    tokens.push({
                                        type: tokenTypes.e_start,
                                        value: state.value,
                                        pos: current,
                                    });
                                    state.elementStack++;
                                    state.currentElementState = {
                                        inJs: false,
                                        jsBracketCount: 0,
                                        closeJs: false,
                                        inPropJs: false,
                                        jsPropBracketCount: 0,
                                    };
                                    state.elementState.push(state.currentElementState);
                                }
                            }
                            state.value = '';
                            state.closeElement = false;
                            state.closingElement = false;
                            if (state.addElementEnd) {
                                tokens.push({
                                    type: tokenTypes.e_end,
                                    value: state.value,
                                    pos: null,
                                });
                                state.addElementEnd = false;
                            }
                        } else {
                            if (state.addChar) {
                                state.value += char;
                            }
                            state.addChar = true;
                        }

                        // Exit nested element loop once the element has been closed
                        if (state.elementClosed) {
                            break;
                        }

                        // Next character
                        current++;
                    } // End of `while (current < length)` loop in the recursive `tokenizeElement()` function

                    // Was there a fatal error in the loop?
                    if (state.fatalError) {
                        console.log(tokens);
                        throw new Error(state.errorMessage);
                    }
                }

                // Main loop to find and process JSX elements inside of plain JS
                while (current < length) {
                    loopCheck();

                    // Find the next React Element and add remaining js once all elements are found
                    pos = nextElementPos();
                    if (pos === null) {
                        tokens.push({
                            type: tokenTypes.js,
                            value: input.substring(current, length),
                            pos: current,
                        });
                        break;
                    }

                    tokenizeElement(pos, true);
                    current++;
                }
                return tokens;
            },

            /**
             * Compiler Step 3 (Syntactic Analysis) - Convert Tokens to an Abstract Syntax Tree (AST)
             *
             * @param {array} tokens
             * @param {string} input Original input is passed to allow for helpfull error messages
             * @return {object}
             */
            parser: function(tokens, input) {
                var current = 0,
                    ast = {
                        type: astTypes.program,
                        body: [],
                        pos: null,
                    },
                    callCount = 0,
                    tokenCount = tokens.length;

                function nextTokenType() {
                    if (current < tokenCount) {
                        return tokens[current].type;
                    }
                    return null;
                }

                function walk(stackCount) {
                    callCount++;
                    if (callCount > jsxLoader.maxRecursiveCalls) {
                        throw new Error('Call count exceeded in parser. If you have a large JSX file that is valid you can increase them limit using the property `jsxLoader.maxRecursiveCalls`.');
                    }

                    var token = tokens[current];
                    current++;

                    if (token.type === tokenTypes.js) {
                        return {
                            type: astTypes.js,
                            value: token.value,
                            pos: token.pos,
                            stackCount: stackCount,
                        };
                    }

                    if (token.type === tokenTypes.e_start) {
                        var elName = token.value.replace('<', '').replace('/', '').replace('>', '');
                        if (elName === '') {
                            elName = 'React.Fragment';
                        }
                        var firstChar = elName[0];
                        var node = {
                            type: astTypes.createElement,
                            name: elName,
                            isClass: ((firstChar >= 'A' && firstChar <= 'Z') || elName.indexOf('.') !== -1),
                            props: [],
                            children: [],
                            pos: token.pos,
                            stackCount: stackCount,
                        };

                        var breakLoop = false;
                        var value;
                        while (current < tokenCount) {
                            token = tokens[current];
                            current++;
                            switch (token.type) {
                                case tokenTypes.e_prop:
                                    var prop = {
                                        name: token.value,
                                        value: null,
                                        pos: token.pos,
                                    };
                                    var nextNodeType = nextTokenType();
                                    switch (nextNodeType) {
                                        case tokenTypes.e_value:
                                        case tokenTypes.js:
                                            prop.value = tokens[current].value;
                                            current++;
                                            break;
                                        case tokenTypes.e_start:
                                            prop.value = walk(stackCount + 1);
                                            break;
                                    }
                                    if (prop.name.trim() !== '') {
                                        node.props.push(prop);
                                    }
                                    break;
                                case tokenTypes.e_child_js:
                                    if (token.value.trim() !== '') {
                                        value = token.value.trim();
                                        if (value.indexOf('{') === 0) {
                                            value = value.substr(1);
                                        }
                                        if (value.substr(value.length - 1, 1) === '}') {
                                            value = value.substr(0, value.length-1);
                                        }
                                        node.children.push({
                                            type: token.type,
                                            value: value,
                                            pos: token.pos,
                                        });
                                    }
                                    break;
                                case tokenTypes.e_child_js_start:
                                case tokenTypes.e_child_js_end:
                                    node.children.push({
                                        type: token.type,
                                        value: value,
                                        pos: token.pos,
                                    });
                                    break;
                                case tokenTypes.e_child_text:
                                    if (token.value.trim() !== '') {
                                        node.children.push({
                                            type: token.type,
                                            value: token.value,
                                            pos: token.pos,
                                        });
                                    }
                                    break;
                                case tokenTypes.e_child_whitespace:
                                    node.children.push({
                                        type: token.type,
                                        value: token.value,
                                        pos: token.pos,
                                    });
                                    break;
                                case tokenTypes.e_end:
                                    var endName = token.value.replace('<', '').replace('/', '').replace('>', '');
                                    if (endName !== node.name && endName !== '') {
                                        throw new Error('Found closing element [' + endName + '] that does not match opening element [' + node.name + '] from Token # ' + token.index + jsxLoader.compiler.getTextPosition(input, token.pos));
                                    }
                                    breakLoop = true;
                                    break;
                                case tokenTypes.e_start:
                                    // Handle nested elements here with a recusive call to walk()
                                    current--;
                                    node.children.push({
                                        type: tokenTypes.e_start,
                                        value: walk(stackCount + 1),
                                        pos: token.pos,
                                    });
                                    break;
                                default:
                                    console.log(tokens);
                                    console.log(ast);
                                    throw new Error('Tokens are out of order 1: [' + token.type + '], Token #: ' + token.index + jsxLoader.compiler.getTextPosition(input, token.pos));
                            }
                            if (breakLoop) {
                                break;
                            }
                        }

                        return node;
                    }

                    throw new Error('Tokens are out of order 2: [' + token.type + '], Token #: ' + token.index + jsxLoader.compiler.getTextPosition(input, token.pos));
                } // walk()

                for (var n = 0; n < tokenCount; n++) {
                    tokens[n].index = n;
                }

                while (current < tokenCount) {
                    ast.body.push(walk(0));
                }
                return ast;
            },

            /**
             * Compiler Step 4 (Code Generation) - Convert AST to Code.
             *
             * Often compilers will include additional steps in-between the original AST
             * and Code Generation such as converting to a different AST format or optimizing.
             * For example the [The Super Tiny Compiler] which this script used as a starting
             * point includes extra functions `traverser()` and `transformer()`. This function
             * combines the steps because most AST nodes are kept (only some whitespace is
             * dropped and the logic is relatively simple). By combining transformation and
             * code generation only a single iteration is needed over the original AST is
             * performed and only one copy of the AST is made.
             *
             * @param {object} ast
             * @param {string} input
             * @return {string}
             */
            codeGenerator: function(ast, input) {
                // Default to use `React.createElement`, however if a code hint for
                // Babel is found such as `// @jsx preact.createElement` then use
                // the `createElement()` function from the code hint.
                var createElement = 'React.createElement';
                var regex = /(\/\/|\/\*|\/\*\*)\s+@jsx\s+([a-zA-z.]+)/gm;
                var match = regex.exec(input);
                if (match) {
                    createElement = match[2];
                }
                return generateCode(ast);

                // Recursive private function for generating code
                function generateCode(node, skipIndent) {
                    switch (node.type) {
                        case astTypes.program:
                            return node.body.map(generateCode).join('');
                        case astTypes.js:
                            return node.value;
                        case astTypes.createElement:
                            // Start of Element
                            var js = createElement + '(' + (node.isClass ? node.name : JSON.stringify(node.name)) + ', ';
                            if (node.stackCount > 0) {
                                if (skipIndent !== true) {
                                    js = '\n' + ' '.repeat(8) + ' '.repeat(node.stackCount * 4) + js;
                                } else {
                                    js = ' ' + js;
                                }
                            }
                            // Add Element Props
                            var propCount = node.props.length;
                            var propName;
                            var propJs = [];
                            if (propCount === 0) {
                                js += 'null';
                            } else {
                                js += '{';
                                for (var n = 0; n < propCount; n++) {
                                    var propValue = node.props[n].value;
                                    if (propValue === null) {
                                        propValue = 'true';
                                    } else if (typeof propValue !== 'string') {
                                        propValue = generateCode(propValue, true);
                                    }
                                    propName = node.props[n].name.trim();
                                    if (propName.indexOf('-') !== -1) {
                                        propName = JSON.stringify(propName);
                                    }
                                    if (propValue === 'true' && /{\.\.\.(.+)}/.test(propName)) {
                                        // Handle spread operators: `{...props}`
                                        propJs.push(propName.substr(0, propName.length - 1).substr(1) + (n === propCount - 1 ? '' : ', '));
                                    } else {
                                        propJs.push(propName + ': ' + propValue + (n === propCount - 1 ? '' : ', '));
                                    }
                                }
                                var propTextLen = propJs.reduce(function(total, item) {
                                    return total += item.length;
                                }, 0);
                                if (propTextLen > 80) {
                                    var propIndent = '\n';
                                    if (skipIndent !== true) {
                                        propIndent += ' '.repeat(12) + ' '.repeat(node.stackCount * 4);
                                    }
                                    js += propIndent + propJs.join(propIndent);
                                } else {
                                    js += propJs.join('');
                                }
                                js += '}';
                            }
                            // Add Element Children
                            var childJs = [];
                            var hasChildText = false;
                            var hasChildJs = false;
                            var hasChildEl = false;
                            var startsWithJs = false;
                            var childCount = node.children.length;
                            var lastIndex = null;
                            var childElCount = 0;
                            var lastElAddedAsJs = false;
                            var nodeValue;
                            var allChildJsContainsExpressions = true;
                            var m;
                            // First see what types of child nodes exist
                            for (m = 0; m < childCount; m++) {
                                switch (node.children[m].type) {
                                    case tokenTypes.e_child_js:
                                    case tokenTypes.e_child_js_start:
                                        hasChildJs = true;
                                        nodeValue = node.children[m].value;
                                        // This is not an exact match based on JS syntax but rather
                                        // a quick check that will work for most JSX code.
                                        if (typeof nodeValue === 'string' &&
                                            nodeValue.indexOf('(') === -1 &&
                                            nodeValue.indexOf(')') === -1
                                        ) {
                                            allChildJsContainsExpressions = false;
                                        }
                                        break;
                                    case tokenTypes.e_child_text:
                                        hasChildText = true;
                                        break;
                                    case tokenTypes.e_start:
                                        hasChildEl = true;
                                        childElCount++;
                                        break;
                                    case tokenTypes.e_child_whitespace:
                                    case tokenTypes.e_child_js_end:
                                        break; // Ignore, no need to count or track
                                    default:
                                        throw new Error('Unhandled child type codeGenerator(): ' + node.children[m].type);
                                }
                            }
                            for (m = 0; m < childCount; m++) {
                                switch (node.children[m].type) {
                                    case tokenTypes.e_child_js:
                                    case tokenTypes.e_child_js_start:
                                        if (lastElAddedAsJs) {
                                            childJs[childJs.length-1] += node.children[m].value;
                                        } else {
                                            childJs.push(node.children[m].value);
                                            if (!startsWithJs && childJs.length === 1) {
                                                startsWithJs = true;
                                            }
                                        }
                                        break;
                                    case tokenTypes.e_child_text:
                                        nodeValue = node.children[m].value;
                                        if (nodeValue.indexOf('&') !== -1) {
                                            // Use the browser DOM to convert from HTML to Text if the node might contain
                                            // HTML encoded characters. Example: [&amp;] or [&#039;]
                                            var tmp = document.createElement('div');
                                            tmp.innerHTML = nodeValue;
                                            nodeValue = tmp.textContent;
                                        }
                                        if (childCount === 1) {
                                            childJs.push(JSON.stringify(nodeValue));
                                        } else if (m === childCount - 1) {
                                            childJs.push(JSON.stringify(nodeValue.replace(/\s+$/, ''))); // trimEnd();
                                        } else if (m === 0) {
                                            childJs.push(JSON.stringify(nodeValue.replace(/^\s+/, ''))); // trimStart()
                                        } else {
                                            childJs.push(JSON.stringify(nodeValue));
                                        }
                                        break;
                                    case tokenTypes.e_child_js_end:
                                        childJs.push(node.children[m].value);
                                        break;
                                    case tokenTypes.e_start:
                                        var skipElIndent = false;
                                        var addedAsJs = false;
                                        if (lastIndex !== null) {
                                            skipElIndent = (node.children[lastIndex].type === tokenTypes.e_child_js);
                                        }
                                        if (skipElIndent) {
                                            var lastValue = node.children[lastIndex].value.trim();
                                            if (lastValue.endsWith('&&') || lastValue.endsWith('?') || lastValue.endsWith('(') || lastValue.endsWith(':') || lastValue.endsWith(' return')) {
                                                childJs[childJs.length-1] += generateCode(node.children[m].value, skipElIndent);
                                                addedAsJs = true;
                                                childElCount--;
                                                lastElAddedAsJs = true;
                                            }
                                        }
                                        if (!addedAsJs) {
                                            childJs.push(generateCode(node.children[m].value, skipElIndent));
                                            lastElAddedAsJs = false;
                                        }
                                        break;
                                    case tokenTypes.e_child_whitespace:
                                        if ((hasChildJs || hasChildText) && !(m === 0 || m === (childCount-1))) {
                                            childJs.push(JSON.stringify(node.children[m].value));
                                            lastElAddedAsJs = false;
                                        }
                                        continue;
                                    default:
                                        throw new Error('Unhandled child type codeGenerator(): ' + node.children[m].type);
                                }
                                lastIndex = m; // Skipped when [e_child_whitespace]
                            }
                            if (childJs.length > 0) {
                                if (!hasChildText && hasChildJs && hasChildEl && startsWithJs && childElCount === 1 && allChildJsContainsExpressions) {
                                    js += ', ' + childJs.join('');
                                } else {
                                    js += ', ' + childJs.join(', ');
                                }
                            }
                            js += ')';
                            return js;
                        default:
                            throw new TypeError('Unhandled AST type in codeGenerator: ' + node.type);
                    }
                }
            },
        },
    };

    /**
     * Assign [jsxLoader] as a global property to the [window] object
     */
    window.jsxLoader = jsxLoader;

    /**
     * Once content has loaded run [setup()] or download Polyfills and Babel then run [setup()].
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Check Environment
        // Create a new function and call the code from `evalCode` to check the browser
        // supports the `class` keyword along with `let` and `const`. If so then the compiler
        // from [jsxLoader] will be used, otherwise Babel will be used.
        try {
            new Function('"use strict";' + jsxLoader.evalCode)();
            jsxLoader.isSupportedBrowser = true;
        } catch (e) {
            jsxLoader.isSupportedBrowser = false;
        }

        // Download, Compile JSX, and add as JavaScript to the page.
        if (jsxLoader.isSupportedBrowser && jsxLoader.needsPolyfill === false) {
            // Modern Browsers
            jsxLoader.setup();
        } else if (jsxLoader.isSupportedBrowser) {
            // Modern Browsers that evaluate `evalCode` but are missing needed features.
            // For example UC Browser (as of early 2020) supports Promises but is missing
            // `Promise.prototype.finally`.
            jsxLoader.downloadScript(jsxLoader.polyfillUrl, function() {
                jsxLoader.addAdditionalPolyfills();
                jsxLoader.setup();
            });
        } else {
            // Legacy Browsers - use Babel.
            // This includes IE 11 and old versions of Safari.
            jsxLoader.addBabelPolyfills();
            jsxLoader.downloadScript(jsxLoader.polyfillUrl, function() {
                jsxLoader.addAdditionalPolyfills();
                jsxLoader.downloadScript(jsxLoader.babelUrl, function() {
                    jsxLoader.setup();
                });
            });
        }
    });
})();