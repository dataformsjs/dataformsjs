/**
 * Body Parser Middleware for the Custom Web Server
 */

/* Validates online with both [jshint] and [eslint] */
/* Select [ECMA Version] = 2018 for [eslint] */
/* jshint esversion:8, node:true */
/* eslint-env node, es6 */

'use strict';

const querystring = require('querystring');

module.exports = function bodyParser(options) {
    // Default Options
    options = options || {};
    options.maxPostSize = options.maxPostSize || (1024 * 1024); // 1 MB

    // Return function for middleware
    return function (req) {
        // Read and return a Promise with posted content as a string from the Request.
        req.content = (encoding = 'utf8') => {
            return new Promise(function(resolve, reject) {
                let content = [];
                let length = 0;
                req.on('data', (chunk) => {
                    content.push(chunk);
                    // Safety check in case this script is used on a production server.
                    // Typically  this would be handled by the web-server (nginx, etc)
                    // with a 413 Response before this code is executed.
                    length += chunk.length;
                    if (length >= options.maxPostSize) {
                        reject('Payload Too Large');
                    }
                }).on('end', () => {
                    content = Buffer.concat(content).toString(encoding);
                    resolve(content);
                }).on('error', (err) => {
                    reject(err);
                });
            });
        };

        // Read and parse a basic Form POST (doesn't handle files)
        req.form = () => {
            return req.content().then(content => {
                return (content === '' ? {} : querystring.parse(content));
            });
        };

        // Read and Parse a JSON POST
        req.json = () => {
            return req.content().then(content => {
                return JSON.parse(content);
            });
        };
    };
};