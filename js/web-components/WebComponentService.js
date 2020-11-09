/**
 * DataFormsJS WebComponentService Class
 *
 * This class can be used a base class when defining "service" Web Components.
 *
 * The term "service" is used here because the intended use is that components
 * created with this class do not render content but rather provide a service
 * that updates other elements on the page based on HTML attributes element
 * class names, etc. and that the service needs to run when content on the
 * page changes from SPA routes or JSON Services.
 *
 * This is a similar concept to the DataFormsJS Framework Plugins feature
 * allowing for custom functionality to be defined easily and with little
 * API code outside of standard DOM and JavaScript.
 *
 * Example Usage:
 *     // Import Class
 *     import { WebComponentService } from './WebComponentService.js';
 *
 *     // Create Custom Element extending this class.
 *     // The function `load()` is required while `endService()` is optional.
 *     window.customElements.define('my-service', class MyService extends WebComponentService {
 *         load(rootElement) {
 *             console.log(`Called ${this.constructor.name}.load(${(rootElement === document ? 'document' : rootElement.tagName.toLowerCase())})`);
 *         }
 *
 *         endService() {
 *             console.log(`Called ${this.constructor.name}.endService`);
 *         }
 *     });
 */

/* Validates with both [jshint] and [eslint] */
/* jshint esversion:8 */
/* eslint-env browser, es6 */

import { usingWebComponentsPolyfill, showErrorAlert } from './utils.js';

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style> :host { display:none; } </style>
    <slot></slot>
`;

export class WebComponentService extends HTMLElement {
    constructor() {
        super();
        if (usingWebComponentsPolyfill()) {
            return;
        }
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        this.runService = this.runService.bind(this);
    }

    connectedCallback() {
        if (this.load === undefined) {
            const name = (this.constructor.name === '' ? 'anonymous' : this.constructor.name);
            showErrorAlert(`Error - Unable to use service. Element <${this.tagName.toLowerCase()}> class [${name}] is missing function [load()].`);
            return;
        }
        document.addEventListener('app:routeChanged', this.runService); // <url-router>
        document.addEventListener('app:contentReady', this.runService); // <json-data>
        this.load(document);
    }

    disconnectedCallback() {
        document.removeEventListener('app:routeChanged', this.runService);
        document.removeEventListener('app:contentReady', this.runService);
        if (typeof this.endService === 'function') {
            this.endService();
        }
    }

    runService(e) {
        const rootElement = (e.target.tagName === 'URL-ROUTER' ? document : e.target);
        this.load(rootElement);
    }
}
