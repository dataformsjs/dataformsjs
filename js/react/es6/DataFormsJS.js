/**
 * DataFormsJS Namespace for React Components
 * 
 * This file can be used with `create-react-app` so that all DataFormsJS Components
 * can be imported from a single file.
 * 
 * Import Example:
 *     import { JsonData, Format } from './DataFormsJS/js/react/DataFormsJS.jsx';
 *     import DataFormsJS, { JsonData, Format } from './DataFormsJS/js/react/DataFormsJS.jsx';
 * Then use:
 *     <JsonData>
 *     const format = new Format();
 * 
 * Or use import default namespace directly:
 *     import DataFormsJS from './DataFormsJS/DataFormsJS.jsx';
 *     <DataFormsJS.JsonData>
 *     const format = new DataFormsJS.Format();
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import ErrorBoundary from './ErrorBoundary.js';
import JsonData from './JsonData.js';
import InputFilter from './InputFilter.js';
import SortableTable from './SortableTable.js';
import Format from './Format.js';
import I18n from './I18n.js';
import LeafletMap from './LeafletMap.js';
import LazyLoad from './LazyLoad.js';
import Cache from './Cache.js';

/**
 * Create and export all Components under the default DataFormsJS namespace
 */
const DataFormsJS = {
    ErrorBoundary: ErrorBoundary,
    JsonData: JsonData,
    InputFilter: InputFilter,
    SortableTable: SortableTable,
    Format: Format,
    I18n: I18n,
    LeafletMap: LeafletMap,
    LazyLoad: LazyLoad,
    Cache: Cache,
};
export default DataFormsJS;

/**
 * Export all individual Components
 */
export {
    ErrorBoundary,
    JsonData,
    InputFilter,
    SortableTable,
    Format,
    I18n,
    LeafletMap,
    LazyLoad,
    Cache,
};
