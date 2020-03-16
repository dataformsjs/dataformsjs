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

(function () {
    'use strict';

    // Model objects
    var unitTestHbsHelpers = {
        name: 'World',
        dateTime: new Date(2015, 0, 31, 13, 23, 45) // Jan 31st 2015, 1:23:45 PM
    };
    var unitTestControls = {
        title: 'control-test',
        values: [ '123', '456', '789' ],
        escapeString: '& < > " \' /'
    };
    var unitTestScriptSrc = {
        title: 'script-src',
        values: [ 'script', 'src' ],
    };
    var unitTestScriptDataSrc = {
        title: 'script-data-src',
        values: [],
    };

    // Add Models to DataFormsJS
    app
        .addModel('unitTestHbsHelpers', unitTestHbsHelpers)
        .addModel('unitTestControls', unitTestControls)
        .addModel('unitTestScriptSrc', unitTestScriptSrc)
        .addModel('unitTestScriptDataSrc', unitTestScriptDataSrc);

})();
