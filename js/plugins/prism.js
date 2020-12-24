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
    
    app.addPlugin('prism', function (rootElement) {
        if (window.Prism === undefined) {
            console.warn('window.Prism is not loaded');
            return;
        }

        // The original version of this plugin used higher level code because plugins
        // get called only once per page load or major change from when using the 
        // Standard DataFormsJS Framework. However after the Web Components [polyfill.js]
        // was created this plugin can end up being called multiple times per page view.
        // If that happens it can cause a long delay if prism re-runs on already
        // highlighted code. To avoid that all elements are checked on the page
        // and only those that have not yet been highlighted are processed.
        // The selector comes directly from `Prism.highlightAllUnder()`.
        
        // if (rootElement === undefined) {
        //     Prism.highlightAll();
        // } else {
        //     Prism.highlightAllUnder(rootElement);
        // }

        rootElement = (rootElement || document);
        var selector = 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code';
        var elements = rootElement.querySelectorAll(selector);
        Array.prototype.forEach.call(elements, function(element) {
            if (element.querySelector('.token') === null) {
                Prism.highlightElement(element);
            }
        });
    });
})();
