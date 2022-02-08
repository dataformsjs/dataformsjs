/**
 * DataFormsJS JsonData Page Class
 *
 * This is a class-based version of the core framework file [js/pages/jsonData.js].
 * All variables and functions from the original file exist here. The reason this
 * file exists is so that an app can extend this class for custom page logic.
 * 
 * Example usage if extending:
 *   class MyPage extends JsonData {
 *       onRendered() {
 *           console.log('MyPage.onRendered()')
 *       }
 *   }
 *   app.addPage('MyPage', MyPage);  
 */

/*
    Validates with both [jshint] and [eslint]
    For [eslint] use "ECMA Version" = 2015 or higher
*/
/* global app */
/* jshint esversion: 6 */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

/**
 * JsonData Page Class
 */
class JsonData {
    constructor() {
        // URL Template for the JSON Service.
        // This can be an actual URL such as '/order/123',
        // or a template with named parameters such as '/order/:id'.
        this.url = '';

        // URL that was last used when fetchData() was called.
        // This is a public property however the calling app should not overwrite it.
        this.submittedFetchUrl = '';
        this.submittedFetchParams = ''; // For use with GraphQL

        // Properties to handle the model state. These are set when the
        // route first loads and when the model is updated however they
        // can also be overridden by the web service.
        this.isLoading = false;
        this.isLoaded = false;
        this.hasError = false;
        this.errorMessage = null;

        // If defined downloaded data will be set to the specified model property
        // otherwise by default data will be copied to the root model object.
        this.prop = null;

        // By default the JSON Service will be called each time the page is loaded.
        // This allows data driven sites to always fetch the most recent data when the
        // Page's URL hash changes. If the page only needs to have it data download
        // once the first time the URL is visited then setting this property to true
        // changes the default behavior so it is only downloaded once and then cached
        // in-memory. This property can also be defined in the script element using
        // the attribute [data-load-only-once].
        this.loadOnlyOnce = false;

        // Default error messages, these can be changed from the calling app or for specific routes.
        this.errorTextMissingUrl = 'Error, unable to fetch data. No URL [data-route | model.url | graphql] was specified for this current route.';
        this.errorTextFetchError = 'An error has occurred loading the data. Please refresh the page to try again and if the problem continues contact support.';
        this.errorTextGraphQLErrors = '{count} GraphQL Errors occurred. See [app.activeModel.errors] in console for full details.';

        // Total event count for the model and fetch times of the last web service calls.
        // These are public properties however the calling app should not overwrite them.
        this.fetchTimeStart = null;
        this.fetchTimeComplete = null;
        this.loadCount = 0;
        this.errorCount = 0;

        // Callback Events that allow JavaScript functions or objects
        // using this class to handle web service events
        this.onFetch = null;
        this.onError = null;

        // GraphQL Options
        this.graphqlQuery = null;
        this.graphqlId = null;
        this.graphqlSrc = null;
    }

    /**
     * CSS loaded if using <template> instead of Handlebars, Vue, etc
     */
    css() {
        return `
            .dataformsjs-view-loading .is-loaded { display:none; }
            .dataformsjs-view-loading .has-error { display:none; }
            .dataformsjs-view-loaded .is-loading { display:none; }
            .dataformsjs-view-loaded .has-error { display:none; }
            .dataformsjs-view-error .is-loading { display:none; }
            .dataformsjs-view-error .is-loaded { display:none; }
        `;
    }

    /**
     * Return the how long the web service took if called in Milliseconds.
     * To return the value in seconds use (model.fetchTimeInMilliseconds() / 1000).
     * Returns -1 if the web service has never been called.
     *
     * @return {number}
     */
    fetchTimeInMilliseconds() {
        // Check if the web service has been called and valid time values exist
        if (this.fetchTimeStart === null || this.fetchTimeComplete === null || !this.fetchTimeStart.getTime || !this.fetchTimeComplete.getTime) {
            return -1;
        } else {
            // Return the time difference in milliseconds
            return this.fetchTimeComplete.getTime() - this.fetchTimeStart.getTime();
        }
    }

