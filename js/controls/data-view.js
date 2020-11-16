/**
 * DataFormsJS <data-view> JavaScript Control
 *
 * This control is designed for compatibility with the DataFormsJS Web Component
 * [js/web-components/data-view.js] and includes the ability for basic templating
 * from HTML using a template syntax based on JavaScript template literals (template strings).
 *
 * When [js/web-components/polyfill.js] is used for DataFormsJS Web Component
 * this file will be downloaded and used.
 *
 * The script [js/extensions/jsTemplate.js] is required when using templating
 * and is handled automatically by [polyfill.js]. To use the the standard
 * Framework simply make sure the script is included from [app.lazyLoad]
 * before the page loads.
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
     * DataFormsJS <data-view> Control
     */
    var dataView = {
        /**
         * Data for the control
         */
        data: {
            bind: null,
            templateSelector: null,
            templateReturnsHtml: null,
            name: null,
        },

        /**
         * Event that gets called when a <data-view> is rendered on screen
         *
         * @this dataList.data
         * @param {object} model
         */
        html: function(model) {
            // Get Table from the Model. If using format of "object.prop"
            // then the [dataBind] plugin (if available) will used to get the data.
            if (this.bind === null) {
                return '';
            }
            var data = (this.bind === true ? model : (model && model[this.bind] ? model[this.bind] : null));
            if (data === null && app.plugins.dataBind !== undefined && typeof app.plugins.dataBind.getBindValue === 'function') {
                data = app.plugins.dataBind.getBindValue(this.bind, model);
            }
            if (data === null) {
                return '';
            }

            function showError(message) {
                return '<div style="color:white; background-color:red; padding:0.5rem 1rem; margin:.5rem;">' + app.escapeHtml(message) + '</div>';
            }

            // Validate data type (must be object or an array)
            if (typeof data !== 'object') {
                return showError('Invalid data type for <data-view>, expected object or array but was passed: ' + typeof data);
            }

            // Get and validate the template
            if (this.templateSelector === null) {
                return showError('Missing Attribute [data-template-selector] for <data-view>.');
            }
            var template = document.querySelector(this.templateSelector);
            if (template === null) {
                return showError('Missing template from selector: ' + this.templateSelector);
            }
            if (!(template.nodeName === 'TEMPLATE' || (template.nodeName === 'SCRIPT' && template.type === 'text/x-template'))) {
                return showError('Element at selector [' + this.templateSelector + '] needs to point to a <template> or a <script type="text/x-template"> element');
            }

            try {
                // Create a JavaScript function based on the template (compile the template)
                var render = app.jsTemplate.compile(this.name, this.templateReturnsHtml, template.innerHTML);
                try {
                    // Render and return html using data and the template function
                    return render(data, null, app.escapeHtml, app.format);
                } catch (e) {
                    return showError('Error Evaluating Template - ' + e.message);
                }
            } catch (e) {
                return showError('Error Rendering Template - ' + e.message);
            }
        },
    };

    /**
     * Add control to app
     */
    app.addControl('data-view', dataView);
})();
