/**
 * DataFormsJS React Component <ImageGallery>
 *
 * This class provides a simple image gallery/viewer that
 * can be used by an app to display a list of thumbnail images
 * with the following features:
 *    - Shows Overlay with large Image for Thumbnails.
 *    - Minimal UI so the focus is on the Content.
 *    - Easy to use from any device and fully accessible:
 *      - Handles Swipe left/right and Tap to close on Mobile Devices
 *      - Fully works on Desktop from Mouse. Click to open gallery.
 *        and Back and Forward buttons are displayed when using a Mouse.
 *      - Fully works from Desktop Keyboard. If using [tabIndex] so
 *        thumbnails can be selected a spacebar can be used to open the
 *        gallery and Left/Right/Escape Keys can be used for navigation.
 *    - Displays [title] of the image with index by default.
 *      [title] is not required and index can be hidden through
 *      CSS if desired.
 *    - Displays a loading indicator if an image takes longer than
 *      2 seconds to load. The text and timeout can be changed
 *      by setting props [loadingText] and [loadingTimeout].
 *    - Supports next-gen image formats AVIF and WebP by using optional
 *      props [image_avif] and [image_webp]. When using next-gen
 *      image formats a default/fallback [image] must be included
 *      similar to how the HTML <picture> element works.
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

// [isMobile] is set only one time when the script loads and
// [supportsAvif, supportsWebp] are only one time on first use.
const isMobile = (() => {
    const ua = window.navigator.userAgent.toLowerCase();
    return (ua.indexOf('android') > -1 || ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1);
})();
let supportsAvif = null;
let supportsWebp = null;

/**
 * Component <BasicImage> - used when no template is specified for <ImageGallery>
 * @param {object} props
 */
