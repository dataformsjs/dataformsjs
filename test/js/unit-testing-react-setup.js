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

        // If `jsxLoader` is being used check if the spread syntax is support
        // because not all modern browsers support it. If not supported show
        // a helpful warning to the user.
        if (jsxLoader.isSupportedBrowser) {
            try {
                new Function('"use strict"; const { id, ...other } = { id:123, test:456 };')();
            } catch (e) {
                var warningSpreadSyntax = document.querySelector('.browser-warnings .spread-syntax');
                warningSpreadSyntax.textContent = 'This browser does not support the spread syntax [...props] so some tests are expected to fail.';
                warningSpreadSyntax.style.display = '';
            }
        }

        // Run Tests
        mocha.run();
    }, 100);
});