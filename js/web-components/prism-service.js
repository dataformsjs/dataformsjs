/**
 * DataFormsJS <prism-service> Web Component
 *
 * This service will setup all prism elements on the page when content changes
 * from routing, json services, etc. This does not download prism but rather
 * requires it to be included on the existing page.
 *
 * @link https://prismjs.com
 */

/* Validates with both [eslint] and [jshint] */
/* global Prism */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* jshint strict: true */

import { WebComponentService } from '/js/web-components/WebComponentService.js';

window.customElements.define('prism-service', class PrismService extends WebComponentService {
    onLoad(rootElement) {
        if (window.Prism !== undefined) {
            const nodeName = rootElement.nodeName;
            if (rootElement === document || nodeName === 'URL-ROUTE' || nodeName.includes('-SERVICE')) {
                Prism.highlightAll();
            } else {
                Prism.highlightAllUnder(rootElement);
            }
        }
    }
});
