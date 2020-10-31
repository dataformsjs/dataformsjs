/**
 * Script for Web Components Demo [image-classification-web.htm]
 *
 * This script contains basic JavaScript functions and uses API's
 * from standard DOM and DataFormsJS Web Components to allow a user
 * to upload images to a Image Classification service and get a prediction.
 * Most code is standard DOM and very little DataFormsJS API is needed.
 *
 * DataFormsJS Web Components API's used:
 *     document.querySelector('data-list').renderList()
 *     document.querySelector('json-data').state
 *
 * Code that checks `(window.app !== undefined)` switches between the
 * Web Components and DataFormsJS Framework using [polyfill.js].
 *
 * The file is written using ES5 so that it can work with both modern browsers
 * and old browsers when using [polyfill.js]. If only modern browser support
 * was needed then logic using `(window.app !== undefined)` would not be needed.
 *
 * See similar code for DataFormsJS Framework using Handlebars and Vue
 * in the file [image-classification.js]. Much of this code for image
 * classification is copied and modified from that file.
 */

/* Validates with both [eslint] and [jshint] */
/* global app, Promise */
/* exported setupFileUploads, resultClass */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "global"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* jshint strict: global */
/* jshint browser: true */
/* jshint node: true */

'use strict';

// NOTE - If <script type="module"> were used instead of <script> then
// two functions would need to be exported to global scope. Because
// <json-data> and other Web Components do not "import" functions but
// rather look for the in the `window` object setting them to the
// window object could be used like this:
//
// window.setupFileUploads = setupFileUploads;
// window.resultClass = resultClass;

/**
 * Both options work, however if `manualDomUpdate = false` then the image list
 * flickers during bulk image upload. The default `manualDomUpdate = true`
 * option requires more JavaScript though.
 */
var manualDomUpdate = true;

/**
 * These get updated based on selected language from HTML Attrinutes
 */
var uploadingText = 'Uploading';
var errorText = 'Error';

/**
 * Templating function used to assign CSS class name in a template
 * for <data-list> and also in this script.
 *
 * @param {number} probability
 */
function resultClass(probability) {
    if (probability >= 0.67) {
        return 'success-high';
    } else if (probability >= 0.33) {
        return 'success-medium';
    }
    return 'success-low';
}

/**
 * Update the <data-list> content after data changes.
 * This gets called when using option `manualDomUpdate = false`.
 */
function refreshImageList() {
    if (window.app !== undefined) {
        // DataFormsJS Framework using [polyfill.js]
        // Refresh the <data-list> JavaScript Control.
        var control = app.activeJsControls.find(function(control) {
            return control.control === 'data-list';
        });
        app.loadJsControl(control);

        // This will also work but if the layout of the HTML changed
        // then the code could break:
        //
        // app.loadJsControl(app.activeJsControls[1]);
    } else {
        // Update the Web Component by calling the custom `renderList()` function.
        document.querySelector('data-list').renderList();
    }
}

/**
 * Return a reference to the <json-data> state so that images and other
 * properties can be used and modified. Because [load-only-once]
 * is used the data is cached in memory and the state can be updated if
 * the user clicks to another page while images are uploading.
 */
function getState() {
    if (window.app !== undefined) {
        return app.activeModel;
    } else {
        return document.querySelector('json-data').state;
    }
}

/**
 * Show file on screen and start upload
 * @param {*} file
 */
