/**
 * DataFormsJS <i18n-service> Web Component
 *
 * TODO - new - code copied and modified from other files - in early development
 * 
 * This is based on:
 *     dataformsjs\js\plugins\i18n.js
 * 
 * All features from the Framework Plugin need to be included here and testing
 * on all language demos is needed. Likely the main site needs to be re-created
 * with a Web Component version as well in order to confirm this.
 * 
 * All Commented Code blocks need to be handled and additional code from
 * i18n likely needs to be copied. This must be developed in a manner
 * so the [polyfill.js] can use it with the Standard Framework.
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
        
        // TODO - more defaults from: dataformsjs\js\plugins\i18n.js
        this.fileName = get(this, 'file', '_');
        this.fileDir = get(this, 'file-dir', 'i18n');
        this.defaultLocale = get(this, 'default-locale');
        this.supportedLocales = get(this, 'locales', '').split(',').map(s => { return s.trim()});
        this.currentLocale = null;
        this.langText = {};
        this.langCache = {};
        this._isRunning = false;
    }

    /**
     * Update HTML Elements on the page whenever the document is first loaded,
     * the route changes, or JSON Data downloads.
     *  
     * @param {HTMLElement} rootElement 
     */
    refresh(rootElement) {
        // console.log(`Called ${this.constructor.name}.refresh(${(rootElement === document ? 'document' : rootElement.tagName.toLowerCase())})`);
        // console.log(`this._isRunning: ${this._isRunning}`);

        // Exit if still running from the last refresh        
        if (this._isRunning) {
            return;
        }
        this._isRunning = true;

        // Get Settings
        // var isValid = this.validateSettings();
        this.currentLocale = null;

        // Get lang from URL '/:lang/path1/path2/etc'
        const router = document.querySelector('url-router');
        const hashRouting = (router === null || router.useHistoryMode !== true);
        if (hashRouting) {
            if (window.location.hash.indexOf('#/') === 0) {
                this.currentLocale = window.location.hash.split('/')[1];
            } else if (window.location.pathname.split('/').length > 1) {
                this.currentLocale = window.location.pathname.split('/')[1];
            }
        }
        // if (hashRouting) {
        //     if (isValid && window.location.hash.indexOf('#/') === 0) {
        //         this.currentLocale = window.location.hash.split('/')[1];
        //     }
        // } else {
        //     if (isValid && window.location.pathname.split('/').length > 1) {
        //         this.currentLocale = window.location.pathname.split('/')[1];
        //     }
        // }
        // if (this.currentLocale !== null) {
        //     if (this.currentLocale === '' || this.supportedLocales.indexOf(this.currentLocale) === -1) {
        //         this.currentLocale = null;
        //     }
        // }

        // If language is not matched then redirect back to the default route
        // if one is found. If no route matches then ignore to avoid an endless
        // loop of hash changes.
        //
        // if (this.currentLocale === null) {
        //     next(false);
        //     if (window.app && window.app.controller && window.app.controller('/:lang/') !== null) {
        //         if (hashRouting) {
        //             window.location = '#/' + this.defaultLocale + '/';
        //         } else {
        //             app.changeRoute('/' + this.defaultLocale + '/');
        //         }
        //     }
        //     return;
        // }

        // Update the Active Model with the selected locale. This value can be used
        // when creating links with Handlebars or other templating engines.
        //
        // if (window.app && typeof window.app.activeModel === 'object') {
        //     window.app.activeModel.i18n_Locale = this.currentLocale;
        // }

        // Update the <html lang="lang"> attribute with the selected locale
        document.documentElement.lang = this.currentLocale;

        // Main Language file shared with all pages
        const url = this.fileDir + '/' + this.fileName + '.' + this.currentLocale + '.json';
        const promises = [this.downloadFile(url)];

        // Optionally download file from route define attribute [data-i18n-file / settings.i18nFile]
        // var routeFileName = null;
        let routeUrl = null;
        // if (app.activeController && app.activeController.settings && app.activeController.settings.i18nFile) {
        //     routeFileName = app.activeController.settings.i18nFile;
        //     routeUrl = this.fileDir + '/' + routeFileName + '.' + this.currentLocale + '.json';
        //     promises.push(this.downloadFile(routeUrl));
        // }

        // Load language files from cached for download
        Promise.all(promises).finally(() => {
            if (routeUrl) {
                // this.langText = app.deepClone({}, this.langCache[url], this.langCache[routeUrl]);
                this.langText = Object.assign({}, this.langCache[url], this.langCache[routeUrl]);
            } else {
                this.langText = this.langCache[url];
            }
            this.updateElements(rootElement);
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

    updateElements(rootElement) {
        // var elements,
        //     element,
        //     key,
        //     value,
        //     html,
        //     search,
        //     n,
        //     m,
        //     re,
        //     locales,
        //     locale,
        //     data,
        //     x,
        //     y,
        //     attr,
        //     navLang,
        //     hashRouting = (app.routingMode === undefined || app.routingMode()  === 'hash'),
        //     href,
        //     isI18nHref;

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
                const key = element.getAttribute(attr);
                if (key !== null) {
                    element.setAttribute(attr, (this.langText[key] ? this.langText[key] : key));
                }
            }
        }

        // Update links that have the attribute [data-i18n-href]. This allows links
        // to be setup with valid HTML such as (<a href="#/en/">) and then updated
        // by the plugin as the user changes the language.
        elements = rootElement.querySelectorAll('a[data-i18n-href]');
        for (const element of elements) {
            const data = element.getAttribute('href').split('/');
            // const href = element.getAttribute('href');
            // isI18nHref = (hashRouting ? href.indexOf('#/') === 0 : href.indexOf('/') === 0); 
            // if (isI18nHref && data.length > 1) {
            if (data.length > 1) {
                data[1] = this.currentLocale;
                element.href = data.join('/');
            }
        }

        // Update links that have the attribute [data-i18n-locales] and replace
        // [href] text that contains '{locale}' with the current or default locale.
        //
        // elements = rootElement.querySelectorAll('a[data-i18n-locales]');
        // for (n = 0, m = elements.length; n < m; n++) {
        //     element = elements[n];
        //     locales = element.getAttribute('data-i18n-locales').split(',').map(function(s) { return s.trim(); });
        //     locale = this.currentLocale;
        //     if (locales.indexOf(locale) === -1) {
        //         if (locales.indexOf(this.defaultLocale) !== -1) {
        //             locale = this.defaultLocale;
        //         } else {
        //             locale = locales[0];
        //         }
        //     }
        //     re = new RegExp('\\[locale]', 'g');
        //     element.href = element.href.replace(re, locale);
        // }

        // Replace html content of all elements that have [data-i18n-replace-text].
        // This searches for all text in the format of "[[i18n {key}]]" and replaces
        // it with the key. This feature is helpful for specific pages but is likely
        // to not be used by most pages on a site.
        //
        // elements = rootElement.querySelectorAll('[data-i18n-replace-text]');
        // for (n = 0, m = elements.length; n < m; n++) {
        //     element = elements[n];
        //     html = element.innerHTML;
        //     for (key in this.langText) {
        //         if (this.langText.hasOwnProperty(key)) {
        //             search = '[[i18n ' + key + ']]';
        //             if (html.indexOf(search) !== -1) {
        //                 search = '\\[\\[i18n ' + key + ']]';
        //                 re = new RegExp(search, 'g');
        //                 value = (this.langText[key] ? this.langText[key] : key);
        //                 html = html.replace(re, value);
        //             }
        //         }
        //     }
        //     element.innerHTML = html;
        // }

        // Update all Nav Links on the document (not just the root element)
        // that have [data-i18n-nav-lang] so they point the current page
        // using the language from the link.
        //
        // elements = document.querySelectorAll('[data-i18n-nav-lang]');
        // for (n = 0, m = elements.length; n < m; n++) {
        //     element = elements[n];
        //     navLang = element.getAttribute('data-i18n-nav-lang');
        //     if (hashRouting) {
        //         element.href = window.location.hash.replace('#/' + i18n.currentLocale + '/', '#/' + navLang + '/');
        //     } else {
        //         element.href = window.location.pathname.replace('/' + i18n.currentLocale + '/', '/' + navLang + '/');
        //         element.addEventListener('click', app.pushStateClick);
        //     }
        // }

        // Update text for selected Lang on document Nav elements
        //
        // elements = document.querySelectorAll('[data-i18n-nav-selected]');
        // for (n = 0, m = elements.length; n < m; n++) {
        //     elements[n].textContent = i18n.currentLocale;
        // }
    }
}

/**
 * Add <i18n-service> element to the page
 */
window.customElements.define('i18n-service', I18nService);
