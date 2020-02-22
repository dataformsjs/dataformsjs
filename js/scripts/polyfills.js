/**
 * JavaScript Polyfills
 *
 * This script contains polyfills using feature detection.
 *
 * This script is intended for use with both Modern Browsers and Legacy Browsers
 * (IE, old Safari, etc) with recently added JavaScript standard functions.
 *
 * To polyfill common featuers such as [fetch(), Promise, etc] use https://polyfill.io/v3/
 *
 * For example usage of using the Polyfill server see code related to `polyfillUrl` in:
 *     js\DataFormsJS.js
 *     js\react\jsxLoader.js
 *
 * Functions defined here are not yet avaiable with the `polyfill.io` service
 */
(function() {
    'use strict';

    // `trimStart()` and `trimEnd()` are part of ECMAScript 2019 however as of 2020
    // many modern browsers use `trimLeft()` and `trimRight()` instead, additionally
    // not all versions of modern browsers include `trimLeft()` and `trimRight()`.

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
})();
