/**
 * DataFormsJS [i18n] Plugin for Internationalization (I18N)
 *
 * This class provides an easy to use API for sites and apps that need to
 * support multiple languages. The main [DataFormsJS.js] file also uses this API
 * if included in a multilingual site to determine the default page for a user.
 *
 * [i18n] is spelled "Internationalisation" in British English. [i18n] is an
 * acronym/numeronym that represents ("i" + 18 characters + "n"). The difference is
 * US English uses "z" while British English uses an "s" in the spelling of the word.
 *
 * HTML Attributes used by this Plugin:
 *     data-i18n
 *     data-i18n-file
 *     data-i18n-dir
 *     data-i18n-default
 *     data-i18n-locales
 *     data-i18n-attr
 *     data-i18n-href
 *     data-i18n-replace-text
 *     data-i18n-nav-lang
 *     data-i18n-nav-selected
 *
 * When used with Handlebars the following helper will be created:
 *     {{i18n key}}
 *
 * When used with Vue the following Directives will be created:
 *     v-i18n
 *     v-i18n-attr
 *
 * See code comments, examples, and the main site for usage.
 *
 * @link https://en.wikipedia.org/wiki/Internationalization_and_localization
 * @link https://www.w3.org/International/questions/qa-i18n
 */

/* Validates with both [jshint] and [eslint] */
/* global app, Handlebars, Vue, Promise */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* eslint no-prototype-builtins: "off" */

