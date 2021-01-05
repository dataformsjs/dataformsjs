/**
 * DataFormsJS <highlighter-service> Web Component
 *
 * This service allows elements on the page to be highlighted through CSS classes
 * based on matching criteria. This service works well with <filter-service> Web Component
 * to dynamically read a table or list and allow a user to quickly see elements
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
 * This service is based on the standard framework plugin [js/plugins/highlighter.js]
 */

/* Validates with both [eslint] and [jshint] */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* jshint esversion:8 */
/* jshint strict: true */

import { WebComponentService } from './WebComponentService.js';

window.customElements.define('highlighter-service', class HighlighterService extends WebComponentService {
    onLoad(rootElement) {
        // Use `document` for routing changes and services
        const nodeName = rootElement.nodeName;
        if (nodeName === 'URL-ROUTE' || nodeName.includes('-SERVICE')) {
            rootElement = document;
        }

        // Does the container element exist? Example:
        //     <div class="highlighter">
        const container = document.querySelector('.highlighter');
        if (container === null) {
            return;
        }

        // Get Selectors inside of it
        const selectors = container.querySelectorAll('[data-highlight-selector]');
        let showContainer = false;
        for (const element of selectors) {
            const selector = element.getAttribute('data-highlight-selector');
            let value = element.getAttribute('data-highlight-value');
            const operator = element.getAttribute('data-highlight-operator');
            const className = element.getAttribute('data-highlight-class');
            const validOperators = ['===', '!==', 'contains'];
            let checkArray = false;
            let matchedCount = 0;
            let resultText = '';
            let valueCount = 0;

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
                valueCount = value.length;
                checkArray = true;
            }

            // Find and highlight matching elements
            const cells = document.querySelectorAll(selector);
            for (let n = 0, m = cells.length; n < m; n++) {
                // In case of error default to true
                let matched = true;

                // Check for match
                if (checkArray) {
                    switch (operator) {
                        case '===':
                            for (let x = 0; x < valueCount; x++) {
                                matched = (cells[n].textContent === value[x]);
                                if (matched) {
                                    break;
                                }
                            }
                            break;
                        case '!==':
                            for (let x = 0; x < valueCount; x++) {
                                matched = (cells[n].textContent !== value[x]);
                                if (!matched) {
                                    break;
                                }
                            }
                            break;
                        case 'contains':
                            for (let x = 0; x < valueCount; x++) {
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
        }

        // Show or hide the main container based on if there were any un-matched cells
        container.style.display = (showContainer ? '' : 'none');
    }
});
