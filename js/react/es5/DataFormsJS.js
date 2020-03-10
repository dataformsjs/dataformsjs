// @link https://www.dataformsjs.com
// @author Conrad Sollitt (http://www.conradsollitt.com)
// @license MIT
"use strict";

if (window.exports === undefined) { window.exports = window; }
if (window.React === undefined && window.preact !== undefined) { var React = window.preact; }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataFormsJS = exports.SortableTable = exports.LeafletMap = exports.LazyLoad = exports.JsonData = exports.InputFilter = exports.I18n = exports.Format = exports.ErrorBoundary = exports.Cache = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var cachedValues = {};

var Cache = function () {
  function Cache() {
    _classCallCheck(this, Cache);
  }

  _createClass(Cache, null, [{
    key: "get",
    value: function get(name, defaultValues) {
      if (cachedValues[name] === undefined) {
        return defaultValues;
      }

      return cachedValues[name];
    }
  }, {
    key: "set",
    value: function set(name, data) {
      cachedValues[name] = data;
    }
  }]);

  return Cache;
}();

exports.Cache = Cache;

var ErrorBoundary = function (_React$Component) {
  _inherits(ErrorBoundary, _React$Component);

  function ErrorBoundary(props) {
    var _this;

    _classCallCheck(this, ErrorBoundary);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ErrorBoundary).call(this, props));
    _this.state = {
      error: null,
      errorInfo: null
    };
    return _this;
  }

  _createClass(ErrorBoundary, [{
    key: "componentDidCatch",
    value: function componentDidCatch(error, errorInfo) {
      this.setState({
        error: error,
        errorInfo: errorInfo
      });
    }
  }, {
    key: "render",
    value: function render() {
      if (this.state.errorInfo) {
        return React.createElement('div', null, React.createElement('h2', {
          style: {
            textAlign: 'left',
            color: 'white',
            backgroundColor: '#bc0000',
            padding: '1em'
          }
        }, 'An error has occurred'), React.createElement('details', {
          style: {
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
            color: 'white',
            backgroundColor: 'red',
            padding: '1em'
          }
        }, this.state.error && this.state.error.toString(), React.createElement('br', null), this.state.errorInfo.componentStack));
      }

      return this.props.children;
    }
  }]);

  return ErrorBoundary;
}(React.Component);

exports.ErrorBoundary = ErrorBoundary;

var Format = function () {
  function Format() {
    _classCallCheck(this, Format);
  }

  _createClass(Format, [{
    key: "number",
    value: function number(value) {
      return formatNumber(value, {});
    }
  }, {
    key: "currency",
    value: function currency(value, currencyCode) {
      var intlOptions = {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2
      };
      return formatNumber(value, intlOptions);
    }
  }, {
    key: "percent",
    value: function percent(value) {
      var decimalPlaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var intlOptions = {
        style: 'percent',
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces
      };
      return formatNumber(value, intlOptions);
    }
  }, {
    key: "date",
    value: function date(value) {
      return formatDateTime(value, {});
    }
  }, {
    key: "dateTime",
    value: function dateTime(value) {
      var intlOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      };
      return formatDateTime(value, intlOptions);
    }
  }, {
    key: "time",
    value: function time(value) {
      var intlOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      };
      return formatDateTime(value, intlOptions);
    }
  }]);

  return Format;
}();

exports.Format = Format;

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function formatDateTime(dateTime, options) {
  if (window.Intl === undefined) {
    return dateTime;
  }

  try {
    if (_instanceof(dateTime, Date)) {
      return new Intl.DateTimeFormat(navigator.language, options).format(dateTime);
    } else {
      var localDate = new Date(dateTime);
      return new Intl.DateTimeFormat(navigator.language, options).format(localDate);
    }
  } catch (e) {
    console.warn('Error formatting Date/Time Value:');
    console.log(navigator.language);
    console.log(options);
    console.log(dateTime);
    console.log(e);
    return 'Error';
  }
}

