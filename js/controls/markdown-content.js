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
/* global hljs, marked, markdownit, markdownitEmoji, remarkable, DOMPurify  */
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
     * Markdown Caching for when [load-only-once] is used.
     */
    var markdownCache = [];
    var maxCacheSize = 100;

    function saveMarkdownToCache(url, content, errorMessage) {
        if (markdownCache.length > maxCacheSize) {
            markdownCache.length = 0; // Clear array
        }
        for (var n = 0, m = markdownCache.length; n < m; n++) {
            if (url === markdownCache[n].url) {
                return; // Already saved
            }
        }
        markdownCache.push({ url:url, content:content, errorMessage:errorMessage });
    }

    function getMarkdownFromCache(url) {
        for (var n = 0, m = markdownCache.length; n < m; n++) {
            if (url === markdownCache[n].url) {
                return markdownCache[n];
            }
        }
        return null;
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
            errorMessage: null,
            linkTarget: null,
            linkRel: null,
            linkRootUrl: null,
            loadOnlyOnce: false,
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
            // Option to load markdown from cache rather than fetching each time.
            if (this.loadOnlyOnce) {
                var cache = getMarkdownFromCache(this.url);
                if (cache) {
                    this.content = cache.content;
                    this.errorMessage = cache.errorMessage;
                    markdownContent.render.call(this, element);
                    return;
                }
            }

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
            var url = this.url;
            app
            .fetch(url, null, 'text/plain')
            .then(function(text) {
                control.content = text;
                control.errorMessage = null;
                markdownContent.render.call(control, element);
            })
            .catch(function(error) {
                var errorMessage = 'Error loading markdown content from [' + url + ']. Error: ' + error;
                control.errorMessage = errorMessage;
                markdownContent.render.call(control, element);
            })
            .finally(function() {
                if (control.loadOnlyOnce) {
                    saveMarkdownToCache(url, control.content, control.errorMessage);
                }
            });
        },

        render: function (element) {
            // Error message (for example a failed fetch)
            if (this.errorMessage) {
                app.showError(element, this.errorMessage);
                markdownContent.dispatchRendered(element);
                return;
            }

            // Nothing to show
            if (this.content === null) {
                element.innerHTML = '';
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
                }).use(remarkable.linkify);
                html = (md).render(this.content);
            } else {
                app.showError(element, 'Error - Unable to show Markdown content because a Markdown JavaScript library was not found on the page.');
                markdownContent.dispatchRendered(element);
                return;
            }

            // Clean/Sanitize the HTML for Security if DOMPurify is loaded
            if (window.DOMPurify !== undefined) {
                html = DOMPurify.sanitize(html);
            }

            // Set Content and add back <script type="text/markdown">
            // if one was used for the source.
            element.innerHTML = html;
            if (sourceEl) {
                element.appendChild(sourceEl);
            }

            // Update code blocks so they highlight with the
            // correct theme if using [highlight.js].
            if (window.hljs !== undefined) {
                var codeBlocks = element.querySelectorAll('code[class*="language-"]');
                Array.prototype.forEach.call(codeBlocks, function(code) {
                    code.classList.add('hljs');
                });
            }

            // Update all [a.target] and [a.rel] attributes if sepecified.
            // Example: [data-link-target="_blank"] and [data-link-rel="noopener"]
            var linkTarget = this.linkTarget;
            var linkRel = this.linkRel;
            if (linkTarget || linkRel) {
                var links = element.querySelectorAll('a');
                Array.prototype.forEach.call(links, function(link) {
                    link.target = (linkTarget ? linkTarget : link.target);
                    link.rel = (linkRel ? linkRel : link.rel);
                });
            }

            // Update all local links if [data-link-root-urll] is specified.
            // For example Github readme docs would often point to links in the local repository.
            // This feature can be used to specify the root URL so that all links work correctly.
            var rootUrl = this.linkRootUrl;
            if (rootUrl) {
                var localLinks = element.querySelectorAll('a:not([href^="http:"]):not([href^="https:"])');
                Array.prototype.forEach.call(localLinks, function(link) {
                    var href = link.getAttribute('href');
                    link.setAttribute('data-original-href', href);
                    link.setAttribute('href', rootUrl + href);
                });
            }

            // Run event to let app know content has been rendered
            markdownContent.dispatchRendered(element);
        },
    };

    /**
     * Add control to app and add basic CSS to doc to prevent layout issues
     */
    app
        .addControl('markdown-content', markdownContent)
        .loadCss('dataformsjs-control-markdown-content', 'markdown-content[data-control] { display:block; }');
})();
