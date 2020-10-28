/**
 * DataFormsJS <url-router> and <url-route> Web Components
 *
 * These component handles URL routing with the HTML5 History API and can be
 * used to create Single Page Applications (SPA) without having to use a large
 * JavaScript framework.
 *
 * For URL #Hash Routing see 'js/web-components/url-hash-router.js'.
 *
 * @link     https://www.dataformsjs.com
 * @author   Conrad Sollitt (https://conradsollitt.com)
 * @license  MIT
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import {
    showError,
    componentsAreDefined,
    usingWebComponentsPolyfill
} from './utils.js';

import {
    shadowTmpl,
    setupRouting,
    downloadTemplate,
    setView,
    routeMatches,
    showFatalError,
    lazyLoadScripts
} from './utils-router.js';

/**
 * Class for <url-router> Custom Element
 */
class UrlRouter extends HTMLElement {
    constructor() {
        super();
        if (usingWebComponentsPolyfill()) {
            return;
        }
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        this.currentRoute = null;
        this.updateView = this.updateView.bind(this);
        this.updateView();
    }

    connectedCallback() {
        window.addEventListener('popstate', this.updateView);
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.updateView);
    }

    /**
     * Called when the element is added to the page
     * and when the URL #hash changes.
     */
    async updateView() {
        // Wait until child route elements are defined otherwise
        // custom properties such as [path] will not be available.
        await componentsAreDefined(this, 'url-route');

        // Setup Routing
        this.currentRoute = null;
        const view = setupRouting(this);

        // Get URL Path
        let path = window.location.pathname;
        if (path === '') {
            path = '/';
        }

        // Find the first matching route and set the view based on the route's template.
        const routes = this.querySelectorAll('url-route');
        let defaultRoute = null;
        for (const route of routes) {
            if (route.path === null) {
                showFatalError(this, 'Error, element <url-route> is missing attribute [path]');
                console.log(route);
                return;
            }
            const result = routeMatches(path, route.path);
            if (result.isMatch) {
                // Redirect Route?
                const redirect = route.redirect;
                if (redirect !== null && redirect !== window.location.pathname) {
                    window.history.pushState(null, null, route.redirect);
                    this.updateView();
                    return;
                }

                // Dynamically load scripts from [lazy-load]
                await lazyLoadScripts(route);

                // Show Route from <template>, for routes that use [src]
                // the HTML will be downloaded and set to <template> the
                // first time the route is accessed.
                const html = route.template;
                this.currentRoute = route;
                if (html === null) {
                    downloadTemplate(this, view, route, result.urlParams);
                } else {
                    setView(this, view, html, result.urlParams);
                }
                // Stop checking routes because one was matched
                return;
            } else if (route.isDefault) {
                defaultRoute = route;
            }
        }

        // No matching route, use a default route if one exists
        if (defaultRoute) {
            const path = defaultRoute.path;
            if (path !== '' && path.indexOf(':') === -1) {
                window.history.pushState(null, null, path);
                this.updateView();
                return;
            }
        }

        // No matching and no default route
        const error = `Error - The route [${path}] does not have a matching <url-route> element and no default route is defined using [default-route].`;
        showError(view, error);
    }
}

/**
 * Class for <url-route> Custom Element
 */
class UrlRoute extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
    }

    get path() {
        return this.getAttribute('path');
    }

    get src() {
        return this.getAttribute('src');
    }

    get redirect() {
        return this.getAttribute('redirect');
    }

    get isDefault() {
        return (this.getAttribute('default-route') !== null);
    }

    get template() {
        const tmpl = this.querySelector('template');
        return (tmpl === null ? null : tmpl.innerHTML);
    }

    set template(val) {
        let tmpl = this.querySelector('template');
        if (tmpl === null) {
            tmpl = document.createElement('template');
            this.appendChild(tmpl);
        }
        tmpl.innerHTML = val;
    }
}

/**
 * Define Custom Elements
 */
window.customElements.define('url-router', UrlRouter);
window.customElements.define('url-route', UrlRoute);
