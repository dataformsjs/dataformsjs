/**
 * DataFormsJS <data-table> Web Component
 *
 * This component renders a standard <table> after [value] is set from JavaScript
 * with an array of objects. This component works with the <json-data> to display
 * data once it is downloaded.
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import { render, buildUrl } from './utils.js';

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>:host { display:block; }</style>
    <slot></slot>
`;

class DataTable extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        this.setAttribute('not-setup', '');
        this.state = {
            list: null,
            hasBeenLoaded: false,
        };
    }

    static get observedAttributes() {
        return ['col-link-template', 'col-link-fields', 'columns', 'labels', 'table-attr'];
    }

    attributeChangedCallback(attr, oldVal, /* newVal */) {
        switch (attr) {
            case 'col-link-template':
            case 'col-link-fields':
            case 'columns':
            case 'labels':
            case 'table-attr':
                if (oldVal !== null || this.state.hasBeenLoaded) {
                    this.renderTable();
                }
                break;
        }
    }

    get value() {
        return this.state.list;
    }

    set value(list) {
        this.state.list = list;
        this.renderTable();
    }

    renderTable() {
        // Ignore if [value] has not yet been set
        const list = this.state.list;
        if (list === null || list === '') {
            this.innerHTML = '';
            return;
        }

        // Allow attribute changes after first render
        this.state.hasBeenLoaded = true;

        // Show no-data if empty
        if (Array.isArray(list) && list.length === 0) {
            this.innerHTML = '<table class="no-data"></table>';
            this.removeAttribute('not-setup');
            return;
        }

        // Validate data type
        let isValid = true;
        if (!Array.isArray(list)) {
            isValid = false;
        } else if (list.length > 0 && typeof list[0] !== 'object') {
            isValid = false;
        }
        if (!isValid) {
            this.innerHTML = '<table><caption class="error">Error invalid data type for table</capiton></table>';
            this.removeAttribute('not-setup');
            return;
        }

        // Get Columns - Either User Defined or from the first Record
        const userCols = this.getAttribute('columns');
        const columns = (userCols ? userCols.split(',').map(s => s.trim()) : Object.keys(list[0]));

        // Get Custom Labels/Titles to Display or use Field Names
        let labels = columns;
        let userLabels = this.getAttribute('labels');
        if (userLabels) {
            labels = userLabels.split(',').map(s => s.trim());
            if (labels.length !== columns.length) {
                labels = columns;
            }
        }

        // Table Header
        let tableHtml = '<table';
        let tableAttr = this.getAttribute('table-attr');
        if (tableAttr) {
            tableAttr = tableAttr.split(',').map(s => s.trim());
            for (const attr of tableAttr) {
                const pos = attr.indexOf('=');
                if (pos > 1) {
                    const name = attr.substr(0, pos).trim();
                    const value = attr.substr(pos+1).trim();
                    tableHtml += render` ${name}="${value}"`;
                } else {
                    tableHtml += render` ${attr}`;
                }
            }
        }
        const html = [];
        html.push(`${tableHtml}><thead><tr>`);
        for (const label of labels) {
            html.push(render`<th>${label}</th>`);
        }
        html.push('</tr></thead>');

        // Will the table use a link template?
        const linkTmpl = this.getAttribute('col-link-template');
        let linkFields = this.getAttribute('col-link-fields');
        if (linkTmpl) {
            if (linkFields) {
                linkFields = linkFields.split(',').map(s => s.trim());
            } else {
                linkFields = [columns[0]];
            }
        }

        // Table Body
        html.push('<tbody>');
        for (const item of list) {
            const row = [];
            row.push('<tr>');
            for (const column of columns) {
                if (linkTmpl && linkFields.includes(column)) {
                    row.push(render`<td>
                        <a href="${buildUrl(linkTmpl, item)}">${item[column]}</a>
                    </td>`);
                } else {
                    row.push(render`<td>${item[column]}</td>`);
                }
            }
            row.push('</tr>');
            html.push(row.join(''));
        }
        html.push('</tbody></table>');
        this.innerHTML = html.join('');

        // Remove this attribute after the first time a table is rendered
        this.removeAttribute('not-setup');
    }
}

window.customElements.define('data-table', DataTable);
