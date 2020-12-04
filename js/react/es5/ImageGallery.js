"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

if (window.exports === undefined) { window.exports = window; }
if (window.React === undefined && window.preact !== undefined) { var React = window.preact; }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

var isMobile = function () {
  var ua = window.navigator.userAgent.toLowerCase();
  return ua.indexOf('android') > -1 || ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1;
}();

var supportsAvif = null;
var supportsWebp = null;

function BasicImage(props) {
  return React.createElement('img', {
    src: props.thumbnail,
    alt: props.title,
    tabIndex: props.tabIndex,
    onClick: props.onClick,
    onKeyDown: props.onKeyDown,
    key: props.key,
    style: {
      cursor: 'pointer'
    }
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
    _this.onKeyDown = _this.onKeyDown.bind(_assertThisInitialized(_this));
    _this.handleDocKeyDown = _this.handleDocKeyDown.bind(_assertThisInitialized(_this));
    _this.preloadNextImages = _this.preloadNextImages.bind(_assertThisInitialized(_this));
    _this.showOverlay = _this.showOverlay.bind(_assertThisInitialized(_this));
    _this.hideOverlay = _this.hideOverlay.bind(_assertThisInitialized(_this));
    _this.changeImage = _this.changeImage.bind(_assertThisInitialized(_this));

    if (props === undefined || props.images === undefined) {
      throw new Error('Error - ImageGallery - Missing props or images from props. See examples for usage.');
    }

    _this.svgForwardButton = '<svg width="13" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M3.4.6L12 9c.4.4.6 1 .6 1.5a2 2 0 01-.6 1.5l-8.5 8.5a2 2 0 01-2.8-2.8l7.2-7.2L.6 3.4A2 2 0 013.4.6z" fill="#fff" fill-rule="evenodd"/></svg>';
    _this.svgBackButton = '<svg width="13" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M9 .6L.7 9a2 2 0 00-.6 1.5c0 .5.2 1.1.6 1.5L9 20.6a2 2 0 002.8-2.8l-7.2-7.2L12 3.4A2 2 0 009.1.6z" fill="#fff" fill-rule="evenodd"/></svg>';
    _this.overlayStyleId = 'image-gallery-css';
    _this.overlayStyleCss = "\n            body.blur { filter: blur(3px); }\n\n            .image-gallery-overlay {\n                position: fixed;\n                top: 0;\n                left: 0;\n                right: 0;\n                bottom: 0;\n                background-color: rgba(255,255,255,.8);\n                cursor: pointer;\n                display: flex;\n                justify-content: center;\n                align-items: center;\n                flex-direction: column;\n            }\n\n            .image-gallery-overlay .image-gallery-loading {\n                font-weight: bold;\n                padding: 10px 20px;\n                background-color: rgba(255,255,255,.4);\n                position: absolute;\n            }\n\n            .image-gallery-overlay img {\n                max-width: 100%;\n                max-height: 100%;\n                flex-shrink: 0;\n            }\n\n            .image-gallery-overlay div {\n                position: absolute;\n                bottom: 0;\n                left: 0;\n                right: 0;\n                z-index: 2;\n                font-weight: bold;\n                display: flex;\n                justify-content: space-between;\n                width: 100%;\n            }\n\n            .image-gallery-overlay div.no-title {\n                justify-content: flex-end;\n            }\n\n            .image-gallery-overlay div span {\n                padding: 10px 20px;\n                background-color: rgba(255,255,255,.4);\n            }\n\n            .image-gallery-overlay .btn-previous,\n            .image-gallery-overlay .btn-next {\n                display: block;\n                position: absolute;\n                height: 40px;\n                width: 40px;\n                opacity: .7;\n                background-repeat: no-repeat;\n                background-position: center;\n                padding: 0;\n                margin: 15px;\n                background-color: rgba(0,0,0,.5);\n                border-radius: 50%;\n                transition: all ease-in-out .2s;\n            }\n            .image-gallery-overlay .btn-previous { left: 0; background-position-x: 12px; background-image: url(\"data:image/svg+xml;base64,".concat(btoa(_this.svgBackButton), "\"); }\n            .image-gallery-overlay .btn-next { right: 0; background-position-x: 15px; background-image: url(\"data:image/svg+xml;base64,").concat(btoa(_this.svgForwardButton), "\"); }\n\n            .image-gallery-overlay .btn-previous:hover,\n            .image-gallery-overlay .btn-next:hover {\n                opacity: .5;\n            }\n\n            .image-gallery-overlay.mobile .btn-previous,\n            .image-gallery-overlay.mobile .btn-next,\n            .image-gallery-overlay.keyboard .btn-previous,\n            .image-gallery-overlay.keyboard .btn-next {\n                display: none;\n            }\n\n            @media (min-width: 1300px) {\n                .image-gallery-overlay div {\n                    left: calc((100% - 1300px) /2);\n                    right: auto;\n                    max-width: 1300px;\n                }\n            }\n\n            @media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: none) {\n                .image-gallery-overlay .image-gallery-loading,\n                .image-gallery-overlay .btn-previous,\n                .image-gallery-overlay .btn-next { margin-top: calc((100vh /2) - 35px); }\n            }\n        ");
    _this.imageIndex = null;
    _this.overlay = null;
    _this.overlayImg = null;
    _this.overlayTitle = null;
    _this.overlayIndex = null;
    _this.overlayLoading = null;
    _this.overlayBackButton = null;
    _this.overlayFowardButton = null;
    _this.touchStartX = null;
    _this.loadingTimeoutId = null;
    _this.loadingText = props.loadingText ? props.loadingText : 'Loading...';
    _this.loadingTimeout = props.loadingTimeout ? props.loadingTimeout : 2000;
    _this.loadedImages = new Set();
    _this.startedFromKeyboard = false;
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

      this.checkSupportedFormats();
    }
  }, {
    key: "onKeyDown",
    value: function onKeyDown(e) {
      if (e.key === ' ' || e.key === 'Spacebar') {
        if (this.overlay === null) {
          this.startedFromKeyboard = true;
          this.onClick(e);
        }

        e.preventDefault();
      }
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
    key: "checkSupportedFormats",
    value: function checkSupportedFormats() {
      if (supportsAvif !== null && supportsWebp !== null) {
        this.showOverlay();
        return;
      }

      var showOverlay = this.showOverlay;

      function checkStatus() {
        if (supportsAvif !== null && supportsWebp !== null) {
          showOverlay();
          return;
        }
      }

      var imgAvif = new Image();

      imgAvif.onload = function () {
        supportsAvif = imgAvif.width === 1 && imgAvif.height === 1;
        checkStatus();
      };

      imgAvif.onerror = function () {
        supportsAvif = false;
        checkStatus();
      };

      imgAvif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABoAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACJtZGF0EgAKCBgABogQEAwgMgwYAAAAUAAAALASmpg=';
      var imgWebP = new Image();

      imgWebP.onload = function () {
        supportsWebp = imgWebP.width === 1 && imgWebP.height === 1;
        checkStatus();
      };

      imgWebP.onerror = function () {
        supportsWebp = false;
        checkStatus();
      };

      imgWebP.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
    }
  }, {
    key: "showOverlay",
    value: function showOverlay() {
      var _this2 = this;

      var imageSrc = this.getImage(this.state.images[this.imageIndex]);
      var imageTitle = this.state.images[this.imageIndex].title;
      this.loadCss();
      this.overlay = document.createElement('div');
      this.overlay.className = 'image-gallery-overlay' + (isMobile ? ' mobile' : '') + (this.startedFromKeyboard ? ' keyboard' : '');
      this.overlayLoading = document.createElement('span');
      this.overlayLoading.className = 'image-gallery-loading';
      this.overlayLoading.textContent = this.loadingText;
      this.overlayLoading.setAttribute('hidden', '');
      this.overlay.appendChild(this.overlayLoading);
      this.overlayBackButton = document.createElement('span');
      this.overlayBackButton.className = 'btn-previous';
      this.overlayBackButton.setAttribute('role', 'button');

      this.overlayBackButton.onclick = function () {
        _this2.changeImage('left');
      };

      this.overlayFowardButton = document.createElement('span');
      this.overlayFowardButton.className = 'btn-next';
      this.overlayFowardButton.setAttribute('role', 'button');

      this.overlayFowardButton.onclick = function () {
        _this2.changeImage('right');
      };

      this.overlay.appendChild(this.overlayBackButton);
      this.overlay.appendChild(this.overlayFowardButton);
      this.overlayImg = document.createElement('img');
      this.overlayImg.addEventListener('load', function () {
        _this2.loadedImages.add(imageSrc);

        _this2.clearLoadingTimer();

        if (_this2.overlayLoading !== null) {
          _this2.overlayLoading.setAttribute('hidden', '');
        }

        _this2.preloadNextImages();
      });
      this.overlayImg.src = imageSrc;
      this.overlay.appendChild(this.overlayImg);
      var container = document.createElement('div');
      this.overlayTitle = document.createElement('span');
      this.overlayTitle.textContent = imageTitle;
      this.overlayTitle.style.display = imageTitle ? '' : 'none';
      container.className = imageTitle ? '' : 'no-title';
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
    key: "getImage",
    value: function getImage(image) {
      if (image.image_avif !== undefined && supportsAvif) {
        return image.image_avif;
      }

      if (image.image_webp !== undefined && supportsWebp) {
        return image.image_webp;
      }

      return image.image;
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

        if (e.target === _this4.overlayBackButton || e.target === _this4.overlayFowardButton) {
          return;
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
      this.overlayBackButton = null;
      this.overlayFowardButton = null;
      this.overlayLoading = null;
      this.overlayIndex = null;
      this.overlayTitle = null;
      this.overlayImg = null;
      this.overlay = null;
      this.startedFromKeyboard = false;
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
        var srcLeft = this.getImage(this.state.images[indexLeft]);

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
        var srcRight = this.getImage(this.state.images[indexRight]);

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
      this.overlayImg.src = this.getImage(this.state.images[this.imageIndex]);
      this.overlayTitle.textContent = imageTitle;
      this.overlayTitle.style.display = imageTitle ? '' : 'none';
      this.overlayTitle.parentNode.className = imageTitle ? '' : 'no-title';
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

      var tabIndex = parseInt(this.props.tabIndex, 10);
      var useTabIndex = window.isFinite(tabIndex);
      return this.state.images.map(function (image, index) {
        var imageAttr = {
          key: index.toString() + '_' + image.thumbnail,
          onClick: _this6.onClick,
          onKeyDown: _this6.onKeyDown
        };

        if (useTabIndex) {
          imageAttr.tabIndex = tabIndex;
          tabIndex++;
        }

        return React.cloneElement(template, Object.assign({}, image, imageAttr));
      });
    }
  }]);

  return ImageGallery;
}(React.Component);

exports.default = ImageGallery;