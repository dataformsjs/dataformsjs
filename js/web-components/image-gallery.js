/**
 * DataFormsJS <image-gallery> Web Component
 *
 * This class provides a simple image gallery/viewer that
 * can be used by an app to display a list of thumbnail images
 * with the following features:
 *    - Show Overlay with large Image on Thumbnail Click
 *    - Handle Left/Right/Escape Keys for the Overlay
 *    - Handle Swipe left and right on Mobile Devices
 *
 * This Web Component does not generate large images or thumbnails
 * and requires the images to be created by the site/app.
 *
 * This class is designed to be small and easy to modify so the
 * code can easily be copied and extended or changed as part of a
 * custom app.
 *
 * Example Usage:
 *     <image-gallery image="large-image1.jpg">
 *         <img src="thumbnail1.jpg">
 *         <div>...</div>
 *     </image-gallery>
 *     <image-gallery
 *         image="large-image2.jpg"
 *         style="background-image: url('thumbnail2.jpg');">
 *     </image-gallery>
 *
 * Similar functionality exists for the standard DataFormsJS Framework
 * with the `js/plugins/imageGallery.js` plugin.
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>:host { display:block; cursor:pointer; }</style>
    <slot></slot>
`;

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
const overlayStyleId = 'image-gallery-css';
const overlayStyleCss = `
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
    }

    .image-gallery-overlay img {
        max-width: 100%;
        max-height: 100%;
    }
`;

/**
 * Define module-level variables and functions used when viewing images
 */
let images = null;
let imageIndex = null;
let imageCount = 0;
let overlay = null;
let overlayImg = null;
let touchStartX = null;

function showOverlay() {
    loadCss();
    overlay = document.createElement('div');
    overlay.className = 'image-gallery-overlay';
    overlayImg = document.createElement('img');
    overlayImg.src = images[imageIndex].getAttribute('image');
    overlay.appendChild(overlayImg);
    addOverlayEvents();
    document.documentElement.appendChild(overlay);
    document.querySelector('body').classList.add('blur');
    preloadNextImages();
}

function loadCss() {
    let style = document.getElementById(overlayStyleId);
    if (style === null) {
        style = document.createElement('style');
        style.id = overlayStyleId;
        style.innerHTML = overlayStyleCss;
        document.head.appendChild(style);
    }
}

function addOverlayEvents() {
    // Hide overlay on click
    overlay.onclick = hideOverlay;

    // Handle Right and Left Arrow Keys to change active image
    document.addEventListener('keydown', handleDocKeyDown);

    // Handle Touch Events for Swipe Left/Right
    overlay.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    overlay.addEventListener('touchend', (e) => {
        var curX = e.changedTouches[0].screenX;
        if (curX > touchStartX) {
            changeImage('left');
        } else if (curX < touchStartX) {
            changeImage('right');
        }
    });
}

function handleDocKeyDown(e) {
    switch (e.key) {
        case 'ArrowLeft':
            changeImage('left');
            break;
        case 'ArrowRight':
            changeImage('right');
            break;
        case 'Escape':
            hideOverlay();
            break;
    }
}

// Called from overlay click and escape key
function hideOverlay() {
    overlay.parentNode.removeChild(overlay);
    overlayImg = null;
    overlay = null;
    document.removeEventListener('keydown', handleDocKeyDown);
    document.querySelector('body').classList.remove('blur');
}

// Preload Images when viewing a larger image from a thumbnail.
// This makes viewing the next left or right image must faster.
function preloadNextImages() {
    // Image to the Left of the Current Image
    let indexLeft = imageIndex - 1;
    if (indexLeft === -1) {
        indexLeft = imageCount - 1;
    }
    if (indexLeft !== imageIndex) {
        // This causes the browser to download the image in the
        // background where it will be cached by the browser.
        const imgLeft = new Image();
        imgLeft.src = images[indexLeft].getAttribute('image');
    }

    // Image to the Right of the Current Image
    let indexRight = imageIndex + 1;
    if (indexRight === imageCount) {
        indexRight = 0;
    }
    if (indexRight !== imageIndex) {
        const imgRight = new Image();
        imgRight.src = images[indexRight].getAttribute('image');
    }
}

// Change overlay image when user presses left/right or swipes on mobile
function changeImage(direction) {
    if (direction === 'right') {
        imageIndex = (imageIndex === imageCount - 1 ? 0 : imageIndex + 1);
    } else {
        imageIndex = (imageIndex === 0 ? imageCount - 1 : imageIndex - 1);
    }
    overlayImg.src = images[imageIndex].getAttribute('image');
    preloadNextImages();
}

/**
 * Define the <image-gallery> element
 */
window.customElements.define('image-gallery', class ImageGallery extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        this.addEventListener('click', this.handleClick);
    }

    handleClick() {
        if (this.getAttribute('image') === null) {
            console.error('Unable to view large image because <image-gallery> attribute [image] is missing.');
            return;
        }
        images = document.querySelectorAll('image-gallery[image]');
        imageIndex = Array.from(images).indexOf(this);
        imageCount = images.length;
        showOverlay();
    }
});
