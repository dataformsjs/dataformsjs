/**
 * DataFormsJS [navLinks] Plugin
 *
 * This plugin is for use with SPA's and updates all [nav a]
 * links with an "active" class based on the current hash URL.
 *
 * See also the [navList] plugin which is similar but uses
 * a different query selector.
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

    function updateNavLinks(element) {
        element = (element === undefined ? document : element);

        var elements = element.querySelectorAll('nav a.active');
        Array.prototype.slice.call(elements).forEach(function (a) {
            a.classList.remove('active');
        });

        var path;
        if (app.routingMode === undefined || app.routingMode() === 'hash') {
            path = (window.location.hash === '' ? '#/' : window.location.hash);
        } else {
            path = window.location.pathname;
        }

        elements = element.querySelectorAll("nav a[href='" + path + "']");
        Array.prototype.slice.call(elements).forEach(function (a) {
            a.classList.add('active');
        });
    }

    app.addPlugin('navLinks', {
        // Use both [onBeforeRender] and [onRendered] so that nav items
        // can show UI change before rendering the view, and also after
        // other plugins run (for example [i18n] may update specific nav links).
        onBeforeRender: updateNavLinks,
        onRendered: function(element) { updateNavLinks(element); },
    });
})();
