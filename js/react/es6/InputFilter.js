/**
 * DataFormsJS React Component <InputFilter>
 *
 * This component renders a <input> that allows users to filter elements
 * on the page based on the [filter-selector] property.
 *
 * This component has "side effects" for other elements on the page as it
 * will change the [style.display] of elements that match [filter-selector]
 * and it will optionally update the [textContent] of an element defined
 * in [filter-results-selector]. The side effects should not cause any issues
 * with most apps and pages; however carefully testing your site or app is
 * recommended if you are using this on a page with data that changes
 * after it is initially loaded.
 *
 * The class is based on the standard framework plugin [DataFormsJS\js\Plugins\filter.js].
 * The standard framework plugin contains additional features and can work with
 * multiple filter controls on the same page and the standard plugin can be used when
 * including the file [DataFormsJS\js\React\jsPlugins.js]. See demos and docs for more.
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import React from 'react';

export default class InputFilter extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.input = React.createRef();
    }

    componentDidMount() {
        this.filter();
    }

    onChange() {
        this.filter();
        if (typeof this.props.afterFilter === 'function') {
            this.props.afterFilter();
        }
    }

    filter() {
        // Get filter element and text
        const el = this.input.current;
        const filterWords = el.value.toLowerCase().split(' ');
        const filterWordCount = filterWords.length;
        const hasFilter = (filterWordCount !== 0);
        let displayCount = 0;
        let cssOdd = null;
        let cssEven = null;

        // Get elements to filter. If a table is being filtred
        // then get rows under <tbody>.
        let elements = document.querySelectorAll(this.props['filter-selector']);
        if (elements.length === 1 && elements[0].tagName === 'TABLE' &&
            elements[0].tHead && elements[0].tHead.rows.length === 1 &&
            elements[0].tBodies.length === 1
        ) {
            // For tables get [data-sort-class-odd/even] attributes which are defined
            // from [SortableTable] or [plugins/sort.js].
            const table = elements[0];
            cssOdd = table.getAttribute('data-sort-class-odd');
            cssEven = table.getAttribute('data-sort-class-even');
            elements = elements[0].tBodies[0].rows;
        }
        const totalCount = elements.length;

        // Show/hide elements based on the filter
        const hasCss = (cssEven && cssOdd);
        for (let n = 0, m = elements.length; n < m; n++) {
            const element = elements[n];
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
        const selector = el.getAttribute('filter-results-selector');
        if (selector) {
            // Find element
            const resultLabel = document.querySelector(selector);
            if (!resultLabel) {
                console.warn('Defined [filter-results-selector] but element not found');
                return;
            }

            // Get text to display
            const resultTextAll = el.getAttribute('filter-results-text-all');
            const resultTextFiltered = el.getAttribute('filter-results-text-filtered');
            if (resultTextAll === null && resultTextFiltered === null) {
                console.warn('Defined [filter-results-selector] without [filter-results-text-all] or [filter-results-text-filtered]');
                return;
            }

            // Set text
            let resultText = null;
            if (displayCount === totalCount) {
                resultText = resultTextAll;
            } else if (resultTextFiltered !== null) {
                resultText = resultTextFiltered.replace(/{displayCount}/g, displayCount);
            }
            if (resultText === null) {
                resultLabel.textContent = '';
            } else {
                resultText = resultText.replace(/{totalCount}/g, totalCount);
                resultLabel.textContent = resultText;
            }
        }
    }

    render() {
        // JSX Version for React:
        // return <input {...this.props} onChange={this.onChange} ref={this.input} />

        // Quick check in case Preact is being used as an alias for React on a Webpage.
        // If so then use `onInput` instead of `onChange`.
        if (window !== undefined && window.React === window.preact) {
            return React.createElement('input', Object.assign({}, this.props, {
                onInput: this.onChange,
                ref: this.input
            }));
        }

        // React
        return React.createElement('input', Object.assign({}, this.props, {
            onChange: this.onChange,
            ref: this.input
        }));
    }
}