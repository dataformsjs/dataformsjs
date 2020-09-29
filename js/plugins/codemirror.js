/**
 * DataFormsJS Plugin to setup CodeMirror editors. CodeMirror has a large number
 * of options and addons so if you use CodeMirror and your app needs are different
 * than this file then copy and use this as a starting point for your site.
 *
 * This plugin doesn't automatically save changes back to the <textarea> so it's
 * up to the app logic to handle changes; in many cases simply by calling
 * `app.plugins.codemirror.save();`.
 *
 * @link https://codemirror.net
 *
 * -----------------------------------------------------------------------------------------
 * Example Usage:
 * -----------------------------------------------------------------------------------------
 *     // Define from HTML:
 *     <textarea rows="10" style="width:90%;" class="codemirror" data-lang="htmlmixed"></textarea>
 *
 *     // Save all changes from CodeMirror editors back to plain <textarea> elements
 *     app.plugins.codemirror.save();
 *
 *     // Manually load new CodeMirror editors from textareas:
 *     app.plugins.codemirror.onRendered();
 *
 *     // Monitor edits from Codemirror and save back to the original textarea
 *     app.plugins.codemirror.onChange(function (cm) {
 *         cm.save();
 *         // App Logic
 *     });
 *
 *     // Append a new line of code from the app to an editor:
 *     var newCode = '...';
 *     var editor = app.plugins.codemirror.cm_objects[0];
 *     editor.replaceRange((editor.getValue() === "" ? "" : "\n") + newCode, CodeMirror.Pos(editor.lastLine()));
 *
 *     // Convert all CodeMirror Editors back to plain <textarea> elements
 *     app.plugins.codemirror.toTextArea();
 * -----------------------------------------------------------------------------------------
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
        onRendered: function (rootElement) {
            // Reset
            this.cm_objects = [];

            // Update each codemirror textarea
            var textareas = (rootElement || document).querySelectorAll('textarea.codemirror');
            Array.prototype.forEach.call(textareas, function (textarea) {
                var mode = textarea.getAttribute('data-mode');

                var options = {
                    lineNumbers: true,
                    matchBrackets: true,
                    mode: mode,
                    indentUnit: 4,
                    indentWithTabs: false,
                };

                // Include linting for JavaScript (requires jshint)
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
