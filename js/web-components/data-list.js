/**
 * DataFormsJS <ul is="data-list"> Web Component
 *
 * This component renders a standard <table> after [value] is set from JavaScript
 * with an array of objects. This component works with the <json-data> to display
 * data once it is downloaded.
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8, evil:true */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import { render } from './utils.js';

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>:host { display:block; }</style>
    <slot></slot>
`;

class DataList extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
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
        
        // List Items
        const html = [];
        const templateSelector = this.getAttribute('template-selector');
        const rootClass = this.getAttribute('root-class');
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
                if (rootClass === null) {
                    html.push(render`<${rootElement}>`);
                } else {
                    html.push(render`<${rootElement} class="${rootClass}">`);
                }
            }
            
            // Render each item in the template
            const tmpl = new Function('item', 'render', 'with(item){return render`' + template.innerHTML + '`}');
            for (const item of list) {
                html.push(tmpl(item, render));
            }
            
            // Close root element if defined
            if (rootElement !== null) {
                html.push(render`</${rootElement}>`);
            }
        } else {
            // Basic <ul> list
            if (rootClass === null) {
                html.push('<ul>');
            } else {
                html.push(render`<ul class="${rootClass}">`);
            }
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