function formatNumber(value, options) {
  var style,
      maximumFractionDigits,
      digitGrouping = null,
      decimalMark = null,
      currencySymbol = null,
      numberParts,
      formattedValue,
      language;
  language = navigator.language ? navigator.language : navigator.userLanguage;

  if (value === null || value === '') {
    return null;
  }

  if (!isNumber(value)) {
    console.warn('Warning value specified in DateFormsJS Handlebars Helper function formatNumber() is not a number:');
    console.log(value);
    return value;
  }

  if (window.Intl === undefined) {
    style = options.style ? options.style : null;
    maximumFractionDigits = options.maximumFractionDigits ? options.maximumFractionDigits : 0;

    if (style === 'percent') {
      return (value * 100).toFixed(maximumFractionDigits) + '%';
    }

    switch (language) {
      case 'en-us':
        digitGrouping = ',';
        decimalMark = '.';
        currencySymbol = '$';
        break;
    }

    if (digitGrouping !== null) {
      numberParts = value.toString().split('.');
      numberParts[0] = numberParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formattedValue = numberParts.join(decimalMark);

      if (style === 'currency') {
        return currencySymbol + formattedValue;
      } else {
        return formattedValue;
      }
    }

    return value;
  }

  try {
    return new Intl.NumberFormat(language, options).format(value);
  } catch (e) {
    console.warn('Error formatting Numeric Value:');
    console.log(language);
    console.log(options);
    console.log(value);
    console.log(e);
    return 'Error';
  }
}

var I18n = function () {
  function I18n(defaultLocale, supportedLocales) {
    var fileName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '_';
    var fileDir = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'i18n';

    _classCallCheck(this, I18n);

    if (typeof defaultLocale !== 'string') {
      throw new Error('Error - I18n - Missing default locale See examples for usage.');
    } else if (!Array.isArray(supportedLocales)) {
      throw new Error('Error - I18n - Missing or invalid supported locales. See examples for usage.');
    }

    this.state = {
      fileName: fileName,
      fileDir: fileDir,
      defaultLocale: defaultLocale,
      supportedLocales: supportedLocales,
      currentLocale: null,
      langText: {},
      langCache: {},
      startCallback: null,
      loadedCallback: null
    };
    window.addEventListener('hashchange', this.onHashChange.bind(this));
    this.onHashChange();
  }

  _createClass(I18n, [{
    key: "onLangStart",
    value: function onLangStart(callback) {
      this.state.startCallback = callback;
    }
  }, {
    key: "onLangLoaded",
    value: function onLangLoaded(callback) {
      this.state.loadedCallback = callback;
    }
  }, {
    key: "onHashChange",
    value: function onHashChange() {
      var i18n = this;
      var state = this.state;
      var currentLocale = null;

      if (window.location.hash.indexOf('#/') === 0) {
        currentLocale = window.location.hash.split('/')[1];

        if (currentLocale === '' || state.supportedLocales.indexOf(currentLocale) === -1) {
          currentLocale = null;
        }
      }

      if (currentLocale === null) {
        currentLocale = state.defaultLocale;
      }

      if (state.currentLocale === currentLocale) {
        return;
      }

      state.currentLocale = currentLocale;

      if (this.state.startCallback) {
        this.state.startCallback();
      }

      var url = state.fileDir + '/' + state.fileName + '.' + state.currentLocale + '.json';

      if (state.langCache[url] !== undefined) {
        state.langText = state.langCache[url];
        i18n.updatePageTitle();

        if (state.loadedCallback) {
          state.loadedCallback();
        }
      } else {
        fetch(url, {
          mode: 'cors',
          cache: 'no-store',
          credentials: 'same-origin'
        }).then(function (response) {
          var status = response.status;

          if (status >= 200 && status < 300 || status === 304) {
            return Promise.resolve(response);
          } else {
            var error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
            return Promise.reject(error);
          }
        }).then(function (response) {
          return response.json();
        }).then(function (json) {
          state.langCache[url] = json;
        }).catch(function (error) {
          var errorMessage = 'Error Downloading I18N file: [' + url + '], Response Code Status: ' + error.message;
          console.error(errorMessage);
          state.langCache[url] = {};
        }).finally(function () {
          state.langText = state.langCache[url];
          i18n.updatePageTitle();

          if (state.loadedCallback) {
            state.loadedCallback();
          }
        });
      }
    }
  }, {
    key: "updatePageTitle",
    value: function updatePageTitle() {
      var title = document.querySelector('html title[data-i18n]');

      if (title) {
        title.textContent = this.text(title.getAttribute('data-i18n'));
      }

      document.documentElement.lang = this.state.currentLocale;
    }
  }, {
    key: "text",
    value: function text(key) {
      return this.state.langText && this.state.langText[key] ? this.state.langText[key] : key;
    }
  }, {
    key: "currentLocale",
    get: function get() {
      return this.state.currentLocale;
    }
  }, {
    key: "getUserDefaultLang",
    get: function get() {
      if (navigator.languages && navigator.languages.length && this.state.supportedLocales && this.state.supportedLocales.length) {
        for (var n = 0, m = navigator.languages.length; n < m; n++) {
          if (this.state.supportedLocales.indexOf(navigator.languages[n]) !== -1) {
            return navigator.languages[n];
          }
        }
      }

      return this.state.defaultLocale;
    }
  }]);

  return I18n;
}();

