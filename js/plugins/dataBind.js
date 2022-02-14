/**
 * DataFormsJS Plugin [dataBind]
 *
 * This is intended only when a page or app has simple data binding
 * needs and is not meant as a replacement for a full template or
 * view engine such as Handlebars or Vue.
 *
 * This file updates DOM content based on attributes:
 *     data-bind="object.property"
 *     data-format="number|date|dateTime|time|{function}"
 *     data-bind-attr="attr1, attr2"
 *     data-show="js-expression"
 *
 * Using [data-format] requires [js/extensions/format.js] or
 * custom functions to be defined by the app.
 *
 * Elements with [data-show] will have the toggled `style.display`
 * for viewing or to hide based on the result of the expression.
 * This is similar behavior to Vue [v-show]. If the [format.js]
 * is available then `format` functions will be available for the
 * JavaScript expression.
 *
 * Additionally API functions can be manually called, example:
 *     app.plugins.dataBind.getBindValue(key)
 *     app.plugins.dataBind.getBindValue(key, data) // [data] is optional
 *     app.plugins.dataBind.bindAttrTmpl(element, attribute, data)
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
         * @param {object|null|undefined} data
         * @returns {null|string}
         */
        getBindValue: function (key, data) {
            // Using bind requires an active model
            if (data === undefined) {
                data = app.activeModel;
            } else if (data === null && !key.startsWith('window.')) {
                return null;
            } else if (key === null) {
                throw new Error('Missing [data-bind] attribute.')
            }

            // Get bind value
            var keys = key.split('.');
            var value = (keys.length > 1 && keys[0] === 'window' ? window : data);
            for (var n = 0, m = keys.length; n < m; n++) {
                value = (typeof value === 'object' && value !== null ? value[keys[n]] : null);
            }
            return (value === undefined ? null : value);
        },

        /**
         * Bind an Attribute Template. This is used for [data-bind-attr] to set an
         * attribute value based on a template and data. Use "[]" characters to
         * specify the bind key in the related attribute. Example:
         *     <a href="#/regions/[place.country_code]" data-bind-attr="href">Regions</a>
         *
         * Additionally this can be used for other attributes defined by the app.
         * For example the [js/web-components/polyfill.js] uses this for [url-attr-param].
         *
         * @param {HTMLElement} element
         * @param {string} attribute
         * @param {object} data
         */
        bindAttrTmpl: function(element, attribute, data) {
            var attributes = element.getAttribute(attribute).split(',').map(function(s) { return s.trim(); });
            attributes.forEach(function(attr) {
                // Save bind template to an attribute, example:
                // [data-bind-attr="href"] will save the initial value from [href]
                // to [data-bind-attr-href]. This allows it to be re-used.
                var value = element.getAttribute(attribute + '-' + attr);
                if (value === null) {
                    value = element.getAttribute(attr);
                    if (value !== null) {
                        element.setAttribute(attribute + '-' + attr, value);
                    }
                }
                // Parse the template
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
                        var boundValue = dataBind.getBindValue(key, data);
                        if (boundValue === null) {
                            boundValue = '';
                        }
                        value = value.substring(0, posStart) + boundValue + value.substring(posEnd + 1);
                        loopCount++;
                    }
                    element.setAttribute(attr, value);
                }
            });
        },

        /**
         * Event called after the HTML is rendered and before the page's
         * controller [onRendered()] function runs.
         */
        onRendered: function (rootElement) {
            // Use specific element or entire page (document)
            if (rootElement === undefined) {
                rootElement = document;
            }

            // Update element text for all elements with [data-bind] Attribute.
            var elements = rootElement.querySelectorAll('[data-bind]');
            Array.prototype.forEach.call(elements, function(el) {
                var fieldName = el.getAttribute('data-bind');
                if (fieldName === '') {
                    if (el.getAttribute('data-control') === null && el.tagName.indexOf('-') === -1) {
                        // Don't warn if a JS Control
                        console.warn('Element has a [data-bind] attribute, but no field specified');
                    }
                    return;
                }
                var value = dataBind.getBindValue(fieldName);
                var elementName = el.nodeName;
                if (elementName === 'INPUT' || elementName === 'SELECT' || elementName === 'TEXTAREA') {
                    // Handle Form/Input Elements
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
                } else if (el.getAttribute('data-control') === null && el.tagName.indexOf('-') === -1) {
                    // Handle standard HTML Elements. This includes framework "JS Controls"
                    // or Web Components as they will handle data binding in the control.
                    var dataType = el.getAttribute('data-format');
                    if (dataType !== null) {
                        if (app.format !== undefined && typeof app.format[dataType] === 'function') {
                            value = app.format[dataType](value);
                        } else if (typeof window[dataType] === 'function') {
                            try {
                                value = window[dataType](value);
                            } catch (e) {
                                console.error(e);
                                value = 'Error: ' + e.message;
                            }
                        } else {
                            value = 'Error: Unhandled format function [' + dataType + ']';
                            console.warn('Check if the script [js/extensions/format.js] should be included or if a function is missing.');
                        }
                    }
                    el.textContent = value;
                }
            });

            // Update element attributes - [data-bind-attr].
            // This code finds and replaces text such in the format of "[field]".
            // Example:
            //     <a href="/[field1]/[field2]" data-bind-attr="href">
            elements = rootElement.querySelectorAll('[data-bind-attr]');
            Array.prototype.forEach.call(elements, function(el) {
                dataBind.bindAttrTmpl(el, 'data-bind-attr', app.activeModel);
            });

            // Show or hide elements based on [data-show="js-expression"].
            elements = rootElement.querySelectorAll('[data-show]');
            Array.prototype.forEach.call(elements, function(el) {
                if (app.activeModel === null || (app.activeModel && app.activeModel.isLoading === true)) {
                    // [data-show] elements will be hidden during loading
                    el.style.display = 'none';
                } else {
                    var expression = el.getAttribute('data-show');
                    try {
                        var tmpl = new Function('state', 'format', 'with(state){return ' + expression + '}');
                        var result = tmpl(app.activeModel, app.format);
                        el.style.display = (result === true ? '' : 'none');
                    } catch (e) {
                        el.style.display = '';
                        if (app.activeModel.isLoading !== undefined) {
                            // Only provide warning if [isLoading] is defined, otherwise this
                            // can display extra warnings that are not needed while data is loading.
                            console.warn('Error evaluating JavaScript expression from [data-show] attribute.');
                            console.warn(e);    
                        }
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
