/**
 * DataFormsJS [keydownAction] Plugin
 * 
 * This plugin uses the attribute [data-enter-key-click-selector] and allows
 * the [enter] key of the element to trigger a [click()] event on the element
 * specified in the selector.
 * 
 * Example:
 *     <input type="text" data-enter-key-click-selector="button">
 */

/* Validates with both [jshint] and [eslint] */
/* global app */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';

    function enterToClick(e) {
        if (e.keyCode !== 13) {
            return;
        }
        var selector = e.target.getAttribute('data-enter-key-click-selector');
        if (!selector) {
            return;
        }
        var clickEl = document.querySelector(selector);
        if (!clickEl) {
            return;
        }                    
        e.preventDefault();
        clickEl.click();
    }
    
    app.addPlugin('keydownAction', function (element) {
        element = (element === undefined ? document : element);
        
        var elements = element.querySelectorAll('[data-enter-key-click-selector]');
        Array.prototype.forEach.call(elements, function(el) {
            el.addEventListener('keydown', enterToClick);
        });
    });
})();
