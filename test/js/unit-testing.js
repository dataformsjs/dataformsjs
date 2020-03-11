/**
 * DataFormsJS Unit Testing
 *
 * This is the main file for testing the Framework.
 *
 * Unit Testing runs in the Browser using QUnit.
 * See instructions in [../server.js].
 * 
 * NOTE - Vue was added several years after this file was creatd
 * and because the behavior of Vue is different from Templating (Handlebars, etc)
 * many tests and checks have to be skipped for Vue. Because many tests
 * are skipped it's important that demos be manually tested when
 * updates are made and when new versions of Vue are released.
 */

/* Validates with both [jshint] and [eslint] */
/* global QUnit, app, DataFormsJS, tester, nunjucks */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* eslint no-prototype-builtins: "off" */

(function () {
    'use strict';

    var isIE = (navigator.userAgent.indexOf('Trident/') !== -1);
    var isFirefox = (navigator.userAgent.indexOf('Firefox/') !== -1);

    document.addEventListener('DOMContentLoaded', function () {
        // Default expected DataFormJS Settings based on the current page
        // Controllers and Plugins are variable which allows for different
        // builds to be tested. The required pages/plugins are checked at setup.
        tester.controllersCount = 18;
        tester.modelsCount = 5;
        tester.pagesCount = Object.keys(app.pages).length; // min=2
        tester.pluginsCount = Object.keys(app.plugins).length; // min=1
        tester.compiledTemplates = 1;
        tester.submittedRequestCount = 0;

        // Run tests in the order that they are defined
        QUnit.config.reorder = false;

        QUnit.test('DataFormsJS Version, Settings, Automatic Setup, and Initial View Rendering Test', function (assert) {
            assert.ok(app === DataFormsJS, 'Global Variables [app] and [DataFormsJS] are Defined');

            assert.equal(app.settings.viewSelector, '#view', 'Default Settings for app.settings.viewSelector: ' + app.settings.viewSelector);
            assert.equal(app.settings.defaultRoute, '/', 'Default Settings for app.settings.defaultRoute: ' + app.settings.defaultRoute);
            assert.equal(app.settings.logFetchRequests, false, 'Default Settings for app.settings.logFetchRequests: ' + app.settings.logFetchRequests);
            assert.deepEqual(app.settings.requestHeaders, {}, 'Default Settings for app.settings.requestHeaders: ' + JSON.stringify(app.settings.requestHeaders));
            assert.deepEqual(app.settings.requestHeadersByHostName, {}, 'Default Settings for app.settings.requestHeadersByHostName: ' + JSON.stringify(app.settings.requestHeadersByHostName));
            assert.equal(app.settings.errors.pageLoading, 'Error loading the current page because the previous page is still loading and is taking a long time. Please refresh the page and try again.', 'Default settings for app.settings.errors.pageLoading: ' + app.settings.errors.pageLoading);
            assert.equal(Object.keys(app.settings).length, 10, 'Number of properties in app.settings');

            switch (app.viewEngine()) {
                case 'Handlebars':
                case 'Nunjucks':
                case 'Underscore':
                case 'Vue':
                    assert.ok(true, 'app.viewEngine() - ' + app.viewEngine());
                    break;
                default:
                    assert.ok(false, 'app.viewEngine() - ' + app.viewEngine());
            }

            switch (app.viewEngine()) {
                case 'Handlebars':
                    tester.controllersCount++;
                    break;
                case 'Nunjucks':
                    tester.controllersCount += 2;
                    break;
                default:
                    break;
            }

            tester.setup();
            tester.checkCounts(assert);

            // Required Pages/Plugins
            // Tests will fail if required files are not included in the build
            assert.ok(app.pages.jsonData !== undefined, 'Checking for required page: app.pages.jsonData');
            assert.ok(app.pages.unitTestEventOrder !== undefined, 'Checking for required page: app.pages.unitTestEventOrder');
            assert.ok(app.plugins.unitTestEventOrder !== undefined, 'Checking for required plugin: app.plugins.unitTestEventOrder');

            var text = document.getElementById('view').textContent.trim();
            var expectedText = 'Initial view has loaded';
            assert.equal(text, expectedText, 'Checking for Initial Template: ' + text);
            assert.equal(app.activeController.settings.content, expectedText, 'app.activeController.settings.content: ' + app.activeController.settings.content);

            var template0 = document.querySelector('#template0[data-route="/"]');
            var isValid = (template0 !== null && template0.tagName === 'SCRIPT');
            assert.ok(isValid, 'Checking assigned Template ID');
            assert.equal(template0.getAttribute('data-content'), expectedText, 'Template [data-content]: ' + template0.getAttribute('data-content'));

            // Verify that [app.viewEngine()] is being determined by <script [type="*"]> only.
            // This is done because each of the pages that call this file use one one type of
            // view engine but include all View Engines on the page
            assert.ok((window.Handlebars !== undefined), 'Including Handlebars on this page');
            assert.ok((window.nunjucks !== undefined), 'Including Nunjucks on this page');
            assert.ok((window._ !== undefined), 'Including Underscore on this page');

            // Error Default Properties
            var expectedCss = '.dataformsjs-error,.dataformsjs-fatal-error{color:#fff;background-color:red;box-shadow:0 1px 5px 0 rgba(0,0,0,.5);background-image:linear-gradient(#e00,#c00);/*white-space:pre;*/text-align:left;}.dataformsjs-error{padding:10px;font-size:1em;margin:5px;display:inline-block;}.dataformsjs-fatal-error{z-index:1000000;padding:20px;font-size:1.5em;margin:20px;position:fixed;top:10px;}@media only screen and (min-width:1000px){.dataformsjs-fatal-error{max-width:1000px;left:calc(50% - 520px);}}.dataformsjs-fatal-error span{padding:5px 10px;float:right;border:1px solid darkred;cursor:pointer;margin-left:10px;box-shadow:0 0 2px 1px rgba(0,0,0,0.3);background-image:linear-gradient(#c00,#a00);border-radius:5px;}';
            assert.equal(app.errorClass, 'dataformsjs-error', 'Default Settings for app.errorClass: ' + app.errorClass);
            assert.equal(app.fatalErrorClass, 'dataformsjs-fatal-error', 'Default Settings for app.fatalErrorClass: ' + app.fatalErrorClass);
            assert.equal(app.errorStyleId, 'dataformsjs-style-errors', 'Default Settings for app.errorStyleId: ' + app.errorStyleId);
            assert.equal(app.errorCss, expectedCss, 'Default Settings for app.errorClass: ' + app.errorCss);

            // Test setup() when a script with the attribute [data-route] is defined but the value is missing
            // Normally this would be a fatal error which is why the script type is defined and re-defined after testing.
            var expectedMessage = 'TypeError: A script element <script id="template-invalid-path" type="text/x-template" data-engine="null"> has the attribute [data-route] defined however the attribute value is empty. This error must be fixed, scripts that include a route path attribute must have the value defined.';
            var script = document.getElementById('template-invalid-path');
            var startingScriptType = script.type;
            script.type = 'text/x-template';
            app.setup();
            // Check error alert and close it
            var div = document.querySelector('.dataformsjs-fatal-error');
            assert.ok(div.childNodes[1].textContent, expectedMessage);
            div.querySelector('span').click();
            script.type = startingScriptType;
        });

        QUnit.test('Check Polyfills from [js/scripts/polyfills.js]', function (assert) {
            assert.equal('\t\n test '.trimLeft(), 'test ', 'String.prototype.trimLeft()');
            assert.equal('\t\n test '.trimStart(), 'test ', 'String.prototype.trimStart()');
            assert.equal(' test \t\n'.trimRight(), ' test', 'String.prototype.trimRight()');
            assert.equal(' test \t\n'.trimEnd(), ' test', 'String.prototype.trimEnd()');
        });

        QUnit.test('Redirect with [app.settings.defaultRoute] with [/404] Route', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Define hash to a view that doesn't exist
            var hash = '#/404';

            // Make sure that content get's overwritten on the redirect
            var html = 'This will be overwritten';
            document.getElementById('view').innerHTML = html;
            tester.checkElement('view', html, assert);

            // Define a Global App Function to check the page after it is rendered
            app.onUpdateViewComplete = function () {
                // Check the URL Hash and View Contents
                var expectedHtml = 'Initial view has loaded';
                assert.equal(window.location.hash, '#' + app.settings.defaultRoute, 'Current URL Hash [' + window.location.hash + '] after setting [' + hash + ']');
                tester.checkElement('view', expectedHtml, assert);

                // Reset Global App Function
                app.onUpdateViewComplete = null;

                // Mark the test as complete
                done();
            };

            // Change the hash
            window.location.hash = hash;
        });

        // Test when controller/script for [app.settings.defaultRoute] doesn't exist
        QUnit.test('Redirect with [app.settings.defaultRoute] with missing [/500] Route', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // These don't exist
            var hash = '#/404';
            app.settings.defaultRoute = '/500';

            // Define a custom hash change event because this type unexpected
            // error can't be handled from app routing functions.
            function hashChange() {
                // Check results
                var expected = 'Error - The route [/404] does not have a <script data-route> element or [Controller] defined. Check to make sure that a controller or script for default route [/500] exists.';
                assert.equal(window.location.hash, hash, 'Current URL Hash [' + window.location.hash + '] after setting [' + hash + ']');
                assert.equal(app.settings.defaultRoute, '/500', 'Current Default Route: ' + app.settings.defaultRoute);
                tester.checkElement('view', expected, assert);

                // Reset
                app.settings.defaultRoute = '/';
                window.removeEventListener('hashchange', hashChange);
                document.head.removeChild(document.getElementById('dataformsjs-style-errors')); // Created from the error

                // Mark the test as complete
                done();
            }

            // Change the hash
            window.addEventListener('hashchange', hashChange);
            window.location.hash = hash;
        });

        QUnit.test('Render a <template> View and check properties', function (assert) {
            var done = assert.async();
            var hash = '#/template-view';
            var expectedHtml = 'Template View';
            var shouldCompileTemplate = true;
            tester.pageTester(hash, shouldCompileTemplate, expectedHtml, assert, done, function () {
                // script[data-engine="text"] is for IE
                var type = app.getTemplateType(document.querySelector('template[data-route="/template-view"],script[data-engine="text"][data-route="/template-view"]'));
                assert.equal(type, 'Text', 'app.getTemplateType(<template>): ' + type);
            });
        });

        QUnit.test('app.routeMatches() Validation', function (assert) {
            var routes = [
                {
                    path: '/page1',
                    routePath: '/page2',
                    expected: { isMatch: false }
                },
                {
                    path: '/show-all',
                    routePath: '/show-all',
                    expected: { isMatch: true, args: [], namedArgs: {} }
                },
                {
                    path: '/record/123',
                    routePath: '/record/:id',
                    expected: { isMatch: true, args: ['123'], namedArgs: { id: '123'} }
                },
                {
                    path: '/orders/edit/123',
                    routePath: '/:record/:view/:id',
                    expected: {
                        isMatch: true,
                        args: ['orders', 'edit', '123'],
                        namedArgs: {
                            record: 'orders',
                            view: 'edit',
                            id: '123'
                        }
                    }
                }
            ];

            routes.forEach(function (route) {
                var result = app.routeMatches(route.path, route.routePath);
                assert.deepEqual(route.expected, result, 'Comparing [' + route.path + '] to [' + route.routePath + ']');
            });
        });

        QUnit.test('app.deepClone() Validation', function (assert) {
            var expectedMessage,
                expectedResult,
                result,
                obj1,
                obj2,
                obj3,
                dateValue;

            try {
                expectedMessage = 'No arguments specified when app.deepClone() was called.';
                app.deepClone();
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'No arguments specified when app.deepClone() was called.';
                app.deepClone();
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'Only one argument was specified when app.deepClone() was called.';
                app.deepClone({});
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[argument] was not defined as a object when the function app.deepClone() was called';
                app.deepClone({}, '');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            expectedResult = { name: 'Conrad' };
            obj1 = { name: 'Conrad' };
            result = app.deepClone({}, obj1);
            assert.deepEqual(expectedResult, result, 'app.deepClone() Test 1');

            expectedResult = { name: 'Conrad', numberValue: 123 };
            obj1 = { name: 'Conrad' };
            obj2 = { numberValue: 123 };
            result = app.deepClone({}, obj1, obj2);
            assert.deepEqual(expectedResult, result, 'app.deepClone() Test 2');

            expectedResult = { name: 'Conrad', numberValue: 456 };
            obj1 = { name: 'Conrad' };
            obj2 = { numberValue: 123 };
            obj3 = { numberValue: 456 };
            result = app.deepClone(obj1, obj2, obj3);
            assert.deepEqual(expectedResult, result, 'app.deepClone() Test 3');

            expectedResult = { name: 'Conrad' };
            obj1 = { name: 'Conrad' };
            result = app.deepClone(obj1, obj1);
            assert.deepEqual(expectedResult, result, 'app.deepClone() Test 4 - Copy object to itself');

            dateValue = new Date();
            expectedResult = {
                type: 'Parent Class',
                childObj: {
                    prop1: 'Value1',
                    prop2: 'Value2'
                },
                arrayData: [
                    { index: 1 },
                    { index: 2 },
                    { index: 3 }
                ],
                dateValue: dateValue
            };
            obj1 = {
                type: 'Parent Class',
                childObj: {
                    prop1: 'Value1',
                    prop2: 'Value2'
                },
                arrayData: [
                    { index: 1 },
                    { index: 2 },
                    { index: 3 }
                ],
                dateValue: dateValue
            };
            result = app.deepClone({}, obj1);
            assert.deepEqual(expectedResult, result, 'app.deepClone() Test 5 - Deep Copy');

            // Make changes to the copied item
            result.type = 'Updated';
            result.dateValue = new Date(2015, 0, 1);
            result.childObj.prop1 = 'abc';
            result.arrayData[0].index = 0;

            // Make sure the original item was not updated
            assert.equal(obj1.type, 'Parent Class', 'Checking result of deep copy - obj1.type');
            assert.equal(obj1.dateValue, dateValue, 'Checking result of deep copy - obj1.dateValue');
            assert.equal(obj1.childObj.prop1, 'Value1', 'Checking result of deep copy - obj1.childObj.prop1');
            assert.equal(obj1.arrayData[0].index, 1, 'Checking result of deep copy - obj1.arrayData[0].index');
        });

        QUnit.test('app.addModel() Validation', function (assert) {
            var expectedMessage;

            try {
                expectedMessage = '[name] was not defined as a string when the function app.addModel() was called';
                app.addModel({});
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[name] must have a value when defined when the function app.addModel() is called';
                app.addModel('');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[model] was not defined as a object when the function app.addModel() was called';
                app.addModel('Test');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                app.addModel('Test', {});
                tester.modelsCount++;
                assert.ok(true, 'Add Model Test');
            } catch (e) {
                assert.ok(false, e);
            }

            try {
                expectedMessage = '[app.models.Test] is already defined';
                app.addModel('Test', {});
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }
        });

        QUnit.test('app.addPlugin() Validation', function (assert) {
            var expectedMessage;

            try {
                expectedMessage = '[name] was not defined as a string when the function app.addPlugin() was called';
                app.addPlugin({});
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[name] must have a value when defined when the function app.addPlugin() is called';
                app.addPlugin('');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[plugin] was not defined as a object when the function app.addPlugin() was called';
                app.addPlugin('Test');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            var functions = ['onBeforeRender', 'onRendered', 'onRouteUnload'];
            functions.forEach(function(func) {
                var expectedMessage;
                try {
                    expectedMessage = 'plugin[Test].' + func + ' is not defined as a function.';
                    var plugin = {};
                    plugin[func] = '';
                    app.addPlugin('Test', plugin);
                    assert.ok(false, 'Test should have failed');
                } catch (e) {
                    assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                    assert.equal(e.message, expectedMessage, expectedMessage);
                }
            });

            try {
                expectedMessage = 'plugin[Test] must have one of the following properties defined: onRouteLoad, onBeforeRender, onRendered';
                app.addPlugin('Test', { onRouteUnload:function(){} });
                assert.ok(true, 'Add Model Test');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                app.addPlugin('Test', { onBeforeRender: function () { } });
                assert.ok(true, 'Add Plugin Test');
                tester.pluginsCount++;
            } catch (e) {
                assert.ok(false, e);
            }

            try {

                expectedMessage = '[app.plugins.Test] is already defined';
                app.addPlugin('Test', { onBeforeRender: function () { } });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }
        });

        QUnit.test('app.addPage() Validation', function (assert) {
            var expectedMessage;

            try {
                expectedMessage = '[name] was not defined as a string when the function app.addPage() was called';
                app.addPage({});
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[name] must have a value when defined when the function app.addPage() is called';
                app.addPage('');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[page] was not defined as a object when the function app.addPage() was called';
                app.addPage('Test');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            var functions = ['onRouteLoad', 'onBeforeRender', 'onRendered', 'onRouteUnload'];
            functions.forEach(function(func) {
                var expectedMessage;
                try {
                    expectedMessage = 'page[Test].' + func + ' is not defined as a function.';
                    var page = {};
                    page[func] = '';
                    app.addPage('Test', page);
                    assert.ok(false, 'Test should have failed');
                } catch (e) {
                    assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                    assert.equal(e.message, expectedMessage, expectedMessage);
                }
            });

            try {
                expectedMessage = 'page[Test] must have one of the following properties defined: onRouteLoad, onBeforeRender, onRendered';
                app.addPage('Test', {});
                assert.ok(false, 'Add Model Test');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[page.Test.model] must first be defined before the function app.addPage() is called';
                app.addPage('Test', { onBeforeRender: function () { } });
                assert.ok(false, 'Add Model Test');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[page.Test.model] was not defined as an object when the function app.addPage() was called';
                app.addPage('Test', { onBeforeRender: function () { }, model: function () { } });
                assert.ok(false, 'Add Model Test');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                app.addPage('Test', {
                    onBeforeRender: function () { },
                    model: {}
                });
                tester.pagesCount++;
                assert.ok(true, 'Add Page Test');
            } catch (e) {
                assert.ok(false, e);
            }

            try {
                expectedMessage = '[app.pages.Test] is already defined';
                app.addPage('Test', {
                    onBeforeRender: function () { },
                    model: {}
                });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            tester.checkCounts(assert);
        });

        QUnit.test('app.addController() Validation', function (assert) {
            var expectedMessage;

            try {
                expectedMessage = '[controller] was not defined as a object when the function app.addController() was called';
                app.addController('');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.path] was not defined as a string when the function app.addController() was called';
                app.addController({});
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.path] must have a value when defined when the function app.addController() is called';
                app.addController({ path: '' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.viewId] was not defined as a string when the function app.addController(path=Test) was called';
                app.addController({ path: 'Test', viewId: {} });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.viewId] must have a value when defined when the function app.addController(path=Test) is called';
                app.addController({ path: 'Test', viewId: '' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.viewUrl] was not defined as a string when the function app.addController(path=Test) was called';
                app.addController({ path: 'Test', viewUrl: function () { return 'url'; } });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.viewUrl] must have a value when defined when the function app.addController(path=Test) is called';
                app.addController({ path: 'Test', viewUrl: '' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'A controller cannot have both [viewId] and [viewUrl] defined when calling app.addController(path=Test)';
                app.addController({ path: 'Test', viewId: 'view', viewUrl: 'url' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'An element was not found on the page with [controller.viewId][id=missing-template] when the function app.addController(path=Test) was called';
                app.addController({ path: 'Test', viewId: 'missing-template' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.modelName] was not defined as a string when the function app.addController(path=Test) was called';
                app.addController({ path: 'Test', modelName: {} });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.modelName] must have a value when defined when the function app.addController(path=Test) is called';
                app.addController({ path: 'Test', modelName: '' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'When a controller uses the [viewEngine] property either [viewId] or [viewUrl] must also be defined when calling app.addController(path=Test)';
                app.addController({ path: 'Test', viewEngine: 'Error' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'Invalid [viewEngine] property when calling app.addController(path=Test). Valid values are: Handlebars, Vue, Nunjucks, Underscore, Text';
                app.addController({ path: 'Test', viewUrl: 'Error', viewEngine: 'Error' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[app.models.MissingModel] must first be defined before the function app.addController(path=Test) is called';
                app.addController({ path: 'Test', modelName: 'MissingModel' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                // First add an invalid model manually without using app.addModel()
                // This error would happen if the developer overwrites a model object
                // as a different type or if they manually add an invalid model.
                app.models.InvalidModel = '';
                tester.modelsCount++;

                // Run the test
                expectedMessage = '[app.models.InvalidModel] was not defined as an object when the function app.addController(path=Test) was called';
                app.addController({ path: 'Test', modelName: 'InvalidModel' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.pageType] was not defined as a string when the function app.addController(path=Test) was called';
                app.addController({ path: 'Test', pageType: {} });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[controller.pageType] must have a value when defined when the function app.addController(path=Test) is called';
                app.addController({ path: 'Test', pageType: '' });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            var functions = ['onRouteLoad', 'onBeforeRender', 'onRendered', 'onRouteUnload'];
            functions.forEach(function(func) {
                var expectedMessage;
                try {
                    expectedMessage = 'controller[Test].' + func + ' is not defined as a function.';
                    var controller = { path:'Test' };
                    controller[func] = '';
                    app.addController(controller);
                    assert.ok(false, 'Test should have failed');
                } catch (e) {
                    assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                    assert.equal(e.message, expectedMessage, expectedMessage);
                }
            });

            try {
                expectedMessage = 'controller[Test] must have one of the following properties defined: onRouteLoad, onBeforeRender, onRendered, viewId, viewUrl';
                app.addController({ path: 'Test', onRouteUnload:function(){} });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                app.addController({
                    path: 'Test',
                    onRendered: function () { }
                });
                tester.controllersCount++;
                assert.ok(true, 'Add Page Test');
            } catch (e) {
                assert.ok(false, e);
            }

            try {
                expectedMessage = '[app.controllers(path=Test)] is already defined';
                app.addController({
                    path: 'Test',
                    onRendered: function () { }
                });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                app.addController({
                    path: 'ModelNameTest',
                    modelName: 'Test',
                    onRendered: function () { }
                });
                tester.controllersCount++;
                assert.ok(true, 'Add Page with modelName=Test');
            } catch (e) {
                assert.ok(false, e);
            }

            try {
                app.addController({
                    path: 'PageTypeTest',
                    pageType: 'Test'
                });
                tester.controllersCount++;
                assert.ok(true, 'Add Controller with pageType=Test');
            } catch (e) {
                assert.ok(false, e);
            }

            try {
                var controller = {
                    path: 'DynamicModel',
                    onRouteLoad: function () { },
                    settings: { prop1: '' }
                };
                app.addController(controller);
                tester.controllersCount++;
                assert.ok(true, 'Add Controller with Dynamic Model (Settings Defined and without an existing Model)');

                // Check the [app.controller()] function
                assert.ok(controller === app.controller('DynamicModel'), 'Fetching controller from app.controller(path)');
                assert.ok(null === app.controller('Unknown'), 'Returning null from app.controller(path)');
            } catch (e) {
                assert.ok(false, e);
            }

            tester.checkCounts(assert);
        });

        QUnit.test('app.addControl() Validation', function (assert) {
            var expectedMessage;

            assert.ok(app.controls['unit-test'] === undefined, 'Control [unit-test] must not exist');

            try {
                expectedMessage = '[name] was not defined as a string when the function app.addControl() was called';
                app.addControl({});
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[name] must have a value when defined when the function app.addControl() is called';
                app.addControl('');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'Control names must be all lower-case. [app.addControl()] was called with: [unitTest]';
                app.addControl('unitTest');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'Control names must contain a dash [-] character. [app.addControl()] was called with: [unittest]';
                app.addControl('unittest');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'Control names cannot contain a space. [app.addControl()] was called with: [-unit test]';
                app.addControl('-unit test');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = 'Control names cannot contain HTML characters that need to be escaped. Invalid characters are [& < > " \' /]. [app.addControl()] was called with: [<unit-test>]';
                app.addControl('<unit-test>');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[control] was not defined as a object when the function app.addControl() was called';
                app.addControl('unit-test', '');
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                expectedMessage = '[control.css] was not defined as a string when the function app.addControl() was called';
                app.addControl('unit-test', { css:false });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            var functions = ['onLoad', 'html', 'onUnload'];
            functions.forEach(function(func) {
                var expectedMessage;
                try {
                    expectedMessage = 'control[unit-test].' + func + ' is not defined as a function.';
                    var controller = {};
                    controller[func] = '';
                    app.addControl('unit-test', controller);
                    assert.ok(false, 'Test should have failed');
                } catch (e) {
                    assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                    assert.equal(e.message, expectedMessage, expectedMessage);
                }
            });

            try {
                expectedMessage = 'control[unit-test] must have one of the following properties defined: onLoad, html';
                app.addControl('unit-test', { onUnload:function() {} });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            try {
                app.addControl('unit-test', { onLoad:function() {} });
                assert.ok(app.controls['unit-test'] !== undefined, 'Control Added');
            } catch (e) {
                assert.ok(false, e);
            }

            try {
                expectedMessage = '[app.controls.unit-test] is already defined';
                app.addControl('unit-test', { onLoad:function() {} });
                assert.ok(false, 'Test should have failed');
            } catch (e) {
                assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                assert.equal(e.message, expectedMessage, expectedMessage);
            }

            // Reset
            delete app.controls['unit-test'];
            assert.ok(app.controls['unit-test'] === undefined, 'Control [unit-test] should be deleted');
        });

        // Manually trigger an error alert, validate, then close dialog
        // Unlike most tests this runs synchronously
        QUnit.test('app.showErrorAlert()', function (assert) {
            // Make sure the error style element does not yet exist
            // It gets created by calls to [showErrorAlert()] and [showError()]
            var errorStyle = document.getElementById('dataformsjs-style-errors');
            assert.ok(errorStyle === null, 'Checking for Style Element [dataformsjs-style-errors] before [app.showErrorAlert()]');

            // Create and show error
            var errorText = 'Test';
            app.showErrorAlert(errorText);
            var div = document.querySelector('.dataformsjs-fatal-error');
            var span = div.querySelector('span');

            // Make sure error style element was created
            errorStyle = document.getElementById('dataformsjs-style-errors');
            assert.ok(errorStyle !== null, 'Checking for Style Element [dataformsjs-style-errors] after [app.showErrorAlert()]');
            assert.equal(errorStyle.innerHTML, app.errorCss, 'Error Style CSS: ' + errorStyle.innerHTML);

            // Basic Element Checks
            assert.ok(div !== null, 'Found Element ".dataformsjs-fatal-error"');
            assert.ok(span !== null, 'Found Element ".dataformsjs-fatal-error span"');

            assert.equal(div.childNodes.length, 2, 'Correct Child Node Count: ' + div.childNodes.length);
            assert.equal(div.tagName, 'DIV', 'Correct Element Type for Container: ' + div.tagName);
            assert.equal(div.childNodes[1].textContent, 'Error: ' + errorText, 'Div textContent: ' + div.childNodes[1].textContent);
            assert.equal(div.className, 'dataformsjs-fatal-error', 'Div className: ' + div.className);

            assert.equal(span.tagName, 'SPAN', 'Correct Element Type for [X] Button: ' + span.tagName);
            assert.equal(span.textContent, '✕', 'Span textContent: ' + span.textContent);

            // Check CSS Computed Properties which get set
            // from the dynamically created Style Sheet.
            var elements = [
                {
                    el: div,
                    cssProps: {
                        'color': 'rgb(255, 255, 255)',
                        'background-color': 'rgb(255, 0, 0)',
                        'background-image': 'linear-gradient(rgb(238, 0, 0), rgb(204, 0, 0))',
                        // Browsers may return [boxShadow] in a different
                        // format so handle any known valid value.
                        'box-shadow': [
                            '0px 1px 5px 0px rgba(0,0,0,0.5)',
                            '0 1px 5px 0 rgba(0,0,0,.5)',
                            'rgba(0, 0, 0, 0.5) 0px 1px 5px 0px',
                            'rgba(0, 0, 0, 0.498039) 0px 1px 5px 0px',
                        ],
                        'z-index': '1000000',
                        'padding': '20px',
                        'font-size': '24px',
                        'margin': '20px',
                        'position': 'fixed',
                        'top': '10px',
                        // These two properties are defined from a media query
                        // so they are not checked here. Including them in the
                        // Error Style CSS check above is enough.
                        //
                        // 'max-width': '1000px',
                        // 'left': 'calc(50% - 520px)',
                    }
                },
                {
                    el: span,
                    cssProps: {
                        'padding': '5px 10px',
                        'float': 'right',
                        'border': '1px solid rgb(139, 0, 0)',
                        'cursor': 'pointer',
                        'margin-left': '10px',
                        'box-shadow': [
                            '0 0 2px 1px rgba(0,0,0,0.3)',
                            '0px 0px 2px 1px rgba(0,0,0,0.3)',
                            'rgba(0, 0, 0, 0.3) 0px 0px 2px 1px',
                            'rgba(0, 0, 0, 0.298039) 0px 0px 2px 1px',
                        ],
                        'background-image': 'linear-gradient(rgb(204, 0, 0), rgb(170, 0, 0))',
                        'border-radius': '5px',
                    }
                }
            ];
            // Both IE and Firefox return empty strings '' when using shorthand properties
            // [margin/padding/etc]. To get them to work they would require long or full properties:
            // ['margin-right', 'border-top-left-radius', 'border-bottom-color']. Rather than checking
            // a large list the shorthand properties are simply removed for browsers that do not
            // support them. If any changes are made they need to be visualy confirmed with all
            // supported browsers.
            if (isIE || isFirefox) {
                delete elements[0].cssProps.margin;
                delete elements[0].cssProps.padding;
                delete elements[1].cssProps.margin;
                delete elements[1].cssProps.padding;
                delete elements[1].cssProps.border;
                delete elements[1].cssProps['border-radius'];
            }
            elements.forEach(function(element) {
                var tagName = element.el.tagName;
                var cssProps = element.cssProps;
                for (var prop in cssProps) {
                    if (cssProps.hasOwnProperty(prop)) {
                        var expected = cssProps[prop];
                        var value = window.getComputedStyle(element.el, null).getPropertyValue(prop);
                        var description = tagName + ' CSS Computed Value [' + prop + ']: ' + value;
                        if (Array.isArray(expected)) {
                            var found = (expected.indexOf(value) !== -1);
                            assert.ok(found, description);
                        } else {
                            assert.equal(value, expected, description);
                        }
                    }
                }
            });

            // Close the fatal error alert by clicking the [X] button
            assert.ok(div.parentNode === document.querySelector('body'), 'Checking Parent Node of [.dataformsjs-fatal-error] before [X] button click');
            span.click();
            assert.ok(div.parentNode === null, 'Checking Parent Node of [.dataformsjs-fatal-error] after clicking [X] button');
            div = document.querySelector('.dataformsjs-fatal-error');
            assert.ok(div === null, 'Checking for [.dataformsjs-fatal-error] after clicking [X] button');

            // Change error default properties and validate
            var defaultFatalErrorClass = app.fatalErrorClass;
            var defaultErrorStyleId = app.errorStyleId;
            var defaultErrorCss = app.errorCss;

            app.fatalErrorClass = 'fatal-error';
            app.errorStyleId = 'app-errors';
            app.errorCss = '.fatal-error{color:red;}';

            errorText = 'Custom Error Properties';
            app.showErrorAlert(errorText);
            div = document.querySelector('.fatal-error');
            span = div.querySelector('span');

            errorStyle = document.getElementById('app-errors');
            var errorCss = '.fatal-error{color:red;}';
            assert.ok(errorStyle !== null, 'Checking for Style Element [app-errors] after [app.showErrorAlert()]');
            assert.equal(errorStyle.innerHTML, errorCss, 'Custom Error Style CSS: ' + errorStyle.innerHTML);

            assert.ok(div !== null, 'Found Element ".fatal-error"');
            assert.ok(span !== null, 'Found Element ".fatal-error span"');
            assert.equal(div.childNodes[1].textContent, errorText, 'Div textContent: ' + div.childNodes[1].textContent);

            var value = window.getComputedStyle(div, null).getPropertyValue('color');
            var expected = 'rgb(255, 0, 0)';
            var description = 'Error CSS Computed Value [color]: ' + value;
            assert.equal(value, expected, description);

            span.click();
            assert.ok(div.parentNode === null, 'Checking Parent Node of [.fatal-error] after clicking [X] button');

            // Reset back
            app.fatalErrorClass = defaultFatalErrorClass;
            app.errorStyleId = defaultErrorStyleId;
            app.errorCss = defaultErrorCss;

            // Remove Created Error Styles to prepare for next test
            document.head.removeChild(errorStyle);
            document.head.removeChild(document.getElementById('dataformsjs-style-errors'));
        });

        // Test the [app.showError()] function, this is similar to
        // the above Test related to [app.showErrorAlert()]
        QUnit.test('app.showError()', function (assert) {
            var expected, value, description, outerHTML;

            // Make sure the error style element does not exist
            var errorStyle = document.getElementById('dataformsjs-style-errors');
            assert.ok(errorStyle === null, 'Checking for Style Element [dataformsjs-style-errors] before [app.showError()]');

            // Get and setup view
            var view = document.querySelector(app.settings.viewSelector);
            view.innerHTML = '<strong>Content</strong>';
            expected = '<div id="view" style="display:none;"><strong>Content</strong></div>';
            outerHTML = view.outerHTML;
            outerHTML = outerHTML.replace('display: none;', 'display:none;'); // This is known to happen with IE 11
            assert.equal(outerHTML, expected, 'Checking View Outer HTML: ' + view.outerHTML);

            // Call function
            var errorText = 'Test with app.showError()';
            app.showError(view, errorText);

            // Make sure error style element was created.
            // The actual CSS is validated in the above [showErrorAlert()] test.
            errorStyle = document.getElementById('dataformsjs-style-errors');
            assert.ok(errorStyle !== null, 'Checking for Style Element [dataformsjs-style-errors] after [app.showError()]');

            // Make sure view was correctly updated
            assert.equal(view.childNodes.length, 1, 'Checking View Child Nodes: ' + view.childNodes.length);
            assert.equal(view.textContent, errorText, 'Checking View Text: ' + view.textContent);
            expected = '<div id="view" style="display:none;"><span class="dataformsjs-error">Test with app.showError()</span></div>';
            outerHTML = view.outerHTML;
            outerHTML = outerHTML.replace('display: none;', 'display:none;'); // This is known to happen with IE 11
            assert.equal(outerHTML, expected, 'Checking View Outer HTML: ' + view.outerHTML);

            // Check the expected style
            var span = view.querySelector('.dataformsjs-error');
            assert.ok(span !== null, 'Found Element ".dataformsjs-error"');
            assert.equal(span.textContent, errorText, 'span.textContent: ' + span.textContent);

            var cssProps = {
                'color': 'rgb(255, 255, 255)',
                'background-color': 'rgb(255, 0, 0)',
                'background-image': 'linear-gradient(rgb(238, 0, 0), rgb(204, 0, 0))',
                'box-shadow': [
                    '0px 1px 5px 0px rgba(0,0,0,0.5)',
                    '0 1px 5px 0 rgba(0,0,0,.5)',
                    'rgba(0, 0, 0, 0.5) 0px 1px 5px 0px',
                    'rgba(0, 0, 0, 0.498039) 0px 1px 5px 0px',
                ],
                'padding-left': '10px',
                'padding-right': '10px',
                'padding-top': '10px',
                'padding-bottom': '10px',
                'font-size': '16px',
                'margin-left': '5px',
                'margin-right': '5px',
                'margin-top': '5px',
                'margin-bottom': '5px',
                'display': 'inline-block',
            };

            for (var prop in cssProps) {
                if (cssProps.hasOwnProperty(prop)) {
                    expected = cssProps[prop];
                    value = window.getComputedStyle(span, null).getPropertyValue(prop);
                    description = 'Error CSS Computed Value [' + prop + ']: ' + value;
                    if (Array.isArray(expected)) {
                        var found = (expected.indexOf(value) !== -1);
                        assert.ok(found, description);
                    } else {
                        assert.equal(value, expected, description);
                    }
                }
            }

            // Verify that calling [showError()] with an element that
            // doesn't exist tiggers a call to [showErrorAlert()].
            app.showError(document.getElementById('missing'), errorText);
            var div = document.querySelector('.dataformsjs-fatal-error');
            span = div.querySelector('span');
            assert.equal(div.childNodes[1].textContent, errorText, 'Fatal Error textContent: ' + div.childNodes[1].textContent);

            // Close the fatal error dialog by clicking the [X] button
            span.click();
            assert.ok(div.parentNode === null, 'Checking Parent Node of [.dataformsjs-fatal-error] after clicking [X] button');

            // Change error default properties and validate
            var defaultErrorClass = app.errorClass;
            var defaultErrorStyleId = app.errorStyleId;
            var defaultErrorCss = app.errorCss;

            app.errorClass = 'app-error';
            app.errorStyleId = 'app-errors2';
            app.errorCss = '.app-error{color:blue;}';

            errorText = 'Custom Error Properties';
            app.showError(view, errorText);
            span = view.querySelector('.app-error');

            errorStyle = document.getElementById('app-errors2');
            var errorCss = '.app-error{color:blue;}';
            assert.ok(errorStyle !== null, 'Checking for Style Element [app-errors2] after [app.showError()]');
            assert.equal(errorStyle.innerHTML, errorCss, 'Custom Error Style CSS: ' + errorStyle.innerHTML);

            assert.ok(span !== null, 'Found Element ".app-error"');
            assert.equal(span.textContent, errorText, 'Error textContent: ' + span.textContent);

            value = window.getComputedStyle(span, null).getPropertyValue('color');
            expected = 'rgb(0, 0, 255)';
            description = 'Error CSS Computed Value [color]: ' + value;
            assert.equal(value, expected, description);

            // Reset back
            app.errorClass = defaultErrorClass;
            app.errorStyleId = defaultErrorStyleId;
            app.errorCss = defaultErrorCss;
        });

        // Verify a Fatal Error if the Element from [app.settings.viewSelector] doesn't exist
        QUnit.test('Fatal Error Screen with main View Missing', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Get the view selector to something that doesn't exist on the page
            app.settings.viewSelector = '#missing-view';

            assert.ok(document.querySelector('#missing-view') === null, 'No element in the document with selector "#missing-view"');
            assert.ok(document.querySelector('.dataformsjs-fatal-error') === null, 'No element in the document with class ".dataformsjs-fatal-error"');

            // Define controller without a view. The URL hash change
            // will trigger [onRendered()].
            var path = '/fatal-error-missing-view';
            app.addController({
                path: path,
                viewId: 'template-test',
                onRendered: function() {
                    // Validated Expected Error Element
                    var errorText = 'Error - The main HTML element for rendering views from selector [#missing-view] does not exist on this page. Check HTML on the page to makes sure that the element exist; and if it does then check to make sure that JavaScript Code did not remove it from the page';
                    var div = document.querySelector('.dataformsjs-fatal-error');
                    var span = div.querySelector('span');
                    assert.ok(div !== null, 'Found Element ".dataformsjs-fatal-error"');
                    assert.ok(span !== null, 'Found Element ".dataformsjs-fatal-error span"');
                    assert.equal(div.childNodes[1].textContent, errorText, 'div.textContent: ' + div.childNodes[1].textContent);

                    // Close the fatal error dialog by clicking the [X] button
                    span.click();
                    assert.ok(div.parentNode === null, 'Checking Parent Node of [.dataformsjs-fatal-error] after clicking [X] button');

                    // Reset View Selector, and Mark the test as complete
                    app.settings.viewSelector = '#view';
                    done();
                },
            });

            // Change hash to trigger controller to run
            tester.controllersCount++;
            tester.compiledTemplates++;
            window.location.hash = path;
        });

        QUnit.test('Route Change and Event Order', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (app.viewEngine() === 'Vue') {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // Define Test URL Hash
            var hash = '#/event-order';

            // Define a Global App Function to check the page after it is rendered
            app.onUpdateViewComplete = function () {
                // Compare to the initial expected result
                var expected = '[event-order]page:onRouteLoad,page:onBeforeRender,plugin:onBeforeRender';
                assert.equal(window.location.hash, hash, 'Event Order Hash Check');
                tester.checkElementRemoveSpLb('view', expected, assert);

                // Define another [onUpdateViewComplete] function to check the final result.
                // The Page Object [unitTestEventOrder] calls [app.updateView()] while
                // it is being rendered and sets several properties to make sure that events
                // are being called in the correct order and that [updateView()] is safe
                // to call while the view is being rendered.
                app.onUpdateViewComplete = function () {
                    // The Unit-Test Controller should have set [triggeredIsUpdatingView] set to true
                    // if [app.isUpdatingView()] was true, this if confirming that [app.updateView()]
                    // is safe to call while [app.updateView()] is still running.
                    var model = app.activeModel;

                    // Expected HTML Result
                    var expected = '[event-order]page:onRouteLoad,page:onBeforeRender,plugin:onBeforeRender,plugin:onRendered,page:onRendered,page:onBeforeRender,plugin:onBeforeRender';

                    // Compare Values
                    assert.equal(window.location.hash, hash, 'Event Order Hash Check');
                    tester.checkElementRemoveSpLb('view', expected, assert);
                    assert.equal(model.triggeredIsUpdatingView, true, 'Tiggered app.isUpdatingView()');

                    // Reset Global App Functions
                    app.onUpdateViewComplete = null;

                    // Define and run controller to check events
                    // that happened after [app.onUpdateViewComplete()].
                    var path = '/after-event-order';
                    app.addController({
                        path: path,
                        onRendered: function() {
                            // Check events
                            var events = model.events.join(',');
                            var expected = 'page:onRouteLoad,page:onBeforeRender,plugin:onBeforeRender,plugin:onRendered,page:onRendered,page:onBeforeRender,plugin:onBeforeRender,plugin:onRendered,page:onRendered,plugin:onRouteUnload,page:onRouteUnload';
                            assert.equal(events, expected, 'Checking Event Order after route was unloaded: ' + events);

                            // Mark the test as complete
                            done();
                        },
                    });
                    tester.controllersCount++;
                    window.location.hash = path;
                };
            };

            // Change the view
            window.location.hash = hash;
            tester.compiledTemplates++;
        });

        // Verify that [app.activeModel] is an object reference to the current model
        // from (app.models[app.activeController.modelName]).
        QUnit.test('Check [app.activeModel] Object', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Add a simple object as a model
            var modelName = 'activeModelTest';
            app.addModel(modelName, {
                title: 'ActiveModelTest',
                data: [0, 1, 2],
            });

            // Define controller without a view. The URL hash change
            // will trigger [onRendered()].
            var path = '/active-model-test';
            app.addController({
                path: path,
                modelName: modelName,
                onRendered: function() {
                    // Check expected properties
                    assert.equal(modelName, app.activeController.modelName, '[app.activeController.modelName] matches expected model: ' + app.activeController.modelName);
                    assert.ok(app.activeModel === app.models[app.activeController.modelName], 'app.activeModel === app.models[app.activeController.modelName]');

                    // Modify from [app.activeModel] and check object in [app.models]
                    app.activeModel.title += ' (Updated)';
                    assert.equal(app.models[app.activeController.modelName].title, 'ActiveModelTest (Updated)', 'Updated [app.models] from [app.activeModel]');

                    // Mark the test as complete
                    done();
                },
            });

            // Change hash to trigger controller to run
            tester.modelsCount++;
            tester.controllersCount++;
            window.location.hash = path;
        });

        QUnit.test("Check for a Dynamic [app.activeModel] Object when the Controller doesn't have a model", function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (app.viewEngine() === 'Vue') {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // Define controller without a view. The URL hash change
            // will trigger [onRendered()].
            var path = '/null-active-model-test';
            app.addController({
                path: path,
                onRendered: function() {
                    // Check App Model Properties
                    assert.equal(app.activeController.modelName, null, 'app.activeController.modelName === null');
                    assert.ok(app.activeModel !== null, 'app.activeModel !== null');
                    assert.ok(app.activeModel === this, 'app.activeModel === this');

                    // Define and verify property
                    this.modelProp = 'Test';
                    assert.equal(app.activeModel.modelProp, 'Test', 'app.activeModel.modelProp: ' + app.activeModel.modelProp);

                    // Mark the test as complete
                    tester.modelsCount++;
                    tester.checkCounts(assert);
                    done();
                },
            });

            // Change hash to trigger controller to run
            tester.controllersCount++;
            window.location.hash = path;
        });

        // Download a script using the standard [src] HTML attribute
        QUnit.test('Script Download from [src] Attribute', function (assert) {
            var done = assert.async();
            var hash = '#/download-script-src';
            var expectedHtml = 'Server:[script-src][script,src,]';
            var shouldCompileTemplate = true;
            tester.pageTester(hash, shouldCompileTemplate, expectedHtml, assert, done, function () {
                tester.submittedRequestCount++;

                // Model was specified from HTML script so verify attribute and controller
                var expectedModel = 'unitTestScriptSrc';
                var script = document.querySelector('script[data-route="/download-script-src"]');
                assert.equal(script.tagName, 'SCRIPT', 'script.tagName: ' + script.tagName);
                assert.equal(script.getAttribute('data-model'), expectedModel, 'Script [data-model]: ' + script.getAttribute('data-model'));
                assert.equal(app.activeController.modelName, expectedModel, 'app.activeController.modelName: ' + app.activeController.modelName);
            });
        });

        // Download a script using the [data-src] Attribute rather than the standard [src] Attribute
        QUnit.test('Script Download from [data-src] Attribute', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Run Test
            var hash = '#/download-script-data-src';
            var expectedHtml = 'Server:[script-data-src][]';
            var shouldCompileTemplate = true;
            tester.pageTester(hash, shouldCompileTemplate, expectedHtml, assert, done, function () {
                tester.submittedRequestCount++;
            });
        });

        // Call a different contoller using the same [data-src] template previously called. This
        // verifies that downloaded views are re-used rather than downloaded on different controllers.
        QUnit.test('Script Download from [data-src] Attribute using existing Template', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Run Test
            var hash = '#/download-script-data-src2';
            var expectedHtml = 'Server:[control-test][123,456,789,]';
            var shouldCompileTemplate = false;
            tester.pageTester(hash, shouldCompileTemplate, expectedHtml, assert, done);
        });

        // For this test both the main template uses [data-src] and the refereced
        // [control] template in the main page.
        QUnit.test('Control Script download from [data-src] Attribute', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Run Test
            var hash = '#/download-control-data-src';
            var expectedHtml = 'Control:[123,456,789,]';
            var shouldCompileTemplate = true;
            tester.pageTester(hash, shouldCompileTemplate, expectedHtml, assert, done, function () {
                tester.compiledTemplates++;
                tester.submittedRequestCount += 2;
            });
        });

        // Test View Controls
        // This is one of the largest tests as it tests rendering many nested controls
        // (both valid controls and all error messages related to controls).
        QUnit.test('View Controls', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (app.viewEngine() === 'Vue') {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // Define Test URL Hash
            var hash = '#/control-test';

            // ------------------------------------------------------------------
            // Check Controls that render without error
            // They will be nested under
            // <div id="controls" data-template-id="controls-template"></div>
            // ------------------------------------------------------------------
            function checkControls() {
                // Define variables
                // The [controls] variable contains an array of objects that
                // represent controls and expected html.
                var controls = [
                        { // Simple Control with an [id] attribute
                            selector: '#controls #control-1',
                            expected1: '<ul><li>123</li><li>456</li><li>789</li></ul>',
                            expected3: '<ul><li>abcd</li><li>xyz</li></ul>'
                        },
                        { // Simple Control with an [class] attribute (same template as '#control-1')
                            selector: '#controls .control-2',
                            expected1: '<ul><li>123</li><li>456</li><li>789</li></ul>',
                            expected2: '<ul><li>abcd</li><li>xyz</li></ul>'
                        },
                        { // Nested control that calls another nested control
                            selector: '#controls div[data-template-id="control-embed-template"] #control-embed',
                            expected1: 'Embed:[control-test][123,456,789,]',
                            expected3: 'Embed:[control-test][abcd,xyz,]'
                        },
                        { // Control that downloads another control
                            selector: '#controls #downloaded-control',
                            expected1: 'Server:[control-test][123,456,789,]',
                            expected2: 'Server:[control-test][abcd,xyz,]'
                        },
                        { // Control that downloads a control which downloads another control
                            selector: '#controls div[data-download1] #control-download2',
                            expected1: 'Download2:[control-test][123,456,789,]',
                            expected3: 'Download2:[control-test][abcd,xyz,]'
                        },
                        { // Control that downloads a control which calls an embedded control on screen
                            selector: '#controls div[data-call-embed] #Download_Then_Embed',
                            expected1: 'Download_Then_Embed:[control-test][123,456,789,]',
                            expected3: 'Download_Then_Embed:[control-test][abcd,xyz,]'
                        },
                        { // Control that verifies how the template rendering function escapes special characters
                            selector: '#controls #escape-string',
                            expectedHtml: '&amp;&lt;&gt;"\'/'
                        },
                    ],
                    n,
                    m,
                    html,
                    x,
                    expected,
                    control,
                    element,
                    updatedAt;

                // Loop through the test 3 times:
                // 1) First check controls for the intial state
                // 2) Before this loop update two of the controls and verify
                //    that only 2 controls changed.
                // 3) Refresh all controls before this loop and verify that they
                //    were all updated.
                for (x = 0; x < 3; x++) {
                    // Check each control
                    for (n = 0, m = controls.length; n < m; n++) {
                        // Get the html for the control and remove all spaces and line breaks
                        control = controls[n];
                        element = document.querySelector(control.selector);
                        if (element === null) {
                            assert.ok(false, 'Did not find control at: ' + control.selector);
                            return;
                        }
                        html = element.innerHTML.trim().replace(/\n| /g, '');

                        // Compare with expected HTML
                        if (control.expectedHtml !== undefined) {
                            expected = control.expectedHtml;
                        } else {
                            // Control HTML will change only once, either on the 2nd or 3rd loop
                            switch (x) {
                                case 0:
                                    expected = control.expected1;
                                    break;
                                case 1:
                                    expected = (control.expected2 === undefined ? control.expected1 : control.expected2);
                                    break;
                                case 2:
                                    expected = (control.expected3 === undefined ? control.expected2 : control.expected3);
                                    break;
                                default:
                                    throw 'A code update changed the behavior of this function. Unit test must be fixed';
                            }
                        }
                        assert.equal(html, expected, 'View Controls HTML Check for Selector (Check #' + String(x + 1) + '): ' + control.selector);
                    }

                    // There should be 31 controls on screen and when [app.refreshAllHtmlControls()]
                    // is called the attribute [data-updated-at] will be updated to the same integer
                    // for all controls. This update will happen when the controls are loaded as
                    // controls are rendered in the view from the function and on the last loop
                    // when all controls are updated.
                    if (x === 0 || x === 2) {
                        updatedAt = document.querySelector('[data-updated-at]').getAttribute('data-updated-at');
                        assert.ok(!isNaN(updatedAt), 'Checking that the attribute [data-updated-at] for the first control found is an integer: ' + updatedAt);
                    }
                    assert.equal(document.querySelectorAll('[data-updated-at="' + updatedAt + '"]').length, 31, 'Checking Control Count of all Controls updated from [app.refreshAllHtmlControls()]');

                    // Update controls differently based on loop number
                    if (x === 0) {
                        // Update the model
                        app.models.unitTestControls.values = ['abcd', 'xyz'];
                        // Refresh two controls
                        // One by passing a string for the id value and the
                        // other by passing an HTMLElement
                        app.refreshHtmlControl(document.querySelector('#controls .control-2'));
                        app.refreshHtmlControl('downloaded-control');
                    } else if (x === 1) {
                        app.refreshAllHtmlControls();
                    }
                }

                // Expected Templates to be compiled and downloaded
                // This number should be fixed regardless of how many additional
                // calls to [app.refreshHtmlControl()] and [app.refreshAllHtmlControls()]
                // are made in this function so these values are incremented
                // outside of the loop.
                tester.compiledTemplates += 8;
                tester.submittedRequestCount += 3;
            }

            // -----------------------------------------------------------------------------------
            // Check Controls that render with an error
            // They will be nested under
            // <div id="error-controls" data-template-id="error-controls-template"></div>
            // -----------------------------------------------------------------------------------
            function checkErrorControls(eventTime) {
                // Define Variables and Test Controls with expected HTML
                var controls = [
                        { item: 'control-error-1', html: 'Error with Element &lt;div id="{id}" class="{class}" data-template-id="id-and-url" data-template-url="id-and-url"&gt; - A control must have only one of the template attribute defined; either [data-template-id] or [data-template-url]. Both attributes are defined on the control.' },
                        { item: 'control-error-2', html: 'Error with Element &lt;div id="{id}" class="{class}" data-template-id="missing-template"&gt; - Script Tag for Template ID [missing-template] does not exist.' },
                        { item: 'control-error-3', html: 'Error with Element &lt;div id="{id}" class="{class}" data-template-url="missing-url.htm"&gt; - Error Downloading Template: [missing-url.htm], Error: Error loading data. Server Response Code: 404, Response Text: Not Found' },
                        { item: 'control-error-4', html: 'Error with Element &lt;div id="{id}" class="{class}" data-template-id="control-unknown-template"&gt; - TypeError: Unsupported or Unknown Template View Engine specified in &lt;script id="control-unknown-template" type="text/x-unknown-template" data-engine="null"&gt;' },
                        { item: 'control-error-5', html: 'Error with Element &lt;div id="{id}" class="{class}" data-template-id="control-invalid-template"&gt; - {error_type}: {error}' },
                        { item: 'control-error-6', html: 'Error with Element &lt;div id="{id}" class="{class}" data-template-url="{url}"&gt; - {error_type}: {error}' },
                        { item: 'control-title', html: '<span>control-test</span>' }
                    ],
                    html,
                    validHtml,
                    control,
                    id,
                    className,
                    selector,
                    errorStart,
                    errorType,
                    n,
                    m,
                    x;

                // Get the expected error type which changes based on the rendering engine
                switch (app.viewEngine()) {
                    case 'Handlebars':
                        errorType = 'Error';
                        errorStart = 'Parse error';
                        break;
                    case 'Nunjucks':
                        errorType = 'Template render error';
                        errorStart = '(unknown path)';
                        break;
                    case 'Underscore':
                        errorType = 'SyntaxError';
                        // [Underscore] will return different error messages for different browsers
                        // so don't check the actual error text
                        //	 Chrome on Mac: 'Unexpected token )'
                        //	 Safari on Mac: 'Unexpected end of script'
                        //   Firefox Windows: 'missing } after function body'
                        errorStart = '';
                        break;
                }

                // Check Hash URL and Compare Control HTML
                assert.equal(window.location.hash, hash, 'View Controls Hash Check');
                for (n = 0, m = controls.length; n < m; n++) {
                    // Is this the last item?
                    if (n === (m - 1)) {
                        // Last control is a valid item with no error
                        control = document.getElementById(controls[n].item);
                        if (control === null) {
                            assert.ok(false, 'Could not find contol at: ' + controls[n].item);
                            break;
                        }
                        html = control.innerHTML.trim();
                        assert.equal(html, controls[n].html, 'View Controls HTML Check [' + eventTime + '] for [' + id + ']: ' + html);
                    } else {
                        // This function gets called twice but template and http counts should
                        // only increase the first time it is called.
                        if (eventTime === 'Before refreshAllHtmlControls()') {
                            // All other items other than the last item are error templates.
                            // For error template in the array incremment the compiled templates by 1.
                            tester.compiledTemplates++;

                            // Was the template loaded from a URL? If so add 1 submitted request
                            // as each template is downloaded only once.
                            if (controls[n].html.indexOf('{url}') !== -1) {
                                tester.submittedRequestCount++;
                            }
                        }

                        // Run each test 3 times. This confirms a number of items:
                        // *) Templates are only compiled once regardless of error
                        // *) Error message is unqiue per control
                        // *) Error message is helpfull and relevant for each control
                        for (x = 0; x < 3; x++) {
                            switch (x) {
                                // Control will end with [a] in the [id] attribute
                                case 0:
                                    id = controls[n].item + 'a';
                                    className = '';
                                    selector = '#' + id;
                                    break;
                                // Control will end with [b] in the [id] attribute
                                case 1:
                                    id = controls[n].item + 'b';
                                    className = '';
                                    selector = '#' + id;
                                    break;
                                // Control will end with [c] in the [class] attribute
                                case 2:
                                    id = '';
                                    className = controls[n].item + 'c';
                                    selector = '.' + className;
                                    break;
                            }
                            control = document.querySelector(selector);
                            if (control === null) {
                                assert.ok(false, 'Could not find contol at: ' + selector);
                                continue;
                            }
                            html = control.querySelector('.dataformsjs-error').innerHTML.trim();

                            // Update HTML to validate against.
                            // The 3rd test will be a <span> instead of a <div>.
                            // All error will provide both control [id] and [class] attributes.
                            validHtml = controls[n].html.trim();
                            if (x == 2) {
                                validHtml = validHtml.replace('&lt;div', '&lt;span');
                            }
                            validHtml = validHtml.replace('{id}', id).replace('{class}', className);

                            // If there is a URL for the control then read the actual value from the
                            // control as it will vary based on server side framework and client side
                            // rendering engine.
                            if (validHtml.indexOf('{url}') !== -1) {
                                validHtml = validHtml.replace('{url}', control.getAttribute('data-template-url'));
                            }

                            // Compare
                            if (validHtml.indexOf('{error}') === -1) {
                                assert.equal(html, validHtml, 'View Controls HTML Check [' + eventTime + '] for [' + selector + ']: ' + html);
                            } else {
                                // Replace with eror text, and check only the first part of the error as the actual
                                // html will contain extra error message text that will vary based on the version
                                // of the rendering template engine.
                                validHtml = validHtml.replace('{error_type}', errorType).replace('{error}', errorStart);
                                assert.ok((html.indexOf(validHtml) === 0), 'View Controls HTML Check [' + eventTime + '] for [' + selector + ']: ' + html);
                                // In case future changes break a test the following check shows
                                // full HTML which can help solve the issue.
                                if (html.indexOf(validHtml) !== 0) {
                                    assert.equal(html, validHtml, 'Full HTML for Previous Error [' + selector + ']');
                                }
                            }
                        }
                    }
                }

                // Add an expected submitted request for the item [html/unit-test-parse-error-*.htm]
                // the first time this function is called.
                if (eventTime === 'Before refreshAllHtmlControls()') {
                    tester.submittedRequestCount++;
                }
            }

            // -------------------------------------------------------------
            // Test app.refreshHtmlControl() Validation for error messages
            // that would only occur if calling the function manually.
            // These errors do not update any controls on screen.
            // -------------------------------------------------------------
            function checkErrorMessages_NoUpdate() {
                var expectedMessage;

                // Get HTML of the View as these tests should not change anything
                var view = document.getElementById('view');
                var html = view.innerHTML;

                try {
                    expectedMessage = 'Invalid type for parameter [control] in the function [DataFormsJS.refreshHtmlControl()]: object';
                    app.refreshHtmlControl({});
                    assert.ok(false, 'Test should have failed');
                } catch (e) {
                    assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                    assert.equal(e.message, expectedMessage, expectedMessage);
                }
                assert.equal(view.innerHTML, html, 'Checking View HTML to make sure there were no changes');

                try {
                    expectedMessage = 'Control not found for [missing-control] when the function [DataFormsJS.refreshHtmlControl()] was called.';
                    app.refreshHtmlControl('missing-control');
                    assert.ok(false, 'Test should have failed');
                } catch (e) {
                    assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                    assert.equal(e.message, expectedMessage, expectedMessage);
                }
                assert.equal(view.innerHTML, html, 'Checking View HTML to make sure there were no changes');
            }

            // -------------------------------------------------------------
            // Test app.refreshHtmlControl() Validation for error messages
            // that would only occur if calling the function manually.
            // These errors will update controls on screen.
            // -------------------------------------------------------------
            function checkErrorMessages_ScreenUpdate() {
                var expectedMessage,
                    expectedHtml,
                    id = 'error-test',
                    element = document.getElementById(id),
                    n;

                // Private function to add error text prefix for the element
                function getError() {
                    return 'Error with Element &lt;div id="' + id + '" class=""&gt; - ' + expectedMessage;
                }

                // Run errors twice, once by refering to string ID and once directly with element
                for (n = 0; n < 2; n++) {
                    // Invalid Callback
                    expectedMessage = '[callback] was not defined as a [function] when the [DataFormsJS.refreshHtmlControl()] was called';
                    expectedHtml = getError();
                    try {
                        app.refreshHtmlControl((n === 0 ? id : element), '');
                        assert.ok(false, 'Invalid Callback (' + String(n) + ') Test should have failed');
                    } catch (e) {
                        assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                        assert.equal(e.message, expectedMessage, expectedMessage);
                    }
                    assert.equal(element.querySelector('.dataformsjs-error').innerHTML, expectedHtml, 'Invalid Callback (' + String(n) + ') Checking HTML for Expected Error: ' + expectedMessage);

                    // [data-template-id] or [data-template-url] both defined
                    element.setAttribute('data-template-id', 'test');
                    element.setAttribute('data-template-url', 'test');
                    expectedMessage = 'A control must have only one of the template attribute defined; either [data-template-id] or [data-template-url]. Both attributes are defined on the control.';
                    expectedHtml = getError();
                    expectedHtml = expectedHtml.replace('class=""', 'class="" data-template-id="test" data-template-url="test"');
                    try {
                        app.refreshHtmlControl((n === 0 ? id : element));
                        assert.ok(false, 'Id and Url Defined (' + String(n) + ') Test should have failed');
                    } catch (e) {
                        assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                        assert.equal(e.message, expectedMessage, expectedMessage);
                    }
                    assert.equal(element.querySelector('.dataformsjs-error').innerHTML, expectedHtml, 'Id and Url Defined (' + String(n) + ') Checking HTML for Expected Error: ' + expectedMessage);

                    // [data-template-id] and [data-template-url] not defined
                    element.removeAttribute('data-template-id');
                    element.removeAttribute('data-template-url');
                    expectedMessage = 'A control must have either attribute [data-template-id] or [data-template-url]. Niether attribute is defined for the control.';
                    expectedHtml = getError();
                    try {
                        app.refreshHtmlControl((n === 0 ? id : element));
                        assert.ok(false, 'Id and Url Missing (' + String(n) + ') Test should have failed');
                    } catch (e) {
                        assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                        assert.equal(e.message, expectedMessage, expectedMessage);
                    }
                    assert.equal(element.querySelector('.dataformsjs-error').innerHTML, expectedHtml, 'Id and Url Missing (' + String(n) + ') Checking HTML for Expected Error: ' + expectedMessage);
                }
            }

            // Define a Global App Function to check the page after it is rendered
            app.onUpdateViewComplete = function () {
                // Check the Controls and Related Errors
                checkErrorControls('Before refreshAllHtmlControls()');
                checkControls();
                checkErrorControls('After refreshAllHtmlControls()');
                checkErrorMessages_NoUpdate();
                checkErrorMessages_ScreenUpdate();

                // Add 2 compiled templates for the root controls
                tester.compiledTemplates += 2;
                tester.checkCounts(assert);

                // Reset Global App Functions and redirect back to default URL
                app.onUpdateViewComplete = null;
                window.location.hash = '#/';

                // Mark the test as complete
                done();
            };

            // Change the view
            window.location.hash = hash;
            tester.compiledTemplates++;
        });

        // Test app Miscellaneous Functions
        // Example general functions and uncommon error messages are tested here.
        QUnit.test('app - Miscellaneous Functions', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (window.Vue !== undefined) {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // Define a private function that gets called later in this test
            // to run a variety of tests on the DataFormsJS Framework.
            function miscTestFunctions() {
                var templateType,
                    expectedMessage,
                    viewEngine,
                    changeToViewEngine,
                    changedViewEngine,
                    tests,
                    text,
                    expectedHtml;

                // Test function getTemplateType()
                templateType = app.getTemplateType(document.getElementById('template-test'));
                assert.equal(templateType, app.viewEngine(), 'Checking app.getTemplateType("template-test"): ' + templateType);

                templateType = app.getTemplateType(document.getElementById('control-unknown-template'));
                assert.equal(templateType, 'Unknown', 'Checking app.getTemplateType("control-unknown-template"): ' + templateType);

                try {
                    expectedMessage = 'Missing parameter [script] for the function [DataFormsJS.getTemplateType()]';
                    templateType = app.getTemplateType();
                    assert.ok(false, 'Test should have failed');
                } catch (e) {
                    assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                    assert.equal(e.message, expectedMessage, expectedMessage);
                }

                try {
                    expectedMessage = 'Invalid type for parameter [script] for the function [DataFormsJS.getTemplateType()], expected HTMLElement, received: object';
                    templateType = app.getTemplateType({});
                    assert.ok(false, 'Test should have failed');
                } catch (e) {
                    assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                    assert.equal(e.message, expectedMessage, expectedMessage);
                }

                // Test function viewEngine(); this function both reads and writes the value
                // of the current view engine. If setting the value the function is chainable
                // which this test also confirms.
                viewEngine = app.viewEngine();
                changeToViewEngine = (viewEngine === 'Handlebars' ? 'Nunjucks' : 'Handlebars');
                changedViewEngine = app.viewEngine(changeToViewEngine).viewEngine();
                assert.ok((viewEngine !== changedViewEngine), 'Checking that the view engine was changed from: ' + viewEngine);
                assert.equal(changedViewEngine, changeToViewEngine, 'Checking that [app.viewEngine()] was changed to: ' + changeToViewEngine);

                // Change back to the original view engine
                app.viewEngine(viewEngine);

                // Run Error Tests
                tests = [
                    { value: 'Not Set', error: 'Invalid value specified for setting the ViewEngine: Not Set' },
                    { value: 'Unknown', error: 'Invalid value specified for setting the ViewEngine: Unknown' },
                    { value: 'Mixed', error: 'Invalid value specified for setting the ViewEngine: Mixed' },
                    { value: 'ERROR', error: 'Unknown value specified for setting the ViewEngine [ERROR], refer to documentation or values from the enum/object [ViewEngines] for valid options.' }
                ];
                tests.forEach(function (test) {
                    try {
                        app.viewEngine(test.value);
                        assert.ok(false, 'Test should have failed');
                    } catch (e) {
                        assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                        assert.equal(e.message, test.error, test.error);
                    }
                });

                // Confirm that the original view engine is still set
                assert.equal(app.viewEngine(), viewEngine, 'Checking that [app.viewEngine()] is still set: ' + viewEngine);

                // Escape HTML
                text = '" & \' < >';
                expectedHtml = '&quot; &amp; &#039; &lt; &gt;';
                assert.equal(app.escapeHtml(text), expectedHtml, 'Checking app.escapeHtml() with all escape characters: ' + expectedHtml);
                assert.equal(app.escapeHtml(), undefined, 'Checking app.escapeHtml() without a parameter');
                assert.equal(app.escapeHtml(), null, 'Checking app.escapeHtml() with a null parameter');
                assert.equal(app.escapeHtml(123), 123, 'Checking app.escapeHtml() with a numeric parameter');

                // Modify the [/misc-functions2] controller to test two different errors.
                // These errors would not be possible through the addController() method.
                // This is testing unlikely but possible error scenarios.
                app.controller('/misc-functions2').viewUrl = 'error';
                expectedHtml = 'Error with [Controller.path = "/misc-functions2"] - A controller must have either [viewId] or [viewUrl] defined but not both properties. This error is not possible when calling the [addController()] so one or more of the properties were modified by JavaScript code after the controller was already added.';

                // The first test is for an error defined in the private function [DataFormsJS compileTemplate()]
                tester.pageTester('#/misc-functions2', true, expectedHtml, assert, function () {
                    // Redirect back to default URL - '#/'
                    tester.pageTester('#/', false, 'Initial view has loaded', assert, function () {
                        // Change back the controller for so that it can be called again
                        app.controller('/misc-functions2').viewUrl = null;

                        // Manually modify the already compiled template (this will trigger the error)
                        for (var n = 0, m = app.compiledTemplates.length; n < m; n++) {
                            if (app.compiledTemplates[n].id === 'misc-test-template') {
                                app.compiledTemplates[n].type = 'Unknown';
                                break;
                            }
                        }

                        // Test Error from the private function [DataFormsJS renderTemplate()]
                        var expectedHtml = 'Error with [Controller.path = "/misc-functions2"] - TypeError: Unsupported or Unknown Template View Engine: Unknown';
                        tester.pageTester('#/misc-functions2', false, expectedHtml, assert, done);
                    });
                });
            }

            // Manually add a model for this test
            app.addModel('MiscTest', {
                testTitle: 'Misc Testing'
            });
            tester.modelsCount++;

            // Generate a template string
            var template = null;
            var scriptType = null;
            switch (app.viewEngine()) {
                case 'Handlebars':
                    template = '<div>{{testTitle}}</div>';
                    scriptType = 'handlebars';
                    break;
                case 'Nunjucks':
                    template = '<div>{{ testTitle }}</div>';
                    scriptType = 'nunjucks';
                    break;
                case 'Underscore':
                    template = '<div><%- testTitle %></div>';
                    scriptType = 'underscore';
                    break;
            }

            // Dynamically create a script element on the page with the template
            var script = document.createElement('SCRIPT');
            script.id = 'misc-test-template';
            script.type = 'text/x-template';
            script.setAttribute('data-engine', scriptType);
            script.innerHTML = template;
            document.body.appendChild(script);

            // Define a controller to test misc functions
            app.addController({
                path: '/misc-functions',
                viewId: 'misc-test-template',
                modelName: 'MiscTest'
            });
            tester.controllersCount++;

            // Define a controller to test a specific error
            app.addController({
                path: '/misc-functions2',
                viewId: 'misc-test-template'
            });
            tester.controllersCount++;

            // Redirect to the controller created in this function and then
            // run the misc test functions.
            var shouldCompileTemplate = true;
            var expectedHtml = 'Misc Testing';
            tester.pageTester('#/misc-functions', shouldCompileTemplate, expectedHtml, assert, function () {
                miscTestFunctions();
            });
        });


        // Test an uncommon error if the calling code makes
        // a controller invalid after it was correctly defined.
        QUnit.test('app - Error - Invalid Controller - Missing [viewId] and [viewUrl] after defining [viewId]', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (window.Vue !== undefined) {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // Define a valid controller then modify it to set
            // [viewId] to null after it has been added.
            app
                .addController({
                    path: '/missing-view-id-and-url-1',
                    viewId: 'misc-test-template',
                    modelName: 'MiscTest'
                })
                .controller('/missing-view-id-and-url-1')
                .viewId = undefined;
            tester.controllersCount++;

            // Run Test
            var hash = '#/missing-view-id-and-url-1';
            var expectedHtml = 'Error with [Controller.path = "/missing-view-id-and-url-1"] - A controller must have either [viewId] or [viewUrl] defined but neither property is defined. This error is not possible when calling the [addController()] so one or more of the properties were modified by JavaScript code after the controller was already added.';
            var shouldCompileTemplate = true;
            tester.pageTester(hash, shouldCompileTemplate, expectedHtml, assert, done);
        });

        // Similar to above route but resetting [viewUrl] instead of [viewId]
        QUnit.test('app - Error - Invalid Controller - Missing [viewId] and [viewUrl] after defining [viewUrl]', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (window.Vue !== undefined) {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // Define a valid controller then modify it to set
            // [viewId] to null after it has been added.
            app
                .addController({
                    path: '/missing-view-id-and-url-2',
                    viewUrl: 'misc-test-template',
                    modelName: 'MiscTest'
                })
                .controller('/missing-view-id-and-url-2')
                .viewUrl = undefined;
            tester.controllersCount++;

            // Run Test
            var hash = '#/missing-view-id-and-url-2';
            var expectedHtml = 'Error with [Controller.path = "/missing-view-id-and-url-2"] - A controller must have either [viewId] or [viewUrl] defined but neither property is defined. This error is not possible when calling the [addController()] so one or more of the properties were modified by JavaScript code after the controller was already added.';
            var shouldCompileTemplate = true;
            tester.pageTester(hash, shouldCompileTemplate, expectedHtml, assert, done);
        });

        // Custom Tests unique to each template engine
        switch (app.viewEngine()) {
            // Test Handlebars Helpers if the Unit Test Page is the Handlebars Page
            case 'Handlebars':
                QUnit.test('Handlebars Helpers', function (assert) {
                    // Asynchronous test
                    var done = assert.async();

                    // Define Test URL Hash
                    var hash = '#/handlebars-helpers';

                    // Define a Global App Function to check the page after it is rendered
                    app.onUpdateViewComplete = function () {
                        // function to safely get textContent or null
                        var text = function (id) {
                            var text = (document.getElementById(id) === null ? null : document.getElementById(id).textContent);
                            return text;
                        };

                        var value, result, isValid, n, m, x, y;

                        // Array data for 'date-date-01' and other 'date-*' values looks the same however
                        // the character values are not he same. This is due to the charCode returned for IE11:
                        //   text('date-date-01').charCodeAt(0) === text('date-date-01').charCodeAt(0) === 8206
                        //   Intl.DateTimeFormat('en-US', {}).format(new Date()).charCodeAt(0) === 8206

                        // Expected Results
                        var expected = [
                            { id: 'string-format-1', value: 'Hello World' },
                            { id: 'string-format-2', value: 'Hello World' },
                            { id: 'string-format-3', value: 'Hello World {missing}' },
                            { id: 'string-join', value: '1,2,3,4,5' },
                            { id: 'string-concat', value: '12345' },
                            { id: 'number-percent-1', values: ['28%', '28 %'] },
                            { id: 'number-percent-2', values: ['27%', '27 %'] },
                            { id: 'number-percent-3', values: ['27.670%', '27.670 %'] },
                            { id: 'number-format-01', value: '123' },
                            { id: 'number-format-02', value: '1,234' },
                            { id: 'number-format-03', value: '123,456' },
                            { id: 'number-format-04', value: '1,234,567,890' },
                            { id: 'number-format-05', value: 'abc' },
                            { id: 'number-currency-01', values: ['$123', '$123.00'] },
                            { id: 'number-currency-02', values: ['$1,234', '$1,234.00'] },
                            { id: 'number-currency-03', values: ['$123,456', '$123,456.00'] },
                            { id: 'number-currency-04', value: '$123,456.79' },
                            { id: 'date-now', value: (new Date()).getFullYear(), type: 'contains' },
                            { id: 'date-date-01', values: ['1/31/2015', '‎1‎/‎31‎/‎2015'] },
                            { id: 'date-dateTime-01', values: ['1/31/2015, 1:23:45 PM', '‎1‎/‎31‎/‎2015‎ ‎1‎:‎23‎:‎45‎ ‎PM'] },
                            { id: 'date-time-01', values: ['1:23:45 PM', '‎1‎:‎23‎:‎45‎ ‎PM'] },
                            { id: 'javascript-01', value: '2' },
                            { id: 'javascript-02', value: 'World' },
                            { id: 'javascript-03', value: 'World' },
                            { id: 'javascript-04', value: 'true' },
                            { id: 'ifCond-01', value: 'true' },
                            { id: 'string-01', value: 'test' },
                            { id: 'string-02', value: 'TEST' }
                        ];

                        // Compare Values with the Expected Result
                        assert.equal(window.location.hash, hash, 'Event Order Hash Check');
                        for (n = 0, m = expected.length; n < m; n++) {
                            // Only search for part of the string
                            if (expected[n].type && expected[n].type === 'contains') {
                                value = (text(expected[n].id) || '');
                                result = value.indexOf(expected[n].value) !== -1;
                                assert.ok(result, expected[n].id + ' - Checking [' + value + '] for [' + expected[n].value + ']');
                            } else if (expected[n].values !== undefined) {
                                // Check of one of several values (used for different browsers)
                                // For example the JavaScript:
                                //   new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(123)
                                // Will return '$123.00' in Firefox and '$123.00' in Chrome
                                value = text(expected[n].id);
                                isValid = false;

                                for (x = 0, y = expected[n].values.length; x < y; x++) {
                                    if (expected[n].values[x] === value) {
                                        isValid = true;
                                        break;
                                    }
                                }

                                assert.ok(isValid, expected[n].id + ' - Checking [' + value + '] for [' + expected[n].values.join(', ') + ']');
                            } else {
                                // Check for an exact match
                                assert.equal(text(expected[n].id), expected[n].value, expected[n].id);
                            }
                        }

                        // Reset Global App Functions and redirect back to default URL
                        app.onUpdateViewComplete = null;
                        window.location.hash = '#/';

                        // Mark the test as complete
                        done();
                    };

                    // Change the view
                    window.location.hash = hash;
                    tester.compiledTemplates++;
                });
                break;
            case 'Nunjucks':
                // Test Nunjucks Environment if the Unit Test Page is the Nunjucks Page
                QUnit.test('Nunjucks with Custom Environment', function (assert) {
                    // Asynchronous test
                    var done = assert.async();

                    // Check default value for null
                    assert.equal(app.nunjucksEnvironment, null, 'app.nunjucksEnvironment should equall null');

                    // Define custom functions for Nunjucks
                    var env = new nunjucks.Environment();
                    env.addGlobal('appViewEngine', function() {
                        return app.viewEngine();
                    });
                    env.addGlobal('helloWorld', function() {
                        return 'Hello World';
                    });
                    app.nunjucksEnvironment = env;

                    // Define the Test
                    var hash = '#/nunjucks-defined-environment';
                    var expectedHtml = '[Nunjucks][Hello World]';
                    tester.pageTester(hash, true, expectedHtml, assert, done, function () {
                        app.nunjucksEnvironment = null;
                    });
                });

                // Similar to the above test but not using [app.nunjucksEnvironment]
                // so errors are displayed.
                QUnit.test('Nunjucks without Custom Environment', function (assert) {
                    // Asynchronous test
                    var done = assert.async();

                    // Test Route
                    var hash = '#/nunjucks-default-environment';

                    // Check default value for null
                    assert.equal(app.nunjucksEnvironment, null, 'app.nunjucksEnvironment should equall null');

                    // Define a Global App Function to check the page after it is rendered
                    app.onUpdateViewComplete = function () {
                        // Get page contents
                        var html = document.getElementById('view').textContent.trim();

                        // Check the URL Hash and for expected error messsage
                        assert.equal(window.location.hash, hash, 'URL Hash Check - ' + hash);
                        assert.ok((html.indexOf('Error with [Controller.path = "/nunjucks-default-environment"]') === 0), 'Checking Start of Error');
                        assert.ok((html.indexOf('Error: Unable to call') !== -1), 'Checking for Error Text');

                        // Reset Global App Functions and redirect back to default URL
                        app.onUpdateViewComplete = null;
                        window.location.hash = '#/';

                        // Mark the test as complete or call the next function
                        done();
                    };

                    // Change the view
                    window.location.hash = hash;
                    tester.compiledTemplates++;
                });
                break;
            default:
                break;
        }

        // Check the jsonData Page Object
        // This test is checking a basic successful response where there
        // are two page states - an [isLoading] state and a [isLoaded] state.
        QUnit.test('Page jsonData Loading and View Data from URL', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Define the Test
            var expectedData = { serverMessage: 'Response from Server' };
            tester.pageTester2('#/page-json-data', true, '[page-json-data]Page is Loading', '[page-json-data]Response from Server', expectedData, false, assert, done, function () {
                // Check jsonData model properties after the view is finished loading
                var model = (app.activeVueModel === null ? app.activeModel : app.activeVueModel);
                var url = '/unit-testing/page-json-data';
                assert.equal(model.url, url, 'Checking model.url: ' + model.url);
                assert.equal(model.submittedFetchUrl, url, 'Checking model.submittedFetchUrl: ' + model.submittedFetchUrl);
                assert.equal(model.isLoading, false, 'Checking model.isLoading: ' + model.isLoading);
                assert.equal(model.isLoaded, true, 'Checking model.isLoaded: ' + model.isLoaded);
                assert.equal(model.hasError, false, 'Checking model.hasError: ' + model.hasError);
                assert.equal(model.errorMessage, null, 'Checking model.errorMessage: ' + model.errorMessage);
                assert.equal(model.loadOnlyOnce, false, 'Checking model.loadOnlyOnce: ' + model.loadOnlyOnce);
                assert.ok(model.fetchTimeStart instanceof Date, 'Checking model.fetchTimeStart: ' + model.fetchTimeStart);
                assert.ok(model.fetchTimeComplete instanceof Date, 'Checking model.fetchTimeComplete: ' + model.fetchTimeComplete);
                assert.equal(model.loadCount, 1, 'Checking model.loadCount: ' + model.loadCount);
                assert.equal(model.errorCount, 0, 'Checking model.errorCount: ' + model.errorCount);
                assert.ok(typeof model.fetchTimeInMilliseconds() === 'number', 'Checking model.fetchTimeInMilliseconds(): ' + model.fetchTimeInMilliseconds());

                // When IE is used a technique known as Cache Busting is used so the last URL
                // should look like: '/unit-testing/page-json-data?_=1433806192243'
                var expectedUrl = /^\/unit-testing\/page-json-data\?_=\d+$/;
                var lastUrl = tester.submittedUrls[tester.submittedUrls.length - 1];
                lastUrl = lastUrl.url;
                if (isIE) {
                    assert.ok(expectedUrl.test(lastUrl), 'URL for last request is in the expected format for IE: ' + lastUrl);
                } else {
                    expectedUrl = '/unit-testing/page-json-data';
                    assert.equal(lastUrl, expectedUrl, 'URL for last request is in the expected format: ' + lastUrl);
                }

                // This controller/page as created from HTML script so verify attributes
                var script = document.querySelector('script[data-route="/page-json-data"]');
                assert.equal(script.tagName, 'SCRIPT', 'script.tagName: ' + script.tagName);
                assert.equal(script.getAttribute('data-page'), 'jsonData', 'Script [data-page]: ' + script.getAttribute('data-page'));
                assert.equal(script.getAttribute('data-url'), '/unit-testing/page-json-data', 'Script [data-url]: ' + script.getAttribute('data-url'));
            });
        });

        // Similar to the above jsonData Page Object but using a user-defined property for server data
        QUnit.test('Page jsonData Loading and View Data from URL with Custom Prop', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Define the Test
            var expectedData = { serverMessage: 'Response from Server' };
            tester.pageTester2('#/page-json-data-with-prop', true, '[page-json-data-with-prop]Page is Loading', '[page-json-data-with-prop]Response from Server', expectedData, false, assert, done, function () {
                // Check jsonData model properties after the view is finished loading
                var model = (app.activeVueModel === null ? app.activeModel : app.activeVueModel);
                var url = '/unit-testing/page-json-data';
                assert.equal(model.url, url, 'Checking model.url: ' + model.url);
                assert.equal(model.data.serverMessage, expectedData.serverMessage, 'Checking model.data.serverMessage: ' + model.data.serverMessage);
                assert.equal(model.loadCount, 1, 'Checking model.loadCount: ' + model.loadCount);
                assert.equal(model.errorCount, 0, 'Checking model.errorCount: ' + model.errorCount);
                assert.ok(typeof model.fetchTimeInMilliseconds() === 'number', 'Checking model.fetchTimeInMilliseconds(): ' + model.fetchTimeInMilliseconds());
            });
        });

        // Check the jsonData Page Object
        // This is checking an error response as the server is expected
        // to send a 404 Response Code for the URL. This test is also
        // verifying that the server actually sends a 404 Response.
        QUnit.test('Page jsonData Error Test - 404 Error', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Define the Test
            var expected = '[missing-page-json-data]An error has occurred loading the data. Please refresh the page to try again and if the problem continues contact support.';
            tester.pageTester2('#/missing-page-json-data', true, '[missing-page-json-data]Page is Loading', expected, null, true, assert, done, function () {
                // Check jsonData model properties
                var model = (app.activeVueModel === null ? app.activeModel : app.activeVueModel);
                assert.equal(model.isLoaded, false, 'Checking model.isLoaded: ' + model.isLoaded);
                assert.equal(model.hasError, true, 'Checking model.hasError: ' + model.hasError);
                assert.ok(model.fetchTimeStart instanceof Date, 'Checking model.fetchTimeStart: ' + model.fetchTimeStart);
                assert.ok(model.fetchTimeComplete instanceof Date, 'Checking model.fetchTimeComplete: ' + model.fetchTimeComplete);
                assert.ok(typeof model.fetchTimeInMilliseconds() === 'number', 'Checking model.fetchTimeInMilliseconds(): ' + model.fetchTimeInMilliseconds());
                assert.equal(model.loadCount, 0, 'Checking model.loadCount: ' + model.loadCount);
                assert.equal(model.errorCount, 1, 'Checking model.errorCount: ' + model.errorCount);
                assert.equal(model.submittedFetchUrl, '404', 'Checking model.submittedFetchUrl: ' + model.submittedFetchUrl);
                tester.modelsCount++;

                // Check the Response Code of the Submitted Request
                var lastUrl = tester.submittedUrls[tester.submittedUrls.length - 1];
                assert.equal(lastUrl.status, 404, 'Checking lastUrl.status: ' + lastUrl.status);
            });
        });

        // Check the jsonData Page Object
        // This test is checking a specific error condition from [model.fetchData()]
        // where if the model's [url] is re-defined to an invalid value (null) after
        // having a differnt invalid value that error page will be rendered. This is
        // checking the [model.errorCount !== 0] from the if statement in [fetchData()].
        QUnit.test('Page jsonData - Error from model.fetchData() after an intial error result', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Get the model of the previous controller and set the URL to null
            var modelName = app.controller('/missing-page-json-data').modelName;
            app.models[modelName].url = null;

            // Define the test, the view should be rendered twice
            // using the value [errorTextMissingUrl] each time
            var result = '[missing-page-json-data]' + app.pages.jsonData.model.errorTextMissingUrl;
            tester.pageTester2('#/missing-page-json-data', false, result, result, null, false, assert, done);
        });

        // Check the jsonData Page Object
        // This test is calling a route that is missing the attribute
        // [data-url] resulting in [app.updateView()] only being
        // called once and a specific error displayed.
        QUnit.test('Page jsonData Error Test - Missing Setting', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (window.Vue !== undefined) {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // Define the Test
            var expectedErrorText = 'Error, unable to fetch data. No URL [data-route | model.url | graphql] was specified for this current route.';
            var expectedHtml = '[page-json-data-missing-route]' + expectedErrorText;
            tester.pageTester('#/page-json-data-missing-route', true, expectedHtml, assert, done, function () {
                // Check jsonData model properties
                // model.errorCount is only 1 if the web service was actually called but here it is not
                var model = (app.activeVueModel === null ? app.activeModel : app.activeVueModel);
                assert.equal(model.url, '', 'Checking model.url: ' + model.url);
                assert.equal(model.submittedFetchUrl, '', 'Checking model.submittedFetchUrl: ' + model.submittedFetchUrl);
                assert.equal(model.isLoading, false, 'Checking model.isLoading: ' + model.isLoading);
                assert.equal(model.isLoaded, false, 'Checking model.isLoaded: ' + model.isLoaded);
                assert.equal(model.hasError, true, 'Checking model.hasError: ' + model.hasError);
                assert.equal(model.errorCount, 0, 'Checking model.errorCount: ' + model.errorCount);
                assert.equal(model.loadCount, 0, 'Checking model.loadCount: ' + model.loadCount);
                assert.equal(model.fetchTimeStart, null, 'Checking model.fetchTimeStart: ' + model.fetchTimeStart);
                assert.equal(model.fetchTimeComplete, null, 'Checking model.fetchTimeComplete: ' + model.fetchTimeComplete);
                assert.equal(model.fetchTimeInMilliseconds(), -1, 'Checking model.fetchTimeInMilliseconds(): ' + model.fetchTimeInMilliseconds());
                assert.equal(model.errorTextMissingUrl, expectedErrorText, 'Checking model.errorTextMissingUrl: ' + model.errorTextMissingUrl);
            });
        });

        // Check the jsonData Page Object
        // This route is submitting a request that returns a valid Response
        // Code of 200 and valid JSON however the JSON sent from the server
        // is over-riding the default properties to display an error message.
        QUnit.test('Page jsonData Error Test - Error Message set from Server', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // Define the Test
            var expectedData = {
                isLoaded: false,
                hasError: true,
                errorMessage: 'Error Message set from Server'
            };

            tester.pageTester2('#/page-json-data-error', true, '[page-json-data-error]Page is Loading', '[page-json-data-error]Error Message set from Server', expectedData, false, assert, done, function () {
                // Check jsonData model properties
                // The data is successfully loaded which is why [loadCount=1] and [errorCount=0]
                var model = app.activeModel;
                assert.equal(model.isLoading, false, 'Checking model.isLoading: ' + model.isLoading);
                assert.equal(model.isLoaded, false, 'Checking model.isLoaded: ' + model.isLoaded);
                assert.equal(model.hasError, true, 'Checking model.hasError: ' + model.hasError);
                assert.equal(model.loadCount, 1, 'Checking model.loadCount: ' + model.loadCount);
                assert.equal(model.errorCount, 0, 'Checking model.errorCount: ' + model.errorCount);
                assert.equal(model.submittedFetchUrl, '/unit-testing/page-json-data-error', 'Checking model.submittedFetchUrl: ' + model.submittedFetchUrl);

                // Check the Response Code of the Submitted Request
                var lastUrl = tester.submittedUrls[tester.submittedUrls.length - 1];
                assert.equal(lastUrl.status, 200, 'Checking lastUrl.status: ' + lastUrl.status);
            });
        });

        // Check the jsonData Page Object
        // This route is submitting a request that returns a valid Response
        // Code of 200 however it is sending a Plain Text Response instead
        // of JSON which is why an error is rendered.
        QUnit.test('Page jsonData Error Test - Wrong Data Type Returned', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (window.Vue !== undefined) {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // Define the Test
            var expectedErrorText = 'An error has occurred loading the data. Please refresh the page to try again and if the problem continues contact support.';
            var expectedHtml = '[page-json-data-wrong-type]' + expectedErrorText;
            tester.pageTester2('#/page-json-data-wrong-type', true, '[page-json-data-wrong-type]Page is Loading', expectedHtml, null, true, assert, done, function () {
                // Check jsonData model properties
                var model = app.activeModel;
                assert.equal(model.isLoading, false, 'Checking model.isLoading: ' + model.isLoading);
                assert.equal(model.isLoaded, false, 'Checking model.isLoaded: ' + model.isLoaded);
                assert.equal(model.hasError, true, 'Checking model.hasError: ' + model.hasError);
                assert.equal(model.loadCount, 0, 'Checking model.loadCount: ' + model.loadCount);
                assert.equal(model.errorCount, 1, 'Checking model.errorCount: ' + model.errorCount);
                assert.equal(model.submittedFetchUrl, '/unit-testing/plain-text', 'Checking model.submittedFetchUrl: ' + model.submittedFetchUrl);
                assert.equal(model.errorTextFetchError, expectedErrorText, 'Checking model.errorTextFetchError: ' + model.errorTextFetchError);

                // Check the Response Code of the Submitted Request
                var lastUrl = tester.submittedUrls[tester.submittedUrls.length - 1];
                assert.equal(lastUrl.status, 200, 'Checking lastUrl.status: ' + lastUrl.status);
            });
        });

        // Check the jsonData Page Object
        // This test is calling a route then redirecting back to the home page and then
        // calling the route again. Because the default value for [model.loadOnlyOnce]
        // is false the model object will be re-created each time.
        //
        // 1) Load '#/page-reload-json-data'
        // 2) Load '#/'
        // 3) Load '#/page-reload-json-data'
        //
        // NOTE - this route often fails in IE 11.
        // Typically this route and the below route will work 50% of the time and fail 50% of the time.
        // In all other browsers is should work 100% of the time.
        QUnit.test('Page jsonData with default [loadOnlyOnce=false]', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (window.Vue !== undefined) {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // 1) Define the First Test Page - '#/page-reload-json-data'
            var hash = '#/page-reload-json-data';
            var loadingMsg = '[page-reload-json-data]Page is Loading';
            var expectedHtml = '[page-reload-json-data]Response from Server';
            var expectedData = { serverMessage: 'Response from Server' };
            var startingModelCount = Object.keys(app.models).length;
            tester.pageTester2(hash, true, loadingMsg, expectedHtml, expectedData, false, assert, function () {
                // Get Ref to Model and make sure it is Dynamic
                var firstModel = app.activeModel;
                assert.equal(app.activeController.modelName, null, 'Checking (app.activeController.modelName === null)');
                assert.equal(Object.keys(app.models).length, startingModelCount, 'Checking that Model Count did not change from: ' + startingModelCount);

                // 2) Redirect back to default URL - '#/'
                tester.pageTester('#/', false, 'Initial view has loaded', assert, function () {

                    // 3) Reload the original URL - '#/page-reload-json-data'
                    tester.pageTester2(hash, false, loadingMsg, expectedHtml, expectedData, false, assert, done, function () {
                        // Check jsonData model properties
                        assert.equal(app.activeModel.loadOnlyOnce, false, 'app.activeModel.loadOnlyOnce: ' + app.activeModel.loadOnlyOnce);
                        assert.equal(app.activeModel.loadCount, 1, 'app.activeModel.loadCount: ' + app.activeModel.loadCount);
                        assert.ok((firstModel !== app.activeModel), 'Checking (firstModel !== app.activeModel)');
                    });
                });
            });
        });

        // Check the jsonData Page Object
        // Similar to the above test but view uses the property [data-load-only-once="true"]
        // which sets [model.loadOnlyOnce = true] so the web service request is made only once.
        //
        // 1) Load '#/page-json-data-load-only-once'
        // 2) Load '#/'
        // 3) Load '#/page-json-data-load-only-once'
        //
        // NOTE - this route often fails in IE 11.
        // Typically this route and the above route will work 50% of the time and fail 50% of the time.
        // In all other browsers is should work 100% of the time.
        QUnit.test('Page jsonData with [loadOnlyOnce=true]', function (assert) {
            // Asynchronous test
            var done = assert.async();

            // 1) Define the First Test Page - '#/page-json-data-load-only-once'
            var hash = '#/page-json-data-load-only-once';
            var loadingMsg = '[page-json-data-load-only-once]Page is Loading';
            var expectedHtml = '[page-json-data-load-only-once]Response from Server';
            var expectedData = { serverMessage: 'Response from Server' };
            tester.modelsCount++;
            tester.pageTester2(hash, true, loadingMsg, expectedHtml, expectedData, false, assert, function () {
                // 2) Redirect back to default URL - '#/'
                tester.pageTester('#/', false, 'Initial view has loaded', assert, function () {
                    // 3) Reload the original URL - '#/page-json-data-load-only-once'
                    //    The difference here and the above test is this verison is using
                    //    tester.pageTester() while the previous test is using tester.pageTester2()
                    //    and the two properties checked below will be different.
                    tester.pageTester(hash, false, expectedHtml, assert, done, function () {
                        // Check jsonData model properties
                        var model = app.activeModel;
                        assert.equal(model.loadOnlyOnce, true, 'Checking model.loadOnlyOnce');
                        assert.equal(model.loadCount, 1, 'Checking model.loadCount');
                    });
                });
            });
        });

        // Check the jsonData Page Object
        // This test is using named parameters '/page-json-data-record/:id' and
        // [model.loadOnlyOnce = true] so the data will change when it is different
        // but not reload if the previous URL matched the last time the page was viewed.
        //
        // 1) Load '#/page-json-data-record/1'
        // 2) Load '#/'
        // 3) Load '#/page-json-data-record/2'
        // 4) Load '#/'
        // 5) Load '#/page-json-data-record/2'
        QUnit.test('Page jsonData with for URL\'s with Named Parameters', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (window.Vue !== undefined) {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // 1) Define the First Test Page - '#/page-json-data-record/1'
            var url = '/unit-testing/page-json-data-record/:id';
            var hash = '#/page-json-data-record/1';
            var hash2 = '#/page-json-data-record/2';
            var loadingMsg = '[page-json-data-record]Page is Loading for 1';
            tester.modelsCount++;
            tester.pageTester2(hash, true, loadingMsg, '[page-json-data-record]Id: 1', { recordId: '1' }, false, assert, function () {
                // Check additional jsonData model properties
                var model = app.activeModel;
                assert.equal(model.loadCount, 1, 'Checking model.loadCount - ' + model.loadCount);
                assert.equal(model.url, url, 'Checking model.submittedFetchUrl - ' + model.url);
                assert.equal(model.submittedFetchUrl, '/unit-testing/page-json-data-record/1', 'Checking model.submittedFetchUrl - ' + model.submittedFetchUrl);
                assert.equal(app.buildUrl('/:id/:id'), '/1/1', 'Checking function app.buildUrl("/:id/:id"): "/1/1"');

                // 2) Redirect back to default URL - '#/'
                tester.pageTester('#/', false, 'Initial view has loaded', assert, function () {
                    // 3) Load the 2nd Test Page - '#/page-json-data-record/2'
                    //    In the [jsonData.onRouteLoad()] function logic will determine
                    //    that the web service needs to be called again because the parameter
                    //    is different than from when it was first viewed.
                    loadingMsg = '[page-json-data-record]Page is Loading for 2';
                    tester.pageTester2(hash2, false, loadingMsg, '[page-json-data-record]Id: 2', { recordId: '2' }, false, assert, function () {
                        // Check additional jsonData model properties
                        var model = app.activeModel;
                        assert.equal(model.loadCount, 2, 'Checking model.loadCount - ' + model.loadCount);
                        assert.equal(model.url, url, 'Checking model.submittedFetchUrl - ' + model.url);
                        assert.equal(model.submittedFetchUrl, '/unit-testing/page-json-data-record/2', 'Checking model.submittedFetchUrl - ' + model.submittedFetchUrl);
                        assert.equal(app.buildUrl('/:id/:id'), '/2/2', 'Checking function app.buildUrl("/:id/:id"): "/2/2"');

                        // 4) Redirect back to default URL - '#/'
                        tester.pageTester('#/', false, 'Initial view has loaded', assert, function () {
                            // 5) Reload the 2nd Test Page - '#/page-json-data-record/2'
                            //    The data should be the same because the URL is the last
                            //    one used for the model so the web service should not get called again.
                            tester.pageTester(hash2, false, '[page-json-data-record]Id: 2', assert, done, function () {
                                // Check the number of times the page was loaded
                                var model = app.activeModel;
                                assert.equal(model.loadCount, 2, 'Checking model.loadCount - ' + model.loadCount);
                            });
                        });
                    });
                });
            });
        });

        // Check the jsonData Page Object
        // This test is checking a specific error condition from [model.fetchData()]
        // where if the model's [url] is re-defined to an invalid value ('') after
        // having an initial valid value that error page will be rendered. This is
        // checking the [model.loadCount !== 0] from the if statement in [fetchData()].
        QUnit.test('Page jsonData - Error from model.fetchData() after an intial valid result', function (assert) {
            // Asynchronous test
            var done = assert.async();
            if (window.Vue !== undefined) {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            // Get the model of the previous controller and set the URL to ''
            var modelName = app.controller('/page-json-data-load-only-once').modelName;
            app.models[modelName].url = '';

            // Define the test, the view should be rendered twice
            // using the value [errorTextMissingUrl] each time
            var result = '[page-json-data-load-only-once]' + app.pages.jsonData.model.errorTextMissingUrl;
            tester.pageTester2('#/page-json-data-load-only-once', false, result, result, null, false, assert, done);
        });

        // Test JavaScript Controls View
        QUnit.test('Download JavaScript Controls with [app.loadScript()] then Render to a Template', function (assert) {
            var done = assert.async();
            if (window.Vue !== undefined) {
                assert.ok(true, 'Test Skipped for Vue');
                done();
                return;
            }

            function checkForError() {
                // This error will be triggered when all controls are un-loaded
                var errorText = document.querySelector('.dataformsjs-fatal-error').childNodes[1].textContent;
                var expected = 'Error with JavaScript Control [error-function-test] in function [onUnload()]: Error: Test';
                assert.equal(errorText, expected, 'Control Unload Error: ' + errorText);

                // Control Event Order
                var eventOrder = app.locals['Control-Event-Order'];
                expected = 'onLoad(test-control-event-order), html(1), onUnload(test-control-event-order)';
                assert.equal(eventOrder, expected, 'Control Event Order: ' + eventOrder);

                // Close Error and exit
                document.querySelector('.dataformsjs-fatal-error span').click();
                app.onUpdateViewComplete = null;
                done();
            }

            // Check before loading route
            assert.equal(Object.keys(app.controls).length, 0, 'Object.keys(app.controls).length: ' + Object.keys(app.controls).length);
            assert.equal(app.activeJsControls.length, 0, 'app.activeJsControls.length: ' + app.activeJsControls.length);
            assert.equal(document.getElementById('DataFormsJS-control-style-hello-world'), null, 'Style Element #DataFormsJS-control-style-hello-world should not exist');

            // Dynamically Load Controls Script
            app.loadScript(app.controls['custom-list'], 'js/unit-testing-controls.js').then(function() {
                var hash = '#/js-controls';
                app.onUpdateViewComplete = function () {
                    // Check Control Elements
                    var selector = '[data-control][data-control-loaded]';
                    var count = document.querySelectorAll(selector).length;
                    var expectedCount = 15;
                    assert.equal(count, expectedCount, 'Element Count for Selector ' + selector + ': ' + count);
                    assert.equal(app.activeJsControls.length, (expectedCount - 1), 'app.activeJsControls.length: ' + app.activeJsControls.length);

                    // Check for dynamically generated CSS
                    var css = document.querySelector('style#DataFormsJS-control-style-hello-world').innerHTML;
                    var expectedCss = '.hello-world { color:blue; }';
                    assert.equal(css, expectedCss, 'Dynamically created CSS for <hello-world>: ' + css);

                    // Hello World Controls
                    var n;
                    var tagName;
                    var textContent;
                    var listCount;
                    var elements = document.querySelectorAll('[data-control="hello-world"]');
                    var expectedMessage;
                    var expected = [
                        {
                            tagName: 'div',
                            textContent: 'Hello Conrad!',
                        },
                        {
                            tagName: 'div',
                            textContent: 'Hello World!',
                        },
                        {
                            tagName: 'div',
                            textContent: 'Hello World!',
                        },
                    ];
                    assert.equal(elements.length, expected.length, 'Control Count for <hello-world>: ' + elements.length);
                    for (n = 0; n < expected.length; n++) {
                        tagName = elements[n].tagName.toLowerCase();
                        textContent = elements[n].textContent;
                        assert.equal(tagName, expected[n].tagName, 'Element Type for <hello-world> Control #' + (n+1) + ': ' + tagName);
                        assert.equal(textContent, expected[n].textContent, 'Text Content for <hello-world> Control #' + (n+1) + ': ' + textContent);
                    }

                    // List Controls
                    elements = document.querySelectorAll('[data-control="custom-list"]');
                    expected = [
                        {
                            tagName: 'div',
                            listCount: 2,
                        },
                        {
                            tagName: 'section',
                            listCount: 3,
                        },
                    ];
                    assert.equal(elements.length, expected.length, 'Control Count for <custom-list>: ' + elements.length);
                    for (n = 0; n < expected.length; n++) {
                        tagName = elements[n].tagName.toLowerCase();
                        listCount = elements[n].querySelectorAll('[data-control="list-item"]').length;
                        assert.equal(tagName, expected[n].tagName, 'Element Type for <custom-list> Control #' + (n+1) + ': ' + tagName);
                        assert.equal(listCount, expected[n].listCount, 'Child <list-item> Nodes for <custom-list> Control #' + (n+1) + ': ' + listCount);
                    }

                    // List Item Controls
                    elements = document.querySelectorAll('[data-control="list-item"]');
                    assert.equal(elements.length, 5, 'Control Count for <list-item>: ' + elements.length);
                    for (n = 0; n < 5; n++) {
                        textContent = elements[n].textContent;
                        expected = 'Item ' + (n+1);
                        assert.equal(textContent, expected, 'Text Content for <list-item> Control #' + (n+1) + ': ' + textContent);
                    }

                    // Manually Trigger Errors
                    try
                    {
                        app.loadJsControl(document.getElementById('error-test'));
                        assert.ok(false, 'Test should have failed');
                    } catch (e) {
                        expectedMessage = 'Invalid call to [DataFormsJS.loadJsControl()]. This function only works on valid control elements.';
                        assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                        assert.equal(e.message, expectedMessage, 'Error for Element #error-test: ' + e.message);
                    }
                    try
                    {
                        app.loadJsControl('test');
                        assert.ok(false, 'Test should have failed');
                    } catch (e) {
                        expectedMessage = 'Invalid type for parameter [element] for the function [DataFormsJS.loadJsControl()], expected HTMLElement, received: string';
                        assert.ok(e instanceof TypeError, 'Execption should be a TypeError');
                        assert.equal(e.message, expectedMessage, 'Error for [app.loadJsControl("test")]: ' + e.message);
                    }

                    // Error and Event Order
                    elements = [
                        {
                            selector: '#test-control-event-order[data-control="event-order"]',
                            textContent: 'onLoad(test-control-event-order), html(1)',
                        },
                        {
                            selector: '[data-control="error-test"] .dataformsjs-error',
                            textContent: 'Error: JavaScript Control was not found by name, check that the file is loaded: error-test',
                        },
                        {
                            selector: '[data-control="error-function-test"][data-error-at="onLoad"]',
                            textContent: 'Error with JavaScript Control [error-function-test] in function [onLoad()]: Error: Test',
                        },
                        {
                            selector: '[data-control="error-function-test"][data-error-at="html"]',
                            textContent: 'Error with JavaScript Control [error-function-test] in function [html()]: Error: Test',
                        },
                        {
                            selector: '#error-test .dataformsjs-error',
                            textContent: 'Invalid call to [DataFormsJS.loadJsControl()]. This function only works on valid control elements.'
                        },
                    ];
                    elements.forEach(function(el) {
                        var element = document.querySelector(el.selector);
                        var name = element.getAttribute('data-control');
                        var textContent = element.textContent;
                        assert.equal(textContent, el.textContent, 'Text Content for <' + name + '>: ' + textContent);
                    });

                    // Check for final error and event order
                    app.onUpdateViewComplete = checkForError;
                    window.location.hash = '#/';
                };
                window.location.hash = hash;
                tester.compiledTemplates++;
            });
        });

        // Check for the expected number of properties and objects
        // in DataFormsJS after all tests on this page has completed
        QUnit.test('DataFormJS Unit Test Complete Property Count', function (assert) {
            // Call app.setup() again to make sure that it is safe to call twice
            // and that templates and other objects are not redefined.
            app.setup();

            // After Vue runs several global errors will likely appear
            if (window.Vue !== undefined) {
                // Most browers will create 3 error elements while some versions
                // of old Safari on iOS will result in 2 being created.
                var errors = document.querySelectorAll('.dataformsjs-fatal-error');
                var elementCountIsValid = (errors.length === 3 || errors.length === 2);
                assert.ok(elementCountIsValid, 'Vue Unhandled Global Errors for selector [.dataformsjs-fatal-error]');
                if (errors.length === 3) {
                    Array.prototype.forEach.call(errors, function(el) {
                        el.parentNode.removeChild(el);
                    });
                }
            }

            // At the end of this function the hash should be '#/' so that if that page is
            // refresh it will start with the correct route.
            assert.equal(window.location.hash, '#/', 'Default Hash Check');
            tester.checkCounts(assert);
        });
    });
})();
