/**
 * DataFormJS Unit Testing
 *
 * Used with file [test\views\unit-testing-mixed-templates.htm]
 */

/* Validates with both [jshint] and [eslint] */
/* global QUnit, app, nunjucks, tester */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';

    var viewEngines = [
        'Handlebars',
        'Nunjucks',
        'Underscore',
    ];

    // Add Custom Nunjucks Function
    var env = new nunjucks.Environment();
    env.addGlobal('appViewEngine', function() {
        return app.viewEngine();
    });
    app.nunjucksEnvironment = env;

    function checkSimpleArrayView(assert, hash, viewEngine) {
        // Asynchronous test
        var done = assert.async();

        // Run Test
        var expectedHtml = '[' + viewEngine + '][Current:' + viewEngine + ']Item1,Item2,Item3,';
        var shouldCompileTemplate = true;
        tester.pageTesterRemoveSpLb(hash, shouldCompileTemplate, expectedHtml, assert, done);
    }

    app.addModel('SimpleArray', {
        array: [ 'Item 1', 'Item 2', 'Item 3' ]
    });

    app.addController({
        path: '/',
        onRendered: function() {
            document.getElementById('view').innerHTML = 'Default Route, defined from JS';
        },
    });

    document.addEventListener('DOMContentLoaded', function () {
        // Default expected DataFormJS Settings based on the current page
        tester.controllersCount = 4;
        tester.modelsCount = 1;
        tester.pagesCount = 0;
        tester.pluginsCount = 0;
        tester.compiledTemplates = 0;
        tester.submittedRequestCount = 0;

        // Run tests in the order that they are defined
        QUnit.config.reorder = false;


        QUnit.test('DataFormJS Unit Test Starting Property Count', function (assert) {
            tester.setup();
            tester.checkCounts(assert);
        });

        // Test app.addController() Validation
        QUnit.test('app.addController() Setup', function (assert) {
            try {
                app.addController({
                    path: '/unknown-template',
                    viewUrl: 'html/unit-test-control-handlebars.htm',
                    modelName: 'SimpleArray',
                });
                tester.controllersCount++;
                assert.ok(true, 'Added Controller from JavaScript without Setting [viewEngine]');
            } catch (e) {
                assert.ok(false, e);
            }

            // The only difference between this and the previous controller is that
            // this one specifies the [viewEngine] property when adding the controller
            try {
                app.addController({
                    viewEngine: 'Handlebars',
                    path: '/handlebars-template-from-js',
                    viewUrl: 'html/unit-test-simple-array-handlebars.htm',
                    modelName: 'SimpleArray',
                });
                tester.controllersCount++;
                assert.ok(true, 'Added Controller from JavaScript using Setting [viewEngine]');
            } catch (e) {
                assert.ok(false, e);
            }
        });

        QUnit.test('Error - unknown-template', function (assert) {
            var done = assert.async();
            var hash = '#/unknown-template';
            var expectedHtml = 'Error with [Controller.path = "/unknown-template"] - TypeError: Unsupported or Unknown Template View Engine when the Template was downloaded. Template type at the time of downloading = Mixed';
            var shouldCompileTemplate = true;
            tester.pageTester(hash, shouldCompileTemplate, expectedHtml, assert, done, function () {
                tester.submittedRequestCount++;
                tester.checkCounts(assert);
            });
        });

        viewEngines.forEach(function(viewEngine) {
            QUnit.test('Render [' + viewEngine + '] with [Mixed] Template Type Set', function (assert) {
                var hash = '#/' + viewEngine.toLowerCase() + '-loop';
                checkSimpleArrayView(assert, hash, viewEngine);
            });
        });

        QUnit.test('DataFormJS Unit Test Property Count', function (assert) {
            tester.checkCounts(assert);
        });

        QUnit.test('Handlebars Template from JavaScript', function (assert) {
            var hash = '#/handlebars-template-from-js';
            tester.submittedRequestCount++;
            checkSimpleArrayView(assert, hash, 'Handlebars');
        });

        QUnit.test('DataFormJS Unit Test Complete Property Count', function (assert) {
            tester.checkCounts(assert);
        });
    });
})();