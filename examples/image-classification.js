/**
 * Page Object [imagePredictionPage]
 *
 * Used by Example Pages:
 *     image-classification-hbs.htm
 *     binary-classification-vue.htm
 *
 * The example demonstrates how to use the built-in features of the [jsonData] object
 * and add custom logic for a page by extending [jsonData]. This method of using the
 * DataFormsJS framework works well with large sites/apps that have many pages which
 * show data from different JSON services.
 */

/* Validates with both [jshint] and [eslint] */
/* global app, Promise */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';

    // Create a new Page Object by copying the [jsonData] Page
    var page = app.deepClone({}, app.pages.jsonData);

    // Add new properties and functions for the page to the Model
    Object.assign(page.model, {
        // Propeties
        images: [],
        predictUrl: null,
        fileInputSelector: 'input[type="file"]',

        // This page uses extra DOM related code for optimization. In most apps
        // simply calling [app.refreshAllHtmlControls()] or [app.refreshHtmlControl(...)]
        // would be used to refresh parts of the page after model updates however this page
        // ends up re-drawing the full image lists many times which can make the elements flicker.
        // To use the standard framework [app.refreshAllHtmlControls()] function instead
        // set the following from DevTools or change it in the code:
        //     app.activeModel.manualDomUpdate = false
        manualDomUpdate: true,

        // Images are resized to (224 x 224) be default before being uploaded.
        // See comments in the [resizeImage()] function.
        resizeBeforeUpload: true,

        // Handle image selection
        selectImages: function() {
            var fileInput = document.querySelector(this.fileInputSelector);
            for (var n = 0, m = fileInput.files.length; n < m; n++) {
                this.showAndUploadFile(fileInput.files[n]);
            }
        },

        // Function called by Handlebars and Vue when
        // setting CSS class of the result elements.
        // Also called manually in this file.
        resultClass: function(probability) {
            if (probability >= 0.67) {
                return 'success-high';
            } else if (probability >= 0.33) {
                return 'success-medium';
            }
            return 'success-low';
        },

        // Show file on screen and start upload
        showAndUploadFile: function(file) {
            // Reference the current model object
            var model = this;

            // Create Object URL for the selected image
            var imgUrl = window.URL.createObjectURL(file);

            // Resize the image in JS before submitting
            this.resizeImage(imgUrl).then(function(blob) {
                // Build Form Data for the POST
                var formData = new FormData();
                if (model.resizeBeforeUpload) {
                    formData.append('file', blob);
                } else {
                    formData.append('file', file);
                }

                // Add selected image to the front of the images array
                var img = {
                    name: file.name,
                    src: imgUrl,
                    prediction: null,
                    hasError: false,
                    isUploading: true,
                };
                model.images.unshift(img);
                var count = model.images.length-1;

                // Show image and loading message.
                // Manual DOM updates/refresh aer not needed when using Vue.
                if (app.activeController.viewEngine !== 'Vue') {
                    if (model.manualDomUpdate) {
                        model.addImage(img);
                    } else {
                        app.refreshAllHtmlControls();
                    }
                }

                // Call web-service to make the AI/ML prediction.
                // One loaded update the related DOM element.
                fetch(model.predictUrl, {
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
                    img.isUploading = false;
                    if (app.activeController.viewEngine !== 'Vue') {
                        if (model.manualDomUpdate) {
                            model.updateItem(img, count);
                        } else {
                            app.refreshAllHtmlControls();
                        }
                    }
                });
            });
        },

        /**
         * Resize image to a square 224 x 224 pixels. This does not keep the same dimensions
         * as the original image however it matches what is used for image classification
         * because in Python the images are pre-processed using:
         *     img = image.load_img(file_path, target_size=(224, 224))
         *
         * To test with full size images from the following from DevTools. If doing this
         * you may have to configure your own webserver because the default size allows
         * only small files (1mb or less).
         *     app.activeModel.resizeBeforeUpload = false
         *
         * @param {string} src
         */
        resizeImage: function(src) {
            // Skip - keep original image
            if (!this.resizeBeforeUpload) {
                return new Promise(function(resolve) { resolve(); });
            }
            // Resize
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

                    // IE 11 needs a polyfill for [canvas.toBlob],
                    // the polyfill is only loaded if needed.
                    var polyfillUrl = 'https://cdn.jsdelivr.net/npm/blueimp-canvas-to-blob@3.16.0/js/canvas-to-blob.min.js';
                    app.loadScript(canvas.toBlob, polyfillUrl).then(function() {
                        canvas.toBlob(resolve, 'image/jpeg', 0.90);
                    });

                    // Uncomment to view the resized image at the bottom of the page:
                    // document.querySelector('body').appendChild(canvas);
                };
                img.src = src;
            });
        },

        // Optional function that runs by default when [manualDomUpdate: true]
        addImage: function(image) {
            // Get and Create Elements
            var resultsUl = document.querySelector('ul.results');
            var li = document.createElement('li');
            var img = document.createElement('img');
            var div = document.createElement('div');

            // Set Element Content
            img.src = image.src;
            div.className = 'loading';
            div.textContent = resultsUl.getAttribute('data-loading');

            // Add to Document
            li.appendChild(img);
            li.appendChild(div);
            resultsUl.insertBefore(li, resultsUl.firstChild);
        },

        // Optional function that runs by default when [manualDomUpdate: true]
        updateItem: function(image, count) {
            var model = this;
            var resultsUl = document.querySelector('ul.results');
            var listItems = resultsUl.querySelectorAll('li');
            if (listItems.length === 0) {
                return; // User navigated away from page while fetch was still running
            }
            var item = listItems[listItems.length - count - 1];
            var div = item.querySelector('div');
            if (image.hasError) {
                div.textContent = resultsUl.getAttribute('data-error');
                div.className = 'error';
            } else {
                div.className = 'container';
                div.textContent = '';
                Array.prototype.forEach.call(image.predictions, function(prediction) {
                    var result = document.createElement('div');
                    result.textContent = String(prediction.label) + ' = ' + Number(prediction.probability * 100).toFixed(5) + ' %';
                    result.className = model.resultClass(prediction.probability);
                    div.appendChild(result);
                });
            }
        },

        // Called once when the view is loaded with data
        setupView: function() {
            // Set event listener when using Handlebars.
            // For Vue [@change="selectImages"] is used on the <input> otherwise
            // images are duplicated as [selectImages()] would be called twice.
            if (app.activeController.viewEngine !== 'Vue') {
                var fileInput = document.querySelector(this.fileInputSelector);
                if (fileInput) {
                    fileInput.addEventListener('change', this.selectImages.bind(this));
                }
            }
        }
    });

    // Define the Controller [onRendered()] function.
    // This gets called each time the view is redrawn.
    page.onRendered = function() {
        if (this.isLoaded) {
            this.setupView();
        }
    };

    // Add page to the app
    app.addPage('imagePredictionPage', page);
})();
