/**
 * Plugin Function Template
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
    
    // Add a new plugin function to handle the [plugin.onRendered()] event
    // which runs after content is rendered but before [controller.onRendered()].
    app.addPlugin('name', function (rootElement) {
        // Use either document or specific element; defining [rootElement] is optional.
        // [rootElement] will be undefined when the full view is rendered, however when specific
        // elements are updated through [app.refreshAllHtmlControls()] or other functions
        // then the element being updated will be passed as a parameter.
        console.log('plugin.onRendered function called');
        rootElement = (rootElement === undefined ? document : rootElement);

        // Plugin functions are a great way of making your code more modular and separating
        // logic or features that can be shared by different pages. This example runs a query 
        // selector for all elements that have the attribute [data-change-border] or
        // class "change-border" and then changes the border color.
        var selector = '[data-change-border], .change-border';
        var elements = rootElement.querySelectorAll(selector);
        Array.prototype.forEach.call(elements, function(el) {
            el.style.border = '1px solid red';
        });
    });
})();
