/**
 * DataFormsJS <html-import-service> Web Component
 *
 * This service looks for all elements on the page that have either
 * [data-template-id] or [data-template-url] HTML attributes and then
 * it will download the HTML if needed, get it from a <template> or
 * <script type="text/x-template"> on the page and show it in the element.
 *
 * For templates from a web service they are downloaded only once and cached in memory.
 *
 * HTML Example:
 *     <html-import-service></html-import-service>
 *     <div data-template-url="html-to-download.html"></div>
 *     <div data-template-id="loading-screen"></div>
 *
 * This service was designed to provide compatibility and similar behavior
 * with the standard DataFormsJS Framework "HTML Control" functions:
 *     app.refreshAllHtmlControls()
 *     app.refreshHtmlControl()
 *
 * Because behavior is similar these functions can be called with a similar API:
 *     const importService = document.querySelector('html-import-service');
 *     importService.refreshAllHtmlControls()
 *     importService.refreshAllHtmlControls(callback)
 *     importService.refreshHtmlControl(element)
 *     importService.refreshHtmlControl(element, callback)
 */

/* Validates with both [eslint] and [jshint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */
/* jshint esversion:8 */
/* jshint evil: true */

import { WebComponentService } from './WebComponentService.js';
import { showError } from './utils.js';

const cachedTemplates = [];

/**
 * Define <html-import-service> element
 */