(function () {
    'use strict';

    /**
     * I18N Plugin Object
     */
    var i18n = {
        /**
         * Language Files are JSON files with the name format of '{file}.{lang}.json'.
         * The default file name is and underscore character [_] which results in files
         * being named [_.{lang}.json]; for example [_.en.json].
         *
         * This value can optionally be set from the HTML [data-i18n-file].
         *
         * Example:
         *     <html data-i18n-file="_">
         *     app.plugins.i18n.fileName = "_"
         */
        fileName: '_',

        /**
         * Default root URL to look for JSON Language files. This can be changed to any
         * valid path for files such as a full URL directory.
         *
         * This value can optionally be set from the HTML [data-i18n-file].
         *
         * Example:
         *     <html data-i18n-dir="i18n">
         *     app.plugins.i18n.fileDir = "i18n"
         */
        fileDir: 'i18n',

        /**
         * Default langauge to use. This value must be specified by the application and
         * can be set from the HTML attribute [data-i18n-default].
         *
         * Example:
         *     <html data-i18n-default="en">
         *     app.plugins.i18n.defaultLocale = "en"
         */
        defaultLocale: null,

        /**
         * Array of Supported Languages to use. This value must be specified by the
         * application and can be set from the HTML attribute [data-i18n-locales].
         * There should be one JSON file per language in the array.
         *
         * Example:
         *     <html data-i18n-locales="en,es">
         *     app.plugins.i18n.supportedLocales = ["en", "es"];
         */
        supportedLocales: null,

        /**
         * Current Locale/Language. This gets set everytime
         * [onRouteLoad()] is called.
         */
        currentLocale: null,

        /**
         * Object with [ key => value ] of language text for the current page.
         */
        langText: {},

        /**
         * Cache of downloaded URL's with language text.
         */
        langCache: {},

        /**
         * Helper function that can be called to get i18n text
         *
         * @param {string} key
         * @return {string}
         */
        getText: function (key) {
            return (this.langText && this.langText[key] ? this.langText[key] : key);
        },

        /**
         * Read Settings from the <html> element. This gets called as soon
         * as this file is loaded.
         */
        readSettings: function() {
            // Settings that have default values filled in
            var el = document.documentElement;
            var value = el.getAttribute('data-i18n-file');
            if (value !== null) {
                this.fileName = value;
            }
            value = el.getAttribute('data-i18n-dir');
            if (value !== null) {
                this.fileDir = value;
            }

            // Required Settings, only set if not already by the user.
            if (this.defaultLocale === null) {
                this.defaultLocale = el.getAttribute('data-i18n-default');
            }
            if (this.supportedLocales === null) {
               this.supportedLocales = el.getAttribute('data-i18n-locales');
                if (this.supportedLocales !== null) {
                    this.supportedLocales = this.supportedLocales.split(',').map(function(s) { return s.trim(); });
                }
            }
        },

        /**
         * Validate that the required settings [defaultLocale] and [supportedLocales]
         * are filled in.
         *
         * @returns {bool} Returns [true] if settings are valid.
         */
        validateSettings: function() {
            if (this.defaultLocale === null) {
                console.warn('Using [i18n] plugin without [defaultLocale / data-i18n-file] being filled in.');
                return false;
            } else if (this.supportedLocales === null) {
                console.warn('Using [i18n] plugin without [supportedLocales / data-i18n-locales] being filled in.');
                return false;
            } else if (!Array.isArray(this.supportedLocales)) {
                console.error('Using [i18n] plugin [supportedLocales] must be an array.');
                return false;
            }
            return true;
        },

        /**
         * Event that runs on each hash change before the route/view is loaded.
         * This function blocks the next function until the JSON file is downloaded
         * or an error occurs so downloads should occur very quickly. If they exist
         * as plain JSON files in their own directory then this function will run
         * quickly as intended.
         *
         * @param {function} next
         */
        onRouteLoad: function(next) {
            // Get Settings
            var isValid = this.validateSettings();
            this.currentLocale = null;

            // Get lang from URL '/:lang/path1/path2/etc'
            var hashRouting = (app.routingMode === undefined || app.routingMode()  === 'hash');
            if (hashRouting) {
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

            // If language is not matched then redirect back to the default route
            // if one is found. If no route matches then ignore to avoid an endless
            // loop of hash changes.
            if (this.currentLocale === null) {
                next(false);
                if (window.app && window.app.controller && window.app.controller('/:lang/') !== null) {
                    if (hashRouting) {
                        window.location = '#/' + this.defaultLocale + '/';
                    } else {
                        app.changeRoute('/' + this.defaultLocale + '/');
                    }
                }
                return;
            }

            // Update the Active Model with the selected locale. This value can be used
            // when creating links with Handlebars or other templating engines.
            if (window.app && typeof window.app.activeModel === 'object') {
                window.app.activeModel.i18n_Locale = this.currentLocale;
            }

            // Update the <html lang="lang"> attribute with the selected locale
            document.documentElement.lang = this.currentLocale;

            // Main Language file shared with all pages
            var url = this.fileDir + '/' + this.fileName + '.' + this.currentLocale + '.json';
            var promises = [this.downloadFile(url)];

            // Optionally download file from route define attribute [data-i18n-file / settings.i18nFile]
            var routeFileName = null;
            var routeUrl = null;
            if (app.activeController && app.activeController.settings && app.activeController.settings.i18nFile) {
                routeFileName = app.activeController.settings.i18nFile;
                routeUrl = this.fileDir + '/' + routeFileName + '.' + this.currentLocale + '.json';
                promises.push(this.downloadFile(routeUrl));
            }

            // Load language files from cached for download
            Promise.all(promises).finally(function() {
                if (routeUrl) {
                    i18n.langText = app.deepClone({}, i18n.langCache[url], i18n.langCache[routeUrl]);
                } else {
                    i18n.langText = i18n.langCache[url];
                }
                next();
            });
        },

        /**
         * Internal function that downloads the language file.
         *
         * @param {string} url
         * @return {Promise}
         */
        downloadFile: function (url) {
            // Load Language from Cached Data
            if (this.langCache[url] !== undefined) {
                return new Promise(function(resolve) { resolve(); });
            }

            // Download and Cache Language the first time it is used
            return fetch(url, {
                cache: 'no-store',
                credentials: 'same-origin',
                headers: (window.app && window.app.getRequestHeaders ? window.app.getRequestHeaders(url) : {}),
            })
            .then(function(response) {
                var status = response.status;
                if ((status >= 200 && status < 300) || status === 304) {
                    return Promise.resolve(response);
                } else {
                    var error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
                    return Promise.reject(error);
                }
            })
            .then(function(response) { return response.json(); })
            .then(function(json) {
                i18n.langCache[url] = json;
            })
            .catch(function(error) {
                var errorMessage = 'Error Downloading I18N file: [' + url + '], Response Code Status: ' + error.message;
                console.error(errorMessage);
                i18n.langCache[url] = {};
            });
        },

        /**
         * Event that runs every time the page is rendered from [app.updateView()].
         */
        onRendered: function (rootElement) {
            var elements,
                element,
                key,
                value,
                html,
                search,
                n,
                m,
                re,
                locales,
                locale,
                data,
                x,
                y,
                attr,
                navLang,
                hashRouting = (app.routingMode === undefined || app.routingMode()  === 'hash'),
                href,
                isI18nHref;

            // Use either document or specific element
            rootElement = (rootElement ? rootElement : document); 

            // Set text content of all elements that have the [data-i18n] attribute
            elements = rootElement.querySelectorAll('[data-i18n]');
            for (n = 0, m = elements.length; n < m; n++) {
                element = elements[n];
                key = element.getAttribute('data-i18n');
                element.textContent = (this.langText[key] ? this.langText[key] : key);
            }

            // Update attribute content of all elements that have [data-i18n-attr]
            elements = rootElement.querySelectorAll('[data-i18n-attr]');
            for (n = 0, m = elements.length; n < m; n++) {
                element = elements[n];
                data = element.getAttribute('data-i18n-attr').split(',').map(function(s) { return s.trim(); });
                for (x = 0, y = data.length; x < y; x++) {
                    attr = data[x];
                    key = element.getAttribute(attr);
                    if (key !== null) {
                        element.setAttribute(attr, (this.langText[key] ? this.langText[key] : key));
                    }
                }
                // Note, for this to work properly with custom controls and plugins
                // this file will likely need to be included before other plugins so that
                // it runs first. For example if <data-table> is used with sorting or filtering.
                if (element.getAttribute('data-control') !== null) {
                    app.loadJsControl(element);
                }
            }

            // Update links that have the attribute [data-i18n-href]. This allows links
            // to be setup with valid HTML such as (<a href="#/en/">) and then updated
            // by the plugin as the user changes the language.
            elements = rootElement.querySelectorAll('a[data-i18n-href]');
            for (n = 0, m = elements.length; n < m; n++) {
                element = elements[n];
                data = element.getAttribute('href').split('/');
                href = element.getAttribute('href');
                isI18nHref = (hashRouting ? href.indexOf('#/') === 0 : href.indexOf('/') === 0); 
                if (isI18nHref && data.length > 1) {
                    data[1] = this.currentLocale;
                    element.href = data.join('/');
                }
            }

            // Update links that have the attribute [data-i18n-locales] and replace
            // [href] text that contains '{locale}' with the current or default locale.
            elements = rootElement.querySelectorAll('a[data-i18n-locales]');
            for (n = 0, m = elements.length; n < m; n++) {
                element = elements[n];
                locales = element.getAttribute('data-i18n-locales').split(',').map(function(s) { return s.trim(); });
                locale = this.currentLocale;
                if (locales.indexOf(locale) === -1) {
                    if (locales.indexOf(this.defaultLocale) !== -1) {
                        locale = this.defaultLocale;
                    } else {
                        locale = locales[0];
                    }
                }
                re = new RegExp('\\[locale]', 'g');
                element.href = element.href.replace(re, locale);
            }

            // Replace html content of all elements that have [data-i18n-replace-text].
            // This searches for all text in the format of "[[i18n {key}]]" and replaces
            // it with the key. This feature is helpful for specific pages but is likely
            // to not be used by most pages on a site.
            elements = rootElement.querySelectorAll('[data-i18n-replace-text]');
            for (n = 0, m = elements.length; n < m; n++) {
                element = elements[n];
                html = element.innerHTML;
                for (key in this.langText) {
                    if (this.langText.hasOwnProperty(key)) {
                        search = '[[i18n ' + key + ']]';
                        if (html.indexOf(search) !== -1) {
                            search = '\\[\\[i18n ' + key + ']]';
                            re = new RegExp(search, 'g');
                            value = (this.langText[key] ? this.langText[key] : key);
                            html = html.replace(re, value);
                        }
                    }
                }
                element.innerHTML = html;
            }

            // Update all Nav Links on the document (not just the root element)
            // that have [data-i18n-nav-lang] so they point the current page
            // using the language from the link.
            elements = document.querySelectorAll('[data-i18n-nav-lang]');
            for (n = 0, m = elements.length; n < m; n++) {
                element = elements[n];
                navLang = element.getAttribute('data-i18n-nav-lang');
                if (hashRouting) {
                    element.href = window.location.hash.replace('#/' + i18n.currentLocale + '/', '#/' + navLang + '/');
                } else {
                    element.href = window.location.pathname.replace('/' + i18n.currentLocale + '/', '/' + navLang + '/');
                    element.addEventListener('click', app.pushStateClick);
                }
            }

            // Update text for selected Lang on document Nav elements
            elements = document.querySelectorAll('[data-i18n-nav-selected]');
            for (n = 0, m = elements.length; n < m; n++) {
                elements[n].textContent = i18n.currentLocale;
            }
        },

        /**
         * If using Handlebars then add a Helper. This function gets called
         * automatically when the page is loaded.
         */
        setup: function () {
            // Create Handlebars Helper
            if (window.Handlebars) {
                Handlebars.registerHelper('i18n', function (key, options) {
                    // Validation
                    if (options === undefined) {
                        console.warn('Warning {{i18n}} is not being called with correct parameters, expected {{i18n key}}, parameters:');
                        console.log(key);
                        console.log(options);
                        return 'Error';
                    }

                    // Return the matching value or key if not found
                    var value = (i18n.langText && i18n.langText[key] ? i18n.langText[key] : key);
                    return value;
                });
            }

            // Create Vue Directives
            if (window.Vue) {
                Vue.directive('i18n', {
                    bind: function (el, binding) {
                        var key = binding.value;
                        el.textContent = (i18n.langText && i18n.langText[key] ? i18n.langText[key] : key);
                    }
                });

                Vue.directive('i18n-attr', {
                    bind: function (el, binding) {
                        var attr = binding.value.split(',').map(function(s) { return s.trim(); });
                        for (var x = 0, y = attr.length; x < y; x++) {
                            var key = el.getAttribute(attr[x]);
                            if (key !== null) {
                                el.setAttribute(attr[x], (i18n.langText[key] ? i18n.langText[key] : key));
                            }
                        }
                    }
                });
            }
        },
    };

    /**
     * Read settings for [defaultLocale, supportedLocales, etc]
     * as soon as this file is loaded.
     */
    i18n.readSettings();

    /**
     * Add Handlebars Helpers and Vue Directives when page is first loaded
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', i18n.setup);
    } else {
        i18n.setup();
    }

    /**
     * Add Plugin to DataFormsJS
     */
    app.addPlugin('i18n', i18n);
})();
