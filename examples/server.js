/**
 * Node.js Web Server for Examples
 *
 * Some of the examples will work by simply opening them as files in a browser,
 * however some of the examples require a web server, this file provides the
 * needed web server and can be used with any of the examples. Language Translation
 * files [{file}.{lang}.json] require a local web server as they are loaded from
 * [fetch]. By default when files are loaded directly then only English will be
 * displayed.
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
 *   5) Open in browser to view examples:
 *      http://127.0.0.1:8080/
 *   6) Additionally if you use a popular code editor or IDE you can
 *      likely start this script directly from your editor.
 */

/* Validates with [jshint] */
/* jshint esversion: 8 */
/* global require, __dirname */

const app = require('./../server/app.js');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);

const hostname = '127.0.0.1';
const port = 8080;

async function getFiles() {
    return await readdir(__dirname)
    .then(files => {
        return files.filter(f => f.endsWith('.htm') && !f.startsWith('_'));
    })
    .then(files => {
        return files.map(f => f.replace('.htm', ''));
    })
    .catch(err => {
        throw err;
    });
}

app.get('/', async (req, res) => {
    let html = '<h1>DataFormsJS Examples</h1><ul>';
    const files = await getFiles();
    files.forEach(file => {
        html += `<li><a href="${file}">${file}</a></li>`;
    });
    html += '</ul>';
    res.end(html);
});

app.get('/favicon.ico', (req, res) => {
    const filePath = path.join(__dirname, '../server/favicon.ico');
    app.sendFile(res, filePath);
});

app.get('/:file', (req, res, file) => {
    const fileName = (file + (file.includes('.') ? '' : '.htm'));
    const filePath = path.join(__dirname, fileName);
    app.sendFile(res, filePath);
});

app.get('/js/:file', (req, res, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(file));
    app.sendFile(res, filePath);
});

app.get('/html/:file', (req, res, file) => {
    const filePath = path.join(__dirname, 'html', decodeURIComponent(file));
    app.sendFile(res, filePath);
});

app.get('/js/:dir/:file', (req, res, dir, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(dir), decodeURIComponent(file));
    app.sendFile(res, filePath);
});

app.get('/js/:dir1/:dir2/:file', (req, res, dir1, dir2, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(dir1), decodeURIComponent(dir2), decodeURIComponent(file));
    app.sendFile(res, filePath);
});

app.get('/vendor/:file', (req, res, file) => {
    const filePath = path.join(__dirname, '..', 'vendor', decodeURIComponent(file));
    app.sendFile(res, filePath);
});

app.get('/graphql/:file', (req, res, file) => {
    const filePath = path.join(__dirname, 'graphql', decodeURIComponent(file));
    app.sendFile(res, filePath);
});

app.run(hostname, port, __dirname);
