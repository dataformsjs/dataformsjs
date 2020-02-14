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

var LeafletMap = function (_React$Component) {
  _inherits(LeafletMap, _React$Component);

  function LeafletMap(props) {
    var _this;

    _classCallCheck(this, LeafletMap);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(LeafletMap).call(this, props));
    _this.div = React.createRef();
    return _this;
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

exports.default = LeafletMap;