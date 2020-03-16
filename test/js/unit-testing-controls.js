/**
 * DataFormJS Unit Testing
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

    app.addControl('hello-world', {
        css: '.hello-world { color:blue; }', 
        data: {
            name: 'World',
        },
        html: function () {
            return '<h1 class="hello-world">Hello ' + this.name + '!</h1>'; 
        },
    });

    app.addControl('custom-list', {
        type: 'section',
        data: {
            listCount: 2,
        },
        html: function () {
            if (this.listCount === 2) {
                return '<div data-control="list-item"></div><list-item></list-item>'; 
            }                    
            var html = [];
            for (var n = 0; n < this.listCount; n++) {
                html.push('<list-item></list-item>');
            }
            return html.join('');
        },
    });

    app.addControl('list-item', {
        onLoad: function (element) {
            var elements = document.querySelectorAll("[data-control='list-item']");
            var count = Array.from(elements).filter(function(el) { return el.textContent !== ''; }).length;
            element.textContent = 'Item ' + (count+1);
        },
    });

    app.addControl('event-order', {
        data: {
            events: [],
        },
        onLoad: function (element) {
            this.events.push('onLoad(' + element.id + ')');
        },
        html: function () {
            this.events.push('html(' + arguments.length + ')');
            return this.events.join(', ');
        },
        onUnload: function (element) {
            this.events.push('onUnload(' + element.id + ')');
            app.locals['Control-Event-Order'] = this.events.join(', ');
        }
    });

    app.addControl('error-function-test', {
        onLoad: function () {
            if (this.errorAt === 'onLoad') {
                throw new Error('Test');
            }
        },
        html: function () {
            if (this.errorAt === 'html') {
                throw new Error('Test');
            }
            return '';
        },
        onUnload: function () {
            if (this.errorAt === 'onUnload') {
                throw new Error('Test');
            }
        }
    });
})();
