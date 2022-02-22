/**
 * DataFormsJS <i18n-service> Web Component for Internationalization (I18N)
 *
 * This Web Component provides an easy to use API for sites and apps that need to
 * support multiple languages. I18n Data comes from JSON files on the server.
 * A overall file (defaults to '_.{lang}.json') needs to exist for each language
 * and page JSON files '{name}.{lang}.json' can exist for each <url-route>
 *
 * [i18n] is spelled "Internationalisation" in British English. [i18n] is an
 * acronym/numeronym that represents ("i" + 18 characters + "n"). The difference is
 * US English uses "z" while British English uses an "s" in the spelling of the word.
 *
 * Basic Usage:
 *     <i18n-service file="_" file-dir="i18n" default-locale="en" locales="en,pt-BR,zh-CN"></i18n-service>
 *     <url-route data-i18n-file="{name}">
 *
 * Elements on the page with the following HTML Attributes will
 * be updated by this Component:
 *     data-i18n
 *     data-i18n-attr
 *     data-i18n-href
 *     data-i18n-replace-text
 *     data-i18n-nav-lang
 *     data-i18n-nav-selected
 *
 * The following global API will be available as well and can be
 * used with templating or by app custom logic.
 *     window.i18n_Locale = 'en|fr|es|zh-CN'; // Selected language, updated on each page change
 *     window.i18nText(key) // Returns I18n content for the current page
 *
 * For detailed usage see the DataFormsJS Examples.
 */

/* Validates with both [eslint] and [jshint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */
/* jshint esversion:8 */
/* jshint evil: true */

import { WebComponentService } from './WebComponentService.js';
import { showErrorAlert, setElementText } from './utils.js';

class I18nService extends WebComponentService {
    /**
     * Get defaults from HTML Attributes when the element is first created.
     */
    constructor() {
        super();

        function get(el, attr, defaultValue = null) {
            const value = el.getAttribute(attr);
            return (value ? value : defaultValue);
        }

        // Get Defaults
        this.fileName = get(this, 'file', '_');
        this.fileDir = get(this, 'file-dir', 'i18n');
        this.defaultLocale = get(this, 'default-locale');
        this.supportedLocales = get(this, 'locales', '').split(',').map(s => { return s.trim(); });
        this.currentLocale = null;
        this.langText = {};
        this.langCache = {};
        this._isRunning = false;

        // Define API
        window.i18nText = this.getText.bind(this);

        // Determine Routing Type - Hash Routing or HTML5 History
        const router = document.querySelector('url-router');
        this.hashRouting = (router === null || router.getAttribute('mode') !== 'history');
    }

    /**
     * Return a selected language for the user based on supported locales
     * and the browsers available languages from user settings.
     *
     * This may be called from <url-router> during initial page loads.
     *
     * @returns {string|null}
     */
    getUserDefaultLang() {
        // First check if any of the supported languages match a user's language.
        // These are the languages sent with the Request 'Accept-Language' header.
        if (navigator.languages && navigator.languages.length &&
            this.supportedLocales && this.supportedLocales.length
        ) {
            for (let n = 0, m = navigator.languages.length; n < m; n++) {
                if (this.supportedLocales.indexOf(navigator.languages[n]) !== -1) {
                    return navigator.languages[n];
                }
            }
        }
        // No language matched, use default for the site if defined
        return this.defaultLocale;
    }

    /**
     * Validate that the required settings [defaultLocale] and [supportedLocales]
     * are filled in.
     *
     * @returns {bool} Returns `true` if settings are valid.
     */
    validateSettings() {
        if (this.defaultLocale === null) {
            console.warn('Using <i18n-service> without [default-locale] being filled in.');
            return false;
        } else if (this.supportedLocales.length === 0) {
            console.warn('Using <i18n-service> without [locales] being filled in.');
            return false;
        }
        return true;
    }

