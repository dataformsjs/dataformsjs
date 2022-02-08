(function () {
"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var CssVars = function () {
  function CssVars() {
    _classCallCheck(this, CssVars);
  }

  _createClass(CssVars, null, [{
    key: "ponyfill",
    value: function ponyfill() {
      var selector = 'link[rel="stylesheet"][data-css-vars-ponyfill]:not([data-css-vars-setup]),style[data-css-vars-ponyfill]:not([data-css-vars-setup])';
      var styleSheets = document.querySelectorAll(selector);

      if (styleSheets.length === 0) {
        return;
      }

      var lazy = new LazyLoad();
      var supportsCssVars = window.CSS && window.CSS.supports && window.CSS.supports('(--a: 0)');
      var polyfillUrl = 'https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2.4.3/dist/css-vars-ponyfill.min.js';
      lazy.loadPolyfill(supportsCssVars, polyfillUrl).then(function () {
        if (window.cssVars) {
          cssVars({
            include: selector
          });
          Array.prototype.forEach.call(styleSheets, function (styleSheet) {
            styleSheet.setAttribute('data-css-vars-setup', '');
          });
        }
      });
    }
  }]);

  return CssVars;
}();

window.CssVars = CssVars;
})();