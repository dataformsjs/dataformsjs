/**
 * DataFormsJS [app.format] extension for formatting values
 * (numbers, dates, etc) in the user's local language.
 *
 * Functions added:
 *     app.format.number(value)
 *     app.format.round(value, decimalPlaces)
 *     app.format.currency(value, currencyCode)
 *     app.format.percent(value, decimalPlaces)
 *     app.format.date(value)
 *     app.format.dateTime(value)
 *     app.format.time(value)
 *     app.format.isNumber(value)
 *
 * Advanced Functions - Used internally but they
 * can also be used by an App:
 *     app.format.formatDateTime(dateTime, options)
 *     app.format.formatNumber(value, options)
 *
 * If using DataFormsJS with Vue or Handlebars then this file would not be
 * used by most apps and instead one of the following scripts can be used:
 *     js/extensions/handlebars-helpers.js
 *     js/extensions/vue-directives.js
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

    var format = {
        number: function(value) {
            return this.formatNumber(value, {});
        },

        round: function(value, decimalPlaces) {
            if (decimalPlaces === undefined) {
                decimalPlaces = 0;
            }
            var intlOptions = {
                style: 'decimal',
                maximumFractionDigits: decimalPlaces,
                minimumFractionDigits: decimalPlaces,
            };
            return this.formatNumber(value, intlOptions);
        },

        currency: function(value, currencyCode) {
            var intlOptions = { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 };
            return this.formatNumber(value, intlOptions);
        },

        percent: function(value, decimalPlaces) {
            if (decimalPlaces === undefined) {
                decimalPlaces = 0;
            }
            var intlOptions = {
                style: 'percent',
                maximumFractionDigits: decimalPlaces,
                minimumFractionDigits: decimalPlaces,
            };
            return this.formatNumber(value, intlOptions);
        },

        date: function(value) {
            return this.formatDateTime(value, {});
        },

        dateTime: function(value) {
            var intlOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
            return this.formatDateTime(value, intlOptions);
        },

        time: function(value) {
            var intlOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
            return this.formatDateTime(value, intlOptions);
        },

        // Return true if a valid number, this excludes Infinity and NaN
        isNumber: function(value) {
            return (!isNaN(parseFloat(value)) && isFinite(value));
        },

        // Format a date, date/time or time value with Intl.DateTimeFormat()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
        formatDateTime: function(dateTime, options) {
            // Fallback to data in original format.
            // As of 2020 this would most likely happen on older iOS.
            if (window.Intl === undefined) {
                return dateTime;
            }

            // Return formatted date/time in the user's local language
            try {
                if (dateTime instanceof Date) {
                    return new Intl.DateTimeFormat(navigator.language, options).format(dateTime);
                } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) {
                    // Basic date without timezone (YYYY-MM-DD)
                    var nums = dateTime.split('-').map(function(n) { return parseInt(n, 10); });
                    var date = new Date(nums[0], nums[1] - 1, nums[2]);
                    return new Intl.DateTimeFormat(navigator.language, options).format(date);
                } else {
                    // Assume JavaScript `Date` object can parse the date.
                    // In the future a new Temporal may be used instead:
                    //    https://tc39.es/proposal-temporal/docs/
                    var localDate = new Date(dateTime);
                    return new Intl.DateTimeFormat(navigator.language, options).format(localDate);
                }
            } catch (e) {
                // If Error log to console and return 'Error' text
                console.warn('Error formatting Date/Time Value:');
                console.log(navigator.language);
                console.log(options);
                console.log(dateTime);
                console.log(e);
                return 'Error';
            }
        },

        // Format a numeric value with Intl.NumberFormat()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
        formatNumber: function(value, options) {
            // Check for a valid number
            if (value === null || value === '') {
                return null;
            }
            if (!this.isNumber(value)) {
                console.warn('Warning value specified in DateFormsJS function formatNumber() is not a number:');
                console.log(value);
                return value;
            }

            // Fallback to data in original format.
            // As of 2020 this would most likely happen on older iOS.
            if (window.Intl === undefined) {
                return value;
            }

            // Return formatted number/currency/percent/etc in the user's local language
            try {
                return new Intl.NumberFormat(navigator.language, options).format(value);
            } catch (e) {
                // If Error log to console and return 'Error' text
                console.warn('Error formatting Numeric Value:');
                console.log(navigator.language);
                console.log(options);
                console.log(value);
                console.log(e);
                return 'Error';
            }
        },
    };

    // Assign format Object to the app Object
    app.format = format;
})();
