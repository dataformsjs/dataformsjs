/**
 * DataFormsJS Input Filter Web Component
 *
 * This component extends the standard <input> as an input filter when <input is="input-filter">
 * is used. This class is based on the standard framework plugin [DataFormsJS\js\Plugins\filter.js]
 * and is similar to the React class [DataFormsJS\js\React\InputFilter.jsx].
 *
 * Example usage:
 *     <input is="input-filter" filter-selector="ul li" filter-results-selector="h1" filter-results-text-all="{totalCount} Records" filter-results-text-filtered="Showing {displayCount} of {totalCount} Records" placeholder="Enter filter">
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import {
    isAttachedToDom,
    defineExtendsPolyfill
} from './utils.js';

class InputFilter extends HTMLInputElement {
    constructor() {
        super();
        this.addEventListener('input', this.filter);
    }

    connectedCallback() {
        // Filter content immediately if there is not result text to display
        if (!this.hasAttribute('filter-results-selector')) {
            this.filter();
            return;
        }

        // When showing a related label (example: "Showing all X Records / Showing x of x records"),
        // the element to filter must be first populated otherwise the result will show text such as
        // "Showing 0 of x records...". Often this element will be used with <data-table>, <data-list>
        // etc which are populated after this element loads. In most cases this happens quickly so
        // only 1 second is given (10 tries - one every 1/10th of a second) for the data to populate.
        let counter = 0;
        const interval = window.setInterval(() => {
            const { elements } = this.getElementsToFilter();
            if (elements.length === 0 && counter < 10) {
                counter++;
                return;
            }
            window.clearInterval(interval);
            if (isAttachedToDom(this)) {
                this.filter();
            }
        }, 100);
    }

    getElementsToFilter() {
        // Get elements to filter. If a table is being filtered
        // then get rows under <tbody>.
        let cssOdd = null;
        let cssEven = null;
        let elements = document.querySelectorAll(this.getAttribute('filter-selector'));
        if (elements.length === 1 && elements[0].tagName === 'TABLE') {
            const table = elements[0];
            switch (table.tBodies.length) {
                case 0:
                    elements = []; // Empty table
                    break;
                case 1:
                    // For tables get [data-sort-class-odd/even] attributes which
                    // are defined from [sortable-table] and [plugins/sort.js].
                    elements = table.tBodies[0].rows;
                    cssOdd = table.getAttribute('data-sort-class-odd');
                    cssEven = table.getAttribute('data-sort-class-even');
                    break;
                default:
                    console.warn('Unexpected Table format for Filter Plugin. Only 1 <tbody> element is supported.');
            }
        }
        return { elements, cssOdd, cssEven };
    }

    filter() {
        // Get filter element and text
        const filterWords = this.value.toLowerCase().split(' ');
        const filterWordCount = filterWords.length;
        const hasFilter = (filterWordCount !== 0);
        let displayCount = 0;

        // Elements to filter and related settings
        const { elements, cssOdd, cssEven } = this.getElementsToFilter();

        // Show/hide elements based on the filter
        const hasCss = (cssEven && cssOdd);
        for (const element of elements) {
            let showItem = true;
            if (hasFilter) {
                // All words must be found in the text
                const text = element.textContent.toLowerCase();
                for (let n = 0; n < filterWordCount; n++) {
                    if (filterWords[n] !== '' && !text.includes(filterWords[n])) {
                        showItem = false;
                        break;
                    }
                }
            }
            if (showItem) {
                // Increment Counter and update CSS
                displayCount++;
                if (hasCss) {
                    if (displayCount % 2 === 0) {
                        element.classList.add(cssEven);
                        element.classList.remove(cssOdd);
                    } else {
                        element.classList.add(cssOdd);
                        element.classList.remove(cssEven);
                    }
                }
            }
            // Show or hide
            element.style.display = (showItem ? '' : 'none');
        }

        // Optionally update a element with filter result counts
        const selector = this.getAttribute('filter-results-selector');
        if (selector) {
            // Find element
            const resultLabel = document.querySelector(selector);
            if (!resultLabel) {
                console.warn('Defined [filter-results-selector] but element not found');
                return;
            }

            // Get text to display
            const resultTextAll = this.getAttribute('filter-results-text-all');
            const resultTextFiltered = this.getAttribute('filter-results-text-filtered');
            if (!resultTextAll) {
                console.warn('Defined [filter-results-selector] without [filter-results-text-all]');
                return;
            } else if (!resultTextFiltered) {
                console.warn('Defined [filter-results-selector] without [filter-results-text-filtered]');
                return;
            }

            // Which text label to use? Update displayCount if filtered text
            let resultText;
            const totalCount = elements.length;
            if (displayCount === totalCount) {
                resultText = resultTextAll;
            } else {
                resultText = resultTextFiltered.replace(/{displayCount}/g, displayCount);
            }

            // Update total count in text
            resultText = resultText.replace(/{totalCount}/g, totalCount);

            // Update '{props}' from the <url-router> URL Params if defined
            const router = document.querySelector('url-router');
            if (router && typeof router.currentUrlParams === 'object') {
                resultText = resultText.replace(/{(.+)}/g, function(match, prop) {
                    if (router.currentUrlParams[prop] !== undefined) {
                        return String(router.currentUrlParams[prop]);
                    }
                    return match;
                });
            }

            // Overwrite text of the element
            resultLabel.textContent = resultText;
        }
    }
}

window.customElements.define('input-filter', InputFilter, { extends: 'input' });
defineExtendsPolyfill('input-filter', 'input', (el) => {
    el.addEventListener('input', InputFilter.prototype.filter);
});
