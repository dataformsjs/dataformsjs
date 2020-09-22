/**
 * Create a DataFormsJS Plugin that Generates and Saves an API Key on first use.
 *
 * The key will be saved to the user's local storage and submitted
 * with JSON Requests in the header ['Authorization' => 'Bearer {key}'].
 *
 * IMPORTANT - Storing Security Tokens in `localStorage` can be a security
 * risk for Cross Site Scripting (XSS) attacks so careful consideration
 * should be made in regards to storing tokens in a large public facing app.
 *
 * In general a "safe" alternative would be to store tokens in HttpOnly cookies,
 * however CSRF security concerns need to be taken into account when using HttpOnly cookies.
 * For this app the web service would have to be setup to use cookies, however currently
 * it uses the standard Authorization Header with a Bearer token.
 *
 * Another "safe" alternative for working with cookies would be using the [SameSite] Attribute
 * on the cookie from the server. That would not work in this case though because the
 * API is made avaialble to any site including localhost.
 *
 * Additionally Content Security Policy (CSP) can be used from the server to make sure
 * that third-party scripts cannot access the DOM.
 *
 * This app uses only temporary demo data with known JavaScript files so security
 * is not a concern for this demo. The demo database on the server is a SQLite
 * database in the system tmp directory. On server reboots it gets cleared
 * and logic is in place to clear the file if it gets too large.
 *
 * Even though security is not a priority for this demo, this app is secure
 * because transport of the Bearer Token occurs over HTTPS, there are no
 * unknown third-party scripts that could steal the token, and the token
 * is generated on the server from cryptographically secure pseudo-random bytes.
 */

/* Validates with both [jshint] and [eslint] */
/* global app */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function() {
    'use strict';

    /**
     * This plugin defines and looks up a Authorization
     * Bearer Token in `app.settings.requestHeaders`.
     */
    var apiKeyPlugin = {
        onRouteLoad: function(next) {
            // Check if loaded in memory
            var authHeader = 'Authorization';
            if (app.settings.requestHeaders[authHeader] !== undefined) {
                next();
                return;
            }

            // Update [fetch()] options - defaults to 'same-origin'
            app.settings.fetchOptions.credentials = 'include';

            // Load from Local Storage
            var keyName = 'entry-form-demo-api-key';
            var apiKey = localStorage.getItem(keyName);
            if (apiKey !== null) {
                app.settings.requestHeaders[authHeader] = 'Bearer ' + apiKey;
                next();
                return;
            }

            // Generate a new key using a Web Service
            var url = 'https://www.dataformsjs.com/data/example/entry-form/generate-key';
            app
            .fetch(url)
            .then(function(data) {
                if (data.errorMessage) {
                    throw data.errorMessage;
                }
                app.settings.requestHeaders[authHeader] = 'Bearer ' + data.key;
                localStorage.setItem(keyName, data.key);
                next();
            })
            .catch(function(error) {
                app.showErrorAlert(error);
            });
        },

        // Allow user to reset key in case of error
        onRendered: function () {
            var btn = document.querySelector('.btn.reset-data');
            if (btn) {
                btn.onclick = function () {
                    localStorage.removeItem('entry-form-demo-api-key');
                    // NOTE - `reload(forcedReload: boolean)` is now deprecated so some editors
                    // such as VS Code will show a line through it and only `reload()` is needed
                    // on modern browsers, however it is still included here because it improves
                    // the behavior for older Browsers. For example when using `reload(true)`
                    // IE 11 will send a [Cache-Control: no-cache] Request Header while calling
                    // only `reload()` will not send the header.
                    window.location.reload(true);
                };
            }
        },
    };
    app.addPlugin('apiKey', apiKeyPlugin);
})();