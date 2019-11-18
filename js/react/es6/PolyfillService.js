/**
 * React Component <PolyfillService>
 * 
 * This component is intended to be used as a root component when creating a
 * React Web-based App that supports IE and Older Mobile Devices.
 * 
 * The core DataFormsJS <JsonData> Component uses [fetch()] and various
 * DataFormsJS Components use features supported by this Polyfill.
 * If using DataFormsJS with [create-react-app] or local development
 * using Babel then using <PolyfillService> is not needed.
 * 
 * Additionally this Component can be used as a standard Class to dynamically
 * load a Polyfill only if needed:
 *     const polyfill = new PolyfillService();
 *     polyfill.loadScript(condition, url).then(function() {
 *         resolve()
 *     });
 * 
 * This method helps keeps the overall size of a project smaller, by loading
 * files for older browsers only if needed. An example of this can be seen
 * in the Image Classification Demo:
 *     [DataFormsJS\examples\html\image-home-react.jsx]
 */

 /* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import React from 'react';

export default class PolyfillService extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isReady: false,
        };
    }

    /**
     * Once component is mounted load Polyfill for IE and Older Mobile Devices
     */
    componentDidMount() {
		var condition = (Array.from && window.Promise && window.fetch ? true : false);
        var url = 'https://polyfill.io/v3/polyfill.min.js?features=Array.from,Array.isArray,Object.assign,URL,fetch,Promise,Promise.prototype.finally,String.prototype.endsWith,String.prototype.startsWith,String.prototype.includes,String.prototype.repeat';
        this.loadScript(condition, url, () => {
            this.setState({ isReady:true });
        });
    }

    /**
     * Dynamically load a JavaScript file if needed. This can be used to
     * load large components that only need to be used on specific pages.
     *
     * Callback if optional and if not passed a Promise is returned.
     */
    loadScript(condition, url, callback) {
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
            if (callback === undefined) {
                return new Promise(function(resolve, reject) {
                    dowloadScript(resolve, reject);
                });
            }
            dowloadScript(callback, callback);
        } else {
            if (callback === undefined) {
                return new Promise(function(resolve) { resolve(); });
            }
            callback();
        }
    }

    /**
     * Render Null if Polyfill Service is loading or Childern
     */
    render() {
        if (!this.state.isReady) {
            return null;
        }
        return this.props.children;
    }
}
