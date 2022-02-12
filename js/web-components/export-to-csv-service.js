/**
 * DataFormsJS <export-to-csv-service> Web Component
 *
 * This service allows a user to export an HTML <table> to a CSV file download
 * based on the attributes:
 *     data-export-csv-selector
 *     data-export-file-name
 *
 * Exports happen directly in the browser through JavaScript and no server-side calls
 * are made which makes the export/download appear almost instantly to the user.
 *
 * The DataFormsJS Framework has a corresponding plugin: [js/plugins/exportToCsv.js].
 *
 * Example:
 *     <export-to-csv-service></export-to-csv-service>
 *     <button data-export-csv-selector="table" data-export-file-name="Data.csv">Export to CSV</button>
 */

/* Validates with both [eslint] and [jshint] */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* jshint esversion:8 */

import { WebComponentService } from './WebComponentService.js';
import { showErrorAlert } from './utils.js';

function csvEscape(value) {
    value = value.replace(/"/g, '""');
    if (value.search(/("|,|\n|:)/g) >= 0) {
        value = '"' + value + '"';
    }
    return value;
}

function exportTable(event) {
    // Get export settings
    let selector = event.target.getAttribute('data-export-csv-selector');
    let exportFileName = event.target.getAttribute('data-export-file-name');

    // Set default value if not specified
    exportFileName = exportFileName || 'Report.csv';

    // Table Header
    const table = document.querySelector(selector);
    const rows = [];
    let row = [];
    let rowEl = table.tHead.rows[0];
    for (let n = 0, m = rowEl.cells.length; n < m; n++) {
        row.push(csvEscape(rowEl.cells[n].textContent));
    }
    rows.push(row.join(','));

    // Table Body Rows
    const tableRows = table.tBodies[0].rows;
    for (let x = 0, y = tableRows.length; x < y; x++) {
        row = [];
        rowEl = tableRows[x];
        for (let n = 0, m = rowEl.cells.length; n < m; n++) {
            const cell = rowEl.cells[n];
            let value = cell.getAttribute('data-value');
            if (value === null) {
                value = cell.textContent;
            }
            row.push(csvEscape(value));
        }
        rows.push(row.join(','));
    }

    // Build text string of all CSV Rows
    const csv = rows.join('\r\n');

    // Create an export the CSV as a Blog Object
    const blob = new Blob([csv], { type: 'text/csv; charset=utf-8;' });
    if (navigator.msSaveBlob !== undefined) {
        navigator.msSaveBlob(blob, exportFileName);
    } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', exportFileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const msg = 'Unable to Export as a CSV File. Try a different browser and if you need help then please contact support.';
            showErrorAlert(msg);
        }
    }
}

window.customElements.define('export-to-csv-service', class ExportToCsvService extends WebComponentService {
    onLoad(rootElement) {
        // Use `document` for routing changes and services
        const nodeName = rootElement.nodeName;
        if (nodeName === 'URL-ROUTE' || nodeName.includes('-SERVICE')) {
            rootElement = document;
        }

        // Find Elements
        const actionElements = document.querySelectorAll('[data-export-csv-selector]');

        // Are there any on the page?
        let isSupported = false;
        if (actionElements.length > 0) {
            let firstLinkFound = document.querySelector('a');
            if (firstLinkFound === null) {
                firstLinkFound = document.createElement('a');
            }
            isSupported = (navigator.msSaveBlob !== undefined || firstLinkFound.download !== undefined);
        }

        // Update the Elements
        for (const element of actionElements) {
            // If supported then setup and if not supported then hide the button
            // (Example, this doesn't work on older iPhones).
            if (isSupported) {
                element.addEventListener('click', exportTable);
            } else {
                element.style.display = 'none';
            }
        }
    }
});
