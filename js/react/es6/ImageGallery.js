/**
 * DataFormsJS React Component <ImageGallery>
 *
 * This class provides a simple image gallery/viewer that
 * can be used by an app to display a list of thumbnail images
 * with the following features:
 *    - Shows Overlay with large Image on Thumbnail Click
 *    - Handles Left/Right/Escape Keys for the Overlay
 *    - Handles Swipe left/right and Tap to close on Mobile Devices
 *    - Displays [title] of the image with index by default.
 *      [title] is not required and index can be hidden through
 *      CSS if desired.
 *    - Displays a loading indicator if an image takes longer than
 *      2 seconds to load. The text and timeout can be changed
 *      by setting props [loadingText] and [loadingTimeout].
 *
 * This React Component does not generate large images or thumbnails
 * and requires the images to be created by the site/app.
 *
 * This class is designed to be small and easy to modify so the
 * code can easily be copied and extended or changed as part of a
 * custom app.
 *
 * Example Usage:
 *     https://www.dataformsjs.com/examples/image-gallery-react.htm
 *
 * Similar functionality exists for the standard DataFormsJS Framework
 * with the `js/plugins/imageGallery.js` plugin and also for the
 * DataFormsJS <image-gallery> Web Component.
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import React from 'react';

/**
 * Use passive events for 'touchstart' based on Chrome DevTools Recommendation
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 */
let _supportsPassive = false;
try {
    const opts = Object.defineProperty({}, 'passive', {
        get: function() {
            _supportsPassive = true;
            return true;
        }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
// eslint-disable-next-line no-empty
} catch (e) {}

/**
 * Component <BasicImage> - used when no template is specified for <ImageGallery>
 * @param {object} props
 */
function BasicImage(props) {
    return React.createElement('img', {
        src: props.thumbnail,
        alt: props.title,
        onClick: props.onClick,
    });
}

/**
 * <ImageGallery> Component
 */
export default class ImageGallery extends React.Component {
    constructor(props) {
        super(props);
        // Bind Events
        this.onClick = this.onClick.bind(this);
        this.handleDocKeyDown = this.handleDocKeyDown.bind(this);
        this.preloadNextImages = this.preloadNextImages.bind(this);
        this.hideOverlay = this.hideOverlay.bind(this);
        this.changeImage = this.changeImage.bind(this);

        /**
         * CSS for the Overlay Image Viewer
         *
         * To override default values use `!important` and specify the style
         * attributes to override in any style sheet on the page or define your
         * own style sheet before this component runs using id `image-gallery-css`.
         *
         * Examples:
         *     .image-gallery-overlay { background-color: black !important; }
         *     .image-gallery-overlay { background-color: rgba(0,0,0,.7) !important; }
         *     .image-gallery-overlay div { display:none !important; }
         *     <style id="image-gallery-css">...</style>
         *     <link rel="stylesheet" id="image-gallery-css" href="css/image-gallery.css">
         */
        this.overlayStyleId = 'image-gallery-css';
        this.overlayStyleCss = `
            body.blur { filter: blur(3px); }

            .image-gallery-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255,255,255,.8);
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            }

            .image-gallery-overlay .image-gallery-loading {
                font-weight: bold;
                padding: 10px 20px;
                background-color: rgba(255,255,255,.4);
                position: absolute;
            }

            .image-gallery-overlay img {
                max-width: 100%;
                max-height: 100%;
                flex-shrink: 0;
            }

            .image-gallery-overlay div {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                width: 100%;
            }

            .image-gallery-overlay div span {
                padding: 10px 20px;
                background-color: rgba(255,255,255,.4);
            }

            @media (min-width: 1300px) {
                .image-gallery-overlay div {
                    left: calc((100% - 1300px) /2);
                    right: auto;
                    max-width: 1300px;
                }
            }
        `;

        // Internal class properties
        this.imageIndex = null;
        this.overlay = null;
        this.overlayImg = null;
        this.overlayTitle = null;
        this.overlayIndex = null;
        this.overlayLoading = null;
        this.touchStartX = null;
        this.loadingTimeoutId = null;
        this.loadingText = (props.loadingText ? props.loadingText : 'Loading...');
        this.loadingTimeout = (props.loadingTimeout ? props.loadingTimeout : 2000);
        this.loadedImages = new Set();

        // Set State with Images
        this.state = {
            images: props.images,
        };
    }

    onClick(e) {
        let url = e.target.src;
        if (!url) {
            url = e.target.getAttribute('data-image');
        }
        this.imageIndex = -1;
        for (let n = 0, m = this.state.images.length; n < m; n++) {
            if (this.state.images[n].thumbnail === url) {
                this.imageIndex = n;
                break;
            }
        }
        this.showOverlay();
    }

    loadCss() {
        let style = document.getElementById(this.overlayStyleId);
        if (style === null) {
            style = document.createElement('style');
            style.id = this.overlayStyleId;
            style.innerHTML = this.overlayStyleCss;
            document.head.appendChild(style);
        }
    }

    showOverlay() {
        const imageSrc = this.state.images[this.imageIndex].image;
        const imageTitle = this.state.images[this.imageIndex].title;
        this.loadCss();

        // Overlay <div> root element
        this.overlay = document.createElement('div');
        this.overlay.className = 'image-gallery-overlay';

        // Add <span> for loading indicator which is hidden
        // by default unless image takes a while to load.
        this.overlayLoading = document.createElement('span');
        this.overlayLoading.className = 'image-gallery-loading';
        this.overlayLoading.textContent = this.loadingText;
        this.overlayLoading.setAttribute('hidden', '');
        this.overlay.appendChild(this.overlayLoading);

        // Overlay <img>
        this.overlayImg = document.createElement('img');
        this.overlayImg.addEventListener('load', () => {
            this.loadedImages.add(imageSrc);
            this.clearLoadingTimer();
            this.overlayLoading.setAttribute('hidden', '');
            this.preloadNextImages();
        });
        this.overlayImg.src = imageSrc;
        this.overlay.appendChild(this.overlayImg);

        // Overlay <div> for title and index
        const container = document.createElement('div');
        this.overlayTitle = document.createElement('span');
        this.overlayTitle.textContent = imageTitle;
        this.overlayTitle.style.display = (imageTitle ? '' : 'none');
        container.appendChild(this.overlayTitle);
        this.overlayIndex = document.createElement('span');
        this.overlayIndex.textContent = `${this.imageIndex + 1}/${this.state.images.length}`;
        container.appendChild(this.overlayIndex);
        this.overlay.appendChild(container);

        // Define events and add Overlay to DOM
        this.addOverlayEvents();
        document.documentElement.appendChild(this.overlay);
        document.querySelector('body').classList.add('blur');
        this.startLoadingTimer();
    }

    // Show the loading indicator if the image takes a while to load
    startLoadingTimer() {
        this.clearLoadingTimer();
        this.loadingTimeoutId = window.setTimeout(() => {
            this.loadingTimeoutId = null;
            if (this.overlayLoading === null) {
                return;
            }
            this.overlayLoading.removeAttribute('hidden');
        }, this.loadingTimeout);
    }

    clearLoadingTimer() {
        if (this.loadingTimeoutId !== null) {
            window.clearTimeout(this.loadingTimeoutId);
            this.loadingTimeoutId = null;
        }
    }

    addOverlayEvents() {
        // Hide overlay on click. For mobile devices if the user "clicks/touches"
        // in the middle half of the screen then do not hide the overlay. This
        // prevents the overlay from hiding while the user is swiping. Without
        // this code the swipe logic still works on mobile, however the overlay
        // closes occasionally which causes an unexpected experience for the user.
        this.overlay.onclick = (e) => {
            if ('ontouchstart' in window) {
                const screenHeight = window.innerHeight;
                const screen25pct = screenHeight / 4;
                const screenBottom = screenHeight - screen25pct;
                if (e.clientY >= screen25pct && e.clientY <= screenBottom) {
                    return;
                }
            }
            this.hideOverlay();
        };

        // Handle Right and Left Arrow Keys to change active image
        document.addEventListener('keydown', this.handleDocKeyDown);

        // Handle Touch Events for Swipe Left/Right
        this.overlay.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, _supportsPassive ? { passive: true } : false);
        this.overlay.addEventListener('touchend', (e) => {
            var curX = e.changedTouches[0].screenX;
            if (curX > this.touchStartX) {
                this.changeImage('left');
            } else if (curX < this.touchStartX) {
                this.changeImage('right');
            }
        });
    }

    handleDocKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'Left':
                this.changeImage('left');
                break;
            case 'ArrowRight':
            case 'Right':
                this.changeImage('right');
                break;
            case 'Escape':
            case 'Esc':
                this.hideOverlay();
                break;
        }
    }

    componentWillUnmount() {
        this.hideOverlay();
    }

    // Called from overlay click, escape key, or if the component will be unmounted
    hideOverlay() {
        this.clearLoadingTimer();
        this.overlay.parentNode.removeChild(this.overlay);
        this.overlayLoading = null;
        this.overlayIndex = null;
        this.overlayTitle = null;
        this.overlayImg = null;
        this.overlay = null;
        document.removeEventListener('keydown', this.handleDocKeyDown);
        document.querySelector('body').classList.remove('blur');
    }

    // Preload Images when viewing a larger image from a thumbnail.
    // This makes viewing the next left or right image must faster.
    preloadNextImages() {
        // This code won't work if the class Image is overwritten by a
        // React Component from the app named <Image>
        if (window.Image.toString().indexOf('[native code]') === -1) {
            console.warn('Images for <ImageGallery> cannot be preloaded because the app defined a <Image> component that overwrote the browsers native [Image] class.');
            return;
        }

        // Image to the Left of the Current Image
        const imageCount = this.state.images.length;
        let indexLeft = this.imageIndex - 1;
        if (indexLeft === -1) {
            indexLeft = imageCount - 1;
        }
        if (indexLeft !== this.imageIndex) {
            // This causes the browser to download the image in the
            // background where it will be cached by the browser.
            const srcLeft = this.state.images[indexLeft].image;
            if (srcLeft && !this.loadedImages.has(srcLeft)) {
                const imgLeft = new Image();
                imgLeft.onload = () => { this.loadedImages.add(srcLeft); };
                imgLeft.src = srcLeft;
            }
        }

        // Image to the Right of the Current Image
        let indexRight = this.imageIndex + 1;
        if (indexRight === imageCount) {
            indexRight = 0;
        }
        if (indexRight !== this.imageIndex) {
            const srcRight = this.state.images[indexRight].image;
            if (srcRight && !this.loadedImages.has(srcRight)) {
                const imgRight = new Image();
                imgRight.onload = () => { this.loadedImages.add(srcRight); };
                imgRight.src = srcRight;
            }
        }
    }

    // Change overlay image when user presses left/right or swipes on mobile
    changeImage(direction) {
        const imageCount = this.state.images.length;
        if (direction === 'right') {
            this.imageIndex = (this.imageIndex === imageCount - 1 ? 0 : this.imageIndex + 1);
        } else {
            this.imageIndex = (this.imageIndex === 0 ? imageCount - 1 : this.imageIndex - 1);
        }
        const imageTitle = this.state.images[this.imageIndex].title;
        this.overlayImg.src = '';
        this.overlayImg.src = this.state.images[this.imageIndex].image;
        this.overlayTitle.textContent = imageTitle;
        this.overlayTitle.style.display = (imageTitle ? '' : 'none');
        this.overlayIndex.textContent = `${this.imageIndex + 1}/${imageCount}`;
        this.startLoadingTimer();
    }

    render() {
        let template = this.props.template;
        if (template === undefined) {
            if (this.props.children !== undefined) {
                template = this.props.children;
            } else {
                template = React.createElement(BasicImage);
            }
        }

        return this.state.images.map(image => {
            return React.cloneElement(template, Object.assign({}, image, {
                onClick: this.onClick,
            }));
        });
    }
}
