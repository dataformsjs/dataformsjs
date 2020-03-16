/**
 * Node.js Web Server for Unit Testing
 *
 * This has no dependencies outside of built-in Node.js objects and the
 * local web server files, see additional comments in [app.js].
 *
 * Note - several tests defined in this file are currently not used
 * and were part of earlier unit tests that were removed before publishing.
 * The tests will likely be added back in the future. Routes currently not
 * tested include `etag-response`, `page-entry-form-record`, and all routes
 * `below post-form-data-1`.
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

/* Validates online with both [jshint] and [eslint] */
/* Select [ECMA Version] = 2018 for [eslint] */
/* jshint esversion:8, node:true */
/* eslint-env node, es6 */

'use strict';

const path = require('path');

const app = require('./../server/app.js');
const bodyParser = require('./../server/middleware/body-parser.js');
const etag = require('./../server/middleware/etag.js');
// const cors = require('./../server/middleware/cors.js');

const port = 5000;

const views = [
    'unit-testing-handlebars',
    'unit-testing-nunjucks',
    'unit-testing-underscore',
    'unit-testing-mixed-templates',
    'unit-testing-vue',
    'unit-testing-react',
    'unit-testing-preact',
];

app.use(bodyParser());
app.use(etag());

// Example CORS usage:
//
// app.use(cors()); // This would send { 'Access-Control-Allow-Origin': '*' }
//
// app.use(cors({
//     'Access-Control-Allow-Origin': '{request.origin}',
//     'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-None-Match',
//     'Access-Control-Allow-Credentials': 'true',
// }));

app.get('/', (req, res) => {
    let html = '<h1>DataFormsJS Unit Testing</h1><ul>';
    views.forEach((view) => {
        html += '<li><a href="' + view + '">' + view + '</a></li>';
    });
    html += '</ul>';
    res.html(html);
});

views.forEach((view) => {
    app.get('/' + view, (req, res) => {
        const filePath = path.join(__dirname, 'views/' + view + '.htm');
        res.file(filePath);
    });
});

app.get('/src/:file', (req, res, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(file));
    res.file(filePath);
});

app.get('/src/:dir/:file', (req, res, dir, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(dir), decodeURIComponent(file));
    res.file(filePath);
});

app.get('/src/:dir1:/:dir2/:file', (req, res, dir1, dir2, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(dir1), decodeURIComponent(dir2), decodeURIComponent(file));
    res.file(filePath);
});

app.get('/unit-testing/page-json-data', (req, res) => {
    const data = { serverMessage: 'Response from Server' };
    res.setHeader('X-Unit-Test', 'DataFormsJS JSON');
    res.json(data);
});

app.get('/unit-testing/plain-text', (req, res) => {
    const text = 'Text Response from Server';
    res.setHeader('X-Unit-Test', 'DataFormsJS Text');
    res.text(text);
});

app.get('/unit-testing/etag-response', (req, res) => {
    res.etag().text('etag-response');
});

app.get('/unit-testing/page-json-data-error', (req, res) => {
    res.json({
        isLoaded: false,
        hasError: true,
        errorMessage: 'Error Message set from Server',
    });
});

app.get('/unit-testing/page-json-data-record/:id', (req, res, id) => {
    const data = { recordId: id };
    res.json(data);
});

app.get('/unit-testing/page-entry-form-record/:id', (req, res, id) => {
    res.json({
        recordId: id,
        name: 'Conrad',
        intValue: 123,
    });
});

app.post('/unit-testing/post-form-data-1', async (req, res) => {
    const form = await req.form();
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
    res.text(result);
});

app.post('/unit-testing/post-json-data-1', async (req, res) => {
    let result;
    if (req.headers['content-type'] !== 'application/json') {
        result = 'JSON Post Not Submitted';
    } else {
        const data = await req.json();
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
    res.text(result);
});

app.get('/unit-testing/simple-json-array', (req, res) => {
    res.json({
        array: ['Item 1', 'Item 3', 'Item 3']
    });
});

app.get('/unit-testing/simple-model', (req, res) => {
    res.json({
        title: 'Test',
        value: ['Item 1', 'Item 3', 'Item 3']
    });
});

app.run(port, __dirname);
