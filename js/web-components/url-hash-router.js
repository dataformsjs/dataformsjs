/**
 * DataFormsJS <url-hash-router> and <url-hash-route> Web Components
 *
 * This component handles URL hash routing and can be used to create
 * Single Page Applications (SPA) without having to use a large
 * JavaScript framework.
 *
 * @link     https://www.dataformsjs.com
 * @author   Conrad Sollitt (http://www.conradsollitt.com)
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
    render,
    setElementText,
    bindAttrTmpl,
    showError,
    componentsAreDefined,
    polyfillCustomElements,
    showOldBrowserWarning
} from './utils.js';

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>:host { display:none; }</style>
    <slot></slot>
`;

/**
 * Private function to download route templates from the [src] attribute.
 * 
 * @param {UrlHashRouter} router
 * @param {HTMLElement} view
 * @param {UrlHashRoute} route 
 * @param {object} urlParams
 */
function downloadTemplate(router, view, route, urlParams) {
    // Validate
    const url = route.src;
    if (url === null || url === '') {
        showError(view, `Missing <template> or [src] attribute for route [${route.path}].`);
        router.dispatchEvent(new Event('contentLoaded'));
        return;
    }

    // Download HTML Template from [src]
    fetch(url, {
        mode: 'cors',
        cache: 'no-store',
        credentials: 'same-origin',
    })
    .then(response => {
        const status = response.status;
        if ((status >= 200 && status < 300) || status === 304) {
            return Promise.resolve(response);
        } else {
            const error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
            return Promise.reject(error);
        }
    })
    .then(response => {
        return response.text();
    })
    .then(html => {
        route.template = html;
        setView(router, view, html, urlParams);
    })
    .catch(error => {
        showError(view, error);
        router.dispatchEvent(new Event('contentLoaded'));
    });
}

/**
 * Private function called when the route changes
 * 
 * @param {UrlHashRouter} router
 * @param {HTMLElement} view
 * @param {string} html 
 * @param {object} urlParams
 */
function setView(router, view, html, urlParams) {
    // Set view html
    view.innerHTML = html;

    // Update all elements with [url-params] attribute with a JSON object
    let elements = view.querySelectorAll('[url-params]');
    const jsonUrlParams = JSON.stringify(urlParams);
    for (const element of elements) {
        element.setAttribute('url-params', jsonUrlParams);
    }

    // Update value/textContent for all elements with [url-param] attribute
    elements = view.querySelectorAll('[url-param]');
    for (const element of elements) {
        const field = element.getAttribute('url-param'); 
        const value = (urlParams[field] === undefined ? '' : urlParams[field]);
        setElementText(element, value);
    }

    // Update all elements with the [url-attr-param] attribute. 
    // This will typically be used to replace <a href> and other
    // attributes with values from the URL.
    elements = view.querySelectorAll('[url-attr-param]');
    for (const element of elements) {
        bindAttrTmpl(element, 'url-attr-param', urlParams);
    }

    // For Safari, Samsung Internet, and Edge
    polyfillCustomElements();

    // Custom Event
    router.dispatchEvent(new Event('contentLoaded'));
}

/**
 * Class for <url-hash-router> Custom Element
 */
