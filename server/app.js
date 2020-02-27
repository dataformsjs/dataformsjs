/**
 * Web Server Object for DataFormsJS Unit Tests and Demos with Node.js
 *
 * This script allows for a basic web server to define routes in a similar to
 * Express and other popular frameworks but only use Node.js built-in features
 * without any outside dependencies.
 *
 * Important - This script is very minimal by design and only allows for
 * very basic request and response features needed for local development,
 * it works well but has few features so is not intended for production apps.
 *
 * Since this file is small you can step through the code using a debugger
 * which makes it is usefull for learning purposes.
 *
 * Example Usage:
 *     examples/server.js    https://github.com/dataformsjs/dataformsjs/blob/master/examples/server.js
 *     test/server.js        https://github.com/dataformsjs/dataformsjs/blob/master/test/server.js
 *
 * @link     https://www.dataformsjs.com
 * @author   Conrad Sollitt (http://www.conradsollitt.com)
 * @license  MIT
 */

/* Validates online with both [jshint] and [eslint] */
/* Select [ECMA Version] = 2018 for [eslint] */
/* jshint esversion:8, node:true */
/* eslint-env node, es6 */

'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const app = {
    // Arrays for middleware and routes
    middleware: [ setupResponse ],
    routes: [],

    // Config Options
    mimeTypes: {
        htm: 'text/html; charset=UTF-8',
        html: 'text/html; charset=UTF-8',
        css: 'text/css',
        txt: 'text/plain',
        js: 'application/javascript',
        jsx: 'application/jsx',
        json: 'application/json',
        graphql: 'application/graphql',
        png: 'image/png',
        jpg: 'image/jpeg',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
    },

    // Add Middleware
    use: function (callback) {
        this.middleware.push(callback);
    },

    // Add a GET Route
    get: function (path, callback) {
        this.routes.push({ path: path, method: 'GET', callback: callback });
    },

    // Add a POST Route
    post: function (path, callback) {
        this.routes.push({ path: path, method: 'POST', callback: callback });
    },

    // Allow the route to handle ANY method
    route: function (path, callback) {
        this.routes.push({ path: path, method: null, callback: callback });
    },

    // Used to check if a route matches, returns an array of [bool:matches, array:args]
    routeMatches: (pattern, path) => {
        // Quick check for exact match
        if (pattern === path && pattern.indexOf(':') === -1) {
            return [ true, [] ];
        }

        // Check for ':variables' and add to an array
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length === pathParts.length) {
            const args = [];
            for (let n = 0, m = pathParts.length; n < m; n++) {
                if (patternParts[n] !== pathParts[n]) {
                    if (patternParts[n].length > 0 && patternParts[n].indexOf(':') === 0) {
                        args.push(decodeURIComponent(pathParts[n]));
                    } else {
                        return [ false, [] ];
                    }
                }
            }
            return [ true, args ]; // Matches with Variables
        }

        // Doesn't match
        return [ false, null ];
    },

    // Call this to start the server
    run: function(port, siteRootDir) {
        const server = http.createServer(async (req, res) => {
            try {
                // Call middleware functions
                for (let n = 0, m = this.middleware.length; n < m; n++) {
                    const fn = this.middleware[n];
                    if (fn.constructor.name === 'AsyncFunction') {
                        await fn(req, res);
                    } else {
                        fn(req, res);
                    }
                    // If headers are sent assume that middleware handled the response
                    if (res.headersSent) {
                        return;
                    }
                }

                // Match the requested path to a defined route
                const reqMethod = req.method;
                const reqPath = url.parse(req.url).pathname;
                for (let n = 0, m = this.routes.length; n < m; n++) {
                    // First check method [GET|POST|HEAD]
                    const method = this.routes[n].method;
                    if (!(method === reqMethod || (method === 'GET' && reqMethod === 'HEAD') || method === null)) {
                        continue;
                    }
                    // Match on path
                    const pattern = this.routes[n].path;
                    const [matches, args] = this.routeMatches(pattern, reqPath);
                    if (matches) {
                        const fn = this.routes[n].callback;
                        if (fn.constructor.name === 'AsyncFunction') {
                            await fn.apply(null, [req, res].concat(args));
                        } else {
                            fn.apply(null, [req, res].concat(args));
                        }
                        return;
                    }
                }

                // Does the request path match a file under the site's root directory? If so and
                // `siteRootDir` is defined then the file will be sent, otherwise send a 404.
                // A security check against Path Traversal Attacks in first performed in case
                // this script is used on production servers.
                if (siteRootDir === undefined || (reqPath.includes('../') || reqPath.includes('..\\'))) {
                    res.pageNotFound();
                    return;
                }
                const filePath = path.join(siteRootDir, reqPath);
                res.file(filePath);
            } catch (err) {
                res.error(err);
            }
        });

        server.listen(port, null, () => {
            console.log(`Server running at http://127.0.0.1:${port}/`);
        });
    },

    // Helper function
    escapeHtml: (text) => {
        if (text === undefined || text === null || typeof text === 'number') {
            return text;
        }
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },
};

function setupResponse(req, res) {
    // Allow middleware to add callback functions that get called on `res.send`
    res.onSend = [];

    // Send an HTML Response
    res.html = (html) => {
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.send(html);
    };

    // Send a JSON Response
    res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data));
    };

    // Send a Text Response
    res.text = (text) => {
        res.setHeader('Content-Type', 'text/plain');
        res.send(text);
    };

    // Send a 404 Page as an HTML Response
    res.pageNotFound = () => {
        res.statusCode = 404;
        res.html('<h1>Page not found</h1>');
    };

    // Log error to console and send error in a 500 page as an HTML Response
    res.error = (err) => {
        console.error(err);
        res.statusCode = 500;
        const html = `<h1>An error has occurred</h1><p><pre>${app.escapeHtml(err.stack ? err.stack.toString() : err.toString())}</pre></p>`;
        res.html(html);
    };

    // Send a Response from a File. If the file doesn't exist or the file type is
    // not defined in mimeTypes then a 404 HTML Response will be sent to the client.
    res.file = (filePath) => {
        const data = filePath.split('.');
        const fileType = data[data.length-1];
        if (app.mimeTypes[fileType] === undefined) {
            res.pageNotFound(); // File type not supported
            return;
        }
        fs.readFile(filePath, (err, content) => {
            if (err && err.code === 'ENOENT') {
                res.pageNotFound(); // File not found
            } else if (err) {
                res.error(err);
            } else {
                res.setHeader('Content-Type', app.mimeTypes[fileType]);
                res.send(content);
            }
        });
    };

    // Used internally once headers and status code are defined
    res.send = (content) => {
        // Middleware callback functions
        for (let n = 0, m = res.onSend.length; n < m; n++) {
            res.onSend[n](content);
        }

        // Send content
        if (req.method === 'HEAD' || res.statusCode === 204 || res.statusCode === 304) {
            res.end();
        } else {
            res.end(content);
        }
    };
}

// Export the app object
module.exports = app;