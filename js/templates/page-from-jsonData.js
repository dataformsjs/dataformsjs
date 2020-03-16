/**
 * Page Template for a custom entry form based on [jsonData].
 * 
 * Defining pages based on [jsonData] is the recommended starting point for most
 * sites that use the DataFormsJS Framework because it allows for quickly defining
 * and separating logic unique to the page you are using while using the standard
 * json web service logic and templating [isLoading, isLoaded, hasError].
 * 
 * When creating pages based on other pages script load order is important.
 * 
 * Load this file first:
 *     <script src="js/pages/jsonData.js"></script>
 * 
 * Then load your custom file:
 *     <script src="js/customPage.js"></script>
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
     * Create the Page Object by copying the jsonData Page
     */
    var page = app.deepClone({}, app.pages.jsonData);

    /**
     * Add new properties and functions for the page to the Model
     * 
     * Tip: This file is intended as a starting point; delete all functions
     * and code that you do not use.
     */
    Object.assign(page.model, {
        // Propeties
        property1: 'Example Property',
        property2: null,
        property3: 123,

        // The [jsonData] page provides model event functions [onFetch] and [onError],
        // however they would not commonly be used. For most pages handle custom page logic
        // using the controller function [page.onRendered] which is defined after the model.
        onFetch: function(data) {
            console.log('%cData returned from [onFetch()] for a custom page based on [jsonData]', 'color:navy; font-weight:bold;');
            console.log(data);
        },
        onError: function() {
            console.log('%cjsonData.onError()', 'color:red; font-weight:bold;');
        },

        // Function example
        logInfo: function() {
            console.log('%cCalled [logInfo()] from a custom page based on [jsonData]', 'color:navy; font-weight:bold;');
            // These two properties come from the jsonData model Object
            // and are assigned to this model through [app.deepClone()]
            console.log(this.url);
            console.log(this.submittedFetchUrl);
            // Example property from this class
            console.log(this.property1);
        },

        // Called once when the view is loaded with data
        setupView: function() {
            // Reference the current model object
            var model = this;

            // Add custom page logic here
            model.logInfo();
        }
    });

    /**
     * Define the Controller onRendered() function.
     * This gets called each time the view is redrawn.
     * 
     * If using Vue as the View Engine then this function will likely
     * not be called and instead Vue will automatically render view 
     * updates based on the downloaded data.
     */
    page.onRendered = function () {
        console.log('page.onRendered(isLoaded = ' + this.isLoaded + ')');

        // Only call custom functions for the view 
        // once data has loaded from the web sevice.
        if (this.isLoaded) {
            this.setupView();
        }
    };

    /**
     * Add page to the app
     */
    app.addPage('customPage', page);
})();
