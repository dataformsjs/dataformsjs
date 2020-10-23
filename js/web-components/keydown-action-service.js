/**
 * DataFormsJS <keydown-action-service> Web Component
 *
 * This "service" looks for elements with the attribute [data-enter-key-click-selector]
 * and allows the [enter] key of the element to trigger a [click()] event on the element
 * specified in the selector.
 *
 * The term "service" is used here because all elments on the page with the
 * attribute will have an event assigned to them so rather than rendering content
 * this Web Component provides a "service" for other elements on the page.
 *
 * Common usage would be for Entry Forms where the {enter} key should perform a
 * default action. For example usage see the Places Demo Search Screen.
 *
 * The DataFormsJS Framework has a corresponding plugin: [js/plugins/keydownAction.js].
 *
 * Example:
 *     <keydown-action-service></keydown-action-service>
 *     <input type="text" data-bind="name" data-enter-key-click-selector="button">
 */

/* Validates with both [jshint] and [eslint] */
/* jshint esversion:8 */
/* eslint-env browser, es6 */

import { usingWebComponentsPolyfill } from './utils.js';

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style> :host { display:none; } </style>
    <slot></slot>
`;

function enterToClick(e) {
    if (e.keyCode !== 13) {
        return;
    }
    const selector = e.target.getAttribute('data-enter-key-click-selector');
    if (!selector) {
        return;
    }
    const clickEl = document.querySelector(selector);
    if (!clickEl) {
        return;
    }
    e.preventDefault();
    clickEl.click();
}

/**
 * Define class for the <keydown-action-service> element
 */
class KeydownActionService extends HTMLElement {
    constructor() {
        super();
        if (usingWebComponentsPolyfill()) {
            return;
        }
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
    }

    connectedCallback() {
        this.setEvents(true);
    }

    disconnectedCallback() {
        this.setEvents(false);
    }

    setEvents(add) {
        const elements = document.querySelectorAll('[data-enter-key-click-selector]');
        const event = (add ? 'addEventListener' : 'removeEventListener');
        for (const el of elements) {
            el[event]('keydown', enterToClick);
        }
    }
}

/**
 * Add <keydown-action-service> element to the page
 */
window.customElements.define('keydown-action-service', KeydownActionService);
