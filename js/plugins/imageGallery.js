/**
 * DataFormJS [imageGallery] Plugin
 *
 * This plugin provides a simple image gallery/viewer that
 * can be used by an app to display a list of thumbnail images
 * with the following features:
 *    - Shows Overlay with large Image for Thumbnails.
 *    - Minimal UI so the focus is on the Content.
 *    - Great Accessibility and Device Support
 *      - Handles Swipe left/right and Tap to close on Mobile Devices
 *      - Fully works on Desktop from Mouse. Click to open gallery
 *        and Back and Forward buttons are displayed when using a Mouse.
 *      - Fully works from Desktop Keyboard. If using [tabindex] so
 *        thumbnails can be selected a spacebar can be used to open the
 *        gallery and Left/Right/Escape Keys can be used for navigation.
 *    - Displays [title] or [alt] of the image with index by default.
 *      [title] and [alt] are not required and index can be hidden through
 *      CSS if desired.
 *    - Displays a loading indicator if an image takes longer than
 *      2 seconds to load. The text and timeout can be changed through
 *      the API.
 *    - Supports next-gen image formats AVIF and WebP by using optional
 *      attributes [data-image-avif] and [data-image-webp]. When using next-gen
 *      image formats a default/fallback [data-image-gallery] must be included
 *      similar to how the HTML <picture> element works.
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
 *     <img src="thumbnail1.jpg" data-image-gallery="large-image1.jpg" alt="image title">
 *     <img src="thumbnail2.jpg" data-image-gallery="large-image2.jpg" title="image title">
 *
 * Similar functionality exists in the DataFormsJS <image-gallery> Web Component
 * and also for React with the `js/react/es6/ImageGallery.js` Component.
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
     * To override default values use `!important` and specify the style
     * attributes to override in any style sheet on the page or define your
     * own style sheet before this plugin runs using id `image-gallery-css`.
     *
     * Examples:
     *     .image-gallery-overlay { background-color: black !important; }
     *     .image-gallery-overlay { background-color: rgba(0,0,0,.7) !important; }
     *     .image-gallery-overlay div { display:none !important; }
     *     .image-gallery-overlay .btn-previous,
     *     .image-gallery-overlay .btn-next { background-color: blue !important; }
     *     <style id="image-gallery-css">...</style>
     *     <link rel="stylesheet" id="image-gallery-css" href="css/image-gallery.css">
     */
    var svgForwardButton = '<svg width="13" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M3.4.6L12 9c.4.4.6 1 .6 1.5a2 2 0 01-.6 1.5l-8.5 8.5a2 2 0 01-2.8-2.8l7.2-7.2L.6 3.4A2 2 0 013.4.6z" fill="#fff" fill-rule="evenodd"/></svg>';
    var svgBackButton = '<svg width="13" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M9 .6L.7 9a2 2 0 00-.6 1.5c0 .5.2 1.1.6 1.5L9 20.6a2 2 0 002.8-2.8l-7.2-7.2L12 3.4A2 2 0 009.1.6z" fill="#fff" fill-rule="evenodd"/></svg>';
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
        '    flex-direction: column;',
        '}',
        '.image-gallery-overlay .image-gallery-loading {',
        '    font-weight: bold;',
        '    padding: 10px 20px;',
        '    background-color: rgba(255,255,255,.4);',
        '    position: absolute;',
        '}',
        '.image-gallery-overlay img {',
        '    max-width: 100%;',
        '    max-height: 100%;',
        '    flex-shrink: 0;',
        '}',
        '.image-gallery-overlay div {',
        '    position: absolute;',
        '    bottom: 0;',
        '    left: 0;',
        '    right: 0;',
        '    z-index: 2;',
        '    font-weight: bold;',
        '    display: flex;',
        '    justify-content: space-between;',
        '    width: 100%;',
        '}',
        '.image-gallery-overlay div span {',
        '    padding: 10px 20px;',
        '    background-color: rgba(255,255,255,.4);',
        '}',
        '.image-gallery-overlay .btn-previous,',
        '.image-gallery-overlay .btn-next {',
        '    display: block;',
        '    position: absolute;',
        '    height: 40px;',
        '    width: 40px;',
        '    opacity: .7;',
        '    background-repeat: no-repeat;',
        '    background-position: center;',
        '    padding: 0;',
        '    margin: 15px;',
        '    background-color: rgba(0,0,0,.5);',
        '    border-radius: 50%;',
        '}',
        '.image-gallery-overlay .btn-previous { left: 0; background-position-x: 12px; background-image: url("data:image/svg+xml;base64,' + btoa(svgBackButton) + '"); }',
        '.image-gallery-overlay .btn-next { right: 0; background-position-x: 15px; background-image: url("data:image/svg+xml;base64,' + btoa(svgForwardButton) + '"); }',
        '.image-gallery-overlay.mobile .btn-previous,',
        '.image-gallery-overlay.mobile .btn-next,',
        '.image-gallery-overlay.keyboard .btn-previous,',
        '.image-gallery-overlay.keyboard .btn-next {',
        '    display: none;',
        '}',
        '@media (min-width: 1300px) {',
        '    .image-gallery-overlay div {',
        '        left: calc((100% - 1300px) /2);',
        '        right: auto;',
        '        max-width: 1300px;',
        '    }',
        '}',
        // Adjustments for IE 11
        '@media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: none) {',
        '    .image-gallery-overlay .image-gallery-loading,',
        '    .image-gallery-overlay .btn-previous,',
        '    .image-gallery-overlay .btn-next { margin-top: calc((100vh /2) - 35px); }',
        '}',
    ].join('\n');

    /**
     * Use passive events for 'touchstart' based on Chrome DevTools Recommendation
     * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
     */
    var supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
                return true;
            }
        });
        window.addEventListener('testPassive', null, opts);
        window.removeEventListener('testPassive', null, opts);
    // eslint-disable-next-line no-empty
    } catch (e) {}

    /**
     * Create Custom Image Viewer Plugin that shows the overlay modal
     */
    var imageGallery = {
        // Properties [loadingText, loadingTimeout, imageSrcAttr, imageSrcAttrAvif,
        // imageSrcAttrWebP] can be safely overwritten by the app using this, however
        // other properties are generally intended for private use by this plugin.
        images: [],
        imageSrcAttr: 'data-image-gallery',
        imageSrcAttrAvif: 'data-image-avif',
        imageSrcAttrWebP: 'data-image-webp',
        overlay: null,
        overlayImg: null,
        overlayTitle: null,
        overlayIndex: null,
        overlayLoading: null,
        overlayBackButton: null,
        overlayFowardButton: null,
        imageCount: 0,
        imageIndex: -1,
        touchStartX: 0,
        loadedImages: [],
        loadingText: 'Loading...', // Message to show if image takes a while to load
        loadingTimeout: 2000, // Delay for loading message in milliseconds (thousandths of a second)
        loadingTimeoutId: null,
        isMobile: (function() { // This is set only once when the script is first loaded
            var ua = window.navigator.userAgent.toLowerCase();
            return (ua.indexOf('android') > -1 || ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1);
        })(),
        startedFromKeyboard: false,
        supportsAvif: null,
        supportsWebp: null,

        // Event that gets called after the HTML is rendered and before the
        // page's controller [onRendered()] function runs.
        onRendered: function(element) {
            if (this.images.length > 0) {
                return; // Already setup
            }
            element = (element === undefined ? document : element);
            this.images = element.querySelectorAll('[' + imageGallery.imageSrcAttr + ']');
            this.imageCount = this.images.length;
            var index = 0;
            Array.prototype.forEach.call(this.images, function(image) {
                image.addEventListener('click', function handleImageClick() {
                    var index = parseInt(image.getAttribute('data-index'), 10);
                    imageGallery.checkSupportedFormats(index);
                });
                image.addEventListener('keydown', function handleKeyDown(e) {
                    // 'Spacebar' is for IE and Legacy Edge
                    if (e.key === ' ' || e.key === 'Spacebar') {
                        // If using [tabindex] the keyboard will still be focused on the last image
                        // if the gallery was opened using the keyboard; so make sure overlay is
                        // currently not displayed.
                        if (imageGallery.overlay === null) {
                            imageGallery.startedFromKeyboard = true;
                            var index = parseInt(image.getAttribute('data-index'), 10);
                            imageGallery.checkSupportedFormats(index);
                        }
                        // Prevent scroll to next element with [tabindex]
                        e.preventDefault();
                    }
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
                case 'Left':
                    imageGallery.changeImage('left');
                    break;
                case 'ArrowRight':
                case 'Right':
                    imageGallery.changeImage('right');
                    break;
                case 'Escape':
                case 'Esc':
                    imageGallery.hideOverlay();
                    break;
            }
        },

        /**
         * Check browser support for next-gen image formats (AVIF and WebP).
         * A one-pixel JPG was converted to each format and is used to
         * determine browser support.
         */
        checkSupportedFormats: function (imageIndex) {
            // Image format only needs to be checked one time
            // when the overlay is first used on a page.
            if (this.supportsAvif !== null && this.supportsWebp !== null) {
                this.showOverlay(imageIndex);
                return;
            }

            // Checks for both AVIF and WebP run at the same time.
            // Once both complete then show the overlay.
            function checkStatus() {
                if (imageGallery.supportsAvif !== null && imageGallery.supportsWebp !== null) {
                    imageGallery.showOverlay(imageIndex);
                    return;
                }
            }

            // AVIF
            var imgAvif = new Image();
            imgAvif.onload = function() {
                imageGallery.supportsAvif = (imgAvif.width === 1 && imgAvif.height === 1);
                checkStatus();
            };
            imgAvif.onerror = function() { imageGallery.supportsAvif = false; checkStatus(); };
            imgAvif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABoAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACJtZGF0EgAKCBgABogQEAwgMgwYAAAAUAAAALASmpg=';

            // WebP
            var imgWebP = new Image();
            imgWebP.onload = function() {
                imageGallery.supportsWebp = (imgWebP.width === 1 && imgWebP.height === 1);
                checkStatus();
            };
            imgWebP.onerror = function() { imageGallery.supportsWebp = false; checkStatus(); };
            imgWebP.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
        },

        // This will create a new <div class="image-gallery-overlay"><img src="url"/></div>
        // and add it to the page.
        showOverlay: function (imageIndex) {
            var imageSrc = this.getImageSource(imageIndex);
            var imageTitle = this.images[imageIndex].getAttribute('title');
            if (imageTitle === null) {
                imageTitle = this.images[imageIndex].getAttribute('alt');
            }

            // Overlay <div> root element
            this.overlay = document.createElement('div');
            this.overlay.className = 'image-gallery-overlay' + (this.isMobile ? ' mobile' : '') + (this.startedFromKeyboard ? ' keyboard' : '');

            // Add <span> for loading indicator which is hidden
            // by default unless image takes a while to load.
            this.overlayLoading = document.createElement('span');
            this.overlayLoading.className = 'image-gallery-loading';
            this.overlayLoading.textContent = this.loadingText;
            this.overlayLoading.setAttribute('hidden', '');
            this.overlay.appendChild(this.overlayLoading);

            // Add [Back] and [Forward] Buttons
            this.overlayBackButton = document.createElement('span');
            this.overlayBackButton.className = 'btn-previous';
            this.overlayBackButton.setAttribute('role', 'button');
            this.overlayBackButton.onclick = function() { imageGallery.changeImage('left'); };
            this.overlayFowardButton = document.createElement('span');
            this.overlayFowardButton.className = 'btn-next';
            this.overlayFowardButton.setAttribute('role', 'button');
            this.overlayFowardButton.onclick = function() { imageGallery.changeImage('right'); };
            this.overlay.appendChild(this.overlayBackButton);
            this.overlay.appendChild(this.overlayFowardButton);

            // Overlay <img>
            this.overlayImg = document.createElement('img');
            this.overlayImg.addEventListener('load', function () {
                if (imageGallery.loadedImages.indexOf(imageSrc) === -1) {
                    imageGallery.loadedImages.push(imageSrc);
                }
                imageGallery.clearLoadingTimer();
                if (imageGallery.overlayLoading !== null) {
                    imageGallery.overlayLoading.setAttribute('hidden', '');
                }
                imageGallery.preloadNextImages();
            });
            this.overlayImg.src = imageSrc;
            this.imageIndex = imageIndex;
            this.overlay.appendChild(this.overlayImg);

            // Overlay <div> for title and index
            var container = document.createElement('div');
            this.overlayTitle = document.createElement('span');
            this.overlayTitle.textContent = imageTitle;
            this.overlayTitle.style.display = (imageTitle ? '' : 'none');
            container.appendChild(this.overlayTitle);
            this.overlayIndex = document.createElement('span');
            this.overlayIndex.textContent = (imageIndex + 1) + '/' + this.imageCount;
            container.appendChild(this.overlayIndex);
            this.overlay.appendChild(container);

            // Define events and add Overlay to DOM
            this.addOverlayEvents();
            document.documentElement.appendChild(this.overlay);
            document.querySelector('body').classList.add('blur');
            this.startLoadingTimer();
        },

        // Show the loading indicator if the image takes a while to load
        startLoadingTimer: function() {
            this.clearLoadingTimer();
            this.loadingTimeoutId = window.setTimeout(function () {
                imageGallery.loadingTimeoutId = null;
                if (imageGallery.overlayLoading === null) {
                    return;
                }
                imageGallery.overlayLoading.removeAttribute('hidden');
            }, this.loadingTimeout);
        },

        clearLoadingTimer: function() {
            if (this.loadingTimeoutId !== null) {
                window.clearTimeout(this.loadingTimeoutId);
                this.loadingTimeoutId = null;
            }
        },

        addOverlayEvents: function() {
            // Hide overlay on click. For mobile devices if the user "clicks/touches"
            // in the middle half of the screen then do not hide the overlay. This
            // prevents the overlay from hiding while the user is swiping. Without
            // this code the swipe logic still works on mobile, however the overlay
            // closes occasionally which causes an unexpected experience for the user.
            this.overlay.onclick = function(e) {
                if ('ontouchstart' in window) {
                    var screenHeight = window.innerHeight;
                    var screen25pct = screenHeight / 4;
                    var screenBottom = screenHeight - screen25pct;
                    if (e.clientY >= screen25pct && e.clientY <= screenBottom) {
                        return;
                    }
                }
                // Don't hide if user clicked [Back] or [Forward] buttons
                if (e.target === imageGallery.overlayBackButton || e.target === imageGallery.overlayFowardButton) {
                    return;
                }
                imageGallery.hideOverlay();
            };

            // Handle Touch Events for Swipe Left/Right
            this.overlay.addEventListener('touchstart', function(e) {
                imageGallery.touchStartX = e.changedTouches[0].screenX;
            }, supportsPassive ? { passive: true } : false);
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
            this.clearLoadingTimer();
            this.overlay.parentNode.removeChild(this.overlay);
            this.overlayBackButton = null;
            this.overlayFowardButton = null;
            this.overlayLoading = null;
            this.overlayIndex = null;
            this.overlayTitle = null;
            this.overlayImg = null;
            this.overlay = null;
            this.startedFromKeyboard = false;
            document.querySelector('body').classList.remove('blur');
        },

        // Get the image to show from the default attribute of [data-image-gallery]
        getImageSource: function(index) {
            var el = this.images[index];
            var url = el.getAttribute(this.imageSrcAttrAvif);
            if (url && this.supportsAvif) {
                return url;
            }
            url = el.getAttribute(this.imageSrcAttrWebP);
            if (url && this.supportsWebp) {
                return url;
            }
            return el.getAttribute(imageGallery.imageSrcAttr);
        },

        // Change overlay image when user presses left/right or swipes on mobile
        changeImage: function(direction) {
            if (direction === 'right') {
                this.imageIndex = (this.imageIndex === this.imageCount - 1 ? 0 : this.imageIndex + 1);
            } else {
                this.imageIndex = (this.imageIndex === 0 ? this.imageCount - 1 : this.imageIndex - 1);
            }
            var imageTitle = this.images[this.imageIndex].getAttribute('title');
            if (imageTitle === null) {
                imageTitle = this.images[this.imageIndex].getAttribute('alt');
            }
            this.overlayImg.src = '';
            this.overlayImg.src = this.getImageSource(this.imageIndex);
            this.overlayTitle.textContent = imageTitle;
            this.overlayTitle.style.display = (imageTitle ? '' : 'none');
            this.overlayIndex.textContent = (this.imageIndex + 1) + '/' + this.imageCount;
            this.startLoadingTimer();
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
                var srcLeft = this.getImageSource(indexLeft);
                if (srcLeft && this.loadedImages.indexOf(srcLeft) === -1) {
                    // This causes the browser to download the image in the
                    // background where it will be cached by the browser.
                    var imgLeft = new Image();
                    imgLeft.onload = function () { imageGallery.loadedImages.push(srcLeft); };
                    imgLeft.src = srcLeft;
                }
            }

            // Image to the Right of the Current Image
            var indexRight = this.imageIndex + 1;
            if (indexRight === this.imageCount) {
                indexRight = 0;
            }
            if (indexRight !== this.imageIndex) {
                var srcRight = this.getImageSource(indexRight);
                if (srcRight && this.loadedImages.indexOf(srcRight) === -1) {
                    var imgRight = new Image();
                    imgRight.onload = function () { imageGallery.loadedImages.push(srcRight); };
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
