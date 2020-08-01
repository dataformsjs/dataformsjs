/**
 * DataFormJS [imageGallery] Plugin
 * 
 * This plugin provides a simple image gallery/viewer that
 * can be used by an app to display a list of thumbnail images
 * with the following features:
 *    - Show Overlay with large Image on Thumbnail Click
 *    - Handle Left/Right/Escape Keys for the Overlay
 *    - Handle Swipe left and right on Mobile Devices
 * 
 * This Plugin does not generate large images or thumbnails
 * and requires the images to be created by the site/app.
 * 
 * This plugin is designed to be small and easy to modify so the
 * code can easily be copied and extended or changed as part of a
 * custom app.
 * 
 * By default this plugin uses the attribute [data-image-gallery]
 * which can be changed by calling `app.plugins.imageGallery.imageSrcAttr = 'attr'`
 * or by copying and modifying this class.
 * 
 * Example Usage:
 *     <img src="thumbnail1.jpg" data-image-gallery="large-image1.jpg">
 *     <img src="thumbnail2.jpg" data-image-gallery="large-image2.jpg">
 * 
 * Similar functionality exists in the DataFormsJS <image-gallery> Web Component.
 */

/* Validates with both [jshint] and [eslint] */
/* global app */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';

    /**
     * CSS for the Overlay Image Viewer
     * 
     * The easiest way to override the default values
     * is to use `!important` and specify the style
     * attributes to override.
     * 
     * Examples:
     *     .image-gallery-overlay { background-color: black !important; }
     *     .image-gallery-overlay { background-color: rgba(0,0,0,.7) !important; }
     */
    var overlayStyleId = 'image-gallery-css';
    var overlayStyleCss = [
        'body.blur { filter: blur(3px); }',        
        '.image-gallery-overlay {',
        '    position: fixed;',
        '    top: 0;',
        '    left: 0;',
        '    right: 0;',
        '    bottom: 0;',
        '    background-color: rgba(255,255,255,.8);',
        '    cursor: pointer;',
        '    display: flex;',
        '    justify-content: center;',
        '    align-items: center;',
        '}',
        '.image-gallery-overlay img {',
        '    max-width: 100%;',
        '    max-height: 100%;',
        '}',
    ].join('\n');

    /**
     * Create Custom Image Viewer Plugin that shows the overlay modal
     */
    var imageGallery = {
        images: [],
        imageSrcAttr: 'data-image-gallery',
        overlay: null,
        overlayImg: null,
        imageCount: 0,
        imageIndex: -1,
        touchStartX: 0,

        // Event that gets called after the HTML is rendered and before the
        // page's controller [onRendered()] function runs.
        onRendered: function() {
            this.images = document.querySelectorAll('[' + imageGallery.imageSrcAttr + ']');
            this.imageCount = this.images.length;
            var index = 0;
            Array.prototype.forEach.call(this.images, function(image) {
                image.addEventListener('click', function handleImageClick() {
                    var index = parseInt(image.getAttribute('data-index'), 10);
                    imageGallery.showOverlay(index);
                });
                image.setAttribute('data-index', index);
                index++;
            });
            if (this.imageCount === 0) {
                return;
            }
            document.addEventListener('keydown', imageGallery.handleKeyDown);
        },

        // Remove overlay and clear linked DOM nodes when user change the route/page.
        onRouteUnload: function() {
            if (this.overlay !== null) {
                this.hideOverlay();
            }
            this.images = [];
            document.removeEventListener('keydown', imageGallery.handleKeyDown);
        },

        // Used with the `document.onkeydown` event
        handleKeyDown: function(e) {
            if (!imageGallery.overlay) {
                return;
            }
            switch (e.key) {
                case 'ArrowLeft':
                    imageGallery.changeImage('left');
                    break;
                case 'ArrowRight':
                    imageGallery.changeImage('right');
                    break;
                case 'Escape':
                    imageGallery.hideOverlay();
                    break;
            }
        },

        // This will create a new <div class="image-gallery-overlay"><img src="url"/></div>
        // and add it to the page. 
        showOverlay: function (imageIndex) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'image-gallery-overlay';
            this.overlayImg = document.createElement('img');
            this.overlayImg.src = this.getImageSource(imageIndex);
            this.imageIndex = imageIndex;
            this.overlay.appendChild(this.overlayImg);
            this.addOverlayEvents();
            document.documentElement.appendChild(this.overlay);
            document.querySelector('body').classList.add('blur');
            this.preloadNextImages();
        },

        addOverlayEvents: function() {
            // Hide overlay on click
            this.overlay.onclick = this.hideOverlay.bind(this);

            // Handle Touch Events for Swipe Left/Right
            this.overlay.addEventListener('touchstart', function(e) {
                imageGallery.touchStartX = e.changedTouches[0].screenX;
            });
            this.overlay.addEventListener('touchend', function(e) {
                var curX = e.changedTouches[0].screenX;
                if (curX > imageGallery.touchStartX) {
                    imageGallery.changeImage('left');
                } else if (curX < imageGallery.touchStartX) {
                    imageGallery.changeImage('right');
                }
            });
        },

        // Called from overlay click and escape key
        hideOverlay: function() {
            this.overlay.parentNode.removeChild(this.overlay);
            this.overlayImg = null;
            this.overlay = null;
            document.querySelector('body').classList.remove('blur');
        },

        // Get the image to show from the default attribute of [data-image-gallery]
        getImageSource: function(index) {
            return this.images[index].getAttribute(imageGallery.imageSrcAttr);
        },

        // Change overlay image when user presses left/right or swipes on mobile
        changeImage: function(direction) {
            if (direction === 'right') {
                this.imageIndex = (this.imageIndex === this.imageCount - 1 ? 0 : this.imageIndex + 1);
            } else {
                this.imageIndex = (this.imageIndex === 0 ? this.imageCount - 1 : this.imageIndex - 1);
            }
            this.overlayImg.src = this.getImageSource(this.imageIndex);
            this.preloadNextImages();
        },

        // Preload Images when viewing a larger image from a thumbnail.
        // This makes viewing the next left or right image must faster.
        preloadNextImages: function() {
            // Image to the Left of the Current Image
            // Only load pre-load if main image is different from the thumbnail.
            var indexLeft = this.imageIndex - 1;
            if (indexLeft === -1) {
                indexLeft = this.imageCount - 1;
            }
            if (indexLeft !== this.imageIndex) {
                var srcLeft = this.images[indexLeft].getAttribute(imageGallery.imageSrcAttr);
                if (srcLeft !== null) {
                    // This causes the browser to download the image in the
                    // background where it will be cached by the browser.
                    var imgLeft = new Image();
                    imgLeft.src = srcLeft;
                }
            }

            // Image to the Right of the Current Image
            var indexRight = this.imageIndex + 1;
            if (indexRight === this.imageCount) {
                indexRight = 0;
            }
            if (indexRight !== this.imageIndex) {
                var srcRight = this.images[indexRight].getAttribute(imageGallery.imageSrcAttr);
                if (srcRight !== null) {
                    var imgRight = new Image();
                    imgRight.src = srcRight;
                }
            }
        },
    };

    /**
     * Add plugin and load needed CSS
     */
    app
        .addPlugin('imageGallery', imageGallery)
        .loadCss(overlayStyleId, overlayStyleCss);
})();
