/**
 * DataFormsJS <nav is="spa-links"> Web Component
 *
 * By default this will set an [class="active"] on <a> links within the <nav>
 * for Single Page Apps (SPA) when the route changes from <url-router>.
 *
 * Options can be changed by setting attributes [item-selector] and [active-class].
 *
 * Example:
 *     <nav is="spa-links" item-selector="li" active-class="selected">
 *
 * Default:
 *     <nav is="spa-links" item-selector="a" active-class="active">
 *
 * This Web Component is small so it's easy to copy and modify if you
 * have a site with similar but different nav link needs.
 *
 * This code is based on the standard framework [js/plugins/navLinks.js].
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8, evil:true */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import { defineExtendsPolyfill } from './utils.js';

class SpaLinks extends HTMLElement {
    constructor() {
        super();
        this.updateLinks = this.updateLinks.bind(this);
    }

    connectedCallback() {
        document.addEventListener('app:routeChanged', this.updateLinks);
        this.updateLinks();
    }

    disconnectedCallback() {
        document.removeEventListener('app:routeChanged', this.updateLinks);
    }

    static get observedAttributes() {
        return ['item-selector', 'active-class'];
    }

    attributeChangedCallback(attr, /* oldVal, newVal */) {
        if (SpaLinks.observedAttributes.includes(attr)) {
            this.updateLinks();
        }
    }

    updateLinks() {
        // Get settings from HTML Attributes
        let itemSelector = this.getAttribute('item-selector');
        itemSelector = (itemSelector === null ? 'a' : itemSelector);

        let activeClass = this.getAttribute('active-class');
        activeClass = (activeClass === null ? 'active' : activeClass);

        // Remove existing 'active' classes
        let elements = this.querySelectorAll(itemSelector + '.' + activeClass);
        for (const el of elements) {
            el.classList.remove(activeClass);
        }

        // Get URL path
        const router = document.querySelector('url-router');
        let path;
        if (router !== null && router.getAttribute('mode') !== 'history') {
            path = (window.location.hash === '' ? '#/' : window.location.hash);
        } else {
            path = window.location.pathname;
        }

        // Set active on matching links. If the `itemSelector` is looking for a element
        // other than <a>; for example 'nav li' then this code will find <a> elements under
        // it and set the 'active' class if the item from the selector is the parent node.
        elements = this.querySelectorAll(itemSelector);
        for (const el of elements) {
            const link = (el.nodeName === 'A' ? el : el.querySelector('a'));
            if (link && link.getAttribute('href') === path && (link === el || link.parentNode === el)) {
                el.classList.add(activeClass);
            }
        }
    }
}

window.customElements.define('spa-links', SpaLinks, { extends: 'nav' });
defineExtendsPolyfill('spa-links', 'nav', (el) => {
    SpaLinks.prototype.updateLinks.apply(el);
});
