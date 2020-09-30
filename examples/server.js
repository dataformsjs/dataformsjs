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

/* Validates online with both [jshint] and [eslint] */
/* Select [ECMA Version] = 2018 for [eslint] */
/* jshint esversion:8, node:true */
/* eslint-env node, es6 */

'use strict';

const app = require('./../server/app.js');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

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
    res.html(html);
});

// Make sure the `favicon.ico` is sent before the '/:file' route is called
app.get('/favicon.ico', (req, res) => {
    const filePath = path.join(__dirname, 'favicon.ico');
    res.file(filePath);
});

app.get('/:file', (req, res, file) => {
    // Get file Path
    const fileName = (file + (file.includes('.') ? '' : '.htm'));
    const filePath = path.join(__dirname, fileName);

    // Example of using CSP (Content Security Policy) with DataFormsJS.
    // All examples shoud work with the following settings on modern browsers.
    // CSP is specified as a Response Header on the root HTML file.
    //
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
    //
    const srcScr = [
        // 'unsafe-eval' is needed for scripts because Vue, Handlebars, and other templating
        // engines dynamically create JavaScript functions based on the template code.
        "'unsafe-eval'",
        // If using the React [jsxLoader.js] JSX code is compiled and added as inline <script>
        // elements on the page so using 'unsafe-inline' is the easiest method to allow this.
        // When not including it sha256 hashes can be used as shown below. Hashes can be used
        // with the standard framework on most examples that use the simple `app.LazyLoad`
        // code snippet, however with React many browsers would have to be tested in order
        // to get all the hashes so 'unsafe-inline' is recommened for React.
        "'unsafe-inline'",
        // URL's
        'https://cdn.jsdelivr.net',
        'https://stackpath.bootstrapcdn.com',
        'https://code.jquery.com',
        'https://dataformsjs.s3-us-west-1.amazonaws.com',
        'https://d2xbd92kui7v97.cloudfront.net',
        'https://*.dataformsjs.com',
        'https://unpkg.com',
        'https://polyfill.io',
        // Hashes - These can be determined from Chrome/Edge DevTools
        // "'sha256-7xY3owh8hUdTNBs11onjKib0EBNTfow+rGLO39veZHU='",
        // "'sha256-+dVYzlB/eDQj/kya4BJI/ql82f/IjfR8xcB7+TogTDY='",
        // "'sha256-iXxEc1Pm8vLfjpVYOx2o1fcXhvjeDowwn9Fih34GVZ4='",
        // "'sha256-bLQBlv/aRvakcGB+LhnjxeuV+lu39E+irE7eLmldnoQ='",
        // "'sha256-O6TgiUsiQiSWa8MscEueffR7zWcXl+VUkkXlNVuTOCY='",
        // "'sha256-wh85FoQaAlZMEYm7+dB+o3A7fGWR/xAjFjCF9ZYaUkU='",
        // "'sha256-xR/1Z4tZPAL+xY/QYfJaC6j9B1IKTmKVJy18lLBF0nQ='",
        // "'sha256-9jHiyRplSgxUACLlnPdz1b4y/GKWcqHcfRPfCbJKzSg='",
        // "'sha256-RW/de6kIdWa5bf6iYKMWUI3yLEuuSRHgDeHVgF9gj7E='",
    ];
    // For styles a number of DataFormsJS plugins and controls will dynamically
    // add <style> elements to the page <head>. For example all pages that use
    // Vue and all Image Gallery Code. In order for this to work 'unsafe-inline'
    // is needed on [style-src].
    const styleSrc = [
        'https:',
        "'unsafe-inline'",
    ];
    const connectSrc = [
        'https://*.dataformsjs.com',
        'https://hacker-news.firebaseio.com',
        'https://dataformsjs.s3-us-west-1.amazonaws.com',
        'https://d2xbd92kui7v97.cloudfront.net',
        'http://localhost:3000',
    ];
    const imageSrc = [
        'https:',
        'data:',
        'blob:',
        'http://*.openstreetmap.org',
    ];
    const csp = [
        "default-src 'self'",
        `script-src 'self'  ${srcScr.join(' ')}`,
        `style-src 'self' ${styleSrc.join(' ')}`,
        `img-src 'self' ${imageSrc.join(' ')}`,
        `connect-src 'self' ${connectSrc.join(' ')}`,
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);

    // Send the file
    res.file(filePath);
});

// To keep hello world files simple (when viewing source from a browser)
// the js plugin [i18n] is not used, rather the content of the file is updated
// using find/replace with i18n key values before sending to the client.
//
// http://127.0.0.1:8080/examples/hello-world/en/hbs.htm
// http://127.0.0.1:8080/examples/hello-world/en/vue.htm
// http://127.0.0.1:8080/examples/hello-world/en/js.htm
// http://127.0.0.1:8080/examples/hello-world/en/web.htm
// http://127.0.0.1:8080/examples/hello-world/en/web-url-router.htm
// http://127.0.0.1:8080/examples/hello-world/en/react.htm
// http://127.0.0.1:8080/examples/hello-world/en/preact.htm
// http://127.0.0.1:8080/examples/hello-world/en/rax.htm
// http://127.0.0.1:8080/examples/hello-world/en/hyperapp.htm
// http://127.0.0.1:8080/examples/hello-world/en/vue3-with-jsx.htm
app.get('/examples/hello-world/:lang/:file', async (req, res, lang, file) => {
    // CSS or SVG file
    if (!file.endsWith('.htm')) {
        const filePath = path.join(__dirname, `hello-world/${file}`);
        res.file(filePath);
        return;
    }

    // HTML File
    // NOTE - to properly handle missing languages or files the `await readFile` calls
    // would need to be wrapped in a `try {...} catch {...}` and handled with `res.pageNotFound`
    //
    // 1) First read the i18n file: [dataformsjs\examples\i18n\hello-world.{lang}.json]
    const langPath = path.join(__dirname, `i18n/hello-world.${lang}.json`);
    const json = await readFile(langPath, 'utf8');
    const i18n = JSON.parse(json);
    i18n.lang = lang;

    // 2) Read html file: [dataformsjs\examples\hello-world\{file}]
    const htmlPath = path.join(__dirname, `hello-world/${file}`);
    const content = await readFile(htmlPath, 'utf8');

    // 3) Replace all i18n keys in the file
    let html = content;
    for (const key of Object.keys(i18n)) {
        html = html.replace(new RegExp('{{' + key + '}}', 'g'), i18n[key]);
    }

    // 4) Send HTML content
    res.html(html);
});

app.get('/js/:file', (req, res, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(file));
    res.file(filePath);
});

app.get('/js/:dir/:file', (req, res, dir, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(dir), decodeURIComponent(file));
    res.file(filePath);
});

app.get('/js/:dir1/:dir2/:file', (req, res, dir1, dir2, file) => {
    const filePath = path.join(__dirname, '..', 'js', decodeURIComponent(dir1), decodeURIComponent(dir2), decodeURIComponent(file));
    res.file(filePath);
});

app.get('/vendor/:file', (req, res, file) => {
    const filePath = path.join(__dirname, '..', 'vendor', decodeURIComponent(file));
    res.file(filePath);
});

app.run(port, __dirname);
