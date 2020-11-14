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
/* jshint esversion:8 */
/* jshint strict: true */

import { WebComponentService } from '/js/web-components/WebComponentService.js';

window.customElements.define('prism-service', class PrismService extends WebComponentService {
    onLoad(rootElement) {
        if (window.Prism === undefined) {
            console.warn('window.Prism is not loaded');
            return;
        }

        // Use `document` for routing changes and services
        const nodeName = rootElement.nodeName;
        if (nodeName === 'URL-ROUTE' || nodeName.includes('-SERVICE')) {
            rootElement = document;
        }

        // The `onLoad` event for WebComponentService can get called many times
        // on a single page load depending <json-data>, <html-import-service>, etc.
        // If that happens it can cause a long delay if prism re-runs on already
        // highlighted code. To avoid that all elements are checked on the page
        // and only those that have not yet been highlighed are processed.
        // The selector comes directly from `Prism.highlightAllUnder()`
        const selector = 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code';
        const elements = rootElement.querySelectorAll(selector);
        for (const element of elements) {
            if (element.querySelector('.token') === null) {
                Prism.highlightElement(element);
            }
        }
    }
});