    /**
     * Update HTML Elements on the page whenever the document is first loaded,
     * the route changes, or JSON Data downloads.
     */
    onLoad() {
        // Exit if still running from the last load. This service always
        // updates all elements at the root document level but can be called
        // multiple times per page load from <url-router>, <json-data>, etc.
        if (this._isRunning) {
            return;
        }
        this._isRunning = true;

        // Get Settings
        const isValid = this.validateSettings();
        const router = document.querySelector('url-router');
        this.currentLocale = null;

        // Get lang from URL '/:lang/path1/path2/etc'
        if (this.hashRouting) {
            if (isValid && window.location.hash.indexOf('#/') === 0) {
                this.currentLocale = window.location.hash.split('/')[1];
            }
        } else {
            if (isValid && window.location.pathname.split('/').length > 1) {
                this.currentLocale = window.location.pathname.split('/')[1];
            }
        }
        if (this.currentLocale !== null) {
            if (this.currentLocale === '' || this.supportedLocales.indexOf(this.currentLocale) === -1) {
                this.currentLocale = null;
            }
        }

        // Update the global variable with the selected locale so it can
        // be used with templating or easily by custom JavaScript code.
        window.i18n_Locale = this.currentLocale;

        // If language is not matched then redirect back to the default route
        // if one is found. If no route matches then ignore to avoid an endless
        // loop of hash changes.
        if (this.currentLocale === null) {
            this._isRunning = false;
            if (router && router.querySelector('url-route[path="/:lang/"]')) {
                if (this.hashRouting) {
                    window.location = '#/' + this.defaultLocale + '/';
                } else {
                    router.changeRoute('/' + this.defaultLocale + '/');
                }
            }
            return;
        }

        // Update the <html lang="lang"> attribute with the selected locale
        document.documentElement.lang = this.currentLocale;

        // Main Language file shared with all pages
        const url = this.fileDir + '/' + this.fileName + '.' + this.currentLocale + '.json';
        const promises = [this.downloadFile(url)];

        // Optionally download file from route defined HTML attribute [data-i18n-file]
        const routeFileName = (router && router.currentRoute ? router.currentRoute.getAttribute('data-i18n-file') : null);
        let routeUrl = null;
        if (routeFileName) {
            routeUrl = this.fileDir + '/' + routeFileName + '.' + this.currentLocale + '.json';
            promises.push(this.downloadFile(routeUrl));
        }

        // Load language files from cached for download
        Promise.all(promises).finally(() => {
            if (routeUrl) {
                this.langText = Object.assign({}, this.langCache[url], this.langCache[routeUrl]);
            } else {
                this.langText = this.langCache[url];
            }
            this.updateContent(document);
            this.dispatchEvent(new CustomEvent('app:i18nLoaded', { bubbles: true }));
            this._isRunning = false;
        });
    }

    /**
     * Helper function that can be called to get i18n text
     *
     * @param {string} key
     * @return {string}
     */
    getText(key) {
        return (this.langText && this.langText[key] ? this.langText[key] : key);
    }

    /**
     * Internal function that downloads the language file.
     *
     * @param {string} url
     * @return {Promise}
     */
    downloadFile(url) {
        // Load Language from Cached Data
        if (this.langCache[url] !== undefined) {
            return new Promise(resolve => { resolve(); });
        }

        // Download and Cache Language the first time it is used
        return fetch(url, {
            cache: 'no-store',
            credentials: 'same-origin',
        })
        .then(response => {
            const status = response.status;
            if ((status >= 200 && status < 300) || status === 304) {
                return Promise.resolve(response);
            } else {
                const error = `Error loading data. Server Response Code: ${status}, Response Text: ${response.statusText}`;
                return Promise.reject(error);
            }
        })
        .then(response  => { return response.json(); })
        .then(data => {
            this.langCache[url] = data;
        })
        .catch(error => {
            showErrorAlert(`Error Downloading I18N file: [${url}], Response Code Status: ${error.message}`);
            this.langCache[url] = {};
        });
    }

