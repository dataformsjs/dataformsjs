/**
 * DataFormsJS Plugin [exportToCsv]
 *
 * This plugin allows a user to export an HTML <table> to a CSV file download
 * based on the attributes:
 *     data-export-csv-selector
 *     data-export-file-name
 *
 * Exports happen directly in the broswer through JavaScript and no server-side calls
 * are made which makes the export/download appear almost instantly to the user.
 *
 * [Report.csv] is optional and if not defined then the report will
 * use 'Report.csv' as the file name.
 *
 * Example:
 *     <button data-export-csv-selector="table" data-export-file-name="Data.csv">Export to CSV</button>
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

    function csvEscape(value) {
        value = value.replace(/"/g, '""');
        if (value.search(/("|,|\n|:)/g) >= 0) {
            value = '"' + value + '"';
        }
        return value;
    }

    /**
     * Plugin Object
     */
    var exportToCsv = {
        /**
         * Export an HTML Table to a CSV Download
         *
         * @param {string} selector
         * @param {string|undefined|null} exportFileName
         */
        exportTable: function (selector, exportFileName) {
            var table = document.querySelector(selector),
                rows = [],
                row = [],
                rowEl,
                n,
                m,
                tableRows,
                x,
                y,
                csv,
                blob,
                link,
                url;

            // Set default value if not specified
            exportFileName = exportFileName || 'Report.csv';

            // Table Header
            rowEl = table.tHead.rows[0];
            for (n = 0, m = rowEl.cells.length; n < m; n++) {
                row.push(csvEscape(rowEl.cells[n].textContent));
            }
            rows.push(row.join(','));

            // Table Body Rows
            tableRows = table.tBodies[0].rows;
            for (x = 0, y = tableRows.length; x < y; x++) {
                row = [];
                rowEl = tableRows[x];
                for (n = 0, m = rowEl.cells.length; n < m; n++) {
                    row.push(csvEscape(rowEl.cells[n].textContent));
                }
                rows.push(row.join(','));
            }

            // Build text string of all CSV Rows
            csv = rows.join('\r\n');

            // Create an export the CSV as a Blog Object
            blob = new Blob([csv], { type: 'text/csv; charset=utf-8;' });
            if (navigator.msSaveBlob !== undefined) {
                navigator.msSaveBlob(blob, exportFileName);
            } else {
                link = document.createElement('a');
                if (link.download !== undefined) {
                    url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', exportFileName);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    var msg = 'Unable to Export as a CSV File. Try a different browser and if you need help then please contact support.';
                    app.showErrorAlert(msg);
                }
            }
        },

        /**
         * Once the Form Renders find any elements that have attribute
         * [data-export-csv-selector] and assing an onclick event to it.
         */
        onRendered: function () {
            // Find Elements
            var actionElements = document.querySelectorAll('[data-export-csv-selector]');

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
                // (Example, this doens't work on an iPhone).
                if (isSupported) {
                    var selector = element.getAttribute('data-export-csv-selector');
                    var fileName = element.getAttribute('data-export-file-name');
                    element.onclick = function () {
                        exportToCsv.exportTable(selector, fileName);
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
    app.addPlugin('exportToCsv', exportToCsv);
})();
