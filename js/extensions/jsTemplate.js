/**
 * DataFormsJS [app.jsTemplate] Extension
 *
 * When using Web Components JavaScript template literals (template strings)
 * are used so this is a basic replacement for the original function.
 * It converts basic templates but will not handle advanced templates.
 *
 * This is not intended as a full featured templating engine rather
 * it's created for a specific purpose to be used with DataFormsJS
 * Framework JS Controls <data-list>, <data-table>, and <data-view>.
 *
 * Example Usage:
 *     var returnsHtml = false;
 *     var render = app.jsTemplate.compile(null, returnsHtml, template.innerHTML);
 *     var render = app.jsTemplate.compile('record', returnsHtml, template.innerHTML);
 *     html.push(render(item, index, app.escapeHtml, app.format));
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
     * Caching is used to speed up repeated calls using the same template.
     * A large key consisting of the template string is used.
     *
     * As of October 2020 tests showed that this speed up template
     * creating by about ~25x with Chrome and 6x for IE 11.
     */
    var templateCache = {};

    function addError(key, message) {
        templateCache[key] = {
            hasError: true,
            errorMessage: message,
        };
        throw Error(message);
    }

    /**
     * Add [jsTemplate] object to the DataFormsJS [app] object
     */
    app.jsTemplate = {
        /**
         * Compile the template and return the function for rendering
         * 
         * @param {string|null} itemName 
         * @param {boolean} returnsHtml
         * @param {string} tmplHtml 
         * @return {function}
         */
        compile: function(itemName, returnsHtml, tmplHtml) {
            // Get from Cache
            var key = String(itemName) + '|' + tmplHtml;
            var tmpl = templateCache[key];
            if (tmpl !== undefined) {
                if (tmpl.hasError) {
                    throw Error(tmpl.errorMessage);
                }
                return tmpl.fn;
            }

            // Build the template
            var tmplJs = [];
            var startPos;
            var lastIndex = 0;
            var value;
            if (tmplHtml.includes('render`') || tmplHtml.includes('=> {') || tmplHtml.includes('=>{')) {
                addError(key, 'Error - Modern JavaScript Script Templates are only supported with DataFormsJS Web Components and are not supported when using [polyfill.js] or the DataFormsJS Framework.');
            }
            while ((startPos = tmplHtml.indexOf('${', lastIndex)) > -1) {
                // Parse
                var nextStart = tmplHtml.indexOf('{', startPos + 2);
                var nextEnd = tmplHtml.indexOf('}', startPos + 2);
                if (nextStart < nextEnd && nextStart !== -1) {
                    // Handle nested brackets
                    while (nextStart < nextEnd && nextStart !== -1) {
                        nextStart = tmplHtml.indexOf('{', nextEnd + 1);
                        nextEnd = tmplHtml.indexOf('}', nextEnd + 1);
                    }
                }
                value = tmplHtml.substring(startPos + 2, nextEnd);

                // Add HTML and Value
                tmplJs.push(JSON.stringify(tmplHtml.substring(lastIndex, startPos)));
                if (returnsHtml) {
                    tmplJs.push('String(' + value.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<') + ')');
                } else {
                    tmplJs.push('String(app.escapeHtml(' + value + '))');
                }
                lastIndex = startPos + value.length + 3;
            }
            // Add remaining template string
            tmplJs.push(JSON.stringify(tmplHtml.substring(lastIndex, tmplHtml.length)));

            // Look for unmatched escape characters "${"
            for (var x = 0, y = tmplJs.length; x < y; x++) {
                var text = tmplJs[x];
                if (!text.startsWith('String(app.escapeHtml(') && text.includes('${')) {
                    addError(key, 'Invalid expression: missing `}` character');
                }
            }

            // Compile (create a new Function), add to Cache, and return the function
            try {
                var fn;
                if (itemName) {
                    fn = new Function(itemName, 'index', 'escapeHtml', 'format', 'return ' + tmplJs.join(' + '));
                } else {
                    fn = new Function('item', 'index', 'escapeHtml', 'format', 'with(item){return ' + tmplJs.join(' + ') + '}');
                }
                templateCache[key] = { fn:fn, hasError:false };
                return fn;
            } catch (e) {
                addError(key, e.message);
            }
        }
    };
})();