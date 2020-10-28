/*
    This is an active development to polyfill DataFormsJS Web Components.
    It's working so far (2020-10-09) however lot of testing and additional
    features are needed before this file can be published.

    See topic: "Finish Web Component Updates"
    In file [../to-do-list.txt]
        https://github.com/dataformsjs/dataformsjs/blob/master/docs/to-do-list.txt

    For the purpose of testing this file is being developed in modern browsers using this:
        <script src="../js/web-components/polyfill.js"></script>
    For the release the Web Components will be uncommented and this script will use [nomodule]
        <script nomodule src="../js/web-components/polyfill.js"></script>

    Additional items that must be completed before this will be published:
        - Confirm this works on all Web Component example pages, playground, and templates
        - See code related to `app.activeModel = this` in this file. Come up with
            a test and see if the issue in the comments can be handled. If not provide a
            warning at least.
        - Currently all demo pages use <json-data>. See variable `hasJsonData` in this file.
            It was added in case a page doesn't use <json-data> however it still needs to be tested
            (at least manually). This may be needed if adding a search screen for the places demo.
        - Consider downloading 'controls/data-list' and other required scripts only if needed.
            This is doable however it adds more complexity to the code so this can be decided
            later if it makes sense or not.
*/

/* Validates with both [jshint] and [eslint] */
/* global app, Promise */
/* jshint strict: true */
/* jshint evil:true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* eslint no-prototype-builtins: "off" */

