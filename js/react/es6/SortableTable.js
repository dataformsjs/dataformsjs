/**
 * DataFormsJS React Component <SortableTable>
 *
 * This component renders a <table> that allows users to click on columns
 * and sort rows based on data of the clicked column. The data type
 * (numbers, dates, etc) is determined based on the data and sorted
 * based on data type.
 *
 * This class has "side effects" for child elements because it changes
 * the sort order of each row but it should not cause issues with
 * most apps and pages; however carefully testing your site or app is
 * recommended if you are using this on a page with data that changes
 * after it is initially loaded.
 *
 * The class is based on the standard framework plugin [DataFormsJS\js\Plugins\sort.js]
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import React from 'react';

export default class SortableTable extends React.Component {
    constructor(props) {
        super(props);
        this.sortColumn = this.sortColumn.bind(this);
        this.table = React.createRef();
    }

    componentDidMount() {
        this.setupTable();
    }

    setupTable() {
        const table = this.table.current;

        // Validate <thead>
        if (table.tHead === null) {
            console.warn('Unable to setup sorting for table because there is no <thead> element');
            console.log(table);
            return;
        } else if (table.tHead.rows.length === 0) {
            console.warn('Unable to setup sorting for table because the <thead> element contained now rows');
            console.log(table);
            return;
        }

        // Validate <tbody>
        if (table.tBodies.length === 0) {
            console.warn('Unable to setup sorting for table because the <tbody> element is missing');
            console.log(table);
            return;
        } else if (table.tBodies.length !== 1) {
            console.warn('Unable to setup sorting for table because there can only be one <tbody> element for the table');
            console.log(table);
            return;
        }

        // Add click events to all the last header row of all columns
        const row = table.tHead.rows[table.tHead.rows.length-1];
        for (let cellIndex = 0, cellCount = row.cells.length; cellIndex < cellCount; cellIndex++) {
            row.cells[cellIndex].addEventListener('click', this.sortColumn);
            row.cells[cellIndex].style.cursor = 'pointer';
        }
    }

    /**
     * Handle Column Header Click to Sort Rows by Data in the Column
     * @param {Event} e
     */
    sortColumn(e) {
        // Get the cell and do a quick check to make sure the format is expected.
        const cell = e.target;
        const table = (cell && cell.parentElement && cell.parentElement.parentElement ? cell.parentElement.parentElement.parentElement : null);
        if (!(cell.tagName === 'TH' || cell.tagName === 'TD')) {
            console.warn('SortableTable.sortColumn() was called with an invalid element. If called manually the cell needs to be passed.');
            console.log(cell);
            return;
        }
        if (table !== null && table !== undefined && table.tagName !== 'TABLE') {
            console.warn('SortableTable.sortColumn() was called with an invalid element. If called manually the table cell of the last row from the table header should be used.');
            console.log(cell);
            return;
        }

        // Did the user click the same column? If so reverse Asc/Desc Sort order each time
        const lastColumn = table.getAttribute('data-sort-column');
        const cellIndex = cell.cellIndex;
        const sameColumn = (lastColumn !== null && parseInt(lastColumn, 10) === cellIndex);
        let sortOrder = 'asc';
        if (sameColumn) {
            const lastOrder = table.getAttribute('data-sort-order');
            sortOrder = (lastOrder === 'asc' ? 'desc' : 'asc');
        }

        // Build an array of rows and determine the data type of the text
        // value in each cell to sort (null, number, string, etc).
        const tbody = table.tBodies[0];
        const tableRows = tbody.rows;
        const sortRows = [];
        for (let rowIndex = 0, rowCount = tableRows.length; rowIndex < rowCount; rowIndex++) {
            // Get the cell text
            const rowCell = tableRows[rowIndex].cells[cellIndex];
            if (rowCell === undefined) {
                continue; // Might happen if a column uses rowspan
            }
            const value = rowCell.getAttribute('data-value');
            let cellText = (value !== null ? value.trim() : rowCell.textContent.trim());
            let cellType = (typeof cellText);

            // Convert to correct type from string (example '123' string to 123 number)
            if (cellText === '') {
                cellText = null;
            } else if (!isNaN(cellText)) {
                cellText = parseFloat(cellText);
            } else {
                // Is it a Date?
                const dateValue = new Date(cellText);
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
        sortRows.sort(this.sortCompare);
        if (sortOrder === 'desc') {
            sortRows.reverse();
        }

        // Add back all rows to the <tbody> in the new sorted order.
        // This simply moves the elements around so they appear in the correct order.
        const cssOdd = table.getAttribute('data-sort-class-odd');
        const cssEven = table.getAttribute('data-sort-class-even');
        const hasCSS = (cssOdd && cssEven);
        let displayCount = 0;
        for (let n = 0, m = sortRows.length; n < m; n++) {
            // If there are attributes [data-sort-class-odd] and [data-sort-class-even]
            // defined then update the className so rows appear correctly
            // (for example when using striped colors). When using [nth-child(odd), etc]
            // rows will be added back by default using the color origionally assigned
            // as Browsers do not re-calculate the CSS selector when adding back.
            // Only update items that are not hidden because if they are filtered then
            // some will be hidden.
            const row = sortRows[n].row;
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
    }

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
    sortCompare(a, b) {
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
        console.warn('A code change from [SortableTable] impacted sorting and caused an expected error so the data may appear out of order. Please review your code changes');
        return 0;
    }

    render() {
        // JSX Version:
        //
        // return <table {...this.props} ref={this.table}>
        //     {this.props.children}
        // </table>
        return React.createElement('table', Object.assign({}, this.props, {
            ref: this.table
        }), this.props.children);
    }
}
