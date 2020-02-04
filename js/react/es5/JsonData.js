"use strict";

if (window.exports === undefined) { window.exports = window; }

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

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * DataFormsJS React Component <JsonData>
 *
 * <JsonData> allows a page or elements on a page to use JSON web services quickly
 * and easily in a dynamic manner and depending on the state of the web service
 * will show or hide components from [isLoading, isLoaded, hasError].
 *
 * Examples:
 *     https://www.dataformsjs.com/examples/places-demo-react.htm
 *     https://www.dataformsjs.com/examples/image-classification-react.htm
 *
 * Example Usage:
 *     function ShowOrderPage({match}) {
 *         return (
 *             <JsonData
 *                 url="https://example.com/orders/:orderType/:orderId"
 *                 orderType={match.params.orderType}
 *                 orderId={match.params.orderId}
 *                 isLoading={<ShowLoading />}
 *                 hasError={<ShowError />}
 *                 isLoaded={<ShowOrder />}>
 *             </JsonData>
 *         )
 *     }
 *
 * The above example assumes <ShowLoading>, <ShowError>, and <ShowOrder>
 * are components defined by the app and <ShowOrderPage> with {match.params.*}
 * are passed from router such as React Router:
 *     <Route path="/orders/:orderType/:orderId" component={<ShowOrderPage />} />
 *
 * [orderType] and [orderId] are defined dynamically on <JsonData> and
 * will passed to <ShowOrder> as:
 *     {props.params.orderType}
 *     {props.params.orderId}
 *
 * The downloaded data will be available in <ShowOrder> as:
 *     {props.data}
 *
 * Additionally if a component needs to update the state of the downloaded data
 * from <JsonData> it can be done from the [isLoaded] component by calling:
 *      this.props.handleChange();
 * or to overwrite [state.data]:
 *      this.props.handleChange({prop1, prop2, etc});
 *
 * For example if the Web Service returned:
 *     { orderId:123, totalAmount:999.99, lineItems:[] }
 * Then you can use:
 *     {props.data.orderId}
 *     {props.data.totalAmount}
 *     {props.data.lineItems.map(...)}
 *
 * Minimal Setup:
 *     Only [url] and [isLoaded] are required:
 *         <JsonData url="https://example.com/data" isLoaded={<ShowData />} />
 *
 * Additional Properties:
 *     <JsonData
 *         ...
 *         loadOnlyOnce={true}
 *         onViewUpdated={callback}
 *         fetchOptions={{}}
 *         fetchHeaders={{}}>
 *     </JsonData>
 *
 * [loadOnlyOnce] defaults to undefined/{false} so data and state are always reloaded
 * when the component is created. In a SPA this would happen each time the page
 * changes. For an SPA that needs to show many pages with real-time data this is
 * ideal, however if you data does not change often or if the state should be kept
 * between page changes then use [loadOnlyOnce={true}]. A good example of this is
 * the demo page [DataFormsJS\examples\image-classification-react.htm]; in the demo
 * if [loadOnlyOnce] is not {true} then images would reset during page changes but
 * because it is set to {true} the images are kept and the state remains valid even
 * if clicking to another page in the SPA while images are sitll being classified
 * from the web service.
 *
 * [onViewUpdated] is an optional callback that can be used to handle custom DOM
 * updates after data has been fetched and state has been set. It would not be common
 * to use in most React Apps however if you want to execute standard JS to manipulate
 * or read DOM once data is ready then this property can be used. An example of this
 * is shown in [DataFormsJS\examples\log-table-react.htm]
 *
 * [fetchOptions] and [fetchHeaders] allow for the app to control the request options
 * and send request headers for the component. The default options used are:
 *     {
 *         mode: 'cors',
 *         cache: 'no-store',
 *         credentials: 'same-origin',
 *     }
 *
 * @link     https://www.dataformsjs.com
 * @author   Conrad Sollitt (http://www.conradsollitt.com)
 * @license  MIT
 */
var dataCache = [];

function saveDataToCache(url, params, data) {
  for (var n = 0, m = dataCache.length; n < m; n++) {
    var cache = dataCache[n];

    if (cache.url === url) {
      cache.params = JSON.stringify(params);
      cache.data = data;
      return;
    }
  }

  dataCache.push({
    url: url,
    params: JSON.stringify(params),
    data: data
  });
}

function getDataFromCache(url, params) {
  for (var n = 0, m = dataCache.length; n < m; n++) {
    var cache = dataCache[n];

    if (cache.url === url) {
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

  if (!show) {
    return null;
  }

  return React.cloneElement(props.children, {
    data: props.data,
    params: props.params,
    handleChange: props.handleChange
  });
}

var JsonData = function (_React$Component) {
  _inherits(JsonData, _React$Component);

  function JsonData(props) {
    var _this;

    _classCallCheck(this, JsonData);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(JsonData).call(this, props));
    _this._isFetching = false;
    _this._isMounted = false;
    _this.fetchData = _this.fetchData.bind(_assertThisInitialized(_this));
    _this.handleChange = _this.handleChange.bind(_assertThisInitialized(_this));
    _this.state = {
      fetchState: 0,
      error: null,
      params: _this.getUrlParams(),
      data: null
    };
    return _this;
  }

  _createClass(JsonData, [{
    key: "getUrlParams",
    value: function getUrlParams() {
      var params = {};

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

      if (this.props.loadOnlyOnce) {
        var data = getDataFromCache(this.props.url, this.getUrlParams());

        if (data !== null) {
          this.setState({
            fetchState: 1,
            data: data
          });
          return;
        }
      }

      this.fetchData();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      var prevUrl = this.buildUrl(prevState.params);
      var newUrl = this.buildUrl(this.props);

      if (prevUrl !== newUrl) {
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

      if (Object.keys(params).length > 0) {
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
      var _this2 = this;

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

      this.setState({
        fetchState: 0
      }, function () {
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
          if (_this2._isMounted) {
            _this2.setState({
              fetchState: 1,
              data: data
            });
          }

          if (_this2.props.loadOnlyOnce) {
            saveDataToCache(_this2.props.url, _this2.getUrlParams(), data);
          }
        }).catch(function (error) {
          if (_this2._isMounted) {
            _this2.setState({
              fetchState: -1,
              error: error.toString()
            });
          }
        }).finally(function () {
          _this2._isFetching = false;

          _this2.updateView();
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
        this.props.onViewUpdated();
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

exports.default = JsonData;