(function () {
    'use strict';

    /**
     * CSS that get's added to the page.
     */
    var polyfillStyleId = 'web-components-polyfill-css';
    var polyfillStyleCss = [
        'template { display:none }', /* For IE during page loading until `app.updateTemplatesForIE()` is from the main framework */
        '[data-control] { display:block; padding:0; margin:0; }',
        'div[data-control="json-data"] > div.is-loading,',
        'div[data-control="json-data"] > div.has-error,',
        'div[data-control="json-data"] > div.is-loaded { padding:0; margin:0; }',
    ].join('\n');

    // Module Level Variables
    var rootUrl = null;
    var useMinFiles = null;

    /**
     * Update specific Web Components to use DataFormsJS Framework Plugins, Controls, etc
     */
    var updateElements = {
        dataAttributes: function(element, attributes) {
            attributes.forEach(function(attr) {
                var value = element.getAttribute(attr);
                if (value !== null) {
                    element.setAttribute('data-' + attr, value);
                }
            });
        },
        jsonData: function(element) {
            updateElements.dataAttributes(element, ['url', 'load-only-once', 'click-selector']);
            var elements = ['is-loading', 'has-error', 'is-loaded'];
            elements.forEach(function(name) {
                var el = element.querySelector(name);
                if (el) {
                    var div = document.createElement('div');
                    div.className = el.className;
                    div.classList.add(name);
                    while (el.firstChild) {
                        div.appendChild(el.removeChild(el.firstChild));
                    }
                    el.parentNode.replaceChild(div, el);
                }
            });
        },
        dataList: function(element) {
            updateElements.dataAttributes(element, ['template-selector', 'root-element', 'root-attr', 'error-class', 'template-returns-html', 'list-item-name'])
        },
        dataTable: function(element) {
            updateElements.dataAttributes(element, ['highlight-class', 'labels', 'columns', 'table-attr', 'highlight-class']);
        },
        imageGallery: function(element) {
            element.setAttribute('data-image-gallery', element.getAttribute('image'));
            updateElements.dataAttributes(element, ['image-avif', 'image-webp']);
            var title = element.getAttribute('title');
            if (title === null) {
                var img = element.querySelector('img[alt]');
                if (img) {
                    title = img.getAttribute('alt');
                    element.setAttribute('title', title);
                }
            }
        },
        inputFilter: function(element) {
            updateElements.dataAttributes(element, ['filter-selector', 'filter-results-text-all', 'filter-results-text-filtered']);
            var selector = element.getAttribute('filter-results-selector');
            if (selector) {
                element.setAttribute('data-filter-results-text-selector', selector);
            }
        },
        leafletMap: function(element) {
            element.setAttribute('data-leaflet', '');
            updateElements.dataAttributes(element, ['latitude', 'longitude', 'zoom', 'marker']);
            // Convert bind attributes - example:
            //   "latitude, longitude, marker"
            // To:
            //   "data-latitude, data-longitude, data-marker"
            var bindAttr = element.getAttribute('data-bind-attr');
            if (bindAttr && !bindAttr.includes('data-')) {
                bindAttr = bindAttr.split(',').map(function(s) { return 'data-' + s.trim(); });
                element.setAttribute('data-bind-attr', bindAttr.join(', '));
            }
        },
        navLinks: function() {
            // This assumes only one <nav is="spa-links"> exists on the page. If a site
            // uses multiple nav formats then it will likely need to make additional updates
            // on the 'app:routeChanged' event.
            var navSelector = 'nav[is="spa-links"]';
            var element = document.querySelector(navSelector);
            if (!element) {
                return;
            }
            var itemSelector = element.getAttribute('item-selector');
            if (itemSelector) {
                app.plugins.navLinks.itemSelector = navSelector + ' ' + itemSelector;
            }
            var activeClass = element.getAttribute('active-class');
            if (activeClass) {
                app.plugins.navLinks.activeClass = activeClass;
            }
        }
    };

    /**
     * Custom Framework Page object to handle routes defined by
     * <url-hash-router> and <url-router> Routes.
     */
    var polyfillPage = {
        model: {},
        // onRouteLoad: function() { },
        // onBeforeRender: function() { },
        onRendered: function() {
            var model = this;

            // Bind [url-param] elements
            var elements = document.querySelectorAll('[url-param]');
            Array.prototype.forEach.call(elements, function(element) {
                var name = element.getAttribute('url-param');
                if (model[name] !== undefined) {
                    element.textContent = model[name];
                }
            });

            // Update all elements with the [url-attr-param] attribute.
            // This will typically be used to replace <a href> and other
            // attributes with values from the URL.
            elements = document.querySelectorAll('[url-attr-param]');
            Array.prototype.forEach.call(elements, function(element) {
                app.plugins.dataBind.bindAttrTmpl(element, 'url-attr-param', model);
            });

            // App Event
            // When using Web Components this happens on either <url-hash-router> or <url-router>
            // and bubbles up to the document. For the polyfill the specific router element
            // doesn't matter so the event is dispatched on the document.
            dispatchEvent(document, 'app:routeChanged', {
                url: (app.activeController && app.activeController.path ? app.activeController.path : null),
                urlParams: app.activeParameterList,
            });

            // Update <json-data> Web Component so it matches the
            // Framework control version then reload the control.
            var hasJsonData = false;
            app.activeJsControls.forEach(function(control) {
                if (control.control === 'json-data') {
                    updateElements.jsonData(control.element);
                    app.loadJsControl(control);
                    hasJsonData = true;
                }
            });

            // If <json-data> was found it will call `updateContent()` once the
            // data is downloaded, otherwise it needs to be called directly.
            if (!hasJsonData) {
                updateContent(document);
            }
        },
        // onRouteUnload: function() { },
    };

    /**
     * Function that gets called after a JSON Service finishes downloading data
     * or after the page is ready once the route has been set.
     */
    function updateContent(rootElement) {
        var pluginsToLoad = [];

        // Reload specific controls and content after
        // data was downloaded from JSON service.
        app.activeJsControls.forEach(function(control) {
            switch (control.control) {
                case 'data-table':
                    updateElements.dataTable(control.element);
                    app.loadJsControl(control);
                    break;
                case 'data-list':
                    updateElements.dataList(control.element);
                    app.loadJsControl(control);
                    break;
            }
        });

        // Make sure [data-bind] values are handled before other plugins run
        var firstElement = document.querySelector('[data-bind]');
        if (firstElement) {
            app.plugins.dataBind.reload();
        }

        // Look for elements that would trigger a plugin and add to list
        var search = [
            { selector: '.click-to-highlight', plugin: 'clickToHighlight' },
            { selector: '[data-sort]', plugin: 'sort' },
            { selector: '[is="spa-links"]', plugin: 'navLinks', after: updateElements.navLinks },
            { selector: '[is="input-filter"]', plugin: 'filter', update: updateElements.inputFilter },
            { selector: '[is="leaflet-map"]', plugin: 'leaflet', update: updateElements.leafletMap },
            { selector: 'image-gallery', plugin: 'imageGallery', update: updateElements.imageGallery },
            { selector: '[data-enter-key-click-selector]', plugin: 'keydownAction' },
        ];
        search.forEach(function(item) {
            var element = document.querySelector(item.selector);
            if (element) {
                // Add plugin to download list
                if (typeof item.after === undefined) {
                    pluginsToLoad.push(item.plugin);
                } else {
                    pluginsToLoad.push({ name: item.plugin, callback: item.after });
                }
                // Update all elements for specific plugins
                if (item.update !== undefined) {
                    var elements = document.querySelectorAll(item.selector);
                    Array.prototype.forEach.call(elements, function(el) {
                        item.update(el);
                    });
                }
            }
        });

        // Load Plugins
        pluginsToLoad.forEach(function(plugin) {
            if (typeof plugin === 'string') {
                loadPlugin(plugin);
            } else {
                loadPlugin(plugin.name, plugin.callback);
            }
        });

        // App Event
        dispatchEvent(rootElement, 'app:contentReady');
        if (rootElement.getAttribute('data-control') === 'json-data') {
            evalElementJs(rootElement.getAttribute('onready'), 'json-data', 'onready');
        }
    }

    /**
     * Used to execute code from <url-route>[onload] and <json-data>[onready]
     *
     * @param {string} js
     * @param {string} name
     * @param {string} prop
     */
    function evalElementJs(js, name, prop) {
        if (js) {
            try {
                var fn = new Function('return ' + js);
                var result = fn();
                if (typeof result === 'function') {
                    result();
                }
            } catch(e) {
                app.showErrorAlert('Error from function <' + name + ' ' + prop + '="' + js + '">: ' + e.message);
                console.error(e);
            }
        }
    }

    /**
     * Trigger DOM Events for Apps to handle
     *
     * @param {HTMLElement} element
     * @param {Event|CustomEvent} event
     * @param {undefined|any} detail
     */
    function dispatchEvent(element, eventName, detail) {
        // Standard DOM Event
        var event;
        if (detail === undefined) {
            if (typeof(Event) === 'function') {
                event = new Event(eventName, { bubbles: true }); // Modern Browsers
            } else {
                event = document.createEvent('Event'); // IE 11
                event.initEvent(eventName, true, false);
            }
        } else {
            if (typeof(CustomEvent) === 'function') {
                event = new CustomEvent(eventName, { bubbles: true, detail: detail });
            } else {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent(eventName, true, false, detail);
            }
        }
        element.dispatchEvent(event);

        // Execute JavaScript from <url-route onload="{js}">
        if (eventName === 'app:routeChanged' && app.activeController && app.activeController.settings && app.activeController.settings.onload) {
            evalElementJs(app.activeController.settings.onload, 'url-route', 'onload');
        }
    }

    /**
     * Download and run a DataFormsJS Framework plugin.
     * @param {string} name
     * @param {undefined|function} callback
     */
    function loadPlugin(name, callback) {
        // Run plugin if it's already loaded.
        if (app.plugins[name] !== undefined) {
            if (callback !== undefined) {
                callback();
            }
            app.plugins[name].reload();
            return;
        }

        // Download then Plugin
        var url = rootUrl + 'plugins/' + name + (useMinFiles ? '.min' : '') + '.js';
        app.loadScripts(url).then(function() {
            if (app.plugins[name] === undefined) {
                console.warn('Plugin [' + name + '] was loaded but not found. The script might still be loading in the DOM.')
                return;
            }
            if (callback !== undefined) {
                callback();
            }
            app.plugins[name].reload();
        });
    }

    /**
     * Handle DataFormsJS Framework Events
     */
    function defineCustomEvents() {
        app.controls['json-data'].onFetch = function(element, fromCache) {
            // Define or update the [app.activeModel] based downloaded data.
            if (app.activeController && app.activeController.modelName) {
                if (!fromCache) {
                    app.deepClone(app.models[app.activeController.modelName], this);
                }
                app.activeModel = app.models[app.activeController.modelName];
            } else {
                app.activeModel = this; // Non-SPA
            }
            // Update page content
            updateContent(element);
        };
    }

    /**
     * Convert routes under <url-hash-router>
     * and <url-router> to standard Framework routes.
     */
    function defineRoutes() {
        // Private function related to routing setup
        function routerError(router, error) {
            dispatchEvent(router, 'app:error', error);
            dispatchEvent(router, 'app:routeChanged', {
                url: (app.activeController && app.activeController.path ? app.activeController.path : null),
                urlParams: app.activeParameterList,
            });
            app.showError(router, error);
            console.error(error);
        }

        // Get Router Type
        var router = document.querySelector('url-hash-router');
        var routeSelector = 'url-hash-route';
        if (router === null) {
            router = document.querySelector('url-router');
            if (router === null) {
                return;
            }
            routeSelector = 'url-route';
            // Required before `app.setup()` is called in order to use
            // History Routes (pushState, popstate)
            document.documentElement.setAttribute('data-routing-mode', 'history');
        }

        // Define and Validate App Settings based on Router
        app.settings.viewSelector = router.getAttribute('view-selector');
        app.settings.lazyTemplateSelector = router.getAttribute('loading-template-selector');
        if (app.settings.viewSelector === null) {
            routerError(router, 'Error, element <' + router.tagName.toLowerCase() + '> is missing attribute [view-selector]');
            return;
        }
        var view = document.querySelector(app.settings.viewSelector);
        if (view === null) {
            routerError(router, 'Error, element from <url-hash-router view-selector="' + app.escapeHtml(app.settings.viewSelector) + '"> was not found on the page.');
            return;
        }

        // Map items from [window.lazyLoad] to [app.lazyLoad] excluding items in
        // the format of `{module:url}` as they are intended only for modern browsers
        // and items in the format of `{nomodule:url}` will be added as strings.
        if (window.lazyLoad !== undefined) {
            for (var prop in window.lazyLoad) {
                if (window.lazyLoad.hasOwnProperty(prop)) {
                    var item = window.lazyLoad[prop];
                    if (Array.isArray(item) || typeof item === 'string') {
                        app.lazyLoad[prop] = item;
                    } else if (typeof item.nomodule === 'string') {
                        app.lazyLoad[prop] = item.nomodule;
                    } else if (!(typeof item.module === 'string')) {
                        console.error('Unhandled window.lazyLoad Script: ' + prop);
                    }
                }
            }
        }

        // Get all routes on the page and for each route add a controller object. When using the
        // standard DataFormsJS framework it converts <template|script data-route="path"> to
        // controllers. For the Web Components Polyfill <url-route|url-hash-route> are used instead.
        var routes = router.querySelectorAll(routeSelector);
        var viewIndex = 0;
        Array.prototype.forEach.call(routes, function(route) {
            // Get route [path]
            var path = route.getAttribute('path');
            if (path === null) {
                routerError(router, 'Error, element <' + route.tagName.toLowerCase() + '> is missing attribute [path]');
                console.log(route);
                return;
            }

            // If default route then update app settings
            var isDefault = (route.getAttribute('default-route') !== null);
            if (isDefault) {
                app.settings.defaultRoute = path;
            }

            // Handle [redirect] routes
            var redirect = route.getAttribute('redirect');
            if (redirect !== null) {
                app.addController({
                    path: path,
                    onRendered: function() {
                        app.changeRoute(this.redirect);
                    },
                    settings: { redirect: redirect },
                });
                return;
            }

            // Get Template Source
            var viewUrl = route.getAttribute('src');
            var viewId;
            if (viewUrl === null || viewUrl === '') {
                viewUrl = undefined;
                var template = route.querySelector('template');
                if (template === null) {
                    app.showErrorAlert('Missing <template> or [src] attribute for route <' + route.tagName.toLowerCase() + ' path="' + path + '">.');
                    console.log(route);
                    return;
                }
                if (!template.id) {
                    template.id = 'url-hash-route-template-' + viewIndex + '-' + (new Date()).getTime();
                    viewIndex++;
                }
                viewId = template.id;
            }

            // Map items from [lazy-load].
            var settings = {
                lazyLoad: [],
                onload: route.getAttribute('onload'),
            };
            var lazyLoad = route.getAttribute('lazy-load')
            if (lazyLoad !== null) {
                lazyLoad = lazyLoad.split(',').map(function(s) { return s.trim(); });
                settings.lazyLoad = lazyLoad.filter(function(item) {
                    return (app.lazyLoad[item] !== undefined);
                }).join(', ');
            }
            var noLazyLoad = (Object.keys(settings.lazyLoad).length === 0);
            if (noLazyLoad && settings.onload === null) {
                settings = undefined;
            } else if (noLazyLoad) {
                delete settings.lazyLoad;
            }

            // Add Route as Framework Controller
            app.addController({
                path: path,
                viewId: viewId,
                viewUrl: viewUrl,
                viewEngine: 'Text',
                pageType: 'polyfillPage',
                settings: settings,
                // modelName: undefined,
            });
        });

        // Setup the routes. When using the standard Framework this would be
        // called automatically from the ('DOMContentLoaded') event however it
        // needs to be called directly here after adding the routes/controllers.
        app.setup();
    }

    /**
     * Setup the page for non-SPA's
     */
    function noRoutingSetup() {
        // Exit if the page contains a router
        var urlHashRouter = document.querySelector('url-hash-router, url-router');
        if (urlHashRouter) {
            return;
        }

        app.activeModel = {};
        app.onUpdateViewComplete = function() {
            polyfillPage.onRendered();
        };
        app.updateView();
    }

    /**
     * Basic script loading used once time to load the main framework file
     * [DataFormsJS.js]. After it's loaded `app.loadScript()` and `app.loadScripts()`
     * are used for additional script loading.
     *
     * @param {string} url
     * @param {function} callback
     */
    function loadScript(url, callback) {
        var script = document.createElement('script');
        script.onload = callback;
        script.onerror = function () {
            console.error('Error loading Script: ' + url);
            callback();
        };
        script.src = url;
        document.head.appendChild(script);
    }

    /**
     * Determine the root URL for loading DataFormsJS framework files.
     */
    function findRootUrl() {
        // Did the app set a custom value? If so use it.
        if (typeof window.dataformsjsUrl === 'string') {
            rootUrl = window.dataformsjsUrl;
            useMinFiles = (window.dataformsjsMinFiles !== false); // Defaults to `true` if not defined
            return;
        }

        // If minimized polyfill is being used then download minimized framework files,
        // otherwise if un-minimized files then download un-minimized framework files.
        var files = ['/web-components/polyfill.min.js', '/web-components/polyfill.js'];
        for (var n = 0; n < 2; n++) {
            var script = document.querySelector('script[src$="' + files[n] + '"]');
            var src;
            if (script) {
                src = script.getAttribute('src');
                rootUrl = src.substr(0, src.length - files[n].length + 1);
                useMinFiles = (n === 0);
                return;
            }
        }

        // Default if [dataformsjs] path cannot be determined.
        // NOTE - this won't work until the next release of DataFormsJS is published.
        rootUrl = 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/';
        useMinFiles = true;
    }

    /**
     * Once the Framework and needed Browser Polyfills are downloaded then
     * download needed Framework scripts and setup the app.
     */
    function loadPagePlugins() {
        // A number of additional scripts are downloaded that may or may not be used,
        // however in general the files are small - "*.min.js" version of all files
        // is less than 20 kb before gzipping. It's likely most sites using this
        // will use [json-data], [dataBind] and at least one of [data-list] or [data-table].
        // Aditional scripts such as [js/plugins/filter.js] are downloaded later only if they
        // are used by the app. All scripts here are downloaded asynchronously so it's very quick.
        var promises = [
            app.loadScripts(rootUrl + 'controls/data-list' + (useMinFiles ? '.min' : '') + '.js'),
            app.loadScripts(rootUrl + 'controls/data-table' + (useMinFiles ? '.min' : '') + '.js'),
            app.loadScripts(rootUrl + 'controls/json-data' + (useMinFiles ? '.min' : '') + '.js'),
            app.loadScripts(rootUrl + 'extensions/format' + (useMinFiles ? '.min' : '') + '.js'),
            app.loadScripts(rootUrl + 'extensions/jsTemplate' + (useMinFiles ? '.min' : '') + '.js'),
            app.loadScripts(rootUrl + 'plugins/dataBind' + (useMinFiles ? '.min' : '') + '.js'),
        ];

        // After all scripts have been loaded the setup the app
        Promise.all(promises).finally(function () {
            app.addPage('polyfillPage', polyfillPage);

            // Define a setting so apps can check if this file is being used.
            app.settings.usingWebComponentsPolyfill = true;

            defineCustomEvents();
            defineRoutes();
            noRoutingSetup();
        });
    }

    /**
     * Setup the app when the page is ready
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Handle already loaded plugins from [jsPlugins.js] and if defined
        // remove the exiting `window.app` object. An example of this exists
        // in [examples/log-table-web.htm].
        var plugins = null;
        if (window.app !== undefined && typeof window.app.plugins === 'object' && window.DataFormsJS === undefined) {
            plugins = window.app.plugins;
            delete window.app;
        }

        // Download the DataFormsJS Framework main file
        findRootUrl();
        var url = rootUrl + 'DataFormsJS' + (useMinFiles ? '.min' : '') + '.js';
        loadScript(url, function () {
            app.loadCss(polyfillStyleId, polyfillStyleCss);

            // If [jsPlugins.js] is used then add back the plugins
            if (plugins !== null) {
                for (var name in plugins) {
                    if (plugins.hasOwnProperty(name)) {
                        app.addPlugin(name, plugins[name]);
                    }
                }
            }

            // Polyfill Logic that normally happens from DataFormsJS 'DOMContentLoaded' event
            var condition = (Array.from && window.Promise && window.fetch && Promise.prototype.finally ? true : false);
            app.loadScript(condition, app.settings.polyfillUrl, loadPagePlugins);
        });
    });
})();
