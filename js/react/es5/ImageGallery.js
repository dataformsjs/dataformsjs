"use strict";

if (window.exports === undefined) { window.exports = window; }
if (window.React === undefined && window.preact !== undefined) { var React = window.preact; }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var _supportsPassive = false;

try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function get() {
      _supportsPassive = true;
      return true;
    }
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (e) {}

function BasicImage(props) {
  return React.createElement('img', {
    src: props.thumbnail,
    alt: props.title,
    onClick: props.onClick
  });
}

var ImageGallery = function (_React$Component) {
  _inherits(ImageGallery, _React$Component);

  var _super = _createSuper(ImageGallery);

  function ImageGallery(props) {
    var _this;

    _classCallCheck(this, ImageGallery);

    _this = _super.call(this, props);
    _this.onClick = _this.onClick.bind(_assertThisInitialized(_this));
    _this.handleDocKeyDown = _this.handleDocKeyDown.bind(_assertThisInitialized(_this));
    _this.preloadNextImages = _this.preloadNextImages.bind(_assertThisInitialized(_this));
    _this.hideOverlay = _this.hideOverlay.bind(_assertThisInitialized(_this));
    _this.changeImage = _this.changeImage.bind(_assertThisInitialized(_this));
    _this.overlayStyleId = 'image-gallery-css';
    _this.overlayStyleCss = "\n            body.blur { filter: blur(3px); }\n\n            .image-gallery-overlay {\n                position: fixed;\n                top: 0;\n                left: 0;\n                right: 0;\n                bottom: 0;\n                background-color: rgba(255,255,255,.8);\n                cursor: pointer;\n                display: flex;\n                justify-content: center;\n                align-items: center;\n                flex-direction: column;\n            }\n\n            .image-gallery-overlay .image-gallery-loading {\n                font-weight: bold;\n                padding: 1em 2em;\n                background-color: rgba(255, 255, 255, .8);\n                position: absolute;\n            }\n\n            .image-gallery-overlay img {\n                max-width: 100%;\n                max-height: 100%;\n                flex-shrink: 0;\n            }\n\n            .image-gallery-overlay div {\n                position: absolute;\n                bottom: 0;\n                left: 0;\n                right: 0;\n                z-index: 2;\n                font-weight: bold;\n                display: flex;\n                justify-content: space-between;\n                width: 100%;\n            }\n\n            .image-gallery-overlay div span {\n                padding: 10px 20px;\n                background-color: rgba(255,255,255,.4);\n            }\n\n            @media (min-width: 1300px) {\n                .image-gallery-overlay div {\n                    left: calc((100% - 1300px) /2);\n                    right: auto;\n                    max-width: 1300px;\n                }\n            }\n        ";
    _this.imageIndex = null;
    _this.overlay = null;
    _this.overlayImg = null;
    _this.overlayTitle = null;
    _this.overlayIndex = null;
    _this.overlayLoading = null;
    _this.touchStartX = null;
    _this.loadingTimeoutId = null;
    _this.loadingText = props.loadingText ? props.loadingText : 'Loading...';
    _this.loadingTimeout = props.loadingTimeout ? props.loadingTimeout : 1000;
    _this.loadedImages = new Set();
    _this.state = {
      images: props.images
    };
    return _this;
  }

  _createClass(ImageGallery, [{
    key: "onClick",
    value: function onClick(e) {
      var url = e.target.src;

      if (!url) {
        url = e.target.getAttribute('data-image');
      }

      this.imageIndex = -1;

      for (var n = 0, m = this.state.images.length; n < m; n++) {
        if (this.state.images[n].thumbnail === url) {
          this.imageIndex = n;
          break;
        }
      }

      this.showOverlay();
    }
  }, {
    key: "loadCss",
    value: function loadCss() {
      var style = document.getElementById(this.overlayStyleId);

      if (style === null) {
        style = document.createElement('style');
        style.id = this.overlayStyleId;
        style.innerHTML = this.overlayStyleCss;
        document.head.appendChild(style);
      }
    }
  }, {
    key: "showOverlay",
    value: function showOverlay() {
      var _this2 = this;

      var imageSrc = this.state.images[this.imageIndex].image;
      var imageTitle = this.state.images[this.imageIndex].title;
      this.loadCss();
      this.overlay = document.createElement('div');
      this.overlay.className = 'image-gallery-overlay';
      this.overlayLoading = document.createElement('span');
      this.overlayLoading.className = 'image-gallery-loading';
      this.overlayLoading.textContent = this.loadingText;
      this.overlayLoading.setAttribute('hidden', '');
      this.overlay.appendChild(this.overlayLoading);
      this.overlayImg = document.createElement('img');
      this.overlayImg.addEventListener('load', function () {
        _this2.loadedImages.add(imageSrc);

        _this2.clearLoadingTimer();

        _this2.overlayLoading.setAttribute('hidden', '');

        _this2.preloadNextImages();
      });
      this.overlayImg.src = imageSrc;
      this.overlay.appendChild(this.overlayImg);
      var container = document.createElement('div');
      this.overlayTitle = document.createElement('span');
      this.overlayTitle.textContent = imageTitle;
      this.overlayTitle.style.display = imageTitle ? '' : 'none';
      container.appendChild(this.overlayTitle);
      this.overlayIndex = document.createElement('span');
      this.overlayIndex.textContent = "".concat(this.imageIndex + 1, "/").concat(this.state.images.length);
      container.appendChild(this.overlayIndex);
      this.overlay.appendChild(container);
      this.addOverlayEvents();
      document.documentElement.appendChild(this.overlay);
      document.querySelector('body').classList.add('blur');
      this.startLoadingTimer();
    }
  }, {
    key: "startLoadingTimer",
    value: function startLoadingTimer() {
      var _this3 = this;

      this.clearLoadingTimer();
      this.loadingTimeoutId = window.setTimeout(function () {
        _this3.loadingTimeoutId = null;

        if (_this3.overlayLoading === null) {
          return;
        }

        _this3.overlayLoading.removeAttribute('hidden');
      }, this.loadingTimeout);
    }
  }, {
    key: "clearLoadingTimer",
    value: function clearLoadingTimer() {
      if (this.loadingTimeoutId !== null) {
        window.clearTimeout(this.loadingTimeoutId);
        this.loadingTimeoutId = null;
      }
    }
  }, {
    key: "addOverlayEvents",
    value: function addOverlayEvents() {
      var _this4 = this;

      this.overlay.onclick = function (e) {
        if ('ontouchstart' in window) {
          var screenHeight = window.innerHeight;
          var screen25pct = screenHeight / 4;
          var screenBottom = screenHeight - screen25pct;

          if (e.clientY >= screen25pct && e.clientY <= screenBottom) {
            return;
          }
        }

        _this4.hideOverlay();
      };

      document.addEventListener('keydown', this.handleDocKeyDown);
      this.overlay.addEventListener('touchstart', function (e) {
        _this4.touchStartX = e.changedTouches[0].screenX;
      }, _supportsPassive ? {
        passive: true
      } : false);
      this.overlay.addEventListener('touchend', function (e) {
        var curX = e.changedTouches[0].screenX;

        if (curX > _this4.touchStartX) {
          _this4.changeImage('left');
        } else if (curX < _this4.touchStartX) {
          _this4.changeImage('right');
        }
      });
    }
  }, {
    key: "handleDocKeyDown",
    value: function handleDocKeyDown(e) {
      switch (e.key) {
        case 'ArrowLeft':
        case 'Left':
          this.changeImage('left');
          break;

        case 'ArrowRight':
        case 'Right':
          this.changeImage('right');
          break;

        case 'Escape':
        case 'Esc':
          this.hideOverlay();
          break;
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.hideOverlay();
    }
  }, {
    key: "hideOverlay",
    value: function hideOverlay() {
      this.clearLoadingTimer();
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlayLoading = null;
      this.overlayIndex = null;
      this.overlayTitle = null;
      this.overlayImg = null;
      this.overlay = null;
      document.removeEventListener('keydown', this.handleDocKeyDown);
      document.querySelector('body').classList.remove('blur');
    }
  }, {
    key: "preloadNextImages",
    value: function preloadNextImages() {
      var _this5 = this;

      if (window.Image.toString().indexOf('[native code]') === -1) {
        console.warn('Images for <ImageGallery> cannot be preloaded because the app defined a <Image> component that overwrote the browsers native [Image] class.');
        return;
      }

      var imageCount = this.state.images.length;
      var indexLeft = this.imageIndex - 1;

      if (indexLeft === -1) {
        indexLeft = imageCount - 1;
      }

      if (indexLeft !== this.imageIndex) {
        var srcLeft = this.state.images[indexLeft].image;

        if (srcLeft && !this.loadedImages.has(srcLeft)) {
          var imgLeft = new Image();

          imgLeft.onload = function () {
            _this5.loadedImages.add(srcLeft);
          };

          imgLeft.src = srcLeft;
        }
      }

      var indexRight = this.imageIndex + 1;

      if (indexRight === imageCount) {
        indexRight = 0;
      }

      if (indexRight !== this.imageIndex) {
        var srcRight = this.state.images[indexRight].image;

        if (srcRight && !this.loadedImages.has(srcRight)) {
          var imgRight = new Image();

          imgRight.onload = function () {
            _this5.loadedImages.add(srcRight);
          };

          imgRight.src = srcRight;
        }
      }
    }
  }, {
    key: "changeImage",
    value: function changeImage(direction) {
      var imageCount = this.state.images.length;

      if (direction === 'right') {
        this.imageIndex = this.imageIndex === imageCount - 1 ? 0 : this.imageIndex + 1;
      } else {
        this.imageIndex = this.imageIndex === 0 ? imageCount - 1 : this.imageIndex - 1;
      }

      var imageTitle = this.state.images[this.imageIndex].title;
      this.overlayImg.src = '';
      this.overlayImg.src = this.state.images[this.imageIndex].image;
      this.overlayTitle.textContent = imageTitle;
      this.overlayTitle.style.display = imageTitle ? '' : 'none';
      this.overlayIndex.textContent = "".concat(this.imageIndex + 1, "/").concat(imageCount);
      this.startLoadingTimer();
    }
  }, {
    key: "render",
    value: function render() {
      var _this6 = this;

      var template = this.props.template;

      if (template === undefined) {
        if (this.props.children !== undefined) {
          template = this.props.children;
        } else {
          template = React.createElement(BasicImage);
        }
      }

      return this.state.images.map(function (image) {
        return React.cloneElement(template, Object.assign({}, image, {
          onClick: _this6.onClick
        }));
      });
    }
  }]);

  return ImageGallery;
}(React.Component);

exports.default = ImageGallery;