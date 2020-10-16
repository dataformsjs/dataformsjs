/**
 * DataFormsJS <data-list> JavaScript Control
 *
 * This control is designed for compatibility with the DataFormsJS Web Component
 * [js/web-components/data-list.js] and includes the ability for basic templating
 * from HTML using a template syntax based on JavaScript template literals (template strings).
 *
 * When [js/web-components/polyfill.js] is used for DataFormsJS Web Component
 * this file will be downloaded and used.
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
            rootClass: null,
            errorClass: null,
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

            // Get Table from the Model. If using format of "object.prop"
            // then the [dataBind] plugin (if available) will used to get the data.
            var list = (model && model[this.bind] ? model[this.bind] : null);
            if (list === null && app.plugins.dataBind !== undefined && typeof app.plugins.dataBind.getBindValue === 'function') {
                list = app.plugins.dataBind.getBindValue(this.bind, model);
            }
            if (list === null || (Array.isArray(list) && list.length === 0)) {
                return '';
            }

            // Root Element is optional and only used if a template is used
            if (this.rootElement !== null) {
                if (this.rootClass === null) {
                    html.push('<' + app.escapeHtml(this.rootElement) + '>');
                } else {
                    html.push('<' + app.escapeHtml(this.rootElement) + ' class="' + app.escapeHtml(this.rootClass) + '">');
                }
            }

            if (this.templateSelector) {
                var template = document.querySelector(this.templateSelector);
                if (!template) {
                    addError('Error <data-list> Template not found from selector: ' + this.templateSelector);
                    closeElement();
                    return html.join('');
                }

                // Bulid the template
                // When using Web Components JavaScript template literals (template strings)
                // are used so this is a basic replacement for the original function.
                // It covers basic templates but will not handle advanced templates.
                var tmplHtml = template.innerHTML;
                var js = /\$\{([^}]+)\}/g;
                var match;
                var loopCount = 0;
                var maxLoops = 1000; // For safety during development
                var tmplJs = [];
                var lastIndex = 0;
                while ((match = js.exec(tmplHtml)) !== null) {
                    tmplJs.push(JSON.stringify(tmplHtml.substring(lastIndex, match.index)));
                    tmplJs.push('String(app.escapeHtml(' + match[1] + '))');
                    lastIndex = match.index + match[0].length;
                    loopCount++;
                    if (loopCount > maxLoops) {
                        // Safety check to prevent endless loops
                        app.showErrorAlert('Unexpected Loop Error in <data-list>');
                        return;
                    }
                }
                tmplJs.push(JSON.stringify(tmplHtml.substring(lastIndex, tmplHtml.length)));

                // Look for unmatched escape characters "${"
                var hasError = false;
                for (var x = 0, y = tmplJs.length; x < y; x++) {
                    var text = tmplJs[x];
                    if (!text.startsWith('String(app.escapeHtml(') && text.includes('${')) {
                        addError('Invalid expression: missing `}` character');
                        hasError = true;
                        break;
                   }
                }

                // Render each item in the template.
                if (!hasError) {
                    try {
                        var tmpl = new Function('item', 'index', 'app', 'format', 'with(item){return ' + tmplJs.join(' + ') + '}');
                        for (var index = 0, count = list.length; index < count; index++) {
                            var item = list[index];
                            try {
                                html.push(tmpl(item, index, app, app.format));
                            } catch (e) {
                                var itemElement = (this.rootElement === 'ul' ? 'li' : 'div');
                                addError('Item Error - ' + e.message, itemElement);
                            }
                        }
                    } catch (e) {
                        addError('Error Rendering Template - ' + e.message);
                    }
                }
            } else {
                // Basic <ul> list
                if (this.rootClass === null) {
                    html.push('<ul>');
                } else {
                    html.push('<ul class="' + app.escapeHtml(this.rootClass) + '">');
                }
                for (var n = 0, m = list.length; n < m; n++) {
                    html.push('<li>' + app.escapeHtml(list[n]) + '</li>');
                }
                html.push('</ul>');
            }
            closeElement();
            return html.join('');
        },
    };

    /**
     * Add control to app
     */
    app.addControl('data-list', dataList);
})();