class UrlHashRouter extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        this._currentRoute = null;
        this.updateView = this.updateView.bind(this);
        this.updateView();
    }

    connectedCallback() {
        window.addEventListener('hashchange', this.updateView);
    }

    disconnectedCallback() {
        window.removeEventListener('hashchange', this.updateView);
    }

    get currentRoute() {
        return this._currentRoute;
    }

    /**
     * Called when the element is added to the page
     * and when the URL #hash changes.
     */
    async updateView() {
        // Wait until child route elements are defined otherwise
        // custom properties such as [path] will not be available.
        await componentsAreDefined(this, 'url-hash-route');

        // Reset
        this._currentRoute = null;

        // Make sure that the view element exists
        const selector = this.getAttribute('view-selector');
        if (selector === null || selector === '') {
            this.showFatalError('Error, element <url-hash-router> is missing attribute [view-selector]');
            return;
        }
        const view = document.querySelector(selector);
        if (view === null) {
            this.showFatalError(render`Error, element from <url-hash-router view-selector="${selector}"> was not found on the page.`);
            return;
        }

		// Get Hash (and remove the hash '#' character)
        let hash = window.location.hash;
        if (hash.indexOf('#') === 0) {
			hash = hash.substr(1);
        }
        if (hash === '') {
            hash = '/';
        }

        // Find the first matching route and set the view based on the route's template.
        const routes = this.querySelectorAll('url-hash-route');
        let defaultRoute = null;
        for (const route of routes) {
            if (route.path === null) {
                this.showFatalError('Error, element <url-hash-route> is missing attribute [path]');
                console.log(route);
                return;
            }
            const result = this.routeMatches(hash, route.path);
            if (result.isMatch) {
                // Redirect Route?
                const redirect = route.redirect;
                if (redirect !== null) {
                    window.location.hash = '#' + redirect;
                    return;
                }
                // Show Route from <template>, for routes that use [src]
                // the HTML will be downloaded and set to <template> the
                // first time the route is accessed.
                const html = route.template;
                this._currentRoute = route;
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
                window.location.hash = '#' + defaultRoute.path;
                return;
            }
        }

        // No matching and no default route
        const error = `Error - The route [${hash}] does not have a matching <url-hash-route> element and no default route is defined using [default-route].`;
        showError(view, error);
    }

    /**
     * Check if a Route path is a match to a specified URL hash.
     * 
     * Examples:
     *     routeMatches('/page1', '/page2')
     *         returns { isMatch:false }
     * 
     *     routeMatches('/orders/edit/123', '/:record/:view/:id')
     *         returns {
     *             isMatch: true,
     *             urlParams: { record:'orders', view:'edit', id:'123' }
     *         }
     * 
     * @param {string} path The URL hash to compare against
     * @param {string} routePath The route, dynamic values are prefixed with ':'
     * @return {object}
     */
    routeMatches(path, routePath) {
        const pathParts = path.split('/');
        const routeParts = routePath.split('/');
        const m = pathParts.length;
        const urlParams = {};

        // Quick check if path and route parts are equal
        if (m !== routeParts.length) {
            return { isMatch: false };
        } else {
            // Compare each route part
            for (let n = 0; n < m; n++) {
                // Get the path value (e.g.: 'order/edit/123' = [ 'order', 'edit', '123' ])
                const value = decodeURIComponent(pathParts[n]);

                // Compare to the route path
                if (value !== routeParts[n]) {
                    // If different then does the route path begin with ':'?
                    // If so it is a parameter and if not the route does not match.
                    if (routeParts[n].substr(0, 1) === ':') {
                        urlParams[routeParts[n].substr(1)] = value;
                    } else {
                        return { isMatch: false };
                    }
                }
            }
        }

        // If code reaches then route matches
        return { isMatch: true, urlParams: urlParams };
    }

    /**
     * Show an error in the element. This is used for fatal errors related to setup.
     * @param {string} message 
     */
    showFatalError(message) {
        this.style.display = 'block';
        this.style.padding = '1em';
        this.style.backgroundColor = 'red';
        this.style.color = 'white';
        this.style.fontSize = '1.5em';
        this.textContent = message;
        this.dispatchEvent(new Event('error'));
        this.dispatchEvent(new Event('contentLoaded'));
        console.error(message);
    }
}

/**
 * Class for <url-hash-route> Custom Element
 */
class UrlHashRoute extends HTMLElement {
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
showOldBrowserWarning();
window.customElements.define('url-hash-router', UrlHashRouter);
window.customElements.define('url-hash-route', UrlHashRoute);
