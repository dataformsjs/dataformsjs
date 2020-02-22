/**
 * DataFormsJS React Component <LazyLoad>
 *
 * This component provides an for code splitting of JSX templates on web pages
 * and it allows JavaScript and CSS to be downloaded dynamically only when needed.
 *
 * If using this component for [*.jsx] scripts then the script [jsxLoader.js] is required.
 *
 * Additionally this component can be used as a standard JavaScript class
 * for loading polyfills or scripts.
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* global jsxLoader, globalThis */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */
/* eslint no-prototype-builtins: "off" */

import React from 'react';

export default class LazyLoad extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isReady: false,
        };
    }

    componentDidMount() {
        this.loadScripts(this.props.scripts, this.props.loadScriptsInOrder).then(() => {
            this.setState({
                isReady: true,
            });
        });
    }

    /**
     * Load an array of JS, CSS, or JSX scripts and add them to the document header.
     * Scripts are downloaded only once so this function can be called multiple times
     * for the same script or scripts.
     *
     * This function is called internally when <LazyLoad> is used on a page but it
     * can also be called manually if creating an instance of this class in code.
     *
     * @param {string|array} urls Single URL's can use a string
     * @param {undefind|bool} loadScriptsInOrder  When `true` scripts will be loaded in sequential order
     * @return {Promise}
     */
    loadScripts(urls, loadScriptsInOrder) {
        // Load a CSS file and resolve promise once loaded or error
        function loadCss(url) {
            return new Promise(function(resolve) {
                // Check if file was already added
                var links = document.querySelectorAll('link');
                for (var n = 0, m = links.length; n < m; n++) {
                    if (links[n].rel === 'stylesheet' && links[n].getAttribute('href') === url) {
                        resolve();
                        return;
                    }
                }

                // Add file and wait till it loads
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.onload = resolve;
                link.onerror = function () {
                    console.error('Error loading CSS File: ' + url);
                    resolve();
                };
                link.href = url;
                document.head.appendChild(link);
            });
        }

        // Load a JS file
        function loadJs(url) {
            return new Promise(function(resolve) {
                // Check if file was already added
                var scripts = document.querySelectorAll('script');
                for (var n = 0, m = scripts.length; n < m; n++) {
                    if (scripts[n].getAttribute('src') === url) {
                        resolve();
                        return;
                    }
                }

                // Add file and wait till it loads
                var script = document.createElement('script');
                script.onload = resolve;
                script.onerror = function () {
                    console.error('Error loading JS File: ' + url);
                    resolve();
                };
                script.src = url;
                document.head.appendChild(script);
            });
        }

        // Load a JSX file
        function loadJsx(url) {
            return new Promise(function(resolve) {
                // Check if file was already added
                var scripts = document.querySelectorAll('script[data-src][data-compiler]');
                for (var n = 0, m = scripts.length; n < m; n++) {
                    if (scripts[n].getAttribute('data-src') === url) {
                        resolve();
                        return;
                    }
                }

                // Add file and wait till it is loaded by the [jsxLoader]
                var script = document.createElement('script');
                script.type = 'text/babel';
                script.setAttribute('src', url);
                document.head.appendChild(script);
                jsxLoader.loadScript(script).then(function() {
                    resolve();
                });
            });
        }

        // Convert a single string to an array otherwise validate for array
        if (typeof urls === 'string') {
            urls = [urls];
        } else if (!Array.isArray(urls)) {
            console.error('Invalid prop for <LazyLoad>, expected [scripts] to be a string or an array of strings. Check console.');
            console.log(urls);
            return new Promise(function(resolve) {
                resolve();
            });
        }

        // If the prop [loadScriptsInOrder === true] then return a promise
        // that runs a promise for each URL in sequential order.
        if (loadScriptsInOrder === true) {
            return new Promise(function(resolve) {
                var current = 0;
                var count = urls.length;

                function nextPromise() {
                    if (current === count) {
                        resolve();
                        return;
                    }

                    var url = urls[current];
                    current++;

                    if (url.endsWith('.js')) {
                        loadJs(url).then(nextPromise);
                    } else if (url.endsWith('.css')) {
                        loadCss(url).then(nextPromise);
                    } else if (url.endsWith('.jsx')) {
                        loadJsx(url).then(nextPromise);
                    } else {
                        console.error('Invalid Script for <LazyLoad>. Only scripts ending with [js, css, or jsx] can be used. Error URL: ' + url);
                        nextPromise();
                    }
                }

                nextPromise();
            });
        }

        // The option [loadScriptsInOrder] was not specified or set to `true` so
        // download all scripts asynchronously without waiting for scripts to complete.
        // The Promise will resovle once all scripts are downloaded (or have a download error).
        return new Promise(function(resolve) {
            const promises = [];
            for (let n = 0, m = urls.length; n < m; n++) {
                const url = urls[n];
                if (url.endsWith('.js')) {
                    promises.push(loadJs(url));
                } else if (url.endsWith('.css')) {
                    promises.push(loadCss(url));
                } else if (url.endsWith('.jsx')) {
                    promises.push(loadJsx(url));
                } else {
                    console.error('Invalid Script for <LazyLoad>. Only scripts ending with [js, css, or jsx] can be used. Error URL: ' + url);
                }
            }

            Promise.all(promises).then(function() {
                resolve();
            });
        });
    }

    /**
     * Dynamically load a single JavaScript file if needed. This function is intended
     * to work with pages that need to load Polyfills, however it will also work
     * standard JavaScript features as well. In general using <LazyLoad> with JSX
     * is recommended for most apps while this function can only be called if manually
     * creating an instance of this class.
     *
     * @param {*} condition  If [false] or [undefined] then the script will be downloaded
     * @param {string} url
     * @return {Promise}
     */
    loadPolyfill(condition, url) {
        function dowloadScript(success, error) {
            var script = document.createElement('script');
            script.onload = function() { success(); };
            script.onerror = function() {
                console.error('Error loading Script: ' + url);
                error();
            };
            script.src = url;
            document.head.appendChild(script);
        }

        if (condition === false || condition === undefined) {
            return new Promise(function(resolve, reject) {
                dowloadScript(resolve, reject);
            });
        } else {
            return new Promise(function(resolve) { resolve(); });
        }
    }

    render() {
        // Return child node from [isLoading] prop if defined otherwise return null
        if (!this.state.isReady) {
            if (this.props.isLoading) {
                return this.props.isLoading;
            }
            return null;
        }

        // Return <LazyLoad>{children}</LazyLoad>
        if (this.props.children) {
            return this.props.children;
        }

        // Return child node from [isLoaded]
        if (this.props.isLoaded) {
            // When a string is used custom props used on <LazyLoad> will be passed to the element being created.
            // A string would be used when <LazyLoad> is used to load a [*.jsx] script.
            if (typeof this.props.isLoaded === 'string') {
                var component = this.props.isLoaded;

                // Get props to pass to the component
                var elProps = {};
                for (var prop in this.props) {
                    if (this.props.hasOwnProperty(prop) && prop !== 'scripts' && prop !== 'isLoaded' && prop !== 'isLoading') {
                        elProps[prop] = this.props[prop];
                    }
                }

                // Find Component from global scope and create element.
                // The `globalThis` exists in modern browsers while older browsers will use `window`.
                if (window !== undefined && window[component] !== undefined) {
                    return React.createElement(window[component], elProps);
                } else if (globalThis !== undefined && globalThis[component] !== undefined) {
                    return React.createElement(globalThis[component], elProps);
                } else {
                    throw new TypeError('Component <LazyLoad isLoaded=' + JSON.stringify(component) + '> was not found. Check if your script is missing or has a compile error.');
                }
            }
            return this.props.isLoaded;
        }

        // Error, nothing defined to render
        throw new TypeError('Missing child nodes or the [isLoaded] property for a <LazyLoad> element.');
    }
}
