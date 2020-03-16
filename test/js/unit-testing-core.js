/**
 * DataFormJS Unit Testing
 *
 * This file contains core helper functions and features.
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

    var tester = {
        controllersCount: 0,
        modelsCount: 0,
        pagesCount: 0,
        pluginsCount: 0,
        compiledTemplates: 0,
        submittedRequestCount: 0,
        submittedUrls: [],

        setup: function() {
            app.settings.logFetchRequests = true;
            app.events.on('fetch', function(result) {
                tester.submittedUrls.push(result);
            });
        },

        /**
         * Check Counts of Key Dictionaries, Arrays, etc. This is called regularly
         * and helps determine what test causes something to break if changes are made.
         *
         * @param {object} assert QUnit assert object
         */
        checkCounts: function(assert) {
            assert.equal(app.controllers.length, this.controllersCount, 'Number of app.controllers: ' + app.controllers.length);
            assert.equal(Object.keys(app.pages).length, this.pagesCount, 'Number of app.pages: ' + Object.keys(app.pages).length);
            assert.equal(Object.keys(app.plugins).length, this.pluginsCount, 'Number of app.plugins: ' + Object.keys(app.plugins).length);
            assert.equal(Object.keys(app.models).length, this.modelsCount, 'Number of app.models: ' + Object.keys(app.models).length);
            assert.equal(Object.keys(app.compiledTemplates).length, this.compiledTemplates, 'Number of app.compiledTemplates: ' + Object.keys(app.compiledTemplates).length);
            assert.equal(tester.submittedUrls.length, this.submittedRequestCount, 'Number of Submitted Requests: ' + tester.submittedUrls.length);
        },

        /**
         * Check if the text content of an element matches the expected value.
         * Spaces are trimed using [textContent.trim()].
         * The element must exist when this function is called.
         *
         * @param {string} id
         * @param {string} expected
         * @param {object} assert QUnit assert object
         */
        checkElement: function(id, expected, assert) {
            // Get the html for the element and trim any whitespace
            var html = document.getElementById(id).textContent.trim();

            // Label for Unit Testing is truncated to a maximum of 100 characters
            var expectedLabel = expected;
            if (expectedLabel.length > 100) {
                expectedLabel = expectedLabel.substring(0, 100) + '...';
            }

            // Compare expected result
            assert.equal(html, expected, 'HTML Check for #' + id + ' - ' + expectedLabel);
        },

        /**
         * Check if the text content of an element matches the expected value.
         * Spaces and Line Breaks are removed from the text content when checking.
         * The element must exist when this function is called.
         *
         * @param {string} id
         * @param {string} expected
         * @param {object} assert
         */
        checkElementRemoveSpLb: function(id, expected, assert) {
            // Get the html for the element and remove all spaces and line breaks
            var html = document.getElementById(id).textContent.trim();
            html = html.replace(/\n|\t| /g, '');

            // Label for Unit Testing is truncated to a maximum of 100 characters
            var expectedLabel = expected;
            if (expectedLabel.length > 100) {
                expectedLabel = expectedLabel.substring(0, 100) + '...';
            }

            // Compare expected result
            assert.equal(html, expected, 'HTML Check excluding Spaces and Line Breaks for #' + id + ' - ' + expectedLabel);
        },

        /**
         * Asynchronous function that changes the hash URL and checks the results once the
         * view is rendered. This function is used when the resulting view has one final state.
         * The function pageTester2() below is used when the page has 2 states (example loading
         * and then an error state or rendered state).
         *
         * @param {string} hash
         * @param {bool} shouldCompileTemplate
         * @param {string} expectedHtml Value of [#view.textContent.trim()]
         * @param {object} assert
         * @param {function} done
         * @param {function|undefined} callback
         */
        pageTester: function(hash, shouldCompileTemplate, expectedHtml, assert, done, callback) {
            // Define a Global App Function to check the page after it is rendered
            app.onUpdateViewComplete = function () {
                // Check the URL Hash and View Contents
                assert.equal(window.location.hash, hash, 'URL Hash Check - ' + hash);
                if (window.Vue === undefined) {
                    tester.checkElement('view', expectedHtml, assert);
                }

                // If a callback function is defined then call it
                if (callback !== undefined) {
                    callback();
                }

                // Reset Global App Functions and redirect back to default URL
                app.onUpdateViewComplete = null;
                window.location.hash = '#/';

                // Mark the test as complete or call the next function
                tester.checkCounts(assert);
                done();
            };

            // Change the view
            window.location.hash = hash;

            // If the test is expected to compile the template then
            // increment the counter which gets checked after all tests run.
            if (shouldCompileTemplate) {
                this.compiledTemplates++;
            }
        },

        /**
         * Asynchronous function that changes the hash URL and checks the results once the
         * view is rendered. This function is used when the resulting view has one final state.
         * The function pageTester2() below is used when the page has 2 states (example loading
         * and then an error state or rendered state).
         *
         * @param {string} hash
         * @param {bool} shouldCompileTemplate
         * @param {string} expectedHtml Value of [#view.textContent.trim()]
         * @param {object} assert
         * @param {function} done
         * @param {function|undefined} callback
         */
        pageTesterRemoveSpLb: function(hash, shouldCompileTemplate, expectedHtml, assert, done, callback) {
            // Define a Global App Function to check the page after it is rendered
            app.onUpdateViewComplete = function () {
                // Check the URL Hash and View Contents
                assert.equal(window.location.hash, hash, 'URL Hash Check - ' + hash);
                tester.checkElementRemoveSpLb('view', expectedHtml, assert);

                // If a callback function is defined then call it
                if (callback !== undefined) {
                    callback();
                }

                // Reset Global App Functions and redirect back to default URL
                app.onUpdateViewComplete = null;
                window.location.hash = '#/';

                // Mark the test as complete or call the next function
                tester.checkCounts(assert);
                done();
            };

            // Change the view
            window.location.hash = hash;

            // If the test is expected to compile the template then
            // increment the counter which gets checked after all tests run.
            if (shouldCompileTemplate) {
                this.compiledTemplates++;
            }
        },

        /**
         * Asynchronous function that changes the hash URL and expects the updateView() function to
         * be called twice. This function is used for testing the [jsonData] Page Object and other
         * pages that have 2 states (for example isLoading and hasError or isLoaded) and when the
         * second state is caused by an HTTP Request.
         *
         * @param {string} hash
         * @param {bool} shouldCompileTemplate  [true] if the template is being compiled for the first time
         * @param {string} expectHtml1          Value of [#view.textContent.trim()] for the 1st View Render
         * @param {string} expectHtml2          Value of [#view.textContent.trim()] for the 2nd View Render
         * @param {*|null} expectFetchData      Expected value that is returned from [model.onFetch]
         * @param {bool} expectOnError
         * @param {*object} assert
         * @param {function} done
         * @param {function|undefined} callback
         */
        pageTester2: function(hash, shouldCompileTemplate, expectHtml1, expectHtml2, expectFetchData, expectOnError, assert, done, callback) {
            // Define a Global App Function to check the page after it is rendered
            app.onUpdateViewComplete = function () {
                var onFetchWasCalled = false,
                    onErrorWasCalled = false;

                // Check the URL Hash and View Contents
                assert.equal(window.location.hash, hash, 'URL Hash Check - ' + hash);
                if (window.Vue === undefined) {
                    // Skip check on Vue because Virtual DOM will not always be in sync
                    tester.checkElement('view', expectHtml1, assert);
                }

                // Check the active jsonData model properties while the view is loading
                var model = app.activeModel;
                if (shouldCompileTemplate) {
                    assert.equal(model.isLoading, true, 'Checking model.isLoading on initial view: ' + model.isLoading);
                    assert.equal(model.isLoaded, false, 'Checking model.isLoaded on initial view: ' + model.isLoaded);
                    assert.equal(model.hasError, false, 'Checking model.hasError on initial view: ' + model.hasError);
                }

                // If parameters [expectFetchData] and [expectOnError] are not null then create a
                // callback function for the specified events from the jsonData Page Object to verify data.
                // In the [jsonData] Object [onFetch()] and [onError()] get called prior to the view
                // view being updated so these test also confirms event order logic.
                if (expectFetchData !== null) {
                    model.onFetch = function (data) {
                        assert.deepEqual(data, expectFetchData, 'Checking data from model.onFetch() for: ' + JSON.stringify(expectFetchData));
                        onFetchWasCalled = true;
                    };
                }
                if (expectOnError !== null) {
                    model.onError = function () {
                        onErrorWasCalled = true;
                    };
                }

                // After checking the 'Page is Loading' message define a new
                // [onUpdateViewComplete] function to check the final response.
                app.onUpdateViewComplete = function () {
                    // Now check the 2nd state (usually after a web service response)
                    assert.equal(window.location.hash, hash, 'Hash Check - ' + hash);
                    if (expectHtml2 !== null) {
                        if (window.Vue === undefined) {
                            // Skip check on Vue because Virtual DOM will not always be in sync
                            tester.checkElement('view', expectHtml2, assert);
                        }
                    }

                    // If defined for the test then check events from functions [onFetch()] and [onError()]
                    if (expectFetchData !== null) {
                        assert.ok(onFetchWasCalled, 'Checking that model.onFetch() was called before the view was updated');
                    }
                    if (expectOnError !== null) {
                        assert.equal(expectOnError, onErrorWasCalled, 'Checking that model.onError() matched the expected call - ' + expectOnError);
                    }

                    // These tests are designed around the page calling a web service so
                    // increase the number of submitted requests and check the current count.
                    // If the expected HTML of both pages is the same then this is a special
                    // error test so the expected request count will not increase.
                    if (expectHtml1 !== expectHtml2) {
                        tester.submittedRequestCount++;
                        assert.equal(tester.submittedUrls.length, tester.submittedRequestCount, 'Number of Submitted Requests: ' + tester.submittedUrls.length);
                    }

                    // If a callback function is defined then call it
                    if (callback !== undefined) {
                        callback();
                    }

                    // Reset Global App Functions and redirect back to default URL
                    app.onUpdateViewComplete = null;
                    window.location.hash = '#/';

                    // Mark the test as complete or call the next function
                    tester.checkCounts(assert);
                    done();
                };
            };

            // Change the view
            window.location.hash = hash;

            // If the test is expected to compile the template then
            // increment the counter which gets checked after all tests run.
            if (shouldCompileTemplate) {
                this.compiledTemplates++;
            }
        },
    };

    /**
     * Assign [tester] object to global scope
     */
    window.tester = tester;
})();