exports.I18n = I18n;

var InputFilter = function (_React$Component2) {
  _inherits(InputFilter, _React$Component2);

  function InputFilter(props) {
    var _this2;

    _classCallCheck(this, InputFilter);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(InputFilter).call(this, props));
    _this2.onChange = _this2.onChange.bind(_assertThisInitialized(_this2));
    _this2.input = React.createRef();
    return _this2;
  }

  _createClass(InputFilter, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.filter();
    }
  }, {
    key: "onChange",
    value: function onChange() {
      this.filter();

      if (typeof this.props.afterFilter === 'function') {
        this.props.afterFilter();
      }
    }
  }, {
    key: "filter",
    value: function filter() {
      var el = this.input.current;
      var filterWords = el.value.toLowerCase().split(' ');
      var filterWordCount = filterWords.length;
      var hasFilter = filterWordCount !== 0;
      var displayCount = 0;
      var cssOdd = null;
      var cssEven = null;
      var elements = document.querySelectorAll(this.props['filter-selector']);

      if (elements.length === 1 && elements[0].tagName === 'TABLE' && elements[0].tHead && elements[0].tHead.rows.length === 1 && elements[0].tBodies.length === 1) {
        var table = elements[0];
        cssOdd = table.getAttribute('data-sort-class-odd');
        cssEven = table.getAttribute('data-sort-class-even');
        elements = elements[0].tBodies[0].rows;
      }

      var totalCount = elements.length;
      var hasCss = cssEven && cssOdd;

      for (var n = 0, m = elements.length; n < m; n++) {
        var element = elements[n];
        var showItem = true;

        if (hasFilter) {
          var text = element.textContent.toLowerCase();

          for (var _n = 0; _n < filterWordCount; _n++) {
            if (filterWords[_n] !== '' && !text.includes(filterWords[_n])) {
              showItem = false;
              break;
            }
          }
        }

        if (showItem) {
          displayCount++;

          if (hasCss) {
            if (displayCount % 2 === 0) {
              element.classList.add(cssEven);
              element.classList.remove(cssOdd);
            } else {
              element.classList.add(cssOdd);
              element.classList.remove(cssEven);
            }
          }
        }

        element.style.display = showItem ? '' : 'none';
      }

      var selector = el.getAttribute('filter-results-selector');

      if (selector) {
        var resultLabel = document.querySelector(selector);

        if (!resultLabel) {
          console.warn('Defined [filter-results-selector] but element not found');
          return;
        }

        var resultTextAll = el.getAttribute('filter-results-text-all');
        var resultTextFiltered = el.getAttribute('filter-results-text-filtered');

        if (resultTextAll === null && resultTextFiltered === null) {
          console.warn('Defined [filter-results-selector] without [filter-results-text-all] or [filter-results-text-filtered]');
          return;
        }

        var resultText = null;

        if (displayCount === totalCount) {
          resultText = resultTextAll;
        } else if (resultTextFiltered !== null) {
          resultText = resultTextFiltered.replace(/{displayCount}/g, displayCount);
        }

        if (resultText === null) {
          resultLabel.textContent = '';
        } else {
          resultText = resultText.replace(/{totalCount}/g, totalCount);
          resultLabel.textContent = resultText;
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (window !== undefined && window.React === window.preact) {
        return React.createElement('input', Object.assign({}, this.props, {
          onInput: this.onChange,
          ref: this.input
        }));
      }

      return React.createElement('input', Object.assign({}, this.props, {
        onChange: this.onChange,
        ref: this.input
      }));
    }
  }]);

  return InputFilter;
}(React.Component);

exports.InputFilter = InputFilter;
var jsonDataCache = [];
var graphQL_Cache = {};

