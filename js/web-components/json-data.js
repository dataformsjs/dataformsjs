/**
 * DataFormsJS <json-data>, <is-loading>, <has-error> and <is-loaded> Web Components
 *
 * This component downloads data from a specified JSON Web Service and binds
 * the data to elements on the rendered template.
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
    buildUrl,
    setElementText,
    getBindValue,
    bindAttrTmpl,
    componentsAreDefined,
    polyfillCustomElements,
    showOldBrowserWarning
} from './utils.js';

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>:host { display:block; }</style>
    <slot></slot>
`;

/**
 * Data Caching for when [load-only-once="true"] is used
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
 * Class for <json-data> Custom Element
 */
class JsonData extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));

        this.state = {
            isLoading: false,
            hasError: false,
            isLoaded: false,
            contentReady: false,
            errorMessage: null,
        };

        this.elements = {
            isLoading: this.querySelector('is-loading'),
            hasError: this.querySelector('has-error'),
            isLoaded: this.querySelector('is-loaded'),
        };
    }

    static get observedAttributes() {
        return ['url', 'url-params'];
    }

    attributeChangedCallback(attr, oldVal, /* newVal */) {
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
        // Only fetch data automatically once when the element is attached to
        // the DOM. If [removeChild] and [appendChild] are used to move the
        // element on the page this prevents the web service from being called
        // multiple times.
        if (!this.state.isLoading && !this.state.hasError && !this.state.isLoaded) {
            this.fetch();
        }
    }

    get url() {
        return this.getAttribute('url');
    }

    get urlParams() {
        return this.getAttribute('url-params');
    }

    get loadOnlyOnce() {
        const value = this.getAttribute('load-only-once');
        return (value === 'true');
    }

    get isLoading() {
        return this.state.isLoading;
    }

    set isLoading(val) {
        this.state.isLoading = (val === true ? true : false);
        if (this.elements.isLoading) {
            this.elements.isLoading.style.display = (this.state.isLoading ? '' : 'none');
        }
        if (val === true) {
            this.dispatchEvent(new Event('isLoading'));
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
        if (val === true) {
            this.dispatchEvent(new Event('hasError'));
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
        if (val === true) {
            this.dispatchEvent(new Event('isLoaded'));
        }
    }

    get contentReady() {
        return this.state.contentReady;
    }

    fetch() {
        const urlPath = this.url;
        let url = urlPath;
        if (url === null || url === '') {
            this.showError('Error, element <json-data> is missing attribute [url]');
            this.state.contentReady = true;
            this.dispatchEvent(new Event('contentReady'));
            return;
        }

        // If [url-params] is defined by empty then wait for
        // it to be set before fetching data.
        let urlParams = this.getAttribute('url-params');
        if (urlParams === '' && url.includes(':')) {
            return;
        }

        // Load from Cache if [load-only-once="true"] and the
        // same content was previously viewed.
        if (this.loadOnlyOnce) {
            const data = getDataFromCache(urlPath, urlParams);
            if (data !== null) {
                this._setLoadedState(data);
                this.state.contentReady = true;
                this.dispatchEvent(new Event('contentReady'));
                return;
            }
        }

        if (urlParams) {
            urlParams = JSON.parse(urlParams);
            url = buildUrl(url, urlParams);
        }

        this.isLoading = true;
        this.isLoaded = false;
        this.hasError = false;
        this.state.contentReady = false;
        this.bindData();

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
        .then(data => {
            if (this.loadOnlyOnce) {
                saveDataToCache(urlPath, urlParams, data);
            }
            this._setLoadedState(data);
        })
        .catch(error => {
            this.showError(error);
        })
        .finally(() => {
            this.state.contentReady = true;
            this.dispatchEvent(new Event('contentReady'));
        });
    }

    showError(message) {
        this.isLoading = false;
        this.isLoaded = false;
        this.hasError = true;
        this.state.errorMessage = message;
        this.bindData();
        console.error(message);
    }

    _setLoadedState(data) {
        this.isLoading = false;
        this.isLoaded = true;
        this.hasError = false;
        this.state.errorMessage = null;
        Object.assign(this.state, data);
        if (typeof data.hasError === 'boolean') {
            this.hasError = data.hasError;
        }
        this.bindData();
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
            const value = (key === '' ? this.state : getBindValue(this.state, key));
            setElementText(element, value);
        }

        // Update all elements with the [data-bind-attr] attribute.
        // This will typically be used to replace <a href> and other
        // attributes with values from the downloaded data.
        elements = this.querySelectorAll('[data-bind-attr]');
        for (const element of elements) {
            bindAttrTmpl(element, 'data-bind-attr', this.state);
        }

        // For Safari, Samsung Internet, and Edge
        polyfillCustomElements();
    }
}

/**
 * Define Custom Elements
 */
showOldBrowserWarning();
window.customElements.define('json-data', JsonData);

/**
 * Class for <is-loading> Custom Element
 */
window.customElements.define('is-loading', class extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        if (!(this.parentNode.nodeName === 'JSON-DATA' && this.parentNode.isLoading === true)) {
            this.style.display = 'none';
        }
    }
});

/**
 * Class for <has-error> Custom Element
 */
window.customElements.define('has-error', class extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        if (!(this.parentNode.nodeName === 'JSON-DATA' && this.parentNode.hasError === true)) {
            this.style.display = 'none';
        }
    }
});

/**
 * Class for <is-loaded> Custom Element
 */
window.customElements.define('is-loaded', class extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        if (!(this.parentNode.nodeName === 'JSON-DATA' && this.parentNode.isLoaded === true)) {
            this.style.display = 'none';
        }
    }
});
