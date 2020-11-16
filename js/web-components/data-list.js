/**
 * DataFormsJS <data-list> Web Component
 *
 * This component renders either a basic <ul> or custom <template> after [value]
 * is set from JavaScript with an array of objects. This component works well with
 * the <json-data> component to display data once it is downloaded and because of
 * it's small size it can easily be copied and customized for any app or site.
 *
 * When using a <template> element the attribute [template-selector] is used to
 * specify a CSS selector for the template and JavaScript Template literals
 * (Template strings) are used for the template format. All variables in the
 * template will be escaped for HTML encoding.
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8, evil:true */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import { render, showError, escapeHtml } from './utils.js';
import { Format } from './utils-format.js';

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>
        :host { display: block; }
        :host([hidden]) { display: none; }
    </style>
    <slot></slot>
`;

class DataList extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        this.state = { list: null };
    }

    get value() {
        return this.state.list;
    }

    set value(list) {
        this.state.list = list;
        this.renderList();
    }

    get errorClass() {
        return this.getAttribute('error-class');
    }

    get defaultErrorStyle() {
        return 'color:white; background-color:red; padding:0.5rem 1rem; margin:.5rem;';
    }

    renderList() {
        // Ignore if [value] has not yet been set
        const list = this.state.list;
        if (list === null || list === '') {
            this.innerHTML = '';
            return;
        }

        // Show no-data if empty
        if (Array.isArray(list) && list.length === 0) {
            return;
        }

        // Validate data type
        if (!Array.isArray(list)) {
            showError(this, 'Invalid list data type for [data-list]');
            return;
        }

        // Build Attributes for Root Element
        let rootClass = this.getAttribute('root-class');
        let rootAttr = this.getAttribute('root-attr');
        let rootAttrHtml = '';
        if (rootClass) {
            rootAttrHtml = render` class="${rootClass}"`;
        }
        if (rootAttr) {
            rootAttr = rootAttr.split(',').map(s => s.trim());
            for (const attr of rootAttr) {
                const pos = attr.indexOf('=');
                if (pos > 1) {
                    const name = attr.substr(0, pos).trim();
                    const value = attr.substr(pos+1).trim();
                    rootAttrHtml += render` ${name}="${value}"`;
                } else {
                    rootAttrHtml += render` ${attr}`;
                }
            }
        }

        // List Items
        const html = [];
        const templateSelector = this.getAttribute('template-selector');
        if (templateSelector !== null) {
            // Get and validate the template
            const template = document.querySelector(templateSelector);
            if (template === null) {
                showError(this, 'Missing template from selector: ' + templateSelector);
                return;
            }
            if (!(template.nodeName === 'TEMPLATE' || (template.nodeName === 'SCRIPT' && template.type === 'text/x-template'))) {
                showError(this, 'Element at selector [' + templateSelector + '] needs to point to a <template> or a <script type="text/x-template"> element');
                return;
            }

            // Root Element is optional and only used if a template is used
            const rootElement = this.getAttribute('root-element');
            if (rootElement !== null) {
                if (rootElement !== rootElement.toLowerCase()) {
                    showError(this, '<data-list [root-element="name"]> must be all lower-case. Value used: [' + rootElement + ']');
                    return;
                } else if (rootElement.indexOf(' ') !== -1) {
                    showError(this, '<data-list [root-element="name"]> cannot contain a space. Value used: [' + rootElement + ']');
                    return;
                } else if (/[&<>"'/]/.test(rootElement) !== false) {
                    showError(this, '<data-list [root-element="name"]> cannot contain HTML characters that need to be escaped. Invalid characters are [& < > " \' /]. Value used: [' + rootElement + ']');
                    return;
                }
                // Values are already escaped - no need to use `render`
                html.push(`<${rootElement}${rootAttrHtml}>`);
            }

            // Render each item in the template. A new function is dynamically created that simply
            // renders the contents of the template as a JavaScript template literal (template string).
            // The Tagged Template Literal function `render()` from [utils.js] is used to safely escape
            // the variables for HTML encoding. The variable `index` is made available to the template
            // and it can be safely overwritten by the list item due to variable scoping during rendering.
            try {
                // Get Template Contents
                let tmplHtml = template.innerHTML;

                // By default content to render is escaped using the `render` Tagged Template Literal function.
                // If not then then template is likely mixing more advanced JavaScript with HTML so replace
                // certain HTML escape characters if using a <template> instead of a <script>.
                const renderFn = (this.getAttribute('template-returns-html') === null ? 'render' : '');
                if (!renderFn && template.nodeName === 'TEMPLATE') {
                    tmplHtml = tmplHtml.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<');
                }

                // By default variables for the list item are scoped using `with`. If [list-item-name]
                // is used then the template can refer to each list item object by a variable name.
                const listItemName = this.getAttribute('list-item-name');

                // Create a JavaScript function based on the template (compile the template)
                let tmpl;
                if (listItemName) {
                    tmpl = new Function(listItemName, 'index', 'render', 'escapeHtml', 'format', 'return ' + renderFn + '`' + tmplHtml + '`');
                } else {
                    tmpl = new Function('item', 'index', 'render', 'escapeHtml', 'format', 'with(item){return ' + renderFn + '`' + tmplHtml + '`}');
                }

                // Process each item using the template function
                let index = 0;
                const format = new Format();
                for (const item of list) {
                    try {
                        html.push(tmpl(item, index, render, escapeHtml, format));
                    } catch (e) {
                        const itemElement = (rootElement === 'ul' ? 'li' : 'div');
                        const errorClass = this.errorClass;
                        if (errorClass) {
                            html.push(render`<${itemElement} class="${this.errorClass}">Item Error - ${e.message}</${itemElement}>`);
                        } else {
                            html.push(render`<${itemElement} style="${this.defaultErrorStyle}">Item Error - ${e.message}</${itemElement}>`);
                        }
                    }
                    index++;
                }
            } catch (e) {
                const errorClass = this.errorClass;
                if (errorClass) {
                    html.push(render`<div class="${this.errorClass}">Error Rendering Template - ${e.message}</div>`);
                } else {
                    html.push(render`<div style="${this.defaultErrorStyle}">Error Rendering Template - ${e.message}</div>`);
                }
            }

            // Close root element if defined
            if (rootElement !== null) {
                html.push(render`</${rootElement}>`);
            }
        } else {
            // Basic <ul> list
            html.push(`<ul${rootAttrHtml}>`);
            for (const item of list) {
                html.push(render`<li>${item}</li>`);
            }
            html.push('</ul>');
        }
        this.innerHTML = html.join('');
    }
}

window.customElements.define('data-list', DataList);
