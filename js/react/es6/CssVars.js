/**
 * Add CSS Variable Support to IE and older Browsers using a ponyfill/polyfill.
 * 
 * Usage
 * Include the attribute [data-css-vars-ponyfill] on a <link> element:
 *    <link rel="stylesheet" href="site.css" data-css-vars-ponyfill>
 * Then from JavaScript call:
 *    CssVars.ponyfill();
 * 
 * @link https://github.com/jhildenbiddle/css-vars-ponyfill
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* global cssVars */
/* jshint esversion:6 */
/* eslint-env es6 */

import LazyLoad from './LazyLoad.js';

export default class CssVars {
    static ponyfill() {
        const selector = 'link[rel="stylesheet"][data-css-vars-ponyfill]:not([data-css-vars-setup]),style[data-css-vars-ponyfill]:not([data-css-vars-setup])';
        const styleSheets = document.querySelectorAll(selector);
        if (styleSheets.length === 0) {
            return;
        }
        const lazy = new LazyLoad();
        const supportsCssVars = (window.CSS && window.CSS.supports && window.CSS.supports('(--a: 0)'));
        const polyfillUrl = 'https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2.4.3/dist/css-vars-ponyfill.min.js';
        lazy.loadPolyfill(supportsCssVars, polyfillUrl).then(function() {
            if (window.cssVars) {
                cssVars({ include: selector });
                Array.prototype.forEach.call(styleSheets, function(styleSheet) {
                    styleSheet.setAttribute('data-css-vars-setup', '');
                });
            }
        });
    }
}