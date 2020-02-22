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

var LazyLoad = function (_React$Component) {
  _inherits(LazyLoad, _React$Component);

  function LazyLoad(props) {
    var _this;

    _classCallCheck(this, LazyLoad);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(LazyLoad).call(this, props));
    _this.state = {
      isReady: false
    };
    return _this;
  }

  _createClass(LazyLoad, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      this.loadScripts(this.props.scripts, this.props.loadScriptsInOrder).then(function () {
        _this2.setState({
          isReady: true
        });
      });
    }
  }, {
    key: "loadScripts",
    value: function loadScripts(urls, loadScriptsInOrder) {
      function loadCss(url) {
        return new Promise(function (resolve) {
          var links = document.querySelectorAll('link');

          for (var n = 0, m = links.length; n < m; n++) {
            if (links[n].rel === 'stylesheet' && links[n].getAttribute('href') === url) {
              resolve();
              return;
            }
          }

          var link = document.createElement('link');
          link.rel = 'stylesheet';
          link.onload = resolve;

          link.onerror = function () {
            console.error('Error loading CSS File: ' + url);
            resolve();
          };

          link.href = url;
          document.head.appendChild(link);
        });
      }

      function loadJs(url) {
        return new Promise(function (resolve) {
          var scripts = document.querySelectorAll('script');

          for (var n = 0, m = scripts.length; n < m; n++) {
            if (scripts[n].getAttribute('src') === url) {
              resolve();
              return;
            }
          }

          var script = document.createElement('script');
          script.onload = resolve;

          script.onerror = function () {
            console.error('Error loading JS File: ' + url);
            resolve();
          };

          script.src = url;
          document.head.appendChild(script);
        });
      }

      function loadJsx(url) {
        return new Promise(function (resolve) {
          var scripts = document.querySelectorAll('script[data-src][data-compiler]');

          for (var n = 0, m = scripts.length; n < m; n++) {
            if (scripts[n].getAttribute('data-src') === url) {
              resolve();
              return;
            }
          }

          var script = document.createElement('script');
          script.type = 'text/babel';
          script.setAttribute('src', url);
          document.head.appendChild(script);
          jsxLoader.loadScript(script).then(function () {
            resolve();
          });
        });
      }

      if (typeof urls === 'string') {
        urls = [urls];
      } else if (!Array.isArray(urls)) {
        console.error('Invalid prop for <LazyLoad>, expected [scripts] to be a string or an array of strings. Check console.');
        console.log(urls);
        return new Promise(function (resolve) {
          resolve();
        });
      }

      if (loadScriptsInOrder === true) {
        return new Promise(function (resolve) {
          var current = 0;
          var count = urls.length;

          function nextPromise() {
            if (current === count) {
              resolve();
              return;
            }

            var url = urls[current];
            current++;

            if (url.endsWith('.js')) {
              loadJs(url).then(nextPromise);
            } else if (url.endsWith('.css')) {
              loadCss(url).then(nextPromise);
            } else if (url.endsWith('.jsx')) {
              loadJsx(url).then(nextPromise);
            } else {
              console.error('Invalid Script for <LazyLoad>. Only scripts ending with [js, css, or jsx] can be used. Error URL: ' + url);
              nextPromise();
            }
          }

          nextPromise();
        });
      }

      return new Promise(function (resolve) {
        var promises = [];

        for (var n = 0, m = urls.length; n < m; n++) {
          var url = urls[n];

          if (url.endsWith('.js')) {
            promises.push(loadJs(url));
          } else if (url.endsWith('.css')) {
            promises.push(loadCss(url));
          } else if (url.endsWith('.jsx')) {
            promises.push(loadJsx(url));
          } else {
            console.error('Invalid Script for <LazyLoad>. Only scripts ending with [js, css, or jsx] can be used. Error URL: ' + url);
          }
        }

        Promise.all(promises).then(function () {
          resolve();
        });
      });
    }
  }, {
    key: "loadPolyfill",
    value: function loadPolyfill(condition, url) {
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
        return new Promise(function (resolve, reject) {
          dowloadScript(resolve, reject);
        });
      } else {
        return new Promise(function (resolve) {
          resolve();
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.state.isReady) {
        if (this.props.isLoading) {
          return this.props.isLoading;
        }

        return null;
      }

      if (this.props.children) {
        return this.props.children;
      }

      if (this.props.isLoaded) {
        if (typeof this.props.isLoaded === 'string') {
          var component = this.props.isLoaded;
          var elProps = {};

          for (var prop in this.props) {
            if (this.props.hasOwnProperty(prop) && prop !== 'scripts' && prop !== 'isLoaded' && prop !== 'isLoading') {
              elProps[prop] = this.props[prop];
            }
          }

          if (window !== undefined && window[component] !== undefined) {
            return React.createElement(window[component], elProps);
          } else if (globalThis !== undefined && globalThis[component] !== undefined) {
            return React.createElement(globalThis[component], elProps);
          } else {
            throw new TypeError('Component <LazyLoad isLoaded=' + JSON.stringify(component) + '> was not found. Check if your script is missing or has a compile error.');
          }
        }

        return this.props.isLoaded;
      }

      throw new TypeError('Missing child nodes or the [isLoaded] property for a <LazyLoad> element.');
    }
  }]);

  return LazyLoad;
}(React.Component);

exports.default = LazyLoad;