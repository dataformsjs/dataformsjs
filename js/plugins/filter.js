/**
 * DataFormsJS [filter] Plugin
 *
 * This plugin allows a user to filter element on a page by typing in <input> fields
 * or clicking on elements, etc. The following attributes are used by this class:
 *     data-filter-selector
 *     data-filter-column
 *     data-filter-results-text-selector
 *     data-filter-results-text-all
 *     data-filter-results-text-filtered
 *     data-filter-results-text-hide-on-empty
 *     data-filter-operator
 *     data-filter-value
 *     data-filter-class-odd
 *     data-filter-class-even
 *     data-filter-clear
 *     data-filter-clear-all
 *     data-set-filter-selector
 *     data-sort-class-odd
 *     data-sort-class-even
 *
 * Additional attributes such as [data-filter-setup] will be added to elements
 * when the plugin runs.
 *
 * When elements are filtered they have [style.display] set to either 'none' or
 * empty ''. With older browsers (ex: IE6) it was often faster to reset [innerHTML]
 * than to show/hide elements, however modern browsers render style display changes
 * very fast (even for large types) and usually faster than re-creating the content.
 * Additionally external code can define click or other event handlers on filtered
 * code and when only [display] is changed there is no need to reset event handlers.
 *
 * This file has many options, see demo files for example usage, and look at
 * code and code comments in this file for full details.
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

    // Supported Operators when using [data-filter-operator] with [data-filter-value]
    var _operators = ['excludes', 'excludes_list', '!==', '==='];

    // Private flag variable to prevent filtering while changes are being made
    var _runFilter = true;

    // Private function that returns settings from a filter element
    function getFilter(element) {
        // Define variables and create an object with info related to the input control
        var values,
            n,
            m,
            table,
            rowIndex,
            itemsSelector = element.getAttribute('data-filter-selector'),
            resultsTextSelector = element.getAttribute('data-filter-results-text-selector'),
            settings = {
                itemsSelector: itemsSelector,
                items: (itemsSelector === null ? null : document.querySelectorAll(itemsSelector)),
                columnFilter: element.getAttribute('data-filter-column'),
                resultsTextSelector: resultsTextSelector,
                resultsTextElement: (resultsTextSelector === null ? null : document.querySelector(resultsTextSelector)),
                textAll: element.getAttribute('data-filter-results-text-all'),
                textFiltered: element.getAttribute('data-filter-results-text-filtered'),
                filterHideOnEmpty: element.getAttribute('data-filter-results-text-hide-on-empty'),
                dataList: (element.getAttribute('list') === null ? element.getAttribute('data-list') : element.getAttribute('list')),
                cssOdd: element.getAttribute('data-filter-class-odd'),
                cssEven: element.getAttribute('data-filter-class-even'),
                colIndex: null,
                clickedFilter: element.getAttribute('data-filter-clicked'),
                operator: element.getAttribute('data-filter-operator'),
                filterValue: element.getAttribute('data-filter-value'),
                filterWords: [],
                containsInputs: (itemsSelector && document.querySelector(itemsSelector + ' input') !== null),
            };

        // Log and show errors
        function filterError(errorMessage) {
            console.log(errorMessage);
            console.log(element);
            console.log(settings);
            throw errorMessage;
        }

        // Exit if filter is not set
        if (settings.items === null) {
            return settings;
        }

        // Validate handled operators
        if (settings.operator !== null) {
            if (settings.filterValue === null) {
                filterError('Filter if attribute [data-filter-operator] is defined then the attribute [data-filter-value] must also be defined.');
            } else {
                if (_operators.indexOf(settings.operator) === -1) {
                    filterError("Filter if attribute [data-filter-operator] is defined then it must equal one of the following operators: ['" + _operators.join("', '") + "'].");
                }
            }
        }

        // Get values to filter
        if (element.nodeName === 'INPUT') {
            values = element.value.toLowerCase().trim().split(' ');
        } else {
            if (settings.filterValue === null) {
                filterError('Filter Element requires missing attribute [data-filter-value].');
            }

            if (settings.clickedFilter === null) {
                values = [];
            } else {
                if (settings.operator === 'excludes_list') {
                    values = settings.filterValue.toLowerCase().trim().split('|');
                } else if (settings.operator === '!==' || settings.operator === '===') {
                    settings.filterValue = settings.filterValue.toLowerCase();
                    values = [ settings.filterValue ];
                } else {
                    values = settings.filterValue.toLowerCase().trim().split(' ');
                }
            }
        }

        // Convert filter text to an array of values
        for (n = 0, m = values.length; n < m; n++) {
            if (values[n] !== '') {
                settings.filterWords.push(values[n]);
            }
        }

        // Is this filter for a specific column of a table?
        if (settings.columnFilter !== null) {
            // Validate that everything is setup correctly
            if (!(settings.items.length === 1 && settings.items[0].tagName === 'TABLE' &&
                settings.items[0].tHead && settings.items[0].tHead.rows.length === 1 &&
                settings.items[0].tBodies.length === 1)) {
                // Log and throw error
                filterError('Column filter requires a table to be correctly defined');
            }
            table = document.querySelector(settings.itemsSelector);
            settings.items = table.tBodies[0].rows;

            // Find the column index using the last row of the table header
            rowIndex = table.tHead.rows.length - 1;
            for (n = 0, m = table.tHead.rows[rowIndex].cells.length; n < m; n++) {
                if (table.tHead.rows[rowIndex].cells[n].textContent.trim() === settings.columnFilter) {
                    settings.colIndex = n;
                    break;
                }
            }

            // Make sure a column was matched
            if (settings.colIndex === null) {
                filterError('Column [' + settings.columnFilter + '] was not found in the table to filter.');
            }
        } else {
            // Filtering a single table?
            // If so and it is setup to use CSS from the Sorting Pluing then use those settings.
            if (settings.items.length === 1 && settings.items[0].tagName === 'TABLE' && settings.items[0].tBodies.length === 1) {
                table = settings.items[0];
                settings.items = table.tBodies[0].rows;
                if (settings.cssOdd === null && settings.cssEven === null) {
                    settings.cssOdd = table.getAttribute('data-sort-class-odd');
                    settings.cssEven = table.getAttribute('data-sort-class-even');
                }
            }
        }

        return settings;
    }

    /**
     * Plugin Object
     */
    var filter = {
        /**
         * Get settings for all matching filter elements
         * @param {HTMLElement} element
         */
        getSettings: function (element) {
            // Get all filter elements
            var elements = (element || document).querySelectorAll('[data-filter-selector]');

            // Get settings for each control, if there is an error and a control
            // is not setup correctly then an exception will be thrown and
            // the filter code will not be called.
            var settingsList = [];
            Array.prototype.forEach.call(elements, function (el) {
                settingsList.push(getFilter(el));
            });

            // Return the array of settings objects
            return settingsList;
        },

        /**
         * Run the filter to show/hide elements on screen
         */
        filter: function () {
            var settingsList,
                clearFilterElements,
                clearAllFilterElements,
                checkedFilters = [],
                hasFilteredData = false,
                item,
                items,
                itemCount,
                x,
                y,
                itemWasHidden;

            // Private function to hide a row or list item based on filter settings.
            // Returns true if the item was hidden based on the current filter.
            function hideFilteredItem(settings, item) {
                var searchText = '',
                    n,
                    m,
                    hideElement,
                    matched = false,
                    inputs = null;

                // Get lower-case text of a specific cell in the row or of the entire row or element.
                // An optimization check is made before the filter to check if any <input>
                // elements exist under the filter elements. If at least one exists then check
                // each filter item if inputs exist and if they do then append the value to
                // the search text. [textContent] does not include <input> values which is
                // why this is needed. Input text is included in the search even if it is hidden.
                if (settings.colIndex === null) {
                    searchText = item.textContent.toLowerCase();
                    inputs = (settings.containsInputs ? item.querySelectorAll('input') : null);
                } else {
                    if (item.cells.length >= settings.colIndex) {
                        searchText = item.cells[settings.colIndex].textContent.toLowerCase();
                        inputs = (settings.containsInputs ? item.cells[settings.colIndex].querySelectorAll('input') : null);
                    }
                }
                if (inputs !== null) {
                    for (n = 0, m = inputs.length; n < m; n++) {
                        searchText += ' ' + inputs[n].value;
                    }
                }

                // Which Search Operator Type?
                switch (settings.operator) {
                    case '===':
                        // Hide unless an exact match
                        if (searchText !== settings.filterValue) {
                            item.style.display = 'none';
                            return true;
                        }
                        break;
                    case '!==':
                        // Hide if an exact match
                        if (searchText === settings.filterValue) {
                            item.style.display = 'none';
                            return true;
                        }
                        break;
                    case 'excludes':
                        // Check each word in the filter, if the value does not contain
                        // all of the following words from the excludes list then hide it.
                        hideElement = false;
                        for (n = 0, m = settings.filterWords.length; n < m; n++) {
                            matched = (searchText.indexOf(settings.filterWords[n]) !== -1);
                            if (matched) {
                                hideElement = true;
                                break;
                            }
                        }
                        if (hideElement) {
                            item.style.display = 'none';
                            return true;
                        }
                        break;
                    case 'excludes_list':
                        // Check an exatch match in the filter, if the value
                        // equals one of the list items then hide it.
                        hideElement = false;
                        for (n = 0, m = settings.filterWords.length; n < m; n++) {
                            matched = (searchText === settings.filterWords[n]);
                            if (matched) {
                                hideElement = true;
                                break;
                            }
                        }
                        if (hideElement) {
                            item.style.display = 'none';
                            return true;
                        }
                        break;
                    default:
                        // Check each word in the filter, if the row doesn't contain
                        // it then hide the element and continue with the next item.
                        for (n = 0, m = settings.filterWords.length; n < m; n++) {
                            if (searchText.indexOf(settings.filterWords[n]) === -1) {
                                item.style.display = 'none';
                                return true;
                            }
                        }
                        break;
                }

                // Return false indicating the item was not hidden by the filter
                return false;
            }

            // Check - if internal code is running then don't filter
            if (!_runFilter) {
                return;
            }

            // Get filter Settings
            settingsList = filter.getSettings();
            clearFilterElements = document.querySelectorAll('[data-filter-clear]');
            clearAllFilterElements = document.querySelectorAll('[data-filter-clear-all]');

            // Optimize if the screen has only one input filter
            if (settingsList.length === 1) {
                // Only filter if items were found on the page
                if (settingsList[0].items !== null) {
                    // If a filter is not defined then show all elements
                    items = settingsList[0].items;
                    if (settingsList[0].filterWords.length === 0) {
                        for (item = 0, itemCount = items.length; item < itemCount; item++) {
                            if (items[item].style.display !== '') {
                                items[item].style.display = '';
                            }
                            items[item].removeAttribute('data-filter-item');
                        }
                    } else {
                        // Otherwise show or hide items based on the filter
                        for (item = 0, itemCount = items.length; item < itemCount; item++) {
                            itemWasHidden = hideFilteredItem(settingsList[0], items[item]);
                            if (!itemWasHidden && items[item].style.display !== '') {
                                items[item].style.display = '';
                            }
                            items[item].setAttribute('data-filter-item', (itemWasHidden ? 'hide' : 'show'));
                        }
                    }
                }
            } else {
                // This screen has multiple filters, assume they apply to the same
                // list and show everything by default. Then hide items that do not
                // match each selected filter. This allows multiple filters to be
                // applied to the same list and for them to behave as expected.

                // Show all elements
                for (x = 0, y = settingsList.length; x < y; x++) {
                    items = settingsList[x].items;
                    if (items !== null) {
                        for (item = 0, itemCount = items.length; item < itemCount; item++) {
                            if (items[item].style.display !== '') {
                                items[item].style.display = '';
                            }
                            items[item].removeAttribute('data-filter-item');
                        }
                    }
                }

                // Hide elements that do not match a filter
                for (x = 0, y = settingsList.length; x < y; x++) {
                    items = settingsList[x].items;
                    if (items !== null && settingsList[x].filterWords.length > 0) {
                        for (item = 0, itemCount = items.length; item < itemCount; item++) {
                            itemWasHidden = hideFilteredItem(settingsList[x], items[item]);
                            items[item].setAttribute('data-filter-item', (itemWasHidden ? 'hide' : 'show'));
                        }
                    }
                }
            }

            // After all filters have been processed then update css for
            // odd/even of each item and update any result text elements.
            settingsList.forEach(function (settings) {
                var displayCount = 0,
                    resultText = '',
                    showingAll = true,
                    currentFilter = settings.itemsSelector,
                    hasCss = (settings.cssEven && settings.cssOdd);

                // Has the current list already been processed for style?
                if (checkedFilters.indexOf(currentFilter) !== -1) {
                    return;
                }

                // Update CSS and Count Items
                Array.prototype.forEach.call(settings.items, function (item) {
                    // Check if the item is not hidden
                    if (item.style.display === '') {
                        // Increment Counter and update CSS
                        displayCount++;
                        if (hasCss) {
                            if (displayCount % 2 === 0) {
                                item.classList.add(settings.cssEven);
                                item.classList.remove(settings.cssOdd);
                            } else {
                                item.classList.add(settings.cssOdd);
                                item.classList.remove(settings.cssEven);
                            }
                        }
                    } else {
                        showingAll = false;
                        hasFilteredData = true;
                    }
                });

                // Update results text. This is an optional feature that will be called
                // if the required attributes are defined in the input element.
                if (settings.resultsTextElement !== null && settings.textAll !== null && settings.textFiltered !== null) {
                    // Which text label to use? Update displayCount if filtered text
                    if (settings.items.length === displayCount) {
                        resultText = settings.textAll;
                    } else {
                        resultText = settings.textFiltered.replace(/{displayCount}/g, displayCount);
                    }

                    // Update total count in text and overwrite text of the element
                    resultText = resultText.replace(/{totalCount}/g, settings.items.length);
                    settings.resultsTextElement.textContent = resultText;

                    // Show/Hide if needed
                    if (settings.filterHideOnEmpty !== null) {
                        settings.resultsTextElement.style.display = (resultText === '' ? 'none' : '');
                    }
                }

                // Show/Hide [data-filter-clear] Elements based upon filter state
                Array.prototype.forEach.call(clearFilterElements, function (clearElement) {
                    if (clearElement.getAttribute('data-filter-clear') === currentFilter) {
                        clearElement.style.display = (showingAll ? 'none' : '');
                    }
                });

                // Add filter to array of processed items
                checkedFilters.push(currentFilter);
            });

            // Show/Hide [data-filter-clear-all] Elements based upon screen state
            Array.prototype.forEach.call(clearAllFilterElements, function (clearElement) {
                clearElement.style.display = (hasFilteredData ? '' : 'none');
            });
        },

        /**
         * Setup items that reference a <datalist> element
         * @param {HTMLElement|undefined} element
         */
        setupDataLists: function(element) {
            // Get filter settings
            var settingsList = this.getSettings(element);

            // Process each filter
            settingsList.forEach(function (settings) {
                // Exit if there are no items or a defined datalist
                if (settings.items === null || settings.dataList === null) {
                    return;
                }

                // Make sure the <datalist> element exists and that it is a valid list
                var dataList = document.getElementById(settings.dataList);
                if (dataList === null) {
                    dataList = document.querySelector(settings.dataList);
                }
                if (dataList === null || dataList.tagName !== 'DATALIST') {
                    return;
                }

                // Get Item text to populate the list with
                var textList = [];
                Array.prototype.forEach.call(settings.items, function (item) {
                    // Get all element text of a specific cell in the row if specified
                    var itemText = '';
                    if (settings.colIndex === null) {
                        itemText = item.textContent;
                    } else {
                        if (item.cells.length >= settings.colIndex) {
                            itemText = item.cells[settings.colIndex].textContent;
                        }
                    }

                    // Add to the Array if it doesn't already exist
                    if (itemText !== '' && textList.indexOf(itemText) === -1) {
                        textList.push(itemText);
                    }
                });

                // Sort the text values and update the <datalist> from the array of text values
                textList.sort();
                dataList.innerHTML = '';
                textList.forEach(function (text) {
                    var option = document.createElement('option');
                    option.textContent = text;
                    dataList.appendChild(option);
                });
            });
        },

        /**
         * Clear any previously clicked filters, used internally when
         * new filters are clicked on.
         *
         * @param {string} filterSelector
         */
        clearClickedFilters: function (filterSelector) {
            var elements = document.querySelectorAll('[data-filter-selector][data-filter-clicked]');
            Array.prototype.forEach.call(elements, function (element) {
                if (element.getAttribute('data-filter-selector') === filterSelector) {
                    element.removeAttribute('data-filter-clicked');
                }
            });
        },

        /**
         * Clear any previously clicked filters and reset all inputs for a
         * specific filter. This updates the screen to show all elements for
         * the specific filter.
         *
         * @param {string} filterSelector
         */
        clearFilter: function (filterSelector) {
            var elements = document.querySelectorAll('input[data-filter-selector],[data-filter-selector][data-filter-clicked]');
            Array.prototype.forEach.call(elements, function (element) {
                if (element.getAttribute('data-filter-selector') === filterSelector) {
                    if (element.nodeName === 'INPUT') {
                        element.value = '';
                    } else {
                        element.removeAttribute('data-filter-clicked');
                    }
                }
            });
        },

        /**
         * Clear all clicked filters and reset all inputs.
         * This updates the screen to show all elements.
         */
        clearAllFilters: function () {
            var elements = document.querySelectorAll('input[data-filter-selector],[data-filter-selector][data-filter-clicked]');
            Array.prototype.forEach.call(elements, function (element) {
                if (element.nodeName === 'INPUT') {
                    element.value = '';
                } else {
                    element.removeAttribute('data-filter-clicked');
                }
            });
        },

        /**
         * Setup filter input controls
         * @param {HTMLElement|undefined} element
         */
        setupFilters: function (element) {
            // Attach the [filter()] function to all elements with attribute
            // [data-filter-selector] that have not already been setup.
            var elements = (element || document).querySelectorAll('[data-filter-selector]:not([data-filter-setup])');
            Array.prototype.forEach.call(elements, function (el) {
                // Handle <input> using 'input' events and other element
                // types using 'click' events.
                if (el.nodeName === 'INPUT') {
                    el.addEventListener('input', filter.filter);
                } else {
                    // Once clicked mark clear previous clicks and mark the current element
                    el.addEventListener('click', function () {
                        filter.clearClickedFilters(this.getAttribute('data-filter-selector'));
                        this.setAttribute('data-filter-clicked', '');
                        filter.filter();
                    });
                    el.style.cursor = 'pointer';
                }

                // Mark the control as already setup so that events will not be added a second time to it
                el.setAttribute('data-filter-setup', 'setup');
            });

            // Setup Elements with Attribute [data-filter-clear]
            elements = document.querySelectorAll('[data-filter-clear]:not([data-filter-setup])');
            Array.prototype.forEach.call(elements, function (el) {
                el.addEventListener('click', function () {
                    _runFilter = false;
                    filter.clearFilter(this.getAttribute('data-filter-clear'));
                    _runFilter = true;
                    filter.filter();
                });
                el.setAttribute('data-filter-setup', 'setup');
            });

            // Setup Elements with Attribute [data-filter-clear-all]
            elements = document.querySelectorAll('[data-filter-clear-all]:not([data-filter-setup])');
            Array.prototype.forEach.call(elements, function (el) {
                el.addEventListener('click', function () {
                    _runFilter = false;
                    filter.clearAllFilters();
                    _runFilter = true;
                    filter.filter();
                });
                el.setAttribute('data-filter-setup', 'setup');
            });

            // Are there any elements with the attribute [data-set-filter-selector]?
            // If so then once they are clicked on link them to a filter and run it.
            elements = document.querySelectorAll('[data-set-filter-selector]:not([data-set-filter-setup])');
            Array.prototype.forEach.call(elements, function (el) {
                el.addEventListener('click', function () {
                    var selector = el.getAttribute('data-set-filter-selector');
                    var filterInput = document.querySelector(selector);
                    if (filterInput === null) {
                        console.warn('Query Selector from Attribute [data-set-filter-selector = ' + selector + '] did not return an element.');
                        return;
                    }
                    if (filterInput.getAttribute('data-filter-selector') === null) {
                        console.warn('Query Selector from Attribute [data-set-filter-selector = ' + selector + '] did a valid filter element that has [data-filter-selector] defined.');
                        return;
                    }
                    filterInput.value = el.textContent;
                    filter.filter();
                });
                el.setAttribute('data-set-filter-setup', 'setup');
            });

            // Run the filter once without any events in case a
            // filter is defined when this function is called.
            // If filters use [data-filter-results-text-selector] then this also
            // updates the related elements with the text from the filter.
            filter.filter();
        },

        /**
         * Setup filter input controls after a page has been rendered
         * @param {HTMLElement|undefined} element
         */
        onRendered: function (element) {
            this.setupDataLists(element);
            this.setupFilters(element);
        }
    };

    /**
     * Add Plugin to DataFormsJS
     */
    app.addPlugin('filter', filter);
})();
