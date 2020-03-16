/**
 * DataFormsJS [sort] Plugin
 *
 * This plugin allows a user to sort rows in a table by clicking on a column.
 * The data type of each cell is determined at the time of sorting so that the
 * data is sorted correct (numbers as numbers, dates as dates, etc).
 *
 * To use simply include the attribute [data-sort] on a table. Optionally
 * [data-sort-class-odd] and [data-sort-class-even] can be used to update
 * the row style of sorted elements.
 *
 * The reason [data-sort-class-odd] and [data-sort-class-even] are included
 * is because the initial CSS styles [tr:nth-child(odd), tr:nth-child(even), etc]
 * will remain by default after elements are moved on the page. Having custom
 * [data-sort-class-*] allows for expected styling.
 *
 * Additionally the table must be properly formatted with at one <thead>
 * and <tbody>. If multiple <thead> are used for column grouping then click
 * events are added to columns on the last <thead>.
 *
 * Example Usage:
 *     <table data-sort data-sort-class-odd="row-odd" data-sort-class-even="row-even">
 *         <thead>...</thead>
 *         <tbody>...</tbody>
 *     </table>
 *
 * When sorting [cell.textContent] is used however if the cell contains the
 * attribute [data-value] then it will be used instead. [data-value] allows
 * for a different display and sort value or sorting images, inputs, etc.
 *
 * Additional attributes such as [data-sort-column] will be added to elements
 * when the plugin runs.
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

    /**
     * Plugin Object
     */
    var sort = {
        /**
         * Smart Sorting based on data value
         *
         * Used with Array.sort() so numbers can be sorted as numbers,
         * strings as strings, and dates as dates, etc.
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
         */
        sortCompare: function (a, b) {
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
            // happen unless the code is changed and breaks something.
            console.warn('A code change from [sort.js] impacted sorting and caused an expected error so the data may appear out of order. Please review your code changes');
            return 0;
        },

        /**
         * Handle table column header clicks to sort rows by data in the clicked column
         * @param {Event} e
         */
        sortColumn: function (e) {
            // Get the cell and do a quick check to
            // make sure the format is expected.
            var cell = e.target;
            var table = (cell && cell.parentElement && cell.parentElement.parentElement ? cell.parentElement.parentElement.parentElement : null);
            if (!(cell.tagName === 'TH' || cell.tagName === 'TD')) {
                console.warn('sort.sortColumn() was called with an invalid element. If called manually the cell needs to be passed.');
                console.log(cell);
                return;
            }
            if (table !== null && table !== undefined && table.tagName !== 'TABLE') {
                console.warn('sort.sortColumn() was called with an invalid element. If called manually the table cell of the last row from the table header should be used.');
                console.log(cell);
                return;
            }

            // Did the user click the same column? If so reverse Asc/Desc Sort order each time
            var lastColumn = table.getAttribute('data-sort-column');
            var cellIndex = cell.cellIndex;
            var sameColumn = (lastColumn !== null && parseInt(lastColumn, 10) === cellIndex);
            var sortOrder = 'asc';
            if (sameColumn) {
                var lastOrder = table.getAttribute('data-sort-order');
                sortOrder = (lastOrder === 'asc' ? 'desc' : 'asc');
            }

            // Build an array of rows and determine the data type of the text
            // value in each cell to sort (null, number, string, etc).
            var tbody = table.tBodies[0];
            var tableRows = tbody.rows;
            var sortRows = [];
            for (var rowIndex = 0, rowCount = tableRows.length; rowIndex < rowCount; rowIndex++) {
                // Get the cell text
                var rowCell = tableRows[rowIndex].cells[cellIndex];
                if (rowCell === undefined) {
                    continue; // Might happen if a column uses rowspan
                }
                var value = rowCell.getAttribute('data-value');
                var cellText = (value !== null ? value.trim() : rowCell.textContent.trim());
                var cellType = (typeof cellText);

                // Convert to correct type from string (example '123' string to 123 number)
                if (cellText === '') {
                    cellText = null;
                } else if (!isNaN(cellText)) {
                    cellText = parseFloat(cellText);
                } else {
                    // Is it a Date?
                    var dateValue = new Date(cellText);
                    if (!isNaN(dateValue.getTime())) {
                        cellText = dateValue;
                        cellType = 'date';
                    } else {
                        // Convert strings to lowercase
                        cellText = (cellText.toLocaleLowerCase !== undefined ? cellText.toLocaleLowerCase() : cellText.toLowerCase());
                    }
                }

                // Add the row along with converted
                // value and type to the sort rows array.
                sortRows.push({
                    row: tableRows[rowIndex],
                    value: cellText,
                    type: (cellText === null ? null : cellType),
                });
            }

            // Sort the array using the custom compare function in this file
            sortRows.sort(sort.sortCompare);
            if (sortOrder === 'desc') {
                sortRows.reverse();
            }

            // Add back all rows to the <tbody> in the new sorted order.
            // This simply moves the elements around so they appear in the correct order.
            var cssOdd = table.getAttribute('data-sort-class-odd');
            var cssEven = table.getAttribute('data-sort-class-even');
            var hasCSS = (cssOdd && cssEven);
            var displayCount = 0;
            for (var n = 0, m = sortRows.length; n < m; n++) {
                // If there are attributes [data-sort-class-odd] and [data-sort-class-even]
                // defined then update the className so rows appear correctly
                // (for example when using striped colors). When using [nth-child(odd), etc]
                // rows will be added back by default using the color origionally assigned
                // as Browsers do not re-calculate the CSS selector when adding back.
                // Only update items that are not hidden because if they are filtered then
                // some will be hidden.
                var row = sortRows[n].row;
                if (hasCSS && row.style.display !== 'none') {
                    // Increment Counter and update CSS
                    displayCount++;
                    if (displayCount % 2 === 0) {
                        row.classList.add(cssEven);
                        row.classList.remove(cssOdd);
                    } else {
                        row.classList.add(cssOdd);
                        row.classList.remove(cssEven);
                    }
                }

                // Add the row
                tbody.appendChild(row);
            }

            // Update attributes to save the currently sorted column and sort order
            table.setAttribute('data-sort-column', cellIndex);
            table.setAttribute('data-sort-order', sortOrder);
        },

        /**
         * Setup all tables marked [data-sort] that have not yet been setup
         * @param {HTMLElement|undefined} element
         */
        setupTables: function (element) {
            var tables = (element || document).querySelectorAll('table[data-sort]:not([data-sort-setup])');
            Array.prototype.forEach.call(tables, function (table) {
                // Make sure they are setup correctly
                if (table.tHead === null) {
                    // Table might be loading from another plugin, control, etc
                    return;
                } else if (table.tHead.rows.length === 0) {
                    console.warn('Unable to setup sorting for table because the <thead> element contained now rows');
                    console.log(table);
                    return;
                }

                // Make sure there is only 1 <tbody> tag
                if (table.tBodies.length === 0) {
                    console.warn('Unable to setup sorting for table because the <tbody> element is missing');
                    console.log(table);
                    return;
                } else if (table.tBodies.length !== 1) {
                    console.warn('Unable to setup sorting for table because there can only be one <tbody> element for the table');
                    console.log(table);
                    return;
                }

                // Note, this code is currently not checking for tables
                // that use colspan or rowspan which may cause problems when sorting if used.

                // Add click events to all the last header row of all columns
                var row = table.tHead.rows[table.tHead.rows.length-1];
                for (var cellIndex = 0, cellCount = row.cells.length; cellIndex < cellCount; cellIndex++) {
                    row.cells[cellIndex].addEventListener('click', sort.sortColumn);
                    row.cells[cellIndex].style.cursor = 'pointer';
                }

                // Mark the table as setup
                table.setAttribute('data-sort-setup', '');
            });
        },

        /**
         * Setup filter input controls after a page has been rendered
         * @param {HTMLElement|undefined} element
         */
        onRendered: function (element) {
            this.setupTables(element);
        }
    };

    /**
     * Add Plugin to DataFormsJS
     */
    app.addPlugin('sort', sort);
})();
