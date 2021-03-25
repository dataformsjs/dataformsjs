document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    var callCount = 0;
    var interval = window.setInterval(function() {
        // Prevent fatal development errors from calling timeout over and over.
        // Otherwise the browser can hang from a large number of quick calls to `window.setInterval()`.
        callCount++;
        if (callCount > 20) {
            window.clearInterval(interval);
            var error = 'Unexpected error loading scripts, check DevTools';
            var root = document.getElementById('root');
            root.textContent = error;
            root.className = 'error';
            root.style.display = '';
            throw new Error(error);
        }

        // Wait until [jsxLoader.js] has finished loading all files
        if (jsxLoader.hasPendingScripts()) {
            return;
        }

        // Show compiler options that were used
        window.clearInterval(interval);
        var library = (window.preact !== undefined ? ' (Preact)' : '');
        document.querySelector('#compile-type strong').textContent = (jsxLoader.isSupportedBrowser ? 'jsxLoader' : 'Babel') + library;
        if (jsxLoader.needsPolyfill) {
            document.getElementById('polyfill-status').style.display = '';
        }

        // Run Tests
        mocha.run();
    }, 100);
});