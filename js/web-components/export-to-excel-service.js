/**
 * DataFormsJS <export-to-excel-service> Web Component
 *
 * This service allows a user to export an HTML <table> to an Excel file download
 * based on the attributes:
 *     data-export-excel-selector
 *     data-export-file-name
 *     data-worksheet-name
 *     data-export-all
 *
 * [data-export-excel-selector] is required with a valid selector to a <table>
 * while [data-export-file-name] and [data-worksheet-name] are optional defaulting
 * to "Report.xlsx" and "Report" respectively. By default only visible records are
 * exported unless the attribute [data-export-all] is defined.
 *
 * Exports happen directly in the browser through JavaScript and no server-side calls
 * are made which makes the export/download appear almost instantly to the user.
 *
 * The script uses the external library ExcelJS and the first time the user exports an
 * Excel file this service will download ExcelJS from a CDN. The generated Excel file
 * contains a fixed header row using a gray and bold style and a filter set. The width
 * of columns is based on the data. ExcelJS has many formatting options so if you need
 * something similar or a custom version of this script then this file provides a good
 * starting point for custom Excel Development.
 *
 * The DataFormsJS Framework has a corresponding plugin: [js/plugins/exportToExcel.js].
 *
 * Example:
 *     <export-to-excel-service></export-to-excel-service>
 *     <button data-export-csv-selector="table"
 *          data-export-file-name="Report.xlsx"
 *          data-worksheet-name="Report">Export to Excel</button>
 *
 * @see https://github.com/exceljs/exceljs/
 */

/* Validates with both [eslint] and [jshint] */
/* global ExcelJS */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* jshint esversion:8, laxbreak:true */

import { WebComponentService } from './WebComponentService.js';
import { showErrorAlert } from './utils.js';

/**
 * Check if text is a number (excluding zero padding numbers).
 * Zero-padded numbers - example "000123" need to be kept in string format
 * for Excel otherwise data will be lost if a user is expecting zero-padding
 * numbers (happens often with legacy databases).
 *
 * @param {string} value
 * @returns {boolean}
 */
function isNumeric(value) {
    return (
        !isNaN(value)
        && isFinite(value)
        && !(value.length > 1 && value.substring(0, 1) === '0')
    );
}

/**
 * Convert to correct type from string (example '123' string to 123 number).
 * This is based on what is needed for ExcelJS.
 *
 * @param {string} value
 * @returns
 */
function excelValue(value) {
    if (value === '') {
        return null;
    } else if (isNumeric(value)) {
        return parseFloat(value);
    } else {
        // This code handles some known edge cases such as the following value
        // will be parsed as year 123 and an unknown timezone so the browser
        // defaults it to the user's timezone:
        //      `new Date('123 (TEST)')`
        // If this happens Excel will shows a "#####" error due to negative
        // date when using Excel's 1900 date system.
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime()) && dateValue.getYear() > 0
            && (value.includes('-') || value.includes(',') || value.includes('/'))
        ) {
            return dateValue;
        }
    }
    return value;
}

function downloadExcelJS(callback) {
	if (window.ExcelJS !== undefined) {
		callback();
		return;
	}
	const script = document.createElement('script');
	script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
	script.onload = callback;
	document.querySelector('head').appendChild(script);
}

/**
 * Return true if a file name has invalid characters.
 * Based on `InvalidFileNameChars` from:
 * https://github.com/microsoft/referencesource/blob/master/mscorlib/system/io/path.cs
 *
 * @param {string} fileName
 * @returns {boolean}
 */
function hasInvalidFileNameChars(fileName) {
    const invalidChars = ['"', '<', '>', '|', ':', '*', '?', '\\', '/'];
    for (const char of invalidChars) {
        if (fileName.includes(char)) {
            return true;
        }
    }
    for (let ascii = 0; ascii < 32; ascii++) {
        if (fileName.includes(String.fromCharCode(ascii))) {
            return true;
        }
    }
    return false;
}

