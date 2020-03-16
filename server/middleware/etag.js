/**
 * ETag Middleware for the Custom Web Server.
 * Use for 304 'Not Modified' Responses.
 */

/* Validates online with both [jshint] and [eslint] */
/* Select [ECMA Version] = 2018 for [eslint] */
/* jshint esversion:8, node:true */
/* eslint-env node, es6 */

'use strict';

const crypto = require('crypto');

module.exports = function () {
    return function (req, res) {
        // Allow the Response to use ETags with 304 Caching
        res.etag = () => {
            res._useETag = true;
            return res;
        };

        // Handle ETags before the response is sent. Note, this is a very basic check and
        // not a full featured 304 response function that handles 'Last-Modified' or other logic.
        res.onSend.push(function (content) {
            if (res._useETag === true && res.statusCode >= 200 && res.statusCode < 300) {
                // Use MD5 and a Weak ETag for the Response.
                const md5 = crypto.createHash('md5').update(content).digest('hex');
                const etag = 'W/"' + md5 + '"';
                res.setHeader('ETag', etag);

                // Compare to Request 'If-None-Match' header. If content is an exact
                // match then set status code to 304 'Not Modified' for a cached response.
                const ifNoneMatch = (req.headers['if-none-match'] === undefined ? null : req.headers['if-none-match']);
                if (ifNoneMatch === etag) {
                    res.statusCode = 304;
                }
            }
        });
    };
};