function saveDataToCache(url, query, params, data) {
  for (var n = 0, m = jsonDataCache.length; n < m; n++) {
    var cache = jsonDataCache[n];

    if (cache.url === url && cache.query === query) {
      cache.params = JSON.stringify(params);
      cache.data = data;
      return;
    }
  }

  jsonDataCache.push({
    url: url,
    query: query,
    params: JSON.stringify(params),
    data: data
  });
}

function getDataFromCache(url, query, params) {
  for (var n = 0, m = jsonDataCache.length; n < m; n++) {
    var cache = jsonDataCache[n];

    if (cache.url === url && cache.query === query) {
      if (JSON.stringify(params) === cache.params) {
        return cache.data;
      }

      break;
    }
  }

  return null;
}

function IsLoading(props) {
  var show = props.fetchState === 0;

  if (!show || !props.children) {
    return null;
  }

  return props.children;
}

function HasError(props) {
  var show = props.fetchState === -1;

  if (!show || !props.children) {
    return null;
  }

  var error = props.error;

  if (typeof error === 'string' && error.indexOf('Error') === -1) {
    error = 'Error - ' + error;
  }

  return React.cloneElement(props.children, {
    error: error
  });
}

function IsLoaded(props) {
  var show = props.fetchState === 1;

  if (!show || !props.children) {
    return null;
  }

  return React.cloneElement(props.children, {
    data: props.data,
    params: props.params,
    handleChange: props.handleChange
  });
}

