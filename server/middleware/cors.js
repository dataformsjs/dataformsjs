/**
 * CORS Middleware for the Custom Web Server.
 * 
 * Example Usage:
 *     app.use(cors());
 *     app.use(cors({
 *         'Access-Control-Allow-Origin': '{request.origin}',
 *         'Access-Control-Allow-Headers': 'Authorization, Content-Type',
 *         'Access-Control-Allow-Credentials': 'true',
 *     }));
 * 
 * NOTE - '{request.origin}' is used by this function with the 
 * value from the request or '*' if not Origin was sent with the request.
 */

/* Validates online with both [jshint] and [eslint] */
/* Select [ECMA Version] = 2018 for [eslint] */
/* jshint esversion:8, node:true */
/* eslint-env node, es6 */

'use strict';

module.exports = function (headers = {'Access-Control-Allow-Methods': '*'}) {    
    return function (req, res) {
        // Add CORS Headers
        // There are 6 different CORS headers, all starting with `Access-Control-`
        // This function does not validate if they are correct so it's up to the app.
        for (const prop in headers) {
            if (prop === 'Access-Control-Allow-Origin' && headers[prop] === '{request.origin}') {
                res.setHeader(prop, (req.headers.origin === undefined ? '*' : req.headers.origin));
            } else if (prop.startsWith('Access-Control-')) {
                res.setHeader(prop, headers[prop]);
            }
        }

        // Exit if not an OPTIONS Request
        if (req.method !== 'OPTIONS') {
            return;
        }

        // Simply send a 200 response without content.
        // A 204 response could be used as well.
        res.statusCode = 200;
        res.html('');
        return;
    };
};