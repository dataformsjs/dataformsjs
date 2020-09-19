/**
 * DataFormsJS Plugin to setup pickadate.js controls.
 * pickadate.js is a widely used JavaScript control for dates.
 *
 * pickadate.js has many options so if you need different options
 * for your app simply copy this plugin as a starting point.
 *
 * Some options can be defined before this script runs be settings:
 *     app.plugins.pickadate.selector = '.datepicker'
 *     app.plugins.pickadate.options = { ... }
 *     app.plugins.pickadate.options.format = 'yyyy-mm-dd'
 *
 * The plugin supports pickadate.js Version 3. An alpha version of pickadata
 * Version 5 is being created however it appears in early stage development
 * and as of Sept 2020 it has not been updated in over a year so the status
 * of the new release as well as version 3 is unknown. Version 5 doesn't
 * use jQuery but requires a much larger API so the code for Version 5
 * is commented out. If you would like to use version 5 then copy this
 * script to your project and modify it so that it works with your site.
 * The version 5 script last confirmed to work with the commented code is:
 *     https://cdn.jsdelivr.net/npm/pickadate@5.0.0-alpha.3/builds/index.js
 *
 * @link https://amsul.ca/pickadate.js/
 * @link https://amsul.ca/pickadate.js/api/
 * @link https://amsul.ca/pickadate.js/v5/docs/binding-javascript
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

    // Plugin Object
    var plugin = {
        // Default Options
        selector: '.datepicker',
        options: {
            selectMonths: true,
            selectYears: true,
            format: 'yyyy-mm-dd',
        },

        // Only needed if using pickadate.js V5 (Tested with Alpha 3):
        /*
        // Version 5 Format/Template
        template: 'YYYY-MM-DD',
        preventFormSubmit: true,

        // Used internally when using Version 5
        elements: [],

        getExistingPicker: function(element) {
            for (var n = 0, m = this.elements.length; n < m; n++) {
                if (this.elements[n].element === element) {
                    return this.elements[n].picker;
                }
            }
            return null;
        },

        dateFromString: function(value) {
            if (value === '') {
                return null;
            }
            if (plugin.template === 'YYYY-MM-DD' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                var nums = value.split('-').map(function(n) { return parseInt(n, 10); });
                return new Date(nums[0], nums[1] - 1, nums[2]);
            }
            return new Date(value);
        },
        */

        // Event called after the HTML is rendered and before the page's
        // controller [onRendered()] function runs.
        onRendered: function(rootElement) {
            // Get <input class="pickadate"> elements
            rootElement = (rootElement === undefined ? document : rootElement);
            var elements = rootElement.querySelectorAll(plugin.selector);
            if (elements.length === 0) {
                return;
            }

            // Which version of pickadate to use?
            if (window.$ !== undefined && $.fn.pickadate !== undefined) {
                // Version 3 (requires jQuery)
                Array.prototype.forEach.call(elements, function(element) {
                    var $input = $(element).pickadate(plugin.options);
                    var picker = $input.pickadate('picker');
                    if (element.value === '') {
                        picker.clear();
                    } else {
                        picker.set('select', element.value);
                    }
                    picker.on({
                        set: function() {
                            var eventInput, eventChange;
                            if (typeof(Event) === 'function') {
                                // Modern Browsers
                                eventInput = new Event('input');
                                eventChange = new Event('change');
                            } else {
                                // IE 11
                                eventInput = document.createEvent('Event');
                                eventChange = document.createEvent('Event');
                                eventInput.initEvent('input', true, true);
                                eventChange.initEvent('change', true, true);
                            }
                            element.dispatchEvent(eventInput);
                            element.dispatchEvent(eventChange);
                        }
                    });
                });
            // Only needed if using pickadate.js V5 (Tested with Alpha 3):
            /*
            } else if (window.pickadate !== undefined) {
                // Version 5 or above
                Array.prototype.forEach.call(elements, function(element) {
                    var picker = plugin.getExistingPicker(element);
                    if (picker === null) {
                        var initialState = { selected: plugin.dateFromString(element.value) };
                        var translation = { template: plugin.template };
                        picker = pickadate.create(initialState, translation);
                        picker.subscribeToSelection(function() {
                            var selectedDate = picker.getValue();
                            if (selectedDate !== element.value) {
                                element.value = selectedDate;
                                element.dispatchEvent(new Event('input'));
                                element.dispatchEvent(new Event('change'));
                            }
                        });
                        pickadate.render(element, picker);
                        plugin.elements.push({ element:element, picker:picker });
                    } else {
                        picker.setSelected({
                            value: plugin.dateFromString(element.value),
                        });
                    }
                });

                // pickadate.js V5 Alpha 3 has a likley bug where after the calendar selection pickadata
                // will trigger a form submit. This can be used to prevent the form submit.
                if (plugin.preventFormSubmit) {
                    var forms = document.querySelectorAll('form');
                    Array.prototype.forEach.call(forms, function(form) {
                        form.onsubmit = function() { return false; };
                    });
                }
            */
            } else {
                console.warn('Using [pickadate] plugin and controls were found but [pickadate.js] was not found on the page');
            }
        },

        // Only needed if using pickadate.js V5 (Tested with Alpha 3):
        /*
        // Clear existing tracked elements when the page is unloaded.
        onRouteUnload: function() {
            this.elements = [];
        },
        */
    };

    // Handle Events from the [pages.entryForm] and [plugins.listEditor]
    // Requires loading [js/extensions/events.js] before this file.
    if (app.events !== undefined && typeof app.events.on === 'function') {
        app.events.on('entryForm.loadedFormFields', plugin.onRendered);
        app.events.on('listEditor.loadedListEditorControl', function(control) {
            plugin.onRendered(control);
        });
    }

    // Add Plugin to DataFormsJS
    app.addPlugin('pickadate', plugin);
})();
