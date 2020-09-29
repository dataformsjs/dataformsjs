/**
 * DataFormsJS <image-gallery> Web Component
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
 *      - Fully works from Desktop Keyboard. If using [tabindex] so
 *        thumbnails can be selected a spacebar can be used to open the
 *        gallery and Left/Right/Escape Keys can be used for navigation.
 *    - Displays [title] of the image with index by default.
 *      [title] is not required and index can be hidden through
 *      CSS if desired. If [title] is not included and a child <img>
 *      element with an [alt] attribute is used then the [alt] text
 *      will be used as the overlay title.
 *    - Displays a loading indicator if an image takes longer than
 *      2 seconds to load. The text and timeout can be changed
 *      by setting attributes [loading-text] and [loading-timeout].
 *    - Supports next-gen image formats AVIF and WebP by using optional
 *      attributes [image-avif] and [image-webp]. When using next-gen
 *      image formats a default/fallback [image] must be included
 *      similar to how the HTML <picture> element works.
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
 *         <img src="thumbnail1.jpg" alt="image title">
 *         <div>...</div>
 *     </image-gallery>
 *     <image-gallery
 *         image="large-image2.jpg"
 *         title="image title"
 *         style="background-image: url('thumbnail2.jpg');">
 *     </image-gallery>
 *     <image-gallery
 *         image="large-image3.jpg"
 *         image-avif="large-image3.avif"
 *         image-avif="large-image3.webp">
 *             <img src="thumbnail3.jpg" alt="image title">
 *     </image-gallery>
 *
 * Similar functionality exists for the standard DataFormsJS Framework
 * with the `js/plugins/imageGallery.js` plugin and also for React
 * with the `js/react/es6/ImageGallery.js` Component.
 *
 * Online Example:
 *     https://www.dataformsjs.com/examples/image-gallery-web.htm
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
const svgForwardButton = '<svg width="13" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M3.4.6L12 9c.4.4.6 1 .6 1.5a2 2 0 01-.6 1.5l-8.5 8.5a2 2 0 01-2.8-2.8l7.2-7.2L.6 3.4A2 2 0 013.4.6z" fill="#fff" fill-rule="evenodd"/></svg>';
const svgBackButton = '<svg width="13" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M9 .6L.7 9a2 2 0 00-.6 1.5c0 .5.2 1.1.6 1.5L9 20.6a2 2 0 002.8-2.8l-7.2-7.2L12 3.4A2 2 0 009.1.6z" fill="#fff" fill-rule="evenodd"/></svg>';
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
    }
    .image-gallery-overlay .btn-previous { left: 0; background-position-x: 12px; background-image: url("data:image/svg+xml;base64,${btoa(svgBackButton)}"); }
    .image-gallery-overlay .btn-next { right: 0; background-position-x: 15px; background-image: url("data:image/svg+xml;base64,${btoa(svgForwardButton)}"); }

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
`;

/**
 * Use passive events for 'touchstart' based on Chrome DevTools Recommendation
 * https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 */
