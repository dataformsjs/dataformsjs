/**
 * DataFormJS [clickToHighlight] Plugin
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

    function toggleHighlight() {
        /* jshint validthis:true */
        this.classList.toggle('highlight');
    }

    var clickToHighlight = {
        onRendered: function () {
            var elements = document.querySelectorAll('.click-to-highlight');
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
