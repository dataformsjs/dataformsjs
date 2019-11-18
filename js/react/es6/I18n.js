/**
 * DataFormsJS Internationalization (I18N) API for React
 *
 * This standard JavaScript class which is intended for use with React
 * Components and provides an easy to use API for sites and apps that
 * need to support multiple languages.
 *
 * [i18n] is spelled "Internationalisation" in British English. [i18n] is an
 * acronym/numeronym that represents ("i" + 18 characters + "n"). The difference is
 * US English uses "z" while British English uses an "s" in the spelling of the word.
 *
 * Settings and logic for this class are based on the standard framework
 * plugin [DataFormsJS\js\Plugins\i18n.js] which allows for translations
 * to happen through JSON files and Hash Routing.
 *
 * This class is intended to be created only once as it as a [hashchange]
 * event to the global window. See demos and docs for full usage.
 *
 * When using this class it is intended to be created in the root scope
 * and the main [App] class should call [onLangStart] and [onLangLoaded]
 * on [componentDidMount].
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

export default class I18n {
    constructor(defaultLocale, supportedLocales, fileName = '_', fileDir = 'i18n') {
        // Basic validation of parameters
        if (typeof defaultLocale !== 'string') {
            throw new Error('Error - I18n - Missing default locale See examples for usage.');
        } else if (!Array.isArray(supportedLocales)) {
            throw new Error('Error - I18n - Missing or invalid supported locales. See examples for usage.');
        }

        // Define state and member variables
        this.state = {
            fileName: fileName,
            fileDir: fileDir,
            defaultLocale: defaultLocale,
            supportedLocales: supportedLocales,
            currentLocale: null,
            langText: {},
            langCache: {},
            startCallback: null,
            loadedCallback: null,
        };

        // Setup
        window.addEventListener('hashchange', this.onHashChange.bind(this));
        this.onHashChange();
    }

    onLangStart(callback) {
        this.state.startCallback = callback;
    }

    onLangLoaded(callback) {
        this.state.loadedCallback = callback;
    }

    get currentLocale() {
        return this.state.currentLocale;
    }

    onHashChange() {
        const i18n = this;
        const state = this.state;
        let currentLocale = null;

        // Get the selected locale from the the hash URL.
        // This assume the format of '#/:lang/*'
        if (window.location.hash.indexOf('#/') === 0) {
            currentLocale = window.location.hash.split('/')[1];
            if (currentLocale === '' || state.supportedLocales.indexOf(currentLocale) === -1) {
                currentLocale = null;
            }
        }
        // Language not found, use default
        if (currentLocale === null) {
            currentLocale = state.defaultLocale;
        }
        // No change then ext
        if (state.currentLocale === currentLocale) {
            return;
        }

        // Set current local and notify app through
        // callback that the language is changing.
        state.currentLocale = currentLocale;
        if (this.state.startCallback) {
            this.state.startCallback();
        }

        // Language file
        const url = state.fileDir + '/' + state.fileName + '.' + state.currentLocale + '.json';
        if (state.langCache[url] !== undefined) {
            // If it's already downloaded then use it from cache
            state.langText = state.langCache[url];
            i18n.updatePageTitle();
            if (state.loadedCallback) {
                state.loadedCallback();
            }
        } else {
            // The JSX Component <PolyfillService> will define a [fetch] polyfill, however if using IE
            // then this file will likely run before the Polyfill so use either [fetch] or [xhr].
            // The file to download is a simple JSON file, once download it is saved to the
            // memory cache and used when [i18.text()] is called.
            if (window.fetch !== undefined) {
                fetch(url, {
                    mode: 'cors',
                    cache: 'no-store',
                    credentials: 'same-origin',
                })
                .then(function(response) {
                    const status = response.status;
                    if ((status >= 200 && status < 300) || status === 304) {
                        return Promise.resolve(response);
                    } else {
                        const error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
                        return Promise.reject(error);
                    }
                })
                .then(function(response) { return response.json(); })
                .then(function(json) {
                    state.langCache[url] = json;
                })
                .catch(function(error) {
                    const errorMessage = 'Error Downloading I18N file: [' + url + '], Response Code Status: ' + error.message;
                    console.error(errorMessage);
                    state.langCache[url] = {};
                })
                .finally(function() {
                    state.langText = state.langCache[url];
                    i18n.updatePageTitle();
                    if (state.loadedCallback) {
                        state.loadedCallback();
                    }
                });
            } else {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.onload = function () {
                    let error = null;

                    try {
                        const status = this.status;
                        if ((status >= 200 && status < 300) || status === 304) {
                            state.langCache[url] = JSON.parse(this.responseText);
                        } else {
                            error = 'Response Status Code: ' + status;
                        }
                    } catch (e) {
                        error = e.toString();
                    }

                    if (error !== null) {
                        const errorMessage = 'Error Downloading I18N file: [' + url + '], Error: ' + error;
                        console.error(errorMessage);
                        state.langCache[url] = {};
                    }

                    state.langText = state.langCache[url];
                    i18n.updatePageTitle();
                    if (state.loadedCallback) {
                        state.loadedCallback();
                    }
                };
                xhr.send();
            }
        }
    }

    /**
     * This is called automatically when the language is changed and updates
     * the page title based on a key from <title data-i18n="{key}">.
     */
    updatePageTitle() {
        var title = document.querySelector('html title[data-i18n]');
        if (title) {
            title.textContent = this.text(title.getAttribute('data-i18n'));
        }
    }

    /**
     * Return language translation text for a key
     * @param {string} key
     */
    text(key) {
        return (this.state.langText && this.state.langText[key] ? this.state.langText[key] : key);
    }
}