let supportsPassive = false;
try {
    const opts = Object.defineProperty({}, 'passive', {
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
 * Define module-level variables and functions used when viewing images
 */
let images = null;
let imageIndex = null;
let imageCount = 0;
let overlay = null;
let overlayImg = null;
let overlayTitle = null;
let overlayIndex = null;
let overlayLoading = null;
let overlayBackButton = null;
let overlayFowardButton = null;
let touchStartX = null;
let loadingTimeoutId = null;
const defaultLoadingText = 'Loading...'; // Message to show if image takes a while to load
const defaultLoadingTimeout = 2000; // Delay for loading message in milliseconds (thousandths of a second)
const loadedImages = new Set();
const isMobile = (() => { // This is set only once when the script is first loaded
    const ua = window.navigator.userAgent.toLowerCase();
    return (ua.indexOf('android') > -1 || ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1);
})();
let startedFromKeyboard = false;
let supportsAvif = null;
let supportsWebp = null;

/**
 * Check browser support for next-gen image formats (AVIF and WebP).
 * A one-pixel JPG was converted to each format and is used to
 * determine browser support.
 */
function checkSupportedFormats() {
    // Image format only needs to be checked one time
    // when the overlay is first used on a page.
    if (supportsAvif !== null && supportsWebp !== null) {
        showOverlay();
        return;
    }

    // Checks for both AVIF and WebP run at the same time.
    // Once both complete then show the overlay.
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

function showOverlay() {
    const imageSrc = getImage(images[imageIndex]);
    const imageTitle = getImageTitle(images[imageIndex]);
    const loadingText = images[imageIndex].getAttribute('loading-text');
    loadCss();

    // Overlay <div> root element
    overlay = document.createElement('div');
    overlay.className = 'image-gallery-overlay' + (isMobile ? ' mobile' : '') + (startedFromKeyboard ? ' keyboard' : '');

    // Add <span> for loading indicator which is hidden
    // by default unless image takes a while to load.
    overlayLoading = document.createElement('span');
    overlayLoading.className = 'image-gallery-loading';
    overlayLoading.textContent = (loadingText ? loadingText : defaultLoadingText);
    overlayLoading.setAttribute('hidden', '');
    overlay.appendChild(overlayLoading);

    // Add [Back] and [Forward] Buttons
    overlayBackButton = document.createElement('span');
    overlayBackButton.className = 'btn-previous';
    overlayBackButton.setAttribute('role', 'button');
    overlayBackButton.onclick = () => { changeImage('left'); };
    overlayFowardButton = document.createElement('span');
    overlayFowardButton.className = 'btn-next';
    overlayFowardButton.setAttribute('role', 'button');
    overlayFowardButton.onclick = () => { changeImage('right'); };
    overlay.appendChild(overlayBackButton);
    overlay.appendChild(overlayFowardButton);

    // Overlay <img>
    overlayImg = document.createElement('img');
    overlayImg.addEventListener('load', () => {
        loadedImages.add(imageSrc);
        clearLoadingTimer();
        if (overlayLoading !== null) {
            overlayLoading.setAttribute('hidden', '');
        }
        preloadNextImages();
    });
    overlayImg.src = imageSrc;
    overlay.appendChild(overlayImg);

    // Overlay <div> for title and index
    const container = document.createElement('div');
    overlayTitle = document.createElement('span');
    overlayTitle.textContent = imageTitle;
    overlayTitle.style.display = (imageTitle ? '' : 'none');
    container.appendChild(overlayTitle);
    overlayIndex = document.createElement('span');
    overlayIndex.textContent = `${imageIndex + 1}/${imageCount}`;
    container.appendChild(overlayIndex);
    overlay.appendChild(container);

    // Define events and add Overlay to DOM
    addOverlayEvents();
    document.documentElement.appendChild(overlay);
    document.querySelector('body').classList.add('blur');
    startLoadingTimer();
}

function getImage(el) {
    let url = el.getAttribute('image-avif');
    if (url && supportsAvif) {
        return url;
    }
    url = el.getAttribute('image-webp');
    if (url && supportsWebp) {
        return url;
    }
    return el.getAttribute('image');
}

// Returns title to use on the overlay from either <image-gallery title="{title}">
// or <image-gallery><img alt="{title">
function getImageTitle(el) {
    let imageTitle = el.getAttribute('title');
    if (imageTitle === null) {
        const img = el.querySelector('img[alt]');
        if (img) {
            imageTitle = img.getAttribute('alt');
        }
    }
    return imageTitle;
}

// Show the loading indicator if the image takes a while to load
function startLoadingTimer() {
    clearLoadingTimer();

    const loadingTimeout = images[imageIndex].getAttribute('loading-timeout');
    const timeout = (loadingTimeout === null ? defaultLoadingTimeout : parseInt(loadingTimeout, 10));

    loadingTimeoutId = window.setTimeout(function () {
        loadingTimeoutId = null;
        if (overlayLoading === null) {
            return;
        }
        overlayLoading.removeAttribute('hidden');
    }, timeout);
}

function clearLoadingTimer() {
    if (loadingTimeoutId !== null) {
        window.clearTimeout(loadingTimeoutId);
        loadingTimeoutId = null;
    }
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
    // Hide overlay on click. For mobile devices if the user "clicks/touches"
    // in the middle half of the screen then do not hide the overlay. This
    // prevents the overlay from hiding while the user is swiping. Without
    // this code the swipe logic still works on mobile, however the overlay
    // closes occasionally which causes an unexpected experience for the user.
    overlay.onclick = function(e) {
        if ('ontouchstart' in window) {
            const screenHeight = window.innerHeight;
            const screen25pct = screenHeight / 4;
            const screenBottom = screenHeight - screen25pct;
            if (e.clientY >= screen25pct && e.clientY <= screenBottom) {
                return;
            }
        }
        // Don't hide if user clicked [Back] or [Forward] buttons
        if (e.target === overlayBackButton || e.target === overlayFowardButton) {
            return;
        }
        hideOverlay();
    };

    // Handle Right and Left Arrow Keys to change active image
    document.addEventListener('keydown', handleDocKeyDown);

    // Handle Touch Events for Swipe Left/Right
    overlay.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, supportsPassive ? { passive: true } : false);
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
    clearLoadingTimer();
    overlay.parentNode.removeChild(overlay);
    overlayBackButton = null;
    overlayFowardButton = null;
    overlayLoading = null;
    overlayIndex = null;
    overlayTitle = null;
    overlayImg = null;
    overlay = null;
    startedFromKeyboard = false;
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
        // This assumes that a CDN or cache headers are used by the
        // server to allow the browser to cache images. For 99%+ of
        // servers this will be the case.
        const srcLeft = getImage(images[indexLeft]);
        if (srcLeft && !loadedImages.has(srcLeft)) {
            const imgLeft = new Image();
            imgLeft.onload = () => { loadedImages.add(srcLeft); };
            imgLeft.src = srcLeft;
        }
    }

    // Image to the Right of the Current Image
    let indexRight = imageIndex + 1;
    if (indexRight === imageCount) {
        indexRight = 0;
    }
    if (indexRight !== imageIndex) {
        const srcRight = getImage(images[indexRight]);
        if (srcRight && !loadedImages.has(srcRight)) {
            const imgRight = new Image();
            imgRight.onload = () => { loadedImages.add(srcRight); };
            imgRight.src = srcRight;
        }
    }
}

// Change overlay image when user presses left/right or swipes on mobile
function changeImage(direction) {
    if (direction === 'right') {
        imageIndex = (imageIndex === imageCount - 1 ? 0 : imageIndex + 1);
    } else {
        imageIndex = (imageIndex === 0 ? imageCount - 1 : imageIndex - 1);
    }
    const imageTitle = getImageTitle(images[imageIndex]);
    overlayImg.src = '';
    overlayImg.src = getImage(images[imageIndex]);
    overlayTitle.textContent = imageTitle;
    overlayTitle.style.display = (imageTitle ? '' : 'none');
    overlayIndex.textContent = `${imageIndex + 1}/${imageCount}`;
    startLoadingTimer();
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
        this.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(e) {
        if (e.key === ' ') {
            // If using [tabindex] the keyboard will still be focused on the last image
            // if the gallery was opened using the keyboard; so make sure overlay is
            // currently not displayed.
            if (overlay === null) {
                startedFromKeyboard = true;
                this.handleClick();
            }
            // Prevent scroll to next element with [tabindex]
            e.preventDefault();
        }
    }

    handleClick() {
        if (this.getAttribute('image') === null) {
            console.error('Unable to view large image because <image-gallery> attribute [image] is missing.');
            return;
        }
        images = document.querySelectorAll('image-gallery[image]');
        imageIndex = Array.from(images).indexOf(this);
        imageCount = images.length;
        checkSupportedFormats();
    }
});
