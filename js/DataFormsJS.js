/**
 * DataFormsJS Framework Application Object
 *
 * This script creates a global [DataFormJS] object which can also be
 * referenced as [app]. One or more optional template rending engines are the
 * only dependencies. In most apps the core [jsonData] page object from file
 * [pages/jsonData.js] will also be included. DataFormsJS Framework uses
 * ES5 syntax so that it can work with all browsers including older
 * Mobile Devices and supported versions of IE. For older browsers and
 * devices functions [fetch, Promise, etc] will be loaded as polyfill
 * functions when the page is loaded.
 *
 * View Engine Options:
 *     https://handlebarsjs.com
 *     https://vuejs.org
 *     https://mozilla.github.io/nunjucks/
 *     https://underscorejs.org
 *
 * In addition to the standard DataFormsJS Framework standalone classes for
 * React and Web Components are available which provide similar functionality.
 *
 * Copyright Conrad Sollitt and Authors. For full details of copyright
 * and license, view the LICENSE file that is distributed with DataFormsJS.
 *
 * @link     https://www.dataformsjs.com
 * @author   Conrad Sollitt (http://www.conradsollitt.com)
 * @license  MIT
 */

/* Validates with both [jshint] and [eslint] */
/* global Handlebars, nunjucks, _, Vue, Promise */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* eslint no-prototype-builtins: "off" */

