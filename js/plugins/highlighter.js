/**
 * DataFormsJS Plugin [highlighter]
 *
 * This plugin allows elements on the page to be highlighted through CSS classes
 * based on matching criteria. This plugin works well with [filter.js] to
 * dynamically read a table or list and allow a user to quickly see elements
 * of interest filter them by clicking on items from the highlight section.
 *
 * Required class for root element:
 *     .highlighter
 *
 * Attributes for child elements:
 *     data-highlight-selector
 *     data-highlight-value
 *     data-highlight-operator
 *     data-highlight-class
 *
 * For example usage see the [DataFormsJS\examples\log-table-*.htm] demos.
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

    var highlighter = {
        /**
         * Check for required elements and if found highlight
         * related elements based on the highligher options.
         */
        onRendered: function () {
            // Does the container element exist? Example:
            //     <div class="highlighter">
            var container = document.querySelector('.highlighter');
            if (container === null) {
                return;
            }

            // Get Selectors inside of it
            var selectors = container.querySelectorAll('[data-highlight-selector]');
            var showContainer = false;
            Array.prototype.forEach.call(selectors, function (element) {
                // Get Attributes
                var selector = element.getAttribute('data-highlight-selector'),
                    value = element.getAttribute('data-highlight-value'),
                    operator = element.getAttribute('data-highlight-operator'),
                    className = element.getAttribute('data-highlight-class'),
                    cells,
                    n,
                    m,
                    matched,
                    matchedCount = 0,
                    resultText = '',
                    validOperators = ['===', '!==', 'contains'],
                    checkArray = false,
                    x,
                    y;

                // If any are not defined then log to console and skip.
                if (selector === '' || value === null || value === '' ||
                    operator === null || operator === '' || className === null || className === '') {
                    console.error('Error from [app.plugins.highlighter], Invalid Selector Element. Attributes [data-highlight-selector], [data-highlight-value], [data-highlight-operator], and [data-highlight-class] are all required.');
                    return;
                }
                if (validOperators.indexOf(operator) === -1) {
                    console.error("Error from [app.plugins.highlighter], [data-highlight-operator] can only handle '" + validOperators.join("', '") + "' options");
                    return;
                }

                // Check an array of values or a single value? Example: 'Value|Value2|Value3'
                if (value.indexOf('|') > -1) {
                    value = value.split('|');
                    y = value.length;
                    checkArray = true;
                }

                // Find and highlight matching elements
                cells = document.querySelectorAll(selector);
                for (n = 0, m = cells.length; n < m; n++) {
                    // In case of error default to true
                    matched = true;

                    // Check for match
                    if (checkArray) {
                        switch (operator) {
                            case '===':
                                for (x = 0; x < y; x++) {
                                    matched = (cells[n].textContent === value[x]);
                                    if (matched) {
                                        break;
                                    }
                                }
                                break;
                            case '!==':
                                for (x = 0; x < y; x++) {
                                    matched = (cells[n].textContent !== value[x]);
                                    if (!matched) {
                                        break;
                                    }
                                }
                                break;
                            case 'contains':
                                for (x = 0; x < y; x++) {
                                    matched = (cells[n].textContent.indexOf(value) > -1);
                                    if (matched) {
                                        break;
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    } else {
                        switch (operator) {
                            case '===':
                                matched = (cells[n].textContent === value);
                                break;
                            case '!==':
                                matched = (cells[n].textContent !== value);
                                break;
                            case 'contains':
                                matched = (cells[n].textContent.indexOf(value) > -1);
                                break;
                            default:
                                break;
                        }
                    }

                    // Highlight
                    if (matched) {
                        cells[n].classList.add(className);
                        matchedCount++;
                    }
                }

                // Show Result Summary
                if (matchedCount === 0) {
                    element.textContent = '';
                    element.style.display = 'none';
                } else {
                    // Set flag variable
                    showContainer = true;

                    // If array convert back
                    if (checkArray) {
                        value = value.join('], [');
                    }

                    // Show text
                    switch (operator) {
                        case '===':
                            resultText = String(matchedCount) + ' Records matched [' + value + ']';
                            break;
                        case '!==':
                            resultText = String(matchedCount) + ' Records did not match [' + value + ']';
                            break;
                        case 'contains':
                            resultText = String(matchedCount) + ' Records contain [' + value + ']';
                            break;
                        default:
                            // Unknown, code should not make it this far unless a change breaks something
                            resultText = 'Highlighting ' + String(matchedCount) + ' Cells';
                            break;
                    }

                    element.textContent = resultText;
                    element.style.display = '';
                }
            });

            // Show or hide the main container based on if there were any un-matched cells
            container.style.display = (showContainer ? '' : 'none');
        }
    };

    /**
     * Add Plugin to DataFormsJS
     */
    app.addPlugin('highlighter', highlighter);
})();
