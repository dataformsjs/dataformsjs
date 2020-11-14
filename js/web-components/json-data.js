/**
 * DataFormsJS <json-data>, <is-loading>, <has-error> and <is-loaded> Web Components
 *
 * This component downloads data from a specified JSON Web Service and binds
 * the data to elements on the rendered template.
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
/* jshint evil:true */

import { Format } from './utils-format.js';
import {
    buildUrl,
    setElementText,
    getBindValue,
    bindAttrTmpl,
    componentsAreDefined,
    polyfillCustomElements,
    usingWebComponentsPolyfill,
    showErrorAlert,
    showError
} from './utils.js';

const format = new Format();

const appEvents = {
    contentReady: 'app:contentReady',
    error: 'app:error',
};

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>
        :host { display: block; }
        :host([hidden]) { display: none; }
    </style>
    <slot></slot>
`;

/**
 * Data Caching for when [load-only-once] is used
 *
 * Data is saved only once per URL path.
 *
 * Example Path:
 *     https://example.com/data/:list
 *
 * Page Views:
 *     https://example.com/data/records1 (Data Saved to Cache)
 *     https://example.com/data/records2 (Cache data is overwritten)
 *     https://example.com/docs
 *     https://example.com/data/records2 (Data read from Cache because last URL was matched)
 */
const dataCache = [];

function saveDataToCache(url, params, data) {
    for (const cache of dataCache) {
        if (cache.url === url) {
            cache.params = JSON.stringify(params);
            cache.data = data;
            return;
        }
    }
    dataCache.push({
        url: url,
        params: JSON.stringify(params),
        data: data,
    });
}

function getDataFromCache(url, params) {
    for (const cache of dataCache) {
        if (cache.url === url) {
            if (params === cache.params || (params === null && cache.params === 'null')) {
                return cache.data;
            }
            break;
        }
    }
    return null;
}

/**
 * Setup function that gets called to copy templates from [template-selector]
 * @param {HTMLElement} element
 */
function copyTemplateSelector(element) {
    const templateSelector = element.getAttribute('template-selector');
    if (templateSelector && element.childNodes.length === 0) {
        const template = document.querySelector(templateSelector);
        if (template) {
            element.appendChild(template.content.cloneNode(true));
        } else {
            showError(element, `Error - Could not find template from <${element.tagName.toLowerCase()} [template-selector="${templateSelector}"]>.`);
        }
    }
}

/**
 * Class for <json-data> Custom Element
 */
class JsonData extends HTMLElement {
    constructor() {
        super();
        if (usingWebComponentsPolyfill()) {
            return;
        }
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));

        this.state = {
            isLoading: false,
            hasError: false,
            isLoaded: false,
            errorMessage: null,
        };

        this.elements = {
            isLoading: this.querySelector('is-loading'),
            hasError: this.querySelector('has-error'),
            isLoaded: this.querySelector('is-loaded'),
            clickButton: null,
        };

        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    static get observedAttributes() {
        return ['url', 'url-params'];
    }

    attributeChangedCallback(attr, oldVal, /* newVal */) {
        if (this.state === undefined) {
            return; // if `usingWebComponentsPolyfill() === true`
        }
        switch (attr) {
            case 'url':
            case 'url-params':
                if (oldVal !== null) {
                    this.fetch();
                }
                break;
        }
    }

    connectedCallback() {
        // Handle the [click-selector] Attribute. If defined on the <json-data>
        // Control then data is not fetched until the user clicks the element specified
        // from the selector. This feature along with the form elements that use the
        // attribute [data-bind] allows for search pages and forms to be developed through HTML.
        if (this.clickSelector !== null) {
            this.elements.clickButton = document.querySelector(this.clickSelector);
            if (this.elements.clickButton === null) {
                const error = 'Element not found for <json-data> Web Component using [click-selector]: ' + String(this.clickSelector);
                showErrorAlert(error);
            } else {
                this.elements.clickButton.addEventListener('click', this.handleButtonClick);
            }
            return;
        }

        // Only fetch data automatically once when the element is attached to
        // the DOM. If [removeChild] and [appendChild] are used to move the
        // element on the page this prevents the web service from being called
        // multiple times.
        if (this.state !== undefined && !this.state.isLoading && !this.state.hasError && !this.state.isLoaded) {
            this.fetch();
        }
    }

    disconnectedCallback() {
        if (this.elements && this.elements.clickButton !== null) {
            this.elements.clickButton.removeEventListener('click', this.handleButtonClick);
            this.elements.clickButton = null;
        }
    }

    /**
     * Internal function used with [click-selector]
     */
    handleButtonClick() {
        // Disable button while data is being fetched
        if (typeof this.elements.clickButton.disabled === 'boolean') {
            this.elements.clickButton.disabled = true;
        }

        // Get all form elements that have the [data-bind="{name}"] attribute
        const elements = document.querySelectorAll('input[data-bind],select[data-bind],textarea[data-bind]');
        const params = {};
        for (const el of elements) {
            const name = el.getAttribute('data-bind');
            if (el.nodeName === 'INPUT' && el.type === 'checkbox') {
                params[name] = el.checked;
            } else {
                params[name] = el.value;
            }
        }

        // Set URL Params, this triggers `fetch`. First it must be defined
        // before having data populated otherwise it won't trigger the fetch.
        this.setAttribute('url-params', '');
        this.setAttribute('url-params', JSON.stringify(params));
    }

    get url() {
        return this.getAttribute('url');
    }

    get urlParams() {
        return this.getAttribute('url-params');
    }

    get loadOnlyOnce() {
        return (this.getAttribute('load-only-once') !== null);
    }

    get clickSelector() {
        return this.getAttribute('click-selector');
    }

    get isLoading() {
        return this.state.isLoading;
    }

    set isLoading(val) {
        this.state.isLoading = (val === true ? true : false);
        if (this.elements.isLoading) {
            this.elements.isLoading.style.display = (this.state.isLoading ? '' : 'none');
        }
    }

    get hasError() {
        return this.state.hasError;
    }

    set hasError(val) {
        this.state.hasError = (val === true ? true : false);
        if (this.elements.hasError) {
            this.elements.hasError.style.display = (this.state.hasError ? '' : 'none');
        }
    }

    get isLoaded() {
        return this.state.isLoaded;
    }

    set isLoaded(val) {
        this.state.isLoaded = (val === true ? true : false);
        if (this.elements.isLoaded) {
            this.elements.isLoaded.style.display = (this.state.isLoaded ? '' : 'none');
        }
    }

    dispatchContentReady() {
        // Dispatch Standard DOM Event. Because it bubbles up it can be easily
        // handled from the document root:
        //     document.addEventListener('app:contentReady', () => { ... });
        this.dispatchEvent(new Event(appEvents.contentReady, { bubbles: true }));

        // Execute JavaScript from [onready] attribute if one is defined
        const js = this.getAttribute('onready');
        if (js) {
            try {
                const fn = new Function('return ' + js);
                const result = fn();
                if (typeof result === 'function') {
                    result();
                }
            } catch(e) {
                showErrorAlert(`Error from function <json-data onready="${js}">: ${e.message}`);
                console.error(e);
            }
        }
    }

    async fetch() {
        const urlPath = this.url;
        let url = urlPath;
        if (url === null || url === '') {
            await this.showError('Error, element <json-data> is missing attribute [url]');
            this.dispatchContentReady();
            return;
        }

        // If [url-params] is defined by empty then wait for
        // it to be set before fetching data.
        let urlParams = this.getAttribute('url-params');
        if (urlParams === '' && url.includes(':')) {
            return;
        }

        // Load from Cache if [load-only-once] is defined and the
        // same content was previously viewed.
        if (this.loadOnlyOnce) {
            const data = getDataFromCache(urlPath, urlParams);
            if (data !== null) {
                await this._setLoadedState(data);
                this.dispatchContentReady();
                return;
            }
        }

        if (urlParams) {
            urlParams = JSON.parse(urlParams);
        }
        url = buildUrl(url, urlParams);

        this.isLoading = true;
        this.isLoaded = false;
        this.hasError = false;
        await this.bindData();

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
            return response.json();
        })
        .then(async (data) => {
            if (this.loadOnlyOnce) {
                saveDataToCache(urlPath, urlParams, data);
            }
            await this._setLoadedState(data);
        })
        .catch(async (error) => {
            await this.showError(error);
        })
        .finally(() => {
            if (this.elements.clickButton !== null && typeof this.elements.clickButton.disabled === 'boolean') {
                this.elements.clickButton.disabled = false;
            }
            this.dispatchContentReady();
        });
    }

    async showError(message) {
        this.isLoading = false;
        this.isLoaded = false;
        this.hasError = true;
        this.state.errorMessage = message;
        this.dispatchEvent(new CustomEvent(appEvents.error, { bubbles: true, detail: message }));
        await this.bindData();
        console.error(message);
    }

    async _setLoadedState(data) {
        this.isLoading = false;
        this.isLoaded = true;
        this.hasError = false;
        this.state.errorMessage = null;
        const transformData = this.getAttribute('transform-data');
        if (transformData) {
            try {
                if (typeof window[transformData] === 'function') {
                    const data2 = window[transformData](data);
                    if (typeof data2 === 'object' && data2 !== null) {
                        Object.assign(this.state, data2);
                    } else {
                        await this.showError(`Function [${transformData}()] must return an object.`);
                    }
                } else {
                    await this.showError(`Function [${transformData}()] was not found.`);
                }
            } catch (e) {
                await this.showError(e);
            }
        } else {
            Object.assign(this.state, data);
        }
        if (typeof data.hasError === 'boolean') {
            this.hasError = data.hasError;
        }
        await this.bindData();
    }

    async bindData() {
        // Wait until child web components are defined otherwise
        // custom properties such as [value] will not be available.
        await componentsAreDefined(this, '[data-bind]');

        // Update all elements with the attribute [data-bind]
        // - If only [data-bind] is defined then pass the entire state
        // - Otherwise pass the field value from the key
        let elements = this.querySelectorAll('[data-bind]');
        for (const element of elements) {
            const key = element.getAttribute('data-bind');
            let value = (key === '' ? this.state : getBindValue(this.state, key));
            const dataType = element.getAttribute('data-format');
            if (dataType !== null) {
                if (typeof format[dataType] === 'function') {
                    value = format[dataType](value);
                } else if (typeof window[dataType] === 'function') {
                    try {
                        value = window[dataType](value);
                    } catch (e) {
                        console.error(e);
                        value = 'Error: ' + e.message;
                    }
                } else {
                    value = 'Error: Unknown format [' + dataType + ']';
                }
            }
            setElementText(element, value);
        }

        // Update all elements with the [data-bind-attr] attribute.
        // This will typically be used to replace <a href> and other
        // attributes with values from the downloaded data.
        elements = this.querySelectorAll('[data-bind-attr]');
        for (const element of elements) {
            bindAttrTmpl(element, 'data-bind-attr', this.state);
        }

        // Show or hide elements based on [data-show="js-expression"].
        // Elements here will have the toggled `style.display` for viewing
        // or to hide based on the result of the expression. This is similar
        // behavior to Vue [v-show].
        elements = this.querySelectorAll('[data-show]');
        for (const element of elements) {
            if (this.state.isLoading) {
                // [data-show] elements will be hidden during loading
                element.style.display = 'none';
            } else {
                const expression = element.getAttribute('data-show');
                try {
                    const tmpl = new Function('state', 'format', 'with(state){return ' + expression + '}');
                    const result = tmpl(this.state, format);
                    element.style.display = (result === true ? '' : 'none');
                } catch (e) {
                    element.style.display = '';
                    console.error(`Error evaluating JavaScript expression from [data-show="${expression}"] attribute.`);
                    console.error(e);
                }
            }
        }

        // Call functions on elements that define the [data-bind-refresh] attribute.
        // This allows for elements to be updated as needed from HTML. This will most
        // commonly be used with [click-selector] and other Web Components. For example
        // the places demo search screen does this with <input is="input-filter">.
        elements = this.querySelectorAll('[data-bind-refresh]');
        for (const element of elements) {
            const fnName = element.getAttribute('data-bind-refresh');
            try {
                element[fnName]();
            } catch (e) {
                console.error(`Error calling function from element with [data-bind-refresh="${fnName}"].`);
                console.error(e);
                console.log(element);
            }
        }

        // For Safari, Samsung Internet, and Edge
        polyfillCustomElements();
    }
}

/**
 * Define Custom Elements
 */
window.customElements.define('json-data', JsonData);

/**
 * Class for <is-loading> Custom Element
 */
window.customElements.define('is-loading', class IsLoading extends HTMLElement {
    constructor() {
        super();
        if (usingWebComponentsPolyfill()) {
            return;
        }
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        if (!(this.parentNode.nodeName === 'JSON-DATA' && this.parentNode.isLoading === true)) {
            this.style.display = 'none';
        }
        copyTemplateSelector(this);
    }
});

/**
 * Class for <has-error> Custom Element
 */
window.customElements.define('has-error', class HasError extends HTMLElement {
    constructor() {
        super();
        if (usingWebComponentsPolyfill()) {
            return;
        }
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        if (!(this.parentNode.nodeName === 'JSON-DATA' && this.parentNode.hasError === true)) {
            this.style.display = 'none';
        }
        copyTemplateSelector(this);
    }
});

/**
 * Class for <is-loaded> Custom Element
 */
window.customElements.define('is-loaded', class IsLoaded extends HTMLElement {
    constructor() {
        super();
        if (usingWebComponentsPolyfill()) {
            return;
        }
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        if (!(this.parentNode.nodeName === 'JSON-DATA' && this.parentNode.isLoaded === true)) {
            this.style.display = 'none';
        }
        copyTemplateSelector(this);
    }
});