function exportTable(event) {
    // Use an HTML attribute to track if file is being generated and if the
    // user clicks while the previous export is still running then exit.
    // ExcelJS is over 250 kB in gzip size so if a user is on a slow connection
    // or device it can take time the first time this function runs.
    const attrRunning = 'data-running-export';
    if (event.target.getAttribute(attrRunning) !== null) {
        return;
    }
    event.target.setAttribute(attrRunning, '');
    if (event.target.nodeName === 'BUTTON') {
        event.target.disabled = true;
    }

    downloadExcelJS(() => {
        // Get export settings
        const selector = event.target.getAttribute('data-export-excel-selector');
        let exportFileName = event.target.getAttribute('data-export-file-name');
        if (exportFileName
            && (
                exportFileName.length <= 5
                || !exportFileName.endsWith('.xlsx')
                || hasInvalidFileNameChars(exportFileName)
            )
        ) {
            showErrorAlert('Attribute [data-export-file-name] must be a valid name with file type [*.xlsx]');
            return;
        }
        exportFileName = exportFileName || 'Report.xlsx';
        let worksheetName = event.target.getAttribute('data-worksheet-name');
        worksheetName = worksheetName || 'Report';
        const exportAll = (event.target.getAttribute('data-export-all') !== null);

        // Get Table Header
        const table = document.querySelector(selector);
        const rows = [];
        const colWidths = [];
        let row = [];
        let rowEl = table.tHead.rows[0];
        for (let n = 0, m = rowEl.cells.length; n < m; n++) {
            const text = rowEl.cells[n].textContent;
            row.push(text);
            // Add extra padding/space for bold font - larger of (1.2x or 4 extra)
            const len = text.length;
            const width = parseInt(Math.max(len * 1.2, len + 4));
            colWidths.push(width);
        }
        rows.push(row);

        // Get Table Rows
        const tableRows = table.tBodies[0].rows;
        for (let x = 0, y = tableRows.length; x < y; x++) {
            rowEl = tableRows[x];
            if (!exportAll && rowEl.style.display === 'none') {
                // Exclude hidden rows
                continue;
            }
            row = [];
            for (let n = 0, m = rowEl.cells.length; n < m; n++) {
                const cell = rowEl.cells[n];
                let value = cell.getAttribute('data-value');
                if (value === null) {
                    value = cell.textContent;
                }
                let width = value.length;
                value = excelValue(value);
                if (value instanceof Date) {
                    width = 12;
                } else if (typeof value === 'number') {
                    width = value.toString().length + 2;
                }
                colWidths[n] = Math.max(colWidths[n], width);
                row.push(value);
            }
            rows.push(row);
        }

        // Build Workbook and add data
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(worksheetName);
        for (const row of rows) {
            worksheet.addRow(row);
        }

        // Font Style for Header Row
        const firstRow = worksheet.getRow(1);
        firstRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
        };
        firstRow.font = { bold: true };

        // Set column width based on size of data but limit to a max of 50
        // otherwise large columns take up the width of the screen and can
        // be hard (or a hassle) for users to reduce the size of the column.
        for (let n = 0; n < colWidths.length; n++) {
            worksheet.getColumn(n + 1).width = Math.min(50, colWidths[n]);
        }

        // Setup filter
        worksheet.autoFilter = {
            from: {
                row: 1,
                column: 1
            },
            to: {
                row: rows.length,
                column: colWidths.length
            }
        };

        // Freeze Header Row
        worksheet.views = [
            { state: 'frozen', ySplit: 1 }
        ];

        // Save (appears as file download to user)
        workbook.xlsx.writeBuffer().then(data => {
            const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const blob = new Blob([data], { type: mimeType });
            if (navigator.msSaveBlob !== undefined) {
                navigator.msSaveBlob(blob, exportFileName);
            } else {
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', exportFileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Enable original Export Link/Button
            event.target.removeAttribute(attrRunning);
            if (event.target.nodeName === 'BUTTON') {
                event.target.disabled = false;
            }
        });
    });
}

window.customElements.define('export-to-excel-service', class ExportToExcelService extends WebComponentService {
    onLoad() {
        // Find Elements
        const actionElements = document.querySelectorAll('[data-export-excel-selector]');

        // Check browser support
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
