/**
 * App Object for DataFormsJS Unit Tests and Demos with Node.js
 *
 * This script allows for a basic web server to define routes in a similar to
 * Express and other popular frameworks but only use Node.js built-in features
 * without any outside dependencies. This script is very minimal by design and
 * only for very basic request and response features needed for demos and
 * unit testing for developers.
 *
 * This script uses only one object for routing, reading of the request, and
 * sending the response. Node.js built-in Request and Response objects are used
 * and passed in callbacks by the script.
 *
 * In its current state this script should not be considered secure for
 * production use. This script uses no error handling so if an error occurs
 * then node crashes and has to be re-started.
 * 
 * @link     https://www.dataformsjs.com
 * @author   Conrad Sollitt (http://www.conradsollitt.com)
 * @license  MIT
 */

/* Validates with [jshint] */
/* jshint esversion:6 */
/* global require, module, Buffer */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const mimeTypes = {
    htm: 'text/html; charset=UTF-8',
    html: 'text/html; charset=UTF-8',
    css: 'text/css',
    js: 'application/javascript',
    jsx: 'application/jsx',
    json: 'application/json',
    graphql: 'application/graphql',
    png: 'image/png',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
};

const binaryFiles = ['png', 'jpg', 'ico'];

// Export an Object which contains defined routes, and starts the server.
// Functions that start with [send*] such as [sendJson()] are used for
// sending the response and functions that start with [read*] are for
// reading request input.
module.exports = {
    // Array of defined routes
    routes: [],

    // Add a GET Route
    get: function (path, callback) {
        this.routes.push({path: path, method: 'GET', callback: callback});
    },

    // Add a POST Route
    post: function (path, callback) {
        this.routes.push({path: path, method: 'POST', callback: callback});
    },

    // Used to check if a route matches
    routeMatches: (pattern, path) => {
        // Quick check for exact match
        if (pattern === path && pattern.indexOf(':') === -1) {
            return [ true, null ];
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
                        return [ false, null ];
                    }
                }
            }
            return [ true, args ]; // Matches with Variables
        }

        // Doesn't match
        return [ false, null ];
    },

    // Call this to start the server
    run: function (hostname, port, sitedir) {
        const server = http.createServer((req, res) => {
            // Match to request to a defined route
            const reqPath = url.parse(req.url).pathname;
            for (let n = 0, m = this.routes.length; n < m; n++) {
                // First check method
                if (this.routes[n].method !== req.method) {
                    continue;
                }
                // Match on path
                const pattern = this.routes[n].path;
                const [matches, args] = this.routeMatches(pattern, reqPath);
                if (matches) {
                    if (args) {
                        this.routes[n].callback.apply(null, [req, res].concat(args));
                    } else {
                        this.routes[n].callback(req, res);
                    }
                    return;
                }
            }
            // Does the request path match a file in the in or under the current directory?
            // If so the file will be sent, otherwise a 404 'Not Found' Response.
            const filePath = path.join(sitedir, reqPath);
            this.sendFile(res, filePath);
        });

        server.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    },

    // Send an HTML Response
    sendHtml: (res, html, headers = {}) => {
        headers['Content-Type'] = 'text/html; charset=UTF-8';
        res.writeHead(200, headers);
        res.end(html);
    },

    // Send a JSON Response
    sendJson: (res, data, headers = {}) => {
        headers['Content-Type'] = 'application/json';
        res.writeHead(200, headers);
        res.end(JSON.stringify(data));
    },

    // Send a Text Response
    sendText: (res, text, headers = {}) => {
        headers['Content-Type'] = 'text/plain';
        res.writeHead(200, headers);
        res.end(text);
    },

    // Open a file and then call a callback function.
    // If file doesn't exist return a 404.
    openFile: (res, filePath, callback) => {
        fs.readFile(filePath, (err, content) => {
            if (err && err.code === 'ENOENT') {
                res.statusCode = 404;
                res.end('<h1>Page not found</h1>');
            } else if (err) {
                res.statusCode = 500;
                res.end('<h1>Server Error</h1><p>' + err.toString() + '</p>');
            } else {
                const data = filePath.split('.');
                const fileType = data[data.length-1];
                if (binaryFiles.includes(fileType)) {
                    callback(content.toString('binary'));
                } else {
                    callback(content.toString());
                }
            }
        });
    },

    // Send a Response from a File
    sendFile: function(res, filePath, headers = {}) {
        this.openFile(res, filePath, (content) => {
            // Only send supported file types otherwise return a 404 error
            const data = filePath.split('.');
            const fileType = data[data.length-1];
            if (mimeTypes[fileType] === undefined) {
                res.statusCode = 404;
                res.end('<h1>Page not found</h1>');
            } else {
                const isBinary = binaryFiles.includes(fileType);
                headers['Content-Type'] = mimeTypes[fileType];
                res.writeHead(200, headers);
                res.end(content, (isBinary ? 'binary' : 'utf8'));
            }
        });
    },

    // Send an ETag Response. Note, this is a very basic check
    // and not a full featured 304 response function.
    sendETag: (req, res, text, headers = {}) => {
        // Use MD5 and a Weak ETag for the Response.
        const md5 = crypto.createHash('md5').update(text).digest('hex');
        const etag = 'W/"' + md5 + '"';
        headers.ETag = etag;

        // Compare to Request 'If-None-Match' header. If content is
        // an exact match then send a 304 'Not Modified' Response.
        const ifNoneMatch = (req.headers['if-none-match'] === undefined ? null : req.headers['if-none-match']);
        if (ifNoneMatch === etag) {
            res.writeHead(304, headers);
            res.end();
        } else {
            res.writeHead(200, headers);
            res.end(text);
        }
    },

    // Read Posted Content from the Request
    readContent: (req, callback) => {
        let content = [];
        req.on('data', (chunk) => {
            content.push(chunk);
        }).on('end', () => {
            content = Buffer.concat(content).toString();
            callback(content);
        });
    },

    // Read and Parse a Basic Form POST. This function expects a valid
    // Form Post and doesn't handle multipart forms with files.
    readForm: function (req, callback) {
        this.readContent(req, (content) => {
            let list = content.split('&');
            const form = {};
            list.forEach((item) => {
                const parts = item.split('=');
                const field = decodeURIComponent(parts[0]);
                const value = decodeURIComponent(parts[1]);
                form[field] = value;
            });
            callback(form);
        });
    },
};
