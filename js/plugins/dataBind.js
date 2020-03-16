/**
 * DataFormsJS Plugin [dataBind]
 *
 * This is intended only when a page or app has simple data binding
 * needs and is not meant as a replacement for a full template or
 * view engine such as Handlebars or Vue.
 *
 * This file updates DOM content based on attributes:
 *     data-bind
 *     data-bind-attr
 *
 * Additionally API functions can be manually called, example:
 *     app.plugins.dataBind.getBindValue(key)
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
     * Private function that updates [data-bind] property when
     * an input/select/textarea value changes
     * @param {Event} e
     */
    function updateModel(e) {
        // Create Model object if one doesn't exist
        if (app.activeModel === null) {
            app.activeModel = {};
        }

        // Get input value
        var elType = e.target.type;
        var elValue = (elType === 'checkbox' || elType === 'radio' ? e.target.checked : e.target.value);

        // Update property
        var key = e.target.getAttribute('data-bind');
        if (key.indexOf('.') === -1) {
            // Check for an exact match on property
            app.activeModel[key] = elValue;
        } else {
            // Check for bindings such as "object.property". If first
            // key is [window] then start at global [window] Object.
            var keys = key.split('.');
            var useWindow = (keys[0] === 'window');
            var obj = (useWindow ? window : app.activeModel);
            if (useWindow) {
                keys.splice(0, 1);
            }
            while (keys.length > 0) {
                key = keys[0];
                if (keys.length === 1) {
                    obj[key] = elValue;
                } else {
                    if (typeof obj[key] !== 'object') { // Handles both objects and arrays
                        obj[key] = {};
                    }
                    obj = obj[key];
                }
                keys.splice(0, 1);
            }
        }
    }

    /**
     * Plugin Object
     */
    var dataBind = {
        /**
         * Return a bind value from [app.activeModel] using format 'object.property'.
         * If first bind key is 'window' then the global [window] object is used instead.
         *
         * @param {string} key
         * @returns {null|string}
         */
        getBindValue: function (key) {
            // Using bind requires an active model
            if (app.activeModel === null) {
                return null;
            }

            // Get bind value
            var keys = key.split('.');
            var value = (keys.length > 1 && keys[0] === 'window' ? window : app.activeModel);
            for (var n = 0, m = keys.length; n < m; n++) {
                value = (typeof value === 'object' && value !== null ? value[keys[n]] : null);
            }
            return (value === undefined ? null : value);
        },

        /**
         * Event called after the HTML is rendered and before the page's
         * controller [onRendered()] function runs.
         */
        onRendered: function (element) {
            // Use specific element or entire page (document)
            if (element === undefined) {
                element = document;
            }

            // Update element text for all elements with [data-bind] Attribute.
            var elements = element.querySelectorAll('[data-bind]');
            Array.prototype.forEach.call(elements, function(el) {
                var fieldName = el.getAttribute('data-bind');
                if (fieldName === '') {
                    console.warn('Element has a [data-bind] attribute, but no field specified');
                    return;
                }
                var value = dataBind.getBindValue(fieldName);
                var elementName = el.nodeName;
                if (elementName === 'INPUT' || elementName === 'SELECT' || elementName === 'TEXTAREA') {
                    var elementType = el.type;
                    if (elementType === 'checkbox' || elementType === 'radio') {
                        if (typeof value === 'boolean') {
                            el.checked = value;
                        } else {
                            value = String(value).toLowerCase();
                            el.checked = (value === '1' || value === 'true' || value === 'yes' || value === 'y');
                        }
                    } else {
                        el.value = value;
                    }
                    // Sync initial value back to the model and update model on changes
                    updateModel({target:el});
                    var eventName = (el.oninput === undefined ? 'change' : 'input');
                    el.addEventListener(eventName, updateModel);
                } else {
                    el.textContent = value;
                }
            });

            // Update element attributes - [data-bind-attr].
            // This code finds and replaces text such in the format of "[field]".
            // Example:
            //     <a href="/[field1]/[field2]" data-bind-attr="href">
            elements = element.querySelectorAll('[data-bind-attr]');
            Array.prototype.forEach.call(elements, function(el) {
                var attributes = el.getAttribute('data-bind-attr').split(',');
                for (var n = 0, m = attributes.length; n < m; n++) {
                    var attr = attributes[n].trim();
                    var value = el.getAttribute(attr);
                    if (value !== null) {
                        var loopCount = 0; // For safety to prevent endless loops
                        var maxLoop = 100;
                        while (loopCount < maxLoop) {
                            var posStart = value.indexOf('[');
                            var posEnd = value.indexOf(']');
                            if (posStart === -1 || posEnd === -1 || posEnd < posStart) {
                                break;
                            }
                            var key = value.substring(posStart + 1, posEnd);
                            var boundValue = dataBind.getBindValue(key);
                            if (boundValue === null) {
                                boundValue = '';
                            }
                            value = value.substring(0, posStart) + boundValue + value.substring(posEnd + 1);
                            loopCount++;
                        }
                        el.setAttribute(attr, value);
                    }
                }
            });
        },
    };

    /**
     * Add Plugin Object
     */
    app.addPlugin('dataBind', dataBind);
})();
