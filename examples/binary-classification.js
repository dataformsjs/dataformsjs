/**
 * This is a custom page object used for [binary-classification-hbs.htm]
 * and [binary-classification-vue.htm] examples.
 *
 * The page object is created by extending/copying the core [js/pages/entryForm.js] file.
 * This demo shows how you can use the built-in features of [entryForm] for a page
 * allowing for a relatively small amount of JS code needed for a custom form.
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

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Create the Page Object by copying the entryForm Page
     */
    var page = app.deepClone({}, app.pages.entryForm);

    /**
     * The [entryForm.model] defines callback functions that can be handled
     * when it is extended.
     */
    Object.assign(page.model, {
        // New Values Button Reference
        btnNewValues: null,

        // Entry Form Events
        // Simpley enable/disable the custom [New Random Values] button while
        // data is being submitted.
        onFormLoaded: function() {
            this.btnNewValues = document.querySelector('.btn-new-values');
            this.btnNewValues.onclick = this.newValues.bind(this);
        },
        onFormBeforeSave: function() {
            this.btnNewValues.disabled = true;
            return true; // Valid to submit/save
        },
        onFormAfterSave: function() { this.btnNewValues.disabled = false; },
        onFormSaveError: function() { this.btnNewValues.disabled = false; },

        // Set new random values and run a new prediction after
        newValues: function() {
            var elements = document.querySelectorAll('input[id^="field-"]');
            Array.prototype.forEach.call(elements, function(el) {
                var isFloat = el.step.includes('.');
                if (isFloat) {
                    var value = getRandomArbitrary(parseFloat(el.min), parseFloat(el.max));
                    value = Number(value).toFixed(el.step.length - 2);
                    el.value = value;
                } else {
                    el.value = getRandomIntInclusive(parseInt(el.min, 10), parseInt(el.max, 10));
                }
            });
            // Call prediction web service, [saveRecord()] is
            // defined in the core [pages/entryForm.js] file.
            this.saveRecord();
        },
    });

    /**
     * Add page to app
     */
    app.addPage('binaryPredictionPage', page);
})();
