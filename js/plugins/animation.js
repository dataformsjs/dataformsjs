/**
 * DataFormsJS Animation Plugin.
 *
 * For usage see [js/web-components/animation-service.js]. Usage is the same
 * but <animation-service> is not needed. This plugin dynamically downloads
 * needed polyfills for IE and older browsers.
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

    var animation = {
        // Optional Float (example: 0.3)
        intersectionRatio: null,

        onRendered: function (rootElement) {
            rootElement = (rootElement === undefined ? document : rootElement);
            var elements = rootElement.querySelectorAll('[data-animate]');
            elements = Array.from(elements).filter(function(el) {
                return !el.classList.contains(el.getAttribute('data-animate'));
            });
            if (elements.length === 0) {
                return;
            }

            var hasObserver = (window.IntersectionObserver !== undefined);
            var url = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
            app.loadScript(hasObserver, url, function() {
                var animationObserver = new IntersectionObserver(function(entries, observer) {
                    var intersectionRatio = app.plugins.animation.intersectionRatio;
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            if (intersectionRatio !== null && entry.intersectionRatio < intersectionRatio) {
                                return;
                            }
                            var className = entry.target.getAttribute('data-animate');
                            entry.target.classList.add(className);
                            observer.unobserve(entry.target);
                        }
                    });
                });
                Array.prototype.forEach.call(elements, function(element) {
                    animationObserver.observe(element);
                });
            });
        },
    };

    app.addPlugin('animation', animation);
})();
