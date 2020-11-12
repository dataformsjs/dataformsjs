/**
 * DataFormsJS <url-router> and <url-route> Web Components
 *
 * These components handle URL routing for Single Page Apps (SPA) without
 * having to use a large JavaScript framework.
 *
 * The default mode is URL #hash routing. To use HTML5 History Routing
 * (pushState/popstate) use the [mode] attribute:
 *     <url-router mode="history">
 *
 * @link     https://www.dataformsjs.com
 * @author   Conrad Sollitt (https://conradsollitt.com)
 * @license  MIT
 */

/* Validates with both [eslint] and [jshint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */
/* jshint esversion:8 */
/* jshint evil: true */

import {
    render,
    setElementText,
    bindAttrTmpl,
    polyfillCustomElements,
    showError,
    showErrorAlert,
    componentsAreDefined,
    usingWebComponentsPolyfill
} from './utils.js';

const appEvents = {
    routeChanged: 'app:routeChanged',
    error: 'app:error',
};

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>:host { display:none; }</style>
    <slot></slot>
`;

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
        this.currentUrlParams = null;
        this.updateView = this.updateView.bind(this);
        this.handlePushStateClick = this.handlePushStateClick.bind(this);
        this.useHistoryMode = (this.getAttribute('mode') === 'history');
        this.updateView();
    }

    connectedCallback() {
        const eventName = (this.useHistoryMode ? 'popstate': 'hashchange');
        window.addEventListener(eventName, this.updateView);
    }

    disconnectedCallback() {
        const eventName = (this.useHistoryMode ? 'popstate': 'hashchange');
        window.removeEventListener(eventName, this.updateView);
    }

    /**
     * Called when the element is added to the page and when the URL route changes.
     */
    async updateView() {
        // Wait until child route elements are defined otherwise
        // custom properties such as [path] will not be available.
        this.currentRoute = null;
        this.currentUrlParams = null;
        await componentsAreDefined(this, 'url-route');

        // Make sure that the view element exists
        const selector = this.getAttribute('view-selector');
        if (selector === null || selector === '') {
            this.showFatalError('Error, element <url-router> is missing attribute [view-selector]');
            return;
        }
        const view = document.querySelector(selector);
        if (view === null) {
            this.showFatalError(render`Error, element from <url-router view-selector="${selector}"> was not found on the page.`);
            return;
        }

        // Show loading Template if one is defined
        const loadingTemplateSelector = this.getAttribute('loading-template-selector');
        if (loadingTemplateSelector) {
            const loadingTemplate = document.querySelector(loadingTemplateSelector);
            if (loadingTemplate) {
                if (loadingTemplate.tagName === 'TEMPLATE') {
                    view.innerHTML = loadingTemplate.innerHTML;
                } else {
                    console.warn(`Unable to show loading screen from <url-router loading-template-selector="${loadingTemplateSelector}">. Only <template> tags are allowed.`);
                }
            } else {
                console.warn(`Unable to show loading screen from <url-router loading-template-selector="${loadingTemplateSelector}">. Element from selector is missing.`);
            }
        }

        // Get URL Path
        let path = (this.useHistoryMode ? window.location.pathname : window.location.hash.substr(1));
        if (path === '') {
            path = '/';
        }

        // Find the first matching route and set the view based on the route's template.
        const routes = this.querySelectorAll('url-route');
        let defaultRoute = null;
        for (const route of routes) {
            if (route.path === null) {
                this.showFatalError('Error, element <url-route> is missing attribute [path]');
                console.log(route);
                return;
            }
            const result = this.routeMatches(path, route.path);
            if (result.isMatch) {
                // Redirect Route?
                const redirect = route.redirect;
                if (redirect !== null && redirect !== path) {
                    if (this.useHistoryMode) {
                        window.history.pushState(null, null, route.redirect);
                        this.updateView();
                    } else {
                        window.location.hash = '#' + redirect;
                    }
                    return;
                }

                // Dynamically load scripts from [lazy-load]
                await this.lazyLoadScripts(route);

                // Show Route from <template>, for routes that use [src]
                // the HTML will be downloaded and set to <template> the
                // first time the route is accessed.
                const html = route.template;
                this.currentRoute = route;
                this.currentUrlParams = result.urlParams;
                if (html === null) {
                    this.downloadTemplate(view, route, result.urlParams);
                } else {
                    this.setView(view, html, result.urlParams);
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
                this.changeRoute(path);
                return;
            } else if (path === '/:lang/') {
                // Special case when using <i18n-service>
                await componentsAreDefined(document, 'i18n-service');
                const i18nService = document.querySelector('i18n-service');
                if (i18nService && typeof i18nService.getUserDefaultLang === 'function') {
                    const selectedLang = i18nService.getUserDefaultLang();
                    if (selectedLang !== null) {
                        this.changeRoute('/' + selectedLang + '/');
                        return;
                    }
                }
                showError(view, 'Missing Web Component [i18n-service.js]');
                return;
            }
        }

        // No matching and no default route
        const error = `Error - The route [${path}] does not have a matching <url-route> element and no default route is defined using [default-route].`;
        showError(view, error);
    }

    /**
     * Show an error in the router element and dispatch events.
     * This is used for fatal errors related to setup and will
     * overwrite all content within the <url-router>.
     *
     * @param {string} message
     */
    showFatalError(message) {
        this.style.display = 'block';
        this.style.padding = '1em';
        this.style.backgroundColor = 'red';
        this.style.color = 'white';
        this.style.fontSize = '1.5em';
        this.textContent = message;
        this.dispatchRouteChanged(null, message);
        console.error(message);
    }

    dispatchRouteChanged(urlParams, error) {
        // Dispatch Standard DOM Events. Because they bubble up it can be easily
        // handled from the document root:
        //     document.addEventListener('app:routeChanged', () => { ... });
        if (error !== undefined) {
            this.dispatchEvent(new CustomEvent(appEvents.error, { bubbles: true, detail: error }));
        }
        const hasRoute = (this.currentRoute !== null);
        const detail = { url: (hasRoute ? this.currentRoute.path : null), urlParams };
        this.dispatchEvent(new CustomEvent(appEvents.routeChanged, { bubbles: true, detail: detail }));

        // Execute JavaScript from [onload] attribute if one is defined
        if (!hasRoute) {
            return;
        }
        const js = this.currentRoute.getAttribute('onload');
        if (js) {
            try {
                const fn = new Function('return ' + js);
                const result = fn();
                if (typeof result === 'function') {
                    result();
                }
            } catch(e) {
                showErrorAlert(`Error from function <url-route path="${this.currentRoute.getAttribute('path')}" onload="${js}">: ${e.message}`);
                console.error(e);
            }
        }
    }

    /**
     * Download route templates from the [src] attribute.
     *
     * @param {HTMLElement} view
     * @param {UrlRoute} route
     * @param {object} urlParams
     */
    downloadTemplate(view, route, urlParams) {
        // Validate
        const url = route.src;
        if (url === null || url === '') {
            const error = `Missing <template> or [src] attribute for route <url-route path="${route.path}">.`;
            showError(view, error);
            this.dispatchRouteChanged(urlParams, error);
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
            this.setView(view, html, urlParams);
        })
        .catch(error => {
            const text = render`Error with <url-route path="${route.path}"> - Error Downloading Template: [${url}], Error: ${error}`;
            showError(view, text);
            this.dispatchEvent(new CustomEvent(appEvents.error, { bubbles: true, detail: text }));
        });
    }

    /**
     * Set the view HTML when the route changes
     *
     * @param {HTMLElement} view
     * @param {string} html
     * @param {object} urlParams
     */
    setView(view, html, urlParams) {
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

        // When using the HTML5 History API update links that start with <a href="/...">
        // and do not include the [data-no-pushstate] attribute to use [window.history.pushState].
        if (this.useHistoryMode) {
            const links = document.querySelectorAll('a[href^="/"]:not([data-no-pushstate])');
            for (const link of links) {
                link.addEventListener('click', this.handlePushStateClick);
            }
        }

        // Custom Event
        this.dispatchRouteChanged(urlParams);
    }

    /**
     * Change the route path. When using default hash routing, this does not
     * need to be used. Instead simply set [window.location.hash = '#...'].
     *
     * When using HTML5 History Routing this function calls [window.history.pushState]
     * with the [path] parameter and displays the new route.
     *
     * @param {string} path
     */
    changeRoute(path) {
        if (typeof path !== 'string') {
            throw new TypeError('Expected string for <url-router>.changeRoute(path)');
        }
        if (this.useHistoryMode) {
            window.history.pushState(null, null, path);
            this.updateView();
        } else {
            window.location.hash = (path.indexOf('#') === 0 ? path : '#' + path);
        }
    }

    /**
     * Handle HTML5 pushstate links. Be default links that match
     * <a href="/..."> are handled by the router on page updatees, however
     * if you are using the HTML5 History API for routing and setup custom
     * links on this page this function can be used for click events:
     *     const fn = document.querySelector('url-router').handlePushStateClick;
     *     link.addEventListener('click', fn);
     *
     * @param {Event} e
     */
    handlePushStateClick(e) {
        // Ignore if user is holding the [ctrl] key so that
        // the link can be opened in a new tab.
        if (e.ctrlKey === true) {
            return;
        }
        // Change route based on the link
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.href) {
            window.history.pushState(null, null, e.currentTarget.href);
            this.updateView();
        } else {
            showErrorAlert('Error, link click does not work because href is missing.');
        }
        return false;
    }

    /**
     * Check if a Route path is a match to a specified URL path.
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
     * @param {string} path The URL path to compare against
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
     * Load Scripts for a route that are defined in the route attribute [lazy-load].
     * The related scripts to load need to be defined in `window.lazyLoad`.
     *
     * @param {HTMLElement} route
     */
    async lazyLoadScripts(route) {
        // Items to load are comma delimited, for each item add a promise.
        const lazyLoad = route.getAttribute('lazy-load');
        const promises = [];
        if (lazyLoad) {
            const routeScripts = lazyLoad.split(',').map(s => { return s.trim(); });
            routeScripts.forEach((script) => {
                if (window.lazyLoad === undefined || window.lazyLoad[script] === undefined) {
                    showErrorAlert('Missing [window.lazyLoad] scripts for: ' + script);
                }
                promises.push(this.loadScripts(window.lazyLoad[script]));
            });
        }

        // Load all scripts
        await Promise.all(promises);
    }

    /**
     * Load an array of JS and CSS scripts and add them to the document header.
     * This function is used internally when using [window.lazyLoad] and [lazy-load]
     * to download needed scripts before a route is loaded. Scripts are
     * loaded in sequential order so when using this it's important for the files
     * to download quickly. The router attribute [loading-template-selector]
     * can be used to show a loading screen while scripts are being loaded.
     *
     * @param {string|array|object} urls Single URL's can use a string
     * @return {Promise}
     */
    loadScripts(urls) {
        // Load a CSS file and resolve promise once loaded or error
        function loadCss(url) {
            return new Promise(function(resolve) {
                // Check if file was already added
                const links = document.querySelectorAll('link');
                for (let n = 0, m = links.length; n < m; n++) {
                    if (links[n].rel === 'stylesheet' && links[n].getAttribute('href') === url) {
                        resolve();
                        return;
                    }
                }

                // Add file and wait till it loads
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.onload = resolve;
                link.onerror = () => {
                    showErrorAlert('Error loading CSS File: ' + url);
                    resolve();
                };
                link.href = url;
                document.head.appendChild(link);
            });
        }

        // Load a JS file
        function loadJs(url, isModule) {
            return new Promise(function(resolve) {
                // Check if file was already added
                const scripts = document.querySelectorAll('script');
                for (let n = 0, m = scripts.length; n < m; n++) {
                    if (scripts[n].getAttribute('src') === url) {
                        resolve();
                        return;
                    }
                }

                // Add file and wait till it loads
                const script = document.createElement('script');
                script.onload = resolve;
                script.onerror = () => {
                    showErrorAlert('Error loading JS File: ' + url);
                    resolve();
                };
                if (isModule) {
                    script.setAttribute('type', 'module');
                }
                script.src = url;
                document.head.appendChild(script);
            });
        }

        // Convert a single string to an array otherwise validate for array
        if (!Array.isArray(urls)) {
            if (typeof urls === 'string' ||
                (urls instanceof Object && ('module' in urls || 'nomodule' in urls))
            ) {
                urls = [urls];
            } else {
                showErrorAlert('Invalid Script for [loadScripts()] or [window.lazyLoad], expected string, an array of strings, or a valid object. Check console.');
                console.warn('window.loadScripts():');
                console.warn(urls);
                return new Promise(function(resolve) {
                    resolve();
                });
            }
        }

        // Return a promise that runs a promise for each URL in sequential order.
        return new Promise(function(resolve) {
            let current = 0;
            const count = urls.length;

            function nextPromise() {
                if (current === count) {
                    resolve();
                    return;
                }

                let url = urls[current];
                let isModule = false;
                if (url instanceof Object) {
                    if (url.module !== undefined) {
                        isModule = true;
                        url = url.module;
                    } else {
                        // `nomodule` scripts are only used by [polyfill.js]
                        resolve();
                        return;
                    }
                }
                current++;

                if (url.endsWith('.js')) {
                    loadJs(url, isModule).then(nextPromise);
                } else if (url.endsWith('.css')) {
                    loadCss(url).then(nextPromise);
                } else {
                    showErrorAlert('Invalid Script for [loadScripts()] or [window.lazyLoad]: ' + url);
                    nextPromise();
                }
            }

            nextPromise();
        });
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
