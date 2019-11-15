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

    // Plugin Object
    var unitTestEventOrder = {
        // Each of the standard plugin functions simply
        // adds the event name to an array using the
        // addEvent() function of this plugin.
        onBeforeRender: function () {
            this.addEvent('plugin:onBeforeRender');
        },
        onRendered: function () {
            this.addEvent('plugin:onRendered');
        },
        onRouteUnload: function () {
            this.addEvent('plugin:onRouteUnload');
        },
        // Function unique to this plugin that checks
        // if DataFormsJS has an active model and if
        // it does an events property (Unit-Test Page),
        // if so then the event name is added.
        addEvent: function (eventName) {
            if (app.activeModel && app.activeModel.events) {
                app.activeModel.events.push(eventName);
            }
        }
    };

    // Add Plugin to DataFormsJS
    app.addPlugin('unitTestEventOrder', unitTestEventOrder);

})();