(function () {
    'use strict'; // Invoke strict mode

    // Object for Enum
    var ViewEngines = {
        NotSet: 'Not Set',
        Unknown: 'Unknown',
        Mixed: 'Mixed',
        Handlebars: 'Handlebars',
        Vue: 'Vue',
        Nunjucks: 'Nunjucks',
        Underscore: 'Underscore',
        Text: 'Text',
    };

    // Private variables available to this function scope only
    var viewEngine = ViewEngines.NotSet;
    var validViewEngines = [
        ViewEngines.Handlebars,
        ViewEngines.Vue,
        ViewEngines.Nunjucks,
        ViewEngines.Underscore,
        ViewEngines.Text,
    ];
    var isUpdatingView = false;
    var isUpdatingAllControls = false;
    var isLoadingRoute = false;
    var previousUrl = null;
    var routeLoadingCount = 0;
    var renderInterval = null;
    var vueUpdateView = false;
    var vueWatcherDepPrevLen = 0;
    var isIE = (navigator.userAgent.indexOf('Trident/') !== -1);
    var routingMode = null;

    function validateTypeOf(value, typeName, propName, callingFunction) {
        if (typeof value !== typeName) {
            console.log(value);
            throw new TypeError('[' + propName + '] was not defined as a ' + typeName + ' when the function ' + callingFunction + ' was called');
        }
    }

    function validateObjectExists(value, propName, callingFunction) {
        if (value === undefined) {
            throw new TypeError('[' + propName + '] must first be defined before the function ' + callingFunction + ' is called');
        } else if (typeof value !== 'object') {
            console.log(value);
            throw new TypeError('[' + propName + '] was not defined as an object when the function ' + callingFunction + ' was called');
        }
    }

    function validateStringWithValue(value, propName, callingFunction) {
        if (value === '') {
            throw new TypeError('[' + propName + '] must have a value when defined when the function ' + callingFunction + ' is called');
        }
    }

    function requireUndefinedProperty(object, objName, property) {
        if (object[property] !== undefined) {
            console.log(object);
            throw new TypeError('[' + objName + '.' + property + '] is already defined');
        }
    }

    function validateOptionalFunctions(obj, objName, objType, func) {
        for (var n = 0, m = func.length; n < m; n++) {
            if (obj[func[n]] !== undefined) {
                if (typeof obj[func[n]] !== 'function') {
                    console.log(obj);
                    throw new TypeError(objType + '[' + objName + '].' + func[n] + ' is not defined as a function.');
                }
            }
        }
    }

    function requireOneNamedProperty(obj, objName, objType, props) {
        for (var n = 0, m = props.length; n < m; n++) {
            if (obj[props[n]] !== undefined && obj[props[n]] !== null) {
                return;
            }
        }
        // If code execution makes it here the object is not valid
        console.log(obj);
        throw new TypeError(objType + '[' + objName + '] must have one of the following properties defined: ' + props.join(', '));
    }

    function validateElementExists(id, propName, callingFunction) {
        if (document.getElementById(id) === null) {
            throw new TypeError('An element was not found on the page with [' + propName + '][id=' + id + '] when the function ' + callingFunction + ' was called');
        }
    }

    /**
     * Private function used when rendering template errors. It creates a prefix
     * for the error message that is relevant to the control had the error.
     *
     * @param {HTMLElement|null} element   If the source of the error was from an HTML element
     * @param {object|null} controller     If the source of the error was from a controller
     */
    function getTemplateErrorPrefix(element, controller) {
        var errorMessage = '';
        try {
            // Where was the error from? A Control or an HTML Element?
            if (controller !== null && controller.path) {
                errorMessage = 'Error with [Controller.path = "' + controller.path + '"] - ';
            } else if (element !== null && element instanceof HTMLElement) {
                // If a HTML Element then get the attributes [data-template-id]
                // and [data-template-url]
                var attrId = element.getAttribute('data-template-id');
                var attrUrl = element.getAttribute('data-template-url');
                attrId = (attrId === null ? '' : ' data-template-id="' + attrId + '"');
                attrUrl = (attrUrl === null ? '' : ' data-template-url="' + attrUrl + '"');

                // Include [id] and [class] attributes along with the relevant data attributes.
                errorMessage = 'Error with Element <' + element.tagName.toLowerCase();
                errorMessage += ' id="' + element.id + '"';
                errorMessage += ' class="' + element.className + '"';
                errorMessage += attrId + attrUrl + '> - ';
            }
            return errorMessage;
        } catch (e) {
            console.error(e);
            return errorMessage;
        }
    }

    // Used by [app.showError] and [app.showErrorAlert]
    function createElement(type, textContent, className) {
        var el = document.createElement(type);
        el.textContent = textContent;
        if (className) {
            el.className = className;
        }
        return el;
    }

    // Use to handle Vue Errors and Warnings. If a rendering error
    // occurs the main View Element can end up being removed from the
    // screen so this function handles it.
    function showVueError(err, viewEl) {
        // Wait half a second, this is not ideal but documented Vue functions
        // do not appear to provide a callback to handle this.
        console.error(err);
        window.setTimeout(function () {
            // Attach view element back to DOM if if was removed.
            if (viewEl) {
                if (viewEl.parentNode === null) {
                    var docEl = document.querySelector('body');
                    if (!docEl) {
                        docEl = document.documentElement;
                    }
                    docEl.appendChild(viewEl);
                    // Update active template so error shows again otherwise the
                    // view will disappear if a rendering error is view again for
                    // the same controller.
                    if (app.activeTemplate) {
                        app.activeTemplate.error = true;
                        app.activeTemplate.errorMessage = err.toString();
                    }
                }
            }
            // Show Error
            app.showError(viewEl, err);
        }, 500);
    }

    /**
     * Read or download and then compiles a template. This function is optimized so
     * if an existing template is already compiled then it will not be compiled twice.
     *
     * @param {HTMLElement|null} element    Element where the template was called from
     * @param {object|null} controller      Controller object
     * @param {function} callback           Callback function(template) that gets called once the template is compiled
     */
    function compileTemplate(element, controller, callback) {
        var script = null,
            scriptUrl = null,
            n,
            m,
            errorMessage = null,
            templateId = null,
            templateUrl = null,
            templateEngine = null;

        // Use Template ID if loading template embedded on the page or Template URL to download a new template
        if (controller === null) {
            templateId = element.getAttribute('data-template-id');
            templateUrl = element.getAttribute('data-template-url');
            if (app.activeController !== null) {
                templateEngine = app.activeController.viewEngine;
            }
        } else {
            // Get Controller Settings
            templateId = controller.viewId;
            templateUrl = controller.viewUrl;
            if (controller.viewEngine !== undefined) {
                templateEngine = controller.viewEngine;
            }

            // Make sure they are null. This would only happen if calling code
            // redefines controller properties after they have been added.
            if (templateId === undefined) {
                templateId = null;
            }
            if (templateUrl === undefined) {
                templateUrl = null;
            }

            // Validate Propeties. The only way that these error can happen is if the controller is
            // modified manually after calling addController() so these error would not be common.
            if (templateId !== null && templateUrl !== null) {
                errorMessage = 'A controller must have either [viewId] or [viewUrl] defined but not both properties. This error is not possible when calling the [addController()] so one or more of the properties were modified by JavaScript code after the controller was already added.';
                callback(addTemplate(null, templateId, templateUrl, templateEngine, true, errorMessage));
                return;
            } else if (templateId === null && templateUrl === null) {
                // Check if the controller being rendered only uses functions
                // and not a template engine. If so then pass null to the callback.
                if (typeof controller.onRouteLoad === 'function' ||
                    typeof controller.onBeforeRender === 'function' ||
                    typeof controller.onRendered === 'function') {
                    callback(null);
                    return;
                }

                // Missing required properties or functions
                errorMessage = 'A controller must have either [viewId] or [viewUrl] defined but neither property is defined. This error is not possible when calling the [addController()] so one or more of the properties were modified by JavaScript code after the controller was already added.';
                callback(addTemplate(null, templateId, templateUrl, templateEngine, true, errorMessage));
                return;
            }
        }

        // First check the template cache in case it has already been compiled
        for (n = 0, m = app.compiledTemplates.length; n < m; n++) {
            if (templateId !== null && app.compiledTemplates[n].id === templateId) {
                callback(app.compiledTemplates[n]);
                return;
            } else if (templateUrl !== null && app.compiledTemplates[n].url === templateUrl) {
                callback(app.compiledTemplates[n]);
                return;
            }
        }

        // If the template was not found from cached array, compile it and add it to the compiledTemplates Array.

        // Determine download settings or read from <script> on screen
        if (templateUrl !== null) {
            scriptUrl = templateUrl;
            // Unless defined from the controller property [viewEngine] the current
            // View Engine will be used for the downloaded template.
            if (templateEngine === null) {
                templateEngine = viewEngine;
            }
        } else {
            // Get the <script> element that contains either a template
            // or a reference of a template to download from the [src] URL.
            script = document.getElementById(templateId);

            // Make sure the element exists
            if (script === null) {
                errorMessage = 'Script Tag for Template ID [' + templateId + '] does not exist.';
                callback(addTemplate(element, templateId, templateUrl, templateEngine, true, errorMessage));
                return;
            }

            // Check if it has [src] or [data-src] attributes
            scriptUrl = (script.src ? script.src : script.getAttribute('data-src'));
            templateEngine = app.getTemplateType(script);
        }

        // Is the the view engine of the current template different than the default view engine?
        // Is so then change the current to match the view being compiled so that any downloaded
        // controls from the view engine will use the same template engine.
        if (templateEngine !== viewEngine && validViewEngines.indexOf(templateEngine) !== -1) {
            viewEngine = templateEngine;
        }

        if (scriptUrl !== null && scriptUrl !== '') {
            // Make the Request to get the Template then compile
            app
            .fetch(scriptUrl, null, 'text/plain')
            .then(function(text) {
                callback(addTemplate(null, templateId, templateUrl, templateEngine, false, text));
            })
            .catch(function(error) {
                console.error(error);
                var errorMessage = 'Error Downloading Template: [' + scriptUrl + '], Error: ' + error;
                callback(addTemplate(null, templateId, templateUrl, templateEngine, true, errorMessage));
            });
        } else {
            // This source of this template is inline in the HTML of the page
            callback(addTemplate(script, templateId, templateUrl, templateEngine, false, script.innerHTML));
        }
    }

    /**
     * Adds a template to the compiledTemplates Array. This function
     * only gets called from [compileTemplate()].
     *
     * @param {HTMLElement|null} script
     * @param {string|null} templateId
     * @param {string|null} templateUrl
     * @param {string} engineType
     * @param {bool} isError
     * @param {string} sourceCode
     * @return {function} Compiled Template
     */
    function addTemplate(script, templateId, templateUrl, engineType, isError, sourceCode) {
        var fn = null,
            html = null,
            compileError = false,
            errorMessage = null;

        if (!isError) {
            try {
                // Use the specified Template Engine to Compile the
                // Text Source Code into a JavaScript Function
                switch (engineType) {
                    case ViewEngines.Handlebars:
                        fn = Handlebars.compile(sourceCode);
                        break;
                    case ViewEngines.Nunjucks:
                        if (app.nunjucksEnvironment) {
                            fn = nunjucks.compile(sourceCode, app.nunjucksEnvironment);
                        } else {
                            fn = nunjucks.compile(sourceCode);
                        }
                        break;
                    case ViewEngines.Underscore:
                        fn = _.template(sourceCode);
                        break;
                    case ViewEngines.Text:
                    case ViewEngines.Vue:
                        html = sourceCode;
                        break;
                    default:
                        if (script === null) {
                            throw new TypeError('Unsupported or Unknown Template View Engine when the Template was downloaded. Template type at the time of downloading = ' + engineType);
                        } else {
                            throw new TypeError('Unsupported or Unknown Template View Engine specified in <script id="' + script.id + '" type="' + script.type + '" data-engine="' + script.getAttribute('data-engine') + '">');
                        }
                }
            } catch (e) {
                fn = null;
                html = null;
                compileError = true;
                errorMessage = e;
            }
        }

        // Create a Template Object and add it to the compiledTemplates Source
        var template = {
            id: templateId,
            url: templateUrl,
            type: engineType,
            engine: fn,
            html: html,
            error: isError || compileError,
            errorMessage: (isError ? sourceCode : errorMessage)
        };
        app.compiledTemplates.push(template);
        return template;
    }

    /**
     * Render a compiled template to an HTML Element
     *
     * @param {HTMLElement} element   Element that the template gets rendered to
     * @param {object} controller     Controller Object, this is used for debug text in the event of a rendering error
     * @param {Object} template       Template object from the compiledTemplates Array
     * @param {object} model          Data Context for the template
     */
    function renderTemplate(element, controller, template, model) {
        // Declare Variables
        var html = '';

        // Catch Exceptions
        try {
            // Show error if the Template had a compile or download error
            if (template.error) {
                app.showError(element, getTemplateErrorPrefix(element, controller) + template.errorMessage);
                return;
            }

            // No error, render the template based on the sepecified template engine
            switch (template.type) {
                case ViewEngines.Handlebars:
                case ViewEngines.Underscore:
                    html = template.engine(model);
                    break;
                case ViewEngines.Nunjucks:
                    html = template.engine.render(model);
                    break;
                case ViewEngines.Text:
                case ViewEngines.Vue:
                    html = template.html;
                    break;
                default:
                    // In most cases code execution will likely never reach here as these
                    // type of errors would be handled before they make it this far.
                    // This error can happen if an already compiled template is modified
                    // after being defined. This is confirmed with a unit test.
                    throw new TypeError('Unsupported or Unknown Template View Engine: ' + template.type);
            }

            // Set HTML of the Element (View or Control)
            var setTextContent = element.getAttribute('data-set-text-content');
            if (setTextContent === null) {
                element.innerHTML = html;
            } else {
                element.textContent = html;
            }
        } catch (e) {
            // If there was an error (for example a parsing error from Handlebars or Nunjucks) then
            // get template error info that is helpful for the developer and show it along with the
            // error text in the element.
            app.showError(element, getTemplateErrorPrefix(element, controller) + e);
        }
    }

    /**
     * Render the view or call functions based on the URL hash.
     * Called from [app.setup()] and the window [hashchange] event.
     */
    function handleRouteChange() {
        var path = (routingMode === 'hash' ? window.location.hash : window.location.pathname),
            controller = null,
            n,
            m,
            prop,
            defaultIndex = -1,
            routeResult,
            error,
            plugin;

        // Handle race conditions where this function is called while the previous page
        // is still loading or rendering. Typically this only causes errors on routes
        // that use a lot of custom JavaScript and the route’s web services (or resources)
        // are loading slowly and the user is clicking from page to page very fast.
        // This is not unit tested, rather uncomment the [console.log] statements
        // and for slow resources. For example, using code in 'website\app\app.php'
        // [$app->get('/*' ...] and running this script with the local site.
        if (routeLoadingCount > 200) {
            app.showErrorAlert(app.settings.errors.pageLoading);
            routeLoadingCount = 0;
            isLoadingRoute = false;
            return;
        }
        if (isLoadingRoute) {
            if (previousUrl === path) {
                return; // Still loading same route
            }
            // console.log('***** isLoadingRoute=true *****');
            window.setTimeout(handleRouteChange, 200);
            routeLoadingCount++;
            return;
        }
        if (isUpdatingView) {
            if (previousUrl === path) {
                return; // Still rendering same route
            }
            // console.log('***** isUpdatingView=true *****');
            window.setTimeout(handleRouteChange, 200);
            routeLoadingCount++;
            return;
        }
        isLoadingRoute = true;
        routeLoadingCount = 0;
        previousUrl = path;

        // Is # the first character? If yes remove it
        if (path.indexOf('#') === 0) {
            path = path.substr(1);
        }

        // Define as root url ('/') if blank
        if (path === '') {
            path = '/';
        }

        // Make sure all loaded JS Controls are unloaded
        app.unloadAllJsControls();

        // Handle [onRouteUnload] functions for the previous route
        if (app.activeController !== null) {
            // Unload Plugins
            for (plugin in app.plugins) {
                if (app.plugins.hasOwnProperty(plugin) && app.plugins[plugin].onRouteUnload !== undefined) {
                    try {
                        app.plugins[plugin].onRouteUnload();
                    } catch (e) {
                        app.showErrorAlert('Error from Plugin [' + plugin + '] on [onRouteUnload()]: ' + e.toString());
                        console.error(e);
                    }
                }
            }
            // Unload Controller
            // When using Vue [onRouteUnload()] is called on the Vue instance [beforeDestroy()]
            if (app.activeController.onRouteUnload !== undefined && app.activeVueModel === null && app.viewEngine() !== 'Vue') {
                try {
                    app.activeController.onRouteUnload.apply(app.activeModel, app.activeParameters);
                } catch (e) {
                    app.showErrorAlert('Error from Controller [path=' + app.activeController.path + '] on [onRouteUnload()]: ' + e.toString());
                    console.error(e);
                }
            }
        }

        // Destroy the Vue View Model
        if (app.activeVueModel !== null) {
            app.activeVueModel.$destroy();
            // Convert data from the Vue Instance to a plain JavaScript Object
            // and save it back to the models object.
            if (app.activeController && app.activeController.modelName && app.models[app.activeController.modelName] && app.activeVueModel.$data) {
                app.models[app.activeController.modelName] = JSON.parse(JSON.stringify(app.activeVueModel.$data));
            }
        }

        // Clear the Current Route
        app.activeController = null;
        app.activeTemplate = null;
        app.activeModel = null;
        app.activeVueModel = null;
        app.activeParameters = [];
        app.activeParameterList = {};
        vueWatcherDepPrevLen = 0;
        vueUpdateView = false;

        // Find matching controller for the hash or get default if not match
        for (n = 0, m = app.controllers.length; n < m; n++) {
            routeResult = app.routeMatches(path, app.controllers[n].path);
            if (routeResult.isMatch) {
                controller = app.controllers[n];
                app.activeParameters = routeResult.args;
                app.activeParameterList = routeResult.namedArgs;
                break;
            } else if (app.controllers[n].path === app.settings.defaultRoute) {
                defaultIndex = n;
            }
        }

        // Route not found, redirect to the default
        if (controller === null && defaultIndex !== -1) {
            // If the default path is a page for a specific language and the
            // i18n plugin is being used then redirect to the default language.
            var newPath = app.settings.defaultRoute;
            if (app.settings.defaultRoute === '/:lang/' &&
                app.plugins.i18n !== undefined &&
                typeof app.plugins.i18n.readSettings === 'function'
            ) {
                app.plugins.i18n.readSettings();
                // First check if any of the supported languages match a user's language.
                // These are the languages sent with the Request 'Accept-Language' header.
                var langMatched = false;
                if (navigator.languages && navigator.languages.length &&
                    app.plugins.i18n.supportedLocales && app.plugins.i18n.supportedLocales.length
                ) {
                    for (n = 0, m = navigator.languages.length; n < m; n++) {
                        if (app.plugins.i18n.supportedLocales.indexOf(navigator.languages[n]) !== -1) {
                            newPath = '/' + navigator.languages[n] + '/';
                            langMatched = true;
                            break;
                        }
                    }
                }
                // No language matched, use default for the site if defined
                if (!langMatched && app.plugins.i18n.defaultLocale) {
                    newPath = '/' + app.plugins.i18n.defaultLocale + '/';
                }
            }
            app.changeRoute(newPath);
            isLoadingRoute = false;
            return;
        }

        // Route found or No Controllers or No Default Route
        if (controller === null) {
            // No controllers so SPA is not being used, render/load Controls and call Plugins
            if (app.controllers.length === 0) {
                app.updateView();
                isLoadingRoute = false;
                return;
            }
            // Show error that happens only if there is an invalid default route.
            if (path !== app.settings.defaultRoute) {
                error = 'Error - The route [' + path + '] does not have a <script data-route> element or [Controller] defined. Check to make sure that a controller or script for default route [' + app.settings.defaultRoute + '] exists.';
                app.showError(document.querySelector(app.settings.viewSelector), error);
            }
            isLoadingRoute = false;
        } else {
            // Set active controller/route and load both controller and model
            app.activeController = controller;
            loadController(controller, function () {
                loadModel(controller);

                // Assign named parameters to the active model
                for (prop in app.activeParameterList) {
                    if (app.activeParameterList.hasOwnProperty(prop)) {
                        app.activeModel[prop] = app.activeParameterList[prop];
                    }
                }

                // Compile and set the active Template then load the view
                compileTemplate(null, controller, function(template) {
                    var fn = [],
                        fnName = [],
                        fnIndex = 0,
                        fnCount = 0;

                    // Private function to load the route/controller after plugins run
                    function routeLoad() {
                        // Set active template and call controller route load method
                        app.activeTemplate = template;
                        if (controller.onRouteLoad !== undefined && app.activeController && app.activeController.viewEngine !== ViewEngines.Vue) {
                            try {
                                controller.onRouteLoad.apply(app.activeModel, app.activeParameters);
                            } catch (e) {
                                app.showErrorAlert('Error from Controller [path=' + controller.path + '] on [onRouteLoad()]: ' + e.toString());
                                console.error(e);
                            }
                        }
                        // Reset scroll position and render the view
                        window.scrollTo(0, 0);
                        app.updateView();
                        isLoadingRoute = false;
                    }

                    // Recursive function that gets called if using plugins with
                    // [onRouteLoad]. Only one function runs at a time and must finish
                    // before the next one is called. Each plugin must handle the
                    // [next()] callback otherwise the view will never be rendered.
                    // If a plugin calls [next(false)] then the route will not be loaded;
                    // this would be used for cases where the route sets [window.location].
                    function nextPlugin() {
                        try {
                            var plugin = fnName[fnIndex];
                            plugin = app.plugins[plugin];
                            fn[fnIndex].call(plugin, (function(loadRoute) {
                                if (loadRoute === false) {
                                    isLoadingRoute = false;
                                    return;
                                }
                                fnIndex++;
                                if (fnIndex === fnCount) {
                                    routeLoad();
                                } else {
                                    nextPlugin();
                                }
                            }));
                        } catch (e) {
                            app.showErrorAlert('Error from Plugin [' + fnName[fnIndex] + '] on [onRouteLoad()]: ' + e.toString());
                            console.error(e);
                            app.updateView();
                            isLoadingRoute = false;
                        }
                    }

                    // Build a list of Plugin [onRouteLoad] functions and call the first one,
                    // or if no plugins have an [onRouteLoad] then render the view.
                    for (var plugin in app.plugins) {
                        if (app.plugins.hasOwnProperty(plugin) && app.plugins[plugin].onRouteLoad !== undefined) {
                            fn.push(app.plugins[plugin].onRouteLoad);
                            fnName.push(plugin);
                        }
                    }
                    fnCount = fn.length;
                    if (fnCount === 0) {
                        routeLoad();
                    } else {
                        nextPlugin();
                    }
                });
            });
        }
    }

    /**
     * Load the controller after the route changes. This function handles
     * [data-lazy-load] (controller.settings.lazyLoad) to download any
     * needed JS and CSS scripts before the controller is used.
     *
     * @param {object} controller
     * @param {function} callback
     */
    function loadController(controller, callback) {
        // Controller does not use lazy loading so finish loading it immediately.
        if (controller.settings === undefined || controller.settings.lazyLoad === undefined) {
            setControllerFromPage(controller);
            callback();
            return;
        }

        // Show loading screen while the scripts are being loaded. Scripts should load
        // quick but on mobile devices a delay of 1 second makes the page looks like it
        // is not being loaded. This code displayed the loading view, however only
        // simple templates embedded on the page can be used.
        if (app.settings.lazyLoadingViewSelector !== null) {
            var view = document.querySelector(app.settings.viewSelector);
            var tmpl = document.querySelector(app.settings.lazyTemplateSelector);
            if (view && tmpl) {
                if (tmpl.tagName === 'TEMPLATE' || (tmpl.tagName === 'SCRIPT' && tmpl.getAttribute('data-engine') === 'text')) {
                    view.innerHTML = tmpl.innerHTML;
                } else {
                    console.warn('Unable to show loading screen from [app.settings.lazyTemplateSelector]. Only <template> tags are allowed.');
                }
            }
        }

        // Items to load are comma delimited, for each item add a promise
        // to load the related scripts defined from [app.lazyLoad].
        var lazyLoad = controller.settings.lazyLoad;
        var routeScripts = lazyLoad.split(',').map(function(s) { return s.trim(); });
        var promises = [];
        routeScripts.forEach(function(script) {
            promises.push(app.loadScripts(app.lazyLoad[script]));
        });

        // Once all scripts are downloaded then finish loading the controller.
        Promise.all(promises).finally(function () {
            setControllerFromPage(controller);
            callback();
        });
    }

    /**
     * Setup Controller functions from the page object the first time
     * that the controller is used.
     *
     * @param {object} controller
     */
    function setControllerFromPage(controller) {
        if (controller.pageType !== null && controller.pageType !== undefined && controller._pageCopied === undefined) {
            // Validate
            var error = null;
            if (app.pages[controller.pageType] === undefined) {
                error = 'The page [' + controller.pageType + '] has not been loaded for Controller[path=' + controller.path + '].';
            } else if (typeof app.pages[controller.pageType].model !== 'object') {
                error = 'Error - The [model] property for page object [' + controller.pageType + '] must be a valid JavaScript Object.';
            }
            if (error !== null) {
                controller.settings = controller.settings || {};
                controller.settings.errorMessage = error;
                controller.settings.hasError = true;
                app.showErrorAlert(error);
                return;
            }

            // Update controller with all functions from the page object
            var page = app.pages[controller.pageType];
            for (var prop in page) {
                if (page.hasOwnProperty(prop) && typeof page[prop] === 'function') {
                    controller[prop] = page[prop];
                }
            }

            // Define variable so this runs only once per controller
            controller._pageCopied = true;
        }
    }

    /**
     * Load the [app.activeModel] based on the controller
     * @param {object} controller
     */
    function loadModel(controller) {
        var model,
            modelName,
            page;

        // Set active model and exit if it already exists
        if (controller.modelName) {
            app.activeModel = app.models[controller.modelName];
            return;
        }

        // If Page Type is defined then create a dynamic model from the Page Object
        if (controller.pageType) {
            page = app.pages[controller.pageType];
            if (page !== undefined) {
                // Create the model and assign the new model name to the controller
                // For Vue, properties are assigned to the model and functions are
                // assigned to a controller [methods] object.
                if (controller.viewEngine === ViewEngines.Vue) {
                    model = {};
                    controller.methods = (controller.methods === undefined ? {} : controller.methods);
                    for (var prop in page.model) {
                        if (page.model.hasOwnProperty(prop)) {
                            var propType = Object.prototype.toString.call(page.model[prop]);
                            if (propType === '[object Function]') {
                                controller.methods[prop] = page.model[prop];
                            } else if (propType === '[object Object]') {
                                model[prop] = app.deepClone({}, page.model[prop]);
                            } else if (propType === '[object Array]') {
                                model[prop] = app.deepClone([], page.model[prop]);
                            } else {
                                model[prop] = page.model[prop];
                            }
                        }
                    }
                } else {
                    model = app.deepClone({}, page.model);
                }
            }
        }

        // Copy Controller Settings to the Model Object
        if (controller.settings !== undefined && Object.keys(controller.settings).length > 0) {
            if (model === undefined) {
                model = {};
            }
            app.deepClone(model, controller.settings);
        }

        // Save Model to App unless [model.loadOnlyOnce] is defined and set to false
        if (model && model.loadOnlyOnce !== false) {
            // Create a dynamic model name (e.g.: 'model_0_JsonData')
            if (controller.pageType === null || controller.pageType === undefined) {
                modelName = 'Dynamic';
            } else {
                modelName = controller.pageType;
                modelName = modelName.substring(0, 1).toUpperCase() + modelName.substring(1);
            }
            modelName = 'model_' + String(Object.keys(app.models).length) + '_' + modelName;

            // Add Model
            app.addModel(modelName, model);
            controller.modelName = modelName;
        }

        // Set the active model or create a temporary one for the page
        if (controller.modelName) {
            app.activeModel = app.models[controller.modelName];
        } else {
            app.activeModel = (model === undefined ? {} : model);
        }
    }

    /**
     * Private function used to handle global errors when [app.handleGlobalErrors(true)]
     * is called or if attribute <html data-show-errors> is defined.
     *
     * Code modified from:
     *     https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
     *
     * @param {ErrorEvent} errorEvent
     */
    function errorHandler(errorEvent) {
        // Current Time
        var now = (new Date());
        var time = ('toLocaleString' in now ? now.toLocaleString() : now.toString());

        // Build and Show Message
        var message;
        if (errorEvent.message.toLowerCase().indexOf('script error') > -1){
            message = 'Script Error at ' + time + ': See Browser Console for Detail';
        } else {
            message = [
                'Message: [' + errorEvent.message + ']',
                'Time: [' + time + ']',
                'URL: [' + errorEvent.filename + ']',
                'Line: ' + errorEvent.lineno,
                'Column: ' + errorEvent.colno,
                'Error Object: ' + JSON.stringify(errorEvent.error)
            ].join(' - ');
        }
        app.showErrorAlert(message);
        console.error(errorEvent);
    }

    // Exit if this script has already been loaded
    if (window.DataFormsJS !== undefined) {
        return;
    }

    /**
     * Create the Application Object
     */
    var app = {
        // Controllers Array
        controllers: [],

        // Models, Pages, etc are plain Objects and used as Dictionaries
        models: {},
        pages: {},
        plugins: {},
        controls: {},
        graphQL: {},
        lazyLoad: {},

        // Locals can be used by a site or app to store shared data between routes
        locals: {},

        // General Settings for DataFormsJS
        settings: {
            defaultRoute: '/',
            viewSelector: '#view',
            logFetchRequests: false, // Used for Unit Testing
            requestHeaders: {},
            requestHeadersByHostName: {},
            fetchOptions: {
                mode: 'cors',
                cache: 'no-store',
                credentials: 'same-origin',
            },
            polyfillUrl: 'https://polyfill.io/v3/polyfill.min.js?features=Array.from,Array.isArray,Array.prototype.find,Object.assign,URL,fetch,Promise,Promise.prototype.finally,String.prototype.endsWith,String.prototype.startsWith,String.prototype.includes,String.prototype.repeat',
            graphqlUrl: null,
            errors: {
                pageLoading: 'Error loading the current page because the previous page is still loading and is taking a long time. Please refresh the page and try again.',
            },
            lazyTemplateSelector: null,
        },

        // References to the active objects and settings of the current view.
        // In most cases only [activeModel, activeVueModel, and activeParameterList]
        // would be used by external code.
        activeController: null,
        activeTemplate: null,
        activeModel: null,
        activeVueModel: null,
        activeParameters: [],
        activeParameterList: {},
        activeJsControls: [],

        // Templates are compiled once and cached to an array
        compiledTemplates: [],

        // App Callback Functions
        // This function is not intended for controllers or plugins but rather
        // can be used by an app for unit testing, debugging, logging, etc.
        onUpdateViewComplete: null,

        // If using Nunjucks Templating this property allows a custom [nunjucks.Environment()]
        // object to be used when the views are rendered. Nunjucks Environment Objects
        // allow for a site to define custom filters and extensions.
        nunjucksEnvironment: null,

        // Error element properties and css.
        // These are added to the DOM only when first used.
        errorClass: 'dataformsjs-error',
        fatalErrorClass: 'dataformsjs-fatal-error',
        errorStyleId: 'dataformsjs-style-errors',
        errorCss: [
            '.dataformsjs-error,.dataformsjs-fatal-error{',
            'color:#fff;',
            'background-color:red;',
            'box-shadow:0 1px 5px 0 rgba(0,0,0,.5);',
            'background-image:linear-gradient(#e00,#c00);',
            // Next line is included but commented out because it should not show on mobile
            // however on desktop with DevTools the commented out version makes it easy for a
            // developer to toggle on errors that use line breaks and white space formatting.
            '/*white-space:pre;*/',
            'text-align:left;',
            '}',

            '.dataformsjs-error{',
            'padding:10px;',
            'font-size:1em;',
            'margin:5px;',
            'display:inline-block;',
            '}',

            '.dataformsjs-fatal-error{',
            'z-index:1000000;',
            'padding:20px;',
            'font-size:1.5em;',
            'margin:20px;',
            'position:fixed;',
            'top:10px;',
            '}',

            '@media only screen and (min-width:1000px){',
            '.dataformsjs-fatal-error{',
            'max-width:1000px;',
            'left:calc(50% - 520px);',
            '}',
            '}',

            '.dataformsjs-fatal-error span{',
            'padding:5px 10px;',
            'float:right;',
            'border:1px solid darkred;',
            'cursor:pointer;',
            'margin-left:10px;',
            'box-shadow:0 0 2px 1px rgba(0,0,0,0.3);',
            'background-image:linear-gradient(#c00,#a00);',
            'border-radius:5px;',
            '}',
        ].join(''),

        // Dynamic CSS for Vue.
        // Vue has built-in support for [v-cloak] but it requires CSS
        // to be added to the page so it is added automatically on setup().
        vueStyleId: 'dataformsjs-style-vue-cloak',
        vueCss: '[v-cloak] { display: none !important; }',

        /**
         * Helper function to convert special characters to HTML entities.
         *
         * Characters escaped are:
         *     & = &amp;
         *     " = &quot;
         *     ' = &#039;
         *     < = &lt;
         *     > = &gt;
         *
         * This is equivalent to the PHP code:
         *     htmlspecialchars($text, ENT_QUOTES, 'UTF-8')
         *
         * @param {string|null|undefined|number} text
         * @return {string|null|undefined|number}
         */
        escapeHtml: function (text) {
            if (text === undefined || text === null || typeof text === 'number') {
                return text;
            }
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        },

        /**
         * Helper function to reduce the amount of code needed for making [fetch]
         * requests with default settings. A Promise Object is returned and [fetch]
         * is called with the following defaults:
         *     mode: 'cors'
         *     cache: 'no-store'
         *     credentials: 'same-origin'
         *     headers: app.getRequestHeaders(url)
         *
         * If an object is passed to [init] then it will be merged and with the
         * default options. If the response code is valid (>= 200 and < 300 or 304)
         * then the content will be read and can be used with with the [then()] function
         * while errors can be handled with [catch()].
         *
         * Depending on the Response [Content-Type] header data will be returned either
         * as [response.json()] or [response.text()]. The optional third-parameter can
         * be used to force a specific [Content-Type] in case the server doesn't send
         * the [Content-Type] field. The default [Content-Type] is assumed to be
         * 'application/json' however specifying 'text/plain' will force a text result.
         *
         * @param {string} url
         * @param {Object|null|undefined} init
         * @param {string} responseType
         * @return {Promise}
         */
        fetch: function(url, init, responseType) {
            // Default options
            var options = app.deepClone({}, app.settings.fetchOptions);
            options.headers = app.getRequestHeaders(url);

            // Merge request params if defined
            if (init) {
                Object.assign(options, init);
                if (init.headers !== undefined) {
                    options.headers = Object.assign({}, app.getRequestHeaders(url), init.headers);
                }
            }

            // IE 11 uses very aggressive caching and the GitHub Fetch Polyfill which is used does
            // not handle it when [cache = 'no-cache'/'no-store'] is used. The workaround it to use
            // a technique known as cache busting. When using IE an a no cache option the URL will
            // have the query string `?_={timestamp}` so that the browser always make a new request
            // rather than load cached JSON data. This applies only to GET and HEAD requests. Regex
            // for `reParamSearch` is from: https://github.com/jquery/jquery/blob/master/src/ajax.js
            if (isIE && (options.method === undefined || options.method === 'GET' || options.method === 'HEAD')) {
                if (options.cache === 'no-store' || options.cache === 'no-cache') {
                    // Search for a '_' parameter in the query string
                    var reParamSearch = /([?&])_=[^&]*/;
                    if (reParamSearch.test(url)) {
                        // If it already exists then set the value with the current time
                        url = url.replace(reParamSearch, '$1_=' + (new Date()).getTime());
                    } else {
                        // Otherwise add a new '_' parameter to the end with the current time
                        var reQueryString = /\?/;
                        url += (reQueryString.test(url) ? '&' : '?') + '_=' + (new Date()).getTime();
                    }
                }
            }

            // Make the request
            return fetch(url, options)
            .then(function(response) {
                // Optionally log fetch requests. This is primarily used for Unit Testing.
                if (app.settings.logFetchRequests && app.events && typeof app.events.dispatch === 'function') {
                    app.events.dispatch('fetch', {
                        url: url,
                        status: response.status,
                    });
                }
                return Promise.resolve(response);
            })
            .then(function(response) {
                // Validate the Response Code Status
                var status = response.status;
                if ((status >= 200 && status < 300) || status === 304) {
                    return Promise.resolve(response);
                } else {
                    var error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
                    return Promise.reject(error);
                }
            })
            .then(function(response) {
                // Default to expect JSON if content type not specified
                var contentType = (responseType === undefined ? 'application/json' : responseType);
                if (response.headers.has('Content-Type')) {
                    contentType = response.headers.get('Content-Type');
                }
                return (contentType.indexOf('application/json') === 0 ? response.json() : response.text());
            });
        },

        /**
         * Return the routing mode. Either 'hash' or 'history'.
         * Defaults to 'hash'. This only gets set to 'history' if the page
         * uses <html data-routing-mode="history"> when it is first loaded.
         *
         * 'hash' routing uses the [hashchange] API while 'history' uses
         * the HTML5 History API. Hash routing works with any page and does't
         * require server side code however History routing typically requires
         * server-side changes and additional JS code which is why 'hash' is
         * the default.
         *
         * @return {string}
         */
        routingMode: function () {
            return routingMode;
        },

        /**
         * Change the route path. When using default hash routing, this does not
         * need to be used. Instead simply set [window.location.hash = '#...'].
         *
         * When using HTML5 History Routing this function calls [window.history.pushState]
         * with the [path] parameter and displays the new route.
         *
         * @param {string} path
         */
        changeRoute: function (path) {
            if (typeof path !== 'string') {
                throw new TypeError('Expected string for app.changeRoute(path)');
            }
            if (routingMode === 'history') {
                window.history.pushState(null, null, path);
                handleRouteChange();
            } else {
                window.location.hash = (path.indexOf('#') === 0 ? path : '#' + path);
            }
        },

        /**
         * Use this function to setup manual HTML5 pushstate links. Be default
         * links that match <a href="/..."> are handled by DataFormsJS, however
         * if you are using the HTML5 History API for routing and setup custom
         * links on this page this function can be used for click events:
         *     link.addEventListener('click', app.pushStateClick);
         *
         * @param {Event} e
         */
        pushStateClick: function (e) {
            // Ignore if user is holding the [ctrl] key so that
            // the link can be opened in a new tab.
            if (e.ctrlKey === true) {
                return;
            }
            // Change route based on the link
            e.preventDefault();
            e.stopPropagation();
            if (e.currentTarget.href) {
                app.changeRoute(e.currentTarget.href);
            } else {
                console.error('app.pushStateClick() called for an unknown link');
            }
            return false;
        },

        /**
         * Add a new unique named page and return the app object.
         *
         * Example:
         *   app.addPage(name:string, {
         *       model:object,
         *       onRouteLoad:function,
         *       onBeforeRender:function,
         *       onRendered:function,
         *       onRouteUnload:function,
         *   })
         *
         * @param {string} name
         * @param {object} page
         * @return {this}
         */
        addPage: function (name, page) {
            // Page Functions - at least one other than [onRouteUnload] is required
            var func = ['onRouteLoad', 'onBeforeRender', 'onRendered', 'onRouteUnload'];

            // Validate that the parameters are correct
            validateTypeOf(name, 'string', 'name', 'app.addPage()');
            validateStringWithValue(name, 'name', 'app.addPage()');
            validateTypeOf(page, 'object', 'page', 'app.addPage()');
            validateOptionalFunctions(page, name, 'page', func);
            func.pop(); // Remove 'onRouteUnload'
            requireOneNamedProperty(page, name, 'page', func);
            validateObjectExists(page.model, 'page.' + name + '.model', 'app.addPage()');
            requireUndefinedProperty(this.pages, 'app.pages', name);

            // Add the page and return the app object
            this.pages[name] = page;
            return this;
        },

        /**
         * Add a new unique named plugin and return the app object.
         *
         * Example:
         *   app.addPlugin(name:string, {
         *       onRouteLoad:function,
         *       onBeforeRender:function,
         *       onRendered:function,
         *       onRouteUnload:function,
         *   })
         *
         * @param {string} name
         * @param {object|function} plugin
         * @return {this}
         */
        addPlugin: function (name, plugin) {
            // Validate Name
            validateTypeOf(name, 'string', 'name', 'app.addPlugin()');
            validateStringWithValue(name, 'name', 'app.addPlugin()');
            requireUndefinedProperty(this.plugins, 'app.plugins', name);

            // Accept either function or full object
            if (typeof plugin === 'function') {
                this.plugins[name] = { onRendered: plugin };
                return this;
            } else {
                // Plugin Functions - at least one other than [onRouteUnload] is required
                var func = ['onRouteLoad', 'onBeforeRender', 'onRendered', 'onRouteUnload'];
                validateTypeOf(plugin, 'object', 'plugin', 'app.addPlugin()');
                validateOptionalFunctions(plugin, name, 'plugin', func);
                func.pop(); // Remove 'onRouteUnload'
                requireOneNamedProperty(plugin, name, 'plugin', func);
            }

            // Add the plugin and return the app object
            this.plugins[name] = plugin;
            return this;
        },

        /**
         * Add a new unique named JavaScript Control and return the app object
         * Names are required to be lower-case and have contain a dash [-].
         * Example:
         *     app.addControl('data-table', ...
         *
         * The reason for the name requirements is because they are
         * used for custom HTML elements and the dash makes it clear
         * which elements are custom when viewing HTML.
         *
         * The concept of JavaScript controls is similar to Web Components;
         * however JavaScript controls are intended for all browsers while
         * Web Components only work in the latest browsers.
         *
         * @param {string} name
         * @param {object} control
         * @return {this}
         */
        addControl: function (name, control) {
            // Validate Control Name
            validateTypeOf(name, 'string', 'name', 'app.addControl()');
            validateStringWithValue(name, 'name', 'app.addControl()');
            if (name !== name.toLowerCase()) {
                throw new TypeError('Control names must be all lower-case. [app.addControl()] was called with: [' + name + ']');
            }
            if (name.indexOf('-') === -1) {
                throw new TypeError('Control names must contain a dash [-] character. [app.addControl()] was called with: [' + name + ']');
            }
            if (name.indexOf(' ') !== -1) {
                throw new TypeError('Control names cannot contain a space. [app.addControl()] was called with: [' + name + ']');
            }
            if (/[&<>"'/]/.test(name) !== false) {
                throw new TypeError('Control names cannot contain HTML characters that need to be escaped. Invalid characters are [& < > " \' /]. [app.addControl()] was called with: [' + name + ']');
            }

            // Validate Control Object
            validateTypeOf(control, 'object', 'control', 'app.addControl()');
            if (control.css !== undefined) {
                validateTypeOf(control.css, 'string', 'control.css', 'app.addControl()');
            }
            var func = ['onLoad', 'html', 'onUnload'];
            requireOneNamedProperty(control, name, 'control', func);
            validateOptionalFunctions(control, name, 'control', func);
            func.pop(); // Remove 'onUnload'
            requireOneNamedProperty(control, name, 'control', func);
            requireUndefinedProperty(this.controls, 'app.controls', name);

            // Add Control and return app object
            this.controls[name] = control;
            return this;
        },

        /**
         * Add a new unique named model object and return the app object.
         *
         * @param {string} name
         * @param {object} model
         * @return {this}
         */
        addModel: function (name, model) {
            // Validate that the parameters are correct
            validateTypeOf(name, 'string', 'name', 'app.addModel()');
            validateStringWithValue(name, 'name', 'app.addModel()');
            validateTypeOf(model, 'object', 'model', 'app.addModel()');
            requireUndefinedProperty(this.models, 'app.models', name);

            // Add the model and return the app object
            this.models[name] = model;
            return this;
        },

        /**
         * Add a new controller and return the app object. Each route (webpage)
         * will have a controller. For most apps controllers will be defined
         * from HTML on the main page. Controller's contain the path so they
         * need to be created before the route can used, however the related page
         * object and model can be created dynamically once the route is used.
         *
         * Example, define a controller from JavaScript based on page object:
         *   app.addController({
         *       path:string,
         *       viewId:string,
         *       viewUrl:string,
         *       viewEngine:string,
         *       pageType:string,
         *       settings:object,
         *   })
         *
         * Additional properties when defining a controller without a page object.
         * At a minimum [path] and one of [viewId], [viewUrl], [onRouteLoad],
         * [onBeforeRender], [onRendered] is required.
         *
         *   app.addController({
         *       modelName:string,
         *       onRouteLoad:function,
         *       onBeforeRender:function,
         *       onRendered:function,
         *       onRouteUnload:function,
         *   })
         *
         * @param {object} controller
         * @return {this}
         */
        addController: function (controller) {
            var func = ['onRouteLoad', 'onBeforeRender', 'onRendered', 'onRouteUnload'],
                funcName;

            // Basic Object Validation
            validateTypeOf(controller, 'object', 'controller', 'app.addController()');

            // Hash path is always required, check that it is a string
            validateTypeOf(controller.path, 'string', 'controller.path', 'app.addController()');
            validateStringWithValue(controller.path, 'controller.path', 'app.addController()');

            // A route can only be added once so check for duplicates
            this.controllers.forEach(function (item) {
                if (item.path === controller.path) {
                    throw new TypeError('[app.controllers(path=' + controller.path + ')] is already defined');
                }
            });

            // This value will show in the event of an error. It's helpful for the developer
            // because it includes the function name and the controller path so they can quickly
            // determine the error source.
            funcName = 'app.addController(path=' + controller.path + ')';

            // View Id is optional. If not defined then set to null, otherwise
            // if it is defined make sure it is a string, and that the element exists
            if (controller.viewId === undefined) {
                controller.viewId = null;
            } else {
                validateTypeOf(controller.viewId, 'string', 'controller.viewId', funcName);
                validateStringWithValue(controller.viewId, 'controller.viewId', funcName);
                validateElementExists(controller.viewId, 'controller.viewId', funcName);
            }

            // View Url is optional. If not defined then set to null, otherwise
            // if it is defined make sure it is a string. The template will only be downloaded
            // if the route is actually called so the actual route is not validated here.
            if (controller.viewUrl === undefined) {
                controller.viewUrl = null;
            } else {
                validateTypeOf(controller.viewUrl, 'string', 'controller.viewUrl', funcName);
                validateStringWithValue(controller.viewUrl, 'controller.viewUrl', funcName);
            }

            // Make sure that both viewUrl and viewId are not defined
            if (controller.viewId !== null && controller.viewUrl !== null) {
                throw new TypeError('A controller cannot have both [viewId] and [viewUrl] defined when calling ' + funcName);
            }

            // Make sure that if defined [viewEngine] is valid
            if (controller.viewEngine !== undefined) {
                if (controller.viewId === null && controller.viewUrl === null) {
                    throw new TypeError('When a controller uses the [viewEngine] property either [viewId] or [viewUrl] must also be defined when calling ' + funcName);
                } else if (validViewEngines.indexOf(controller.viewEngine) === -1) {
                    throw new TypeError('Invalid [viewEngine] property when calling ' + funcName + '. Valid values are: ' + validViewEngines.join(', '));
                }
            }

            // The modelName is optional, if defined validate that it is defined as a string
            // and that a model object exists for the specifed name.
            if (controller.modelName !== null && controller.modelName !== undefined) {
                validateTypeOf(controller.modelName, 'string', 'controller.modelName', funcName);
                validateStringWithValue(controller.modelName, 'controller.modelName', funcName);
                validateObjectExists(this.models[controller.modelName], 'app.models.' + controller.modelName, funcName);
            }

            // If pageType is defined then make sure it's a valid string. Pages can be loaded
            // dynamically using [lazyLoad] so additional validation occurs the first time
            // the controller is used.
            if (controller.pageType !== null && controller.pageType !== undefined) {
                validateTypeOf(controller.pageType, 'string', 'controller.pageType', funcName);
                validateStringWithValue(controller.pageType, 'controller.pageType', funcName);
            }

            // Validate that functions are properly defined
            validateOptionalFunctions(controller, controller.path, 'controller', func);

            // Require either a function, a viewId, or a viewUrl to be defined, otherwise
            // no action would be taken with the route becomes active. Don't check when
            // using [pageType] the functions will be copied and validated when the
            // controller is first used.
            if (controller.pageType === null || controller.pageType === undefined) {
                func.pop(); // Remove 'onRouteUnload'
                func.push('viewId');
                func.push('viewUrl');
                requireOneNamedProperty(controller, controller.path, 'controller', func);
            }

            // Controller is valid
            this.controllers.push(controller);
            return this;
        },

        /**
         * Return a Controller Object based on path or null if
         * a controller does not exist for the path.
         *
         * @param {string} path
         * @return {object|null}
         */
        controller: function (path) {
            for (var n = 0, m = this.controllers.length; n < m; n++) {
                if (this.controllers[n].path === path) {
                    return this.controllers[n];
                }
            }
            return null;
        },

        /**
         * Show an error message inside of an element using CSS from
         * [app.errorCss] and className from [app.errorClass]. This
         * will replace any existing content in the element.
         *
         * @param {HTMLElement} element
         * @param {Error|string} message
         */
        showError: function(element, message) {
            if (element === null) {
                app.showErrorAlert(message);
                return;
            }
            app.loadCss(app.errorStyleId, app.errorCss);
            var span = createElement('span', message, app.errorClass);
            element.innerHTML = '';
            element.appendChild(span);
            if (typeof message !== 'string') {
                console.error(message);
            }
        },

        /**
         * Show an error alert at the top of the screen. Users can dismiss the
         * message by clicking an [X] button.
         *
         * @param {Error|string} message
         */
        showErrorAlert: function(message) {
            app.loadCss(app.errorStyleId, app.errorCss);
            if (typeof message === 'string' && message.toLowerCase().indexOf('error') === -1) {
                message = 'Error: ' + message;
            }
            var div = createElement('div', message, app.fatalErrorClass);
            var closeButton = createElement('span', '✕');
            closeButton.onclick = function () {
                document.body.removeChild(div);
            };
            div.insertBefore(closeButton, div.firstChild);
            document.body.appendChild(div);
            if (typeof message !== 'string') {
                console.error(message);
            }
        },

        /**
         * Return true/false based on whether [app.updateView()] is still
         * running. The [app.updateView()] function handles how to handle
         * update the view so this function is included for Unit Testing.
         *
         * @return {bool}
         */
        isUpdatingView: function () {
            // [isUpdatingView] is a private variable defined at the top of
            // this file and not directly accessible outside this file's scope.
            return isUpdatingView;
        },

        /**
         * Updates the active route's view if defined and runs optional
         * functions from controllers and plugins such as onRendered().
         *
         * When using a templating engine such as Handlebars calling this
         * will re-render all HTML content. If using Vue calling this multiple
         * times will typically have no effect unless a major DOM change happens.
         *
         * Calling this function from a controller or page object works well
         * if you have a lot of logic that triggers many DOM changes and the
         * current page should be refreshed based on model properties, however
         * in most cases updating specific elements using [app.refreshAllHtmlControls()]
         * or [app.refreshHtmlControl()] will work.
         */
        updateView: function () {
            // Private function to render the view, defined in a private function here
            // to prevent the function from being called while it is still executing.
            // This happens when a web service defined in the controller triggers
            // app.updateView() while the view is still being rendered.
            function renderView() {
                // Set flag variable so the parent function can know if updateView() is executing
                isUpdatingView = true;

                // For Vue only create the Vue Object once and only call
                // controller/plugin methods when major changes happen.
                if (app.activeVueModel !== null) {
                    var len = 0;
                    var w = app.activeVueModel._watcher;
                    if (w && w.deps && w.deps.length) {
                        len = w.deps.length;
                    }
                    if (vueWatcherDepPrevLen !== len) {
                        afterRender('vue_dep_change');
                    }
                    vueUpdateView = true;
                    isUpdatingView = false;
                    vueWatcherDepPrevLen = len;
                    return;
                }

                // Make sure all loaded JS Controls are unloaded
                app.unloadAllJsControls();

                // Handle unexpected errors that occur in plugins or controllers so
                // that [isUpdatingView] can be reset in the event of an error
                try {
                    // Controller.onBeforeRender()
                    // This function does not get called for Vue because the [app.activeVueModel]
                    // will not exist until the Vue instance is created. When using Vue the
                    // [Controller.onRouteLoad()] function is used as the starting point.
                    var isVue = (app.activeController && app.activeController.viewEngine === ViewEngines.Vue);
                    if (!isVue && app.activeController && app.activeController.onBeforeRender !== undefined) {
                        try {
                            app.activeController.onBeforeRender.apply(app.activeModel, app.activeParameters);
                        } catch (e) {
                            app.showErrorAlert('Error from Controller [path=' + app.activeController.path + '] on [onBeforeRender()]: ' + e.toString());
                            console.error(e);
                        }
                    }

                    // Plugins.onBeforeRender()
                    for (var plugin in app.plugins) {
                        if (app.plugins.hasOwnProperty(plugin) && app.plugins[plugin].onBeforeRender !== undefined) {
                            try {
                                app.plugins[plugin].onBeforeRender();
                            } catch (e) {
                                app.showErrorAlert('Error from Plugin [' + plugin + '] on [onBeforeRender()]: ' + e.toString());
                                console.error(e);
                            }
                        }
                    }

                    // Render the main View HTML
                    if (app.activeTemplate !== null) {
                        var view = document.querySelector(app.settings.viewSelector);
                        if (view === null) {
                            var errorText = 'Error - The main HTML element for rendering views from selector [' + app.settings.viewSelector + '] does not exist on this page. Check HTML on the page to makes sure that the element exist; and if it does then check to make sure that JavaScript Code did not remove it from the page';
                            app.showErrorAlert(errorText);
                        } else {
                            renderTemplate(view, app.activeController, app.activeTemplate, app.activeModel);
                        }
                    }

                    // Refresh HTML Controls
                    app.refreshAllHtmlControls(function () {
                        // Create a [Vue] object only once per Route/Controller load
                        if (app.activeController && app.activeController.viewEngine === ViewEngines.Vue) {
                            // If a rendering error occurs the main view element will be removed from
                            // the screen so handle Vue Errors and Warnings globally and add back the
                            // View element if it is removed.
                            var viewEl = document.querySelector(app.settings.viewSelector);
                            Vue.config.errorHandler = function (err) { console.error('Vue Error'); showVueError(err, viewEl); };
                            Vue.config.warnHandler = function (err) { console.error('Vue Warning'); showVueError(err, viewEl); };

                            // Was there a previous render error? If so show it instead of creating a new Vue instance
                            if (app.activeTemplate && app.activeTemplate.error) {
                                app.showError(document.querySelector(app.settings.viewSelector), app.activeTemplate.errorMessage);
                                afterRender('updateView');
                            } else {
                                // Create a Vue Instance for the current page
                                app.activeVueModel = new Vue({
                                    el: app.settings.viewSelector,
                                    data: app.activeModel,
                                    methods: app.activeController.methods,
                                    computed: app.activeController.computed,
                                    mounted: function () {
                                        var vm = this;
                                        vm.$nextTick(function () {
                                            if (app.activeController.onRouteLoad !== undefined) {
                                                try {
                                                    app.activeController.onRouteLoad.apply(vm, app.activeParameters);
                                                } catch (e) {
                                                    app.showErrorAlert('Error from Controller [path=' + app.activeController.path + '] on [onRouteLoad()]: ' + e.toString());
                                                    console.error(e);
                                                }
                                            }
                                            app.loadAllJsControls();
                                            afterRender('vue_mounted', vm);
                                        });
                                    },
                                    updated: function () {
                                        // Only run the update when a DOM change happens
                                        // after [app.updateView()] is called.
                                        this.$nextTick(function () {
                                            if (vueUpdateView) {
                                                app.loadAllJsControls();
                                                afterRender('vue_updated');
                                                var w = this._watcher;
                                                if (w && w.deps && w.deps.length) {
                                                    vueWatcherDepPrevLen = this._watcher.deps.length;
                                                }
                                                vueUpdateView = false;
                                            }
                                        });
                                    },
                                    beforeDestroy: function () {
                                        try {
                                            if (app.activeController.onRouteUnload !== undefined) {
                                                app.activeController.onRouteUnload.apply(this, app.activeParameters);
                                            }
                                        } catch (e) {
                                            app.showErrorAlert('Error from Controller [path=' + app.activeController.path + '] on [onRouteUnload()]: ' + e.toString());
                                            console.error(e);
                                        }
                                    },
                                });
                            }
                        } else {
                            // Load JS Controls
                            app.loadAllJsControls();

                            // Call additional Controller/Plugin functions.
                            // For Vue this will first be called on the [mounted] event.
                            afterRender('updateView');
                        }

                        // Reset variable so this function can be called again
                        isUpdatingView = false;
                    });
                } catch (e) {
                    // If error reset variable otherwise the view would get
                    // stuck because [isUpdatingView] would be set to true.
                    isUpdatingView = false;
                    // Log and Rethrow the exception
                    console.error(e);
                    throw e;
                }
            }

            // Private function under [updateView()]
            function afterRender(source, model) {
                // When using the HTML5 History API update links that start with <a href="/...">
                // and do not include the [data-no-pushstate] attribute to use [window.history.pushState].
                if (routingMode === 'history') {
                    var links = document.querySelectorAll('a[href^="/"]:not([data-no-pushstate])');
                    Array.prototype.forEach.call(links, function(link) {
                        link.addEventListener('click', app.pushStateClick);
                    });
                }

                // Plugins.onRendered()
                for (var plugin in app.plugins) {
                    if (app.plugins.hasOwnProperty(plugin) && app.plugins[plugin].onRendered !== undefined) {
                        try {
                            app.plugins[plugin].onRendered();
                        } catch (e) {
                            app.showErrorAlert('Error from Plugin [' + plugin + '] on [onRendered()]: ' + e.toString());
                            console.error(e);
                        }
                    }
                }

                // Controller.onRendered()
                var isVue = (app.activeController && app.activeController.viewEngine === ViewEngines.Vue);
                var onRendered = app.activeController && app.activeController.onRendered;
                if (typeof onRendered === 'function') {
                    if (isVue) {
                        model = (model || app.activeVueModel);
                    } else {
                        model = app.activeModel;
                    }
                    try {
                        onRendered.apply(model, app.activeParameters);
                    } catch (e) {
                        app.showErrorAlert('Error from Controller [path=' + app.activeController.path + '] on [onRendered()]: ' + e.toString());
                        console.error(e);
                    }
                }

                // App.onUpdateViewComplete()
                if (app.onUpdateViewComplete !== null) {
                    try {
                        app.onUpdateViewComplete(source);
                    } catch (e) {
                        app.showErrorAlert('Error from [app.onUpdateViewComplete()]: ' + e.toString());
                        console.error(e);
                    }
                }
            }

            // Start of logic for [updateView()].
            // Check if the view is currently being updated.
            if (isUpdatingView) {
                // If the view is currently being rendered then set a timer and
                // check every 1/100th of a second if the function is still updating.
                renderInterval = window.setInterval(function () {
                    // If still running then exit this function
                    if (isUpdatingView) {
                        return;
                    }

                    // Finished running, stop the timer and render the view
                    window.clearInterval(renderInterval);
                    renderInterval = null;
                    renderView();
                }, 10);
            } else {
                renderView();
            }
        },

        /**
         * Async function to refresh all elements in the current view that have
         * the attribute [data-template-id] or [data-template-url]. These elements
         * reference another template embedded in the page if using the attribute
         * [data-template-id] or for download if using [data-template-url].
         *
         * Example usage:
         *   app.refreshAllHtmlControls(callback)
         *   app.refreshAllHtmlControls(callback, app.activeModel)
         *   app.refreshAllHtmlControls(callback, object)
         *
         * @param {function} callback
         * @param {object|undefined} model   If undefined then [app.activeModel] is used
         */
        refreshAllHtmlControls: function (callback, model) {
            // Get the current time which will be assigned to an attribute of the control elements
            var timeUpdated = String((new Date()).getTime());

            // This selector is looking for elements containing either attribute [data-template-id]
            // or [data-template-url] and not including items that have already been processed and
            // assigned the attribute [data-updated-at] with the current time value.
            var selector = '[data-template-id]:not([data-updated-at="' + timeUpdated + '"])';
            selector += ',[data-template-url]:not([data-updated-at="' + timeUpdated + '"])';

            // Recursive function that refreshes each control one at a time until all controls
            // have been processed. Then if a callback function is defined it gets called.
            // This function does not contain a standard for/while/do loop however the
            // behavior of the code is using loop-like logic.
            function renderControl(control) {
                // If control equals null then there are no controls remaining to process
                if (control === null) {
                    isUpdatingAllControls = false;

                    // Call plugins if this function was manually called
                    if (!isUpdatingView) {
                        app.refreshPlugins();
                    }

                    // User callback
                    if (callback) {
                        callback(timeUpdated);
                    }
                } else {
                    // Call the asynchronous function app.refreshHtmlControl() and once
                    // it completes add the attribute [data-updated-at] to the element
                    // with the time updated so the control is not processed again.
                    // Then make the recursive call looking for the next control element.
                    try {
                        app.refreshHtmlControl(control, function () {
                            control.setAttribute('data-updated-at', timeUpdated);
                            renderControl(document.querySelector(selector));
                        }, model);
                    } catch (e) {
                        control.setAttribute('data-updated-at', timeUpdated);
                        renderControl(document.querySelector(selector));
                    }
                }
            }

            // Look for the first matching control element.
            isUpdatingAllControls = true;
            renderControl(document.querySelector(selector));
        },

        /**
         * Async function to refresh a single element in the current view that has the
         * attribute [data-template-id] or [data-template-url]. The attribute value will
         * reference a template. This can be used by controller functions to easily
         * update only part of a page.
         *
         * @param {HTMLElement} control
         * @param {function|undefined} callback
         * @param {object|undefined} model   If undefined then [app.activeModel] is used
         */
        refreshHtmlControl: function (control, callback, model) {
            try {
                // Verify that control is a string or HTML Element
                var isString = (typeof control === 'string');
                var isElement = (control instanceof HTMLElement);
                if (!isString && !isElement) {
                    throw new TypeError('Invalid type for parameter [control] in the function [DataFormsJS.refreshHtmlControl()]: ' + typeof control);
                }

                // Get the control if only the id was passed
                if (isString) {
                    var id = control;
                    control = document.getElementById(id);
                    if (control === null) {
                        throw new TypeError('Control not found for [' + id + '] when the function [DataFormsJS.refreshHtmlControl()] was called.');
                    }
                }

                // Validate that if defined callback is a function
                if (!(callback === undefined || typeof callback === 'function')) {
                    throw new TypeError('[callback] was not defined as a [function] when the [DataFormsJS.refreshHtmlControl()] was called');
                }

                // Get the template id or url and validate that only one property is set.
                // If either of these checks fail then the template will not be compiled.
                var templateId = control.getAttribute('data-template-id');
                var templateUrl = control.getAttribute('data-template-url');
                if (templateId !== null && templateUrl !== null) {
                    throw new TypeError('A control must have only one of the template attribute defined; either [data-template-id] or [data-template-url]. Both attributes are defined on the control.');
                } else if (templateId === null && templateUrl === null) {
                    throw new TypeError('A control must have either attribute [data-template-id] or [data-template-url]. Niether attribute is defined for the control.');
                }

                // Get the active model if one was not passed
                if (model === undefined) {
                    model = this.activeModel;
                }

                // Compile and render the template.
                // If this function was manually called on a specific element
                // then load JS controls and refresh plugins for the element.
                compileTemplate(control, null, function (template) {
                    renderTemplate(control, null, template, model);
                    if (!isUpdatingView) {
                        app.loadAllJsControls(control, model);
                    }
                    if (!isUpdatingAllControls) {
                        app.refreshPlugins(control);
                    }
                    if (callback !== undefined) {
                        callback();
                    }
                });
            } catch (e) {
                // If there is an error (usually a parsing error during development)
                // then show the message on the control and re-throw the error.
                console.error(e);
                if (control !== null && control instanceof HTMLElement) {
                    app.showError(control, getTemplateErrorPrefix(control, null) + e.message);
                }
                throw e;
            }
        },

        /**
         * Run [onRendered()] for all Plugins or if an element is passed
         * then all call the function for all Plugins that handle elements.
         * In most cases this function won't need to be manually called because
         * is called automatically from [refreshAllHtmlControls()]
         * and [refreshHtmlControl].
         *
         * @param {HTMLElement|undefined} element
         */
        refreshPlugins: function(element) {
            function refreshAll() {
                for (var plugin in app.plugins) {
                    if (app.plugins.hasOwnProperty(plugin) && app.plugins[plugin].onRendered !== undefined) {
                        try {
                            if (element === undefined) {
                                app.plugins[plugin].onRendered();
                            } else {
                                // [length === 1] means if [function(element)] is defined.
                                // Functions without a defined argument [function()] will not be called.
                                if (app.plugins[plugin].onRendered.length === 1) {
                                    app.plugins[plugin].onRendered(element);
                                }
                            }
                        } catch (e) {
                            app.showErrorAlert('Error from Plugin [' + plugin + '] on [onRendered()]: ' + e.toString());
                            console.error(e);
                        }
                    }
                }
            }
            if (app.activeController && app.activeController.viewEngine === ViewEngines.Vue) {
                app.activeVueModel.$nextTick(refreshAll);
            } else {
                refreshAll();
            }
        },

        /**
         * Load all Custom JavaScript Controls on the page. This happens when
         * the route changes and when [app.updateView()] is called. It would
         * only need to be called manually if custom page logic adds new
         * HTML controls to a page. This function is safe to call twice as it
         * will not re-load already loaded controls. Custom controls have either
         * the [data-control] Attibute or a Custom Element Tag that matches
         * the JS Control added with [app.addControl()].
         *
         * @param {HTMLElement|undefined} element   Uses [document] if undefined
         * @param {object|undefined} model          Uses [app.activeModel] if undefined
         */
        loadAllJsControls: function (element, model) {
            // Build Query Selector based on [data-control] attribute
            // and custom Control Names. For example a control named
            // 'custom-list' will search for elements with the same tag name.
            var selectors = ['[data-control]:not([data-control-loaded]):not([data-control-is-loading])'];
            var controlNames = Object.keys(app.controls);
            controlNames.forEach(function(name) {
                if (name.indexOf('-') !== -1 && name.indexOf(' ') === -1) {
                    selectors.push(name + ':not([data-control-loaded]):not([data-control-is-loading])');
                }
            });
            // Combine all selectors to one selector
            var selector = selectors.join(',');

            // [element] is typically specified only when refreshing a specific HTML control
            if (element === undefined) {
                element = document;
            }

            // A custom model would only be set if manually calling
            // this or by a Custom Plugin or Control.
            if (model === undefined) {
                model = app.activeModel;
            }

            // Use a recursive function to load controls one at a time
            // until all are loaded. Logic here is similar to [refreshAllHtmlControls()]
            // and results in all nested controls being loaded.
            function loadControl(control) {
                if (control !== null) {
                    try {
                        app.loadJsControl(control, model);
                    } catch (e) {
                        control.setAttribute('data-control-loaded', '');
                        app.showError(control, e.toString());
                        console.error(e);
                    }
                    loadControl(element.querySelector(selector));
                }
            }
            loadControl(element.querySelector(selector));
        },

        /**
         * Load a Custom JavaScript Control from an Element. This happens when
         * the route changes and when [app.updateView()] is called. It would
         * only need to be called manually if custom page logic adds new
         * HTML controls to a page.
         *
         * @param {HTMLElement} element
         * @param {object|undefined} model   Uses [app.activeModel] if undefined
         */
        loadJsControl: function (element, model) {
            var name,
                tagName,
                control,
                data,
                newEl,
                n,
                m,
                type,
                prop,
                error,
                hadError;

            // Validate HTML Element
            if (!(element instanceof HTMLElement)) {
                throw new TypeError('Invalid type for parameter [element] for the function [DataFormsJS.loadJsControl()], expected HTMLElement, received: ' + typeof element);
            }
            name = element.getAttribute('data-control');
            tagName = element.tagName.toLowerCase();

            // Custom Tag Name or Standard HTML Element?
            if (name === null || name === tagName) {
                // Get Control Name from Custom Element
                name = tagName;
                control = app.controls[name];
                if (control === undefined) {
                    // This error can happen if manually calling this function with an invalid element.
                    error = 'Invalid call to [DataFormsJS.loadJsControl()]. This function only works on valid control elements.';
                    app.showError(element, error);
                    console.log(element);
                    throw new TypeError(error);
                }

                // Replace Element with a standard HTML element
                // while keeping child nodes in place
                type = (control.type || 'div');
                newEl = document.createElement(type);
                while (element.firstChild) {
                    newEl.appendChild(element.firstChild);
                }
                for (n = 0, m = element.attributes.length; n < m; n++) {
                    newEl.setAttribute(element.attributes[n].name, element.attributes[n].value);
                }
                newEl.setAttribute('data-control', name);
                element.parentNode.replaceChild(newEl, element);
                element = newEl;
            } else {
                // Standard HTML element was used, example:
                //   <div data-control-name="name" ...
                control = app.controls[name];
                if (control === undefined) {
                    throw new Error('JavaScript Control was not found by name, check that the file is loaded: ' + name);
                }
            }

            // Create or Clone Data Object for the Control Instance
            if (control.data === undefined) {
                data = {};
            } else {
                data = app.deepClone({}, control.data);
            }

            // Assign HTML [data-*] attributes to [data] Properties for the instance
            for (prop in element.dataset) {
                if (prop !== 'control') {
                    data[prop] = element.dataset[prop];
                }
            }

            // If defined load CSS once only per control
            if (control.css !== undefined) {
                app.loadCss('DataFormsJS-control-style-' + name, control.css);
            }

            // Use active model unless one is specified
            if (model === undefined) {
                model = app.activeModel;
            }

            // Prevent controls from loading while [onLoad] is being called
            if (element.getAttribute('data-control-is-loading') !== null) {
                return;
            }
            element.setAttribute('data-control-is-loading', '');

            // Call events [onLoad()] then [html()]
            hadError = false;
            try
            {
                if (control.onLoad !== undefined) {
                    control.onLoad.call(data, element);
                }
            } catch (e) {
                app.showError(element, 'Error with JavaScript Control [' + name + '] in function [onLoad()]: ' + e.toString());
                console.error(e);
                hadError = true;
            }

            if (!hadError) {
                try
                {
                    if (control.html !== undefined) {
                        element.innerHTML = control.html.call(data, model);
                    }
                } catch (e) {
                    app.showError(element, 'Error with JavaScript Control [' + name + '] in function [html()]: ' + e.toString());
                    console.error(e);
                }
            }

            // Mark control as loaded and add to active list
            element.setAttribute('data-control-loaded', '');
            element.removeAttribute('data-control-is-loading');
            app.activeJsControls.push({
                element: element,
                control: name,
                data: data,
            });
        },

        /**
         * Unload all JavaScript Controls; this gets called automatically when
         * the route changes or the page is refreshed from [app.updateView()].
         */
        unloadAllJsControls: function () {
            app.activeJsControls.forEach(function(jsControl) {
                var control = app.controls[jsControl.control];
                if (control.onUnload !== undefined) {
                    try {
                        control.onUnload.call(jsControl.data, jsControl.element);
                    } catch (e) {
                        var name = 'Unknown Control';
                        if (jsControl.element) {
                            name = jsControl.element.getAttribute('data-control');
                            name = (name ? name : 'Unknown Control');
                        }
                        app.showErrorAlert('Error with JavaScript Control [' + name + '] in function [onUnload()]: ' + e.toString());
                        console.error(e);
                    }
                }
                jsControl.element.removeAttribute('data-control-loaded');
            });
            app.activeJsControls = [];
        },

        /**
         * Check if a Route path is a match to a specified URL hash
         *
         * Examples:
         *   app.routeMatches('/page1', '/page2')
         *       returns { isMatch:false }
         *
         *   app.routeMatches('/show-all', '/show-all')
         *       returns { isMatch:true, args:[], namedArgs: {} }
         *
         *   app.routeMatches('/record/123', '/record/:id')
         *       returns { isMatch:true, args:['123'], namedArgs: { id:'123' } }
         *
         *   app.routeMatches('/orders/edit/123', '/:record/:view/:id')
         *       returns {
         *           isMatch:true,
         *           args:['orders', 'edit', '123'],
         *           namedArgs: { record: 'orders', view: 'edit', id: '123' }
         *       }
         * @param {string} path        The URL hash to compare against
         * @param {string} routePath   The route, dynamic values are prefixed with ':'
         */
        routeMatches: function (path, routePath) {
            var pathParts = path.split('/'),
                routeParts = routePath.split('/'),
                n,
                m = pathParts.length,
                args = [],
                namedArgs = {},
                value;

            // Quick check if path and route parts are equal
            if (m !== routeParts.length) {
                return { isMatch: false };
            } else {
                // Compare each route part
                for (n = 0; n < m; n++) {
                    // Get the path value (e.g.: 'order/edit/123' = [ 'order', 'edit', '123' ])
                    value = decodeURIComponent(pathParts[n]);

                    // Compare to the route path
                    if (value !== routeParts[n]) {
                        // If different then does the route path begin with ':'?
                        // If so it is a parameter and if not the route does not match.
                        if (routeParts[n].substr(0, 1) === ':') {
                            // Add the value to the args[] array and as a property
                            // to the namedArgs{} object.
                            args.push(value);
                            namedArgs[routeParts[n].substr(1)] = value;
                        } else {
                            return { isMatch: false };
                        }
                    }
                }
            }

            // If code reaches here then it matches
            return { isMatch: true, args: args, namedArgs: namedArgs };
        },

        /**
         * Clone properties and functions from multiple objects into one object.
         * This function is similar in behavior to [Object.assign()] and jQuery
         * [$.extend] however it makes a deep copy of nested objects and arrays
         * rather than copying them by reference. Additionally it handles
         * JavaScript Getter and Setter Properties.
         *
         * @param {object, object, ...}
         */
        deepClone: function () {
            var n,
                m = arguments.length,
                target,
                source,
                prop,
                propType,
                desc,
                isGetter;

            // Validate for two or more parameters and that all parameters are objects
            if (m === 0) {
                throw new TypeError('No arguments specified when app.deepClone() was called.');
            } else if (m === 1) {
                throw new TypeError('Only one argument was specified when app.deepClone() was called.');
            }
            for (n = 0; n < m; n++) {
                validateTypeOf(arguments[n], 'object', 'argument', 'app.deepClone()');
            }

            // Object copied to will be the first argument
            target = arguments[0];

            // Loop through all other arguments
            for (n = 1; n < m; n++) {
                // Source object to copy from
                source = arguments[n];

                // Copy properties, for Objects and Arrays copy as nested props
                for (prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        desc = Object.getOwnPropertyDescriptor(source, prop);
                        isGetter = (desc.get !== undefined);
                        if (isGetter || (desc.set !== undefined)) {
                            Object.defineProperty(target, prop, desc);
                        } else {
                            propType = Object.prototype.toString.call(source[prop]);
                            if (propType === '[object Object]') {
                                target[prop] = this.deepClone({}, source[prop]);
                            } else if (propType === '[object Array]') {
                                target[prop] = this.deepClone([], source[prop]);
                            } else {
                                target[prop] = source[prop];
                            }
                        }
                    }
                }
            }

            // Return the object with merged properties
            return target;
        },

        /**
         * Return a string indicating the template type from either <script>
         * or <template> elements.
         *
         * Based on the <script> [type="text/x-template"] and the
         * [data-engine] attribute the following values are returned:
         *     'handlebars'        = 'Handlebars',
         *     'vue'               = 'Vue',
         *     'nunjucks'          = 'Nunjucks',
         *     'underscore'        = 'Underscore',
         *     'text'              = 'Text'
         *     (all other values)  = 'Unknown'
         *
         * With a <template> 'text' is returned.
         *
         * @param {HTMLElement} script
         * @return {string}
         */
        getTemplateType: function (script) {
            // Validate the parameter
            if (script === undefined) {
                throw new TypeError('Missing parameter [script] for the function [DataFormsJS.getTemplateType()]');
            } else if (!(script instanceof HTMLElement)) {
                throw new TypeError('Invalid type for parameter [script] for the function [DataFormsJS.getTemplateType()], expected HTMLElement, received: ' + typeof script);
            } else if (script.tagName !== 'TEMPLATE' && script.tagName !== 'SCRIPT') {
                throw new TypeError('Invalid type for parameter [script] for the function [DataFormsJS.getTemplateType()], expected <script> or <template>, received: ' + script.tagName.toLowerCase());
            }

            // Return the type of template
            if (script.tagName === 'TEMPLATE') {
                return ViewEngines.Text;
            }
            switch (script.getAttribute('data-engine')) {
                case 'handlebars':
                    return ViewEngines.Handlebars;
                case 'vue':
                    return ViewEngines.Vue;
                case 'nunjucks':
                    return ViewEngines.Nunjucks;
                case 'underscore':
                    return ViewEngines.Underscore;
                case 'text':
                    return ViewEngines.Text;
                default:
                    return ViewEngines.Unknown;
            }
        },

        /**
         * Get or set the value of the current View Engine that is used for rending templates.
         * If setting the value then the DataFormsJS/app object is returned so that the function
         * can be called in a chainable manner. The string value to set the View Engine must be
         * one of the following values [ 'Handlebars', 'Nunjucks', 'Underscore', 'Vue' ] and the
         * return value will be one of the following [ 'Handlebars', 'Nunjucks', 'Underscore',
         * 'Vue', 'Mixed', or 'Not Set' ].
         *
         * @param {string|undefined} engine
         * @return {this|string}
         */
        viewEngine: function (engine) {
            // If calling this function with no parameters return the current view engine
            if (engine === undefined) {
                return viewEngine;
            } else {
                // Setting the view engine so validate the parameter
                switch (engine) {
                    case ViewEngines.NotSet:
                    case ViewEngines.Unknown:
                    case ViewEngines.Mixed:
                        throw new TypeError('Invalid value specified for setting the ViewEngine: ' + engine);
                    default:
                        if (ViewEngines[engine] === undefined) {
                            throw new TypeError('Unknown value specified for setting the ViewEngine [' + engine + '], refer to documentation or values from the enum/object [ViewEngines] for valid options.');
                        }
                }

                // Set the new value and return the current DataFormsJS Object so
                // this function can be called as a chainable function.
                viewEngine = engine;
                return this;
            }
        },

        /**
         * Append CSS to a Style Sheet in the Document if it does not yet exist.
         *
         * @param {string} id
         * @param {string} css
         */
        loadCss: function(id, css) {
            var style = document.getElementById(id);
            if (style === null) {
                style = document.createElement('style');
                style.id = id;
                style.innerHTML = css;
                document.head.appendChild(style);
            }
        },

        /**
         * Dynamically load a JavaScript file if needed. This can be used to
         * load large components that only need to be used on specific pages.
         *
         * Callback is optional and if not passed a Promise is returned.
         *
         * @param {*} condition  If [false] or [undefined] then the script will be downloaded
         * @param {string} url
         * @param {function|undefined} callback
         * @return {Promise|void}
         */
        loadScript: function(condition, url, callback) {
            function dowloadScript(success, error) {
                var script = document.createElement('script');
                script.onload = success;
                script.onerror = function () {
                    console.error('Error loading Script: ' + url);
                    error();
                };
                script.src = url;
                document.head.appendChild(script);
            }

            if (condition === false || condition === undefined) {
                if (callback === undefined) {
                    return new Promise(function(resolve, reject) {
                        dowloadScript(resolve, reject);
                    });
                }
                dowloadScript(callback, callback);
            } else {
                if (callback === undefined) {
                    return new Promise(function(resolve) { resolve(); });
                }
                callback();
            }
        },

        /**
         * Load an array of JS and CSS scripts and add them to the document header.
         * This function is used internally when using [app.lazyLoad] and [data-lazy-load]
         * to download needed scripts before a router/controller is loaded. Scripts are
         * loaded in sequential order so when using this it's important for the files
         * to download quickly. The settings [app.settings.lazyTemplateSelector] can
         * be used to show a loading screen while scripts are being loaded.
         *
         * @param {string|array} urls Single URL's can use a string
         * @return {Promise}
         */
        loadScripts: function(urls) {
            // Load a CSS file and resolve promise once loaded or error
            function loadCss(url) {
                return new Promise(function(resolve) {
                    // Check if file was already added
                    var links = document.querySelectorAll('link');
                    for (var n = 0, m = links.length; n < m; n++) {
                        if (links[n].rel === 'stylesheet' && links[n].getAttribute('href') === url) {
                            resolve();
                            return;
                        }
                    }

                    // Add file and wait till it loads
                    var link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.onload = resolve;
                    link.onerror = function () {
                        app.showErrorAlert('Error loading CSS File: ' + url);
                        resolve();
                    };
                    link.href = url;
                    document.head.appendChild(link);
                });
            }

            // Load a JS file
            function loadJs(url) {
                return new Promise(function(resolve) {
                    // Check if file was already added
                    var scripts = document.querySelectorAll('script');
                    for (var n = 0, m = scripts.length; n < m; n++) {
                        if (scripts[n].getAttribute('src') === url) {
                            resolve();
                            return;
                        }
                    }

                    // Add file and wait till it loads
                    var script = document.createElement('script');
                    script.onload = resolve;
                    script.onerror = function () {
                        app.showErrorAlert('Error loading JS File: ' + url);
                        resolve();
                    };
                    script.src = url;
                    document.head.appendChild(script);
                });
            }

            // Convert a single string to an array otherwise validate for array
            if (typeof urls === 'string') {
                urls = [urls];
            } else if (!Array.isArray(urls)) {
                app.showErrorAlert('Invalid Script for [app.loadScripts()] or [app.lazyLoad], expected string or an array of strings. Check console.');
                console.log('app.loadScripts():');
                console.log(urls);
                return new Promise(function(resolve) {
                    resolve();
                });
            }

            // Return a promise that runs a promise for each URL in sequential order.
            return new Promise(function(resolve) {
                var current = 0;
                var count = urls.length;

                function nextPromise() {
                    if (current === count) {
                        resolve();
                        return;
                    }

                    var url = urls[current];
                    current++;

                    if (url.endsWith('.js')) {
                        loadJs(url).then(nextPromise);
                    } else if (url.endsWith('.css')) {
                        loadCss(url).then(nextPromise);
                    } else {
                        app.showErrorAlert('Invalid Script for [app.loadScripts()] or [app.lazyLoad]: ' + url);
                        nextPromise();
                    }
                }

                nextPromise();
            });
        },

        /**
         * Build and return a URL.
         *
         * Example '/order/:id' becomes '/order/123' if [id] is
         * set in the passed object or [app.activeParameterList].
         *
         * @param {*} url
         * @param {*} params
         */
        buildUrl: function (url, params) {
            if (params === undefined) {
                params = app.activeParameterList;
            }
            // If the active route has defined parameters then
            // they will be set in [app.activeParameterList].
            if (params !== null && Object.keys(params).length > 0) {
                // Process each of the active parameters
                for (var prop in params) {
                    if (params.hasOwnProperty(prop)) {
                        // Is it in the url template for this model?
                        if (url.indexOf(':' + prop) > -1) {
                            // If so replace all matching text strings with
                            // in the format of ":propery" with the value.
                            // Without the RegExp() "g" option only the first item would be replaced.
                            // For example:
                            //  "/:id/:id".replace(":id", 1) === "/1/:id"
                            //  "/:id/:id".replace(new RegExp(":id", "g"), 1) === "/1/1"
                            url = url.replace(new RegExp(':' + prop, 'g'), encodeURIComponent(params[prop]));
                        }
                    }
                }
            }

            // Return the new URL or if no parameters were defined then
            // the url will be returned as it was passed to this function
            return url;
        },

        /**
         * Get a GraphQL Script as a Promise from either an HTML Element that has
         * attributes [data-graphql-id] or [data-graphql-src] or from an Object
         * that has properties [graphqlId] or [graphqlSrc].
         *
         * @param {string} graphqlId
         * @param {string} graphqlSrc
         * @return {Promise}
         */
        getGraphQL: function(graphqlId, graphqlSrc) {
            var prop,
                script;

            // Only one setting can be used per object/element
            if (graphqlId && graphqlSrc) {
                return new Promise(function(resolve, reject) {
                    reject('Error calling [app.getGraphQL()]. Both [id="' + graphqlId + '"] and [src="' + graphqlSrc + '"] are set. Only one value can be used.');
                });
            }

            // Is the template already cached? If so return it
            prop = (graphqlId ? graphqlId : graphqlSrc);
            if (prop && app.graphQL[prop] !== undefined) {
                return new Promise(function(resolve, reject) {
                    if (app.graphQL[prop].query) {
                        resolve(app.graphQL[prop].query);
                    } else {
                        reject(app.graphQL[prop].error);
                    }
                });
            }

            if (graphqlId) {
                // Look up a <script type="application/graphql"> element on the page
                return new Promise(function(resolve, reject) {
                    var error = null;

                    script = document.getElementById(graphqlId);
                    if (script === null) {
                        error = 'Missing GraphQL Script Element: ' + graphqlId;
                    } else if (script.nodeName !== 'SCRIPT' || script.type !== 'application/graphql') {
                        error = 'Invalid Element for GraphQL Script, expected: <script type="application/graphql" id="' + graphqlId + '">';
                    } else {
                        app.graphQL[graphqlId] = { query:script.innerHTML, error:null };
                        resolve(script.innerHTML);
                    }

                    if (error !== null) {
                        app.graphQL[graphqlId] = { query:null, error:error };
                        reject(error);
                    }
                });
            } else if (graphqlSrc) {
                // Download GraphQL
                return app
                    .fetch(graphqlSrc, null, 'text/plain')
                    .then(function(text) {
                        app.graphQL[graphqlSrc] = { query:text, error:null };
                        return text;
                    })
                    .catch(function(error) {
                        var errorMessage = 'Error Downloading GraphQL Script: [' + graphqlSrc + '], Error: ' + error;
                        app.graphQL[graphqlSrc] = { query:null, error:errorMessage };
                        throw errorMessage;
                    });
            } else {
                // Invalid Settings
                return new Promise(function(resolve, reject) {
                    reject('Error calling [app.getGraphQL()]. Missing GraphQL Parameters.');
                });
            }
        },

        /**
         * Build Variables for a GraphQL Query.
         *
         * Examples:
         *     var params = app.buildGraphQLVariables(graphqlQuery, app.activeParameterList);
         *     var params = app.buildGraphQLVariables(graphqlQuery, app.activeModel);
         *
         * @param {string} graphqlQuery  Source of the GraphQL Query
         * @param {object} params        Object to build Parameter list from, variables must exist in the GraphQL Query
         * @return {object}
         */
        buildGraphQLVariables: function(graphqlQuery, params) {
            var obj = {};
            if (Object.keys(params).length > 0) {
                for (var prop in params) {
                    if (params.hasOwnProperty(prop)) {
                        // Does the parameter exist as a variable in the GraphQL Query?
                        if (graphqlQuery.indexOf('$' + prop) > -1) {
                            // GraphQL doesn't convert strings to numbers and requires
                            // data type to match on search parameters so 'query ($id: Int!) {..'
                            // would fail if using a string. Determine the type with simple
                            // string search. This code is generic so if it doesn't work for
                            // your GraphQL then creating a custom function, page, plugin, etc
                            // is recommended.
                            var isInt = (graphqlQuery.indexOf('($' + prop + ': Int') !== -1);
                            var value = params[prop];
                            if (isInt) {
                                obj[prop] = Number(value);
                            } else {
                                obj[prop] = value;
                            }
                        }
                    }
                }
            }
            return obj;
        },

        /**
         * Setup error handling on the [window] object to call [app.showErrorAlert()]
         * for global unhandled errors. If the attribute <html data-show-errors> is
         * defined then this function gets called automatically when the page is loaded.
         *
         * @param {bool} on
         */
        handleGlobalErrors: function(on) {
            if (on) {
                window.addEventListener('error', errorHandler);
            } else {
                window.removeEventListener('error', errorHandler);
            }
        },

        /**
         * Return an object of Request Headers for a URL based on settings
         * [requestHeaders] and [requestHeadersByHostName].
         *
         * @param {string} url
         * @return {object}
         */
        getRequestHeaders: function(url) {
            var headers = {},
                obj,
                prop,
                hostname,
                link;

            // Copy Request Headers to a new object
            obj = app.settings.requestHeaders;
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    headers[prop] = obj[prop];
                }
            }

            // Are there specific headers for the host?
            // If so then copy them to the headers object.
            if (Object.keys(app.settings.requestHeadersByHostName).length > 0) {
                link = new URL(url, window.location);
                hostname = link.hostname;
                obj = app.settings.requestHeadersByHostName[hostname];
                if (obj !== undefined) {
                    for (prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            headers[prop] = obj[prop];
                        }
                    }
                }
            }
            return headers;
        },

        /**
         * Call to setup the App, initial routes should be defined before calling this function
         */
        setup: function () {
            // Determine the Template Rendering Engine (No Template Engines, only one, or multiple).
            // This value can be read and set by the function [app.viewEngine()].
            viewEngine = ViewEngines.Unknown;
            var engineCount = 0;
            var engines = [
                { prop: 'Handlebars', type: 'handlebars', label: ViewEngines.Handlebars },
                { prop: 'Vue', type: 'vue', label: ViewEngines.Vue },
                { prop: 'nunjucks', type: 'nunjucks', label: ViewEngines.Nunjucks },
                { prop: '_', type: 'underscore', label: ViewEngines.Underscore }
            ];
            var engine;

            // First check based on scripts embeded in the page
            for (engine in engines) {
                if (document.querySelector('script[type="text/x-template"][data-engine="' + engines[engine].type + '"]') !== null) {
                    viewEngine = engines[engine].label;
                    engineCount++;
                }
            }

            // If no scripts are embedded then check if a
            // View Engine are included on the page.
            if (engineCount === 0) {
                for (engine in engines) {
                    if (window[engines[engine].prop]) {
                        viewEngine = engines[engine].label;
                        engineCount++;
                    }
                }
            }

            // If more than one View Engine is being used or was found
            // then set the current View Engine as Mixed. When using this
            // the calling app may have to specify [app.viewEngine('Type')]
            // before controls can be downloaded.
            if (engineCount > 1) {
                viewEngine = ViewEngines.Mixed;
            }

            // Dynamic CSS added for Vue
            if (window.Vue !== undefined) {
                app.loadCss(app.vueStyleId, app.vueCss);
            }

            // Setup global error handling if <html data-show-errors>
            if (document.documentElement.getAttribute('data-show-errors') !== null) {
                app.handleGlobalErrors(true);
            }

            // Get general settings from <html> attributes
            app.settings.graphqlUrl = document.documentElement.getAttribute('data-graphql-url');

            // Routing mode ('history' or 'hash') is set only once
            // when the page is first loaded. Defaults to 'hash'.
            if (routingMode === null) {
                routingMode = document.documentElement.getAttribute('data-routing-mode');
                if (routingMode !== 'history') {
                    routingMode = 'hash';
                }
            }

            // IE 11 considers <template> elements as valid elements so it applies [querySelector()]
            // and related methods to elements under <templates>'s so replace with them <script type="text/x-template">.
            // This avoid's issues of <template> elements that contain embedded content.
            if (isIE) {
                var templates = document.querySelectorAll('template');
                Array.prototype.forEach.call(templates, function(template) {
                    var script = document.createElement('script');
                    for (var n = 0, m = template.attributes.length; n < m; n++) {
                        script.setAttribute(template.attributes[n].name, template.attributes[n].value);
                    }
                    script.type = 'text/x-template';
                    script.setAttribute('data-engine', 'text');
                    script.innerHTML = template.innerHTML;
                    template.parentNode.replaceChild(script, template);
                });
            }

            // Automatically add templates as routes that have the attribute [data-route] defined
            var templateSelector = 'script[type="text/x-template"][data-route],template[data-route]';
            var scripts = document.querySelectorAll(templateSelector);
            Array.prototype.forEach.call(scripts, function (script) {
                var path = script.getAttribute('data-route'),
                    viewId = script.id,
                    viewUrl = (script.src ? script.src : script.getAttribute('data-src')),
                    pageType = script.getAttribute('data-page'),
                    modelName = script.getAttribute('data-model'),
                    controllerAdded = script.getAttribute('data-controller-added'),
                    viewEngine = app.getTemplateType(script),
                    defaultRoute = script.getAttribute('data-default-route'),
                    index = 0,
                    element,
                    settings = {};

                // If app.setup() is called more then once then make sure that routes
                // already defined are not going to be added again.
                if (controllerAdded !== null) {
                    return;
                }

                // Check that route-path is not empty and that the view engine if valid
                if (path === '') {
                    console.log(script);
                    app.showErrorAlert(new TypeError('A script element <script id="' + script.id + '" type="' + script.type + '" data-engine="' + script.getAttribute('data-engine') + '"> has the attribute [data-route] defined however the attribute value is empty. This error must be fixed, scripts that include a route path attribute must have the value defined.'));
                    return;
                } else if (viewEngine === ViewEngines.Unknown) {
                    console.log(script);
                    app.showErrorAlert(new TypeError('A script element <script id="' + script.id + '" type="' + script.type + '" data-engine="' + script.getAttribute('data-engine') + '" data-route="' + script.getAttribute('data-route') + '"> must have a valid engine type defined in [data-engine]. Valid values are [handlebars, vue, underscore, nunjucks, text].'));
                    return;
                }

                // If the script id attribute is missing and there is no src attribute
                // then create an id attribute in the format of 'template0', 'template1', ...
                if (viewId === '' && (viewUrl === '' || viewUrl === null)) {
                    do {
                        viewId = 'template' + index;
                        element = document.querySelector('#' + viewId);
                        if (element === null) {
                            script.id = viewId;
                        }
                        index++;
                    } while (script.id === '');
                }

                // A control is allowed to have only either a viewId or a viewUrl but not both
                if (viewUrl === '' || viewUrl === null) {
                    viewUrl = undefined;
                } else {
                    viewId = undefined;
                }

                // Convert core HTML 'data-*' attributes to a Controller Settings.
                // Values will be either bool or strings. Example:
                //   'data-url' becomes 'settings.url'
                //   'data-save-url' becomes 'settings.saveUrl'
                var skipProps = ['route', 'page', 'model', 'src', 'engine'];
                for (var prop in script.dataset) {
                    if (skipProps.indexOf(prop) === -1) {
                        var value = script.dataset[prop];
                        switch (value) {
                            case 'true':
                                settings[prop] = true;
                                break;
                            case 'false':
                                settings[prop] = false;
                                break;
                            default:
                                settings[prop] = value;
                        }
                    }
                }

                // Add a controller for the route
                try {
                    app.addController({
                        path: path,
                        viewId: viewId,
                        viewUrl: viewUrl,
                        viewEngine: viewEngine,
                        pageType: pageType,
                        modelName: modelName,
                        settings: settings,
                    });
                    if (defaultRoute !== null) {
                        app.settings.defaultRoute = path;
                    }
                } catch (e) {
                    app.showErrorAlert('Error from [app.setup()]: ' + e);
                    console.error(e);
                }

                // Update the script as having it's controller added
                script.setAttribute('data-controller-added', 'true');
            });

            // Handle hash changes and set the first view (active from url or default).
            // Note, if setup() is called twice addEventListener() does not create duplicate
            // Event Listeners because addEventListener() discards duplicate functions.
            if (routingMode === 'hash') {
                window.addEventListener('hashchange', handleRouteChange);
            } else {
                window.addEventListener('popstate', handleRouteChange);
            }
            handleRouteChange();
        }
    };

    // Assign [DataFormsJS] and [app] to the global variable space
    window.DataFormsJS = app;
    if (window.app === undefined) {
        window.app = app;
    } else {
        app.showErrorAlert('Warning - [window.app] is already defined, pages, plugins, etc. may not load correctly.');
    }

    // Setup the app when the page is ready
    document.addEventListener('DOMContentLoaded', function () {
        var condition = (Array.from && window.Promise && window.fetch && Promise.prototype.finally ? true : false);
        app.loadScript(condition, app.settings.polyfillUrl, app.setup);
    });
})();
