/**
 * DataFormsJS Handlebars Helpers
 *
 * Required Dependencies:
 *     http://handlebarsjs.com/
 *
 * Optional Dependencies:
 *     http://momentjs.com/
 *
 * For additional Handlebars Helpers see:
 *     http://formatjs.io/handlebars/
 *     https://github.com/raDiesle/Handlebars.js-helpers-collection
 *     https://github.com/elving/swag
 *
 * [js] and [ifJs] Helpers are based on this code (MIT License):
 *     https://gist.github.com/akhoury/9118682
 */

/* Validates with both [jshint] and [eslint] */
/* global Handlebars, moment */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';
    
    // This gets called from the bottom of this file
    function addHelpers() {
        // If handlebars is not specified as a <script> on the page then exit
        if (!window.Handlebars) {
            console.warn('[handlebars-helpers.js] is included in this page but Handlebars was not found.');
            return;
        }

        // Return true if a valid number, this excludes Infinity and NaN
        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        // Format a date, date/time or time value with Intl.DateTimeFormat()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
        function formatDateTime(dateTime, options) {
            // Fallback to data in original format.
            // As of 2019 this would most likely happen on older iOS.
            if (window.Intl === undefined) {
                return dateTime;
            }

            // Return formatted date/time in the user's local language
            try {
                if (dateTime instanceof Date) {
                    return new Intl.DateTimeFormat(navigator.language, options).format(dateTime);
                } else {
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
        }

        // Format a numeric value with Intl.NumberFormat()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
        function formatNumber(value, options) {
            var style,
                maximumFractionDigits,
                digitGrouping = null,
                decimalMark = null,
                currencySymbol = null,
                numberParts,
                formattedValue,
                language;

            // Get the user's selected language.
            // navigator.language = Standards Version in most browsers and new versions of IE
            // navigator.userLanguage = Older versions of IE such as IE 9
            language = (navigator.language ? navigator.language : navigator.userLanguage);

            // Check for a valid number
            if (value === null || value === '') {
                return null;
            }
            if (!isNumber(value)) {
                console.warn('Warning value specified in DateFormsJS Handlebars Helper function formatNumber() is not a number:');
                console.log(value);
                return value;
            }

            // Fallback if Intl.NumberFormat() is not supported.
            // For example IE9 and below or versions of Safari.
            if (window.Intl === undefined) {
                // Get the specified options
                style = (options.style ? options.style : null);
                maximumFractionDigits = (options.maximumFractionDigits ? options.maximumFractionDigits : 0);

                // If percent provide a basic formatting fallback
                if (style === 'percent') {
                    return (value * 100).toFixed(maximumFractionDigits) + '%';
                }

                // Fallback for specific langauges
                switch (language) {
                    case 'en-us':
                        digitGrouping = ',';
                        decimalMark = '.';
                        currencySymbol = '$';
                        break;
                }

                if (digitGrouping !== null) {
                    numberParts = value.toString().split('.');
                    numberParts[0] = numberParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    formattedValue = numberParts.join(decimalMark);

                    if (style === 'currency') {
                        return currencySymbol + formattedValue;
                    } else {
                        return formattedValue;
                    }
                }

                // Return the value as it was passed to this function
                return value;
            }

            // Return formatted number/currency/percent/etc in the user's local language
            try {
                return new Intl.NumberFormat(language, options).format(value);
            } catch (e) {
                // If Error log to console and return 'Error' text
                console.warn('Error formatting Numeric Value:');
                console.log(language);
                console.log(options);
                console.log(value);
                console.log(e);
                return 'Error';
            }
        }

        // Return the current date/time
        Handlebars.registerHelper('now', function () {
            return new Date();
        });

        // Percent Format
        // Converts a decimal value to percent format
        // The 2nd parameter [decimalPlaces] is optional.
        // For example:
        //   {{formatPercent 0.2767}} = '28%'
        //   {{formatPercent 0.27}} = '27%'
        //   {{formatPercent 0.2767 3}} = '27.670%'
        Handlebars.registerHelper('formatPercent', function (decimalValue, decimalPlaces, options) {
            // Check that a value was passed, return the text 'Error' if not
            if (decimalPlaces === undefined) {
                console.warn('Warning {{formatPercent}} is not being called with correct parameters, expected {{formatPercent decimalValue}}, parameters:');
                console.log(options);
                return 'Error';
            }

            // Decimal Places are optional
            var decimals = (options === undefined ? 0 : Number(decimalPlaces));

            // Return the number formatted as a percent
            var intlOptions = {
                style: 'percent',
                maximumFractionDigits: decimals,
                minimumFractionDigits: decimals,
            };
            return formatNumber(decimalValue, intlOptions);
        });

        // Format a Number
        Handlebars.registerHelper('formatNumber', function (value, options) {
            // Check that a value was passed, return the text 'Error' if not
            if (options === undefined) {
                console.warn('Warning {{formatNumber}} is not being called with correct parameters, expected {{formatNumber value}}, parameters:');
                console.log(value);
                console.log(options);
                return 'Error';
            }

            // Return the formatted number
            return formatNumber(value, {});
        });

        // Format a Currency
        Handlebars.registerHelper('formatCurrency', function (value, currencyCode, options) {
            // Make sure this function is called correctly
            if (currencyCode === undefined || options === undefined) {
                console.warn('Warning {{formatCurrency}} is not being called with correct parameters, expected {{formatCurrency value currencyCode}}, parameters:');
                console.log(value);
                console.log(currencyCode);
                console.log(options);
                return 'Error';
            }

            // Return the formatted currency
            var intlOptions = { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 };
            return formatNumber(value, intlOptions);
        });

        // Format a date
        Handlebars.registerHelper('formatDate', function (date, options) {
            // Make sure this function is called correctly
            if (options === undefined) {
                console.warn('Warning {{dateformatDate} is not being called with correct parameters, expected {{formatDate value}}, parameters:');
                console.log(date);
                console.log(options);
                return 'Error';
            }

            // Return the formatted date
            return formatDateTime(date, {});
        });

        // Format a date/time
        Handlebars.registerHelper('formatDateTime', function (dateTime, options) {
            // Make sure this function is called correctly
            if (options === undefined) {
                console.warn('Warning {{formatDateTime}} is not being called with correct parameters, expected {{formatDateTime value}}, parameters:');
                console.log(dateTime);
                console.log(options);
                return 'Error';
            }

            // Return the formatted date and time
            var intlOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
            return formatDateTime(dateTime, intlOptions);
        });

        // Format a time
        Handlebars.registerHelper('formatTime', function (dateTime, options) {
            // Make sure this function is called correctly
            if (options === undefined) {
                console.warn('Warning {{time}} is not being called with correct parameters, expected {{time value}}, parameters:');
                console.log(dateTime);
                console.log(options);
                return 'Error';
            }

            // Return the formatted time
            var intlOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
            return formatDateTime(dateTime, intlOptions);
        });

        // Format a date/time value with moment.
        Handlebars.registerHelper('moment', function (date, format, options) {
            // Validation Warnings if optional dependencies are missing
            if (window.moment === undefined) {
                console.warn('Warning moment needs to be included to be used as a Handlebars Helper.');
                return date;
            }

            // If only one parameter was passed and it is a string then the current
            // date will be displayed with the format specified in the first parameter.
            // Example:
            //   {{moment "MMMM Do YYYY, h:mm:ss a"}}
            if (options === undefined && typeof date === 'string') {
                format = date;
                return moment().format(format);
            }

            // Is the date valid? If an invalid parameter is passed then the
            // date will be undefined. Assume the function was called incorrectly
            // and return an error string to the template.
            if (date === undefined) {
                console.log('Warning date is undefined in DateFormsJS Handlebars Helper moment()');
                return '{{Date is not defined}}';
            }

            // Both date and format are passed. Note, when an invalid string date
            // is passed then moment() will return 'Invalid date'.
            //
            // Examples:
            //   {{moment (now) "YYYY.MM.DD"}}
            //   {{moment "2014-10-21" "YYYY.MM.DD"}}
            //   {{moment dateValue "YYYY.MM.DD"}}
            if (date instanceof Date) {
                return moment(date).format(format);
            } else {
                var value = moment(new Date(date)).format(format);
                if (value === 'Invalid date') {
                    console.log('Warning an invalid date was passed as a parameter in the DateFormsJS Handlebars Helper moment()');
                }
                return value;
            }
        });

        // Returns a formatted String. Multiple options for String Formatting based on
        // property names or based on a parameter array and position of the passed parameters.
        Handlebars.registerHelper('format', function () {
            var model = this,
                args = arguments,
                s = args[0];

            // Note - there will always be an extra argument from Handlebars
            if (args.length === 2) {
                // String interpolation using property names of the model.
                s = s.replace(/{(\w+)}/g, function (match, property) {
                    return (model[property] === undefined ? match : model[property]);
                });
            } else {
                // String formatting based on argument position.
                // Similar to DotNet String.Format().
                // This would be comparable to sprintf() in many langauges
                // however rather than using '%s' the format of '{#}' is used.
                s = s.replace(/{(\d+)}/g, function (match, number) {
                    var arg = args[parseInt(number, 10) + 1];
                    return (arg === undefined ? match : arg);
                });
            }

            return s;
        });

        // Array Join
        Handlebars.registerHelper('join', function () {
            var seperator = arguments[0],
                values = [];

            // There will always be an extra argument from Handlebars
            // so the last argument is not checked and the first item
            // is not checked because it is used as the seperator
            for (var n = 1, m = arguments.length - 1; n < m; n++) {
                values.push(arguments[n]);
            }

            return values.join(seperator);
        });

        // String Concatenation
        // Combine multiple strings into a single string and return the result
        Handlebars.registerHelper('concat', function () {
            var s = '';

            // There will always be an extra argument from Handlebars
            // so the last argument is not checked
            for (var n = 0, m = arguments.length - 1; n < m; n++) {
                s += arguments[n];
            }

            return s;
        });

        /**
         * This is similar to the built-in {{log value}} helper but provides
         * more detail to include the context object.
         *
         * This function depends on the format() helper defined in this file.
         */
        Handlebars.registerHelper('debug', function () {
            // Show the context object
            console.log('=======================');
            console.log(this);

            // List each aurgument passed to the function
            for (var n = 0, m = arguments.length; n < m - 1; n++) {
                console.log(Handlebars.helpers.format('arguments[{0}]: {1}', n, arguments[n]));
            }
        });

        // This helper convert HTML to plain-text
        Handlebars.registerHelper('htmlToText', function (html) {
            var temp = document.createElement('div');
            temp.innerHTML = html;
            return temp.textContent;
        });

        // Encode text with encodeURI()
        // This function is designed to handle null and undefined values.
        Handlebars.registerHelper('encodeURI', function (text) {
            var value = (typeof text === 'string' ? text : '');
            return new Handlebars.SafeString(encodeURI(value));
        });

        // Encode text with encodeURIComponent()
        // This function is designed to handle null and undefined values.
        Handlebars.registerHelper('encodeURIComponent', function (text) {
            var value = (typeof text === 'string' ? text : '');
            return new Handlebars.SafeString(encodeURIComponent(value));
        });

        /**
         * nl2br (New-Line to <br>)
         */
        Handlebars.registerHelper('nl2br', function (text) {
            // From:
            // http://stackoverflow.com/questions/12331077/does-handlebars-js-replace-newline-characters-with-br
            text = Handlebars.Utils.escapeExpression(text);
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            return new Handlebars.SafeString(text);
        });

        /**
         * Convert a case-insenstive value of [true, 1, yes] to 'Yes',
         * otherwise return null.
         */
        Handlebars.registerHelper('yesNo', function (value) {
            value = String(value).toLowerCase();
            if (value === 'true' || value === '1' || value === 'yes') {
                return 'Yes';
            } else {
                return 'No';
            }
        });

        /**
         * Convert a case-insenstive value of [true, 1, yes] to 'Yes',
         * [false, 0, no] to 'No', otherwise return null.
         */
        Handlebars.registerHelper('yesNoNull', function (value) {
            if (value === null) {
                return value;
            }
            value = String(value).toLowerCase();
            if (value === 'true' || value === '1' || value === 'yes') {
                return 'Yes';
            } else if (value === 'false' || value === '0' || value === 'no') {
                return 'No';
            } else {
                return null;
            }
        });

        /**
         * JavaScript Expressions
         */
        Handlebars.registerHelper('js', function (expression, options) {
            try {
                // Get the Root Object [model]; if found is assigned to the scope of the expression,
                // this is useful in {{#each list}} loops where [this] will be the object.
                var model = (options.data && options.data._parent && options.data._parent.root ? options.data._parent.root : null);
                if (model === null) {
                    model = (options.data && options.data.root ? options.data.root : null);
                }

                // Create a dynamic function to evaluate the expression
                var fn = function () { };
                fn = Function.apply(null, ['window', 'model', 'return ' + expression + ';']);
                return fn.call(this, window, model);
            } catch (e) {
                // If Error log to console and return 'Error' text
                console.warn('The JavaScript expression {{js "' + expression + '"}} could not be parsed or evaluated.');
                console.warn(e);
                return 'Error';
            }
        });

        /**
         * {{#ifJs condition}} JavaScript statement logic
         */
        Handlebars.registerHelper('ifJs', function (expression, options) {
            // If needed uncomment and moidfy the following lines to see expressions in developer tools
            // if (expression.indexOf('search criteria') > -1) {
            //    console.log(expression);
            // }

            try {
                var condition = Handlebars.helpers.js.apply(this, [expression, options]);
                return (condition === true ? options.fn(this) : options.inverse(this));
            } catch (e) {
                return options.inverse(this);
            }
        });

        /**
         * Basic [if] statement logic
         * Modified From: http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
         * Added 'in' for this application
         */
        Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
            switch (operator) {
                case 'in':
                    var data = v2.split('|');
                    return (data.indexOf(v1) !== -1) ? options.fn(this) : options.inverse(this);
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        });

        /**
         * Build a <select> element using an array of data
         *
         * Example:
         *     Assume [categories] is an array in the model and [category] is the selected value
         *     {{select 'class="form-control" name="category"' categories category 'allow-null'}}
         */
        Handlebars.registerHelper('select', function (attr, list, selectedValue, allowNull) {
            var html = [];
            html.push('<select ' + String(attr) + '>');
            allowNull = String(allowNull);
            if (allowNull === 'true' || allowNull === '1' || allowNull === 'allow-null' || allowNull === 'allow-empty') {
                html.push('<option></option>');
            }
            if (Array.isArray(list)) {
                selectedValue = String(selectedValue);
                list.forEach(function(item) {
                    var isObj = (typeof item === 'object' && item.value !== undefined && item.label !== undefined);
                    var value = (isObj ? item.value : String(item));
                    var label = (isObj ? item.label : String(item));
                    var selectedAttr = (value === selectedValue ? ' selected' : '');
                    html.push('<option value="' + Handlebars.Utils.escapeExpression(value) + '"' + selectedAttr + '>' + Handlebars.Utils.escapeExpression(label) + '</option>');
                });
            } else {
                console.warn('DataFormsJS - {{select}} Handlebars Helper was called with an invalid list. See docs and source code for usage.');
            }
            html.push('</select>');
            return new Handlebars.SafeString(html.join('\n'));
        });

        /**
         * Convert a string to 'lowercase'
         */
        Handlebars.registerHelper('lowerCase', function (value) {
            return String(value).toLowerCase();
        });

        /**
         * Convert a string to 'UPPERCASE'
         */
        Handlebars.registerHelper('upperCase', function (value) {
            return String(value).toUpperCase();
        });
    }

    // Load helpers once document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addHelpers);
    } else {
        addHelpers();
    }
})();
