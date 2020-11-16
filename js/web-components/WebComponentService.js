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
 *     // Create Custom Element extending this class
 *     window.customElements.define('my-service', class MyService extends WebComponentService {
 *         // The only function required is `onLoad()`
 *         // Code should run quickly and be able to handle multiple calls because it can be called
 *         // multiple times on a page loaded depending what is used <url-router>, <json-data>, <html-import-service>, etc.
 *         onLoad(element) {
 *             console.log(`Called ${this.constructor.name}.onLoad(${(element === document ? 'document' : element.tagName.toLowerCase())})`);
 *             console.log('Current URL Path: ' + document.querySelector('url-router').currentRoute.path);
 *         }
 *
 *         // `onEnd()` is optional, however for typical usage `onEnd()` will never be called
 *         // by the app is it would only get called on `disconnectedCallback()` and services
 *         // that are defined at the root page level are only loaded once.
 *         onEnd() {
 *             console.log(`Called ${this.constructor.name}.onEnd`);
 *         }
 *     });
 */

/* Validates with both [jshint] and [eslint] */
/* jshint esversion:8 */
/* eslint-env browser, es6 */

import { showErrorAlert } from './utils.js';

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
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        this.runService = this.runService.bind(this);
    }

    connectedCallback() {
        if (this.onLoad === undefined) {
            const name = (this.constructor.name === '' ? 'anonymous' : this.constructor.name);
            showErrorAlert(`Error - Unable to use service. Element <${this.tagName.toLowerCase()}> class [${name}] is missing function [onLoad()].`);
            return;
        }
        document.addEventListener('app:routeChanged', this.runService); // <url-router>
        document.addEventListener('app:contentReady', this.runService); // <json-data>
        this.onLoad(document);
    }

    disconnectedCallback() {
        document.removeEventListener('app:routeChanged', this.runService);
        document.removeEventListener('app:contentReady', this.runService);
        if (typeof this.onEnd === 'function') {
            this.onEnd();
        }
    }

    runService(e) {
        const element = (e.target.tagName === 'URL-ROUTER' && e.target.currentRoute !== null ? e.target.currentRoute : e.target);
        this.onLoad(element);
    }
}
