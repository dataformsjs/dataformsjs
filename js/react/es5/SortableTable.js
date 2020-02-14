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

var SortableTable = function (_React$Component) {
  _inherits(SortableTable, _React$Component);

  function SortableTable(props) {
    var _this;

    _classCallCheck(this, SortableTable);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SortableTable).call(this, props));
    _this.sortColumn = _this.sortColumn.bind(_assertThisInitialized(_this));
    _this.table = React.createRef();
    return _this;
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

exports.default = SortableTable;