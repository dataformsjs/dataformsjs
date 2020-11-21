/**
 * DataFormsJS <markdown-content> JavaScript Control
 *
 * This control is designed for compatibility with the DataFormsJS Web Component
 * [js/web-components/markdown-content.js].
 *
 * When [js/web-components/polyfill.js] is used for DataFormsJS Web Components
 * this file will be downloaded and used if a <markdown-content> element
 * is found on the page.
 *
 * See the Web Component source for additional comments and details of
 * what Markdown Libraries are supported and how it works.
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

    var returnCode = false;
    function highlight(code, lang) {
        if (window.hljs === undefined) {
            return (returnCode ? code : '');
        }

        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, code).value;
            } catch (err) {
                console.warn(err);
            }
        }

        try {
            return hljs.highlightAuto(code).value;
        } catch (err) {
            console.warn(err);
        }

        return (returnCode ? code : '');
    }

    /**
     * DataFormsJS <markdown-content> Control
     */
    var markdownContent = {
        /**
         * Data for the control
         */
        data: {
            bind: null,
            content: null,
            url: null,
            loadingSelector: null,
            showSource: false,
        },

        /**
         * Event that gets called when a <markdown-content> is rendered on screen
         *
         * @this markdownContent.data
         * @param {object} element
         */
        onLoad: function(element, model) {
            // Modify the element the first time it is loaded so that it has an API
            // that matches with the Web Components Version for common API calls.
            if (Object.getOwnPropertyDescriptor(element, 'url') === undefined) {
                Object.defineProperty(element, 'url', {
                    get: function() {
                        return this.getAttribute('data-url');
                    },
                    set: function(newValue) {
                        var existingValue = this.url;
                        if (existingValue !== newValue) {
                            this.setAttribute('data-url', newValue);
                            app.loadJsControl(this);
                        }
                    }
                });

                Object.defineProperty(element, 'showSource', {
                    get: function() {
                        return this.hasAttribute('data-show-source');
                    },
                    set: function(newValue) {
                        var existingValue = this.showSource;
                        if (existingValue !== newValue) {
                            if (newValue) {
                                this.setAttribute('data-show-source', '');
                            } else {
                                this.removeAttribute('data-show-source');
                            }
                            app.loadJsControl(this);
                        }
                    }
                });

                element.clearContent = function() {
                    element.innerHTML = '';
                    markdownContent.dispatchRendered(element);
                };
            }

            // Download Markdown if using [data-url] attribute
            if (this.url) {
                markdownContent.fetch.call(this, element);
                return;
            }

            // Set content from source if defined on initial load
            var sourceEl = element.querySelector('script[type="text/markdown"]');
            if (sourceEl) {
                this.content = sourceEl.innerHTML;
            } else if (this.bind) {
                // Get Table from Active Model or passed Model Object. If using format of "object.prop"
                // then the [dataBind] plugin (if available) will used to get the data.
                this.content = (model && model[this.bind] ? model[this.bind] : null);
                if (this.content === null && app.plugins.dataBind !== undefined && typeof app.plugins.dataBind.getBindValue === 'function') {
                    this.content = app.plugins.dataBind.getBindValue(this.bind, model);
                }
            }

            // Render markdown
            markdownContent.render.call(this, element);
        },

        dispatchRendered: function(element) {
            var event, eventName = 'app:markdownRendered';
            if (typeof(Event) === 'function') {
                event = new Event(eventName, { bubbles: true }); // Modern Browsers
            } else {
                event = document.createEvent('Event'); // IE 11
                event.initEvent(eventName, true, false);
            }
            element.dispatchEvent(event);
        },

        fetch: function (element) {
            // Show loading screen
            if (this.loadingSelector) {
                var loading = document.querySelector(this.loadingSelector);
                if (loading) {
                    element.innerHTML = loading.innerHTML;
                } else {
                    console.warn('Could not find template from <markdown-content [loading-selector="' + this.loadingSelector + '"]>.');
                }
            }

            // Fetch content
            var control = this;
            fetch(this.url)
            .then(function(res) {
                return res.text();
            })
            .then(function(text) {
                control.content = text;
                markdownContent.render.call(control, element);
            });
        },

        render: function (element) {
            // Nothing to show
            if (this.content === null) {
                element.innerHTML = '';
                markdownContent.dispatchRendered(element);
                return;
            }

            // If a source element exists then keep it in case the control get's loaded multiple times.
            // This will be added back to the control after markdown is rendered.
            var sourceEl = element.querySelector('script[type="text/markdown"]');
            if (sourceEl) {
                sourceEl.parentNode.removeChild(sourceEl);
            }

            // Shows as text rather than rendering source
            if (this.showSource) {
                element.innerHTML = '<pre></pre>';
                element.querySelector('pre').textContent = this.content;
                if (sourceEl) {
                    element.appendChild(sourceEl);
                }
                markdownContent.dispatchRendered(element);
                return;
            }

            // Render Markdown to HTML using one of 3 libraries
            var html;
            var md;
            returnCode = false;
            if (window.marked) {
                returnCode = true;
                marked.setOptions({
                    highlight: highlight
                });
                html = marked(this.content);
            } else if (window.markdownit) {
                md = markdownit({
                    html: true,
                    linkify: true,
                    typographer: true,
                    highlight: highlight
                });
                if (window.markdownitEmoji) {
                    md.use(markdownitEmoji);
                }
                html = md.render(this.content);
            } else if (window.remarkable) {
                md = new remarkable.Remarkable({
                    html: true,
                    typographer: true,
                    highlight: highlight
                });
                html = (md).render(this.content);
            } else {
                app.showError(element, 'Error - Unable to show Markdown content because a Markdown JavaScript library was not found on the page.');
                markdownContent.dispatchRendered(element);
                return;
            }

            // Set Content
            element.innerHTML = html;
            if (sourceEl) {
                element.appendChild(sourceEl);
            }
            if (window.hljs !== undefined) {
                var codeBlocks = document.querySelectorAll('code[class*="language-"]');
                Array.prototype.forEach.call(codeBlocks, function(code) {
                    code.classList.add('hljs');
                });
            }
            markdownContent.dispatchRendered(element);
        },
    };

    /**
     * Add control to app
     */
    app.addControl('markdown-content', markdownContent);
})();