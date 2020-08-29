/**
 * DataFormJS [modalAlert] Plugin
 *
 * This plugin shows a simple modal alert that the user can click to hide. 
 * The optional attribute [data-show-every] can be used to control how
 * often the modal should be displayed when a page is loaded; settings
 * for the display interval are saved to localStorage.
 * 
 * In order for this to work an element with [class="modal-content"]
 * needs to exist on the page and the content should contain a [hidden]
 * attribute so that it does not show on the regular page. The app
 * calling this needs to define the style for the modal content through CSS.
 *
 * Example Usage:
 *     <style>
 *         .modal-overlay .modal-content {
 *             background-color: black;
 *             padding: 40px 80px;
 *             color: white;
 *             font-size: 1.5em;
 *         }
 *     </style>
 *     <div class="modal-content"
 *         hidden
 *         data-show-every="1 day">
 *         50% OFF SITEWIDE + FREE SHIPPING ON ALL U.S. ORDERS
 *     </div>
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

    var modalAlert = {
        // Internal property, references an element if
        // the modal is displayed.
        overlay: null,

        /**
         * CSS for the Modal Overlay
         * This can be overwritten if needed before the plugin runs:
         *    app.plugins.modalAlert.modalStyleCss = '...';
         */
        modalStyleId: 'modal-overlay-css',
        modalStyleCss: [
            '.modal-overlay {',
            '    position: fixed;',
            '    top: 0;',
            '    left: 0;',
            '    right: 0;',
            '    bottom: 0;',
            '    background-color: rgba(255,255,255,0.5);',
            '    cursor: pointer;',
            '    display: flex;',
            '    justify-content: center;',
            '    align-items: center;',
            '    flex-direction: column;',
            '    z-index: 99999;',
            '}',
        ].join('\n'),

        /**
         * Show modal content when route is loaded (optional depending on settings)
         */
        onRendered: function () {
            // Does a [class="model-content"] element exist on the page
            var modalContent = document.querySelector('.modal-content');
            if (!modalContent) {
                return;
            }

            // If it has a [data-hide-on-page-load] attribute then the app
            // will manually handle showing it by calling `app.plugins.modalAlert.showModal()`
            if (modalContent.getAttribute('data-hide-on-page-load') !== null) {
                return;
            }

            var text = modalContent.getAttribute('data-show-every');
            if (text) {
                var interval = this.textToInterval(text);
                var now = (new Date()).getTime();
                var lastViewed = window.localStorage.getItem('modal-content-last-viewed');
                if (lastViewed !== null) {
                    if (now < parseInt(lastViewed, 10) + interval) {
                        return;
                    }
                }
                window.localStorage.setItem('modal-content-last-viewed', now);
            }

            // Show the overlay
            this.showModal();
        },

        /**
         * Hide Modal when page is being unloaded
         */
        onRouteUnload: function () {
            this.hideModal();
        },

        /**
         * Simple text to interval conversion, works only with
         * time ranges in a single duration [second, minutes, hours, days]
         * 
         * Examples:
         *    '30 seconds'
         *    '1 MINUTE'
         *    '12 Hours'
         *    '1 day'
         */
        textToInterval: function (text) {
            var m = text.match(/^(\d+) second(s?)$/i);
            if (m) {
                return parseInt(m[1], 10) * 1000;
            }

            m = text.match(/^(\d+) minute(s?)$/i);
            if (m) {
                return parseInt(m[1], 10) * 60 * 1000;
            }

            m = text.match(/^(\d+) hour(s?)$/i);
            if (m) {
                return parseInt(m[1], 10) * 60 * 60 * 1000;
            }

            m = text.match(/^(\d+) day(s?)$/i);
            if (m) {
                console.log('matched days');
                console.log(m);
                return parseInt(m[1], 10) * 24 * 60 * 60 * 1000;
            }

            console.warn('Text could not be parsed by [app.plugins.modalAlert.textToInterval()]: ' + text);
            return 0;
        },

        /**
         * Show the Modal Dialog
         */
        showModal: function () {
            var modalContent = document.querySelector('.modal-content');
            if (modalContent === null || this.overlay !== null) {
                return;
            }

            app.loadCss(this.modalStyleId, this.modalStyleCss);

            this.overlay = document.createElement('div');
            this.overlay.className = 'modal-overlay';
            this.overlay.onclick = this.hideModal.bind(this);

            var content = modalContent.cloneNode(true);
            content.removeAttribute('hidden');
            this.overlay.appendChild(content);

            document.documentElement.appendChild(this.overlay);
        },

        /**
         * Hide the Modal Dialog if one exists on the page
         */
        hideModal: function () {
            if (this.overlay !== null) {
                document.documentElement.removeChild(this.overlay);
                this.overlay = null;
            }
        },
    };

    app.addPlugin('modalAlert', modalAlert);
})();
