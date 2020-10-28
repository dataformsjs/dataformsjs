/**
 * DataFormsJS Utility functions used with the SPA (Single Page App) Routers:
 *     <url-hash-router> and <url-router>
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */
/* eslint no-async-promise-executor: "off" */
/* eslint no-prototype-builtins: "off" */

import {
    render,
    setElementText,
    bindAttrTmpl,
    showError,
    polyfillCustomElements,
    showErrorAlert
} from './utils.js';

const appEvents = {
    routeChanged: 'app:routeChanged',
    error: 'app:error',
};

function dispatchRouteChanged(router, urlParams, error) {
    // Dispatch Standard DOM Events. Because they bubble up it can be easily
    // handled from the document root:
    //     document.addEventListener('app:routeChanged', () => { ... });
    if (error !== undefined) {
        router.dispatchEvent(new CustomEvent(appEvents.error, { bubbles: true, detail: error }));
    }
    const hasRoute = (router.currentRoute !== null);
    const detail = { url: (hasRoute ? router.currentRoute.path : null), urlParams };
    router.dispatchEvent(new CustomEvent(appEvents.routeChanged, { bubbles: true, detail: detail }));

    // Execute JavaScript from [onload] attribute if one is defined
    if (!hasRoute) {
        return;
    }
    const js = router.currentRoute.getAttribute('onload');
    if (js) {
        try {
            const fn = new Function('return ' + js);
            const result = fn();
            if (typeof result === 'function') {
                result();
            }
        } catch(e) {
            showErrorAlert(`Error from function <${router.tagName.toLowerCase()} onload="${js}">: ${e.message}`);
            console.error(e);
        }
    }
}

/**
 * Shadow DOM for Custom Elements
 */
export const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>:host { display:none; }</style>
    <slot></slot>
`;

/**
 * Used by the routers when the route changes
 * 
 * @param {UrlRouter|UrlHashRouter} router
 * @returns {HTMLElement}
 */
export function setupRouting(router) {
    // Make sure that the view element exists
    const selector = router.getAttribute('view-selector');
    if (selector === null || selector === '') {
        showFatalError(router, `Error, element <${router.tagName.toLowerCase()}> is missing attribute [view-selector]`);
        return;
    }
    const view = document.querySelector(selector);
    if (view === null) {
        showFatalError(router, render`Error, element from <${router.tagName.toLowerCase()} view-selector="${selector}"> was not found on the page.`);
        return;
    }

    // Show loading Template if one is defined
    const loadingTemplateSelector = router.getAttribute('loading-template-selector');
    if (loadingTemplateSelector) {
        const loadingTemplate = document.querySelector(loadingTemplateSelector);
        if (loadingTemplate) {
            if (loadingTemplate.tagName === 'TEMPLATE') {
                view.innerHTML = loadingTemplate.innerHTML;
            } else {
                console.warn(`Unable to show loading screen from <${router.tagName.toLowerCase()} loading-template-selector="${loadingTemplateSelector}">. Only <template> tags are allowed.`);
            }
        }
    }

    // Return HTMLElement where content goes
    return view;
}

/**
 * Private function to download route templates from the [src] attribute.
 *
 * @param {UrlRouter|UrlHashRouter} router
 * @param {HTMLElement} view
 * @param {UrlRoute|UrlHashRoute} route
 * @param {object} urlParams
 */
export function downloadTemplate(router, view, route, urlParams) {
    // Validate
    const url = route.src;
    if (url === null || url === '') {
        const error = `Missing <template> or [src] attribute for route <${route.tagName.toLowerCase()} path="${route.path}">.`;
        showError(view, error);
        dispatchRouteChanged(router, urlParams, error);
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
        const text = render`Error with <${route.tagName.toLowerCase()} path="${route.path}"> - Error Downloading Template: [${url}], Error: ${error}`;
        showError(view, text);
        router.dispatchEvent(new CustomEvent(appEvents.error, { bubbles: true, detail: text }));
    });
}

/**
 * Private function called when the route changes
 *
 * @param {UrlRouter|UrlHashRouter} router
 * @param {HTMLElement} view
 * @param {string} html
 * @param {object} urlParams
 */
export function setView(router, view, html, urlParams) {
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
    if (router.tagName.toLowerCase() === 'url-router') {
        const links = document.querySelectorAll('a[href^="/"]:not([data-no-pushstate])');
        for (const link of links) {
            link.addEventListener('click', (e) => {
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
                    router.updateView();
                } else {
                    showErrorAlert('Error, link click does not work because href is missing.');
                }
                return false;
            });
        }
    }

    // Custom Event
    dispatchRouteChanged(router, urlParams);
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
export function routeMatches(path, routePath) {
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
 * Show an error in the element and dispatch events. This is used for fatal errors related to setup.
 * 
 * @param {UrlRouter|UrlHashRouter} router
 * @param {string} message
 */
export function showFatalError(router, message) {
    router.style.display = 'block';
    router.style.padding = '1em';
    router.style.backgroundColor = 'red';
    router.style.color = 'white';
    router.style.fontSize = '1.5em';
    router.textContent = message;
    dispatchRouteChanged(router, null, message);
    console.error(message);
}

/**
 * Load Scripts for a route that are defined in the route attribute [lazy-load].
 * The related scripts to load need to be defined in `window.lazyLoad`.
 *
 * @param {HTMLElement} route
 */
export async function lazyLoadScripts(route) {
    // Items to load are comma delimited, for each item add a promise.
    const lazyLoad = route.getAttribute('lazy-load');
    const promises = [];
    if (lazyLoad) {
        const routeScripts = lazyLoad.split(',').map(s => { return s.trim(); });
        routeScripts.forEach(function(script) {
            if (window.lazyLoad === undefined || window.lazyLoad[script] === undefined) {
                showErrorAlert('Missing [window.lazyLoad] scripts for: ' + script);
            }
            promises.push(loadScripts(window.lazyLoad[script]));
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
export function loadScripts(urls) {
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
