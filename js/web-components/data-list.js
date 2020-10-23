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

import { render, showError, usingWebComponentsPolyfill } from './utils.js';
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
        if (usingWebComponentsPolyfill()) {
            return;
        }
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        // The [not-setup] is defined when the component is created and removed when data
        // is set. It allows for applications to handle logic based on whether or not the
        // data list has been rendered. For usage see `componentsAreSetup()` from [utils.js].
        this.setAttribute('not-setup', '');
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
            this.removeAttribute('not-setup');
            return;
        }

        // Validate data type
        if (!Array.isArray(list)) {
            console.error('Invalid list data type for [data-list]');
            console.log(this);
            this.removeAttribute('not-setup');
            return;
        }

        // Build Attributes for Root Element
        let rootAttr = this.getAttribute('root-attr');
        let rootAttrHtml = '';
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
                console.error('Missing template from selector: ' + templateSelector);
                console.log(this);
                this.removeAttribute('not-setup');
                return;
            }
            if (template.nodeName !== 'TEMPLATE') {
                console.error('Element at selector [' + templateSelector + '] is not a <template>');
                console.log(this);
                this.removeAttribute('not-setup');
                return;
            }

            // Root Element is optional and only used if a template is used
            const rootElement = this.getAttribute('root-element');
            if (rootElement !== null) {
                if (rootElement !== rootElement.toLowerCase()) {
                    showError(this, '<data-list [root-element="name"]> must be all lower-case. Value used: [' + rootElement + ']');
                    this.removeAttribute('not-setup');
                    return;
                } else if (rootElement.indexOf(' ') !== -1) {
                    showError(this, '<data-list [root-element="name"]> cannot contain a space. Value used: [' + rootElement + ']');
                    this.removeAttribute('not-setup');
                    return;
                } else if (/[&<>"'/]/.test(rootElement) !== false) {
                    showError(this, '<data-list [root-element="name"]> cannot contain HTML characters that need to be escaped. Invalid characters are [& < > " \' /]. Value used: [' + rootElement + ']');
                    this.removeAttribute('not-setup');
                    return;
                }
                // Values are already escaped - no need to use `render`
                html.push(`<${rootElement}${rootAttrHtml}>`);
            }

            // Render each item in the template. A new function is dynamically created that simply
            // renders the contents of the template as a JavaScript template literal (template string).
            // The Tagged Template Literal function `render()` from [utils.js] is used to safely escape
            // the variables for HTML encoding. The variable `index` is made availble to the template
            // and it can be safely overwritten by the list item due to variable scoping during rendering.
            try {
                const tmplHtml = template.innerHTML.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<');
                const tmpl = new Function('item', 'index', 'render', 'format', 'with(item){return render`' + tmplHtml + '`}');
                let index = 0;
                const format = new Format();
                for (const item of list) {
                    try {
                        html.push(tmpl(item, index, render, format));
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

        // Remove this attribute after the first time a list has been rendered
        this.removeAttribute('not-setup');
    }
}

window.customElements.define('data-list', DataList);
