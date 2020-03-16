/**
 * DataFormsJS jsonData Page Object
 *
 * This is a core framework file and will be included with [DataForms.js] for
 * most apps and sites. This page defines the model and controller that can
 * be used for generic JSON web services. Often when creating custom pages
 * for DataFormsJS they will be based on this file.
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
     * CSS loaded if using <template> instead of Handlebars, Vue, etc
     */
    var css = '.dataformsjs-view-loading .is-loaded { display:none; }';
    css += ' .dataformsjs-view-loading .has-error { display:none; }';
    css += ' .dataformsjs-view-loaded .is-loading { display:none; }';
    css += ' .dataformsjs-view-loaded .has-error { display:none; }';
    css += ' .dataformsjs-view-error .is-loading { display:none; }';
    css += ' .dataformsjs-view-error .is-loaded { display:none; }';

    /**
     * jsonData Page Object
     */
    var jsonData = {
        /**
         * Define the model object for the page. This object ends up being
         * a template object which gets created for each route that uses it.
         */
        model: {
            // URL Template for the JSON Service.
            // This can be an actual URL such as '/order/123',
            // or a template with named parameters such as '/order/:id'.
            url: '',

            // URL that was last used when fetchData() was called.
            // This is a public property however the calling app should not overwrite it.
            submittedFetchUrl: '',
            submittedFetchParams: '', // For use with GraphQL

            // Properties to handle the model state. These are set when the
            // route first loads and when the model is updated however they
            // can also be overridden by the web service.
            isLoading: false,
            isLoaded: false,
            hasError: false,
            errorMessage: null,

            // If defined downloaded data will be set to the specified model property
            // otherwise by default data will be copied to the root model object.
            prop: null,

            // By default the JSON Service will be called each time the page is loaded.
            // This allows data driven sites to always fetch the most recent data when the
            // Page's URL hash changes. If the page only needs to have it data download
            // once the first time the URL is visited then setting this property to true
            // changes the default behavior so it is only downloaded once and then cached
            // in-memory. This property can also be defined in the script element using
            // the attribute [data-load-only-once="true"].
            loadOnlyOnce: false,

            // Default error messages, these can be changed from the calling app or for specific routes.
            errorTextMissingUrl: 'Error, unable to fetch data. No URL [data-route | model.url | graphql] was specified for this current route.',
            errorTextFetchError: 'An error has occurred loading the data. Please refresh the page to try again and if the problem continues contact support.',
            errorTextGraphQLErrors: '{count} GraphQL Errors occured. See [app.activeModel.errors] in console for full details.',

            // Total event count for the model and fetch times of the last web service calls.
            // These are public properties however the calling app should not overwrite them.
            fetchTimeStart: null,
            fetchTimeComplete: null,
            loadCount: 0,
            errorCount: 0,

            // Callback Events that allow JavaScript functions or objects
            // using this class to handle web service events
            onFetch: null,
            onError: null,

            // GraphQL Options
            graphqlQuery: null,
            graphqlId: null,
            graphqlSrc: null,

            /**
             * Return the how long the web service took if called in Milliseconds.
             * To return the value in seconds use (model.fetchTimeInMilliseconds() / 1000).
             * Returns -1 if the web service has never been called.
             *
             * @return {number}
             */
            fetchTimeInMilliseconds: function () {
                // Check if the web service has been called and valid time values exist
                if (this.fetchTimeStart === null || this.fetchTimeComplete === null || !this.fetchTimeStart.getTime || !this.fetchTimeComplete.getTime) {
                    return -1;
                } else {
                    // Return the time difference in milliseconds
                    return this.fetchTimeComplete.getTime() - this.fetchTimeStart.getTime();
                }
            },

            /**
             * Fetch data from the web service and update the model. This function gets called
             * automatically from the controller [onRouteLoad()] function and controllers
             * or plugins can call it to manually refresh data on a page.
             */
            fetchData: function () {
                // Set a reference to the current model object so that the
                // fetch service can reference it from closure functions.
                var model = this;

                // Validate that a URL is specified
                if (!model.url) {
                    // Set model properties for a error
                    model.isLoading = false;
                    model.isLoaded = false;
                    model.hasError = true;
                    model.errorMessage = model.errorTextMissingUrl;
                    model.setViewClass('error');

                    // Update the view, unless this function is being
                    // called from onRouteLoad(). The reason that the
                    // view is not being updated on onRouteLoad() is
                    // because updateView() is called as soon as this function
                    // finishes so there is no need to call it twice. If the
                    // calling application manually calls this function with
                    // URL not set then the view would be updated here.
                    if (model.loadCount !== 0 || model.errorCount !== 0) {
                        app.updateView();
                    }
                    return;
                }

                // Set prop so the template can show the user that data is loading
                model.isLoading = true;
                model.setViewClass('loading');

                // Reset fetch times
                model.fetchTimeStart = new Date();
                model.fetchTimeComplete = null;

                // Build Request URL
                model.submittedFetchUrl = (model.graphqlQuery ? model.url : app.buildUrl(model.url));
                this.submittedFetchParams = JSON.stringify(app.activeParameterList);

                // If using GraphQL then POST the Query and Variables.
                // Otherwise a GET request is made.
                var init = null;
                if (model.graphqlQuery) {
                    // For GraphQL if the page is being viewed directly from the file system or in an
                    // 'about:blank' page then use a GET request instead of a POST. This will only work
                    // for GraphQL Services that send CORS '*' and do not use Authentication. This feature
                    // is not needed by most apps but can be used by local development or for downloaded pages.
                    if (window.location.origin === 'file://' || window.location.origin === 'null') {
                        model.submittedFetchUrl += (model.submittedFetchUrl.indexOf('?') === -1 ? '?' : '&');
                        model.submittedFetchUrl += 'query=' + encodeURIComponent(model.graphqlQuery.trim());
                        model.submittedFetchUrl += '&variables=' + encodeURIComponent(JSON.stringify(app.buildGraphQLVariables(model.graphqlQuery, app.activeParameterList)));
                    } else {
                        init = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                query: model.graphqlQuery,
                                variables: app.buildGraphQLVariables(model.graphqlQuery, app.activeParameterList),
                            }),
                        };
                    }
                }

                // Make the JSON Request
                app
                .fetch(model.submittedFetchUrl, init)
                .then(function(data) {
                    // Make sure the response sent an object or array. This file expects
                    // 'application/json' and not 'text/plain' and other response types.
                    if (!(typeof data === 'object' || data === null)) {
                        throw new TypeError('Invalid Response type. Received data in format of [' + (typeof data) + ']');
                    }

                    // Stats
                    model.fetchTimeComplete = new Date();
                    model.loadCount++;

                    // Set initial props for a successfull json request
                    model.isLoading = false;
                    model.isLoaded = true;
                    model.hasError = false;
                    model.errorMessage = null;
                    model.setViewClass('loaded');

                    // Copy all attributes from the json response to the model.
                    // This allows the server to overwrite any of the existing
                    // properties. For example if the server wants to handle
                    // errors and return them as json it should return
                    //     { hasError:true, errorMessage:'Error...' }
                    // or
                    //     { isLoaded:false, hasError:true, errorMessage:'Error...' }
                    if (!model.graphqlQuery) {
                        if (typeof model.prop === 'string') {
                            model[model.prop] = data;
                        } else {
                            Object.assign(model, data);
                        }
                    } else {
                        // If using GraphQL then copy from the [data] property and
                        // define [errors] if any were returned.
                        if (typeof model.prop === 'string') {
                            model[model.prop] = data.data;
                            if (data.errors) {
                                model[model.prop].errors = data.errors;
                            }
                        } else {
                            Object.assign(model, data.data);
                            if (data.errors) {
                                model.errors = data.errors;
                            }
                        }

                        // GraphQL can return both valid data and errors at the same time.
                        // If using a template such as Handlebars they can be both handled
                        // at the same time however if using JS only then [setViewClass()]
                        // can only show one state.
                        if (data.errors && data.errors.length) {
                            if (data.errors.length === 1 && data.errors[0].message) {
                                model.errorMessage = '[GraphQL Error]: ' + data.errors[0].message;
                            } else {
                                model.errorMessage = model.errorTextGraphQLErrors.replace('{count}', data.errors.length);
                            }
                            model.hasError = true;
                            model.setViewClass('error');
                            if (typeof model.onError === 'function') {
                                model.onError();
                            }
                        }
                    }

                    // Call the onFetch() function if one is defined. [onFetch()] would
                    // be defined by function or object using this class.
                    if (typeof model.onFetch === 'function') {
                        model.onFetch(data);
                    }

                    // Update the view
                    app.updateView();
                })
                .catch(function () {
                    // Stats
                    model.fetchTimeComplete = new Date();
                    model.errorCount++;

                    // Set props for an error with the json request
                    model.isLoading = false;
                    model.isLoaded = false;
                    model.hasError = true;
                    model.errorMessage = model.errorTextFetchError;
                    model.setViewClass('error');

                    // Call the onError() function if one is defined. [onError()] would
                    // be defined by function or object using this class.
                    if (typeof model.onError === 'function') {
                        model.onError();
                    }

                    // Update the view
                    app.updateView();
                });
            },

            /**
             * Set CSS on the View Element.
             * This only makes changes for <template> views.
             * This function gets called automatically when data
             * is loading, has loaded, during errors, and when
             * the page is unloaded.
             *
             * @param {string|null} state
             */
            setViewClass: function(state) {
                // Only load CSS if using <template>
                if (app.activeController.viewEngine !== 'Text') {
                    return;
                }
                var view = document.querySelector(app.settings.viewSelector);
                if (view === null) {
                    return;
                }

                // Create CSS and Update View
                app.loadCss('dataformsjs-view-jsondata', css);
                view.classList.remove('dataformsjs-view-loading');
                view.classList.remove('dataformsjs-view-error');
                view.classList.remove('dataformsjs-view-loaded');
                if (state !== null) {
                    view.classList.add('dataformsjs-view-' + state);
                }
            },

            /**
             * This function gets called automatically from the [controller.onRouteUnload()]
             * event and simply removes CSS if set on the main view element.
             */
            unloadView: function () {
                this.setViewClass(null);
            },
        }, // End of object [model]

        /**
         * Load data when the route is changed.
         * This gets assigned to the controller of the route.
         * The [this] reference refers to the routes model object.
         *
         * When using templating such as Handlebars this gets called
         * before any HTML is rendered and when using Vue this gets called
         * on [mounted] after the Vue instance is created.
         */
        onRouteLoad: function () {
            // If loadOnlyOnce is set to false or if the named parameter
            // URL does not match the previously submitted URL then clear
            // properties so the template will reload the data.
            if (!this.loadOnlyOnce ||
                this.submittedFetchUrl !== app.buildUrl(this.url) ||
                this.submittedFetchParams !== JSON.stringify(app.activeParameterList)
            ) {
                this.isLoaded = false;
                this.hasError = false;
            }

            // Exit if data for the model has already loaded
            if (this.isLoaded) {
                this.setViewClass('loaded');
                return;
            }

            // Make the web service request
            if (this.graphqlId || this.graphqlSrc) {
                // Assign URL from App Settings
                if (!this.url) {
                    this.url = app.settings.graphqlUrl;
                }

                // Get the GraphQL Script
                var model = this;
                app
                .getGraphQL(model.graphqlId, model.graphqlSrc)
                .then(function(query) {
                    model.graphqlQuery = query;
                    model.fetchData();
                })
                .catch(function(error) {
                    app.showErrorAlert(error);
                    model.fetchData();
                });
            } else {
                this.fetchData();
            }
        },

        /**
         * Gets called when a route is unloaded, this function can be
         * overwritten by an inherited page object.
         */
        onRouteUnload: function () {
            this.unloadView();
        },
    };

    /**
     * Add Page to DataFormsJS
     */
    app.addPage('jsonData', jsonData);
})();
