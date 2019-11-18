/**
 * This is a standard JavaScript class which is intended for use
 * with the React Components to provide an easy to use API for
 * formatting Numbers, Dates, Times, etc.
 * 
 * Example:
 *     const format = new Format();
 *     {format.number(country.area_km)}
 *     {format.date(region.modification_date)}
 * 
 * API:
 *     format.number(value)
 *     format.currency(value, currencyCode)
 *     format.percent(value, decimalPlaces?)
 *         format.percent(0.2767) = '28%'
 *         format.percent(0.27) = '27%'
 *         format.percent(0.2767, 2) = '27.67%'
 *     format.date(value)
 *     format.dateTime(value)
 *     format.time(value)
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

export default class Format {
    number(value) {
        return formatNumber(value, {});
    }

    currency(value, currencyCode) {
        var intlOptions = { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 };
        return formatNumber(value, intlOptions);
    }

    percent(value, decimalPlaces=0) {
        var intlOptions = {
            style: 'percent',
            maximumFractionDigits: decimalPlaces,
            minimumFractionDigits: decimalPlaces,
        };
        return formatNumber(value, intlOptions);
    }

    date(value) {
        return formatDateTime(value, {});
    }

    dateTime(value) {
        var intlOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        return formatDateTime(value, intlOptions);
    }

    time(value) {
        var intlOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
        return formatDateTime(value, intlOptions);
    }
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
