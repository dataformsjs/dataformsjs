(function () {
"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Format = function () {
  function Format() {
    _classCallCheck(this, Format);
  }

  _createClass(Format, [{
    key: "number",
    value: function number(value) {
      return this.formatNumber(value, {});
    }
  }, {
    key: "round",
    value: function round(value) {
      var decimalPlaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var intlOptions = {
        style: 'decimal',
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces
      };
      return this.formatNumber(value, intlOptions);
    }
  }, {
    key: "currency",
    value: function currency(value, currencyCode) {
      var intlOptions = {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2
      };
      return this.formatNumber(value, intlOptions);
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
      return this.formatNumber(value, intlOptions);
    }
  }, {
    key: "date",
    value: function date(value) {
      return this.formatDateTime(value, {});
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
      return this.formatDateTime(value, intlOptions);
    }
  }, {
    key: "time",
    value: function time(value) {
      var intlOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      };
      return this.formatDateTime(value, intlOptions);
    }
  }, {
    key: "isNumber",
    value: function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
  }, {
    key: "formatDateTime",
    value: function formatDateTime(dateTime, options) {
      if (window.Intl === undefined) {
        return dateTime;
      }

      try {
        if (_instanceof(dateTime, Date)) {
          return new Intl.DateTimeFormat(navigator.language, options).format(dateTime);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) {
          var nums = dateTime.split('-').map(function (n) {
            return parseInt(n, 10);
          });
          var date = new Date(nums[0], nums[1] - 1, nums[2]);
          return new Intl.DateTimeFormat(navigator.language, options).format(date);
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
  }, {
    key: "formatNumber",
    value: function formatNumber(value, options) {
      var language = navigator.language ? navigator.language : navigator.userLanguage;

      if (value === null || value === '') {
        return null;
      }

      if (!this.isNumber(value)) {
        console.warn('Warning value specified in DateFormsJS function formatNumber() is not a number:');
        console.log(value);
        return value;
      }

      if (window.Intl === undefined) {
        var style = options.style ? options.style : null;
        var maximumFractionDigits = options.maximumFractionDigits ? options.maximumFractionDigits : 0;

        if (style === 'percent') {
          return (value * 100).toFixed(maximumFractionDigits) + '%';
        }

        var digitGrouping = null;
        var decimalMark = null;
        var currencySymbol = null;

        switch (language) {
          case 'en-us':
            digitGrouping = ',';
            decimalMark = '.';
            currencySymbol = '$';
            break;
        }

        if (digitGrouping !== null) {
          var numberParts = value.toString().split('.');
          numberParts[0] = numberParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          var formattedValue = numberParts.join(decimalMark);

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
  }]);

  return Format;
}();

window.Format = Format;
})();