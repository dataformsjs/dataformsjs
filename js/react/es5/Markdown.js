(function () {
"use strict";

var React = (window.React === undefined && window.preact !== undefined ? window.preact : window.React);

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var markdownCache = [];
var maxCacheSize = 100;

function saveMarkdownToCache(url, content, errorMessage) {
  if (markdownCache.length > maxCacheSize) {
    markdownCache.length = 0;
  }

  for (var n = 0, m = markdownCache.length; n < m; n++) {
    if (url === markdownCache[n].url) {
      return;
    }
  }

  markdownCache.push({
    url: url,
    content: content,
    errorMessage: errorMessage
  });
}

function getMarkdownFromCache(url) {
  for (var n = 0, m = markdownCache.length; n < m; n++) {
    if (url === markdownCache[n].url) {
      return markdownCache[n];
    }
  }

  return null;
}

var Markdown = function (_React$Component) {
  _inherits(Markdown, _React$Component);

  var _super = _createSuper(Markdown);

  function Markdown(props) {
    var _this;

    _classCallCheck(this, Markdown);

    _this = _super.call(this, props);
    var hasContent = props !== undefined && typeof props.content === 'string';
    _this.state = {
      content: hasContent ? props.content : null,
      html: hasContent ? _this.generateHtml(props.content) : null,
      errorMessage: null,
      isLoaded: false
    };
    _this._isMounted = false;
    _this._returnCode = false;
    _this.fetchContent = _this.fetchContent.bind(_assertThisInitialized(_this));
    _this.highlight = _this.highlight.bind(_assertThisInitialized(_this));
    _this.updateContent = _this.updateContent.bind(_assertThisInitialized(_this));
    _this.generateHtml = _this.generateHtml.bind(_assertThisInitialized(_this));
    _this.markdownEl = React.createRef();
    return _this;
  }

  _createClass(Markdown, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this._isMounted = true;

      if (this.props.url && this.state.content === null) {
        this.fetchContent();
      } else {
        this.updateContent();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this._isMounted = false;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (this.props.url && prevProps.url !== this.props.url) {
        this.fetchContent();
      } else {
        this.updateContent();
      }
    }
  }, {
    key: "fetchContent",
    value: function fetchContent() {
      var _this2 = this;

      if (this.props.loadOnlyOnce) {
        var cache = getMarkdownFromCache(this.props.url);

        if (cache) {
          if (this._isMounted) {
            this.setState({
              content: cache.content,
              html: this.generateHtml(cache.content),
              errorMessage: cache.errorMessage,
              isLoaded: true
            });
          }

          return;
        }
      }

      fetch(this.props.url, this.props.fetchOptions).then(function (res) {
        var status = res.status;

        if (status >= 200 && status < 300 || status === 304) {
          return Promise.resolve(res);
        } else {
          var error = "Error loading markdown content from [".concat(_this2.props.url, "]. Server Response Code: ").concat(status, ", Response Text: ").concat(res.statusText);
          return Promise.reject(error);
        }
      }).then(function (res) {
        return res.text();
      }).then(function (text) {
        if (_this2.props.loadOnlyOnce) {
          saveMarkdownToCache(_this2.props.url, text, null);
        }

        if (_this2._isMounted) {
          _this2.setState({
            content: text,
            html: _this2.generateHtml(text),
            errorMessage: null,
            isLoaded: true
          });
        }
      }).catch(function (error) {
        if (_this2.props.loadOnlyOnce) {
          saveMarkdownToCache(_this2.props.url, null, error);
        }

        if (_this2._isMounted) {
          _this2.setState({
            errorMessage: error
          });
        }
      });
    }
  }, {
    key: "highlight",
    value: function highlight(code, lang) {
      var hljs = this.props.hljs || window.hljs;

      if (hljs === undefined) {
        return this._returnCode ? code : '';
      }

      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, code).value;
        } catch (err) {
          console.warn(err);
        }
      }

      try {
        return hljs.highlightAuto(code).value;
      } catch (err) {
        console.warn(err);
      }

      return this._returnCode ? code : '';
    }
  }, {
    key: "updateContent",
    value: function updateContent() {
      if (!this._isMounted || !this.markdownEl.current) {
        return;
      }

      var hljs = this.props.hljs || window.hljs;

      if (hljs !== undefined) {
        var codeBlocks = this.markdownEl.current.querySelectorAll('code[class*="language-"]');

        for (var n = 0, m = codeBlocks.length; n < m; n++) {
          codeBlocks[n].classList.add('hljs');
        }
      }

      var linkTarget = this.props.linkTarget;
      var linkRel = this.props.linkRel;

      if (linkTarget || linkRel) {
        var links = this.markdownEl.current.querySelectorAll('a');
        Array.prototype.forEach.call(links, function (link) {
          link.target = linkTarget ? linkTarget : link.target;
          link.rel = linkRel ? linkRel : link.rel;
        });
      }

      if (this.props.useRootUrl !== false) {
        var url = this.props.url;
        var rootUrl;

        if (url) {
          var parts = url.split('/');
          rootUrl = url.substring(0, url.length - parts[parts.length - 1].length);
        }

        var linkRootUrl = this.props.linkRootUrl;
        linkRootUrl = linkRootUrl ? linkRootUrl : rootUrl;

        if (linkRootUrl) {
          var _links = this.markdownEl.current.querySelectorAll('a:not([href^="http:"]):not([href^="https:"])');

          Array.prototype.forEach.call(_links, function (link) {
            var href = link.getAttribute('href');
            link.setAttribute('data-original-href', href);
            link.setAttribute('href', linkRootUrl + href);
          });
        }

        var images = this.markdownEl.current.querySelectorAll('img:not([src^="http:"]):not([src^="https:"])');
        Array.prototype.forEach.call(images, function (img) {
          var src = img.getAttribute('src');
          img.setAttribute('data-original-src', src);
          img.setAttribute('src', rootUrl + src);
        });
      }
    }
  }, {
    key: "generateHtml",
    value: function generateHtml(content) {
      var html;
      var md;
      this._returnCode = false;

      if (this.props.marked || window.marked) {
        this._returnCode = true;
        var marked = this.props.marked || window.marked;
        marked.setOptions({
          highlight: this.highlight
        });

        if (marked.marked && marked.marked.parse) {
          html = marked.marked.parse(content);
        } else {
          html = marked(content);
        }
      } else if (this.props.markdownit || window.markdownit) {
        var markdownit = this.props.markdownit || window.markdownit;
        md = markdownit({
          html: true,
          linkify: true,
          typographer: true,
          highlight: this.highlight
        });

        if (this.props.markdownitEmoji || window.markdownitEmoji) {
          var markdownitEmoji = this.props.markdownitEmoji || window.markdownitEmoji;
          md.use(markdownitEmoji);
        }

        html = md.render(content);
      } else if (this.props.Remarkable || window.remarkable) {
        var Remarkable = this.props.Remarkable || window.remarkable.Remarkable;
        md = new Remarkable({
          html: true,
          typographer: true,
          highlight: this.highlight
        });
        var linkify = this.props.linkify || window.remarkable.linkify;

        if (linkify) {
          md.use(linkify);
        }

        html = md.render(content);
      } else {
        throw new Error('Error - Unable to show Markdown content because a Markdown JavaScript library was not found on the page.');
      }

      var DOMPurify = this.props.DOMPurify || window.DOMPurify;

      if (DOMPurify !== undefined) {
        html = DOMPurify.sanitize(html);
      }

      return html;
    }
  }, {
    key: "render",
    value: function render() {
      if (this.state.errorMessage) {
        var className = (this.props.className ? this.props.className : '') + ' error';
        var errorStyle = _typeof(this.props.errorStyle) === 'object' ? this.props.errorStyle : {
          backgroundColor: 'red',
          color: '#fff',
          fontWeight: 'bold',
          border: '1px solid darkred',
          padding: '1em'
        };
        return React.createElement('div', {
          className: className,
          ref: this.markdownEl,
          style: errorStyle
        }, this.state.errorMessage);
      }

      if (this.props.url && !this.state.isLoaded) {
        if (this.props.isLoading) {
          return this.props.isLoading;
        }

        return null;
      }

      if (this.state.content === null) {
        return null;
      }

      if (this.props.showSource) {
        return React.createElement('div', {
          className: this.props.className,
          ref: this.markdownEl
        }, React.createElement('pre', null, this.state.content));
      }

      return React.createElement('div', {
        className: this.props.className,
        dangerouslySetInnerHTML: {
          __html: this.state.html
        },
        ref: this.markdownEl
      });
    }
  }]);

  return Markdown;
}(React.Component);

window.Markdown = Markdown;
})();