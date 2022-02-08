/**
 * Page Template for a page class form based on [JsonData].
 *
 * Defining pages based on the ES5 [jsonData] object or ES6 [JsonData] class is
 * the recommended starting point for most sites that use the DataFormsJS Framework
 * because it allows for quickly defining and separating logic unique to the page
 * you are using while using the standard json web service logic and templating
 * [isLoading, isLoaded, hasError].
 *
 * When creating pages based on other pages script load order is important.
 *
 * Load this file first:
 *     <script src="js/pages/classes/JsonData.js"></script>
 *
 * Then load your custom file:
 *     <script src="js/CustomPage.js"></script>
 */

/* Validates with both [jshint] and [eslint] */
/* global app, JsonData */
/* jshint esversion: 6 */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
 * Tip: This class is intended as a starting point;
 * delete all functions and code that you do not use.
 */
class CustomPage extends JsonData {
    constructor() {
        super();
        this.property1 = 'Example Property';
        this.property2 = null;
        this.property3 = 123;
    }

    // The [JsonData] page provides model event functions [onFetch] and [onError],
    // however they would not commonly be used. For most pages handle custom page logic
    // using the controller function [page.onRendered] which is defined after the model.
    onFetch(data) {
        console.log('%cData returned from [onFetch()] for a custom page based on [JsonData]', 'color:navy; font-weight:bold;');
        console.log(data);
    }

    onError() {
        console.log('%cjsonData.onError()', 'color:red; font-weight:bold;');
    }

    logInfo() {
        console.log('%cCalled [logInfo()] from a custom page based on [JsonData]', 'color:navy; font-weight:bold;');
        // These two properties come from the JsonData class
        console.log(this.url);
        console.log(this.submittedFetchUrl);
        // Example property from this class
        console.log(this.property1);
    }

    setupView() {
        this.logInfo();
    }

    /**
     * Define the Controller onRendered() function.
     * This gets called each time the view is redrawn.
     */
    onRendered() {
        console.log('page.onRendered(isLoaded = ' + this.isLoaded + ')');

        // Only call custom functions for the view
        // once data has loaded from the web service.
        if (this.isLoaded) {
            this.setupView();
        }
    }
}

/**
 * Add page to the app
 */
app.addPage('customPage', CustomPage);
