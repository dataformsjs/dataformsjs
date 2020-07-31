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
        _allowRouteChange: true,
        _animationId: null,
        _routeLoaded: false, // Used to prevent timers from running after page is unloaded

        /**
         * Cancel the default SPA routing if the user clicked
         * on a nav link that is handled by this plugin.
         */
        onAllowRouteChange: function () {
            if (!onePageSite._allowRouteChange) {
                onePageSite._allowRouteChange = true;
                return false;
            }
            return true;
        },

        /**
         * Event called after the HTML is rendered and before the page's controller
         * [onRendered()] function runs. Defining and using [element] is optional and
         * only passed when certain functions such as [app.refreshHtmlControl()] are called.
         *
         * @param {undefined|HTMLElement}
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
        },

        /**
         * Handle when route is unloaded. When using this plugin this
         * would happen if a app is using both SPA (Single Page App)
         * and a One Page Site on a Page in the app.
         */
        onRouteUnload: function () {
            // Cancel Animation if it's still running
            if (onePageSite._animationId !== null) {
                window.cancelAnimationFrame(onePageSite._animationId);
            }
            // Prevent other animations from running
            this._routeLoaded = false;
        },

        /**
         * Called from `onRendered()` once the polyfill is downloaded.
         */
        setup: function () {
            // Scroll to the selected page element when the route first loads.
            // This typically would happen if a user copies and pastes a URL
            // with the hash of the section to view.
            this._routeLoaded = true;
            var hash = window.location.hash;
            if (hash && hash[0] === '#') {
                var el = document.getElementById(hash.substr(1));
                if (el) {
                    window.setTimeout(function() {
                        // Do nothing, route changed during timer
                        if (!onePageSite._routeLoaded) {
                            return;
                        }
                        // Scroll to the element
                        el.scrollIntoView({ block: 'start',  behavior: 'smooth' });
                    }, this.scrollToDelayOnPageLoad);
                }
            }

            // Update Nav Links
            this.setActiveLinks();
            var onePageLinks = document.querySelectorAll(onePageSite.linkSelector);
            Array.prototype.forEach.call(onePageLinks, function(link) {
                link.addEventListener('click', onePageSite.handleLinkClick);
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
                    el.scrollIntoView({ block: 'start',  behavior: 'smooth' });

                    // Wait half a second then update the URL hash
                    window.setTimeout(function () {
                        if (!onePageSite._routeLoaded) {
                            return;
                        }
                        onePageSite._allowRouteChange = false;
                        window.location.hash = hash;
                        onePageSite.setActiveLinks();
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
