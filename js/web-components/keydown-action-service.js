/**
 * DataFormsJS <keydown-action-service> Web Component
 *
 * This "service" looks for elements with the attribute [data-enter-key-click-selector]
 * and allows the [enter] key of the element to trigger a [click()] event on the element
 * specified in the selector.
 *
 * The term "service" is used here because all elements on the page with the
 * attribute will have an event assigned to them so rather than rendering content
 * this Web Component provides a "service" for other elements on the page.
 *
 * Common usage would be for Entry Forms where the {enter} key should perform a
 * default action. For example usage see the Places Demo Search Screen.
 *
 * The DataFormsJS Framework has a corresponding plugin: [js/plugins/keydownAction.js].
 *
 * Example:
 *     <keydown-action-service></keydown-action-service>
 *     <input type="text" data-bind="name" data-enter-key-click-selector="button">
 */

import { WebComponentService } from './WebComponentService.js';

/**
 * Click Event that get's attached to [data-enter-key-click-selector] elements
 *
 * @param {KeyboardEvent} e
 */
function enterToClick(e) {
    if (e.key !== 'Enter') {
        return;
    }
    const selector = e.target.getAttribute('data-enter-key-click-selector');
    if (!selector) {
        return;
    }
    const clickEl = document.querySelector(selector);
    if (!clickEl) {
        return;
    }
    e.preventDefault();
    clickEl.click();
}

/**
 * Add <keydown-action-service> element to the page
 */
window.customElements.define('keydown-action-service', class KeydownActionService extends WebComponentService {
    refresh(rootElement) {
        const elements = rootElement.querySelectorAll('[data-enter-key-click-selector]');
        for (const el of elements) {
            el.addEventListener('keydown', enterToClick);
        }
    }
});
