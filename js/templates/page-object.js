/**
 * Page Object Template
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
     * Create a new page object (plain Javascript object)
     *
     * A page defines both the controller and model for a route.
     * A [model] object is required along with at least one controller function:
     * [onRouteLoad(), onBeforeRender(), onRendered(), onRouteUnload()].
     *
     * Each controller function will have access to it's related model using [this].
     *
     * Tip: This file is intended as a starting point; delete all functions
     * and code that you do not use.
     */
    var page = {
        /**
         * Define a model for the page object.
         * Each route/controller that is used will create a new model for it's page.
         */
        model: {
            // Propeties
            counter: 0,

            logFuncHash: function(func) {
                console.log('%cpage.' + func + ': ' + window.location.hash, 'color:navy;');
            },

            // Called once when the view is loaded with data
            setupView: function() {
                // Reference the current model object
                var model = this;

                // ** Add custom page logic here
                model.logFuncHash('setup');
            },
        },

        /**
         * Controller function that is called once before the route
         * will be loaded. This is usefull for calling web services
         * before any rendering happens. For example, see usage on the
         * core [pages/jsonData.js] file.
         *
         * When using Vue this will be called from the Vue instance
         * [mounted()] function.
         */
        onRouteLoad: function() {
            console.log('%cPage Loaded', 'font-weight:bold;');
            this.counter++;
            this.logFuncHash('onRouteLoad');
        },

        /**
         * Define the Controller [onBeforeRender()] function.
         * This gets called each time the view is redrawn before
         * the the HTML is rendered.
         *
         * When using Vue this function will not be called so instead
         * use [onRouteLoad()] to handle early controller logic.
         */
        onBeforeRender: function() {
            this.logFuncHash('onBeforeRender');
        },

        /**
         * Define the Controller [onRendered()] function.
         * This gets called each time the view is redrawn.
         */
        onRendered: function() {
            this.logFuncHash('onRendered');
            this.setupView();
        },

        /**
         * Define the Controller [onRouteUnload()] function.
         * This event gets called only once per hash change when
         * the current route is unloaded. It can be used to call
         * [window.clearTimeout()] for page timers or cleanup 
         * for other resources.
         *
         * When using Vue this will be called from the Vue instance
         * [beforeDestroy()] function.
         */
        onRouteUnload: function() {
            this.logFuncHash('onRouteUnload');
            console.log('%cPage Unloaded', 'font-weight:bold;');
        },
    };

    /**
     * Add page to app
     */
    app.addPage('pageName', page);
})();
