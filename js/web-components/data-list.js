/**
 * DataFormsJS <ul is="data-list"> Web Component
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

import { render } from './utils.js';

class DataList extends HTMLUListElement {
    constructor() {
        super();        
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
        console.log('list:', list);
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
        for (const item of list) {
            html.push(render`<li>${item}</li>`);
        }
        this.innerHTML = html.join('');

        // Remove this attribute after the first time a list has been rendered
        this.removeAttribute('not-setup');
    }
}

window.customElements.define('data-list', DataList, { extends: 'ul' });
