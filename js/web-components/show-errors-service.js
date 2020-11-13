/**
 * DataFormsJS <show-errors-service> Web Component
 *
 * This service adds a global event listener for 'error' to the window object.
 * When scripts trigger an error it will result in them being displayed
 * in an alert at the top of the page. Each alert has a close button so the
 * user can close them, however it can help during development for users
 * who have the ability to send print screens or for developers to view errors.
 *
 * When using the DataFormsJS Framework this is handled by using: <html data-show-errors>
 *
 * Usage: <show-errors-service></show-errors-service>
 */

import { WebComponentService } from './WebComponentService.js';
import { showErrorAlert } from './utils.js';

/**
 * Private function used to handle global errors.
 * Code modified from:
 *     https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
 *
 * @param {ErrorEvent} errorEvent
 */
function errorHandler(errorEvent) {
    // Current Time
    const now = (new Date());
    const time = ('toLocaleString' in now ? now.toLocaleString() : now.toString());

    // Build and Show Message
    let message;
    if (errorEvent.message.toLowerCase().indexOf('script error') > -1){
        message = 'Script Error at ' + time + ': See Browser Console for Detail';
    } else {
        message = [
            'Message: [' + errorEvent.message + ']',
            'Time: [' + time + ']',
            'URL: [' + errorEvent.filename + ']',
            'Line: ' + errorEvent.lineno,
            'Column: ' + errorEvent.colno,
            'Error Object: ' + JSON.stringify(errorEvent.error)
        ].join(' - ');
    }
    showErrorAlert(message);
    console.error(errorEvent);
}

/**
 * Define the <show-errors-service> element
 */
window.customElements.define('show-errors-service', class ShowErrorsService extends WebComponentService {
    onLoad() {
        // Note - this may get called many on SPA sites however because
        // a named function is used over an anonymous function only 1
        // event ever gets added.
        window.addEventListener('error', errorHandler);
    }
    onEnd() {
        window.removeEventListener('error', errorHandler);
    }
});