    /**
     * Fetch data from the web service and update the model. This function gets called
     * automatically from the controller [onRouteLoad()] function and controllers
     * or plugins can call it to manually refresh data on a page.
     */
    fetchData() {
        // Validate that a URL is specified
        if (!this.url) {
            // Set model properties for a error
            this.isLoading = false;
            this.isLoaded = false;
            this.hasError = true;
            this.errorMessage = this.errorTextMissingUrl;
            this.setViewClass('error');

            // Update the view, unless this function is being
            // called from onRouteLoad(). The reason that the
            // view is not being updated on onRouteLoad() is
            // because updateView() is called as soon as this function
            // finishes so there is no need to call it twice. If the
            // calling application manually calls this function with
            // URL not set then the view would be updated here.
            if (this.loadCount !== 0 || this.errorCount !== 0) {
                app.updateView();
            }
            return;
        }

        // Set prop so the template can show the user that data is loading
        this.isLoading = true;
        this.setViewClass('loading');

        // Reset fetch times
        this.fetchTimeStart = new Date();
        this.fetchTimeComplete = null;

        // Build Request URL
        this.submittedFetchUrl = (this.graphqlQuery ? this.url : app.buildUrl(this.url));
        this.submittedFetchParams = JSON.stringify(app.activeParameterList);

        // If using GraphQL then POST the Query and Variables.
        // Otherwise a GET request is made.
        let init = null;
        if (this.graphqlQuery) {
            // For GraphQL if the page is being viewed directly from the file system or in an
            // 'about:blank' page then use a GET request instead of a POST. This will only work
            // for GraphQL Services that send CORS '*' and do not use Authentication. This feature
            // is not needed by most apps but can be used by local development or for downloaded pages.
            if (window.location.origin === 'file://' || window.location.origin === 'null') {
                this.submittedFetchUrl += (this.submittedFetchUrl.indexOf('?') === -1 ? '?' : '&');
                this.submittedFetchUrl += 'query=' + encodeURIComponent(this.graphqlQuery.trim());
                this.submittedFetchUrl += '&variables=' + encodeURIComponent(JSON.stringify(app.buildGraphQLVariables(this.graphqlQuery, app.activeParameterList)));
            } else {
                init = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: this.graphqlQuery,
                        variables: app.buildGraphQLVariables(this.graphqlQuery, app.activeParameterList),
                    }),
                };
            }
        }

        // Make the JSON Request
        app
        .fetch(this.submittedFetchUrl, init)
        .then(data => {
            // Make sure the response sent an object or array. This file expects
            // 'application/json' and not 'text/plain' and other response types.
            if (!(typeof data === 'object' || data === null)) {
                throw new TypeError('Invalid Response type. Received data in format of [' + (typeof data) + ']');
            }

            // Stats
            this.fetchTimeComplete = new Date();
            this.loadCount++;

            // Set initial props for a successful json request
            this.isLoading = false;
            this.isLoaded = true;
            this.hasError = false;
            this.errorMessage = null;
            this.setViewClass('loaded');

            // Copy all attributes from the json response to the model.
            // This allows the server to overwrite any of the existing
            // properties. For example if the server wants to handle
            // errors and return them as json it should return
            //     { hasError:true, errorMessage:'Error...' }
            // or
            //     { isLoaded:false, hasError:true, errorMessage:'Error...' }
            if (!this.graphqlQuery) {
                if (typeof this.prop === 'string') {
                    this[this.prop] = data;
                } else {
                    Object.assign(this, data);
                }
            } else {
                // If using GraphQL then copy from the [data] property and
                // define [errors] if any were returned.
                if (typeof this.prop === 'string') {
                    this[this.prop] = data.data;
                    if (data.errors) {
                        this[this.prop].errors = data.errors;
                    }
                } else {
                    Object.assign(this, data.data);
                    if (data.errors) {
                        this.errors = data.errors;
                    }
                }

                // GraphQL can return both valid data and errors at the same time.
                // If using a template such as Handlebars they can be both handled
                // at the same time however if using JS only then [setViewClass()]
                // can only show one state.
                if (data.errors && data.errors.length) {
                    if (data.errors.length === 1 && data.errors[0].message) {
                        this.errorMessage = '[GraphQL Error]: ' + data.errors[0].message;
                    } else {
                        this.errorMessage = this.errorTextGraphQLErrors.replace('{count}', data.errors.length);
                    }
                    this.hasError = true;
                    this.setViewClass('error');
                    if (typeof this.onError === 'function') {
                        this.onError();
                    }
                }
            }

            // Call the onFetch() function if one is defined. [onFetch()] would
            // be defined by function or object using this class.
            if (typeof this.onFetch === 'function') {
                this.onFetch(data);
            }

            // Update the view
            app.updateView();
        })
        .catch(() => {
            // Stats
            this.fetchTimeComplete = new Date();
            this.errorCount++;

            // Set props for an error with the json request
            this.isLoading = false;
            this.isLoaded = false;
            this.hasError = true;
            this.errorMessage = this.errorTextFetchError;
            this.setViewClass('error');

            // Call the onError() function if one is defined. [onError()] would
            // be defined by function or object using this class.
            if (typeof this.onError === 'function') {
                this.onError();
            }

            // Update the view
            app.updateView();
        });
    }

    /**
     * Set CSS on the View Element.
     * This only makes changes for <template> views.
     * This function gets called automatically when data
     * is loading, has loaded, during errors, and when
     * the page is unloaded.
     *
     * @param {string|null} state
     */
    setViewClass(state) {
        // Only load CSS if using <template>
        if (app.activeController.viewEngine !== 'Text') {
            return;
        }
        const view = document.querySelector(app.settings.viewSelector);
        if (view === null) {
            return;
        }

        // Hide elements if view is unloading otherwise they can quickly flash
        // on screen once the root 'dataformsjs-view-*' classes are removed.
        if (state === null) {
            const elements = view.querySelectorAll('.is-loading, .has-error, .is-loaded');
            for (const el of elements) {
                el.style.display = 'none';
            }
        }

        // Create CSS and Update View
        app.loadCss('dataformsjs-view-jsondata', this.css());
        view.classList.remove('dataformsjs-view-loading');
        view.classList.remove('dataformsjs-view-error');
        view.classList.remove('dataformsjs-view-loaded');
        if (state !== null) {
            view.classList.add('dataformsjs-view-' + state);
        }
    }

    /**
     * This function gets called automatically from the [controller.onRouteUnload()]
     * event and simply removes CSS if set on the main view element.
     */
    unloadView() {
        this.setViewClass(null);
    }

    /**
     * Load data when the route is changed.
     * This gets assigned to the controller of the route.
     * The [this] reference refers to the routes model object.
     *
     * When using templating such as Handlebars this gets called
     * before any HTML is rendered and when using Vue this gets called
     * on [mounted] after the Vue instance is created.
     */
    onRouteLoad() {
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
            app
            .getGraphQL(this.graphqlId, this.graphqlSrc)
            .then(query => {
                this.graphqlQuery = query;
                this.fetchData();
            })
            .catch(error => {
                app.showErrorAlert(error);
                this.fetchData();
            });
        } else {
            this.fetchData();
        }
    }

    /**
     * Gets called when a route is unloaded, this function can be
     * overwritten by an inherited page object.
     */
    onRouteUnload() {
        this.unloadView();
    }
}

/**
 * Add Page to DataFormsJS
 */
app.addPage('JsonData', JsonData);
