/**
 * Page Template for a custom entry form based on [entryForm].
 * 
 * When creating pages based on other pages script load order is important.
 * 
 * Load these files first:
 *     <script src="js/pages/jsonData.js"></script>
 *     <script src="js/pages/entryForm.js"></script>
 * 
 * Then load your custom file:
 *     <script src="js/customEntryForm.js"></script>
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

    /**
     * Create the Page Object by copying the entryForm Page
     */
    var customForm = app.deepClone({}, app.pages.entryForm);

    /**
     * The [entryForm.model] defines callback functions that can be handled
     * when it is extended.
     */
    Object.assign(customForm.model, {
        // Custom model function
        logFormEvent: function(event) {
            if (event === 'onFormLoaded') {
                console.log('%cform.' + event, 'font-weight:bold;');
            } else {
                console.log('form.' + event);
            }
        },

        // Callback functions
        onFormLoaded: function() { this.logFormEvent('onFormLoaded'); },
        onFormBeforeSave: function(record) {
            this.logFormEvent('onFormBeforeSave');
            console.log(record);
            return true; // If [false] the form will not be saved, use for custom validation
        },
        onFormAfterSave: function() { this.logFormEvent('onFormAfterSave'); },
        onFormAfterDelete: function() { this.logFormEvent('onFormAfterDelete'); },
        onFormSaveError: function(error) { this.logFormEvent('onFormSaveError'); console.log(error); },
        onFormDeleteError: function(error) { this.logFormEvent('onFormDeleteError'); console.log(error); },
    });

    /**
     * Add page to app
     */
    app.addPage('customEntryForm', customForm);
})();
