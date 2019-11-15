/**
 * DataFormJS Unit Testing
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

    var unitTestEventOrder = {
        // Simple model object with an array to save
        // event names and check and app property
        model: {
            triggeredIsUpdatingView: false,
            viewHasBeenUpdated: false,
            events: []
        },

        // Each function adds a string to the events array of the model
        onRouteLoad: function () {
            this.events.push('page:onRouteLoad');

            // Flag variable so app.updateView() is called only once
            // each time the controller loads
            this.viewHasBeenUpdated = false;
        },

        onBeforeRender: function () {
            this.events.push('page:onBeforeRender');
        },

        onRendered: function () {
            this.events.push('page:onRendered');

            // Due to timing when app.updateView() is called
            // [app.isUpdatingView()] should equal true the 2nd
            // time this function runs on the unit test.
            if (app.isUpdatingView()) {
                this.triggeredIsUpdatingView = true;
            }

            // This will be true the 2nd time this function
            // is called once [app.updateView()] is ran.
            if (this.viewHasBeenUpdated) {
                return;
            }

            // Mark this view as being updated
            // and update the view again.
            this.viewHasBeenUpdated = true;
            app.updateView();
        },

        onRouteUnload: function () {
            this.events.push('page:onRouteUnload');
        },
    };

    // Add Page to DataFormsJS
    app.addPage('unitTestEventOrder', unitTestEventOrder);
})();
