/*
    This is an early state development to polyfill DataFormsJS Web Components.
    A lot of testing, more features, additional code organization (refactor)
    will be needed before this file can be published.

    See topic: "Finish Web Component Updates"
    In file [../to-do-list.txt]
        https://github.com/dataformsjs/dataformsjs/blob/master/docs/to-do-list.txt

    For the purpose of testing this file is being developed in modern browsers using this:
        <script src="../js/web-components/polyfill.js"></script>
    For the release the Web Components will be uncommented and this script will use [nomodule]
        <script nomodule src="../js/web-components/polyfill.js"></script>

    Additional items that must be completed before this will be published:
        - Make sure all features for <data-table> work: example [col-link-template]
        - <data-list> should also support both <template> and <script type="text/x-template">
            - This is for better IE 11 support, with the current demos it's not needed but one should be created
        - Also consider adding <data-list> and <data-table> changes needed here back to the regular framwork.
            Only if it makes sense so they can be loaded dynamically only if needed.
            If this is done the standard js framework demos [places-demo-js.htm, etc] could
            also be simplified for adding flag icons, etc. Breaking changes might be requiredd
            for a new major release if doing this (which is ok - as the breaking changes would be minor).
            If publishing a breaking change then likely add an [js/extensions/format.js] and that
            would contain shared functions for Vue Directives and Handlebar Helpers. The shared
            function would likely also update [dataBind] plugin with code from here.
        - Confirm this works on all Web Component example pages and templates
        - Converts <template> to <script type="text/x-template"> for downloaded
            HTML content. `app.setup()` handles this one time for IE however a
            function will likely need to be created so it can be handled
            each time a route template is downloaded.
            A new function `app.updateTemplatesForIE()` has been added to the main [DataFormsJS.js] file.
            More testing is needed and add comments that it doesn't work for non-block root elements, example:
                <template><tr></tr></template>
            Reason is because IE will remove the '<tr></tr>'
        - See code related to `app.activeModel = this` in this file. Come up with
            a test and see if the issue in the comments can be handled. If not provide a
            warning at least.
        - Currently all demo pages use <json-data>. See variable `hasJsonData` in this file.
            It was added in case a page doesn't use <json-data> however it still needs to be
            tested (at least manually).
*/

/* Validates with both [jshint] and [eslint] */
/* global app, Promise */
/* jshint strict: true */
/* jshint evil:true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* eslint no-prototype-builtins: "off" */

