/**
 * DataFormsJS Plugin to setup Prism elements
 * 
 * @link https://prismjs.com
 */

/* Validates with both [jshint] and [eslint] */
/* global app, Prism */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';
    
    app.addPlugin('prism', function (element) {
        if (window.Prism !== undefined) {
            if (element === undefined) {
                Prism.highlightAll();
            } else {
                Prism.highlightAllUnder(element);
            }
        }
    });
})();
