/**
 * DataFormsJS [onePageSite] Plugin
 *
 * This plugin allows for one page style web sites where
 * a nav link will scroll to a target element on the page.
 *
 * By default DataFormsJS is used for single page apps however when using
 * this script other framework plugins and controls can be easily used
 * with one page sites.
 *
 * By default this plugin downloads and uses a polyfill script from
 * [iamdustan/smoothscroll] because the DOM Standard API
 *     `el.scrollIntoView({ block: 'start',  behavior: 'smooth' })`
 * is not well supported (only works properly with Firefox as of August 2020).
 *
 * A very popular and widely used library with similar functionality is [fullPage]
 * however it requires a license for non-GPLv3 sites. [fullPage] contains
 * a large number of options and features not included in this plugin, however
 * because this [onePageSite] plugin is very small it's a good starting
 * point for sites that want to use or customize it and it is designed to work
 * well with existing DataFormsJS framework plugins and features.
 *
 * @link https://github.com/iamdustan/smoothscroll
 * @link https://alvarotrigo.com/fullPage/
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
     * Plugin Object
     */
    var onePageSite = {
        /**
         * Props that an App may want to change
         */

        // Default selector for nav links.
        // Example: <a href="#hash" data-one-page>link</a>
        linkSelector: '[data-one-page]',

        // Allow nav to have an active class if selected
        activeLinkClass: 'active',

        // This allows for a delay on the intial page load with a hash URL.
        // The delay can allow for items such as web services to run or
        // complex elements to load first.
        scrollToDelayOnPageLoad: 500,

        // Only works with Firefox as of August 2020. Chrome/Edge support the
        // API but it doesn't work. If changing to `true` then this must be set
        // before the first route loads. In the future when Chrome, Edge, Safari,
        // and Samsung Internet support smooth scrolling correctly out of the box
        // then the default for this can be changed to `true`.
        useBrowserScrollIntoView: false,

        /**
         * Internal Props
         */
        _routeLoaded: false,
        _isScrolling: false,
        _targetElements: [],

        /**
         * Cancel the default SPA routing if the user is currently on the
         * page and entered a #hash-url that links to an element on the page.
         *
         * This prevents other plugins and setup code here from running twice
         * when the hash URL changes.
         */
        onAllowRouteChange: function () {
            if (!this._routeLoaded) {
                return true;
            }
            var elementMatched = this.scrollToHashElement();
            return !elementMatched;
        },

        /**
         * Main event called after the HTML is rendered for the current page/route.
         */
        onRendered: function () {
            if (onePageSite.useBrowserScrollIntoView) {
                this.setup();
            } else {
                window.__forceSmoothScrollPolyfill__ = true;
                var url = 'https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
                app.loadScripts(url).then(function() {
                    onePageSite.setup();
                });
            }
            document.addEventListener('scroll', onePageSite.handleScroll);
        },

        /**
         * Handle when route is unloaded. When using this plugin this
         * would happen if a app is using both SPA (Single Page App)
         * and a One Page Site on a Page in the app.
         */
        onRouteUnload: function () {
            // Reset variables to prevent additional timers from running
            this._routeLoaded = false;
            this._isScrolling = false;
            // Remove DOM Document Event
            this._targetElements = [];
            document.removeEventListener('scroll', onePageSite.handleScroll);
        },

        /**
         * Return [true] if element is visible on the screen
         * @param {HTMLElement} el
         */
        elementIsVisible: function(el) {
            // First check if the element is hidden
            var style = window.getComputedStyle(el);
            if (style.display === 'none' ||
                style.visibility !== 'visible' ||
                parseFloat(style.opacity) < 0.1) {
                return false;
            }
            // Check if element is on the visible portion of the screen
            var rect = el.getBoundingClientRect();
            if (rect.width === 0 ||
                rect.height === 0 ||
                rect.left + rect.width < 0 ||
                rect.top + rect.height < 0 ||
                rect.top > window.innerHeight ||
                rect.left > window.innerWidth) {
                return false;
            }
            return true;
        },

        /**
         * Get the visible height of an element
         * Modified from: https://stackoverflow.com/a/39576399
         *
         * @param {HTMLElement} el
         * @param {int} viewportHeight
         */
        getVisibleHeightPx: function(el, viewportHeight) {
            var rect = el.getBoundingClientRect(),
                height = rect.bottom - rect.top,
                visible = {
                    top: rect.top >= 0 && rect.top < viewportHeight,
                    bottom: rect.bottom > 0 && rect.bottom < viewportHeight
                },
                visiblePx = 0;

            if (visible.top && visible.bottom) {
                visiblePx = height;
            } else if (visible.top) {
                visiblePx = viewportHeight - rect.top;
            } else if (visible.bottom) {
                visiblePx = rect.bottom;
            } else if (height > viewportHeight && rect.top < 0) {
                var absTop = Math.abs(rect.top);
                if (absTop < height) {
                    visiblePx = height - absTop;
                }
            }
            return visiblePx;
        },

        /**
         * Update the browser hash #URL to the visible element
         * as the scrolls the page.
         */
        handleScroll: function () {
            // User action to scroll to an element
            if (onePageSite._isScrolling) {
                return;
            }

            // Nothing to scroll to
            if (onePageSite._targetElements.length === 0) {
                return;
            }

            // Sort elements by top position
            onePageSite._targetElements.sort(function(a, b) {
                var aTop = a.getBoundingClientRect().top;
                var bTop = b.getBoundingClientRect().top;
                return aTop - bTop;
            });

            // Filter to get only elements that are visible on screen
            var visibleElements = onePageSite._targetElements.filter(function(el) {
                return onePageSite.elementIsVisible(el);
            });

            // Find the main element in view
            var currentElement = null;
            if (visibleElements.length === 0) {
                // No visible elements, exit function
                return;
            } else if (visibleElements.length > 1) {
                // Multiple elements are visible so sort elements by which
                // one has the most pixels on screen and use that element.
                var elements = [];
                visibleElements.forEach(function(el) {
                    elements.push({
                        pixelsOnScreen: onePageSite.getVisibleHeightPx(el, window.innerHeight),
                        el: el,
                    });
                });
                elements.sort(function(a, b) {
                    return a.pixelsOnScreen - b.pixelsOnScreen;
                });
                currentElement = elements[elements.length - 1].el;
            } else {
                // Only one element found
                currentElement = visibleElements[0];
            }

            // Update the browser hash #URL based on the element in view.
            // This is uses `replaceState` rather than `pushState` because if
            // the user clicks the back button while scrolling it will take
            // them to the previous page or link click which would be the
            // expected behavior for most users. For most users if the simply
            // moved to a different section on the screen based on scrolling
            // then that would be unexpected.
            var hash = '#' + currentElement.id;
            if (window.location.hash !== hash) {
                window.history.replaceState(null, null, hash);
                onePageSite.setActiveLinks();
            }
        },

        /**
         * Scroll to the selected hash element. This gets called when the
         * page first loads or when the user manually changes the hash URL.
         *
         * @return {bool} [true] if an element was matched
         */
        scrollToHashElement: function () {
            var hash = window.location.hash;
            if (hash && hash[0] === '#') {
                var el = document.getElementById(hash.substr(1));
                if (el) {
                    window.setTimeout(function() {
                        // Do nothing, route likely changed to
                        // another SPA page during timer.
                        if (!onePageSite._routeLoaded) {
                            return;
                        }

                        // Scroll to the element
                        onePageSite._isScrolling = true;
                        el.scrollIntoView({ block: 'start',  behavior: 'smooth' });
                        onePageSite.setActiveLinks();

                        // Wait half a second then reset variable
                        window.setTimeout(function() {
                            onePageSite._isScrolling = false;
                        }, 500);
                    }, this.scrollToDelayOnPageLoad);
                    return true;
                }
            }
            return false;
        },

        /**
         * Called from `onRendered()` once the polyfill is downloaded.
         */
        setup: function () {
            // Scroll to the selected page element when the route first loads.
            // This typically would happen if a user copies and pastes a URL
            // with the hash of the section to view.
            this._routeLoaded = true;
            this.scrollToHashElement();

            // Update Nav Links
            var onePageLinks = document.querySelectorAll(onePageSite.linkSelector);
            Array.prototype.forEach.call(onePageLinks, function(link) {
                link.addEventListener('click', onePageSite.handleLinkClick);
            });

            // Get all elements that will be scrolled to
            onePageSite._targetElements = [];
            Array.prototype.forEach.call(onePageLinks, function(link) {
                if (link.hash) {
                    var el = document.getElementById(link.hash.substr(1));
                    if (el && onePageSite._targetElements.indexOf(el) === -1) {
                        onePageSite._targetElements.push(el);
                    }
                }
            });
        },

        /**
         * Set active class on one page nav links. Defaults to 'active'
         */
        setActiveLinks: function () {
            if (!onePageSite.activeLinkClass) {
                return; // Skip if no class specified
            }
            var onePageLinks = document.querySelectorAll(onePageSite.linkSelector);
            Array.prototype.forEach.call(onePageLinks, function(link) {
                if (onePageSite.activeLinkClass) {
                    if (link.hash === window.location.hash) {
                        link.classList.add(onePageSite.activeLinkClass);
                    } else {
                        link.classList.remove(onePageSite.activeLinkClass);
                    }
                }
            });
        },

        /**
         * Scroll to element based on click of nav links
         * @param {HTMLEvent} e
         */
        handleLinkClick: function(e) {
            var hash = this.hash;
            if (hash) {
                var el = document.getElementById(hash.substr(1));
                if (el) {
                    // Cancel standard DOM click then scroll to element
                    e.preventDefault();
                    onePageSite._isScrolling = true;
                    el.scrollIntoView({ block: 'start',  behavior: 'smooth' });
                    window.history.pushState(null, null, hash); // Update browser hash #URL
                    onePageSite.setActiveLinks();

                    // Wait half a second update scrolling variable
                    window.setTimeout(function () {
                        onePageSite._isScrolling = false;
                    }, 500);
                }
            }
        },
    };

    /**
     * Add Plugin to DataFormsJS
     */
    app.addPlugin('onePageSite', onePageSite);
})();
