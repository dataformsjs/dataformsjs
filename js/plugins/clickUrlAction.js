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
 *     <span data-click-url="{url}" data-action="update-view" data-request-method="POST">
 *     <span data-click-url="{url}" data-action="refresh-html-controls">
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

        var usingVue = (app.activeVueModel !== null);
        var action = el.getAttribute('data-action');
        var validActions = (usingVue ? ['reload-page'] : ['reload-page', 'update-view', 'refresh-html-controls']);
        if (!action) {
            if (!usingVue) {
                app.showErrorAlert('Element with [data-click-url] is missing attribute or value for [data-action].');
                console.log(el);
                return;    
            }
        } else if (validActions.indexOf(action) === -1) {
            app.showErrorAlert('Invalid value of "' + action + '" found in [data-action]. Valid values are [' + validActions.join(', ') + '].');
            console.log(el);
            return;
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
                    window.location.reload(true);
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
