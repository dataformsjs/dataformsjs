/*
    This is an early proof of concept to polyfill DataFormsJS Web Components.
    
    See topic: "Create a Polyfill for Web Components"
    In file [../to-do-list.txt]
        https://github.com/dataformsjs/dataformsjs/blob/master/docs/to-do-list.txt

    If this is fully developed many additional items will need to be handled.
    For example [app.setup()] converts <template> to <script type="text/x-template">
    for IE however a function will likely need to be created so it can be handled
    each time a route template is downloaded.

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
*/

/* global app */
/* jshint strict: true */

(function () {
    'use strict';
    
    // Update specific Web Components to use DataFormsJS Framework Plugins, Controls, etc
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
        dataList: function(element) {
            var source = element.getAttribute('data-bind'); 
            element.setAttribute('data-source', source);
            var tmpl = element.getAttribute('template-selector'); 
            element.setAttribute('data-template-selector', tmpl);
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

    var polyfillPage = {
        model: {},
		// onRouteLoad: function() { },
		// onBeforeRender: function() { },
		onRendered: function() {
            app.unloadAllJsControls();
            
            var controls = document.querySelectorAll('[data-control]');
            Array.prototype.forEach.call(controls, function(control) {
                switch (control.getAttribute('data-control')) {
                    case 'json-data':
                        updateElements.jsonData(control);
                        break;
                    case 'data-table':
                        updateElements.dataTable(control);
                        break;
                    // case 'data-list':
                    //     updateElements.dataList(control);
                    //     break;
				}
            });
            
            var elements = document.querySelectorAll('[is]');
            Array.prototype.forEach.call(elements, function(element) {
                switch (element.getAttribute('is')) {
                    case 'input-filter':
                        updateElements.inputFilter(element);
                        break;
                }
            });
            
            app.loadAllJsControls();
        },
		// onRouteUnload: function() { },
    };
    
    function defineCustomEvents() {
        app.controls['json-data'].onFetch = function() {
            var jsonData = this;
            app.activeJsControls.forEach(function(control) {
                if (control.control === 'data-table') {
                    updateElements.dataTable(control.element);
                    app.loadJsControl(control.element, jsonData);
                    if (control.element.getAttribute('data-sort') !== null) {
                        app.plugins.sort.reload();
                    }
                } /*else if (control.control === 'data-list') {
                    updateElements.dataList(control.element);
                    app.loadJsControl(control.element, jsonData);
                } */
            });
        };
    }

    // Convert routes under <url-hash-router> to standard Framework routes.
    // Additionally the <url-router> would need to be handled
    // for pushState routes as well as non-SPA sites.
    function defineHashRoutes() {
        var urlHashRouter = document.querySelector('url-hash-router');
        if (!urlHashRouter) {
            return;
        }

        var urlHashRoutes = urlHashRouter.querySelectorAll('url-hash-route');
        var viewIndex = 0;

        Array.prototype.forEach.call(urlHashRoutes, function(route) {
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

            app.addController({
                path: route.getAttribute('path'),
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
    
    function noRoutingSetup() {
        // Exit if the page contains a router
        var urlHashRouter = document.querySelector('url-hash-router, url-router');
        if (urlHashRouter) {
            return;
        }
        
        app.activeModel = {};
        app.onUpdateViewComplete = function(source) {
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

    function loadPagePlugins() {
        // Testing Example, this should be based on content from the actual page
        var scripts = [
            'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/controls/data-table.js',
            // Currently a custom version of [json-data.js] is required with a few extra
            // lines of code. If the Polyfill will be publish then this update and similar
            // updates will be made. Use a diff program to see and merge the changes.
            //
            // 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/controls/json-data.js',
            'https://dataformsjs.s3-us-west-1.amazonaws.com/tmp/concept/json-data.js',
            //
            // NOTE - all [data-list] is currently commented out as it's not ready
            //
            // 'data-list.js',
            'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/plugins/dataBind.js',
            'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/plugins/filter.js',
            'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/plugins/sort.js',
            // 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/plugins/imageGallery.js',
        ];
        app.loadScripts(scripts).then(function() {
            app.addPage('polyfillPage', polyfillPage);
            defineCustomEvents();
            defineHashRoutes();
            noRoutingSetup();
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        /*
        NOTE - In the future several options should be handled:
       		- Page should look for existin known components:
        		<script type="module" src="js/web-components/url-hash-router.min.js"></script>
            	- Then based on the path load [js/DataFormsJS.min.js]
            - It could check if [window.DataFormsJS] is already loaded (optional, to be considered)
            - It could use a [data-*] attribute to specify the root DataFormsJS path
            - Option to use either full dev files [DataFormsJS.js] or production files [DataFormsJS.min.js]
            	This will apply to all DataFormsJS Scripts.
        */

        var url = 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/DataFormsJS.js';
        loadScript(url, function () {
            // Based on Polyfill Logic from DataFormsJS
            var condition = (Array.from && window.Promise && window.fetch && Promise.prototype.finally ? true : false);
            app.loadScript(condition, app.settings.polyfillUrl, loadPagePlugins);
        });
    });
})();
