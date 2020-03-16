/**
 * DataFormsJS [app.events] Extension
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

    // Array that stores all defined events
    var eventList = [];

    // Private function for removing events
    function removeEvent(name, callback) {
        for (var n = eventList.length - 1; n >= 0; n--) {
            if (eventList[n].name === name && eventList[n].callback === callback) {
                eventList.splice(n, 1);
                break;
            }
        }
    }

    // Events Object
    var events = {
        /**
         * Add a event, if already defined the event will only be added
         * once for the same function.
         *
         * Example:
         *     app.events.on('myevent', fn);
         *
         * @param {string} name
         * @param {function} callback
         */
        on: function (name, callback) {
            removeEvent(name, callback);
            eventList.push({ name: name, callback: callback });
        },

        /**
         * Remove an event, same function used with [on()] must be passed.
         *
         * Example:
         *     app.events.off('myevent', fn);
         *
         * @param {*} name
         * @param {*} callback
         */
        off: function (name, callback) {
            removeEvent(name, callback);
        },

        /**
         * Run all functions defined (if any) for an event
         *
         * Example:
         *     app.events.dispatch('myevent', data);
         *
         * @param {string} name
         * @param {*} data
         */
        dispatch: function (name, data) {
            eventList.forEach(function (event) {
                if (event.name === name) {
                    try {
                        event.callback(data);
                    } catch (e) {
                        var error = 'Error with custom event function for event [' + name + ']';
                        app.showErrorAlert(error);
                        console.log(event);
                        console.log(data);
                        return;
                    }
                }
            });
        }
    };

    // Assign events Object to the app Object
    app.events = events;
})();