var JsonData = function (_React$Component3) {
  _inherits(JsonData, _React$Component3);

  function JsonData(props) {
    var _this3;

    _classCallCheck(this, JsonData);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(JsonData).call(this, props));
    _this3._isFetching = false;
    _this3._isMounted = false;
    _this3.fetchData = _this3.fetchData.bind(_assertThisInitialized(_this3));
    _this3.handleChange = _this3.handleChange.bind(_assertThisInitialized(_this3));
    _this3.state = {
      fetchState: 0,
      error: null,
      params: _this3.getUrlParams(),
      data: null
    };
    return _this3;
  }

  _createClass(JsonData, [{
    key: "getUrlParams",
    value: function getUrlParams() {
      var params = {};

      if (this.props && this.props.graphQL === true) {
        return this.props.variables === undefined ? {} : this.props.variables;
      }

      for (var prop in this.props) {
        if (prop !== 'url' && typeof this.props[prop] === 'string') {
          params[prop] = this.props[prop];
        }
      }

      return params;
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this._isMounted = true;

      if (this.props.graphQL === true && this.props.query === undefined && this.props.querySrc !== undefined) {
        if (graphQL_Cache[this.props.querySrc] !== undefined) {
          this.props.query = graphQL_Cache[this.props.querySrc];
        }
      }

      if (this.props.loadOnlyOnce) {
        var data = getDataFromCache(this.props.url, this.props.query, this.getUrlParams());

        if (data !== null) {
          this.setState({
            fetchState: 1,
            data: data
          });
          return;
        }
      }

      if (this.props.graphQL === true && this.props.query === undefined && this.props.querySrc !== undefined) {
        var querySrc = this.props.querySrc;
        var jsonData = this;
        fetch(querySrc, null).then(function (response) {
          var status = response.status;

          if (status >= 200 && status < 300 || status === 304) {
            return Promise.resolve(response);
          } else {
            var error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
            return Promise.reject(error);
          }
        }).then(function (response) {
          return response.text();
        }).then(function (text) {
          graphQL_Cache[querySrc] = text;
          jsonData.props.query = graphQL_Cache[querySrc];
          jsonData.fetchData();
        }).catch(function (error) {
          throw new Error('Error Downloading GraphQL Script: [' + querySrc + '], Error: ' + error.toString());
        });
        return;
      }

      this.fetchData();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      var needsRefresh;

      if (this.props.graphQL === true) {
        needsRefresh = JSON.stringify(prevProps.variables) !== JSON.stringify(this.props.variables);
      } else {
        var prevUrl = this.buildUrl(prevState.params);
        var newUrl = this.buildUrl(this.props);
        needsRefresh = prevUrl !== newUrl;
      }

      if (needsRefresh) {
        this.setState({
          params: this.getUrlParams()
        }, this.fetchData);
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this._isMounted = false;
    }
  }, {
    key: "buildUrl",
    value: function buildUrl(params) {
      var url = this.props.url;

      if (this.props.graphQL !== true && Object.keys(params).length > 0) {
        for (var param in params) {
          if (url.indexOf(':' + param) > -1) {
            url = url.replace(new RegExp(':' + param, 'g'), encodeURIComponent(params[param]));
          }
        }
      }

      return url;
    }
  }, {
    key: "fetchData",
    value: function fetchData() {
      var _this4 = this;

      var url = this.buildUrl(this.state.params);

      if (this._isFetching) {
        return;
      }

      this._isFetching = true;
      var options = {
        mode: 'cors',
        cache: 'no-store',
        credentials: 'same-origin'
      };

      if (this.props.fetchOptions) {
        options = this.props.fetchOptions;
      }

      if (this.props.fetchHeaders) {
        options.headers = this.props.fetchHeaders;
      }

      if (this.props.graphQL === true) {
        var variables = this.props.variables === undefined ? {} : this.props.variables;

        if (window.location.origin === 'file://' || window.location.origin === 'null') {
          url += url.indexOf('?') === -1 ? '?' : '&';
          url += 'query=' + encodeURIComponent(this.props.query.trim());
          url += '&variables=' + encodeURIComponent(JSON.stringify(variables));
        } else {
          options.method = 'POST';

          if (options.headers === undefined) {
            options.headers = {
              'Content-Type': 'application/json'
            };
          } else {
            options.headers['Content-Type'] = 'application/json';
          }

          options.body = JSON.stringify({
            query: this.props.query,
            variables: variables
          });
        }
      }

      this.setState({
        fetchState: 0
      }, function () {
        _this4.updateView();

        fetch(url, options).then(function (response) {
          var status = response.status;

          if (status >= 200 && status < 300 || status === 304) {
            return Promise.resolve(response);
          } else {
            var error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
            return Promise.reject(error);
          }
        }).then(function (response) {
          return response.json();
        }).then(function (data) {
          var graphQL = _this4.props.graphQL === true;

          if (graphQL) {
            if (data.errors && data.errors.length) {
              var errorMessage;

              if (data.errors.length === 1 && data.errors[0].message) {
                errorMessage = '[GraphQL Error]: ' + data.errors[0].message;
              } else {
                var errorTextGraphQLErrors = typeof _this4.props.errorTextGraphQLErrors === 'string' ? _this4.props.errorTextGraphQLErrors : '{count} GraphQL Errors occured. See console for full details.';
                errorMessage = errorTextGraphQLErrors.replace('{count}', data.errors.length);
              }

              console.error(data.errors);
              throw errorMessage;
            }
          }

          if (_this4._isMounted) {
            _this4.setState({
              fetchState: 1,
              data: graphQL ? data.data : data
            });
          }

          if (_this4.props.loadOnlyOnce) {
            saveDataToCache(_this4.props.url, _this4.props.query, _this4.getUrlParams(), graphQL ? data.data : data);
          }
        }).catch(function (error) {
          if (_this4._isMounted) {
            _this4.setState({
              fetchState: -1,
              error: error.toString()
            });
          }
        }).finally(function () {
          _this4._isFetching = false;

          _this4.updateView();
        });
      });
    }
  }, {
    key: "handleChange",
    value: function handleChange() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (this._isMounted) {
        this.setState({
          data: data === null ? this.state.data : data
        });
      }
    }
  }, {
    key: "updateView",
    value: function updateView() {
      if (typeof this.props.onViewUpdated === 'function') {
        try {
          this.props.onViewUpdated();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(React.Fragment, null, React.createElement(IsLoading, {
        fetchState: this.state.fetchState
      }, this.props.isLoading), React.createElement(HasError, {
        fetchState: this.state.fetchState,
        error: this.state.error
      }, this.props.hasError), React.createElement(IsLoaded, {
        fetchState: this.state.fetchState,
        data: this.state.data,
        params: this.state.params,
        handleChange: this.handleChange
      }, this.props.isLoaded));
    }
  }]);

  return JsonData;
}(React.Component);

exports.JsonData = JsonData;

var LazyLoad = function (_React$Component4) {
  _inherits(LazyLoad, _React$Component4);

  function LazyLoad(props) {
    var _this5;

    _classCallCheck(this, LazyLoad);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(LazyLoad).call(this, props));
    _this5.state = {
      isReady: false
    };
    return _this5;
  }

  _createClass(LazyLoad, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this6 = this;

      this.loadScripts(this.props.scripts, this.props.loadScriptsInOrder).then(function () {
        _this6.setState({
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

exports.LazyLoad = LazyLoad;

var LeafletMap = function (_React$Component5) {
  _inherits(LeafletMap, _React$Component5);

  function LeafletMap(props) {
    var _this7;

    _classCallCheck(this, LeafletMap);

    _this7 = _possibleConstructorReturn(this, _getPrototypeOf(LeafletMap).call(this, props));
    _this7.div = React.createRef();
    return _this7;
  }

  _createClass(LeafletMap, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var lat = parseFloat(this.props.latitude);
      var long = parseFloat(this.props.longitude);
      var zoom = parseInt(this.props.zoom, 10);
      var markerText = this.props.marker;
      var numAttr = [{
        attr: 'latitude',
        value: lat
      }, {
        attr: 'longitude',
        value: long
      }, {
        attr: 'zoom',
        value: zoom
      }];

      for (var n = 0, m = numAttr.length; n < m; n++) {
        if (isNaN(numAttr[n].value)) {
          console.error('<LeafletMap> - Invalid Prop for [' + numAttr[n].attr + '], value was not a number.');
          console.log(numAttr[n].attr);
          console.log(this.props);
          return;
        }
      }

      var map = L.map(this.div.current).setView([lat, long], zoom);
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      }).addTo(map);

      if (markerText !== null) {
        var marker = L.marker([lat, long]).addTo(map);

        if (markerText) {
          marker.bindPopup(markerText);
        }

        marker.openPopup();
      }
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement('div', {
        className: 'leaflet-map',
        ref: this.div
      });
    }
  }]);

  return LeafletMap;
}(React.Component);

exports.LeafletMap = LeafletMap;

var SortableTable = function (_React$Component6) {
  _inherits(SortableTable, _React$Component6);

  function SortableTable(props) {
    var _this8;

    _classCallCheck(this, SortableTable);

    _this8 = _possibleConstructorReturn(this, _getPrototypeOf(SortableTable).call(this, props));
    _this8.sortColumn = _this8.sortColumn.bind(_assertThisInitialized(_this8));
    _this8.table = React.createRef();
    return _this8;
  }

  _createClass(SortableTable, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.setupTable();
    }
  }, {
    key: "setupTable",
    value: function setupTable() {
      var table = this.table.current;

      if (table.tHead === null) {
        console.warn('Unable to setup sorting for table because there is no <thead> element');
        console.log(table);
        return;
      } else if (table.tHead.rows.length === 0) {
        console.warn('Unable to setup sorting for table because the <thead> element contained now rows');
        console.log(table);
        return;
      }

      if (table.tBodies.length === 0) {
        console.warn('Unable to setup sorting for table because the <tbody> element is missing');
        console.log(table);
        return;
      } else if (table.tBodies.length !== 1) {
        console.warn('Unable to setup sorting for table because there can only be one <tbody> element for the table');
        console.log(table);
        return;
      }

      var row = table.tHead.rows[table.tHead.rows.length - 1];

      for (var cellIndex = 0, cellCount = row.cells.length; cellIndex < cellCount; cellIndex++) {
        row.cells[cellIndex].addEventListener('click', this.sortColumn);
        row.cells[cellIndex].style.cursor = 'pointer';
      }
    }
  }, {
    key: "sortColumn",
    value: function sortColumn(e) {
      var cell = e.target;
      var table = cell && cell.parentElement && cell.parentElement.parentElement ? cell.parentElement.parentElement.parentElement : null;

      if (!(cell.tagName === 'TH' || cell.tagName === 'TD')) {
        console.warn('SortableTable.sortColumn() was called with an invalid element. If called manually the cell needs to be passed.');
        console.log(cell);
        return;
      }

      if (table !== null && table !== undefined && table.tagName !== 'TABLE') {
        console.warn('SortableTable.sortColumn() was called with an invalid element. If called manually the table cell of the last row from the table header should be used.');
        console.log(cell);
        return;
      }

      var lastColumn = table.getAttribute('data-sort-column');
      var cellIndex = cell.cellIndex;
      var sameColumn = lastColumn !== null && parseInt(lastColumn, 10) === cellIndex;
      var sortOrder = 'asc';

      if (sameColumn) {
        var lastOrder = table.getAttribute('data-sort-order');
        sortOrder = lastOrder === 'asc' ? 'desc' : 'asc';
      }

      var tbody = table.tBodies[0];
      var tableRows = tbody.rows;
      var sortRows = [];

      for (var rowIndex = 0, rowCount = tableRows.length; rowIndex < rowCount; rowIndex++) {
        var rowCell = tableRows[rowIndex].cells[cellIndex];

        if (rowCell === undefined) {
          continue;
        }

        var value = rowCell.getAttribute('data-value');
        var cellText = value !== null ? value.trim() : rowCell.textContent.trim();

        var cellType = _typeof(cellText);

        if (cellText === '') {
          cellText = null;
        } else if (!isNaN(cellText)) {
          cellText = parseFloat(cellText);
        } else {
          var dateValue = new Date(cellText);

          if (!isNaN(dateValue.getTime())) {
            cellText = dateValue;
            cellType = 'date';
          } else {
            cellText = cellText.toLocaleLowerCase !== undefined ? cellText.toLocaleLowerCase() : cellText.toLowerCase();
          }
        }

        sortRows.push({
          row: tableRows[rowIndex],
          value: cellText,
          type: cellText === null ? null : cellType
        });
      }

      sortRows.sort(this.sortCompare);

      if (sortOrder === 'desc') {
        sortRows.reverse();
      }

      var cssOdd = table.getAttribute('data-sort-class-odd');
      var cssEven = table.getAttribute('data-sort-class-even');
      var hasCSS = cssOdd && cssEven;
      var displayCount = 0;

      for (var n = 0, m = sortRows.length; n < m; n++) {
        var row = sortRows[n].row;

        if (hasCSS && row.style.display !== 'none') {
          displayCount++;

          if (displayCount % 2 === 0) {
            row.classList.add(cssEven);
            row.classList.remove(cssOdd);
          } else {
            row.classList.add(cssOdd);
            row.classList.remove(cssEven);
          }
        }

        tbody.appendChild(row);
      }

      table.setAttribute('data-sort-column', cellIndex);
      table.setAttribute('data-sort-order', sortOrder);
    }
  }, {
    key: "sortCompare",
    value: function sortCompare(a, b) {
      if (a.type === null && b.type !== null) {
        return -1;
      } else if (b.type === null && a.type !== null) {
        return 1;
      } else if (a.type === null && b.type === null) {
        return 0;
      }

      if (a.type === 'number' && b.type !== 'number') {
        return -1;
      } else if (b.type === 'number' && a.type !== 'number') {
        return 1;
      } else if (a.type === 'number' && b.type === 'number') {
        return a.value - b.value;
      }

      if (a.type === 'date' && b.type !== 'date') {
        return -1;
      } else if (b.type === 'date' && a.type !== 'date') {
        return 1;
      } else if (a.type === 'date' && b.type === 'date') {
        if (a.value < b.value) {
          return -1;
        } else if (a.value > b.value) {
          return 1;
        } else {
          return 0;
        }
      }

      if (a.type === 'string' && b.type === 'string') {
        if (a.value.localeCompare !== undefined) {
          return a.value.localeCompare(b.value);
        } else {
          if (a.value < b.value) {
            return -1;
          } else if (a.value > b.value) {
            return 1;
          } else {
            return 0;
          }
        }
      }

      console.warn('A code change from [SortableTable] impacted sorting and caused an expected error so the data may appear out of order. Please review your code changes');
      return 0;
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement('table', Object.assign({}, this.props, {
        ref: this.table
      }), this.props.children);
    }
  }]);

  return SortableTable;
}(React.Component);

exports.SortableTable = SortableTable;

var DataFormsJS = function () {
  function DataFormsJS() {
    _classCallCheck(this, DataFormsJS);
  }

  _createClass(DataFormsJS, null, [{
    key: "Cache",
    get: function get() {
      return Cache;
    }
  }, {
    key: "ErrorBoundary",
    get: function get() {
      return ErrorBoundary;
    }
  }, {
    key: "Format",
    get: function get() {
      return Format;
    }
  }, {
    key: "I18n",
    get: function get() {
      return I18n;
    }
  }, {
    key: "InputFilter",
    get: function get() {
      return InputFilter;
    }
  }, {
    key: "JsonData",
    get: function get() {
      return JsonData;
    }
  }, {
    key: "LazyLoad",
    get: function get() {
      return LazyLoad;
    }
  }, {
    key: "LeafletMap",
    get: function get() {
      return LeafletMap;
    }
  }, {
    key: "SortableTable",
    get: function get() {
      return SortableTable;
    }
  }]);

  return DataFormsJS;
}();

exports.DataFormsJS = DataFormsJS;
;