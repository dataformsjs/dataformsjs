/**
 * DataFormJS [clickToHighlight] Plugin.
 * 
 * This allows a user to easily see where they are on
 * wide table rows or mobile devices or highlight other
 * elements under a list.
 *
 * This file depends on CSS, example:
 *     .highlight {background-color:yellow; }
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

    function toggleHighlight(e) {
        // Do not change highlight when a link is clicked. The reason is because
        // it causes a quick flash of the highlighted style on the row before
        // the page changes. Since the user is clicking to another page rather
        // than highlighting a row the style change is not desired.
        if (e.target.nodeName === 'A') {
            return;
        }
        /* jshint validthis:true */
        this.classList.toggle('highlight');
    }

    var clickToHighlight = {
        onRendered: function (rootElement) {
            var elements = (rootElement || document).querySelectorAll('.click-to-highlight');
            Array.prototype.forEach.call(elements, function(el) {
                var n, m;
                if (el.tagName === 'TABLE' && el.tBodies.length === 1) {
                    var rows = el.tBodies[0].rows;
                    for (n = 0, m = rows.length; n < m; n++) {
                        rows[n].style.cursor = 'pointer';
                        rows[n].addEventListener('click', toggleHighlight);
                    }
                } else {
                    for (n = 0, m = el.children.length; n < m; n++) {
                        el.children[n].style.cursor = 'pointer';
                        el.children[n].addEventListener('click', toggleHighlight);
                    }
                }
            });
        }
    };

    // Add Plugin to DataFormsJS
    app.addPlugin('clickToHighlight', clickToHighlight);
})();
