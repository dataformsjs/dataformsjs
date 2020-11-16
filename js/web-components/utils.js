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
 * Default Error Styles used when calling `showError()` or `showErrorAlert()`.
 *
 * These can be overridden by using [!important] CSS rules or by including
 * the style sheet by ID on the page before Web Components load.
 */
const errorStyleId = 'dataformsjs-style-errors';
const errorCss = `
    .dataformsjs-error,
    .dataformsjs-fatal-error {
        color:#fff;
        background-color:red;
        box-shadow:0 1px 5px 0 rgba(0,0,0,.5);
        background-image:linear-gradient(#e00,#c00);
        text-align: left;
    }

    .dataformsjs-error{
        padding:10px;
        font-size:1em;
        margin:5px;
        display:inline-block;
    }

    .dataformsjs-fatal-error {
        z-index:1000000;
        padding:20px;
        font-size:1.5em;
        margin:20px;
        position:fixed;
        top:10px;
    }

    @media only screen and (min-width:1000px){
        .dataformsjs-fatal-error {
            max-width:1000px;
            left:calc(50% - 520px);
        }
    }

    .dataformsjs-fatal-error span {
        padding:5px 10px;
        float:right;
        border:1px solid darkred;
        cursor:pointer;
        margin-left:10px;
        box-shadow:0 0 2px 1px rgba(0,0,0,0.3);
        background-image:linear-gradient(#c00,#a00);
        border-radius:5px;
    }
`;

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
 * Global variables from the `window` object can be included when using
 * brackets. Example: "{rootApiUrl}/countries" will look for `window.rootApiUrl`.
 *
 * @param {string} url
 * @param {object} params
 * @return {string}
 */
