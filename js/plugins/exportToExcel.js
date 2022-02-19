/**
 * DataFormsJS Plugin [exportToExcel]
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
 * Example:
 *     <button data-export-csv-selector="table"
 *          data-export-file-name="Report.xlsx"
 *          data-worksheet-name="Report">Export to Excel</button>
 *
 * @see https://github.com/exceljs/exceljs/
 */

/* Validates with both [eslint] and [jshint] */
/* global app, ExcelJS */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* jshint laxbreak:true */

(function () {
    'use strict';

    /**
     * Plugin Object
     */
    var exportToExcel = {
        /**
         * Check if text is a number (excluding zero padding numbers).
         * Zero-padded numbers - example "000123" need to be kept in string format
         * for Excel otherwise data will be lost if a user is expecting zero-padding
         * numbers (happens often with legacy databases).
         *
         * @param {string} value
         * @returns {boolean}
         */
        isNumeric: function(value) {
            return (
                !isNaN(value)
                && isFinite(value)
                && !(value.length > 1 && value.substring(0, 1) === '0')
            );
        },

        /**
         * Convert to correct type from string (example '123' string to 123 number).
         * This is based on what is needed for ExcelJS.
         *
         * @param {string} value
         * @returns
         */
        excelValue: function(value) {
            value = value.trim();
            if (value === '') {
                return null;
            } else if (exportToExcel.isNumeric(value)) {
                return parseFloat(value);
            } else {
                // This code handles some known edge cases such as the following value
                // will be parsed as year 123 and an unknown timezone so the browser
                // defaults it to the user's timezone:
                //      `new Date('123 (TEST)')`
                // If this happens Excel will shows a "#####" error due to negative
                // date when using Excel's 1900 date system.
                var dateValue = new Date(value);
                if (!isNaN(dateValue.getTime()) && dateValue.getYear() > 0
                    && (value.includes('-') || value.includes(',') || value.includes('/'))
                ) {
                    return dateValue;
                }
            }
            return value;
        },

        downloadExcelJS: function(callback) {
            if (window.ExcelJS !== undefined) {
                callback();
                return;
            }
            var isIE = (navigator.userAgent.indexOf('Trident/') !== -1);
            if (isIE) {
                exportToExcel.polyfill_IE();
            }
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
            script.onload = callback;
            document.querySelector('head').appendChild(script);
        },

        /**
         * A polyfill is required for IE with ExcelJS otherwise a run-time error will occur
         *
         * @see https://github.com/exceljs/exceljs/issues/1380#issuecomment-903924548
         * @see https://github.com/exceljs/exceljs/issues/1380#issuecomment-801443942
         * @see https://github.com/exceljs/exceljs/issues/1177#issuecomment-607207836
         */
        polyfill_IE: function() {
            var RegExp = window.RegExp;
            try {
                /* jshint -W031 */
                new RegExp('a', 'u');
            } catch (err) {
                window.RegExp = function(pattern, flags) {
                    if (typeof flags === 'string' && flags.includes('u') === true) {
                        // Ignore unicode flag in RegExp
                        flags = flags === 'u' ? undefined : flags.replace('u', '');
                        // Discard parts of the patterns used by exceljs that error out in non-unicode RegExps.
                        pattern = pattern.replace(/\uDC00-\uDBFF/g, '');
                        pattern = pattern.replace(/\uDC00-\uDB7F/g, '');
                        return new RegExp(pattern, flags);
                    }
                    return new RegExp(pattern, flags);
                };
                window.RegExp.prototype = RegExp;
            }
        },

        /**
         * Return true if a file name has invalid characters.
         * Based on `InvalidFileNameChars` from:
         * https://github.com/microsoft/referencesource/blob/master/mscorlib/system/io/path.cs
         *
         * @param {string} fileName
         * @returns {boolean}
         */
        hasInvalidFileNameChars: function(fileName) {
            var invalidChars = ['"', '<', '>', '|', ':', '*', '?', '\\', '/'];
            for (var n = 0; n < invalidChars.length; n++) {
                if (fileName.includes(invalidChars[n])) {
                    return true;
                }
            }
            for (var ascii = 0; ascii < 32; ascii++) {
                if (fileName.includes(String.fromCharCode(ascii))) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Export an HTML Table to an Excel Download
         *
         * @param {HTMLElement} element
         * @returns
         */
        exportTable: function(element) {
            // Use an HTML attribute to track if file is being generated and if the
            // user clicks while the previous export is still running then exit.
            // ExcelJS is over 250 kB in gzip size so if a user is on a slow connection
            // or device it can take time the first time this function runs.
            var attrRunning = 'data-running-export';
            if (element.getAttribute(attrRunning) !== null) {
                return;
            }
            element.setAttribute(attrRunning, '');
            if (element.nodeName === 'BUTTON') {
                element.disabled = true;
            }

            exportToExcel.downloadExcelJS(function() {
                // Get export settings
                var selector = element.getAttribute('data-export-excel-selector');
                var exportFileName = element.getAttribute('data-export-file-name');
                if (exportFileName
                    && (
                        exportFileName.length <= 5
                        || !exportFileName.endsWith('.xlsx')
                        || exportToExcel.hasInvalidFileNameChars(exportFileName)
                    )
                ) {
                    app.showErrorAlert('Attribute [data-export-file-name] must be a valid name with file type [*.xlsx]');
                    return;
                }
                exportFileName = exportFileName || 'Report.xlsx';
                var worksheetName = element.getAttribute('data-worksheet-name');
                worksheetName = worksheetName || exportFileName.substring(0, exportFileName.length - 5);
                if (worksheetName.length > 31) {
                    worksheetName = worksheetName.substring(0, 31);
                }
                var exportAll = (element.getAttribute('data-export-all') !== null);

                // Get Table Header
                var table = document.querySelector(selector);
                var rows = [];
                var colWidths = [];
                var row = [];
                var rowEl = table.tHead.rows[0];
                var n;
                var width;
                var cell;
                var value;
                for (n = 0; n < rowEl.cells.length; n++) {
                    var text = rowEl.cells[n].textContent;
                    row.push(text);
                    // Add extra padding/space for bold font - larger of (1.2x or 4 extra)
                    var len = text.trim().length;
                    width = parseInt(Math.max(len * 1.2, len + 4));
                    colWidths.push(width);
                }
                rows.push(row);

                // Get Table Rows
                var tableRows = table.tBodies[0].rows;
                for (var x = 0, y = tableRows.length; x < y; x++) {
                    rowEl = tableRows[x];
                    if (!exportAll && rowEl.style.display === 'none') {
                        // Exclude hidden rows
                        continue;
                    }
                    row = [];
                    for (n = 0; n < rowEl.cells.length; n++) {
                        cell = rowEl.cells[n];
                        value = cell.getAttribute('data-value');
                        if (value === null) {
                            value = cell.textContent;
                        }
                        width = value.trim().length;
                        value = exportToExcel.excelValue(value);
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
                var workbook = new ExcelJS.Workbook();
                var worksheet = workbook.addWorksheet(worksheetName);
                for (n = 0; n < rows.length; n++) {
                    worksheet.addRow(rows[n]);
                }

                // Font Style for Header Row
                var firstRow = worksheet.getRow(1);
                for (n = 0; n < colWidths.length; n++) {
                    cell = firstRow.getCell(n+1);
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF2F2F2' },
                    };
                    cell.font = { bold: true };
                }

                // Set column width based on size of data but limit to a max of 50
                // otherwise large columns take up the width of the screen and can
                // be hard (or a hassle) for users to reduce the size of the column.
                for (n = 0; n < colWidths.length; n++) {
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
                workbook.xlsx.writeBuffer().then(function(data) {
                    var mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    var blob = new Blob([data], { type: mimeType });
                    if (navigator.msSaveBlob !== undefined) {
                        navigator.msSaveBlob(blob, exportFileName);
                    } else {
                        var link = document.createElement('a');
                        var url = URL.createObjectURL(blob);
                        link.setAttribute('href', url);
                        link.setAttribute('download', exportFileName);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }

                    // Enable original Export Link/Button
                    element.removeAttribute(attrRunning);
                    if (element.nodeName === 'BUTTON') {
                        element.disabled = false;
                    }
                });
            });
        },

        /**
         * Once the Form Renders find any elements that have attribute
         * [data-export-csv-selector] and assigning an onclick event to it.
         */
        onRendered: function () {
            // Find Elements
            var actionElements = document.querySelectorAll('[data-export-excel-selector]');

            // Are there any on the page?
            var isSupported = false;
            if (actionElements.length > 0) {
                var firstLinkFound = document.querySelector('a');
                if (firstLinkFound === null) {
                    firstLinkFound = document.createElement('a');
                }
                isSupported = (navigator.msSaveBlob !== undefined || firstLinkFound.download !== undefined);
            }

            // Update the Elements
            Array.prototype.forEach.call(actionElements, function (element) {
                // If supported then setup and if not supported then hide the button
                // (Example, this doesn't work on older iPhones).
                if (isSupported) {
                    element.onclick = function () {
                        exportToExcel.exportTable(element);
                    };
                } else {
                    element.style.display = 'none';
                }
            });
        }
    };

    /**
     * Add Plugin to DataFormsJS
     */
    app.addPlugin('exportToExcel', exportToExcel);
})();
