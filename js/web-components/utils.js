/**
 * DataFormsJS General Utility Functions for Web Components
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

// Module level variable that is set only once
let polyfillIsNeeded = null;

/**
 * Helper function to convert special characters to HTML entities.
 *
 * Characters escaped are:
 *   -  & = \&amp;
 *   -  " = \&quot;
 *   -  ' = \&#039;
 *   -  < = \&lt;
 *   -  \> = \&gt;
 *
 * This is equivalent to the PHP code:
 *     htmlspecialchars($text, ENT_QUOTES, 'UTF-8')
 *
 * @param {string|null|undefined|number} text
 * @return {string|null|undefined|number}
 */
export function escapeHtml(text) {
    if (text === undefined || text === null || typeof text === 'number') {
        return text;
    }
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Tagged Template Literal function that escapes values for HTML.
 * Use it without parentheses like this [render\`\`] and not [render(\`\`)].
 *
 * @param {array} strings
 * @param  {...any} values
 * @return {string}
 */
export function render(strings, ...values) {
    const html = [strings[0]];
    for (let n = 0, m = values.length; n < m; n++) {
        html.push(escapeHtml(values[n]));
        html.push(strings[n+1]);
    }
    return html.join('');
}

/**
 * Build and return a URL. For example "/order/:id" becomes "/order/123"
 * if {id:123} is sent in the [params] parameter.
 *
 * @param {string} url
 * @param {object} params
 * @return {string}
 */
export function buildUrl(url, params) {
    let newUrl = url;
    if (params !== null && typeof params === 'object') {
        for (const prop in params) {
            if (params.hasOwnProperty(prop)) {
                if (newUrl.indexOf(':' + prop) > -1) {
                    newUrl = newUrl.replace(new RegExp(':' + prop, 'g'), encodeURIComponent(params[prop]));
                }
            }
        }
    }
    return newUrl;
}

/**
 * Set an elements [textContent] or [value] depending on the element type.
 *
 * Rules:
 *   - input[type='checkbox'] - [checked=true] if value is [true, 1, 'yes', 'y']
 *   - input, select, textarea - [value] is set
 *   - Custom Elements that define [value] will have it set. For example usage see [data-table.js].
 *   - All other elements will have [textContent] set with the value
 *
 * @param {HTMLElement} element
 * @param {*} value
 */
export function setElementText(element, value) {
    // Element must be passed
    if (element === null || typeof element !== 'object' || !(element instanceof HTMLElement)) {
        console.warn('Called setElementText() with an invalid parameter');
        return;
    }

    // Set the value based on node type
    const nodeName = element.nodeName;
    switch (nodeName) {
        case 'INPUT':
            if (element.type === 'checkbox') {
                const lowerValue = String(value).toLowerCase();
                element.checked = (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'y');
            } else {
                element.value = String(value);
            }
            break;
        case 'SELECT':
        case 'TEXTAREA':
            element.value = String(value);
            break;
        default:
            if ((nodeName.includes('-') || element.getAttribute('is') !== null) && 'value' in element) {
                element.value = value;
            } else {
                element.textContent = String(value);
            }
    }
}

/**
 * Used to get an object value for data binding. Key is either a property from the
 * object or a path such as "object.property". If the root object starts with
 * "window" then the global [window] object is used. Example: "window.location.href".
 *
 * @param {object} data
 * @param {string} key
 * @return {*}
 */
export function getBindValue(data, key) {
    const keys = key.split('.');
    let value = (keys.length > 1 && keys[0] === 'window' ? window : data);
    for (let n = 0, m = keys.length; n < m; n++) {
        value = (typeof value === 'object' && value !== null ? value[keys[n]] : null);
    }
    return (value === undefined ? null : value);
}

/**
 * Bind an Attribute Template. This is used for [url-attr-param]
 * and [data-bind-attr] to set an attribute value based on a template
 * and data. Use "[]" characters to specify the bind key in the related
 * attribute. Example:
 *     <a href="#/regions/[place.country_code]" data-bind-attr="href">Regions</a>
 *
 * @param {HTMLElement} element
 * @param {string} attribute
 * @param {object} data
 */
export function bindAttrTmpl(element, attribute, data) {
    // Split comma-delimited attributes and trim the string values
    const attributes = element.getAttribute(attribute).split(',').map(s => s.trim());
    for (const attr of attributes) {
        // Save bind template to an attribute, example:
        // [data-bind-attr="href"] will save the inital value from [href]
        // to [data-bind-attr-href]. This allows it to be re-used.
        let value = element.getAttribute(attribute + '-' + attr);
        if (value === null) {
            value = element.getAttribute(attr);
            if (value !== null) {
                element.setAttribute(attribute + '-' + attr, value);
            }
        }
        // Parse the template
        if (value !== null) {
            let loopCount = 0; // For safety to prevent endless loops
            const maxLoop = 100;
            while (loopCount < maxLoop) {
                const posStart = value.indexOf('[');
                const posEnd = value.indexOf(']');
                if (posStart === -1 || posEnd === -1 || posEnd < posStart) {
                    break;
                }
                const key = value.substring(posStart + 1, posEnd);
                let boundValue = getBindValue(data, key);
                if (boundValue === undefined) {
                    boundValue = '';
                }
                value = value.substring(0, posStart) + boundValue + value.substring(posEnd + 1);
                loopCount++;
            }
            // Set the new attribute value
            element.setAttribute(attr, value);
        }
    }
}

/**
 * Show an error in an element. This will style the element
 * with a red background and white text.
 *
 * @param {HTMLElement} el
 * @param {string} message
 */
export function showError(el, message)
{
    el.style.padding = '1em';
    el.style.backgroundColor = 'red';
    el.style.color = 'white';
    el.style.fontSize = '1.5em';
    el.innerHTML = '';
    el.textContent = message;
    console.error(message);
}

/**
 * Show an error in an element. This will style the element
 * with a red background and white text. If called twice
 * the message will overwrite the previous message.
 * 
 * Unlike error alerts in the standard framework the user
 * does not have the ability to close these alerts.
 *
 * @param {string} message
 */
export function showErrorAlert(message) {
    const id = 'dataformsjs-fatal-error';
    let div = document.getElementById(id);
    if (div) {
        div.textContent = message;
    } else {
        div = document.createElement('div');
        div.id = id;
        div.style.color = '#fff';
        div.style.backgroundColor = '#f00';
        div.style.backgroundImage = 'linear-gradient(#e00, #c00)';
        div.style.boxShadow = '0 1px 5px 0 rgba(0,0,0,.5)';
        div.style.zIndex = '1000000';
        div.style.padding = '20px';
        div.style.fontSize = '1.5em';
        div.style.margin = '20px';
        div.style.position = 'fixed';
        div.style.top = '10px';
        div.textContent = message;
        document.body.appendChild(div);
    }
    console.error(message);
}

/**
 * Show a error alert with a message for older browsers.
 * 
 * This is intended for browsers that support <script type="module">
 * but do not support [window.customElements.define()]. This function 
 * gets called by individual web component.
 * 
 * This issue is known to affect Microsoft Edge Browsers using the 
 * EdgeHTML rendering engine.
 */
export function showOldBrowserWarning() {
    if (window.customElements === undefined || window.customElements.define === undefined) {
        const message = 'Thank you for visiting! However some features on this page require a newer Browser or OS than the one that you are currently using. If you have a different browser available then please open this page with it.';
        showErrorAlert(message);    
    }
}

/**
 * As of late 2019 Safari and Samsung Internet do not support extending
 * standard elements using custom elements with [is="custom-element"].
 * 
 * This function is used to call the polyfill setup code. Custom elements that
 * use the [is] attriubte should call need to define a object in [window._webComponentPolyfills]
 * in order to use this. See examples from [sortable-table.js] and [input-filter.js].
 */
export function polyfillCustomElements() {
    // Check if the polyfill is needed. Example result:
    //   Chrome: false
    //   Safari: true
    if (polyfillIsNeeded === null) {
        class WebComponentCheck extends HTMLDivElement {}
        if (window.customElements.get('web-component-polyfill-check') === undefined) {
            // Only define the custom element once, if a page attempts to load
            // both 'utils.min.js' and 'utils.js' versions then an error can show
            // in console if the element is not first checked.
            window.customElements.define('web-component-polyfill-check', WebComponentCheck, { extends: 'div' });
        }
        let docEl = document.querySelector('body');
        if (!docEl) {
            docEl = document.documentElement;
        }
        docEl.insertAdjacentHTML('beforeend', '<div is="web-component-polyfill-check"></div>');
        const div = document.querySelector('div[is="web-component-polyfill-check"]');
        polyfillIsNeeded = !(div instanceof WebComponentCheck);
        docEl.removeChild(div);
    }

    // Update all elements on screen that need the polyfill
    if (polyfillIsNeeded && Array.isArray(window._webComponentPolyfills)) {
        for (const polyfill of window._webComponentPolyfills) {
            const elements = document.querySelectorAll(`${polyfill.extends}[is="${polyfill.element}"]`);
            for (const element of elements) {
                try {
                    polyfill.setup(element);
                } catch (e) {
                    console.error(e);
                    console.log(polyfill.element);
                    console.log(element);
                }
            }
        }
    }
}

/**
 * Return a promise that can be used to check if custom web components are
 * defined. The promise will resolve once all document components are defined.
 * When components are first added to DOM they are not yet defined until
 * the browser finishes creating this classes, this happens very quickly
 * however if code that depends on the components runs before they are
 * setup then unexpected errors occur.
 * 
 * See also [componentsAreSetup()].
 * 
 * @param {HTMLElement} element 
 * @param {string} selector 
 * @return {Promise}
 */
export function componentsAreDefined(element, selector = '') {
    return new Promise(async (resolve) => {
        const undefinedComponents = element.querySelectorAll(selector + ':not(:defined)');
        if (undefinedComponents.length > 0) {
            const promises = [...undefinedComponents].map(
                c => window.customElements.whenDefined(c.getAttribute('is') || c.localName)
            );
            await Promise.all(promises);
        }
        resolve();
    });
}

/**
 * Return a promise that can be used to check if custom web components are setup and ready.
 * The promise will resolve once all web components are defined and no elements
 * have the [not-setup] attribute. The [not-setup] is intended for custom web components
 * that need additional setup after they have been added to the DOM.
 * 
 * See also [componentsAreDefined()].
 *
 * @return {Promise}
 */
export function componentsAreSetup() {
    return new Promise(async (resolve) => {
        // Wait until all web components on the page are defined.
        const undefinedComponents = document.querySelectorAll(':not(:defined)');
        if (undefinedComponents.length > 0) {
            const promises = [...undefinedComponents].map(
                c => window.customElements.whenDefined(c.getAttribute('is') || c.localName)
            );
            await Promise.all(promises);
        }

        // Check every 1/100th of a second for elements with the [not-setup]
        // attribute. For example usage of this, see web components [data-table.js]
        // which sets up [not-setup] and [input-filter.js] which calls this function.
        const interval = window.setInterval(() => {
            const notSetup = document.querySelectorAll('[not-setup]');
            if (notSetup.length === 0) {
                window.clearInterval(interval);
                resolve();
            }
        }, 10);
    });
}
