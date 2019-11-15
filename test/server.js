/**
 * Node.js Web Server for Unit Testing
 * 
 * This has no dependencies outside of built-in Node.js objects and the 
 * [app.js] file; see additional comments in [app.js].
 *
 * To run:
 *   1) Install node.js
 *      https://nodejs.org/en/
 *   2) Open a Command Line (Terminal, Cmd, etc)
 *   3) Change directory to where this file is located:
 *      cd {dir}
 *   4) Run with node:
 *      node server.js
 *   5) Open in browser and then run tests by opening each page:
 *      http://127.0.0.1:5000/
 *   6) Additionally if you use a popular code editor or IDE you can
 *      likely start this script directly from your editor.
 */

/* Validates with [jshint] */
/* jshint esversion:6 */
/* global require, __dirname */

const app = require('./../server/app.js');
const path = require('path');

const hostname = '127.0.0.1';
const port = 5000;

const views = [
    'unit-testing-handlebars',
    'unit-testing-nunjucks',
    'unit-testing-underscore',
    'unit-testing-mixed-templates'
];

app.get('/', (req, res) => {
    let html = '<h1>DataFormsJS Unit Testing</h1><ul>';
    views.forEach((view) => {
        html += '<li><a href="' + view + '">' + view + '</a></li>';
    });
    html += '</ul>';
    res.end(html);
});

views.forEach((view) => {
    app.get('/' + view, (req, res) => {
        const filePath = path.join(__dirname, 'views/' + view + '.htm');
        app.sendFile(res, filePath);
    });
});

app.get('/src/:file', (req, res, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(file));
    app.sendFile(res, filePath);
});

app.get('/src/:dir/:file', (req, res, dir, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(dir), decodeURIComponent(file));
    app.sendFile(res, filePath);
});

app.get('/vendor/:file', (req, res, file) => {
    const filePath = path.join(__dirname, '..', 'vendor', decodeURIComponent(file));
    app.sendFile(res, filePath);
});

app.get('/unit-testing/page-json-data', (req, res) => {
    const data = { serverMessage: 'Response from Server' };
    const headers = { 'X-Unit-Test': 'DataFormsJS JSON' };
    app.sendJson(res, data, headers);
});

app.get('/unit-testing/plain-text', (req, res) => {
    const text = 'Text Response from Server';
    const headers = { 'X-Unit-Test': 'DataFormsJS Text' };
    app.sendText(res, text, headers);
});

app.get('/unit-testing/etag-response', (req, res) => {
    const text = 'etag-response';
    app.sendETag(req, res, text);
});

app.get('/unit-testing/page-json-data-error', (req, res) => {
    app.sendJson(res, {
        isLoaded: false,
        hasError: true,
        errorMessage: 'Error Message set from Server',
    });
});

app.get('/unit-testing/page-json-data-record/:id', (req, res, id) => {
    const data = { recordId: id };
    app.sendJson(res, data);
});

app.get('/unit-testing/page-entry-form-record/:id', (req, res, id) => {
    app.sendJson(res, {
        recordId: id,
        name: 'Conrad',
        intValue: 123,
    });
});

app.post('/unit-testing/post-form-data-1', (req, res) => {
    app.sendForm(req, (form) => {
        let result;
        if (Object.keys(form).length === 0) {
            result = 'Form Post Not Submitted';
        } else if (form.site !== 'DataFormsJS') {
            result = 'Unexpected post value for [site]';
        } else if (form.value !== 'Post Form Data 1') {
            result = 'Unexpected post value for [value]';
        } else {
            result = 'POST Form Field were in the expected format';
        }
        app.sendText(res, result);
    });
});

app.post('/unit-testing/post-form-data-1', (req, res) => {
    app.readForm(req, (form) => {
        let result;
        if (Object.keys(form).length === 0) {
            result = 'Form Post Not Submitted';
        } else if (form.site !== 'DataFormsJS') {
            result = 'Unexpected post value for [site]';
        } else if (form.value !== 'Post Form Data 1') {
            result = 'Unexpected post value for [value]';
        } else {
            result = 'POST Form Field were in the expected format';
        }
        app.sendText(res, result);
    });
});

app.post('/unit-testing/post-json-data-1', (req, res) => {
    app.readContent(req, (content) => {
        let result;
        if (req.headers['content-type'] !== 'application/json') {
            result = 'Form Post Not Submitted';
        } else {
            const data = JSON.parse(content);
            if (data.site !== 'DataFormsJS') {
                result = 'Unexpected post value for [site]';
            } else if (data.value !== 'JSON Property') {
                result = 'Unexpected post value for [value]';
            } else if (data.intValue !== 12345) {
                result = 'Unexpected post value for [intValue]';
            } else {
                result = 'JSON Data was in the expected format';
            }
        }
        app.sendText(res, result);
    });
});

app.get('/unit-testing/simple-json-array', (req, res, id) => {
    app.sendJson(res, {
        array: ['Item 1', 'Item 3', 'Item 3']
    });
});

app.get('/unit-testing/simple-model', (req, res, id) => {
    app.sendJson(res, {
        title: 'Test',
        value: ['Item 1', 'Item 3', 'Item 3']
    });
});

app.run(hostname, port, __dirname);
