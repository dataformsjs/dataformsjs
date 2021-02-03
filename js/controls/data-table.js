/**
 * DataFormsJS <data-table> JavaScript Control
 *
 * This control is designed for compatibility with the DataFormsJS Web Component
 * [js/web-components/data-table.js] and includes the ability for basic templating
 * from HTML using a template syntax based on JavaScript template literals (template strings).
 *
 * When [js/web-components/polyfill.js] is used for DataFormsJS Web Component
 * this file will be downloaded and used.
 *
 * The script [js/extensions/jsTemplate.js] is required when using templating
 * and is handled automatically by [polyfill.js]. To use the the standard
 * Framework simply make sure the script is included from [app.lazyLoad]
 * before the page loads.
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
         * Data for the control
         */
        data: {
            bind: null,
            columns: null,
            labels: null,
            emptyDataText: 'No records found',
            errorInvalidData: 'Error invalid data for table',
            errorClass: null,
            defaultErrorStyle: 'color:white; background-color:red; padding:0.5rem 1rem; margin:.5rem;',
            highlightClass: null,
            tableAttr: null,
            colClass: null,
            colLinkTemplate: null,
            colLinkFields: null,
            rowItemName: null,
        },

        /**
         * Event that gets called when a <data-table> is rendered on screen
         *
         * @this dataTable.data
         * @param {HTMLElement} element
         * @param {object} model
         */
        onLoad: function(element, model) {
            var row,
                columns,
                labels,
                n,
                m,
                x,
                y,
                item,
                column,
                name,
                value;

            var template = element.querySelector('template:not([data-footer])');
            if (template === null) {
                // If IE is supported <script> tags need to be used instead of <template>
                template = element.querySelector('script[type="text/x-template"]:not([data-footer])');
            }

            var footerTemplate = element.querySelector('template[data-footer]');
            if (footerTemplate === null) {
                footerTemplate = element.querySelector('script[type="text/x-template"][data-footer]');
            }

            // Define private functions in this scope
            function addTable(html) {
                if (template === null && footerTemplate === null) {
                    element.innerHTML = html;
                } else {
                    removeTable();
                    element.insertAdjacentHTML('beforeend', html);
                }
            }

            function showError(errorMessage, errorClass, defaultErrorStyle) {
                if (errorClass) {
                    addTable('<table class="' + errorClass + '}"><caption>' + app.escapeHtml(errorMessage) + '</caption></table>');
                } else {
                    addTable('<table><caption style="display:block; ' + defaultErrorStyle + '">' + app.escapeHtml(errorMessage) + '</caption></table>');
                }
            }

            function removeTable() {
                // If there is no template than it's safe to clear all content
                if (template === null && footerTemplate === null) {
                    element.innerHTML = '';
                    return;
                }

                // <template> exists so simply remove <table> from the DOM
                var table = element.querySelector('table');
                if (table !== null) {
                    table.parentNode.removeChild(table);
                }
            }

            // Get Table from Active Model. If using format of "object.prop"
            // then the [dataBind] plugin (if available) will used to get the data.
            var list = (model && model[this.bind] ? model[this.bind] : null);
            if (list === null && app.plugins.dataBind !== undefined && typeof app.plugins.dataBind.getBindValue === 'function') {
                list = app.plugins.dataBind.getBindValue(this.bind, model);
            }

            // Ignore if list has not yet been set
            if (list === null) {
                return;
            }

            // Show no-data if empty
            if (Array.isArray(list) && list.length === 0) {
                if (this.emptyDataText === null) {
                    addTable('<table class="no-data"></table>');
                } else {
                    addTable('<table class="no-data"><caption>' + app.escapeHtml(this.emptyDataText) + '</caption></table>');
                }
                return;
            }

            // Validate data type
            var isValid = true;
            if (!Array.isArray(list)) {
                isValid = false;
            } else if (list.length > 0 && typeof list[0] !== 'object') {
                isValid = false;
            }
            if (!isValid) {
                showError(this.errorInvalidData, this.errorClass, this.defaultErrorStyle);
                return;
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
                if ((labels.length !== columns.length) && template === null) {
                    labels = columns;
                }
            }

            // Table Header
            var html = [];
            var tableHtml = '<table';
            if (this.tableAttr) {
                var tableAttr = this.tableAttr.split(',').map(function(s) { return s.trim(); });
                for (n = 0, m = tableAttr.length; n < m; n++) {
                    var attr = tableAttr[n];
                    var pos = attr.indexOf('=');
                    if (pos > 1) {
                        name = attr.substr(0, pos).trim();
                        value = attr.substr(pos+1).trim();
                        tableHtml += ' ' + app.escapeHtml(name) + '="' + app.escapeHtml(value) + '"';
                        // Add [data-sort] so that [app.plugins.sort] can handle
                        // the Web Component [is="sortable-table"].
                        if (name === 'is' && value === 'sortable-table') {
                            tableHtml += ' data-sort';
                        }
                    } else {
                        tableHtml += ' ' + app.escapeHtml(attr);
                    }
                }
            }
            html.push(tableHtml + '><thead><tr>');
            row = [];
            if (this.colClass) {
                var classList = this.colClass.split(',').map(function(s) { return s.trim(); });
                var classIndex = {};
                classList.forEach(function(item) {
                    var pos = item.indexOf('=');
                    if (pos > 0) {
                        var col = item.substr(0, pos);
                        var className = item.substr(pos+1);
                        classIndex[col] = className;
                    }
                });
                for (n = 0, m = labels.length; n < m; n++) {
                    var label = labels[n];
                    var className = null;
                    if (classIndex[n.toString()] !== undefined) {
                        className = classIndex[n.toString()];
                    } else if (classIndex[label] !== undefined) {
                        className = classIndex[label];
                    }
                    if (className) {
                        row.push('<th class="' + app.escapeHtml(className) + '">' + app.escapeHtml(labels[n]) + '</th>');
                    } else {
                        row.push('<th>' + app.escapeHtml(labels[n]) + '</th>');
                    }
                }
            } else {
                for (n = 0, m = labels.length; n < m; n++) {
                    row.push('<th>' + app.escapeHtml(labels[n]) + '</th>');
                }
            }
            html.push(row.join(''));
            html.push('</tr></thead>');

            // Table Body
            html.push('<tbody>');
            if (template !== null) {
                 try {
                    if (app.jsTemplate === undefined) {
                        throw Error('Error - When using <data-table> with a template the script [js/extensions/jsTemplate.js] is required.');
                    }
                    // Render each item using the template
                    var render = app.jsTemplate.compile(this.rowItemName, false, template.innerHTML);
                    for (var index = 0, count = list.length; index < count; index++) {
                        item = list[index];
                        try {
                            html.push(render(item, index, app.escapeHtml, app.format));
                        } catch (e) {
                            if (this.errorClass) {
                                html.push('<tr class="' + this.errorClass + '">');
                            } else {
                                html.push('<tr style="' + this.defaultErrorStyle + '">');
                            }
                            html.push('<td colspan="' + columns.length + '">Item Error - ' + e.message + '</td></tr>');
                        }
                    }
                } catch (e) {
                    showError('Error Rendering Template - ' + e.message, this.errorClass, this.defaultErrorStyle);
                    return;
                }
            } else {
                // Will the table use a link template?
                var linkTmpl = this.colLinkTemplate;
                var linkFields = null;
                if (linkTmpl) {
                    if (this.colLinkFields) {
                        linkFields = this.colLinkFields.split(',').map(function(s) { return s.trim(); });
                    } else {
                        linkFields = [columns[0]];
                    }
                }

                // Build basic table
                y = columns.length;
                for (n = 0, m = list.length; n < m; n++) {
                    row = [];
                    row.push('<tr>');
                    for (x = 0; x < y; x++) {
                        column = columns[x];
                        item = list[n];
                        value = item[column];
                        value = (value === null ? '' : app.escapeHtml(value));
                        if (linkTmpl && linkFields.indexOf(column) !== -1) {
                            row.push('<td><a href="' + app.buildUrl(linkTmpl, item) + '">' + app.escapeHtml(value) + '</a></td>');
                        } else {
                            row.push('<td>' + value + '</td>');
                        }
                    }
                    row.push('</tr>');
                    html.push(row.join(''));
                }
            }
            // Footer Template
            if (footerTemplate) {
                html.push('<tfoot>');
                var numValues = function(field) {
                    var values = [];
                    for (var n = 0, m = list.length; n < m; n++) {
                        var value = list[n][field];
                        switch (typeof value) {
                            case 'number':
                                values.push(value);
                                break;
                            case 'string':
                                value = parseFloat(value);
                                if (!isNaN(value)) {
                                    values.push(value);
                                }
                        }
                    }
                    return values;
                };
                var sum = function(field) {
                    return numValues(field).reduce(function(a, b) { return a + b; }, 0);
                };
                var avg = function(field) {
                    var values = numValues(field);
                    return values.reduce(function(a, b) { return a + b; }, 0) / values.length;
                };
                var max = function(field) {
                    return Math.max.apply(null, numValues(field));
                };
                var min = function(field) {
                    return Math.min.apply(null, numValues(field));
                };
                var itemCount = function() { return list.length; }; // For `count()` in the template
                try {
                    if (app.jsTemplate === undefined) {
                        throw Error('Error - When using <data-table> with a template the script [js/extensions/jsTemplate.js] is required.');
                    }
                    var renderFooter = app.jsTemplate.compile(['sum', 'avg', 'max', 'min', 'count'], false, footerTemplate.innerHTML);
                    try {
                        html.push(renderFooter(sum, avg, max, min, itemCount, app.escapeHtml, app.format));
                    } catch (e) {
                        if (this.errorClass) {
                            html.push('<tr class="' + this.errorClass + '">');
                        } else {
                            html.push('<tr style="' + this.defaultErrorStyle + '">');
                        }
                        html.push('<td colspan="' + columns.length + '">Footer Error - ' + e.message + '</td></tr>');
                    }
                } catch (e) {
                    showError('Error Rendering Footer Template - ' + e.message, this.errorClass, this.defaultErrorStyle);
                    return;
                }
                html.push('</tfoot>');
            }
            html.push('</tbody>');
            addTable(html.join(''));

            // Allow user to highlight rows by clicking on them using [clickToHighlight] Plugin?
            if (this.highlightClass) {
                element.querySelector('table').classList.add('click-to-highlight');
            }
        },
    };

    /**
     * Add control to app
     */
    app.addControl('data-table', dataTable);
})();
