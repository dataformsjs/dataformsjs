/**
 * DataFormsJS <data-view> Web Component
 *
 * This component renders HTML using a custom <template> after [value]
 * is set from JavaScript. This component works well with the <json-data>
 * component to display data once it is downloaded and because of it's
 * small size it can easily be copied and customized for any app or site.
 *
 * The attribute [template-selector] is used to specify a CSS selector for
 * the template and JavaScript Template literals (Template strings) are used
 * for the template format. All variables in the template will be escaped
 * for HTML encoding.
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8, evil:true */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import { render, showError, usingWebComponentsPolyfill, escapeHtml } from './utils.js';
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

class DataView extends HTMLElement {
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
        this.state = null;
    }

    get value() {
        return this.state;
    }

    set value(newValue) {
        this.state = newValue;
        this.renderView();
    }

    renderView() {
        // Ignore if [value] has not yet been set
        if (this.state === null) {
            this.innerHTML = '';
            return;
        }

        // Remove this attribute the first time a list is being rendered
        this.removeAttribute('not-setup');

        // Validate data type (must be object or an array)
        if (typeof this.state !== 'object') {
            showError(this, 'Invalid data type for <data-view>, expected object or array but was passed: ' + typeof this.state);
            return;
        }

        // Get and validate the template
        const templateSelector = this.getAttribute('template-selector');
        if (templateSelector === null) {
            showError(this, 'Missing Attribute [template-selector] for <data-view>.');
            return;
        }
        const template = document.querySelector(templateSelector);
        if (template === null) {
            showError(this, 'Missing template from selector: ' + templateSelector);
            return;
        }
        if (!(template.nodeName === 'TEMPLATE' || (template.nodeName === 'SCRIPT' && template.type === 'text/x-template'))) {
            showError(this, 'Element at selector [' + templateSelector + '] needs to point to a <template> or a <script type="text/x-template"> element');
            return;
        }

        // Get Template Contents
        let tmplHtml = template.innerHTML;
        const renderFn = (this.getAttribute('template-returns-html') === null ? 'render' : '');
        if (!renderFn) {
            tmplHtml = tmplHtml.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<');
        }

        // By default variables for the list item are scoped using `with`. If [data-name]
        // is used then the template can refer to the data object by a variable name.
        const dataName = this.getAttribute('data-name');

        // Create a JavaScript function based on the template (compile the template)
        let tmpl;
        try {
            if (dataName) {
                tmpl = new Function(dataName, 'render', 'escapeHtml', 'format', 'return ' + renderFn + '`' + tmplHtml + '`');
            } else {
                tmpl = new Function('item', 'render', 'escapeHtml', 'format', 'with(item){return ' + renderFn + '`' + tmplHtml + '`}');
            }
        } catch (e) {
            showError(this, `Error Rendering Template - ${e.message}`);
            return;
        }

        // Set html with data and the template function
        try {
            const format = new Format();
            this.innerHTML = tmpl(this.state, render, escapeHtml, format);
        } catch (e) {
            showError(this, `Error Evaluating Template - ${e.message}`);
        }
    }
}

window.customElements.define('data-view', DataView);
