/**
 * DataFormsJS Namespace for React Components
 * 
 * This file can be used with [create-react-app] so that all DataFormsJS Components
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

import PolyfillService from './PolyfillService.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import JsonData from './JsonData.jsx';
import InputFilter from './InputFilter.jsx';
import SortableTable from './SortableTable.jsx';
import Format from './Format.js';
import I18n from './I18n.js';

/**
 * Create and export all Components under the default DataFormsJS namespace
 */
const DataFormsJS = {
    PolyfillService: PolyfillService,
    ErrorBoundary: ErrorBoundary,
    JsonData: JsonData,
    InputFilter: InputFilter,
    SortableTable: SortableTable,
    Format: Format,
    I18n: I18n,
};
export default DataFormsJS;

/**
 * Export all individual Components
 */
export {
    PolyfillService,
    ErrorBoundary,
    JsonData,
    InputFilter,
    SortableTable,
    Format,
    I18n,
};