function showAndUploadFile(file) {
    var state = getState();

    // Create Object URL for the selected image
    var imgUrl = window.URL.createObjectURL(file);

    // Resize the image in JS before submitting
    resizeImage(imgUrl).then(function(blob) {
        // Build Form Data for the POST
        var formData = new FormData();
        formData.append('file', blob);

        // Add selected image to the front of the images array
        var img = {
            name: file.name,
            src: imgUrl,
            predictions: [],
            hasError: false,
            isUploading: true,
        };
        state.images.unshift(img);
        var count = state.images.length - 1;

        // Show image and loading message.
        if (manualDomUpdate) {
            addImage(img);
        } else {
            refreshImageList();
        }

        // Call web-service to make the AI/ML prediction.
        // One loaded update the related DOM element.
        fetch(state.predictUrl, {
            method: 'POST',
            body: formData
        })
        .then(function(response) { return response.json(); })
        .then(function(response) {
            img.predictions = response.predictions;
        })
        .catch(function(error) {
            img.hasError = true;
            console.error(error);
        })
        .finally(function() {
            // Update the Image
            img.isUploading = false;

            // Update screen
            if (manualDomUpdate) {
                updateItem(img, count);
            } else {
                refreshImageList();
            }
        });
    });
}

/**
 * Resize image to a square 224 x 224 pixels. This does not keep the same dimensions
 * as the original image however it matches what is used for image classification
 * because in Python the images are pre-processed using:
 *     img = image.load_img(file_path, target_size=(224, 224))
 *
 * @param {string} src
 */
function resizeImage(src) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function(){
            // Resize using a new <canvas> element
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            img.height = 224;
            img.width = 224;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // IE 11 needs a polyfill for [canvas.toBlob]. The polyfill is only loaded if needed.
            if (window.app !== undefined) {
                // Standard DataFormsJS Framework using Polyfill
                var polyfillUrl = 'https://cdn.jsdelivr.net/npm/blueimp-canvas-to-blob@3.16.0/js/canvas-to-blob.min.js';
                app.loadScript(canvas.toBlob, polyfillUrl).then(function() {
                    canvas.toBlob(resolve, 'image/jpeg', 0.90);
                });
            } else {
                canvas.toBlob(resolve, 'image/jpeg', 0.90);
            }

            // Uncomment to view the resized image at the bottom of the page:
            // document.querySelector('body').appendChild(canvas);
        };
        img.src = src;
    });
}

/**
 * Optional function that runs by default when [manualDomUpdate: true]
 * @param {object} image
 */
function addImage(image) {
    // Get and Create Elements
    var resultsUl = document.querySelector('ul.results');
    var li = document.createElement('li');
    var img = document.createElement('img');
    var div = document.createElement('div');

    // Set Element Content
    img.src = image.src;
    div.className = 'loading';
    div.textContent = uploadingText;

    // Add to Document
    li.appendChild(img);
    li.appendChild(div);
    resultsUl.insertBefore(li, resultsUl.firstChild);
}

/**
 * Optional function that runs by default when [manualDomUpdate: true]
 * @param {object} image
 * @param {number} count
 */
function updateItem(image, count) {
    var listItems = document.querySelectorAll('ul.results li');
    if (listItems.length === 0) {
        return; // User clicked to another page while images were being processed
    }
    var item = listItems[listItems.length - count - 1];
    if (item === undefined) {
        return; // User navigated away
    }
    var div = item.querySelector('div');
    if (image.hasError) {
        div.textContent = errorText;
        div.className = 'error';
    } else {
        div.className = 'container';
        div.textContent = '';
        Array.prototype.forEach.call(image.predictions, function(prediction) {
            var result = document.createElement('div');
            result.textContent = String(prediction.label) + ' = ' + Number(prediction.probability * 100).toFixed(5) + ' %';
            result.className = resultClass(prediction.probability);
            div.appendChild(result);
        });
    }
}

/**
 * This function gets called from HTML in the <json-data> [onready] attribute
 */
function setupFileUploads() {
    // Loading and Error text comes from HTML attributes based on the selected language
    var dataList = document.querySelector('data-list,[data-control="data-list"]');
    uploadingText = dataList.getAttribute('data-loading');
    errorText = dataList.getAttribute('data-error');

    // Update File Input for upload event
    var fileInput = document.querySelector('input[type="file"]');
    fileInput.addEventListener('change', function() {
        for (var n = 0, m = this.files.length; n < m; n++) {
            showAndUploadFile(this.files[n]);
        }
    });
}
