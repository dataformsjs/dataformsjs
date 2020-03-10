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

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var InputFilter = function (_React$Component) {
  _inherits(InputFilter, _React$Component);

  function InputFilter(props) {
    var _this;

    _classCallCheck(this, InputFilter);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(InputFilter).call(this, props));
    _this.onChange = _this.onChange.bind(_assertThisInitialized(_this));
    _this.input = React.createRef();
    return _this;
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

exports.default = InputFilter;