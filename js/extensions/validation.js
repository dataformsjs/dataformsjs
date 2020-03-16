/**
 * DataFormsJS [app.validation] Extension.
 *
 * If loaded then it this file is usedwith:
 *     DataFormsJS\js\pages\entryForm.js
 *     DataFormsJS\js\plugins\listEditor.js
 *
 * If you would like to use your own validation with one of the above files
 * then simply copy and modify this file.
 */

/* Validates with both [jshint] and [eslint] */
/* global app */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function() {
    'use strict';

    var validation = {
        text: {
            requiredField: '[{field}] is a required field.',
            typeNumber: '[{field}] needs to be entered as a number.',
            row: 'Row',
        },

        validateInput: function(element, fieldName, rowIndex, listLabel) {
            // Make sure an valid element was passed
            var elementType = element.nodeName;
            if (!(elementType === 'INPUT' || elementType === 'SELECT' || elementType === 'TEXTAREA')) {
                throw new TypeError('Error invalid function call at [DataFormsJS.validation.validateInput]');
            }

            // Get the Form field value
            // If a input/select has a [data-value] attribute defined
            // then use that instead of the standard input value.
            // This is usefull for plugins such as an inputmask or custom
            // code that defines a different value to save than to show.
            var value = element.getAttribute('data-value');
            if (value === null) {
                if (element.type === 'checkbox') {
                    value = element.checked;
                } else {
                    value = element.value;
                }
            }

            // HTML [required] attribute
            var errorText = null;
            if (element.required && String(value).trim() === '') {
                errorText = validation.text.requiredField;
            }

            // If [date-type] is specified then validate the type.
            if (value !== '') {
                var dataType = element.getAttribute('data-type');
                if (dataType === 'int') {
                    value = parseInt(value, 10);
                    if (isNaN(value)) {
                        errorText = validation.text.typeNumber;
                    }
                } else if (dataType === 'float') {
                    value = parseFloat(value);
                    if (isNaN(value)) {
                        errorText = validation.text.typeNumber;
                    }
                }
            }

            // Update Error text with field name
            if (errorText) {
                // Get field name to display to the user.
                // Get the related <label> element if one exists.
                var fieldLabel = null;
                if (element.id !== '') {
                    fieldLabel = document.querySelector('label[for="' + element.id + '"]');
                    if (fieldLabel !== null) {
                        fieldLabel = fieldLabel.textContent;
                    }
                }
                if (fieldLabel === null) {
                    fieldLabel = element.getAttribute('data-label');
                }
                if (fieldLabel === null) {
                    // [fieldName] is supplied as an optional parameter to the function.
                    // It is used by [entryForm.js] for validation, however <label> is
                    // the priority as it is what the user would read and is standard HTML.
                    fieldLabel = (typeof fieldName === 'string' ? fieldName : null);
                }
                if (fieldLabel === null) {
                    fieldLabel = (element.name ? element.name : element.id);
                }
                if (fieldLabel === '') {
                    fieldLabel = 'Form Field';
                }

                // Row index and Table Name can be passed to build messages when there are multiple records in a list
                if (rowIndex) {
                    fieldLabel = validation.text.row + ' ' + String(rowIndex) + ', ' + fieldLabel;
                }
                if (listLabel) {
                    fieldLabel = listLabel + ', ' + fieldLabel;
                }

                // Update Error Text with field name. [undefined] could happen if a value
                // such as [validation.text.requiredField] were overwritten by other code.
                if (errorText === undefined) {
                    errorText = 'Error with field [' + fieldLabel + '].';
                } else {
                    errorText = errorText.replace(/{field}/g, fieldLabel);
                }
            }

            // Returns null or an error message
            return errorText;
        },
    };

    app.validation = validation;
})();