    updateContent(rootElement) {
        // Set text content of all elements that have the [data-i18n] attribute
        let elements = rootElement.querySelectorAll('[data-i18n]');
        for (const element of elements) {
            const field = element.getAttribute('data-i18n');
            const value = (this.langText[field] === undefined ? '' : this.langText[field]);
            setElementText(element, value);
        }

        // Update attribute content of all elements that have [data-i18n-attr]
        elements = rootElement.querySelectorAll('[data-i18n-attr]');
        for (const element of elements) {
            const data = element.getAttribute('data-i18n-attr').split(',').map(function(s) { return s.trim(); });
            for (let x = 0, y = data.length; x < y; x++) {
                const attr = data[x];
                let key = element.getAttribute(attr);
                let value;
                if (key === null) {
                    // Skip attribute not found
                    console.warn(element, 'Missing Attribute [' + attr + '] for element');
                    continue;
                }
                // Exact match on key
                value = this.langText[key];
                if (value !== undefined) {
                    element.setAttribute(attr, value);
                    continue;
                }
                // Find and replace keys in "[[key]]", example:
                //     data-export-file-name="[[Report]].csv"
                let match;
                const regex = /\[\[.*\]\]/g;
                while ((match = regex.exec(key)) !== null) {
                    value = match[0].substring(2, match[0].length - 2);
                    if (this.langText[value] === undefined) {
                        // Key not found so skip attribute
                        continue;
                    }
                    let find = match[0].replace(/\[/g, '\\[');
                    find = new RegExp(find, 'g');
                    key = key.replace(find, this.langText[value]);
                }
                element.setAttribute(attr, key);
            }
        }

        // Update links that have the attribute [data-i18n-href]. This allows links
        // to be setup with valid HTML such as (<a href="#/en/">) and then updated
        // by the plugin as the user changes the language.
        elements = rootElement.querySelectorAll('a[data-i18n-href]');
        for (const element of elements) {
            const data = element.getAttribute('href').split('/');
            const href = element.getAttribute('href');
            const isI18nHref = (this.hashRouting ? href.indexOf('#/') === 0 : href.indexOf('/') === 0);
            if (isI18nHref && data.length > 1) {
                data[1] = this.currentLocale;
                element.href = data.join('/');
            }
        }

        // Update links that have the attribute [data-i18n-locales] and replace
        // [href] text that contains '{locale}' with the current or default locale.
        elements = rootElement.querySelectorAll('a[data-i18n-locales]');
        for (const element of elements) {
            const locales = element.getAttribute('data-i18n-locales').split(',').map(s => { return s.trim(); });
            let locale = this.currentLocale;
            if (locales.indexOf(locale) === -1) {
                if (locales.indexOf(this.defaultLocale) !== -1) {
                    locale = this.defaultLocale;
                } else {
                    locale = locales[0];
                }
            }
            const re = new RegExp('\\[locale]', 'g');
            element.href = element.href.replace(re, locale);
        }

        // Replace html content of all elements that have [data-i18n-replace-text].
        // This searches for all text in the format of "[[i18n {key}]]" and replaces
        // it with the key. This feature is helpful for specific pages but is likely
        // to not be used by most pages on a site.
        elements = rootElement.querySelectorAll('[data-i18n-replace-text]');
        for (const element of elements) {
            let html = element.innerHTML;
            for (const key in this.langText) {
                if (this.langText.hasOwnProperty(key)) {
                    let search = '[[i18n ' + key + ']]';
                    if (html.indexOf(search) !== -1) {
                        search = '\\[\\[i18n ' + key + ']]';
                        const re = new RegExp(search, 'g');
                        const value = (this.langText[key] ? this.langText[key] : key);
                        html = html.replace(re, value);
                    }
                }
            }
            element.innerHTML = html;
        }

        // Update all Nav Links on the document (not just the root element)
        // that have [data-i18n-nav-lang] so they point the current page
        // using the language from the link.
        elements = rootElement.querySelectorAll('[data-i18n-nav-lang]');
        if (elements.length > 0) {
            const handlePushStateClick = (this.hashRouting ? null : document.querySelector('url-router').handlePushStateClick);
            for (const element of elements) {
                const navLang = element.getAttribute('data-i18n-nav-lang');
                if (this.hashRouting) {
                    element.href = window.location.hash.replace('#/' + this.currentLocale + '/', '#/' + navLang + '/');
                } else {
                    element.href = window.location.pathname.replace('/' + this.currentLocale + '/', '/' + navLang + '/');
                    element.addEventListener('click', handlePushStateClick);
                }
            }
        }

        // Update text for selected Lang on document Nav elements
        elements = rootElement.querySelectorAll('[data-i18n-nav-selected]');
        for (const element of elements) {
            element.textContent = this.currentLocale;
        }

        // Is there a <nav is="spa-links"> Web Component to update?
        elements = rootElement.querySelectorAll('nav[is="spa-links"]');
        for (const spaLinks of elements) {
            if (typeof spaLinks.updateLinks === 'function') {
                spaLinks.updateLinks();
            }
        }
    }
}

/**
 * Add <i18n-service> element to the page
 */
window.customElements.define('i18n-service', I18nService);
