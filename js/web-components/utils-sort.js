/**
 * DataFormsJS Utility Functions for Sorting
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

/**
 * Return an object that can be used with [smartSort()] and [Array.sort()].
 * All elements to be sorted should be passed to this function prior to sorting
 * and then the results of this function will be sorted. For example usage
 * see [sortable-table.js].
 * 
 * @param {HTMLElement} element Linked element for sorting
 * @param {string} text Sort Value
 * @return {object}
 */
export function getSortObject(element, text) {
    let dataType = (typeof text);
    let value = text;

    // Convert to correct type from string (example '123' string to 123 number)
    if (value === '') {
        value = null;
    } else if (!isNaN(value)) {
        value = parseFloat(value);
    } else {
        // Is it a Date?
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
            value = dateValue;
            dataType = 'date';
        } else {
            // Convert strings to lowercase
            value = (value.toLocaleLowerCase !== undefined ? value.toLocaleLowerCase() : value.toLowerCase());
        }
    }

    return {
        el: element,
        value: value,
        type: (value === null ? null : dataType),
    };
}

/**
 * Smart Sorting based on data value
 * 
 * Used with [getSortObject()] and [Array.sort()] so numbers can be sorted as
 * numbers, strings as strings, dates as dates, etc.
 * 
 * Sort Order:
 *   1) Null (Empty String are converted to null)
 *   2) Numbers
 *   3) Dates
 *   4) Strings (case-insensitive)
 *   5) all other types (not compared)
 * 
 * @param {object} a 
 * @param {object} b 
 * @return {number}
 */
export function smartSort(a, b) {
    // 1) Null Values
    if (a.type === null && b.type !== null) {
        return -1;
    } else if (b.type === null && a.type !== null) {
        return 1;
    } else if (a.type === null && b.type === null) {
        return 0;
    }

    // 2) Numbers
    if (a.type === 'number' && b.type !== 'number') {
        return -1;
    } else if (b.type === 'number' && a.type !== 'number') {
        return 1;
    } else if (a.type === 'number' && b.type === 'number') {
        // Compare numbers
        return a.value - b.value;
    }

    // 3) Dates
    if (a.type === 'date' && b.type !== 'date') {
        return -1;
    } else if (b.type === 'date' && a.type !== 'date') {
        return 1;
    } else if (a.type === 'date' && b.type === 'date') {
        // Compare dates
        if (a.value < b.value) {
            return -1;
        } else if (a.value > b.value) {
            return 1;
        } else {
            return 0;
        }
    }

    // 4) Strings
    if (a.type === 'string' && b.type === 'string') {
        if (a.value.localeCompare !== undefined) {
            return a.value.localeCompare(b.value);
        } else {
            if (a.value < b.value) {
                return -1;
            } else if (a.value > b.value) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    // For any other types return them as 0 (equal) so that they
    // show up after other items and provide a warning as this shouldn't 
    // happen unless unless this function is called incorrectly.
    console.warn('The function [smartSort()] is not being used correctly so the data may appear out of order. [smartSort()] should be used with [getSortObject()] and [Array.sort()]. Refer to docs and demos for usage.');
    return 0;
}
