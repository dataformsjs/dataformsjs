/**
 * DataFormsJS <data-table> Control
 */

/* Validates with both [jshint] and [eslint] */
/* global app */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function() {
    'use strict';

    /**
     * DataFormsJS <data-table> Control
     */
    var dataTable = {
        /**
         * HTML Element Type for the Control 
         */
        type: 'table',

        /**
         * Data for the control
         */
        data: {
            source: null,
            columns: null,
            labels: null,
            emptyDataText: 'No records found',
            errorInvalidData: 'Error invalid data for table',
        },

        /**
         * Event that gets called when a <json-control> is rendered on screen
         *
         * @this dataTable.data
         * @param {object} model
         */
        html: function(model) {
            var html,
                row,
                columns,
                labels,
                n,
                m,
                x,
                y;

            // Get Table from Model
            var list = (model && model[this.source] ? model[this.source] : null);
            if (list === null || (Array.isArray(list) && list.length === 0)) {
                if (this.emptyDataText === null) {
                    return '';
                }
                return '<caption>' + app.escapeHtml(this.emptyDataText) + '<caption>';
            }

            // Validate data type
            var isValid = true;
            if (!Array.isArray(list)) {
                isValid = false;
            } else if (list.length > 0 && typeof list[0] !== 'object') {
                isValid = false;
            }
            if (!isValid) {
                return '<caption>' + app.escapeHtml(this.errorInvalidData) + '<caption>';
            }

            // Get Columns - Either User Defined or from the first Record
            if (typeof this.columns === 'string') {
                columns = this.columns.split(',');
                for (n = 0, m = columns.length; n < m; n++) {
                    columns[n] = columns[n].trim();
                }
            } else {
                columns = Object.keys(list[0]);
            }

            // Get Custom Labels/Titles to Display or use Field Names
            labels = columns;
            if (typeof this.labels === 'string') {
                labels = this.labels.split(',');
                for (n = 0, m = labels.length; n < m; n++) {
                    labels[n] = labels[n].trim();
                }
                if (labels.length !== columns.length) {
                    labels = columns;
                }
            }

            // Render the Table's HTML Content
            html = [];
            html.push('<thead><tr>');
            row = [];
            for (n = 0, m = labels.length; n < m; n++) {
                row.push('<th>' + app.escapeHtml(labels[n]) + '</th>');
            }
            html.push(row.join(''));
            html.push('</tr></thead>');

            html.push('<tbody>');
            y = columns.length;
            for (n = 0, m = list.length; n < m; n++) {
                row = [];
                row.push('<tr>');
                for (x = 0; x < y; x++) {
                    row.push('<td>' + app.escapeHtml(list[n][columns[x]]) + '</td>');
                }
                row.push('</tr>');
                html.push(row.join(''));
            }
            html.push('</tbody>');
            return html.join('');
        },
    };

    /**
     * Add control to app
     */
    app.addControl('data-table', dataTable);
})();