/*
    This is an early proof of concept to polyfill DataFormsJS Web Components.
    A lot of testing, more features, additional code organization (refactor)
    will be needed before this file can be published.

    See topic: "Create a Polyfill for Web Components"
    In file [../to-do-list.txt]
        https://github.com/dataformsjs/dataformsjs/blob/master/docs/to-do-list.txt

    To easily test this script use the playground:
    	https://www.dataformsjs.com/en/playground

    Create an [app.js] file and copy the contens of this file to it.

    Then from [app-web.htm] comment out all [dataformsjs] scripts and add:
    	<script src="app.js"></scrip>

    Additonally change [<script type="module">] to <script type="module2">
    so that it doesn't run.

    The resulting app can be developed in modern browsers. For the final release
    the standard [nomodule] will be used in order for the script to load on old browsers:
        <script nomodule src="js/web-components/polyfill.js"></scrip>

    Additional items that must be completed before this will be published:
        - Make sure all data binding works as expected - [data-bind], [url-param], etc
        - <data-table> should probably be replaced with a custom version here is
            the web component contains additional features - example [col-link-template, highlight-class]
            and more features are planned such as a <template> for items.
            See the custom <data-list> version created here.
        - Also consider adding <data-list> and <data-table> changes needed here back to the regular framwork.
            Only if it makes sense so they can be loaded dynamically only if needed.
        - API function so apps can handle custom content
            Tested and working, example instead of defining custom plugins:
                app.addPlugin("pageLinksAndImages", function() { ... });
            Use the 'app:contentReady' event
                document.addEventListener('app:contentReady', function() { ... });
            Examples will be updated to use this
        - Confirm it works on all Web Component example pages and templates
        - Likely some CSS may have to be added for IE
        - Converts <template> to <script type="text/x-template"> for downloaded
            HTML content. `app.setup()` handles this one time for IE however a
            function will likely need to be created so it can be handled
            each time a route template is downloaded.
        - Handle additional items described in [docs/to-do-list.txt]
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
     * Update specific Web Components to use DataFormsJS Framework Plugins, Controls, etc
     */
    var updateElements = {
        jsonData: function(element) {
            var url = element.getAttribute('url');
            element.setAttribute('data-url', url);
            var elements = ['is-loading', 'has-error', 'is-loaded'];
            elements.forEach(function(name) {
                var el = element.querySelector(name);
                if (el) {
                    var div = document.createElement('div');
                    div.innerHTML = el.innerHTML;
                    div.className = name;
                    el.parentNode.replaceChild(div, el);
                }
            });
        },
        dataList: function(element) {
            var attrList = ['template-selector', 'root-element', 'root-class', 'error-class'];
            attrList.forEach(function(attr) {
                var value = element.getAttribute(attr);
                if (value !== null) {
                    element.setAttribute('data-' + attr, value);
                }
            });
        },
        dataTable: function(element) {
            var source = element.getAttribute('data-bind');
            element.setAttribute('data-source', source);

            var tableAttr = element.getAttribute('table-attr');
            if (tableAttr) {
                var list = tableAttr.split(',').map(function(s) { return s.trim(); });
                list.forEach(function(attr) {
                    var pos = attr.indexOf('=');
                    if (pos > 1) {
                        var name = attr.substr(0, pos).trim();
                        var value = attr.substr(pos+1).trim();
                        element.setAttribute(name, value);
                    } else {
                        element.setAttribute(attr, '');
                    }
                });
            }

            if (element.getAttribute('is') === 'sortable-table') {
                element.setAttribute('data-sort', '');
            }
        },
        imageGallery: function(element) {
            var attrList = ['image', 'image-avif', 'image-webp'];
            attrList.forEach(function(attr) {
                var value = element.getAttribute(attr);
                if (value !== null) {
                    if (attr === 'image') {
                        element.setAttribute('data-image-gallery', value);
                    } else {
                        element.setAttribute('data-' + attr, value);
                    }
                }
            });
        },
        inputFilter: function(element) {
            var attributes = [
                'filter-selector',
                'filter-results-selector',
                'filter-results-text-all',
                'filter-results-text-filtered'
            ];
            attributes.forEach(function(attr) {
                var value = element.getAttribute(attr);
                if (value !== null) {
                    element.setAttribute('data-' + attr, value);
                }
            });
        },
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
            app.unloadAllJsControls();

            var controls = document.querySelectorAll('[data-control]');
            Array.prototype.forEach.call(controls, function(control) {
                switch (control.getAttribute('data-control')) {
                    case 'json-data':
                        updateElements.jsonData(control);
                        break;
                    case 'data-list':
                        updateElements.dataList(control);
                        break;
                    case 'data-table':
                        updateElements.dataTable(control);
                        break;
				}
            });

            var elements = document.querySelectorAll('[is]');
            Array.prototype.forEach.call(elements, function(element) {
                switch (element.getAttribute('is')) {
                    case 'input-filter':
                        updateElements.inputFilter(element);
                        loadPlugin('filter');
                        break;
                }
            });

            app.loadAllJsControls();

            // Bind [url-param] elements
            // NOTE - other element types may also needed for full support: [url-params]
            // and [url-attr-param]. Need to test with all examples to confirm.
            elements = document.querySelectorAll('[url-param]');
            Array.prototype.forEach.call(elements, function(element) {
                var name = element.getAttribute('url-param');
                if (model[name] !== undefined) {
                    element.textContent = model[name];
                }
            });
        },
		// onRouteUnload: function() { },
    };

    /**
     * Replacment for <data-list> Web Component.
     * A Framework version of this control also exists but the
     * behavior is different enough that a seperate version is created here.
     */
    var dataList = {
        /**
         * Data for the control
         */
        data: {
            bind: null,
            templateSelector: null,
            rootElement: null,
            rootClass: null,
            errorClass: null,
        },

        /**
         * Event that gets called when a <data-list> is rendered on screen
         *
         * @this dataList.data
         * @param {object} model
         */
        html: function(model) {
            var control = this;
            var html = [];

            function addError(error, element) {
                if (element === undefined) {
                    element = 'div';
                }
                if (control.errorClass) {
                    html.push('<' + element + ' class="' + app.escapeHtml(control.errorClass) + '">' + app.escapeHtml(error) + '</' + element + '>');
                } else {
                    html.push('<' + element + ' style="color:white; background-color:red; padding:0.5rem 1rem; margin:.5rem;">' + app.escapeHtml(error) + '</' + element + '>');
                }
            }

            function closeElement() {
                if (control.rootElement !== null) {
                    html.push('</' + app.escapeHtml(control.rootElement) + '>');
                }
            }

            if (this.templateSelector === null) {
                return '';
            }

            // Get Table from Model
            var list = (model && model[this.bind] ? model[this.bind] : null);
            if (list === null || (Array.isArray(list) && list.length === 0)) {
                return '';
            }

            // Root Element is optional and only used if a template is used
            if (this.rootElement !== null) {
                if (this.rootClass === null) {
                    html.push('<' + app.escapeHtml(this.rootElement) + '>');
                } else {
                    html.push('<' + app.escapeHtml(this.rootElement) + ' class="' + app.escapeHtml(this.rootClass) + '">');
                }
            }

            if (this.templateSelector) {
                var template = document.querySelector(this.templateSelector);
                if (!template) {
                    addError('Error <data-list> Template not found from selector: ' + this.templateSelector);
                    closeElement();
                    return html.join('');
                }

                // Bulid the template
                // When using Web Componetns JavaScript template literals (template strings)
                // are used so this is a basic replacement for the original function.
                // It covers basic templates but will not handle advanced templates.
                var tmplHtml = template.innerHTML;
                var js = /\$\{([^}]+)\}/g;
                var match;
                var loopCount = 0;
                var maxLoops = 1000; // For safety during development
                var tmplJs = [];
                var lastIndex = 0;
                while ((match = js.exec(tmplHtml)) !== null) {
                    tmplJs.push(JSON.stringify(tmplHtml.substring(lastIndex, match.index)));
                    tmplJs.push('String(app.escapeHtml(' + match[1] + '))');
                    lastIndex = match.index + match[0].length;
                    loopCount++;
                    if (loopCount > maxLoops) {
                        // Safety check to prevent endless loops
                        app.showErrorAlert('Unexpected Loop Error in <data-list>');
                        return;
                    }
                }
                tmplJs.push(JSON.stringify(tmplHtml.substring(lastIndex, tmplHtml.length)));

                // Render each item in the template.
                try {
                    var tmpl = new Function('item', 'index', 'app', 'with(item){return ' + tmplJs.join(' + ') + '}');
                    for (var index = 0, count = list.length; index < count; index++) {
                        var item = list[index];
                        try {
                            html.push(tmpl(item, index, app));
                        } catch (e) {
                            var itemElement = (this.rootElement === 'ul' ? 'li' : 'div');
                            addError('Item Error - ' + e.message, itemElement);
                        }
                    }
                } catch (e) {
                    addError('Error Rendering Template - ' + e.message);
                }
            } else {
                // Basic <ul> list
                if (this.rootClass === null) {
                    html.push('<ul>');
                } else {
                    html.push('<ul class="' + app.escapeHtml(this.rootClass) + '">');
                }
                for (var n = 0, m = list.length; n < m; n++) {
                    html.push('<li>' + app.escapeHtml(list[n]) + '</li>');
                }
                html.push('</ul>');
            }
            closeElement();
            return html.join('');
        },
    };

    function updateContent() {
        var elements = document.querySelectorAll('image-gallery');
        if (elements.length > 0) {
            Array.prototype.forEach.call(elements, function(el) {
                updateElements.imageGallery(el);
            });
            loadPlugin('imageGallery');
        }

        var event;
        if (typeof(Event) === 'function') {
            event = new Event('app:contentReady'); // Modern Browsers
        } else {
            event = document.createEvent('Event'); // IE 11
            event.initEvent('app:contentReady', true, true);
        }
        document.dispatchEvent(event);
    }

    function loadPlugin(name) {
        var validPlugins = ['filter', 'sort', 'imageGallery'];
        if (validPlugins.indexOf(name) === -1) {
            app.showErrorAlert('Unhandled Plugin: ' + name);
            return;
        }
        var url = getRootUrl() + 'plugins/' + name + '.js';
        app.loadScripts(url).then(function() {
            app.plugins[name].reload();
        });
    }

    function defineCustomEvents() {
        app.controls['json-data'].onFetch = function() {
            var jsonData = this;
            app.activeJsControls.forEach(function(control) {
                switch (control.control) {
                    case 'data-table':
                        updateElements.dataTable(control.element);
                        app.loadJsControl(control.element, jsonData);
                        if (control.element.getAttribute('data-sort') !== null) {
                            loadPlugin('sort');
                        }
                        break;
                    case 'data-list':
                        updateElements.dataList(control.element);
                        app.loadJsControl(control.element, jsonData);
                        break;
                }
            });
            updateContent();
        };
    }

    /**
     * Convert routes under <url-hash-router>
     * and <url-router> to standard Framework routes.
     */
    function defineRoutes() {
        var router = document.querySelector('url-hash-router');
        var routeSelector = 'url-hash-route';
        if (router === null) {
            router = document.querySelector('url-router');
            if (router === null) {
                return;
            }
            routeSelector = 'url-route';
            // Required before `app.setup()` is called in order to use
            // History Routes (pushState, popState)
            document.documentElement.setAttribute('data-routing-mode', 'history');
        }

        var routes = router.querySelectorAll(routeSelector);
        var viewIndex = 0;

        Array.prototype.forEach.call(routes, function(route) {
            // Get route [path] and check if default route
            var path = route.getAttribute('path');
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
            if (viewUrl === null) {
                viewUrl = undefined;
                var template = route.querySelector('template');
                if (template === null) {
                    app.showErrorAlert('Unable to setup route:');
                    console.log(route);
                    return;
                }
                if (!template.id) {
                    template.id = 'url-hash-route-template-' + viewIndex + '-' + (new Date()).getTime();
                    viewIndex++;
                }
                viewId = template.id;
            }

            // Add Route as Framework Controller
            app.addController({
                path: path,
                viewId: viewId,
                viewUrl: viewUrl,
                viewEngine: 'Text',
                pageType: 'polyfillPage',
                // modelName: undefined,
                // settings: undefined,
            });
        });

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

    function getRootUrl() {
        /*
        NOTE - In the future several options should be handled:
       		- Page should look for the path of this scirpt:
        		<script type="module" src="js/web-components/polyfill.min.js"></script>
            	- Then based on the path load [js/DataFormsJS.min.js]
            - It could use a [data-*] attribute to specify the root DataFormsJS path
            - Option to use either full dev files [DataFormsJS.js] or production files [DataFormsJS.min.js]
                This will apply to all DataFormsJS Scripts.
            - The current value will be the fallback if no other root URL is found.
        */
        return 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/';
    }

    function loadPagePlugins() {
        // Testing Example, this should be based on content from the actual page
        var scripts = [
            getRootUrl() + 'controls/data-table.js',
            // Currently a custom version of [json-data.js] is required with a few extra
            // lines of code. If the Polyfill will be publish then this update and similar
            // updates will be made. Use a diff program to see and merge the changes.
            //
            // getRootUrl() + 'controls/json-data.js',
            'https://dataformsjs.s3-us-west-1.amazonaws.com/tmp/concept/json-data.js',
        ];
        app.loadScripts(scripts).then(function() {
            app.addPage('polyfillPage', polyfillPage);
            app.addControl('data-list', dataList);
            defineCustomEvents();
            defineRoutes();
            noRoutingSetup();
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        var url = getRootUrl() + 'DataFormsJS.js';
        loadScript(url, function () {
            // Based on Polyfill Logic from DataFormsJS
            var condition = (Array.from && window.Promise && window.fetch && Promise.prototype.finally ? true : false);
            app.loadScript(condition, app.settings.polyfillUrl, loadPagePlugins);
        });
    });
})();
