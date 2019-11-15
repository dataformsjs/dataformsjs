/**
 * DataFormsJS Plugin to setup jQuery Chosen elements
 * 
 * Example usage:
 *     <select class="chosen-select" data-chosen-options="{&quot;allow_single_deselect&quot;:true}">
 * 
 * @link https://harvesthq.github.io/chosen/
 */

/* Validates with both [jshint] and [eslint] */
/* global app, $ */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';

    // Plugin function that gets called after content is rendered or setup
    function setupChosen(element) {
        // Get all elements with class='chosen-select'
        element = (element ? element : document);
        var selects = element.querySelectorAll('.chosen-select');
        if (selects.length === 0) {
            return;
        }

        // Make sure jQuery and Chosen are loaded
        if (window.$ === undefined) {
            app.showErrorAlert('Missing jQuery for use with chosen plugin');
            return;
        } else if ($.prototype.chosen === undefined) {
            app.showErrorAlert('Missing jQuery chosen plugin');
            return;
        }

        // Setup each chosen control based on an optional attribute
        Array.prototype.forEach.call(selects, function(select) {
            var options = select.getAttribute('data-chosen-options');
            options = (options === null ? {} : JSON.parse(options));
            $(select).chosen(options).change(function(e) {
                // By default chosen blocks the standard 'change' and 'input' events.
                // Make sure 'input' events run so other plugins or code such as
                // [dataBind.js] behave as expected.
                e.target.dispatchEvent(new Event('input'));
            });
        });
    }

    // Handle Events from the [pages.entryForm] and [plugins.listEditor]
    // Requires loading [DataFormsJS/js/extensions/events.js] before this file.
    if (app.events !== undefined && typeof app.events.on === 'function') {
        app.events.on('entryForm.loadedFormFields', setupChosen);
        app.events.on('listEditor.loadedListEditorControl', setupChosen);
    }

    // Add Plugin to App
    app.addPlugin('chosen', setupChosen); 
})();
