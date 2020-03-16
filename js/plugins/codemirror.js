/**
 * DataFormsJS Plugin to setup CodeMirror editors. CodeMirror has a large number
 * of options and addons so if you use CodeMirror and your needed are different
 * that this file then copy and use this as a starting point for your site.
 * 
 * @link https://codemirror.net
 */

/* Validates with both [jshint] and [eslint] */
/* global app, CodeMirror */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';

    var codemirrorPlugin = {
        // Code Mirror Instances
        cm_objects: [],

        // Change Event if specified from Controller
        onChangeEvent: null,

        // Remove the CodeMirror editors and convert them to <textarea> Elements
        toTextArea: function () {
            this.cm_objects.forEach(function (cm) {
                cm.toTextArea();
            });
            this.cm_objects = [];
        },

        // Save changes from the CodeMirror Editor
        // back to the original source element
        save: function () {
            this.cm_objects.forEach(function (cm) {
                cm.save();
            });
        },

        // Allow calling app to handle changes with a callback function.
        onChange: function (onchange) {
            // If called when zero Code Mirror instances exist then save
            // for later so it can be set from onRendered().
            if (this.cm_objects.length === 0) {
                this.onChangeEvent = onchange;
            } else {
                this.cm_objects.forEach(function (cm) {
                    cm.on('change', function () {
                        onchange(cm);
                    });
                });
            }
        },

        // Create Codemirror editors after a page has rendered
        onRendered: function () {
            // Reset
            this.cm_objects = [];

            // Update each codemirror textarea
            Array.prototype.forEach.call(document.querySelectorAll('textarea.codemirror'), function (textarea) {
                var mode = textarea.getAttribute('data-mode');

                var options = {
                    lineNumbers: true,
                    matchBrackets: true,
                    mode: mode,
                    indentUnit: 4,
                    indentWithTabs: false,
                };
        
                if (mode === 'text/javascript') {
                    options.gutters = ['CodeMirror-lint-markers'];
                    options.lint = true;
                }

                codemirrorPlugin.cm_objects.push(CodeMirror.fromTextArea(textarea, options));
            });

            // If the controller defined a onchange event 
            // before the controls were created then call it now
            if (this.onChangeEvent !== null && this.cm_objects.length > 0) {
                this.onChange(this.onChangeEvent);
            }
        },

        // Make sure onchange event defined by the previous controller is cleared
        onRouteUnload: function () {
            this.onChangeEvent = null;
        }
    };

    // Add Plugin to Application
    app.addPlugin('codemirror', codemirrorPlugin);
})();
