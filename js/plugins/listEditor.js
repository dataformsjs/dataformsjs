/**
 * DataFormsJS [listEditor] Plugin
 *
 * This plugin allows for easy setup using HTML and Templating of dynamic
 * lists that users can edit. For this to work HTML Template Controls that
 * use [data-template-url] or [data-template-id] must also contain the
 * attribute [data-edit-list="name"] where "name" is a corresponding Array
 * of JavaScript objects assigned to the Active Model [app.activeModel].
 * When using Vue [data-template-url] and [data-template-id] are not required
 * because Vue's Virtual DOM instead of DataFormsJS HTML Controls.
 *
 * For an example of usage see the file [entry-form-demo-hbs.htm].
 *
 * This Plugin performs no validation by default so it's up to the main
 * controller or page to handle validation. This is by design for user
 * interaction because a user may want to quickly click the add button many
 * times then copy/paste content at the same time to the new input controls.
 * Validation can be performed by calling the [validate()] function.
 * Also this plugin does not save or fetch records but instead can be used
 * with the [entryForm] page object or a custom page to save changes.
 *
 * HTML Attributes used by this Plugin:
 *    data-edit-list="name"   See above overview comments
 *    data-list-item          The parent container element <tr>, etc must have this for each record
 *    data-add-item           The control/template can have one add-item section for adding new records
 *    data-add-button         Button/Link that adds the record, this must go under [data-add-item]
 *    data-delete-button      Button/Link for each record under [data-list-item]
 *    data-type="int|float"   Used when converting data type from <input> to JavaScript object
 *    data-list-label="name"  Optional display text if using validation
 *
 *  Form Field Naming. Fields must be named in the format of "item-field-{name}"
 *  Example:
 *    <input name="item-field-label">
 *    <input name="item-field-name">
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
     * Plugin Object
     */
    var listEditor = {
        /**
         * Return the CSS selector for list controls that can be used
         * with [document.querySelectorAll()].
         * @returns {string}
         */
        listSelector: function() {
            if (app.activeVueModel === null) {
                return '[data-edit-list][data-template-id],[data-edit-list][data-template-url]';
            }
            return '[data-edit-list]';
        },

        /**
         * Setup all [data-edit-list] Template Controls
         */
        setuplistEditorControls: function () {
            // Get Controls
            var plugin = this,
                controls = document.querySelectorAll(listEditor.listSelector());

            // Handle errors on each control individually
            Array.prototype.forEach.call(controls, function (control) {
                try {
                    plugin.setuplistEditorControl(control);
                } catch (e) {
                    app.showError(control, e);
                }
            });
        },

        /**
         * Setup a single [data-edit-list] Template Control. This function assigns
         * DOM click, change and other events to the input, buttons, etc.
         * @param {HTMLElement} control
         */
        setuplistEditorControl: function (control) {
            // Get elements
            var editListProp = control.getAttribute('data-edit-list'),
                listItems = control.querySelectorAll('[data-list-item]'),
                addItem = control.querySelector('[data-add-item]'),
                fields,
                addButton,
                deleteButton,
                n,
                m,
                x,
                y,
                nodeName,
                eventName,
                type;

            // Process each list item element
            for (n = 0, m = listItems.length; n < m; n++) {
                // Are there input fields on the row?
                // If so then handle changes so that they immediately update
                // the relevant field on the related Object. For this code to
                // work properly the rendered template must match up with the
                // model object. Find all elements starting with "item-field-*"
                fields = listItems[n].querySelectorAll('[name^="item-field-"]');
                for (x = 0, y = fields.length; x < y; x++) {
                    // Get Element Type and handle Input fields
                    nodeName = fields[x].nodeName;
                    if (nodeName === 'INPUT' || nodeName === 'TEXTAREA' || nodeName === 'SELECT') {
                        // Assign an attribute to the input field that
                        // can be easily read from HTML events.
                        fields[x].setAttribute('data-array', editListProp);
                        fields[x].setAttribute('data-index', n);

                        // Handle when the value is changed
                        eventName = (fields[x].oninput === undefined ? 'change' : 'input');
                        type = fields[x].type;
                        if (type === 'checkbox' || type === 'radio') {
                            // As of 2020 updated modern browses (Chrome/Edge/Firefox/Safari) can handle
                            // checkbox/radio changes from `input` however may browsers including
                            // older modern browsers (Samsung Internet, UC Browser) and older
                            // browsers (IE 11, old Mobile Safari) require `change`.
                            eventName = 'change';
                        }
                        fields[x].addEventListener(eventName, listEditor.listItemValueChanged);

                        // IMPORTANT - if a change is not being handled then likely a third-party
                        // JavaScript file is already listening for the change or input event on
                        // the control and canceling additional `addEventListener()` events from running.
                        // Here are several different ways to handle the scenario:
                        //   - Copy this script and use the code below
                        //   - Send one of the following if you can handle the changes from the third-party lib:
                        //       element.dispatchEvent(new Event('input'))
                        //       element.dispatchEvent(new Event('change'))
                        //     See an example of this in the file:
                        //       js/plugins/pickadate.js
                        //
                        // fields[x].oninput = fields[x].onchange = listEditor.listItemValueChanged.bind(this);
                    }
                }

                // Set up one Delete Button for each Line Item - any Element
                // containing the [data-delete-button] Attribute. Once a
                // list item is deleted the control will be re-rendered and
                // this function will be called recursively.
                deleteButton = listItems[n].querySelector('[data-delete-button]');
                if (deleteButton !== null) {
                    deleteButton.setAttribute('data-array', editListProp);
                    deleteButton.setAttribute('data-index', n);
                    deleteButton.addEventListener('click', listEditor.listItemDeleteClick);
                    deleteButton.style.cursor = 'pointer';
                }
            }

            // Setup the Add Item Section on the Control if one exists
            if (addItem !== null) {
                // Set up Add button for the Add Item Section for an element
                // containing the [data-add-button] attribute. This function
                // performs no validation. It's up to the main page, controller,
                // other plugins, etc to handle validation.
                addButton = addItem.querySelector('[data-add-button]');
                if (addButton !== null) {
                    addButton.setAttribute('data-array', editListProp);
                    addButton.style.cursor = 'pointer';
                    addButton.addEventListener('click', listEditor.listItemAddClick);
                }
            }

            // Run Application Events (if any are defined). For example if a
            // jQuery Control needs to be updated when an input field is set.
            if (app.events !== undefined && typeof app.events.dispatch === 'function') {
                app.events.dispatch('listEditor.loadedListEditorControl', control);
            }
        },

        /**
         * Internal function that converts a form field to the specified data type.
         * @param {HTMLElement} element
         */
        getFormFieldValue: function(element) {
            var nodeName = element.nodeName,
                type = element.type,
                dataType = element.getAttribute('data-type'),
                value = null,
                dataValue;

            // Get field value
            if (nodeName === 'INPUT' || nodeName === 'SELECT' || nodeName === 'TEXTAREA') {
                if (type === 'checkbox' || type === 'radio') {
                    value = element.checked;
                } else {
                    value = element.value;
                }
            }  else {
                value = element.textContent.trim();
            }

            // Convert empty strings to null
            if (value === '') {
                value = null;
            }

            // Handle specific data types if [data-type] attribute is used
            switch (dataType) {
                case 'int':
                    dataValue = parseInt(value, 10);
                    if (!isNaN(dataValue)) {
                        value = dataValue;
                    }
                    break;
                case 'float':
                    dataValue = parseFloat(value);
                    if (!isNaN(dataValue)) {
                        value = dataValue;
                    }
                    break;
                default:
                    break;
            }
            return value;
        },

        /**
         * Internal function that gets called when a user changes an
         * input field for list item. This updates the corresponding
         * JavaScript record.
         * @param {Event} e
         */
        listItemValueChanged: function(e) {
            // Get field settings and value
            var element = e.target,
                recordName = element.getAttribute('data-array'),
                recordIndex = element.getAttribute('data-index'),
                fieldName = element.name.substring(11), // Field name after 'item-field-'
                value = listEditor.getFormFieldValue(element);

            // The value from HTML Attribute [data-edit-list] should match
            // up to an Array of Objects from [app.activeModel].
            // As long as the HTML code is setup correctly this will always work.
            if (app.activeVueModel && app.activeVueModel[recordName]) {
                app.activeVueModel[recordName][recordIndex][fieldName] = value;
                if (app.isUsingVue3()) {
                    // When using Vue 3 the main property needs to be reset because changes
                    // on the child object do not cause DOM updates to render. This applies
                    // to both the new Vue 3 Composition API and the standard Vue Options API.
                    //
                    // For a detailed example of differences between Vue 2 and Vue 3 see:
                    //   https://codepen.io/conrad-sollitt/pen/yLeaoGB
                    app.activeVueModel[recordName] = app.activeVueModel[recordName].slice();
                }
            } else {
                app.activeModel[recordName][recordIndex][fieldName] = value;
            }
        },

        /**
         * Internal function called from [setuplistEditorControl()]
         * that gets called when a User adds a list item record.
         * @param {MouseEvent} e
         */
        listItemAddClick: function (e) {
            // Get settings and list item fields
            var element = e.target,
                recordName = element.getAttribute('data-array'),
                control = listEditor.getParentControl(element),
                addItem = control.querySelector('[data-add-item]'),
                record = {},
                formFields = addItem.querySelectorAll('[name^="item-field-"]'),
                name,
                value,
                j,
                k;

            // Build a new object based on template input input fields
            for (j = 0, k = formFields.length; j < k; j++) {
                name = formFields[j].name.substring(11);
                value = listEditor.getFormFieldValue(formFields[j]);
                record[name] = value;
            }

            // Add Record to the Model Array. Then reload the Control
            // for templating (Handlebars, etc) or setup DOM events for Vue.
            if (app.activeVueModel && app.activeVueModel[recordName]) {
                app.activeVueModel[recordName].push(record);
                app.activeVueModel.$nextTick(function () {
                    // Re-attach DOM event handlers
                    listEditor.setuplistEditorControl(control);
                    // Clear or reset the add item template field controls
                    Array.prototype.forEach.call(formFields, function(field) {
                        var nodeName = field.nodeName,
                            type = field.type,
                            defaultValue = field.getAttribute('data-default');

                        if (nodeName === 'INPUT' || nodeName === 'SELECT' || nodeName === 'TEXTAREA') {
                            if (type === 'checkbox' || type === 'radio') {
                                if (defaultValue === null) {
                                    field.checked = false;
                                } else {
                                    field.checked = (defaultValue === 'true' ? true : false);
                                }
                            } else {
                                field.value = (defaultValue === null ? '' : defaultValue);
                            }
                        }
                    });
                });
            } else {
                app.activeModel[recordName].push(record);
                listEditor.reloadListEditorControl(control);
            }
        },

        /**
         * Internal function called from [setuplistEditorControl()]
         * that gets called when a User deletes a list item record.
         * @param {MouseEvent} e
         */
        listItemDeleteClick: function (e) {
            // Get settings
            var element = e.target,
                recordName = element.getAttribute('data-array'),
                recordIndex = parseInt(element.getAttribute('data-index'), 10),
                control = listEditor.getParentControl(element);

            // Remove from the Model's Array and then related if not using Vue
            if (app.activeVueModel && app.activeVueModel[recordName]) {
                app.activeVueModel[recordName].splice(recordIndex, 1);
                return;
            } else {
                app.activeModel[recordName].splice(recordIndex, 1);
                listEditor.reloadListEditorControl(control);
            }
        },

        /**
         * Internal function to find the Parent Control. This code loops
         * up parent nodes until the control/template is found.
         *
         * @param {HTMLElement} element
         * @returns {HTMLElement}
         */
        getParentControl: function (element) {
            var control = element.parentNode;
            if (app.activeVueModel !== null) {
                // When using Vue [data-template-url] and [data-template-id] are not required
                while (
                    control !== null &&
                    control.getAttribute('data-edit-list') === null
                ) {
                    control = control.parentNode;
                }
            } else {
                while (
                    control !== null &&
                    control.getAttribute('data-edit-list') === null &&
                    (control.getAttribute('data-template-url') === null && control.getAttribute('data-template-id') === null)
                ) {
                    control = control.parentNode;
                }
            }
            return control;
        },

        /**
         * Reload a list control. This gets called when a users adds or deletes a record
         * @param {HTMLElement} control
         */
        reloadListEditorControl: function (control) {
            app.refreshHtmlControl(control, function () {
                listEditor.setuplistEditorControl(control);
            });
        },

        /**
         * Validate all lists on screen and return an array of error messages to
         * display to the user. Validation will only run if an [app.validation()]
         * function is defined. The default validation function is available with
         * [Extensions\validation.js].
         *
         * Example usage:
         *     var errors = app.plugins.listEditor.validate();
         *
         * @returns {array}
         */
        validate: function() {
            // Using Validation?
            var validateInput = (app.validation !== undefined && typeof app.validation.validateInput === 'function' ? app.validation.validateInput : null);
            if (validateInput === null) {
                console.warn('[app.plugins.listEditor.validate()] was called, however no validation function exists.');
                return [];
            }

            // Loop through all Lists
            var errors = [];
            var editListControls = document.querySelectorAll(listEditor.listSelector());
            Array.prototype.forEach.call(editListControls, function(control) {
                // Validate
                var row = 1;
                var selector = 'input[name^="item-field-"], select[name^="item-field-"], textarea[name^="item-field-"]';
                var listItems = control.querySelectorAll('[data-list-item]');
                var listLabel = control.getAttribute('data-list-label');
                Array.prototype.forEach.call(listItems, function(listItem) {
                    var inputs = listItem.querySelectorAll(selector);
                    Array.prototype.forEach.call(inputs, function(input) {
                        var error = validateInput(input, null, row, listLabel);
                        if (error) {
                            errors.push(error);
                        }
                    });
                    row++;
                });
            });
            return errors;
        },

        /**
         * Event called after the HTML is rendered and before the page's
         * controller [onRendered()] function runs.
         */
        onRendered: function() {
            this.setuplistEditorControls();
        },
    };

    /**
     * Add Plugin to DataFormsJS
     */
    app.addPlugin('listEditor', listEditor);
})();