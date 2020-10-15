/**
 * DataFormsJS [navLinks] Plugin
 *
 * This plugin is for use with SPA's and by default updates all
 * [nav a] links with an "active" class based on the current URL.
 *
 * Options can be changed by setting props on the plugin:
 *     app.plugins.navLinks.itemSelector = 'nav li';
 *     app.plugins.navLinks.activeClass = 'selected';
 * 
 * Default:
 *     app.plugins.navLinks.itemSelector = 'nav a';
 *     app.plugins.navLinks.activeClass = 'active';
 * 
 * This plugin is small so it's easy to copy and modify if you
 * have a site with similar but different nav link needs.
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

    function updateNavLinks(rootElement) {
        rootElement = (rootElement === undefined ? document : rootElement);

        // Remove existing 'active' classes
        var elements = rootElement.querySelectorAll(navLinks.itemSelector + '.' + navLinks.activeClass);
        Array.prototype.slice.call(elements).forEach(function (el) {
            el.classList.remove(navLinks.activeClass);
        });

        // Get URL path
        var path;
        if (app.routingMode === undefined || app.routingMode() === 'hash') {
            path = (window.location.hash === '' ? '#/' : window.location.hash);
        } else {
            path = window.location.pathname;
        }

        // Set active on matching links. If the `itemSelector` is looking for a element
        // other than <a>; for example 'nav li' then this code will find <a> elements under
        // it and set the 'active' class if the item from the selector is the parent node.
        elements = rootElement.querySelectorAll(navLinks.itemSelector);
        Array.prototype.slice.call(elements).forEach(function (el) {
            var link = (el.nodeName === 'A' ? el : el.querySelector('a'));
            if (link && link.getAttribute('href') === path && (link === el || link.parentNode === el)) {
                el.classList.add(navLinks.activeClass);
            }
        });
    }

    var navLinks = {
        // Default Options
        itemSelector: 'nav a',
        activeClass: 'active',

        // Use both [onBeforeRender] and [onRendered] so that nav items
        // can show UI change before rendering the view, and also after
        // other plugins run (for example [i18n] may update specific nav links).
        onBeforeRender: updateNavLinks,
        onRendered: function(rootElement) { updateNavLinks(rootElement); },
    };
    app.addPlugin('navLinks', navLinks);
})();
