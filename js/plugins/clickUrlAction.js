/**
 * DataFormsJS Plugin [clickUrlAction]
 *
 * This plugin allows for click elements (buttons, links, etc) to be defined
 * with the attributes [data-click-url] and [data-action] to make a request
 * to a web service and then preform an action once complete.
 *
 * If a button is used it will be disabled during the request however this
 * plugin currently does not provide the option for a loading indicator so
 * it is intended for fast web services.
 *
 * Examples:
 *     <span data-click-url="{url}" data-action="reload-page">
 *     <span data-click-url="{url}" data-action="refresh-plugins">
 *     <span data-click-url="{url}" data-action="update-view" data-request-method="POST">
 *     <span data-click-url="{url}" data-action="refresh-html-controls">
 *     <span data-click-url="{url}" data-action="call-function" data-function="{name}">
 *
 * When using Vue [data-action] is not required and only "reload-page" is supported.
 */

/* Validates with both [jshint] and [eslint] */
/* global app */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';

    /**
     * Handle [data-click-url] elements
     * @param {Event} e
     */
    function handleClickUrl(e) {
        // Prevent form posts.
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        // Read and validate attribute properties
        var el = e.target;
        var url = el.getAttribute('data-click-url');
        if (url === '') {
            app.showErrorAlert('Missing URL in Attribute [data-click-url].');
            console.log(el);
            return;
        }

        var usingVue = app.isUsingVue();
        var action = el.getAttribute('data-action');
        var validActions = ['reload-page', 'refresh-plugins', 'call-function'];
        if (!usingVue) {
            validActions.push('update-view');
            validActions.push('refresh-html-controls');
        }
        if (!action) {
            if (!usingVue) {
                // Vue doesn't require an action because the HTML will be
                // updated by an data returned from the web service.
                app.showErrorAlert('Element with [data-click-url] is missing attribute or value for [data-action].');
                console.log(el);
                return;
            }
        } else if (validActions.indexOf(action) === -1) {
            app.showErrorAlert('Invalid value of "' + action + '" found in [data-action]. Valid values are [' + validActions.join(', ') + '].');
            console.log(el);
            return;
        }

        // If using 'call-function' validate the a function is specified and that it exists
        var fnName = null;
        if (action === 'call-function') {
            fnName = el.getAttribute('data-function');
            if (fnName === null) {
                app.showErrorAlert('Missing [data-function] for [data-action="call-function"]. Check DevTools Console.');
                console.log(el);
                return;
            } else if (window[fnName] === undefined) {
                app.showErrorAlert('Function [data-function="' + fnName + '"] for [data-action="call-function"] does not exist.');
                console.log(el);
                return;
            } else if (typeof window[fnName] !== 'function') {
                app.showErrorAlert('A function was specified [data-function="' + fnName + '"] for [data-action="call-function"] however the variable is a [' + (typeof window[fnName]) + '] and not a function.');
                console.log(el);
                console.log(fnName);
                console.log(window[fnName])
                return;
            }
        }

        // GET, POST, etc. It's up the the developer for this to be valid based on the server.
        var requestMethod = el.getAttribute('data-request-method');
        requestMethod = (requestMethod === null ? 'GET' : requestMethod);

        // Make the request
        app
        .fetch(url, { method: requestMethod })
        .then(function(data) {
            // Check if Vue is being used
            var usingVue = (app.activeVueModel !== null);

            // Copy properties from the JSON Service back to the Active Model
            if (usingVue) {
                Object.assign(app.activeVueModel, data);
            } else {
                Object.assign(app.activeModel, data);
            }

            // Handle action to update the page
            switch (action) {
                case 'reload-page':
                    // NOTE - `reload(forcedReload: boolean)` is now deprecated so some editors
                    // such as VS Code will show a line through it and only `reload()` is needed
                    // on modern browsers, however it is still included here because it improves
                    // the behavior for older Browsers. For example when using `reload(true)`
                    // IE 11 will send a [Cache-Control: no-cache] Request Header while calling
                    // only `reload()` will not send the header.
                    window.location.reload(true);
                    break;
                case 'refresh-plugins':
                    app.refreshPlugins();
                    break;
                case 'call-function':
                    window[fnName]();
                    break;
                case 'update-view':
                    if (!usingVue) {
                        app.updateView();
                    }
                    break;
                case 'refresh-html-controls':
                    if (!usingVue) {
                        app.refreshAllHtmlControls();
                    }
                    break;
            }
        })
        .catch(function(error) {
            app.showErrorAlert(error);
        });
    }

    /**
     * Add plugin function
     */
    app.addPlugin('clickUrlAction', function (element) {
        // Get document or use specific element
        element = (element === undefined ? document : element);

        // Setup events
        var elements = element.querySelectorAll('[data-click-url]');
        Array.prototype.forEach.call(elements, function(el) {
            el.addEventListener('click', handleClickUrl);
        });
    });
})();
