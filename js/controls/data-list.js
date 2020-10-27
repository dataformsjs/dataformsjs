/**
 * DataFormsJS <data-list> JavaScript Control
 *
 * This control is designed for compatibility with the DataFormsJS Web Component
 * [js/web-components/data-list.js] and includes the ability for basic templating
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
     * DataFormsJS <data-list> Control
     */
    var dataList = {
        /**
         * Data for the control
         */
        data: {
            bind: null,
            templateSelector: null,
            rootElement: null,
            rootAttr: null,
            errorClass: null,
            templateReturnsHtml: null,
            listItemName: null,
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

            function showError(error, element) {
                addError(error, element)
                closeElement();
                return html.join('');
            }

            function getAttrHtml() {
                if (control.rootAttr === null) {
                    return '';
                }
                var rootAttr = control.rootAttr.split(',').map(function(s) { return s.trim(); });
                var html = '';
                for (var n = 0, m = rootAttr.length; n < m; n++) {
                    var attr = rootAttr[n];
                    var pos = attr.indexOf('=');
                    if (pos > 1) {
                        var name = attr.substr(0, pos).trim();
                        var value = attr.substr(pos+1).trim();
                        html += ' ' + app.escapeHtml(name) + '="' + app.escapeHtml(value) + '"';
                    } else {
                        html += ' ' + app.escapeHtml(attr);
                    }
                }
                return html;
            }

            // Get Table from the Model. If using format of "object.prop"
            // then the [dataBind] plugin (if available) will used to get the data.
            var list = (model && model[this.bind] ? model[this.bind] : null);
            if (list === null && app.plugins.dataBind !== undefined && typeof app.plugins.dataBind.getBindValue === 'function') {
                list = app.plugins.dataBind.getBindValue(this.bind, model);
            }
            if (list === null || (Array.isArray(list) && list.length === 0)) {
                return '';
            }

            // Build content under <data-list> using either a template or a basic <ul>
            if (this.templateSelector) {
                // Root Element is optional and only used if a template is used
                if (this.rootElement !== null) {
                    if (this.rootElement !== this.rootElement.toLowerCase()) {
                        return showError('<data-list [root-element="name"]> must be all lower-case. Value used: [' + this.rootElement + ']');
                    } else if (this.rootElement.indexOf(' ') !== -1) {
                        return showError('<data-list [root-element="name"]> cannot contain a space. Value used: [' + this.rootElement + ']');
                    } else if (/[&<>"'/]/.test(this.rootElement) !== false) {
                        return showError('<data-list [root-element="name"]> cannot contain HTML characters that need to be escaped. Invalid characters are [& < > " \' /]. Value used: [' + this.rootElement + ']');
                    }
                    html.push('<' + app.escapeHtml(this.rootElement) + getAttrHtml() + '>');
                }

                // Get the template
                var template = document.querySelector(this.templateSelector);
                if (!template) {
                    return showError('Error <data-list> Template not found from selector: ' + this.templateSelector);
                } else if (app.jsTemplate === undefined) {
                    return showError('Error - When using <data-list> with a template the script [js/extensions/jsTemplate.js] is required.');
                }

                // Render each item using the template.
                try {
                    var render = app.jsTemplate.compile(this.listItemName, template.innerHTML);
                    for (var index = 0, count = list.length; index < count; index++) {
                        var item = list[index];
                        try {
                            html.push(render(item, index, app.escapeHtml, app.format));
                        } catch (e) {
                            var itemElement = (this.rootElement === 'ul' ? 'li' : 'div');
                            addError('Item Error - ' + e.message, itemElement);
                        }
                    }
                } catch (e) {
                    addError('Error Rendering Template - ' + e.message);
                }
                closeElement();
            } else {
                // Basic <ul> list
                html.push('<ul' + getAttrHtml() + '>');
                for (var n = 0, m = list.length; n < m; n++) {
                    html.push('<li>' + app.escapeHtml(list[n]) + '</li>');
                }
                html.push('</ul>');
            }
            return html.join('');
        },
    };

    /**
     * Add control to app
     */
    app.addControl('data-list', dataList);
})();