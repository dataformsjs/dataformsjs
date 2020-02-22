"use strict";

if (window.exports === undefined) { window.exports = window; }
if (window.React === undefined && window.preact !== undefined) { var React = window.preact; }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var PolyfillService = function (_React$Component) {
  _inherits(PolyfillService, _React$Component);

  function PolyfillService(props) {
    var _this;

    _classCallCheck(this, PolyfillService);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(PolyfillService).call(this, props));
    console.warn('The <PolyfillService> Component/Class is being depreciated and will be removed in a future release of DataFormsJS. Features of this class are now replaced by [jsxLoader.js] and <LazyLoad>.');
    _this.state = {
      isReady: false
    };
    return _this;
  }

  _createClass(PolyfillService, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var condition = Array.from && window.Promise && window.fetch ? true : false;
      var url = 'https://polyfill.io/v3/polyfill.min.js?features=Array.from,Array.isArray,Object.assign,URL,fetch,Promise,Promise.prototype.finally,String.prototype.endsWith,String.prototype.startsWith,String.prototype.includes,String.prototype.repeat';
      this.loadScript(condition, url, function () {
        _this2.setState({
          isReady: true
        });
      });
    }
  }, {
    key: "loadScript",
    value: function loadScript(condition, url, callback) {
      function dowloadScript(success, error) {
        var script = document.createElement('script');

        script.onload = function () {
          success();
        };

        script.onerror = function () {
          console.error('Error loading Script: ' + url);
          error();
        };

        script.src = url;
        document.head.appendChild(script);
      }

      if (condition === false || condition === undefined) {
        if (callback === undefined) {
          return new Promise(function (resolve, reject) {
            dowloadScript(resolve, reject);
          });
        }

        dowloadScript(callback, callback);
      } else {
        if (callback === undefined) {
          return new Promise(function (resolve) {
            resolve();
          });
        }

        callback();
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.state.isReady) {
        return null;
      }

      return this.props.children;
    }
  }]);

  return PolyfillService;
}(React.Component);

exports.default = PolyfillService;