window.customElements.define('html-import-service', class HtmlImportService extends WebComponentService {
    /**
     * WebComponentService Event
     * @param {HTMLElement} element
     */
    onLoad(element) {
        if (element === this) {
            return;
        }
        this.refreshAllHtmlControls();
    }

    /**
     * Async function to refresh all elements in the current view that have
     * the attribute [data-template-id] or [data-template-url]. These elements
     * reference another template embedded in the page if using the attribute
     * [data-template-id] or for download if using [data-template-url].
     *
     * Elements can be deeply nested and this function will handle them.
     *
     * @param {function} callback
     */
    refreshAllHtmlControls(callback) {
        // Get the current time which will be assigned to an attribute of the control elements
        const timeUpdated = String((new Date()).getTime());
        const service = this;

        // This selector is looking for elements containing either attribute [data-template-id]
        // or [data-template-url] and not including items that have already been processed and
        // assigned the attribute [data-updated-at] with the current time value.
        const selector = `[data-template-id]:not([data-updated-at="${timeUpdated}"]),[data-template-url]:not([data-updated-at="${timeUpdated}"])`;

        // Recursive function that refreshes each control one at a time until all controls
        // have been processed. Then if a callback function is defined it gets called.
        // This function does not contain a standard for/while/do loop, however the
        // behavior of the code is using loop-like logic.
        function renderControl(control) {
            // If control equals null then there are no controls remaining to process
            if (control === null) {
                service.dispatchEvent(new Event('app:contentReady', { bubbles: true }));
                if (callback) {
                    callback(timeUpdated);
                }
            } else {
                // Call the asynchronous function `refreshHtmlControl()` and once
                // it completes add the attribute [data-updated-at] to the element
                // with the time updated so the control is not processed again.
                // Then make the recursive call looking for the next control element.
                try {
                    service.refreshHtmlControl(control, function () {
                        control.setAttribute('data-updated-at', timeUpdated);
                        renderControl(document.querySelector(selector));
                    });
                } catch (e) {
                    control.setAttribute('data-updated-at', timeUpdated);
                    renderControl(document.querySelector(selector));
                }
            }
        }

        // Look for the first matching control element.
        renderControl(document.querySelector(selector));
    }

    /**
     * Async function to refresh a single element in the current view that has the
     * attribute [data-template-id] or [data-template-url]. The attribute value will
     * reference a template. This can be used by app logic to reset a specific element
     * on the page, however in general most apps would not need to ever call this.
     *
     * For the original DataFormsJS Framework with Handlebars this function allowed
     * for a portion of the page to be re-rendered however web components generally
     * do not render and instead handle their own state.
     *
     * @param {HTMLElement} element
     * @param {function|undefined} callback
     */
    refreshHtmlControl(element, callback) {
        try {
            // Verify that control is a string or HTML Element
            const isString = (typeof element === 'string');
            const isElement = (element instanceof HTMLElement);
            if (!isString && !isElement) {
                throw new TypeError('Invalid type for parameter [element] in the function [refreshHtmlControl()]: ' + typeof element);
            }

            // Get the control if only the id was passed
            if (isString) {
                const id = element;
                element = document.getElementById(id);
                if (element === null) {
                    throw new TypeError('Element not found for [' + id + '] when the function [refreshHtmlControl()] was called.');
                }
            }

            // Validate that if defined callback is a function
            if (!(callback === undefined || typeof callback === 'function')) {
                throw new TypeError('[callback] was not defined as a [function] when the [refreshHtmlControl()] was called');
            }

            // Get the template id or url and validate that only one property is set.
            // If either of these checks fail then the template will not be cached.
            const templateId = element.getAttribute('data-template-id');
            const templateUrl = element.getAttribute('data-template-url');
            if (templateId !== null && templateUrl !== null) {
                throw new TypeError('An element must have only one of the template attribute defined; either [data-template-id] or [data-template-url]. Both attributes are defined on this element.');
            } else if (templateId === null && templateUrl === null) {
                throw new TypeError('An element must have either attribute [data-template-id] or [data-template-url]. Niether attribute is defined for this element.');
            }

            // Download or get template from cache, then set HTML
            this.downloadTemplate(element, function (template) {
                if (template.error) {
                    showError(element, template.errorMessage);
                } else {
                    if (element.getAttribute('data-set-text-content') === null) {
                        element.innerHTML = template.html;
                    } else {
                        element.textContent = template.html;
                    }
                }
                if (callback !== undefined) {
                    callback();
                }
            });
        } catch (e) {
            // If there is an error (usually a parsing error during development)
            // then show the message on the control and re-throw the error.
            console.error(e);
            if (element !== null && element instanceof HTMLElement) {
                // If a HTML Element then get the attributes [data-template-id]
                // and [data-template-url]
                let attrId = element.getAttribute('data-template-id');
                let attrUrl = element.getAttribute('data-template-url');
                attrId = (attrId === null ? '' : ' data-template-id="' + attrId + '"');
                attrUrl = (attrUrl === null ? '' : ' data-template-url="' + attrUrl + '"');

                // Include [id] and [class] attributes along with the relevant data attributes.
                let errorMessage = 'Error with Element <' + element.tagName.toLowerCase();
                errorMessage += ' id="' + element.id + '"';
                errorMessage += ' class="' + element.className + '"';
                errorMessage += attrId + attrUrl + '> - ';
                showError(element, errorMessage + e.message);
            }
            throw e;
        }
    }

    /**
     * Read or download and then cache a template.
     *
     * @param {HTMLElement|null} element    Element where the template was called from
     * @param {function} callback           Callback function(template) that gets called once the template is available
     */
    downloadTemplate(element, callback) {
        // First check the template cache in case it has already been cached
        const templateId = element.getAttribute('data-template-id');
        const templateUrl = element.getAttribute('data-template-url');
        for (let n = 0, m = cachedTemplates.length; n < m; n++) {
            if (templateId !== null && cachedTemplates[n].id === templateId) {
                callback(cachedTemplates[n]);
                return;
            } else if (templateUrl !== null && cachedTemplates[n].url === templateUrl) {
                callback(cachedTemplates[n]);
                return;
            }
        }

        // If the template was not found from cached array,
        // download or get it and add it to cachedTemplates.
        let scriptUrl, script;
        if (templateUrl !== null) {
            scriptUrl = templateUrl;
        } else {
            script = document.getElementById(templateId);
            if (script === null) {
                const errorMessage = 'Script Tag for Template ID [' + templateId + '] does not exist.';
                this.callback(this.addTemplate(templateId, templateUrl, null, true, errorMessage));
                return;
            }
            scriptUrl = (script.src ? script.src : script.getAttribute('data-src'));
        }

        if (scriptUrl !== null && scriptUrl !== '') {
            // Make the Request to get the Template then add to cache
            fetch(scriptUrl)
            .then(response => { return response.text(); })
            .then(text => { callback(this.addTemplate(templateId, templateUrl, text)); })
            .catch(error => {
                const errorMessage = 'Error Downloading Template: [' + scriptUrl + '], Error: ' + error;
                callback(this.addTemplate(templateId, templateUrl, null, true, errorMessage));
            });
        } else {
            // This source of this template is inline in the HTML of the page
            callback(this.addTemplate(templateId, templateUrl, script.innerHTML));
        }
    }

    /**
     * Add a template to the cachedTemplates Array.
     *
     * @param {string|null} templateId
     * @param {string|null} templateUrl
     * @param {string|null} html
     * @param {bool} isError
     * @param {string} errorMessage
     * @return {object}
     */
    addTemplate(templateId, templateUrl, html, isError = false, errorMessage = null) {
        const template = {
            id: templateId,
            url: templateUrl,
            html: html,
            error: isError,
            errorMessage: errorMessage,
        };
        cachedTemplates.push(template);
        return template;
    }
});
