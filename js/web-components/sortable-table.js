/**
 * DataFormsJS Sortable Table Web Component
 *
 * This component extends the standard <table> as a sortable table when <table is="sortable-table">
 * is used. This class is based on the standard framework plugin [DataFormsJS\js\Plugins\sort.js]
 * and is similar to the React class [DataFormsJS\js\React\SortableTable.jsx].
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import { getSortObject, smartSort } from './utils-sort.js';

class SortableTable extends HTMLTableElement {
    constructor() {
        super();
        this.setupTable();
    }

    setupTable() {
        const table = this;

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
            if (this instanceof HTMLTableElement) {
                row.cells[cellIndex].addEventListener('click', SortableTable.prototype.sortColumn);
            } else {
                row.cells[cellIndex].addEventListener('click', this.sortColumn);
            }
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
            // Get cell from row
            const rowCell = tableRows[rowIndex].cells[cellIndex];
            if (rowCell === undefined) {
                console.warn('Unexpected table format for sorting');
                console.log(tableRows[rowIndex]);
                continue; // Might happen if a column uses rowspan
            }

            // Get the cell text
            const value = rowCell.getAttribute('data-value');
            let cellText = (value !== null ? value.trim() : rowCell.textContent.trim());

            // Add the row along with converted
            // value and type to the sort rows array.
            sortRows.push(getSortObject(tableRows[rowIndex], cellText));
        }

        // Sort the array using the custom compare function in this file
        sortRows.sort(smartSort);
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
            const row = sortRows[n].el;
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
}

window.customElements.define('sortable-table', SortableTable, { extends: 'table' });

// For Safari, Samsung Internet, and Edge
window._webComponentPolyfills = window._webComponentPolyfills || [];
window._webComponentPolyfills.push({
    element: 'sortable-table',
    extends: 'table',
    setup: (el) => {
        SortableTable.prototype.setupTable.apply(el);
    },
});