(function () {
    'use strict';

    /**
     * CSS that get's added to the page.
     */
    var polyfillStyleId = 'web-components-polyfill-css';
    var polyfillStyleCss = [
        'template { display:none }',
        '[data-control] { display:block; padding:0; margin:0; }',
        'div[data-control="json-data"] > div.is-loading,',
        'div[data-control="json-data"] > div.has-error,',
        'div[data-control="json-data"] > div.is-loaded { padding:0; margin:0; }',
    ].join('\n');

    // Module Level Variables
    var rootUrl = null;
    var useMinFiles = null;

    /**
     * Update specific Web Components to use DataFormsJS Framework Plugins, Controls, etc
     */
    var updateElements = {
        jsonData: function(element) {
            var url = element.getAttribute('url');
            element.setAttribute('data-url', url);
            var elements = ['is-loading', 'has-error', 'is-loaded'];
            elements.forEach(function(name) {
                var el = element.querySelector(name);
                if (el) {
                    var div = document.createElement('div');
                    div.className = el.className;
                    div.classList.add(name);
                    while (el.firstChild) {
                        div.appendChild(el.removeChild(el.firstChild));
                    }
                    el.parentNode.replaceChild(div, el);
                }
            });
        },
        dataList: function(element) {
            var attrList = ['template-selector', 'root-element', 'root-class', 'error-class'];
            attrList.forEach(function(attr) {
                var value = element.getAttribute(attr);
                if (value !== null) {
                    element.setAttribute('data-' + attr, value);
                }
            });
        },
        dataTable: function(element) {
            var attrList = ['highlight-class', 'labels', 'columns'];
            attrList.forEach(function(attr) {
                var value = element.getAttribute(attr);
                if (value !== null) {
                    element.setAttribute('data-' + attr, value);
                }
            });
        },
        imageGallery: function(element) {
            var attrList = ['image', 'image-avif', 'image-webp'];
            attrList.forEach(function(attr) {
                var value = element.getAttribute(attr);
                if (value !== null) {
                    if (attr === 'image') {
                        element.setAttribute('data-image-gallery', value);
                    } else {
                        element.setAttribute('data-' + attr, value);
                    }
                }
            });

            var title = element.getAttribute('title');
            if (title === null) {
                var img = element.querySelector('img[alt]');
                if (img) {
                    title = img.getAttribute('alt');
                    element.setAttribute('title', title);
                }
            }
        },
        inputFilter: function(element) {
            var attributes = [
                'filter-selector',
                'filter-results-selector',
                'filter-results-text-all',
                'filter-results-text-filtered'
            ];
            attributes.forEach(function(attr) {
                var value = element.getAttribute(attr);
                if (value !== null) {
                    element.setAttribute('data-' + attr, value);
                }
            });
        },
        leafletMap: function(element) {
            element.setAttribute('data-leaflet', '');

            var attributes = [
                'latitude',
                'longitude',
                'zoom',
                'marker'
            ];
            attributes.forEach(function(attr) {
                var value = element.getAttribute(attr);
                if (value !== null) {
                    element.setAttribute('data-' + attr, value);
                }
            });

            // Convert bind attributes - example:
            //   "latitude, longitude, marker"
            // To:
            //   "data-latitude, data-longitude, data-marker"
            var bindAttr = element.getAttribute('data-bind-attr');
            if (bindAttr && !bindAttr.includes('data-')) {
                bindAttr = bindAttr.split(',').map(function(s) { return 'data-' + s.trim(); });
                element.setAttribute('data-bind-attr', bindAttr.join(', '));
            }
        },
    };

    /**
     * Custom Framework Page object to handle routes defined by
     * <url-hash-router> and <url-router> Routes.
     */
    var polyfillPage = {
        model: {},
		// onRouteLoad: function() { },
		// onBeforeRender: function() { },
		onRendered: function() {
            var model = this;

            // Bind [url-param] elements
            var elements = document.querySelectorAll('[url-param]');
            Array.prototype.forEach.call(elements, function(element) {
                var name = element.getAttribute('url-param');
                if (model[name] !== undefined) {
                    element.textContent = model[name];
                }
            });

            // Update all elements with the [url-attr-param] attribute.
            // This will typically be used to replace <a href> and other
            // attributes with values from the URL.
            elements = document.querySelectorAll('[url-attr-param]');
            Array.prototype.forEach.call(elements, function(element) {
                dataBind.bindAttrTmpl(element, 'url-attr-param', model);
            });

            // Update <json-data> Web Component so it matches the
            // Framework control version then reload the control.
            var hasJsonData = false;
            app.activeJsControls.forEach(function(control) {
                if (control.control === 'json-data') {
                    updateElements.jsonData(control.element);
                    app.loadJsControl(control);
                    hasJsonData = true;
                }
            });

            // If <json-data> was found it will call `updateContent()` once the
            // data is downloaded, otherwise it needs to be called directly.
            if (!hasJsonData) {
                updateContent();
            }
        },
		// onRouteUnload: function() { },
    };

    /**
     * Replacement for [utils-format.js]
     */
    var Format = {
        number: function(value) {
            return this.formatNumber(value, {});
        },

        currency: function(value, currencyCode) {
            var intlOptions = { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 };
            return this.formatNumber(value, intlOptions);
        },

        percent: function(value, decimalPlaces) {
            if (decimalPlaces === undefined) {
                decimalPlaces = 0;
            }
            var intlOptions = {
                style: 'percent',
                maximumFractionDigits: decimalPlaces,
                minimumFractionDigits: decimalPlaces,
            };
            return this.formatNumber(value, intlOptions);
        },

        date: function(value) {
            return this.formatDateTime(value, {});
        },

        dateTime: function(value) {
            var intlOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
            return this.formatDateTime(value, intlOptions);
        },

        time: function(value) {
            var intlOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
            return this.formatDateTime(value, intlOptions);
        },

        // Return true if a valid number, this excludes Infinity and NaN
        isNumber: function(n) {
            return (!isNaN(parseFloat(n)) && isFinite(n));
        },

        // Format a date, date/time or time value with Intl.DateTimeFormat()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
        formatDateTime: function(dateTime, options) {
            // Fallback to data in original format.
            // As of 2020 this would most likely happen on older iOS.
            if (window.Intl === undefined) {
                return dateTime;
            }

            // Return formatted date/time in the user's local language
            try {
                if (dateTime instanceof Date) {
                    return new Intl.DateTimeFormat(navigator.language, options).format(dateTime);
                } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) {
                    // Basic date without timezone (YYYY-MM-DD)
                    var nums = dateTime.split('-').map(function(n) { return parseInt(n, 10); });
                    var date = new Date(nums[0], nums[1] - 1, nums[2]);
                    return new Intl.DateTimeFormat(navigator.language, options).format(date);
                } else {
                    // Assume JavaScript `Date` object can parse the date.
                    // In the future a new Temporal may be used instead:
                    //    https://tc39.es/proposal-temporal/docs/
                    var localDate = new Date(dateTime);
                    return new Intl.DateTimeFormat(navigator.language, options).format(localDate);
                }
            } catch (e) {
                // If Error log to console and return 'Error' text
                console.warn('Error formatting Date/Time Value:');
                console.log(navigator.language);
                console.log(options);
                console.log(dateTime);
                console.log(e);
                return 'Error';
            }
        },

        // Format a numeric value with Intl.NumberFormat()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
        formatNumber: function(value, options) {
            // Check for a valid number
            if (value === null || value === '') {
                return null;
            }
            if (!this.isNumber(value)) {
                console.warn('Warning value specified in DateFormsJS function formatNumber() is not a number:');
                console.log(value);
                return value;
            }

            // Fallback to data in original format.
            // As of 2020 this would most likely happen on older iOS.
            if (window.Intl === undefined) {
                return value;
            }

            // Return formatted number/currency/percent/etc in the user's local language
            try {
                return new Intl.NumberFormat(navigator.language, options).format(value);
            } catch (e) {
                // If Error log to console and return 'Error' text
                console.warn('Error formatting Numeric Value:');
                console.log(navigator.language);
                console.log(options);
                console.log(value);
                console.log(e);
                return 'Error';
            }
        },
    };

    /**
     * Replacment for <data-list> Web Component.
     * A Framework version of this control also exists but the
     * behavior is different enough that a seperate version is created here.
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

            // Get Table from Model
            var list = dataBind.getBindValue(this.bind, model);
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
                // When using Web Componetns JavaScript template literals (template strings)
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
                        var tmpl = new Function('item', 'index', 'app', 'Format', 'with(item){return ' + tmplJs.join(' + ') + '}');
                        for (var index = 0, count = list.length; index < count; index++) {
                            var item = list[index];
                            try {
                                html.push(tmpl(item, index, app, Format));
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
     * Replacment for <data-table> Web Component.
     * A Framework version of this control also exists but the
     * behavior is different enough that a seperate version is created here.
     */
    var dataTable = {
        /**
         * Data for the control
         */
        data: {
            bind: null,
            columns: null,
            labels: null,
            emptyDataText: 'No records found',
            errorInvalidData: 'Error invalid data for table',
            errorClass: null,
            defaultErrorStyle: 'color:white; background-color:red; padding:0.5rem 1rem; margin:.5rem;',
            highlightClass: null,
        },

        /**
         * Event that gets called when a <data-table> is rendered on screen
         *
         * @this dataTable.data
         * @param {HTMLElement} element
         */
        onLoad: function(element) {
            var row,
                columns,
                labels,
                n,
                m,
                x,
                y;

            var template = element.querySelector('template');
            if (template === null) {
                // <template> elements in IE will be replaced from `app.updateTemplatesForIE()`
                template = element.querySelector('script[type="text/x-template"]');
            }

            // Define private functions in this scope
            function addTable(html) {
                if (template === null) {
                    element.innerHTML = html;
                } else {
                    removeTable();
                    element.insertAdjacentHTML('beforeend', html);
                }
            }

            function removeTable() {
                // If there is no template than it's safe to clear all content
                if (template === null) {
                    element.innerHTML = '';
                    return;
                }

                // <template> exists so simply remove <table> from the DOM
                var table = element.querySelector('table');
                if (table !== null) {
                    table.parentNode.removeChild(table);
                }
            }

            // Get Table from Active Model
            var list = dataBind.getBindValue(this.bind, app.activeModel);

            // Ignore if list has not yet been set
            if (list === null) {
                return;
            }

            // Show no-data if empty
            if (Array.isArray(list) && list.length === 0) {
                if (this.emptyDataText === null) {
                    addTable('<table class="no-data"></table>');
                } else {
                    addTable('<table class="no-data"><caption>' + app.escapeHtml(this.emptyDataText) + '<caption></table>');
                }
                return;
            }

            // Validate data type
            var isValid = true;
            if (!Array.isArray(list)) {
                isValid = false;
            } else if (list.length > 0 && typeof list[0] !== 'object') {
                isValid = false;
            }
            if (!isValid) {
                addTable('<table><caption>' + app.escapeHtml(this.errorInvalidData) + '<caption></table>');
                return
            }

            // Get Columns - Either User Defined or from the first Record
            if (typeof this.columns === 'string') {
                columns = this.columns.split(',');
                for (n = 0, m = columns.length; n < m; n++) {
                    columns[n] = columns[n].trim();
                }
            } else {
                columns = Object.keys(list[0]);
            }

            // Get Custom Labels/Titles to Display or use Field Names
            labels = columns;
            if (typeof this.labels === 'string') {
                labels = this.labels.split(',');
                for (n = 0, m = labels.length; n < m; n++) {
                    labels[n] = labels[n].trim();
                }
                if ((labels.length !== columns.length) && template === null) {
                    labels = columns;
                }
            }

            // Table Header
            var html = [];
            var tableHtml = '<table';
            var tableAttr = element.getAttribute('table-attr');
            if (tableAttr) {
                tableAttr = tableAttr.split(',').map(function(s) { return s.trim(); });
                for (n = 0, m = tableAttr.length; n < m; n++) {
                    var attr = tableAttr[n];
                    var pos = attr.indexOf('=');
                    if (pos > 1) {
                        var name = attr.substr(0, pos).trim();
                        var value = attr.substr(pos+1).trim();
                        tableHtml += ' ' + app.escapeHtml(name) + '="' + app.escapeHtml(value) + '"';
                        // Add [data-sort] so that [app.plugins.sort] can handle
                        // the Web Component [is="sortable-table"].
                        if (name === 'is' && value === 'sortable-table') {
                            tableHtml += ' data-sort';
                        }
                    } else {
                        tableHtml += ' ' + app.escapeHtml(attr);
                    }
                }
            }
            html.push(tableHtml + '><thead><tr>');
            row = [];
            for (n = 0, m = labels.length; n < m; n++) {
                row.push('<th>' + app.escapeHtml(labels[n]) + '</th>');
            }
            html.push(row.join(''));
            html.push('</tr></thead>');

            // Table Body
            html.push('<tbody>');
            if (template !== null) {
                // Bulid the template
                // When using Web Componetns JavaScript template literals (template strings)
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
                        app.showErrorAlert('Unexpected Loop Error in <data-table>');
                        return;
                    }
                }
                tmplJs.push(JSON.stringify(tmplHtml.substring(lastIndex, tmplHtml.length)));

                try {
                    // Look for unmatched escape characters "${"
                    for (x = 0, y = tmplJs.length; x < y; x++) {
                        var text = tmplJs[x];
                        if (!text.startsWith('String(app.escapeHtml(') && text.includes('${')) {
                            throw new Error('Invalid expression: missing `}` character');
                        }
                    }

                    // Render each item in the template.
                    var tmpl = new Function('item', 'index', 'app', 'Format', 'with(item){return ' + tmplJs.join(' + ') + '}');
                    for (var index = 0, count = list.length; index < count; index++) {
                        var item = list[index];
                        try {
                            html.push(tmpl(item, index, app, Format));
                        } catch (e) {
                            if (this.errorClass) {
                                html.push('<tr class="' + this.errorClass + '">');
                            } else {
                                html.push('<tr style="' + this.defaultErrorStyle + '">');
                            }
                            html.push('<td colspan="' + columns.length + '">Item Error - ' + e.message + '}</td></tr>');
                        }
                    }
                } catch (e) {
                    if (this.errorClass) {
                        addTable('<table class="' + this.errorClass + '"><caption>Error Rendering Template - ' + e.message + '}</caption></table>');
                    } else {
                        addTable('<table style="' + this.defaultErrorStyle + '"><caption>Error Rendering Template - ' + e.message + '</caption></table>');
                    }
                    return;
                }
            } else {
                y = columns.length;
                for (n = 0, m = list.length; n < m; n++) {
                    row = [];
                    row.push('<tr>');
                    for (x = 0; x < y; x++) {
                        row.push('<td>' + app.escapeHtml(list[n][columns[x]]) + '</td>');
                    }
                    row.push('</tr>');
                    html.push(row.join(''));
                }
            }
            html.push('</tbody>');
            addTable(html.join(''));

            if (element.getAttribute('highlight-class')) {
                tableHtml += ' ' + app.escapeHtml(attr);
            }
            // Allow user to highlight rows by clicking on them using [clickToHighlight] Plugin?
            if (element.getAttribute('highlight-class')) {
                element.querySelector('table').classList.add('click-to-highlight');
            }
        },
    };

    /**
     * Copied from [js/plugins/dataBind.js].
     *
     * Changes here from the [dataBind] plugin will
     * likely be merged back with the main framework plugin.
     */
    function updateModel(e) {
        // Create Model object if one doesn't exist
        if (app.activeModel === null) {
            app.activeModel = {};
        }

        // Get input value
        var elType = e.target.type;
        var elValue = (elType === 'checkbox' || elType === 'radio' ? e.target.checked : e.target.value);

        // Update property
        var key = e.target.getAttribute('data-bind');
        if (key.indexOf('.') === -1) {
            // Check for an exact match on property
            app.activeModel[key] = elValue;
        } else {
            // Check for bindings such as "object.property". If first
            // key is [window] then start at global [window] Object.
            var keys = key.split('.');
            var useWindow = (keys[0] === 'window');
            var obj = (useWindow ? window : app.activeModel);
            if (useWindow) {
                keys.splice(0, 1);
            }
            while (keys.length > 0) {
                key = keys[0];
                if (keys.length === 1) {
                    obj[key] = elValue;
                } else {
                    if (typeof obj[key] !== 'object') { // Handles both objects and arrays
                        obj[key] = {};
                    }
                    obj = obj[key];
                }
                keys.splice(0, 1);
            }
        }
    }

    /**
     * Copied from [js/plugins/dataBind.js] with additional changes here.
     *
     * Changes here from the [dataBind] plugin will likely be merged
     * back with the main framework plugin. Code is currently copied
     * here for faster development.
     *
     * Use a diff program to merge back changes.
     */
    var dataBind = {
        /**
         * Return a bind value from [app.activeModel] using format 'object.property'.
         * If first bind key is 'window' then the global [window] object is used instead.
         *
         * @param {string} key
         * @param {object|null|undefined} data
         * @returns {null|string}
         */
        getBindValue: function (key, data) {
            // Using bind requires an active model
            if (data === undefined) {
                data = app.activeModel;
            }
            if (data === null) {
                return null;
            }

            // Get bind value
            var keys = key.split('.');
            var value = (keys.length > 1 && keys[0] === 'window' ? window : data);
            for (var n = 0, m = keys.length; n < m; n++) {
                value = (typeof value === 'object' && value !== null ? value[keys[n]] : null);
            }
            return (value === undefined ? null : value);
        },

        bindAttrTmpl: function(element, attribute, data) {
            var attributes = element.getAttribute(attribute).split(',').map(function(s) { return s.trim(); });
            attributes.forEach(function(attr) {
                // Save bind template to an attribute, example:
                // [data-bind-attr="href"] will save the inital value from [href]
                // to [data-bind-attr-href]. This allows it to be re-used.
                var value = element.getAttribute(attribute + '-' + attr);
                if (value === null) {
                    value = element.getAttribute(attr);
                    if (value !== null) {
                        element.setAttribute(attribute + '-' + attr, value);
                    }
                }
                // Parse the template
                if (value !== null) {
                    var loopCount = 0; // For safety to prevent endless loops
                    var maxLoop = 100;
                    while (loopCount < maxLoop) {
                        var posStart = value.indexOf('[');
                        var posEnd = value.indexOf(']');
                        if (posStart === -1 || posEnd === -1 || posEnd < posStart) {
                            break;
                        }
                        var key = value.substring(posStart + 1, posEnd);
                        var boundValue = dataBind.getBindValue(key, data);
                        if (boundValue === null) {
                            boundValue = '';
                        }
                        value = value.substring(0, posStart) + boundValue + value.substring(posEnd + 1);
                        loopCount++;
                    }
                    element.setAttribute(attr, value);
                }
            });
        },

        /**
         * Event called after the HTML is rendered and before the page's
         * controller [onRendered()] function runs.
         */
        onRendered: function (rootElement) {
            // Use specific element or entire page (document)
            if (rootElement === undefined) {
                rootElement = document;
            }

            // Update element text for all elements with [data-bind] Attribute.
            var elements = rootElement.querySelectorAll('[data-bind]');
            Array.prototype.forEach.call(elements, function(el) {
                var fieldName = el.getAttribute('data-bind');
                if (fieldName === '') {
                    console.warn('Element has a [data-bind] attribute, but no field specified');
                    return;
                }
                var value = dataBind.getBindValue(fieldName);
                var elementName = el.nodeName;
                if (elementName === 'INPUT' || elementName === 'SELECT' || elementName === 'TEXTAREA') {
                    // Handle Form/Input Elements
                    var elementType = el.type;
                    if (elementType === 'checkbox' || elementType === 'radio') {
                        if (typeof value === 'boolean') {
                            el.checked = value;
                        } else {
                            value = String(value).toLowerCase();
                            el.checked = (value === '1' || value === 'true' || value === 'yes' || value === 'y');
                        }
                    } else {
                        el.value = value;
                    }
                    // Sync initial value back to the model and update model on changes
                    updateModel({target:el});
                    var eventName = (el.oninput === undefined ? 'change' : 'input');
                    el.addEventListener(eventName, updateModel);
                } else if (el.getAttribute('data-control') === null && el.tagName.indexOf('-') === -1) {
                    // Handle standard HTML Elements. This includes framework "JS Controls"
                    // or Web Components as they will handle data binding in the control.
                    var dataType = el.getAttribute('data-format');
                    if (dataType !== null) {
                        if (typeof Format[dataType] === 'function') {
                            value = Format[dataType](value);
                        } else if (typeof window[dataType] === 'function') {
                            try {
                                value = window[dataType](value);
                            } catch (e) {
                                console.error(e);
                                value = 'Error: ' + e.message;
                            }
                        } else {
                            value = 'Error: Unknown format [' + dataType + ']';
                        }
                    }
                    el.textContent = value;
                }
            });

            // Update element attributes - [data-bind-attr].
            // This code finds and replaces text such in the format of "[field]".
            // Example:
            //     <a href="/[field1]/[field2]" data-bind-attr="href">
            elements = rootElement.querySelectorAll('[data-bind-attr]');
            Array.prototype.forEach.call(elements, function(el) {
                dataBind.bindAttrTmpl(el, 'data-bind-attr', app.activeModel);
            });

            // Show or hide elements based on [data-show="js-expression"].
            // Elements here will have the toggled `style.display` for viewing
            // or to hide based on the result of the expression. This is similar
            // behavior to Vue [v-show].
            elements = rootElement.querySelectorAll('[data-show]');
            Array.prototype.forEach.call(elements, function(el) {
                if (app.activeModel === null || (app.activeModel && app.activeModel.isLoaded !== true)) {
                    // [data-show] elements will be hidden during loading
                    el.style.display = 'none';
                } else {
                    var expression = el.getAttribute('data-show');
                    try {
                        var tmpl = new Function('state', 'Format', 'with(state){return ' + expression + '}');
                        var result = tmpl(app.activeModel, Format);
                        el.style.display = (result === true ? '' : 'none');
                    } catch (e) {
                        el.style.display = '';
                        console.error('Error evaluating JavaScript expression from [data-show] attribute.');
                        console.error(e);
                    }
                }
            });
        },
    };

    function updateContent() {
        var pluginsToLoad = [];

        // Reload specific controls and content after
        // data was downloaded from JSON service.
        app.activeJsControls.forEach(function(control) {
            switch (control.control) {
                case 'data-table':
                    updateElements.dataTable(control.element);
                    app.loadJsControl(control);
                    break;
                case 'data-list':
                    updateElements.dataList(control.element);
                    app.loadJsControl(control);
                    break;
            }
        });

        // Update all <image-gallery> elements
        var elements = document.querySelectorAll('image-gallery');
        if (elements.length > 0) {
            Array.prototype.forEach.call(elements, function(el) {
                updateElements.imageGallery(el);
            });
            pluginsToLoad.push('imageGallery');
        }

        // Make sure [data-bind] values are handled before other plugins run
        var firstElement = document.querySelector('[data-bind]');
        if (firstElement) {
            dataBind.onRendered();
        }

        // Look for elements that would trigger a plugin and add to list
        var search = [
            { selector: '.click-to-highlight', plugin: 'clickToHighlight' },
            { selector: '[data-sort]', plugin: 'sort' },
            { selector: '[is="input-filter"]', plugin: 'filter', update: updateElements.inputFilter },
            { selector: '[is="leaflet-map"]', plugin: 'leaflet', update: updateElements.leafletMap },
        ];
        search.forEach(function(item) {
            var element = document.querySelector(item.selector);
            if (element) {
                // Add plugin to download list
                pluginsToLoad.push(item.plugin);
                // Update all elements for specific plugins
                if (item.update !== undefined) {
                    var elements = document.querySelectorAll(item.selector);
                    Array.prototype.forEach.call(elements, function(el) {
                        item.update(el);
                    });
                }
            }
        });

        // Load Plugins
        pluginsToLoad.forEach(function(plugin) {
            loadPlugin(plugin);
        });

        // Trigger DOM Events for Apps to handle
        var event;
        if (typeof(Event) === 'function') {
            event = new Event('app:contentReady'); // Modern Browsers
        } else {
            event = document.createEvent('Event'); // IE 11
            event.initEvent('app:contentReady', true, true);
        }
        document.dispatchEvent(event);
    }

    function loadPlugin(name) {
        // Run plugin if it's already loaded.
        if (app.plugins[name] !== undefined) {
            app.plugins[name].reload();
            return;
        }

        // Download then Plugin
        var url = rootUrl + 'plugins/' + name + (useMinFiles ? '.min' : '') + '.js';
        app.loadScripts(url).then(function() {
            if (app.plugins[name] === undefined) {
                console.warn('Plugin [' + name + '] was loaded but not found. The script might still be loading in the DOM.')
                return;
            }
            app.plugins[name].reload();
        });
    }

    function defineCustomEvents() {
        app.controls['json-data'].onFetch = function() {
            // Set the [app.activeModel] based downloaded data.
            // IMPORTANT - if there is more than one <json-data> Web Component on the
            // page this setting [app.activeModel] may cause problems because one
            // control will overwrite the [app.activeModel] of the first.
            app.activeModel = this;
            if (app.activeController && app.activeController.modelName) {
                app.models[app.activeController.modelName] = app.activeModel;
            }
            // Update page content
            updateContent();
        };
    }

    /**
     * Convert routes under <url-hash-router>
     * and <url-router> to standard Framework routes.
     */
    function defineRoutes() {
        var router = document.querySelector('url-hash-router');
        var routeSelector = 'url-hash-route';
        if (router === null) {
            router = document.querySelector('url-router');
            if (router === null) {
                return;
            }
            routeSelector = 'url-route';
            // Required before `app.setup()` is called in order to use
            // History Routes (pushState, popState)
            document.documentElement.setAttribute('data-routing-mode', 'history');
        }

        var routes = router.querySelectorAll(routeSelector);
        var viewIndex = 0;

        Array.prototype.forEach.call(routes, function(route) {
            // Get route [path] and check if default route
            var path = route.getAttribute('path');
            var isDefault = (route.getAttribute('default-route') !== null);
            if (isDefault) {
                app.settings.defaultRoute = path;
            }

            // Handle [redirect] routes
            var redirect = route.getAttribute('redirect');
            if (redirect !== null) {
                app.addController({
                    path: path,
                    onRendered: function() {
                        app.changeRoute(this.redirect);
                    },
                    settings: { redirect: redirect },
                });
                return;
            }

            // Get Template Source
            var viewUrl = route.getAttribute('src');
            var viewId;
            if (viewUrl === null) {
                viewUrl = undefined;
                var template = route.querySelector('template');
                if (template === null) {
                    app.showErrorAlert('Unable to setup route:');
                    console.log(route);
                    return;
                }
                if (!template.id) {
                    template.id = 'url-hash-route-template-' + viewIndex + '-' + (new Date()).getTime();
                    viewIndex++;
                }
                viewId = template.id;
            }

            // Add Route as Framework Controller
            app.addController({
                path: path,
                viewId: viewId,
                viewUrl: viewUrl,
                viewEngine: 'Text',
                pageType: 'polyfillPage',
                // modelName: undefined,
                // settings: undefined,
            });
        });

        app.setup();
    }

    /**
     * Setup the page for non-SPA's
     */
    function noRoutingSetup() {
        // Exit if the page contains a router
        var urlHashRouter = document.querySelector('url-hash-router, url-router');
        if (urlHashRouter) {
            return;
        }

        app.activeModel = {};
        app.onUpdateViewComplete = function() {
            polyfillPage.onRendered();
        };
        app.updateTemplatesForIE();
        app.updateView();
    }

    function loadScript(url, callback) {
        var script = document.createElement('script');
        script.onload = callback;
        script.onerror = function () {
            console.error('Error loading Script: ' + url);
            callback();
        };
        script.src = url;
        document.head.appendChild(script);
    }

    function findRootUrl() {
        // Did the app set a custom value? If so use it.
        if (typeof window.dataformsjsUrl === 'string') {
            rootUrl = window.dataformsjsUrl;
            useMinFiles = (window.dataformsjsMinFiles !== false); // Defaults to `true` if not defined
            return;
        }

        // If minimized polyfill is being used then download minimized framework files,
        // otherwise if un-minimized files then download un-minimized framework files.
        var files = ['/web-components/polyfill.min.js', '/web-components/polyfill.js'];
        for (var n = 0; n < 2; n++) {
            var script = document.querySelector('script[src$="' + files[n] + '"]');
            var src;
            if (script) {
                src = script.getAttribute('src');
                rootUrl = src.substr(0, src.length - files[n].length + 1);
                useMinFiles = (n === 0);
                return;
            }
        }

        // Default if [dataformsjs] path cannot be determined.
        // NOTE - this won't work until the next release of DataFormsJS is published.
        rootUrl = 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/';
        useMinFiles = true;
    }

    function loadPagePlugins() {
        // Testing Example, this should be based on content from the actual page
        var scripts = [
            rootUrl + 'controls/json-data' + (useMinFiles ? '.min' : '') + '.js',
            //
            // If standard frameowork code will be modified they may be added here
            // instead of using custom versions in this file. Scripts should only be
            // added here if it makes sense that they cannot be easily loaded after
            // content renders. For example [dataBind] is needed in order to run
            // before other plugins such as [leaflet].
            //
            //
            // rootUrl + 'controls/data-list' + (useMinFiles ? '.min' : '') + '.js',
            // rootUrl + 'controls/data-table' + (useMinFiles ? '.min' : '') + '.js',
            // rootUrl + 'plugins/dataBind' + (useMinFiles ? '.min' : '') + '.js',
        ];
        app.loadScripts(scripts).then(function() {
            app
                .addPage('polyfillPage', polyfillPage)
                .addControl('data-list', dataList)
                .addControl('data-table', dataTable)
                .addPlugin('dataBind', dataBind)
                .loadCss(polyfillStyleId, polyfillStyleCss);

            // Define a setting so apps can check if this file is being used.
            app.settings.usingWebComponentsPolyfill = true;

            defineCustomEvents();
            defineRoutes();
            noRoutingSetup();
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Handle already loaded plugins from [jsPlugins.js] and if defined
        // remove the exiting `window.app` object. An example of this exists
        // in [examples/log-table-web.htm].
        var plugins = null;
        if (window.app !== undefined && typeof window.app.plugins === 'object') {
            plugins = window.app.plugins;
            delete window.app;
        }

        // Download the DataFormsJS Framework main file
        findRootUrl();
        var url = rootUrl + 'DataFormsJS' + (useMinFiles ? '.min' : '') + '.js';
        loadScript(url, function () {
            // If [jsPlugins.js] is used then add back the plugins
            if (plugins !== null) {
                for (var name in plugins) {
                    if (plugins.hasOwnProperty(name)) {
                        app.addPlugin(name, plugins[name]);
                    }
                }
            }

            // Polyfill Logic that normally happens from DataFormsJS 'DOMContentLoaded' event
            var condition = (Array.from && window.Promise && window.fetch && Promise.prototype.finally ? true : false);
            app.loadScript(condition, app.settings.polyfillUrl, loadPagePlugins);
        });
    });
})();
