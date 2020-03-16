/**
 * DataFormsJS entryForm Page Object
 *
 * This file defines the [entryForm] page object which can be used to quickly
 * and easily create dynamic Entry Forms based on HTML. The model object also
 * includes callback functions which can be used from inherited/extended page
 * objects based on this for custom logic.
 *
 * When using this file script load order is important.
 * First load [jsonData.js] then this file:
 *     <script src="js/pages/jsonData.js"></script>
 *     <script src="js/pages/entryForm.js"></script>
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
    var entryForm = app.deepClone({}, app.pages.jsonData);

    /**
     * Define the Model
     */
    Object.assign(entryForm.model, {
        // General Properties
        newRecord: false,
        recordDeleted: false,
        // By default look for <input>, <select>, and <textarea> elements
        // that start with "field-" in either the id or name.
        fieldSelector: 'input[id^="field-"],input[name^="field-"],select[id^="field-"],select[name^="field-"],textarea[id^="field-"],textarea[name^="field-"]',
        // Label elements such as '.error-message' are not required
        // to exist, however they are usually helpful for users.
        saveButtonSelector: '.btn-save',
        deleteButtonSelector: '.btn-delete',
        infoSelector: '.info-message',
        errorSelector: '.error-message',
        errorListSelector: '.error-list',
        saveUrl: null,
        deleteUrl: null,
        // This applies to [saveUrl], by default a response of {success:true} and optionally {fields}
        // is expected. When [useSaveApi:false] any 200 response with JSON will be considered a valid
        // and the model will be updated with any returned data from the JSON response.
        useSaveApi: true,
        // Redirect URL Example - hash URL '#/record/:id'
        // [id] would need to be passed back from web serivce in fields property.
        newRecordRedirectUrl: null,
        updateRecordRedirectUrl: null,
        deleteRecordRedirectUrl: null,
        resultSuccessDisplayInterval: 2000,
        deleteRecordRedirectInterval: 1000,

        // Callback functions that can be handled. If using this the recommend
        // method is to extend the [entryForm] page object to a new object
        // and then assign these functions. If your site uses multiple entry
        // forms and you update this globally then it could causes unexpected
        // issues if your code is looking at the wrong form.
        onFormLoaded: null,
        onFormBeforeSave: null,
        onFormAfterSave: null,
        onFormAfterDelete: null,
        onFormSaveError: null,
        onFormDeleteError: null,

        // Text that is displayed to the user. These strings can be overwritten
        // to customize the app or use a different language.
        textMessages: {
            savingRecord: 'Saving Record...',
            deletingRecord: 'Deleting Record...',
            recordSaved: 'Record saved at {time}',
            recordDeleted: 'Record deleted at {time}',
            confirmDelete: 'Are you sure that you want to delete this record?',
        },

        /**
         * Populate On-Screen Form Controls from the Model Record Object
         */
        loadFormFields: function () {
            // Set a reference to the model object
            var model = this;

            // Is there a record? If not then the the default values will be kept
            if (model.newRecord) {
                return;
            }

            // Populate form fields with record field values
            var formFields = document.querySelectorAll(model.fieldSelector);
            Array.prototype.forEach.call(formFields, function (formField) {
                // Only update form Elements
                var elementType = formField.nodeName;
                if (elementType === 'INPUT' || elementType === 'SELECT' || elementType === 'TEXTAREA') {
                    // Skip if attribute [data-keep-default] is defined.
                    if (formField.getAttribute('data-keep-default') !== null) {
                        return;
                    }
                    // Parse field name from the HTML Form Element and set the element value
                    var fieldName = (formField.id.indexOf('field-') === 0 ? formField.id : formField.name);
                    fieldName = fieldName.replace('field-', '');
                    var value = (model[fieldName] !== undefined ? model[fieldName] : '');
                    if (formField.type === 'checkbox') {
                        value = String(value).toLowerCase();
                        formField.checked = (value === 'true' || value === '1' || value === 'yes' || value === 'y');
                    } else {
                        formField.value = value;
                    }
                }
            });

            // Run Application Events (if any are defined). For example if a
            // jQuery Control needs to be updated when a input field is set.
            if (app.events !== undefined && typeof app.events.dispatch === 'function') {
                app.events.dispatch('entryForm.loadedFormFields');
            }
        },

        /**
         * Setup Save/Delete and Results element when loading
         */
        setButtonEvents: function () {
            var btn;

            // Hide Save/Delete Label on Load
            this.hideInfo();
            this.hideError();

            // Setup Save and Delete Buttons
            if (this.saveButtonSelector !== '') {
                btn = document.querySelector(this.saveButtonSelector);
                if (btn !== null) {
                    if (this.recordDeleted) {
                        btn.style.display = 'none';
                        btn.onclick = null;
                    } else {
                        btn.onclick = this.saveRecord.bind(this);
                        if (btn.disabled) {
                            btn.disabled = false;
                        }
                    }
                }
            }
            if (this.deleteButtonSelector !== '') {
                btn = document.querySelector(this.deleteButtonSelector);
                if (btn !== null) {
                    if (this.recordDeleted) {
                        btn.style.display = 'none';
                        btn.onclick = null;
                    } else if (this.newRecord) {
                        btn.style.display = 'none';
                    } else {
                        btn.onclick = this.deleteRecord.bind(this);
                        if (btn.disabled) {
                            btn.disabled = false;
                        }
                    }
                }
            }
        },

        /**
         * Show or hide certain elements after the form loads.
         */
        updateCssElements: function () {
            // Are there any elements on screen to hide after loading?
            // This can be used to hide loaders for large forms on pages
            // that have a lot of setup.
            var elements = document.querySelectorAll('.hide-after-form-load');
            Array.prototype.forEach.call(elements, function (element) {
                element.style.display = 'none';
            });

            // Elements to Show?
            elements = document.querySelectorAll('.show-after-form-load');
            Array.prototype.forEach.call(elements, function (element) {
                element.style.display = '';
            });
        },

        /**
         * Show text to the info element from [infoSelector].
         * This is used for save messages, etc.
         * @param {string} text
         * @param {null|int} interval
         * @param {function} callback
         */
        showInfo: function(text, interval, callback) {
            var model = this;
            var el = document.querySelector(this.infoSelector);
            if (el === null) {
                return;
            }
            el.textContent = text;
            el.style.display = '';
            if (interval) {
                window.setTimeout(function() {
                    el.style.display = 'none';
                    model.enableButtons(true);
                    if (callback) {
                        callback();
                    }
                }, parseInt(interval, 10));
            }
        },

        /**
         * Hide the info element from [infoSelector].
         */
        hideInfo: function() {
            var el = document.querySelector(this.infoSelector);
            if (el !== null) {
                el.style.display = 'none';
            }
        },

        /**
         * Show an error message using element from [errorSelector].
         * If it does not exist then [app.showErrorAlert] will be called.
         * @param {string} errorMessage
         */
        showError: function(errorMessage) {
            var el = document.querySelector(this.errorSelector);
            if (el === null) {
                app.showErrorAlert(errorMessage);
                return;
            }
            el.textContent = errorMessage;
            el.style.display = '';
        },

        /**
         * Show an error message using element from [errorListSelector].
         * If it does not exist or is not a <uL> element then [showError] will be called.
         * @param {array} errors
         */
        showErrorList: function(errors) {
            var el = document.querySelector(this.errorListSelector);
            if (el === null || el.nodeName !== 'UL') {
                this.showError(errors.join(' '));
                return;
            }
            el.innerHTML = '';
            for (var n = 0, m = errors.length; n < m; n++) {
                var li = document.createElement('li');
                li.textContent = errors[n];
                el.appendChild(li);
            }
            el.style.display = '';
        },

        /**
         * Hide the error elements from [errorSelector] and [errorListSelector]
         */
        hideError: function() {
            var el = document.querySelector(this.errorSelector);
            if (el !== null) {
                el.style.display = 'none';
            }
            el = document.querySelector(this.errorListSelector);
            if (el !== null) {
                el.style.display = 'none';
            }
        },

        /**
         * Enable or Disable Save and Delete Buttons. This gets called
         * during web service calls to prevent the same call twice.
         * @param {bool} enabled
         */
        enableButtons: function(enabled) {
            var selectors = [this.saveButtonSelector, this.deleteButtonSelector];
            selectors.forEach(function(selector) {
                var btn = document.querySelector(selector);
                if (btn !== null) {
                    btn.disabled = !enabled;
                }
            });
        },

        /**
         * Return the Record (Plain JavaScript Object) based on entered form fields.
         * @return {object}
         */
        getRecord: function() {
            var record = {};
            var errors = [];
            // Get validation function if one is defined
            var validateInput = (app.validation !== undefined && typeof app.validation.validateInput === 'function' ? app.validation.validateInput : null);

            // Add all form fields that start with "field-" to the record
            // and validate fields as they are read.
            var formFields = document.querySelectorAll(this.fieldSelector);
            Array.prototype.forEach.call(formFields, function (formField) {
                // Parse field name from the HTML Form Element
                var fieldName = (formField.name.indexOf('field-') === 0 ? formField.name : formField.id);
                fieldName = fieldName.replace('field-', '');

                // Get the Form field value
                // If a input/select has a [data-value] attribute defined
                // then use that instead of the standard input value.
                // This is usefull for plugins such as an inputmask or custom
                // code that defines a different value to save than to show.
                var value = formField.getAttribute('data-value');
                if (value === null) {
                    if (formField.type === 'checkbox') {
                        value = formField.checked;
                    } else {
                        value = formField.value;
                    }
                }

                // If a date type is specified then cast the value as that type.
                // Invalid values will be replaced with null and when the standard
                // extension [validation.js] is used return an error message.
                if (value !== '') {
                    var dataType = formField.getAttribute('data-type');
                    if (dataType === 'int') {
                        value = parseInt(value, 10);
                        if (isNaN(value)) {
                            value = null;
                        }
                    } else if (dataType === 'float') {
                        value = parseFloat(value);
                        if (isNaN(value)) {
                            value = null;
                        }
                    }
                }

                // Save empty strings as null
                if (value === '') {
                    value = null;
                }

                // Validate
                if (validateInput) {
                    var error = validateInput(formField, fieldName);
                    if (error) {
                        errors.push(error);
                    }
                }

                // Add field as a object property
                record[fieldName] = value;
            });

            // Add multiple records if using the plugin [listEditor.js]. These will
            // often be related records however the form itself could also be a
            // list of records rather than a single record.
            if (app.plugins.listEditor !== undefined &&
                typeof app.plugins.listEditor.listSelector === 'function' &&
                typeof app.plugins.listEditor.validate === 'function'
            ) {
                // Optional validation
                if (validateInput) {
                    errors = errors.concat(app.plugins.listEditor.validate());
                }

                // Add each list as a new property to the record object
                var selector = app.plugins.listEditor.listSelector();
                var editListControls = document.querySelectorAll(selector);
                Array.prototype.forEach.call(editListControls, function(control) {
                    var name = control.getAttribute('data-edit-list');
                    if (name !== null && app.activeModel[name] !== undefined && Array.isArray(app.activeModel[name])) {
                        // Add array to record object
                        record[name] = app.activeModel[name];
                    }
                });
            }

            return {record:record, errors:errors};
        },

        /**
         * Save the form when the user clicks a save button.
         * By default this gets assigned to an element [.btn-save]
         * if one exists on the screen.
         *
         * @param {Event} e
         */
        saveRecord: function (e) {
            // Reference the current model object
            var model = this;

            // Prevent form posts. If using a <button> without [type="button"]
            // then by default the browser will likely do a full POST, however
            // if <button type="button"> is used then the page will not POST.
            if (e && e.preventDefault) {
                e.preventDefault();
            }

            // Get record
            var data = model.getRecord();
            var record = data.record;

            // Validate
            if (Object.keys(record).length === 0) {
                model.showError('Error - Unable to save. No fields were found on the page.');
                return;
            } else if (model.saveUrl === null || model.saveUrl === '') {
                model.showError('Error - Unable to save. The property [entryForm.saveUrl] or [data-save-url] is not defined.');
                return;
            } else if (data.errors.length > 0) {
                model.showErrorList(data.errors);
                return;
            } else if (typeof model.onFormBeforeSave === 'function') {
                var isValid = model.onFormBeforeSave(record);
                if (!isValid) {
                    return;
                }
            }

            // Update model with current record properties
            Object.assign(model, record);

            // Disable Buttons and show Saving Status
            model.enableButtons(false);
            model.hideError();
            model.showInfo(model.textMessages.savingRecord);

            // Save the record
            var url = app.buildUrl(model.saveUrl);
            app
            .fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
            })
            .then(function(data) {
                var newRecordWasAdded = false;

                // When using the default save API the property {success:bool} is expected
                // otherwise assume if no error than the save was valid.
                var success = (model.useSaveApi ? data.success : true);
                if (success) {
                    if (model.newRecord) {
                        newRecordWasAdded = true;
                    }
                    model.newRecord = false;

                    // If the save service sent back fields then show them on screen.
                    // This will typically be used when inserting new records to return
                    // any auto-generated fields or to show server-controlled fields after
                    // a record is updated.
                    // When using the default save API the property "fields:{}" are used
                    // to update the page otherwise simply update the model with anything
                    // that the server sent back.
                    var fields = (model.useSaveApi ? data.fields : data);
                    if (fields !== undefined) {
                        for (var fieldName in fields) {
                            if (Object.prototype.hasOwnProperty.call(fields, fieldName)) {
                                model[fieldName] = fields[fieldName];
                            }
                        }
                        model.loadFormFields();
                        model.setButtonEvents(); // Allow [Delete] button to be visible after adding new records
                        app.refreshAllHtmlControls();
                        app.loadAllJsControls();
                    }

                    // Show Saved Message
                    // Defaults to a generic "Record saved at {time}", however this can be overridden client-side
                    // by setting [model.textMessages.recordSaved] or server-side by returning [result].
                    var message = (typeof data.result === 'string' ? data.result : model.textMessages.recordSaved);
                    var time = new Date();
                    time = (time.toLocaleTimeString ? time.toLocaleTimeString() : time.toTimeString());
                    message = message.replace(/{time}/g, time);
                    model.showInfo(message, model.resultSuccessDisplayInterval, function() {
                        // Optional Redirect when Records are saved
                        var redirectUrl = (newRecordWasAdded ? model.newRecordRedirectUrl : model.updateRecordRedirectUrl);
                        if (redirectUrl !== null) {
                            // Only Redirect is the user is still on the page.
                            // For example if they delete and quickly click a new link
                            // this code will run but the following will evaluate to false.
                            if (app.activeModel !== model) {
                                return;
                            }
                            // Redirect
                            if (data.fields !== undefined) {
                                app.activeParameterList = data.fields;
                            }
                            redirectUrl = app.buildUrl(redirectUrl);
                            if (redirectUrl.indexOf('#') === 0) {
                                window.location.hash = redirectUrl;
                            } else {
                                window.location = redirectUrl;
                            }
                        }
                    });

                    // If a callback event is defined for the save event then call it
                    if (typeof model.onFormAfterSave === 'function') {
                        model.onFormAfterSave();
                    }
                } else {
                    model.setButtonEvents();
                    var error = (data.errorMessage === undefined ? null : data.errorMessage);
                    if (error === null && model.useSaveApi && data.success === undefined) {
                        error = 'Error - Save/Submit Web Service did not return the expected [success] property. If not using the standard entry form API use either [data-use-save-api="false"] or [model.useSaveApi = false].';
                    }
                    model.showError(error);
                }
            })
            .catch(function(error) {
                model.setButtonEvents();
                model.showError(error);
                if (typeof model.onFormSaveError === 'function') {
                    model.onFormSaveError(error);
                }
            });
        },

        /**
         * Delete the form when the user clicks a delete button.
         * By default this gets assigned to an element [.btn-delete]
         * if one exists on the screen.
         *
         * @param {Event} e
         */
        deleteRecord: function (e) {
            // Reference the current model object
            var model = this;

            // Prevent form posts. See comments in [saveRecord()]
            if (e && e.preventDefault) {
                e.preventDefault();
            }

            // Validate
            if (model.deleteUrl === null || model.deleteUrl === '') {
                model.showError('Error - Unable to save. The property [entryForm.deleteUrl] or [data-delete-url] is not defined.');
                return;
            }

            // Delete Settings
            // Fields are only submitted if the default URL doesn't include any parameters
            // For example ['/record/delete/:id'] will prevent fields from being posted.
            var url = app.buildUrl(model.deleteUrl);
            var record = null;
            if (url === model.deleteRecord) {
                var data = model.getRecord();
                record = data.record;
                if (Object.keys(record).length === 0) {
                    model.showError('Error - Unable to delete. No fields were found on the page.');
                    return;
                }
                record = JSON.stringify(record);
            }

            // Confirm with user
            if (model.textMessages.confirmDelete) {
                if (!confirm(model.textMessages.confirmDelete)) {
                    return;
                }
            }

            // Disable Buttons and show Deleting Status
            model.enableButtons(false);
            model.hideError();
            model.showInfo(model.textMessages.deletingRecord);

            // Delete the Record
            app
            .fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: record,
            })
            .then(function(data) {
                if (data.success) {
                    // Set model properties and hide save/delete buttons
                    model.recordDeleted = true;
                    model.setButtonEvents();

                    // Show Deleted Message
                    var message = (typeof data.result === 'string' ? data.result : model.textMessages.recordDeleted);
                    var time = new Date();
                    time = (time.toLocaleTimeString ? time.toLocaleTimeString() : time.toTimeString());
                    message = message.replace(/{time}/g, time);
                    model.showInfo(message);

                    // If a callback event is defined for the save event then call it
                    if (typeof model.onFormAfterDelete === 'function') {
                        model.onFormAfterDelete();
                    }

                    // Optional Redirect on a Timer (defaults to 1 second)
                    if (model.deleteRecordRedirectUrl !== null) {
                        window.setTimeout(function() {
                            // Only Redirect is the user is still on the page.
                            // For example if they delete and quickly click a new link
                            // this code will run but the following will evaluate to false.
                            if (app.activeModel !== model) {
                                return;
                            }
                            // Redirect
                            if (data.fields !== undefined) {
                                app.activeParameterList = data.fields;
                            }
                            var redirectUrl = app.buildUrl(model.deleteRecordRedirectUrl);
                            if (redirectUrl.indexOf('#') === 0) {
                                window.location.hash = redirectUrl;
                            } else {
                                window.location = redirectUrl;
                            }
                        }, model.deleteRecordRedirectInterval);
                    }
                } else {
                    model.setButtonEvents();
                    model.showError(data.errorMessage === undefined ? null : data.errorMessage);
                }
            })
            .catch(function(error) {
                model.setButtonEvents();
                model.showError(error);
                if (typeof model.onFormDeleteError === 'function') {
                    model.onFormDeleteError(error);
                }
            });
        },

        // Called once when the view is loaded with data
        setupView: function () {
            this.loadFormFields();
            this.setButtonEvents();
            this.updateCssElements();

            // If a callback event is defined for the save event then call it
            if (typeof this.onFormLoaded === 'function') {
                this.onFormLoaded();
            }
        }
    });

    /**
     * Load data when the route has changed.
     * Code here is based on and overrides the version from [jsonData].
     */
    entryForm.onRouteLoad = function () {
        if (this.newRecord && !this.url) {
            this.isLoaded = true;
            this.hasError = false;
            this.setViewClass('loaded');
            return;
        }
        app.pages.jsonData.onRouteLoad.call(this);
    };

    /**
     * Define the Controller onRendered() function
     * This gets called each time the view is redrawn.
     */
    entryForm.onRendered = function () {
        if (this.isLoaded) {
            this.setupView();
        }
    };

    /**
     * Add entryForm as a Page object
     */
    app.addPage('entryForm', entryForm);
})();
