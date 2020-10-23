/**
 * DataFormsJS [keydownAction] Plugin
 *
 * This plugin uses the attribute [data-enter-key-click-selector] and allows
 * the [enter] key of the element to trigger a [click()] event on the element
 * specified in the selector.
 *
 * Common usage would be for Entry Forms where the {enter} key should perform a
 * default action. For example usage see the Places Demo Search Screen.
 *
 * There is a corresponding Web Component for this plugin:
 *     js/web-components/keydown-action-service.js
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

    app.addPlugin('keydownAction', function (rootElement) {
        rootElement = (rootElement === undefined ? document : rootElement);

        var elements = rootElement.querySelectorAll('[data-enter-key-click-selector]');
        Array.prototype.forEach.call(elements, function(el) {
            el.addEventListener('keydown', enterToClick);
        });
    });
})();