function BasicImage(props) {
    return React.createElement('img', {
        src: props.thumbnail,
        alt: props.title,
        tabIndex: props.tabIndex,
        onClick: props.onClick,
        onKeyDown: props.onKeyDown,
        key: props.key,
        style: {
            cursor: 'pointer'
        },
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
        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleDocKeyDown = this.handleDocKeyDown.bind(this);
        this.preloadNextImages = this.preloadNextImages.bind(this);
        this.showOverlay = this.showOverlay.bind(this);
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
         *     .image-gallery-overlay .btn-previous,
         *     .image-gallery-overlay .btn-next { background-color: blue !important; }
         *     <style id="image-gallery-css">...</style>
         *     <link rel="stylesheet" id="image-gallery-css" href="css/image-gallery.css">
         */
        this.svgForwardButton = '<svg width="13" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M3.4.6L12 9c.4.4.6 1 .6 1.5a2 2 0 01-.6 1.5l-8.5 8.5a2 2 0 01-2.8-2.8l7.2-7.2L.6 3.4A2 2 0 013.4.6z" fill="#fff" fill-rule="evenodd"/></svg>';
        this.svgBackButton = '<svg width="13" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M9 .6L.7 9a2 2 0 00-.6 1.5c0 .5.2 1.1.6 1.5L9 20.6a2 2 0 002.8-2.8l-7.2-7.2L12 3.4A2 2 0 009.1.6z" fill="#fff" fill-rule="evenodd"/></svg>';
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

            .image-gallery-overlay .btn-previous,
            .image-gallery-overlay .btn-next {
                display: block;
                position: absolute;
                height: 40px;
                width: 40px;
                opacity: .7;
                background-repeat: no-repeat;
                background-position: center;
                padding: 0;
                margin: 15px;
                background-color: rgba(0,0,0,.5);
                border-radius: 50%;
                transition: all ease-in-out .2s;
            }
            .image-gallery-overlay .btn-previous { left: 0; background-position-x: 12px; background-image: url("data:image/svg+xml;base64,${btoa(this.svgBackButton)}"); }
            .image-gallery-overlay .btn-next { right: 0; background-position-x: 15px; background-image: url("data:image/svg+xml;base64,${btoa(this.svgForwardButton)}"); }

            .image-gallery-overlay .btn-previous:hover,
            .image-gallery-overlay .btn-next:hover {
                opacity: .5;
            }       

            .image-gallery-overlay.mobile .btn-previous,
            .image-gallery-overlay.mobile .btn-next,
            .image-gallery-overlay.keyboard .btn-previous,
            .image-gallery-overlay.keyboard .btn-next {
                display: none;
            }

            @media (min-width: 1300px) {
                .image-gallery-overlay div {
                    left: calc((100% - 1300px) /2);
                    right: auto;
                    max-width: 1300px;
                }
            }

            @media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: none) {
                .image-gallery-overlay .image-gallery-loading,
                .image-gallery-overlay .btn-previous,
                .image-gallery-overlay .btn-next { margin-top: calc((100vh /2) - 35px); }
            }
        `;

        // Internal class properties
        this.imageIndex = null;
        this.overlay = null;
        this.overlayImg = null;
        this.overlayTitle = null;
        this.overlayIndex = null;
        this.overlayLoading = null;
        this.overlayBackButton = null;
        this.overlayFowardButton = null;
        this.touchStartX = null;
        this.loadingTimeoutId = null;
        this.loadingText = (props.loadingText ? props.loadingText : 'Loading...');
        this.loadingTimeout = (props.loadingTimeout ? props.loadingTimeout : 2000);
        this.loadedImages = new Set();
        this.startedFromKeyboard = false;

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
        this.checkSupportedFormats();
    }

    onKeyDown(e) {
        // 'Spacebar' is for IE and Legacy Edge
        if (e.key === ' ' || e.key === 'Spacebar') {
            // If using [tabindex] the keyboard will still be focused on the last image
            // if the gallery was opened using the keyboard; so make sure overlay is
            // currently not displayed.
            if (this.overlay === null) {
                this.startedFromKeyboard = true;
                this.onClick(e);
            }
            // Prevent scroll to next element with [tabindex]
            e.preventDefault();
        }
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

    /**
     * Check browser support for next-gen image formats (AVIF and WebP).
     * A one-pixel JPG was converted to each format and is used to
     * determine browser support.
     */
    checkSupportedFormats() {
        // Image format only needs to be checked one time
        // when the overlay is first used on a page.
        if (supportsAvif !== null && supportsWebp !== null) {
            this.showOverlay();
            return;
        }

        // Checks for both AVIF and WebP run at the same time.
        // Once both complete then show the overlay.
        const showOverlay = this.showOverlay;
        function checkStatus() {
            if (supportsAvif !== null && supportsWebp !== null) {
                showOverlay();
                return;
            }
        }

        // AVIF
        const imgAvif = new Image();
        imgAvif.onload = () => {
            supportsAvif = (imgAvif.width === 1 && imgAvif.height === 1);
            checkStatus();
        };
        imgAvif.onerror = () => { supportsAvif = false; checkStatus(); };
        imgAvif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABoAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACJtZGF0EgAKCBgABogQEAwgMgwYAAAAUAAAALASmpg=';

        // WebP
        const imgWebP = new Image();
        imgWebP.onload = () => {
            supportsWebp = (imgWebP.width === 1 && imgWebP.height === 1);
            checkStatus();
        };
        imgWebP.onerror = () => { supportsWebp = false; checkStatus(); };
        imgWebP.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
    }

    showOverlay() {
        const imageSrc = this.getImage(this.state.images[this.imageIndex]);
        const imageTitle = this.state.images[this.imageIndex].title;
        this.loadCss();

        // Overlay <div> root element
        this.overlay = document.createElement('div');
        this.overlay.className = 'image-gallery-overlay' + (isMobile ? ' mobile' : '') + (this.startedFromKeyboard ? ' keyboard' : '');

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
        this.overlayBackButton.onclick = () => { this.changeImage('left'); };
        this.overlayFowardButton = document.createElement('span');
        this.overlayFowardButton.className = 'btn-next';
        this.overlayFowardButton.setAttribute('role', 'button');
        this.overlayFowardButton.onclick = () => { this.changeImage('right'); };
        this.overlay.appendChild(this.overlayBackButton);
        this.overlay.appendChild(this.overlayFowardButton);

        // Overlay <img>
        this.overlayImg = document.createElement('img');
        this.overlayImg.addEventListener('load', () => {
            this.loadedImages.add(imageSrc);
            this.clearLoadingTimer();
            if (this.overlayLoading !== null) {
                this.overlayLoading.setAttribute('hidden', '');
            }
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

    getImage(image) {
        if (image.image_avif !== undefined && supportsAvif) {
            return image.image_avif;
        }
        if (image.image_webp !== undefined && supportsWebp) {
            return image.image_webp;
        }
        return image.image;
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
            // Don't hide if user clicked [Back] or [Forward] buttons
            if (e.target === this.overlayBackButton || e.target === this.overlayFowardButton) {
                return;
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
        this.overlayBackButton = null;
        this.overlayFowardButton = null;
        this.overlayLoading = null;
        this.overlayIndex = null;
        this.overlayTitle = null;
        this.overlayImg = null;
        this.overlay = null;
        this.startedFromKeyboard = false;
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
            const srcLeft = this.getImage(this.state.images[indexLeft]);
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
            const srcRight = this.getImage(this.state.images[indexRight]);
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
        this.overlayImg.src = this.getImage(this.state.images[this.imageIndex]);
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

        let tabIndex = parseInt(this.props.tabIndex, 10);
        const useTabIndex = (window.isFinite(tabIndex));
        return this.state.images.map((image, index) => {
            const imageAttr = {
                key: (index.toString() + '_' + image.thumbnail),
                onClick: this.onClick,
                onKeyDown: this.onKeyDown,
            };
            if (useTabIndex) {
                imageAttr.tabIndex = tabIndex;
                tabIndex++;
            }
            return React.cloneElement(template, Object.assign({}, image, imageAttr));
        });
    }
}
