// This page should only be loaded by older browsers 
// that do not support <script type="module">.
//
// Example usage:
/*
<script type="module" src="../js/web-components/json-data.js"></script>
<script nomodule src="../js/web-components/safari-nomodule.js"></script>
<script nomodule src="../js/web-components/old-browser-warning.js"></script>  
*/
(function() {
    'use strict';
    document.addEventListener('DOMContentLoaded', function() {
        // Error message for user
        var message = 'Thank you for visiting! However some features on this page require a newer Browser or OS than the one that you are currently using. If you have a different browser available then please open this page with it.';

        // Show error
        var div = document.createElement('div');
        div.style.color = '#fff';
        div.style.backgroundColor = '#f00';
        div.style.backgroundImage = 'linear-gradient(#e00, #c00)';
        div.style.boxShadow = '0 1px 5px 0 rgba(0,0,0,.5)';
        div.style.zIndex = '1000000';
        div.style.padding = '20px';
        div.style.fontSize = '1.5em';
        div.style.margin = '20px';
        div.style.position = 'fixed';
        div.style.top = '10px';
        if (div.textContent === undefined) {
            div.innerText = message;
        } else {
            div.textContent = message;
        }
        document.body.appendChild(div);
        console.error(message);        
    });
})();