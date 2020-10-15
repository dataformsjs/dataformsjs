/**
 * DataFormsJS <nav is="spa-links"> Web Component
 *
 * By default this will set an [class="active"] on <a> links within the <nav>
 * for Single Page Apps (SPA) when the route changes from either
 * <url-hash-router> or <url-router> Web Components.
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

    get itemSelector() {
        const value = this.getAttribute('item-selector')
        return (value === null ? 'a' : value);
    }

    get activeClass() {
        const value = this.getAttribute('active-class');
        return (value === null ? 'active' : value);
    }

    updateLinks() {
        // Remove existing 'active' classes
        let elements = this.querySelectorAll(this.itemSelector + '.' + this.activeClass);
        for (const el of elements) {
            el.classList.remove(this.activeClass);
        }

        // Get URL path
        let path;
        if (document.querySelector('url-hash-router') !== null) {
            path = (window.location.hash === '' ? '#/' : window.location.hash);
        } else {
            path = window.location.pathname;
        }

        // Set active on matching links. If the `itemSelector` is looking for a element
        // other than <a>; for example 'nav li' then this code will find <a> elements under
        // it and set the 'active' class if the item from the selector is the parent node.
        elements = this.querySelectorAll(this.itemSelector);
        for (const el of elements) {
            const link = (el.nodeName === 'A' ? el : el.querySelector('a'));
            if (link && link.getAttribute('href') === path && (link === el || link.parentNode === el)) {
                el.classList.add(this.activeClass);
            }
        }
    }
}

window.customElements.define('spa-links', SpaLinks, { extends: 'nav' });
defineExtendsPolyfill('spa-links', 'nav', (el) => {
    SpaLinks.prototype.updateLinks.apply(el);
});