export function buildUrl(url, params) {
    let newUrl = String(url);

    // Replace "{variables}" from the global Window Scope.
    newUrl = newUrl.replace(/\{(\w+)\}/g, function(match, offset) {
        if (typeof window[offset] === 'string') {
            return window[offset];
        }
        return match;
    });

    // Replace ":variables" from the params object
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
 * @param {HTMLElement|SVGElement} element
 * @param {*} value
 */
export function setElementText(element, value) {
    // Element must be passed
    if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
        console.warn('Called setElementText() with an invalid parameter');
        return;
    }

    // Set the value based on node type
    const nodeName = element.nodeName.toLowerCase();
    switch (nodeName) {
        case 'INPUT':
            if (element.type === 'checkbox') {
                const lowerValue = String(value).toLowerCase();
                element.checked = (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'y');
            } else {
                element.value = (value === null ? '' : String(value));
            }
            break;
        case 'SELECT':
        case 'TEXTAREA':
            element.value = (value === null ? '' : String(value));
            break;
        default:            
            if (nodeName.includes('-') || element.hasAttribute('is')) {
                if ('value' in element) {
                    // <data-list>, <data-table>, <data-view>, etc
                    element.value = value;
                } else {
                    // If the custom element is defined but doesn't include `value`
                    // then simply set `textContent` otherwise assume show an error
                    // on the element as it's likely missing from the page. This error
                    // can be viewed on an example that uses <json-data> with a <data-table>
                    // element; simply comment out the <data-table> script.
                    const isCustomElement = nodeName.includes('-');
                    const name = (isCustomElement ? nodeName : element.getAttribute('is'));
                    const isDefined = (window.customElements.get(name) !== undefined);
                    if (isDefined) {
                        element.textContent = (value === null ? '' : String(value));
                    } else {
                        const elText = (isCustomElement ? `<${name}>` : `<${nodeName} is="${name}">`);
                        showError(element, `Error - Web Component ${elText} is not defined; the related JavaScript file might be missing from this page.`);
                    }
                }
            } else {
                element.textContent = (value === null ? '' : String(value));
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
        // [data-bind-attr="href"] will save the initial value from [href]
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
 * @param {HTMLElement} element
 * @param {string} message
 */
export function showError(element, message)
{
    if (element === null) {
        showErrorAlert(message);
        return;
    }
    loadCss(errorStyleId, errorCss);
    const span = document.createElement('span');
    span.className = 'dataformsjs-error';
    span.textContent = message;
    element.innerHTML = '';
    element.appendChild(span);
    if (typeof message !== 'string') {
        console.error(message);
    }
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
    loadCss(errorStyleId, errorCss);
    let errorText = message;
    if (typeof errorText === 'string' && errorText.toLowerCase().indexOf('error') === -1) {
        errorText = 'Error: ' + errorText;
    }
    const div = document.createElement('div');
    div.className = 'dataformsjs-fatal-error';
    div.textContent = errorText;
    const closeButton = document.createElement('span');
    closeButton.textContent = '✕';
    closeButton.onclick = (e) => {
        document.body.removeChild(e.target.parentNode);
    };
    div.insertBefore(closeButton, div.firstChild);
    document.body.appendChild(div);
    if (typeof message !== 'string') {
        console.error(message);
    }
}

/**
 * Append CSS to a Style Sheet in the Document if it does not yet exist.
 *
 * @param {string} id
 * @param {string} css
 */
export function loadCss(id, css) {
    let style = document.getElementById(id);
    if (style === null) {
        style = document.createElement('style');
        style.id = id;
        style.innerHTML = css;
        document.head.appendChild(style);
    }
}

/**
 * As of late 2020 Safari and various mobile browsers do not support extending
 * standard elements using custom elements with [is="custom-element"].
 *
 * This function is used to call the polyfill setup code. Custom elements that
 * use the [is] attribute should call need to define a object in [window._webComponentPolyfills]
 * in order to use this. See examples from [sortable-table.js] and [input-filter.js].
 * 
 * https://caniuse.com/custom-elementsv1
 * 
 * @param {undefined|HTMLElement} rootElement
 */
export function polyfillCustomElements(rootElement = document) {
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
            const elements = rootElement.querySelectorAll(`${polyfill.extendsElement}[is="${polyfill.element}"]`);
            for (const element of elements) {
                try {
                    polyfill.setup(element);
                } catch (e) {
                    showErrorAlert(e);
                    console.log(polyfill.element);
                    console.log(element);
                }
            }
        }
    }
}

/**
 * For Safari, Samsung Internet, and Legacy Edge.
 * See comments in `polyfillCustomElements()`.
 *
 * @param {string} element
 * @param {string} extendsElement
 * @param {function} setup
 */
export function defineExtendsPolyfill(element, extendsElement, setup) {
    window._webComponentPolyfills = window._webComponentPolyfills || [];
    window._webComponentPolyfills.push({ element, extendsElement, setup });
    document.addEventListener('DOMContentLoaded', runPolyfill);
}

/**
 * Internal function that gets called from `defineExtendsPolyfill()`. Because this
 * is a named function it gets called only once if added to 'DOMContentLoaded'
 * multiple times. In SPA sites that use <url-router> or pages that use <json-data>
 * the needed function `polyfillCustomElements()` will get called, however if components
 * such as <input is="input-filter"> are loaded on a plan page with no routing or data
 * component they would never otherwise. This functions runs for those cases.
 */
function runPolyfill() {
    polyfillCustomElements(document);
}

/**
 * Return a promise that can be used to check if custom web components are
 * defined. The promise will resolve once all document components are defined,
 * or if components are missing from the page it will timeout after 1 second.
 * When components are first added to DOM they are not yet defined until
 * the browser finishes creating this classes, this happens very quickly
 * often in less than 10 milliseconds and the check is important because
 * if code that depends on the components runs before they are setup than
 * unexpected errors can occur on the page.
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
            const timeout = new Promise((resolve) => {
                window.setTimeout(() => {
                    resolve();
                }, 1000);
            });
            await Promise.race([Promise.all(promises), timeout]);
        }
        resolve();
    });
}

/**
 * Return `true` if an element is attached to the DOM. This function
 * can be used with long running scenarios as a safety check before
 * running code in a SPA route with the element changes before setup
 * code runs. For example usage see <input is="input-filter">
 *
 * @param {HTMLElement} element
 */
export function isAttachedToDom(element) {
    let node = element.parentNode;
    while (node !== null) {
        node = node.parentNode;
        if (node === document) {
            return true;
        }
    }
    return false;
}
