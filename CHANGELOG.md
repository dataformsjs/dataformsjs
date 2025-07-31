# DataFormsJS Change Log

DataFormsJS uses [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

Overall the core Framework files, React Components, and Web Components and API are expected to remain stable however the version number is expected to increase to much larger numbers in the future due to the changes to smaller scripts and components. This change log includes all npm release history and new website features or major changes.

## 5.14.6

* Thanks for Aaron Huggins https://github.com/aaronhuggins for submitting and update to the jsxLoader
* Support emitting the end of tag name when newline and tab are used: https://github.com/dataformsjs/dataformsjs/pull/24

## Documentation (Feb 14, 2025)

* Thank you to Andrés https://github.com/andr33sdev of Buenos Aires, Argentina for helping with Spanish Translations.

## 5.14.5 (Sep 9, 2024)

* Security update for the starter/example webserver that is included with the main project.
  * The file [app.js](https://github.com/dataformsjs/dataformsjs/blob/master/server/app.js) uses a custom express-like API with a minimal web server which allows DataFormsJS examples to run using Node.js built-in features and no outside dependencies.
  * A Path traversal vulnerability was found with credit thanks to Hamidreza Hamidi and [Jafar Akhoundali](https://github.com/JafarAkhondali/).
  * The issue was `decodeURIComponent` was called out of order allowing for Proof-of-concept (POC) Path traversal attacks on a local developer machine using URLs such as `http://127.0.0.1:8080/..%2fpackage.json` or `bash
127.0.0.1:8080/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd`
  * This impacts the development download of the project but not the NPM published release.
* Replaced CDN https://unpkg.com/ with https://www.jsdelivr.com/
  * The property `jsxLoader.babelUrl` was changed and can be set back to unpkg if needed by setting the URL prior to the page being loaded.
  * All example pages and apps referenced unpkg for React and related libraries.
  * Even though IE is no longer supported it still works on legacy Windows Servers but unpkg blocks it from downloading CDN content. Given this fact, its possible they may block other browsers in the future so switching to jsDelivr helps avoid issues were code could break and it allows jsxLoader plus all React examples to work out of the box for IE again.
* Updated several ImageGallery React and Web Components so that css `@media screen and (-ms-high-contrast: active), screen and (-ms-high-contrast: none) {}` would only be included if the browser is IE 11.
  * Edge browser started giving a deprecation warning when using this CSS media query.
  * Additionally, the main site, the playground site, and many examples were updated to dynamically handle the CSS media query for IE but not other browsers.
* Fixed Unit Tests for React and Preact pages
  * https://dataformsjs.com/unit-testing/react
  * https://dataformsjs.com/unit-testing/preact
  * `http://127.0.0.1:4000/unit-testing-react`
  * `http://127.0.0.1:4000/unit-testing-preact`
  * The pages were previously using the latest CDN version of [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/); however their was a breaking change so now specific CDN versions are used rather than the latest version.
* Updated Unit Tests to run from Port 4000 instead of Port 5000 because Port 5000 is now used by default on Mac for AirPlay and was causing a conflict when running tests on a Mac.

## 5.14.4 (Aug 19, 2024)

* Replace all instances of the Polyfill Service `https://polyfill.io/v3/polyfill.min.js?` with `https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?version=4.8.0&`
  * This is due to a supply chain attack against the popular JS Polyfill Library and site `polyfill.io`.
  * https://cdnjs.cloudflare.com/polyfill/
  * https://www.akamai.com/blog/security/2024-polyfill-supply-chain-attack-what-to-know
  * Based on how the Polyfill is loaded for DataFormsJS this error would have only affected users of IE (as of 2024 this is mainly old Windows Servers in a corporate environment).

## 5.14.3 (Jan 29, 2023)

* jsxLoader Update so that JSX Files are compiled and added to the page only after all files are downloaded
  * Related Issue: https://github.com/dataformsjs/dataformsjs/issues/22
  * Previously JSX files were asynchronously download, compiled, and added to the page in the order that they downloaded.
  * This caused issues when files downloaded in an unexpected order. 
* **Special Thanks to m1sta for opening this issue and providing great examples to show the error** https://github.com/m1sta

## 5.14.2 (Jan 29, 2023)

* Web Components - Renamed function `[utils.js].isAttachedToDom()` to `[utils.js].isDomAttached()` because the text string `ToDom` would show up when searching source code for case-insensitive `todo`. This is a minor update but prevents the files from showing up in external projects by accident. This could be considered a breaking change if an app calls the function but that is unlikely the case and it's mostly an internal function because it's undocumented outside of the changelog; that is the reason why a patch version is being released.

## 5.14.1 (Dec 7, 2022)

* Fixed a bug in Web Component `<json-data>` that was introduced on the previous build where `format.{func}` was not working in `[data-show]` attributes.

## 5.14.0 (Nov 28, 2022)

* Added ability to use HTML Attribute `[data-format]` from Web Component `<url-router>` when using attribute `[url-param]`. The same functionality when using Web Component `<json-data>` with attribute `[data-bind]` is provided.
  * This includes using `data-format="number|date|dateTime|time|{function}"` and custom functions.
  * `js/web-components/url-router.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/url-router.js
* Updated Image Gallery Controls/Components:
  * Fixed issue where `pinch-to-zoom` on mobile devices would cause previous/next image navigation to occur.
  * `js/web-components/image-gallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/image-gallery.js
  * `js/plugins/imageGallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/imageGallery.js
  * `js/react/es6/ImageGallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/ImageGallery.js

## 5.13.1 (May 2, 2022)

* Update Code Comments on React Component `<JsonData>`
  * Previously `@license` was included in the main comment which resulted in [Vite](https://vitejs.dev/) including about 5 kB (uncompressed) and about 1.5 kB of extra code on the build process.
  * Comments were updated so that they are not included on build resulting in smaller files.
* Update Framework, React, and Web Components for Date/Time formatting:
  * Update for `en-US` to use format `{date} {time}` instead of `{date}, {time}` because most people in the US (and software programs) do not use the comma while Chrome uses the comma.

## 5.13.0 (February 25, 2022)

* DataFormsJS App Object
  * `~/js/DataFormsJS.js`
  * New Feature - Pass HTML Attributes as Properties to HTML Controls
    * This is similar in concept to passing props with React or Vue and allows easy and quick customization of content in the HTML control.
  * Update - When manually calling `app.refreshHtmlControl()` nested HTML controls are now rendered
  * Fix typo in error message
  * Example of the new features is being published on the Handlebars Places Demo:
    * https://dataformsjs.com/examples/places-demo-hbs.htm
    * All pages with Excel and CSV export pass prop to a HTML Control
    * Search Screen renders nested HTML control when `app.refreshHtmlControl()` is called from the JS Control `<json-data>`
* Web Components - Component Class
  * `~/js/web-components/Component.js`
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/Component.js
  * Update so that props defined with `camelCase` will be available as `dashed-case` from HTML Observable Attributes
  * Update HTML Observable Attributes to convert strings to correct type for true, false, null and empty values
  * Example is being published with the Web Components Places Demo:
    * https://www.dataformsjs.com/examples/places-demo-web.htm
* Framework Plugins - Excel and CSV Export
  * `~/js/plugins/exportToCsv.js`
  * `~/js/plugins/exportToExcel.js`
  * Add support so that elements using the plugin are refreshed when `app.refreshHtmlControl()` is called.
  * Minor fix handled by using `onRendered(rootElement)` instead of `onRendered()`.
  * For Excel text columns were the the max character width is less than 20 an extra 2 pixels of space will be added so content better fits.
* I18N update
  * Framework Plugin `~/js/plugins/i18n.js`
  * Web Component `~/js/web-components/i18n-service.js`
  * Added ability to find and replace i18n keys inside of an attribute string by using syntax `[[key]]`
    * Example `data-export-file-name="[[Countries]].xlsx" data-i18n-attr="data-export-file-name"`
    * Previously both `Countries` and `Countries.xlsx` would have had to be defined for each language
    * Now only `Countries` has to be defined
    * For Vue apps this applies to the `v-i18n-attr` directive

## 5.12.1 (February 19, 2022)

* Excel Export (Web Component and Framework Plugin)
  * Default `data-worksheet-name` to `data-export-file-name` excluding file extension `.xlsx` if the attribute is not included
  * Trim spaces for text fields
  * Set header style (gray fill color, bold, etc) only on the cells used rather than the entire row
* CSV Export (Web Component and Framework Plugin)
  * Trim spaces for text fields

## 5.12.0 (February 16, 2022)

* Add Excel Export functionality
  * Web Component:
    * `~/js/web-components/export-to-excel-service.js`
    * https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/export-to-excel-service.js
  * Framework Plugin:
    * `~/js/plugins/exportToExcel.js`
    * https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/exportToExcel.js
  * Both Web Component and Framework Plugin have the same behavior
  * Exports happen directly in the browser through JavaScript and no server-side calls are made which makes the export/download appear almost instantly to the user.
  * The script uses the external library ExcelJS and the first time the user exports an Excel file this service will download ExcelJS from a CDN. The generated Excel file contains a fixed header row using a gray and bold style and a filter set. The width of columns is based on the data. ExcelJS has many formatting options so if you need something similar or a custom version of this script then this file provides a good starting point for custom Excel Development.
  * https://github.com/exceljs/exceljs/
* Update CSV Export to export only visible rows by default
  * A new HTML attribute `[data-export-all]` was added to always export all rows regardless of filter.
* Add and updated Examples for this:
  * Log Demos
    * https://dataformsjs.com/examples/log-table-vue.htm#/10
    * And all other Log demos
  * New Export Table Demo - Web Components
    * https://dataformsjs.com/examples/export-table-web.htm
    * `~/examples/export-table-web.htm`
    * https://github.com/dataformsjs/dataformsjs/blob/master/examples/export-table-web.htm
  * New Export Table Demo - Framework
    * https://dataformsjs.com/examples/export-table-js.htm
    * `~/examples/export-table-js.htm`
    * https://github.com/dataformsjs/dataformsjs/blob/master/examples/export-table-js.htm
* Updated Framework `dataBind` plugin to bind global `window.*` variables for a basic webpage if not using SPA
* Updated Framework Control `data-table` to not show an error when an empty table is displayed without `data-bind`

## 5.11.0 (February 8, 2022)

* Updated DataFormsJS Framework to support JavaScript classes
  * Originally the DataFormsJS Framework was designed and developed prior to ES6 being supported among Web Browsers. Because of this custom app code was designed around ES5. This update allows for custom app code (Pages and Plugins) to use classes rather than objects which allows for modern style JavaScript development.
  * Functions updated and added for the main App object:
    * https://github.com/dataformsjs/dataformsjs/blob/master/js/DataFormsJS.js
    * `app.addPage()`
    * `app.addPlugin()`
    * `app.getClassFunctionNames()` - New function
  * Bug fix with Chosen Plugin for IE
    * https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/chosen.js
  * New class version of the core `jsonData` page object:
    * `js/pages/classes/JsonData.js`
    * All variables and functions from the original file exist in the new one. The purpose of the new file is so that an app can extend it for custom page logic when defining pages as ES6 classes rather than ES5 objects.
  * Replaces all occurrences of `String.prototype.substr()` with `String.prototype.substring()`. IDE's such as VS Code show `substr()` as depreciated because it is a non-standard function.
  * Updated `package.json` to use the latest and specific versions of `@babel/standalone`, `terser`, and `uglify-js` for the build process. This makes the build process work across systems as expected.
  ```js
  // Framework updates to support Classes

  app.addPage('name', class Page {
      onRouteLoad() {}
      onBeforeRender() {}
      onRendered() {}
      onRouteUnload() {}
  })

  app.addPlugin('name', class Plugin {
      onRouteLoad() {}
      onBeforeRender() {}
      onRendered() {}
      onRouteUnload() {}
  })

  class MyPage extends JsonData {
      onRendered() {
          console.log('MyPage.onRendered()')
      }
  }
  app.addPage('MyPage', MyPage);
  ```

## 5.10.6 (January 6, 2022)

* Updated jsxLoader to for additional JSX syntax from issues 20 and 21.
  * jsxLoader: Less than operator assumed to be an open element - https://github.com/dataformsjs/dataformsjs/issues/20
  * jsxLoader: Uncaught SyntaxError: Unexpected token ',' - https://github.com/dataformsjs/dataformsjs/issues/21
  * **Special Thanks to Björgvin Ragnarsson (nifgraup) for opening these issues and providing great examples to show the error** https://github.com/nifgraup

## Web Server Updates (December 30, 2021)

* The main site, the playground site, and the ai-ml service (along with several other open source projects) where migrated to a new server (1 server instead of 5).
  * The server code requires very little resources or memory so it didn't make sense to run 5 servers.
  * See the new setup doc at: https://github.com/fastsitephp/fastsitephp/blob/master/docs/server-setup/server-setup.sh
  * The GraphQL Service used by FastSitePHP now supports the GraphiQL IDE which allows developers to try it without having to install it locally. Link and example queries:
    * https://www.dataformsjs.com/graphql
    * https://www.dataformsjs.com/graphql?query=%7Bcountries%7Biso,country%7D%7D
    * https://www.dataformsjs.com/graphql?query=query($country:String!)%7Bregions(country:$country)%7Bname%7D%7D&variables=%7B%22country%22:%22US%22%7D

## 5.10.5 (November 12, 2021)

* Updates for DataFormsJS Markdown Components
  * All 3 versions updated:
    * Web Component `<markdown-content>`
    * Framework Control `<markdown-content>`
    * React Component `<Markdown>`
  * Add support for marked version `4.#` which was released earlier this month. Previously version 3 was supported.
  * Both versions 3 and 4 are now supported.


## 5.10.4 (September 30, 2021)

* No code changes however two `.DS_Store` where accidentally published to npm so this release excludes them
  * These are Mac system files created automatically by finder when viewing a folder
  * They are excluded from Github using rules from `.gitignore`, however npm published them
  * In general these files cause no issues but they are binary files so malicious authors can use them for attacks which is why they do not belong in npm or git

## 5.10.3 (September 27, 2021)

* Updated jsxLoader to support functions that return JSX elements inside of props.
  * This is related to https://github.com/dataformsjs/dataformsjs/issues/19
  * **Special Thanks to ilovedesert001 for opening this issue and providing a great example and for helping with testing** https://github.com/ilovedesert001

## 5.10.2 (September 25, 2021)

* Updated `<json-data>` Web Component
  * Added HTML Attribute `manual-fetch-mode`, that if defined on an element prevents the web service from running when the page first loads. This allows for scenarios where one user may need to see the data and another user may not based on permissions. When this attribute is defined the `fetch()` method can be used to download the data.
  ```html
  <json-data url="..." manual-fetch-mode>
  ```
  ```js
  document.querySelector('json-data[manual-fetch-mode]').fetch()
  ```

## 5.10.1 (September 3, 2021)

* Updated the new Animation Service and Plugin to include an optional property for specifying `intersectionRatio`
  *
  ```html
  <animation-service intersection-ratio="0.3"></animation-service>

  <script>
    // Framework Plugin Property
    app.plugins.animation.intersectionRatio = 0.3
  </script>
  ```

## 5.10.0 (September 3, 2021)

* Added new `sourceMaps` property to `jsxLoader`
  * This allows for easier debugging from Browser DevTools. This has been tested and confirmed to work with recent versions of Chrome/Edge, Firefox, and Safari.
  * Requires `isSupportedBrowser` set to `false` so that Babel Standalone is used as the compiler.
  * Example usage:
  ```js
  jsxLoader.isSupportedBrowser = false;
  jsxLoader.sourceMaps = true;
  ```
  * This is related to issue https://github.com/dataformsjs/dataformsjs/issues/18
  * **Special Thanks to Yang Zhao for opening this issue** https://github.com/yangzhaox This issue helped improved how debugging works with the JSX Loader
* Added Animation Plugin and Web Component
  * `js/plugins/animation.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/animation.js
  * `js/web-components/animation-service.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/animation-service.js
  * `js/web-components/animation-service.css` https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/animation-service.css
  * Demos:
    * https://dataformsjs.com/examples/animation-web.htm
    * https://dataformsjs.com/examples/animation-js.htm

## 5.9.1 (August 6, 2021)

* Web Component `<json-data>`
  * Updated logic related to the HTML `onready` event attribute to only run JavaScript code if the `<json-data>` is still connected to the page when the web service completes.
  * For SPA if the user clicks of the page on a long running task then fetch will still be running but the element will not longer be connected.
  * This would result in an error being shown to the user if an expected element or other item is missing from the page.
  * In the example below if the user clicked of the page quickly an error alert would be displayed by default, this update prevents the code from running so the end user has a better and expected experience.
  ```html
    <json-data onready="() => { document.getElementById('element1').textContent = document.getElementById('element2').textContent; }"
  ```

## 5.9.0 (June 5, 2021)

* Added a Generic base `Component` class for Web Components that extends `HTMLElement`
  * `js/web-components/Component.js`
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/Component.js
  * This class can be used to speed development of custom Web Components by reducing the amount of code needed to create components.
  * https://www.dataformsjs.com/examples/custom-web-components.htm

## 5.8.1 (April 29, 2021)

* Update `<data-list>` Web Component to clear `innerHTML` when an empty list is passed to the `value` property.
  * This matches the intended behavior for applications and matches the Framework JavaScript `<data-list>` Control
  * An example of when this would happen is on a search screen. If the previous search returned data and the next search returns an error then both error and past data would show. This fixes the issue.
* Update functions `format.date()`, `format.dateTime()`, `format.time()` to handle null or empty strings
  * Update affects related code for all version:
    * Web Components: `js/web-components/utils-format.js`
    * React Class: `js/react/es6/Format.js`
    * Framework: `js/extensions/format.js`
  * Example of the issue
    * If Web Component `<data-table>` or other templating code called `<td>${format.date(startDate)}</td>` and `startDate` was null then the value `12/31/1969` would be displayed because it's the starting Unix time.
    * The previous work-around was to use logic in the templating code like this: `<td>${startDate === null ? '' : format.date(startDate)}</td>`

## 5.8.0 (March 24, 2021)

* JSX Loader Updates
  * Improvements for Legacy Browsers (IE, UC Browser, Legacy Edge, etc)
    * Add default support for destructuring assignment using spread operator, previously this was available but required extra config. This is commonly used with reducers (both Redux and native React Hooks).
    * Updated version of `@babel/standalone` from `7.12.9` to `7.12.12`. At the time of release Babel is update to version `7.13.12` however builds starting at `7.12.13` have a broken regex for IE
  * Add support for `<hr/>`. With previous releases `<hr/>` caused a compiler error while including the space `<hr />` worked.
* DataFormsJS Framework `app`
  * Updated CDN Version for `css-vars-ponyfill` from `2.4.2` to `2.4.3` and added support for CSS Ponyfill/Polyfill on inline `<style>` elements that include the attribute `data-css-vars-ponyfill`
* Added Class `CssVars` for React
  * Allows for ability to define CSS Variable Polyfill/Ponyfill automatically for older browsers.
  * Previously some of the examples had custom code included directly on each page to make this happen.
  * Now a `[data-css-vars-ponyfill]` attribute simply needs to be included on the style sheet, example:
  ~~~html
  <link rel="stylesheet" href="css/site.css" data-css-vars-ponyfill>
  ~~~
  * Then call `CssVars.ponyfill()` from JavaScript
  * This class is available in the root DataFormsJS React Namespace
  * When used this automatically downloads and runs `css-vars-ponyfill` one time when the page is first loaded.
  * https://github.com/jhildenbiddle/css-vars-ponyfill
  * As of 2021 this will mostly used on sites that support IE 11. Unless a very old version of Mobile Safari or Android Device is used they will typically support CSS Variables.

## 5.7.1 (March 6, 2021)

* Updated Framework `filter.js` Plugin to handle `sort.js` classes `data-sort-class-odd` and `data-sort-class-even` when using table column filters (typically for a click to filter event). Previously the classes were handled for general table filters.

## 5.7.0 (February 3, 2021)

* Added Features to `<data-table>` Web Component and Framework Control
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/data-table.js
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/controls/data-table.js
  * Added support for Footer templates when using new attribute `data-footer` with either `<template data-footer>` or `<script type="text/x-template" data-footer>`
  * A `<tfoot>` element will be rendered and it allows for summary functions to report off of table details:
    * `count()`
    * `sum('field')`
    * `min('field')`
    * `max('field')`
    * `avg('field')`
  * Try demo `http://127.0.0.1:8080/web-components-data-table` and view source https://github.com/dataformsjs/dataformsjs/blob/master/examples/web-components-data-table.htm
* Added `format.round(number, decimalPlaces)`, function added for Web Components, Framework, and React Class:
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/utils-format.js
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/extensions/format.js
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/Format.js
* React `<JsonData>` Component
  * Added new property `childProps` which can be used to pass props from a higher level component to the child components in the `isLoaded` property. This can be used to pass hook functions and data needed by the child component that doesn't come from the Web Service.
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/JsonData.js
* Updated `app.jsTemplate.compile()` to support an array for the first parameter.
  * This was added for new features related to `<data-table>`
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/extensions/jsTemplate.js

## 5.6.1 (January 4, 2021)

* Fix to load CSS Variable Polyfill/Ponyfill from Web Components `polyfill.js` for basic Web Pages when not SPA

## 5.6.0 (January 4, 2021)

* Web Components
  * Added new Web Components based on Framework Plugins
    * `<export-to-csv-service>` based on `js/plugins/exportToCsv.js`
    * `<highlighter-service>` based on `js/plugins/highlighter.js`
    * `<filter-service>` based on `js/plugins/filter.js`. This service Web Component would be used instead of `<input is="input-filter">` for apps that use clickable elements to filter and other advanced functionality not included in the smaller `input-filter` Component.
    * Example for all new Components is provided in `http://127.0.0.1:8080/log-table-web-services#/10`
  * Updated `<nav is="spa-links">` to include new option `[data-nav-match="start"]`
  * Bug Fix for function `setElementText()` from file `js/web-components/utils.js`
    * Elements `input, select, textarea` were having the `innerText` set rather than the `value` property to to a string compare error
    * Affected `<json-data>` for `[data-bind]` and `<url-router>` for `[url-param]`
* Framework Updates
  * Added ability to define CSS Variable Polyfill/Ponyfill automatically for older browsers.
    * Previously the main site and a number of examples had custom code included directly on each page to make this happen.
    * Now a `[data-css-vars-ponyfill]` attribute simply needs to be included on the style sheet, example:
    ~~~html
    <link rel="stylesheet" href="css/site.css" data-css-vars-ponyfill>
    ~~~
    * When used this automatically downloads and runs `css-vars-ponyfill` one time when the page is first loaded.
    * https://github.com/jhildenbiddle/css-vars-ponyfill
    * As of 2021 this will mostly used on sites that support IE 11. Unless a very old version of Mobile Safari or Android Device is used they will typically support CSS Variables.
    * This feature includes new a function `app.cssVarsPonyfill()` and a new property `app.settings.cssPonyfillUrl`
  * `js/plugins/exportToCsv.js` - Added support to export using `[data-value]` attributes if they exist. `data-value` is used for Sorting and if used contains the expected number or date format needed for exporting.
  * Updated `js/plugins/navLinks.js` to include new option `[data-nav-match="start"]`
* Set `enumerable: true` for the `version` property. Affects two files:
  * Main `DataFormsJS.js` file
  * React `jsxLoader.js` file

## 5.5.0 (December 13, 2020)

* Web Component `<json-data>`
  * Added setter properties for `url` and `urlParams`. Previously only getters were defined and this resulted in the Component not working with Preact.
  * With this release DataFormsJS Web Components now work with Preact in addition to React
  * Demo:
    * https://www.dataformsjs.com/examples/web-components-with-preact.htm
* Started including `version` property for two files:
  * Main `DataFormsJS.js` file
  * React `jsxLoader.js` file
  * The version property is updated automatically from `scripts/build.js` using the value from `package.json` when the version changes. Version is included in the full source `DataFormsJS.js, jsxLoader.js` and in the `*.min.js` files.
  ```js
  // Framework
  DataFormsJS.version === '5.5.0'
  app.version === '5.5.0'

  // JSX Loader
  jsxLoader.version === '5.5.0'
  ```
* JSX Loader
  * Added default fetch options for fetching JSX Templates
  * To use different options set this as soon as the script is loaded and before the document `DOMContentLoaded` event runs.
  * The default options provide for flexibility with 'cors', prevention of caching issues with 'no-store', and security by using 'same-origin' for `credentials`.
  ```js
  // New default options
  jsxLoader.fetchOptions = {
    mode: 'cors',
    cache: 'no-store',
    credentials: 'same-origin',
  };

  // Previously `null` was used for `fetch(url, null)` so the following
  // can be used if needed or `fetchOptions` can be customized for apps
  // that need to use security to fetch JSX Templates:
  jsxLoader.fetchOptions = null;
  ```
* React Components
  * Updated the ES5 build for all React Components so that the compiled code from Babel is enclosed in Immediately Invoked Function Expressions (IIFE) and only needed Component and Classes are assigned to the global `window` object.
  * The resulting code is slightly smaller for each Component and variables intended for private module scope are no longer made available globally.

## 5.4.1 (December 9, 2020)

* Web Component `<markdown-content>`
  * Fix so that loading screen shows when using `url, show-source, loading-selector` attributes together.
  * DOM event order would trigger the loading screen to clear when using `show-source` while content from `url` was still being downloaded.
  * Example Code:
  ```html
  <markdown-content
    url="https://raw.githubusercontent.com/dataformsjs/dataformsjs/master/README.md"
    show-source
    loading-selector="#loading-screen">
  </markdown-content>
  ```
  * Online basic example:
    * https://dataformsjs.com/examples/markdown-web.htm

## 5.4.0 (December 4, 2020)

* React jsxLoader
  * Added support for `data-type="module"` on scripts. This feature was added on Babel Standalone `7.10.0`
    * See Babel Standalone Docs: https://babeljs.io/docs/en/babel-standalone
  * Updated Babel Standalone CDN Version used for old browsers from `7.12.6` to the latest version `7.12.9`.
* Updated all NPM Dev Dependencies to use latest version for Build and Minification

## 5.3.1 (December 2, 2020)

* Web Component `<input is="input-filter">` could previously run too soon for long running web services when the content was waiting on data downloaded from `<json-data>`. The result was `0 Records Found` message depending on the app. This has now been fixed.
* Web Component Polyfill File now sets `window.usingWebComponentsPolyfill = true` as soon as the file will be used. This allows for apps to handle logic much quicker when `DOMContentLoaded` is handled.
* Framework Control `<markdown-content>` has an added `value` property to match the API of the related Web Component.

## 5.3.0 (November 24, 2020)

* **Thanks crazy4groovy** for helping with ideas to help improve the documentation related to `jsxLoader` updates with this release!
  * https://github.com/crazy4groovy
  * https://github.com/dataformsjs/dataformsjs/issues/17
* Updates for DataFormsJS Markdown Components
  * All 3 versions updated:
    * Web Component `<markdown-content>`
    * Framework Control `<markdown-content>`
    * React Component `<Markdown>`
  * Added option to sanitize the HTML for security if DOMPurify is loaded: https://github.com/cure53/DOMPurify
  * Added new attributes and props that allow links to be updated after the content has rendered. These attributes make it easy to show content that links to other sites correctly and for the current page not to be changed when the user clicks a link.
  * Added default option that updates relative links and images based on the path of the Markdown Document. The option can be turned off through HTML Attributes or a React Prop.
  * Performance update for React Component so that Markdown is rendered to HTML outside of the React Component `render()` function.
  * Added ability to optionally cache up to 100 markdown fetched downloads in memory if using related HTML Attributes or Component Props. The component can easily be customized to allow a larger number or fewer items.
  * See code examples for full details, more detailed documentation will be published in the near future.
    * Source:
      * https://github.com/dataformsjs/dataformsjs/blob/master/examples/markdown-react.htm
      * https://github.com/dataformsjs/dataformsjs/blob/master/examples/markdown-react.jsx
      * https://github.com/dataformsjs/dataformsjs/blob/master/examples/markdown-web.htm
      * https://github.com/dataformsjs/dataformsjs/blob/master/examples/markdown-vue.htm
      * https://github.com/dataformsjs/dataformsjs/blob/master/examples/markdown-hbs.htm
    * Online Examples:
      * https://www.dataformsjs.com/examples/markdown-react.htm#/
      * https://www.dataformsjs.com/examples/markdown-web.htm
      * https://www.dataformsjs.com/examples/markdown-vue.htm
      * https://www.dataformsjs.com/examples/markdown-hbs.htm
* Memory and API improvements for the DataFormsJS Framework core function so if `app.loadJsControl(element)` is called and the control is already loaded on screen it will be re-used rather than have multiple references in memory. Use of the specific API was not needed in the past outside of internal Framework calls however with the new Web Components Polyfill it now has practical use for apps.

## 5.2.0 (November 23, 2020)

* Add React Component `<Markdown>`
  * Based on DataFormsJS Web Component `<markdown-content>`
  * The DataFormsJS `<Markdown>` React Component makes it easy to display markdown content from a web service or URL:
  ~~~jsx
  const url = "https://raw.githubusercontent.com/dataformsjs/dataformsjs/master/README.md"
  <Markdown url={url} />
  <Markdown url={url} isLoading={<IsLoading />} className="markdown" />
  ~~~
* Fix `js/web-components/markdown-content.js` so that it shows it shows the correct background color and full CSS styles for Code Syntax when using `highlight.js`. With previous releases this worked with the Framework version `js/controls/markdown-content.js`
* Updates for both Framework and Web Component `<markdown-content>`
  * Fix issue where there were running `highlight.js` against the document rather than only elements under `<markdown-content>`
  * Added default use of `remarkable.linkify` plugin when using Remarkable
  * Added error handling to display an error through `showError()` or `app.showError()` for Markdown fetch errors. For example if a 404 occurs.
* Framework Control now makes requests through `app.fetch()` so that custom security or other app defined Request Headers will be included.
* `<nav is="spa-links">` Web Component - Set links on initial `connectedCallback()` event. Previously it was first called based on router events however this caused a timing issue depending on when the file was loaded in related to the `<url-router>`.

## 5.1.1 (November 21, 2020)

* Several of the `*.min.js` files were built showing `version 5.0.2` in the header comments. Package has been republished to show correct version.

## 5.1.0 (November 21, 2020)

* Changes will likely be published to NPM this weekend (November 21 or 22 of 2020)
* Add Web Component and Framework JavaScript Control for viewing Markdown:
  * `js/web-components/markdown-content.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/markdown-content.js
  * `js/controls/markdown-content.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/controls/markdown-content.js
  * The `<markdown-content>` components use one of 3 widely used Markdown Libraries: [marked](https://github.com/markedjs/marked), [markdown-it](https://github.com/markdown-it/markdown-it), and [remarkable](https://github.com/jonschlinkert/remarkable)
  * Additionally if [highlight.js](https://github.com/highlightjs/highlight.js) is included on the page it will be used for Syntax Highlighting.
  * Options are preset, however the Web Component and related JS Control are small in size and easy to modify if you have a site with different markdown needs.
* Optimizations for `js/web-components/polyfill.js` so that it downloads fewer files on page load and has improved flexibility for adding addition Web Components in the future.

## 5.0.2 (November 20, 2020)

* Fixed Web Component `<nav is="spa-links">` so that it works on Safari.

## 5.0.1 (November 19, 2020)

* Added attribute `data-filter-search-text` to `js/web-components/input-filter.js` based on Framework version from `js/plugins/filter.js`.

## 5.0.0 (November 19, 2020)

### Credits / Thanks!

* **Thanks ElevateBart** for helping with the idea and API proposal related to `jsxLoader` updates with this release: https://github.com/elevatebart
  * https://github.com/dataformsjs/dataformsjs/issues/16
  * The result is that jsxLoader can not be used from both node and webpack without side effects. Originally jsxLoader was intended only for browser use and it would always check if polyfills or babel standalone were needed based on the browser environment. Now this can be turned off.

### Release Overview

* **Many updates have been made for overall improvement of DataFormsJS Web Components**
  * The updates are significant and make using the Web Components much easier for complex apps and sites; and provide for wider browser support.
  * The new features make for an easier to use API for customizing content on page after data is displayed. Previously the places demo required a lot of custom JavaScript on the page in order to display flag icons, format table data, and additional items.
  * Added ability to polyfill Web Components for older browsers using the standard Framework that gets loaded from a single file and then that file `polyfill.js` loads additional framework files as needed.
  * Web Components have been updated for full support with React (16 and 17) and React Router. Additionally Web Components have been tested and have partial support for Vue 2 and Vue 3 when using Vue Router.
  * Web Component Examples:
    * https://www.dataformsjs.com/examples/hello-world/en/web.htm
    * https://www.dataformsjs.com/examples/hello-world/en/web-url-router.htm
    * https://www.dataformsjs.com/examples/places-demo-web.htm
    * https://www.dataformsjs.com/examples/log-table-web.htm#/10
    * https://www.dataformsjs.com/examples/countries-no-spa-web.htm
    * https://www.dataformsjs.com/examples/image-gallery-web.htm
    * `http://127.0.0.1:8080/image-classification-web`
    * `http://127.0.0.1:8080/web-components-with-react`
    * `http://127.0.0.1:8080/web-components-with-vue`
    * `http://127.0.0.1:8080/web-components-template`
    * `http://127.0.0.1:8080/web-components-data-list`
    * `http://127.0.0.1:8080/web-components-format`
    * `http://127.0.0.1:8080/hacker-news-web`
  * Added new easier to use API for `<url-router>` and `<json-data>` Web Components
  * Added ability to define custom `<template>` for table `<tr>` in `<data-table>`
  * Improvements for `<json-data>`
    * Added option for formatting text from  (date, time, number, custom functions, etc)
    * Added ability to use new attribute `click-selector` for search forms similar to the main Framework.
    * Added `data-show="js-expression"` to show or hide items. It works similar to Vue `v-show`.
    * Added ability to include global variables from window scope using `{variable}` syntax
      * `<json-data url="{rootApiUrl}/web-service">`
      * `window.rootApiUrl = 'http...';`
      * This allows an SPA site that contains many different HTML files with the same Root URL to point to the server from one location rather than updating each file.
      * Any variable name can be used as long as it is defined. This allows for rapid testing or changes to point to a different server when using `<json-data>`.
      * The actual update exists in `[utils.js].buildUrl()`.
      * A similar update has been made for the main DataFormsJS Framework `app.buildUrl()`.
    * Added new attribute `[transform-data]` that allows for a JavaScript function to be specified and used to transform the downloaded data before it is passed to other elements.
  * Added new Web Component `<nav is="spa-links">`. Previously SPA Nav Links were handled from custom JavaScript code on the page. Now this functionality is much easier for a site to include as only HTML is needed.
  * `<url-router>` and `<url-hash-router>` are now combined into one component `<url-router>` and `<url-hash-router>` has been removed.
  * `<url-router>` now has the ability to lazy load scripts (CSS and JavaScript) per route in a similar manner to the main framework using the new `window.lazyLoad` option and related HTML Attributes.
  * New Class `WebComponentService` which can be used to define "service" Web Components
    * The term "service" is used here because the intended use is that components created with this class do not render content but rather provide a service that updates other elements on the page based on HTML attributes element class names, etc. and that the service needs to run when content on the page changes from SPA routes or JSON Services.
    * This is a similar concept to the DataFormsJS Framework Plugins feature allowing for custom functionality to be defined easily and with little API code outside of standard DOM and JavaScript.
    * This will be used by all DataFormsJS Web Components that end with "service" in the component name.
  * Added new Web Component `<data-view>` and related Framework JavaScript Control for viewing data from `<json-data>` or other web components.
  * Added new Web Component `<keydown-action-service>`. Based on Framework Plugin `js/plugins/keydownAction.js`
  * Added new Web Component `<html-import-service>`. Based on standard framework features for `[data-template-url]` and `[data-template-id]`.
  * Added new Web Component `<show-errors-service>`. Based on standard framework features for `<html data-show-errors>`.
  * Added new Web Component `<prism-service>`. Based on Framework Plugin `js/plugins/prism.js`
  * Added ability to style errors using CSS from `utils.js` when calling `showError(element, message)` or `showErrorAlert(message)`.
  * New functions in `utils.js`: `loadCss(id, css)`, `isAttachedToDom(element)`
  * Added `[X]` Close Button for `js/web-components/old-browser-warning.js` so that users can close the alert. With the new close button using `js/web-components/safari-nomodule.js` is no longer needed, however the file is still being kept for reference and sites that want to customize and use it.
  * `js\web-components\data-list.js`
    * Added HTML attribute `root-attr` which allows for any attribute to be set on the root element. Previously only the `class` could be set from `root-class`. The attribute `root-class` is still supported.
  * For `<url-router>` and DataFormsJS Framework when using HTMl5 History Mode (pushState, popstate) the Mac `Command` Key is now supported so users can open SPA links in a separate tab. Previously the only the `{Control}` key worked which is used on Windows for new tags and on Mac for a context menu (right-click menu).

* **DataFormsJS React Components and jsxLoader Updates**
  * Minor bug fix where empty data props were not parsed correctly in a specific condition if this previous prop was not empty; this was found when updating Web Components for full React Support.
  * Added Node Support for jsxLoader
  * Added ability for jsxLoader to run from webpack (or in a browser) without any side effects if only the compiler is needed. Documentation will be updated after npm release on how this can be handled.
  * Previously `jsxLoader` only worked in a browser.
  * jsxLoader is now available as a node API and it works in the browser.
  * Added new compiler settings and options:
  ~~~js
  jsxLoader.compiler.pragma = 'React.createElement';
  jsxLoader.compiler.pragmaFrag = 'React.Fragment';
  jsxLoader.compiler.maxRecursiveCalls = 1000;
  // The above setting replaces `jsxLoader.maxRecursiveCalls` so it's a breaking
  // change, however it's mostly just an internal property for unit testing and
  // for safety in the event of an unexpected error.

  jsxLoader.compiler.addUseStrict = true;
  // By default "use strict"; is now added to the top of compiled JS code if
  // does not already exist. This can be turned off by setting `addUseStrict = false`.
  // This behavior is similar to the latest version of Babel 7.

  // Added new code hint that is supported by Babel:
  /* @jsxFrag Vue.Fragment */
  ~~~
  * Updated the CDN version of Babel Standalone used for old browsers from `7.10.4` to `7.12.6`
  * Added improved error message for compile errors where the number of opening tags did not match the number of closing tags. Previously some of these errors were only caught at runtime and not compile time.
  * Updated `.eslintrc.js` for improved syntax validation when using VS Code with `*.jsx` example and test files
  * When calling `jsxLoader.usePreact` a global `React` variable pointing to `preact` will be assigned to `window` by default if not already set and Preact is loaded.
  * ES6 `*.min.js` Components can now be loaded in a web browser using `[type="module"]`. Previously only the ES5 min files could be loaded in a browser.
  ~~~html
  <!-- Previous Release typical CDN usage -->
  <script src="dataformsjs/js/react/es5/DataFormsJS.min.js"></script>

  <!--
    With the latest release of DataFormsJS modern browsers can use the smaller files with
    modern code syntax while legacy browsers still the es5 build.
  -->
  <script type="module" src="dataformsjs/js/react/es6/DataFormsJS.min.js"></script>
  <script nomodule src="dataformsjs/js/react/es5/DataFormsJS.min.js"></script>
  ~~~
  * `Format` class has several functions added that were previously private scoped in the module:
    * `isNumber(n)`
    * `formatDateTime(dateTime, options)`
    * `formatNumber(value, options)`
    * They are mostly internal so for usage view the source code.

* **Enhancements for DataFormsJS Framework files and general updates:**
  * Added `app.updateTemplatesForIE(rootElement)`. IE 11 considers `<template>` elements as valid elements so it applies `querySelector()` and related methods to elements under `<templates>`'s so replace with them `<script type="text/x-template">`. This avoids issues of `<template>` elements that contain embedded content. Previously this was only handled once per page load but now is handled (for IE only) when views are rendered.
  * Added features in `js/plugins/dataBind.js` based on the Web Components version.
  * New file `js/extensions/format.js` which is used with the Web Components Polyfill
  * Updated `js/plugins/filter.js` so that it shows 0 count for empty tables. Previously it expected the table to have at least one `<tbody>` element. A similar update was made for `js/web-components/input-filter.js`
  * Previously if using `<template>` with `jsonData` page types all `.is-loading, .has-error, .is-loaded` elements could quickly flash on screen during page changes. This has been fixed.
  * Routes and JavaScript controls will have empty data HTML attributes mapped to `true` by default instead of an empty string. Previously `data-load-only-once="true"` was used on many pages but now only `data-load-only-once` is required. Additionally `null` is now supported as an option.
  * `js/plugins/i18n.js`
    * Added `app.plugins.i18n.getUserDefaultLang()`
    * The following global API was added so that it can be used easily with templating or by app custom logic. This was based on the Web Component verison which uses simple JavaScript templating and basic functions.
      ~~~js
      window.i18n_Locale = 'en|fr|es|zh-CN'; // Selected language, updated on each page change
      window.i18nText(key) // Returns I18n content for the current page
      ~~~
  * data-load-only-once="true"
* Enhancements for "JavaScript Controls" in the standard Framework. The Framework JavaScript Controls are a similar concept to Web Components but work with all Browsers.
  * Added ability to easily reload  by calling `app.activeJsControls(control)`. Updating already loaded controls is not common but can be used in very specific scenarios. For example the new Web Components Polyfill uses it.
  * Update API to include `model` as a parameter in `control.onLoad(element, model)`
  * Specific controls `<data-table>` and `<data-list>` have significant new functionality based on the matching Web Components that allows for basic templating from HTML. The template syntax is based on JavaScript template literals (template strings) and with the new features basic sites or apps that previously required Handlebars or Vue for templating could possibly use these instead. Use of templating requires using a new file `js/extensions/jsTemplate.js`.
  * Data Attributes for JavaScript controls will not use boolean data types when "true" or "false" are specified. This was created for the new `data-load-only-once` attribute added to `js/controls/json-data.js` for compatability with the Web Components version. A new `fromCache` option was added as a parameter to `onFetch` based on this change.
  * Added new functions `app.unloadUnattachedJsControls()` and `app.unloadJsControl(jsControl)`. They are mostly for internal use but are available for advanced usage if needed.
* Image Gallery Update for Overlay when `title/alt` is not used:
  * All versions updated (Web Component, Framework Plugin, React)
  * By default if title is not used the position `{index}/{end}` is displayed. Previously it aligned to the left of the screen. Now it will be aligned in the right of the screen only if title is missing which matches the behavior if the title is included
  * To change position see the following CSS examples (works in all browsers included IE):
    * `.image-gallery-overlay div.no-title { justify-content: flex-start; }`
    * `.image-gallery-overlay div.no-title { justify-content: center; }`
* Bug fix for `js/pages/entryForm.js` where the `saveUrl` did not allow for variables from the model if the URL of the page did not include any URL parameters.
* All Leaflet code has been updated to download map images using `https` instead of `http`; originally when DataFormsJS was published `https` was not available as a free option for leaflet.
  * Additionally error messages have been improved for Leaflet.
  * Files updates:
    * `<leaflet-map>` Web Component
    * `LeafletMap` React Component and main `DataFormsJS.js` React file
    * `leaflet` Framework plugin.
* Updated dependencies used for building the `*.min.js` files
  * `@babel/standalone` updated from `7.7.7` to `7.12.6`, used to build es5 version of React Components
  * `uglify-js` updated from `3.7.3` to `3.11.6`
  * `eslint` updated from `7.3.1` to `7.13.0`
* Replaced `uglify-es` with `terser` for the minification of React Components and Web Components
  * `*.min.js` files are generated from `npm run build`. Only changed files get updated
  * Build Script `scripts/build.js`
  * `uglify-es` is an abandon projects and `terser` is a widely used fork.
    * https://github.com/terser/terser

### Breaking Changes

For the standard Framework most breaking changes are minor and only expected to affect internal API's and examples. Several Framework "JavaScript Controls" were updated to match behavior of the Web Components in order to provide more features and so they can be used with the new Web Components Polyfill. If you developed a site or app with any of the breaking changes they are quick to update and if you need help please open an issue.

For React Components one component `LeafletMap` and one class `I18n` that would not be commonly used in most apps have been dropped from the core ES5 build file `js/react/es5/DataFormsJS.js`. However new options exist so they (along with all other components and classes) have improved options for loading.
~~~html
<!-- Previous Release included [I18n, LeafletMap] and was ES5 sytnax only for CDN -->
<script src="../js/react/es5/DataFormsJS.min.js"></script>

<!--
  In the places demo the above script was replaced with the following.
-->
<script type="module" src="../js/react/es6/DataFormsJS.min.js"></script>
<script type="module" src="../js/react/es6/I18n.min.js"></script>
<script type="module" src="../js/react/es6/LeafletMap.min.js"></script>

<script nomodule src="../js/react/es5/DataFormsJS.min.js"></script>
<script nomodule src="../js/react/es5/I18n.min.js"></script>
<script nomodule src="../js/react/es5/LeafletMap.min.js"></script>

<!--
  However for most sites this will be enough and it results in a smaller
  download size for the end user and modern code for most users.
-->
<script type="module" src="../js/react/es6/DataFormsJS.min.js"></script>
<script nomodule src="../js/react/es5/DataFormsJS.min.js"></script>
~~~

The Web Components have the most complex breaking changes related to API usage however due to the complexity of the earlier API it's unlikely to affect any site. If a site did use the earlier API it is generally quick to update as well.

* Removed `<url-hash-router>`
  * This can now be replaced with `<url-router>`
  * `<url-router>` previously only worked with HTML5 History Routes `pushState/popstate`. To use history routes now use `<url-router mode="history">`
* `js/web-components/utils.js`
  * Removed `showOldBrowserWarning()`. The feature has been replaced with the new `js/web-components/polyfill.js` and also the file `js/web-components/old-browser-warning.js` now includes a [X] close button so it it runs on Safari 10.1 or an old Chromium browser that doesn't support [nomodule] the user can simply close the alert.
  * Removed `componentsAreSetup()`. This function is no longer needed and the logic related to it's usage prevented Web Components from working with React and was not fully valid based on Custom Element specs because elements were writing HTML attributes on their `constructor()`.
* Web Components API for `<json-data>`, `<url-router>` have been changed significantly. Previously the API required `async/await` from module JavaScript and was complex to use. It has now been simplified so that events bubble up to the document can be handled easily from the root document event listener and so standard JavaScript functions can be called from HTML attributes.
  * **Before Update:** https://github.com/dataformsjs/dataformsjs/blob/c23bf5e4cd9e826c61313877ae0c2d2da6d6f889/examples/places-demo-web.htm
  * **After Update:** https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-web.htm
* Framework JavaScript Controls
  * Dropped support for replacing the control element with a basic element. Example, previously `<json-data>` would have been converted to `<div data-control="json-data">`. Now the `data-control` attribute is added but the element is not converted.
  * This behavior allows for easier to use API from sites and apps that use the `<json-data>` Web Component and Polyfill.
* `js/plugins/filter.js` - Removed error alert for text `Column filter requires a table to be correctly defined` that happened if a table was missing when the filter was loaded. The reason is that it makes sense for certain apps to have a defined filter and only optionally include the table.
* `js/controls/data-table.js` - Replaced `data-source` with `data-bind` and now `<data-table>` will be converted to a `<div>` with a `<table>` in the `<div>` instead of converting to a `<table>` directly. Additionally `<template>` support has been added.
  * Code before Update:
  ~~~html
  <data-table
      class="countries click-to-highlight"
      data-source="countries"
      data-labels="Code, Name, Size (KM), Population, Continent"
      data-i18n-attr="data-labels"
      data-sort
      data-sort-class-odd="row-odd"
      data-sort-class-even="row-even">
  </data-table>
  ~~~
  * Code after Update:
  ~~~html
  <data-table
      data-bind="countries"
      data-labels="Code, Name, Size (KM), Population, Continent"
      data-i18n-attr="data-labels"
      data-table-attr="
          class=countries click-to-highlight,
          data-sort
          data-sort-class-odd=row-odd,
          data-sort-class-even=row-even">
  </data-table>
  ~~~
  * See code comments in examples for more:
    * `http://127.0.0.1:8080/places-demo-js` - https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-js.htm
* `js/controls/data-list.js`
  * Replaced `data-source` with `data-bind` and now `<data-list>` will be converted to a `<div>` with a `<ul>` in the `<div>` instead of converting to a `<ul>` directly.
  * `<template>` support has been added.
* Rename `jsPlugins.js` function `refreshJsPlugins()` to `refreshPlugins()` so it matches the standard Framework.
  * Affects Web Components and React
  * `js/web-components/jsPlugins.js`
  * `js/react/jsPlugins.js`
* Combined Framework Plugins `js/plugins/navList.js` and `js/plugins/navLinks.js`
  * All demos used `navLinks.js` and only the main site used `navList.js`
  * `navList.js` has been deleted but the functionality can now be handled by using `navLinks.js` and setting the following option from JavaScript: `app.plugins.navLinks.itemSelector = 'nav li';`

## 4.8.0 (October 5, 2020)

* Added new API function for Framework plugins for reloading plugin.
  * `app.plugins[name].reload()`
  * This makes using plugins easier for basic HTML pages that are not Single Page Apps (SPA).
  * Example usage, before the update if an basic HTML app make content changes and needed to reload a plugin it would look like this for plugins that needed to call `onRouteUnload()`:
    * ```js
      app.plugins.imageGallery.onRouteUnload();
      app.refreshPlugins();
      ```
    * or:
    * ```js
      app.plugins.imageGallery.onRouteUnload();
      app.plugins.imageGallery.onRendered();
      ```
  * Now a single easier to read line can be used:
    ```js
    app.plugins.imageGallery.reload();
    ```
  * The function gets defined and added automatically by the root `DataFormsJS|app` object when `app.addPlugin()` is called. If a reload function or property already exists on the plugin the no change is made to the plugin.
  * File updated: `js/DataFormsJS.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/DataFormsJS.js
* Added default `cursor: pointer` for React and Framework Image Gallery Controls.
  * Files Updated:
    * `js/plugins/imageGallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/imageGallery.js
    * `js/react/es6/ImageGallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/ImageGallery.js
  * The Web Component Version `js/web-components/image-gallery.js` already had this behavior.

## 4.7.1 (October 1, 2020)

* Fixed warnings that showed up on React DevTools when using development builds. The errors didn't affect production builds of React so it wasn't caught earlier.
  * `js/react/es6/JsonData.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/JsonData.js
  * `js/react/es6/ImageGallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/ImageGallery.js
  * Also related updated all React Examples to not have warnings. Example, replaced `class` with `className` in HTML examples.

## 4.7.0 (October 1, 2020)

* `js/plugins/clickUrlAction.js`
  * Added actions `refresh-plugins` and `call-function`
  * `refresh-plugins` can be used on Vue apps instead of `update-view` which only works for Handlebars and other templating engines
  * `refresh-plugins` is used on the Vue Entry Form Demo https://www.dataformsjs.com/examples/entry-form-demo-vue.htm
  * `call-function` is generic and allows an app to call any global JavaScript function

## 4.6.3 (September 30, 2020)

* Image Gallery Controls
  * Added opacity change on forward and back button hover for desktop users
  * Reason is because the pointer cursor shows for the entire screen so having opacity change on the button hover provides better indication that the button action is different than the image or overlay.
  * All controls updated:
    * `js/web-components/image-gallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/image-gallery.js
    * `js/plugins/imageGallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/imageGallery.js
    * `js/react/es6/ImageGallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/ImageGallery.js

## 4.6.2 (September 30, 2020)

* `js/plugins/listEditor.js` - Bug fix where `<input type="checkbox">` or `<input type="radio">` did not track changes on some modern browsers `Samsung Internet for Android` and `UC Browser - Windows Desktop`. The reason is because `oninput` was used instead of `onchange`. Previously `onchange` was only used for `IE 11` but now it's used for all browsers on checkboxes and radio controls.
* Fixed Local development issue (localhost only) with `UC Browser` where `https://polyfill.io` was not included in the CSP (Content Security Policy)
  * https://github.com/dataformsjs/dataformsjs/blob/master/examples/server.js

## 4.6.1 (September 30, 2020)

* `js/plugins/filter.js` - Previous release included improved filter for `<select>` and `<textarea>` but did not include them on the optimization check if `<input>` was missing.
* `js/web-components/url-router.js` - Removed old commented out functions that were never used but accidently left in code. Fix invalid query selector `a[href^="/"]:not([data-no-pushstate])` that was missing that last `)`. This didn't cause an error on any tested browsers. It would cause an error on IE or older iOS/Safari however those browsers don't support Web Components anyways.
* Additionally the JSX Loader Docs have been updated with additional info on using `<LazyLoad>`
  * https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.md
  * https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.pt-BR.md
  * https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.zh-CN.md

## 4.6.0 (September 29, 2020)

### Release Overview

* This release contains many small updates, in general:
  * Framework Entry Form Scripts now work with Vue. The existing Handlebars demo has been updated and a new Vue demo created.
  * Vue 3.0.0 has been confirmed to work with DataFormsJS. No changes needed from previous release, however some new functions are available for working with Vue.
  * Image Gallery controls are updated for improved User Experience (UX) and better Accessibility on Desktop Computers.
  * Image Gallery now includes support for next-gen images (AVIF and WebP)

### Release Details

* Added features and additional examples pages for Vue
  * All Handlebar Examples now have a corresponding Vue Example
  * All Standard Framework files now support Vue
  * Originally DataFormsJS was created to use Handlebars so until this release not all Framework scripts worked with Vue
* Confirmed Vue 3.0.0 Release works with the Framework, previously earlier Beta and Release Candidate versions were confirmed.
  * https://www.dataformsjs.com/unit-testing/vue-3
  * Most pages currently point to the latest release of Vue 2 `2.6.12` so that they work with IE and older mobile devices
* Added Vue support for the Framework `entryForm` page object and related plugins
  * Both Vue 2 and Vue 3 are supported
  * Scripts Updated:
    * `js/pages/entryForm.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/pages/entryForm.js
    * `js/plugins/listEditor.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/listEditor.js
    * `js/plugins/clickUrlAction.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/clickUrlAction.js
  * New Demo is available for Vue, previously these scripts only worked with template engines such as Handlebars.
  * https://www.dataformsjs.com/examples/entry-form-demo-vue.htm
  * Added support for `hidden` attribute on the `entryForm` page object when using `class="show-after-form-load"` elements. Peviously `style="display:none;"` was required on the element.
* `entryForm.js` - Additional Updates:
  * Improved IE 11 support so that `null` values to not get displayed as `"null"` strings in input elements when adding new records.
  * Replaced Internal Model Prop `textMessages: { savingRecord: 'Saving Record...', deletingRecord, recordSaved, recordDeleted, confirmDelete, }` with `savingRecordText: 'Saving Record...'` and related properties so that apps can overwrite the default action text from an HTML template.
* Add Vue Directive `format-yes-no` to `js/extensions/vue-directives.js`
  * If the case-insensitive value to bind is one of the following `[true, 1, yes]` then `Yes` will be displayed otherwise `No` will be displayed.
* `js/DataFormsJS.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/DataFormsJS.js
  * Added new helper functions for working with Vue
    * `app.isUsingVue()`
    * `app.isUsingVue2()`
    * `app.isUsingVue3()`
    * These function would generally be used by page objects, plugins, etc that need to support both Vue and other templating engines such as Handlebars.
  * Added a helpful `console.error()` message for developers if a `data-lazy-load="name"` script was not found
  * Converted two `console.info` statements to `console.warn`
* `js/extensions/events.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/extensions/events.js
  * Converted two `console.log` statements to `console.error()` statements and added an additional `console.error()`. These provide helpful messages to developers.
* `js/extensions/validation.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/extensions/validation.js
  * Added seperate text message for integer validation: `app.validation.text.typeNumberInt = '[{field}] needs to be entered as a integer.'`. This can be overwritten by an app.
  * Bug fix were `data-type="int|float"` would return `true` for invalid numbers when `parseInt()` and `parseFloat()` failed. This didn't affect the numbers sent to the server and only client-side validation messages.
* Entry Form and List Editor Updates for IE
  * Example Page was previously broken on IE due to `js/pages/entryForm.js` being loaded without a polyfill for `Object.assign`. Using `app.LazyLoad` in the page HTML fixed the example. They entry form and related code worked with IE, simply the example was not working.
    * https://www.dataformsjs.com/examples/entry-form-demo-hbs.htm
  * `js/plugins/listEditor.js` - Fix so that checkbox and radio changes would be tracked. This affected IE 11 because IE 11 was not tracking `element.oninput` for checkboxes and radio inputs.
* Added Framework Plugin for pickadate.js - https://amsul.ca/pickadate.js/
  * `js/plugins/pickadate.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/pickadate.js
  * Example is included on the entry form demos
* `js/plugins/filter.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/filter.js
  * Added new attribute `data-filter-search-text="{{search text}}"` that can be used to specify the text that should be filter rather than the element's `textContent` and `<input>` elements
  * Example usage is on the main site's quick reference page. Previously all text was included in the filter which resulted in too many code templates being returned.
  * With the new feature only the Title text is included in the feature which results in a better user experience (UX).
  * https://www.dataformsjs.com/en/quick-reference
* `js/web-components/data-list.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/data-list.js
  * Added support for `index` enumeration variable in the rendered template.
  * This can be used to add a `tabindex` to the rendered HTML or used with other actions needed by the page.
  * If the list item object already contains and `index` property it will be used instead.
  * Template errors will now show on screen
  * New attribute `error-class` that allows for control over how errors are displayed. If not included they will use a basic style (white text, red background, margin, padding).
  * Updated Example: https://www.dataformsjs.com/examples/web-components-data-list.htm
* Image Gallery Updates
  * `js/web-components/image-gallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/image-gallery.js
  * `js/plugins/imageGallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/imageGallery.js
  * `js/react/es6/ImageGallery.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/ImageGallery.js
  * Update for improved User Experience (UX) on Desktop Computers:
    * All updates are for better Accessibility so that the image gallery can now fully function from either the keyboard or a mouse.
    * Added ability to show the overlay from a press of the spacebar on the keyboard. Previously a mouse click was required to show the overlay.
    * Added `Back` and `Forward` Buttons to the overlay that appear by default for Desktop computers. Previously navigation only worked through the keyboard left and right arrow keys.
    * `Back` and `Forward` Buttons will only show by default on desktop computers when the user clicks the thumbnail image. By default on Mobile devices (determine from `userAgent`) or if using the keyboard spacebar to start the overlay the buttons will now show. The reason is that the buttons can overlap the image so if using a keyboard or swiping on mobile they are not needed (or desired).
    * `Back` and `Forward` Button visibility and other features can be easily changed through CSS from the page.
  * Added support for for next-gen images (AVIF and WebP)
    * See DataFormsJS examples for usage
    * Image Format Details:
      * https://developers.google.com/speed/webp
      * https://jakearchibald.com/2020/avif-has-landed/
* `js/plugins/modalAlert.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/modalAlert.js
  * Removed un-needed `console.log` statement that was left from development
* Added example with code comments for documentation of using CSP (Content Security Policy) with DataFormsJS for the examples when running from localhost
  * https://github.com/dataformsjs/dataformsjs/blob/master/examples/server.js
* Fix Date Formatting in templating functions to use no Timezone with a basic date format `YYYY-MM-DD`.
  * Previously the value would be parsed from `new Date(value)` which resulted in local timezone conversion depending on browser.
  * Updated:
    * React Class `Format.date()` - `js/react/es6/Format.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/Format.js
    * Handlebars Helper `formatDate` - `js/extensions/handlebars-helpers.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/extensions/handlebars-helpers.js
    * Vue Directive `v-format-date` - `js/extensions/vue-directives.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/extensions/vue-directives.js
* `js/plugins/filter.js`
  * Improved filter selection for tables that contain `<input> <select> <textarea>` in the cell nodes
* Click To Highlight Plugin and Related Updates
  * `js/plugins/clickToHighlight.js` - Prevent highlight changes when a `<a>` element is clicked. The reason is because it causes a quick flash of the highlighted style on the row before the page changes. Since the user is clicking to another page rather than highlighting a row the style change is not desired.
  * `js/web-components/data-table.js` - Added similar functionality using new attribute `highlight-class`.
  * React Places Demos have been updated with similar functionality using basic JavaScript functions.
* Updated Places Demo App for Web Components and plain JavaScript version to include custom JS code on the main page to show how Date and Number formatting can be handled
  * https://www.dataformsjs.com/examples/places-demo-web.htm
  * https://www.dataformsjs.com/examples/places-demo-js.htm

## 4.5.5 (September 11, 2020)

* Minor Bug Fix for Image Gallery Controls.
  * A console error could occur on some cases if the user was on a slow device and the image had partialy loaded but they clicked off the overlay because the `Loading...` label was being set with a `hidden` attribute after it was unloaded. An actual error alert would show on the standard framework when using `<html data-show-errors>`.
  * All Versions updated:
    * Framework Plugin: `js/plugins/imageGallery.js`
    * Web Component: `js/web-components/image-gallery.js`
    * React Component: `js/react/es6/ImageGallery.js`
* Confirmed Vue 3 (RC 10) works with the Framework, previously RC 8 was confirmed
  * https://www.dataformsjs.com/unit-testing/vue-3

## 4.5.4 (September 11, 2020)

* Minor UX (User Experience) Improvements for Image Gallery Controls.
  * Updated `Loading...` indicator so that CSS padding and background color match the index and title elements
  * Changed `Loading...` indicator so that it shows if the image takes longer than 2 seconds to load rather than 1 second. On tested mobile devices with low or mid-range bandwidth this was a better interval.
  * On Framework Plugin and Web Component `<img alt="{title}">` can be used for the overlay title if the attribute `title` is missing.
  * All Versions updated:
    * Framework Plugin: `js/plugins/imageGallery.js`
    * Web Component: `js/web-components/image-gallery.js`
    * React Component: `js/react/es6/ImageGallery.js`

## 4.5.3 (September 10, 2020)

* Improvements for UX (User Experience) of Image Gallery Controls so a `Loading...` element is displayed for images that take longer than 1 second to load. Both element and timeout can be changed through the API. All Versions updated:
  * Framework Plugin: `js/plugins/imageGallery.js`
  * Web Component: `js/web-components/image-gallery.js`
  * React Component: `js/react/es6/ImageGallery.js`
  * All example code pages updated for the new feature:
    * https://www.dataformsjs.com/examples/image-gallery-vue.htm
    * https://www.dataformsjs.com/examples/image-gallery-react.htm
    * https://www.dataformsjs.com/examples/image-gallery-hbs.htm
    * https://www.dataformsjs.com/examples/image-gallery-web.htm

## 4.5.2 (September 4, 2020)

* Minor CSS update for `js/web-components/old-browser-warning.js` so that the warning displays full screen width on IE 11 for all or most pages

## 4.5.1  (August 28, 2020)

* Add Default `z-index: 99999` to the overlay in the new Framework Plugin: `js/plugins/modalAlert.js`
  * https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/modalAlert.js

## 4.5.0  (August 28, 2020)

* Add Framework Plugin: `js/plugins/modalAlert.js`
  * Example Usage:
  ~~~html
  <style>
  .modal-overlay .modal-content {
      background-color: black;
      padding: 40px 80px;
      color: white;
      font-size: 1.5em;
  }
  </style>
  <div class="modal-content"
      hidden
      data-show-every="1 day">
    50% OFF SITEWIDE + FREE SHIPPING ON ALL U.S. ORDERS
  </div>
  ~~~
  * Attribute `data-show-every` is optional and allows for simple text to interval conversion, works only with time ranges in a single duration [second(s), minute(s), hour(s), day(s)]. Examples:
      * 30 seconds
      * 1 MINUTE
      * 12 Hours
      * 1 day
  * If the element has an optional [data-hide-on-page-load] attribute then the modal will not be displayed by default and the app can showing it by calling `app.plugins.modalAlert.showModal()`.
  * Plugin is small and easy to copy and customize if an app needs similar behavior

## 4.4.2 (August 13, 2020)

* Minor CSS updates for Image Gallery Controls so that Title and Index `div` displays to a max-width of 1300px. Code comments also updated on different options for overriding the default CSS. All Versions updated:
  * Framework Plugin: `js/plugins/imageGallery.js`
  * Web Component: `js/web-components/image-gallery.js`
  * React Component: `js/react/es6/ImageGallery.js`
* Website Updates (not affecting NPM)
  * Image Gallery Demos
    * Added Example Code and Usage to all Image Gallery Demos
    * Added Vue Demo `http://127.0.0.1:8080/image-gallery-vue`
    * Layout Improvements for IE 11 (Handlebars and React)
  * Added Vue 3 using JSX Experimental Demo: `http://127.0.0.1:8080/examples/hello-world/en/vue3-with-jsx.htm`

## 4.4.1 (August 12, 2020)

* Minor CSS updates for Image Title and Index on Image Gallery Controls so that a light transparent background shows by default. All Versions updated:
  * Framework Plugin: `js/plugins/imageGallery.js`
  * Web Component: `js/web-components/image-gallery.js`
  * React Component: `js/react/es6/ImageGallery.js`

## 4.4.0 (August 12, 2020)

* Bug fix for `js/react/jsxLoader.js` so that the `less than or equal to` operator `<=` is not parsed as an Element
* New Features and Enhancements for Image Gallery plus fixes for IE 11
  * All Versions updated:
    * Framework Plugin: `js/plugins/imageGallery.js`
    * Web Component: `js/web-components/image-gallery.js`
    * React Component: `js/react/es6/ImageGallery.js`
  * Enhancements
    * On mobile devices swiping in the middle of the screen no longer triggers the overlay to close accidently on the click event. Previously this would occur from time to time.
    * Minor performance updates related to preloading images so that the loading code is called only once per image.
  * New Features
    * If `title` attribute is specified on the `img` tag, `image-gallery` web component, or included with data source for React then it will be displayed at the bottom of the screen.
    * Image Index/Position is now displayed be default and can be easily hidden from CSS by the calling app if desired
  * IE 11 Fixes
    * Layout improvements for Image Overlay so image is not cut off on narrow windows (IE flexbox issue)
    * Fixed issue with arrow and escape keys not working
  * Demo Pages:
    * https://www.dataformsjs.com/examples/image-gallery-web.htm
    * https://www.dataformsjs.com/examples/image-gallery-react.htm
    * https://www.dataformsjs.com/examples/image-gallery-hbs.htm

## 4.3.0 (August 11, 2020)

* New Feature - Image Gallery
  * Framework Plugin: `js/plugins/imageGallery.js`
  * Web Component: `js/web-components/image-gallery.js`
  * React Component: `js/react/es6/ImageGallery.js`
  * Demo Pages
    * `examples/image-gallery-hbs.htm`
    * `examples/image-gallery-web.htm`
    * `examples/image-gallery-react.htm`
* New Framework Plugin `js/plugins/onePageSite.js`
  * This plugin allows for one page style web sites where a nav link will scroll to a target element on the page.
  * By default DataFormsJS is used for single page apps however when using this script other framework plugins and controls can be easily used with one page sites.
  * Demo Pages:
    * `examples/one-page-site-hbs.htm`
    * `examples/one-page-and-spa-hbs.htm`
* `js/DataFormsJS.js`
  * Added new API function for plugins `onAllowRouteChange(path)` that allows for plugins to cancel the route from changing on Single Page Apps (SPA)
  * This API function was created for the new `onePageSite.js` plugin
* `js/extensions/handlebars-helpers.js`
  * New Helper function `jsonEncode` - Encode an object as a JSON value, this is useful when adding related object data for an element in a [data-*] attribute of the element.

## 4.2.2 (July 13, 2020)

* `js/react/jsxLoader.js`
  * Added `jsxLoader.globalNamespaces` and improved `jsxLoader.addBabelPolyfills()` so that global namespaces can be defined more with less code and so that more modules are handled automatically. This is being added for a new demo with `React-Toastify` at https://awesome-web-react.js.org/ which will be published after the new release.
  * Added `Object.values` and `Array.prototype.findIndex` to `jsxLoader.polyfillUrl`.
  * Updated 'jsxLoader.babelUrl' from version `7.8.4` to version `7.10.4`. New URL: `https://cdn.jsdelivr.net/npm/@babel/standalone@7.10.4/babel.js`
* Added config file for ESLint `.eslintrc.js` and added `eslint` as a dev dependency in `package.json`
  * All code is valid based on defined rules so no changes to framework code were needed.

## 4.2.1 (June 17, 2020)

* `js/DataFormsJS.js`
  * Improvements for Vue 2 so that long running tasks can still run in the background after a user goes to a new page in an SPA.
  * New setting added `app.settings.clearVue2WatchersOnRouteUnload` which defaults to `false`.
  * Originally Vue 2 Instances View Models were converted back to plain JavaScript objects on route changes to reduce the number of watchers that exist in memory when a models was not for the active page.
  * By default this will result in more Vue watchers being created on SPA's that have many pages, however for pages that have long running functions in the background that update the model the results are more predictable for the user because when they go back to the original page it will show the updates.
  * In general this has a minimal performance impact for most apps but if needed watchers can still be cleared using the new setting.
  * To see how this works try this example: https://www.dataformsjs.com/examples/image-classification-vue.htm
    * When using Vue 2 upload several images then quickly move to another tab while the images are still uploading.
    * After you have clicked off the main page type `app.models` into DevTools and you can see that the model for the main page is a Vue Model.
    * Once you come back to the original page then the prediction should be displayed for each image.
    * Then from DevTools execute `app.settings.clearVue2WatchersOnRouteUnload = true` and try the same steps.
    * If you type `app.models` into DevTools from another page you will now see that the original model is a plain JavaScript object.
    * Once you come back to the original page the images will still show `Loading ...` however there will be fewer Vue watchers for the app.
    * This does not affect Vue 3 or other view engines such as Handlebars because the original model reference is still kept in memory at `app.models`.
* `js/plugins/filter.js`
  * Updated anonymous functions on event handlers to used named function expressions which makes it easier to find the source code from Browser DevTools.
  * Updated code comments in `onRouteUnload()` with more details on how it works with Vue 3 compared to other plugins.
* Started including version number in code comments of several minimized files. This makes it clear which version is being used if referencing the latest version (rather than a specific version) from a CDN. For example: https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/DataFormsJS.min.js
  * `js/DataFormsJS.min.js`
  * `js/react/jsxLoader.min.js`
  * `js/react/es5/DataFormsJS.min.js`
  * `js/web-components/json-data.min.js`
  * `js/web-components/url-hash-router.min.js`

## 4.2.0 (June 16, 2020)

* Added Support for Vue 3 (Beta 15) to the main DataFormsJS Framework, updated files:
  * `js/DataFormsJS.js`
  * `js/controls/json-data.js`
  * `js/extensions/vue-directives.js`
  * `js/plugins/filter.js`
  * `js/plugins/i18n.js`
* For all example pages and the Code Playground Templates Vue 2 can simply be swapped out with Vue 3 and the pages/apps will work as expected.
* Vue 3 is still in Beta so additional updates may be required before or after the final release of Vue 3.
* Vue 2 - Improved support for the `v-cloak` directive to hide the view while it is rendering. Previously this was set on individual elements in the template however for compatibility with both Vue 2 and Vue 3 this is now handled automatically by DataFormsJS on the main view element. By default DataFormsJS adds required CSS for v-clock from the properties `app.vueCss` and `vueStyleId`.
* Vue 2 - Added support for `computed` properties to be defined directly on the page object. Previously `computed` properties had to be defined on the controller object which made it harder to define `computed` properties since controllers are typically setup in HTML rather than JavaScript. Also works with Vue 3. Example usage: `examples/template-files-vue.htm`
* Added support to allow model properties the `filter.js` attributes `data-filter-results-text-all` and `data-filter-results-text-filtered`, example usage: `examples/html/regions-vue.htm` and `examples/html/regions-hbs.htm`

## 4.1.0 (May 21, 2020)

* Web Component `<data-list>` new features for rendering templates from `<template>` elements using [Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
  * The update includes 3 new attributes for `<data-list>`: `[template-selector], [root-element], [root-class]`
  * Example Source: https://github.com/dataformsjs/dataformsjs/blob/master/examples/web-components-data-list.htm
  * Example Demo: https://dataformsjs.com/examples/web-components-data-list.htm
* **Thanks Li Jun Hui and eGirlAsm** for helping with Chinese translations!
  * https://github.com/lijunhuippl
  * https://github.com/eGirlAsm

## 4.0.1 (March 12, 2020)

* `jsxLoader.js` - Fix for incorrect parsing of JavaScript comments nested with-in elements

## 4.0.0 (March 12, 2020)

* Breaking Changes - Relatively minor but they are breaking so a new major release number is being used:
  * Removed previously depreciated `PolyfillService` Component/Class.
  * Removed support for `I18n` without the use of a `fetch` polyfill for legacy browsers.
  * Both of these items are no longer needed due to creation of `jsxLoader.js` and for build tools `create-react-app`, etc Polyfills can be bundled.
* `jsxLoader.js` - General improvements for additional JSX Syntax
  * Fixed issue where links `https://` were being partially parsed as single-line comments inside of an element
  * Improved loop syntax elements needed to be enclosed in a `()` in certain situtations
  ```jsx
    // Before
    {props.data && props.data.categories && props.data.categories.map(category => {
        return (<Category item={category} />)
    })}

    // After
    {props.data && props.data.categories && props.data.categories.map(category => {
        return <Category item={category} />
    })}
  ```
  * Fixed issue where some characters such as '>' were being parsed within prop strings:
  ```jsx
    <InputFilter filter-selector="section.category ul > li" />
  ```
  * Added `Array.prototype.find` to Polyfill Bundle for Legacy Browsers
* Added new JavaScript class `Cache` for simple state caching and re-use with React and Preact Apps.
* React `InputFilter` Component
  * Added a new `afterFilter` property to allow applications to define a custom events once data is filtered
  * Previously if using a label to show filter results from [filter-results-selector] both [filter-results-text-all] and [filter-results-text-filtered] were required; now only one property is required.
* DataFormsJS Framework Object `DataFormsJS.js`
  * Added `app.settings.lazyTemplateSelector` to allow for loading screens between page views when using `app.lazyLoad`. In most cases loading logic is used on actual page content however this helps with the user experince to indicate page change on slow mobile devices and scripts are being loaded.
  * Added `Array.prototype.find` to Polyfill Bundle for Legacy Browsers

## 3.6.2 (February 25, 2020)

* `jsxLoader.js`
  * Added support for Shorthand React.Fragment Syntax `<>`
  * Switched Babel Standalone from Version 6 to Version 7.8.4
  * Switched eval code syntax to use `new Function('"use strict";' + jsxLoader.evalCode)();` instead of `eval(jsxLoader.evalCode);`
  * Load additional Polyfills from `polyfill.io` service and added `jsxLoader.addAdditionalPolyfills()` function.
  * Added additional Unit Tests

## 3.6.1 (February 20, 2020)

* Bug fix `<LazyLoad>` so that it works with Safari on iOS 9 when using Dynamic Components in the `isLoaded` prop.

## 3.6.0 (February 20, 2020)

* Added Web Based Compiler for React/JSX `jsxLoader.js`.
  * For use as an alternative to Babel, webpack, etc
  * Also works for React alternatives including Preact and Alibaba Rax
  * All React Demos on the main web site and repository now use `jsxLoader.js`
  * Added additional demos to the main site for React and initial demos for Preact and Rax
* Added new `LazyLoad` React Component for code splitting of JSX code on large apps and lazy loading of JavaScript and CSS files.
* Added Initial Unit Testing for React Components and the JSX Loader
* `JsonData` Component
  * Added GraphQL Support with new properties:
    * `graphQL={true}`
    * `query="{query}"`
    * `querySrc="{url}"`
    * `variables={}`
* Added `js/scripts/polyfills.js` using feature detection to polyfill `trimStart()`, `trimEnd()`, `trimLeft()`, and `trimRight()`
* With the new features this `PolyfillService` Component/Class is being depreciated and will be removed in a future release. A console warning is provided if using the class. A console warning is also included in the `I18n` class which currently uses either `fetch` or `XMLHttpRequest`.

## 3.5.4 (February 20, 2020)

* `DataFormsJS` - Added pollyfill check and support if `Promise.prototype.finally` is missing. This was found to affect the UC Browser.
* `JsonData` Component
  * Added support for missing `isLoaded` elements so that `JsonData` can be used to ping the server without displaying data. For example `<JsonData url="https://www.dataformsjs.com/data/geonames/countries" />`
  * Update for `onViewUpdated` event so that is called on the initial loading state before data is fetched. Previously it was only called after data has downloaded or if there was an error downloading data.
  * Added Error Handling for custom `onViewUpdated` events. The prevents issues from display data when an error occurs in third-party or app code.
* Improved Support for [Preact](https://preactjs.com) when using React Components
  * React Components ES5 Build Version will detect if `preact` is being used instead of `React` and work automatically
  * `InputFilter` will detect if `preact` is being used as an alias in a web page for `React` and then use `onInput` instead of `onChange`

## 3.5.3 (February 2, 2020)

* Improvements for IE 11
  * Bug fix for when `template` elements were used that included embedded HTML. IE doesn't support the `template` element so DataFormsJS converts them to `script type="text/x-template"` elements when the page is loaded. Previously it simply hide the `template` elements but an edge case error was found when Framework JavaScript controls were used in the embedded templates.
  * Added Cache Busting for IE when `app.fetch()` is called with `cache = no-cache|no-store`. Earlier pre-release versions of DataFormsJS used this but it was removed once the GitHub fetch Polyfill was used.
* Updated Unit Tests so that they work with Firefox and IE 11. Originally Unit Testing occurred in all Browsers but changed to Webkit only prior to the initial release due to time constrains.
* Updates for React Components - Removed the requirement for custom `import and exports` definitions when using `babel-standalone` from a browser.

## 3.5.2 (January 28, 2020)

* `js/DataFormsJS.js` - Bug fix for HTML5 History API nav menus with Safari on iOS 9 (iPad 2, iPhone 6, and older devices)

## 3.5.1 (January 17, 2020)

* Improvments for using `Vue`
  * `js/DataFormsJS.js` - When the Vue Instance Model is destroyed using `$destroy()` it is now added back to the `app.models` cache as a plain JavaScript Object. Minor update so a site will use less memory and allow for easier debugging from Browser Dev Tools.
  * `js/DataFormsJS.js` - When the `mounted()` event is called it waits for `vm.$nextTick` and also calls `app.loadAllJsControls();`
  * `js/controls/json-data.js` - Only assigned key control properties `[isLoading, isLoaded, hasError, errorMessage]` are set to the active Vue Model, this prevents issues with the `js/pages/jsonData.js` and related controllers/pages such as overwritting common controller properties `[url, graphqlId, etc.]`.
  * These improvements for `Vue` improve how framework JS controls work with Vue. Example is on search screen in the places demo: https://www.dataformsjs.com/examples/places-demo-vue.htm#/en/search

## 3.5.0 (January 16, 2020)

* Added ability to use `js/controls/json-data.js` with `Vue`
  * Previously the control only worked with `HandlebarsJS` or other other templating engines and not Virtual DOM.
  * Update includes ablity to use Vue with non-SPA apps.
  * Demos:
    * https://www.dataformsjs.com/examples/countries-no-spa-vue.htm
    * https://www.dataformsjs.com/examples/places-demo-vue.htm#/en/search
* Improvements for `Vue` with the main framework app file `js/DataFormsJS.js`
  * `app.refreshPlugins()` - Plugins do not call the `onRendered()` function until `$nextTick()` of the Active Vue Model
  * `app.updateView()` - Better support for Framework JavaScript Controls by calling `app.loadAllJsControls()` in `$nextTick()` after the Vue Model is initially updated.
* DataFormsJS Namespace for React Components `js/react/es6/DataFormsJS.js` - Added the `LeafletMap` Component
* Edge case bug fix to prevent `app.loadJsControl()` from calling `control.onLoad()` while it is still loading

## 3.4.2 (January 3, 2020)

* HTML5 History API Update so that if [ctrl] is held down when a link is clicked then the click event is ignored so that the link can be opened in a new tab.
  * Affects files `DataFormsJS.js` and `js/web-components/url-router.js`
* React Class `I18n` - Now sets the root `html lang="lang"` attribute when language has been changed
* Updated Build Process to use local npm `devDependencies` from `package.json` rather than Global CLI commands and a Browser-based page for Babel

## Website (December 24, 2019)

* Spanish `es` translations complete for all JSON files on the main site
  * https://www.dataformsjs.com/es/
  * **Thanks Tibaldo Pirela Reyes** for helping with translations! https://github.com/tpirelar

## 3.4.1 (December 23, 2019)

* Fix for `plugins/i18n.js` to read settings before the first route loads, behavior similar to all releases before `3.4.0`.

## 3.4.0 (December 23, 2019)

* New features for i18n Support to use a user's default language for multilingual sites
  * Main `DataFormsJS.js` and `plugins/i18n.js` files work together and use `navigator.languages` to redirect to a user default language when language is not specified in initial URL
  * React Class `I18n`, added property `getUserDefaultLang` which can be used by an app with `supportedLocales` to get the locale for the user

## 3.3.3 (December 11, 2019)

* Readme file update so images show in npm

## 3.3.2 (December 11, 2019)

* Fixed Web Components edge case error if both `utils.js` and `utils.min.js` are used on the same page, error only showed up in console and didn't impact the page. https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/utils.js

## 3.3.1 (December 11, 2019)

* Fixed error `app.routingMode is not a function` when standard plugins `i18n.js, navList.js, navLinks.js` are used with React or Web Components

## 3.3.0 (December 11, 2019)

* Added Support for HTML5 History API
  * Hash URL's and Routing are still used at default
  * To use with the main Framework specify the routing mode in the root HTML element `html data-routing-mode="history"`
  * Main framework file `DataFormsJS.js` updated with new public functions `changeRoute(path), routingMode(), pushStateClick(event)` - https://github.com/dataformsjs/dataformsjs/blob/master/js/DataFormsJS.js
  * Updated Plugins: `i18n.js, navList.js, navLinks.js` - https://github.com/dataformsjs/dataformsjs/tree/master/js/plugins
  * Web Components - Added `url-router` and `url-route` in https://github.com/dataformsjs/dataformsjs/blob/master/js/web-components/url-router.js
  * Web Components Example Page - https://www.dataformsjs.com/examples/hello-world/en/web-url-router.htm

## 3.2.0 (December 6, 2019)

* Plugin `i18n.js` - Changed textContent of `data-i18n-nav-lang` to use specified capitalization rather than upper-case. The previous release `3.1.5` should have actually been `3.2.0` because it introduced new features.

## 3.1.5 (December 4, 2019)

* Plugin `i18n.js` - Added support for i18n nav menus for the selected page and multiple languages with new attributes `data-i18n-nav-lang` and `data-i18n-nav-selected`.

## 3.1.4 (November 29, 2019)

* Updated readme file for npm

## 3.1.3 (November 29, 2019)

* Fixed error when using multiple rendering engines in a single app where changes to the URL source on existing HTML controls would use the wrong rendering engine. Rare edge case error that affected the main site.
* Updated npm package.json file to include the broswer property

## 3.1.2 (November 25, 2019)

* Fixed error from previous fix where plugins that call `next(false)` from `onRouteLoad(next)` would not trigger the next route to finish loading. Affected `js/plugins/i18n.js`.

## 3.1.1 (November 25, 2019)

* DataFormsJS.js - Fix for race conditions where a previous page is still loading and the new page is called multiple times. The errors would only show on pages that use a lot of custom JavaScript and if the user clicks quickly from page to page while services or resources were still loading.

## 3.1.0 (November 25, 2019)

* Web Components - New functions in `js/web-components/utils.js` - `showErrorAlert()` and `showOldBrowserWarning()`
* Web Components - `showOldBrowserWarning()` checks modern browsers that support `script type="module` but do not support custom elements (known to affect MS Edge using the EdgeHTML rendering engine)
* Web Components - Check Old Browsers from `url-hash-router` and `json-data`
* Web Components - Updated all `*.min.js` files to use the `*.min.js` version of related files from import statements

## 3.0.0 (November 21, 2019)

* Web Components - Add polyfill support for specific components for Safari, Samsung Internet, and Edge
  * Breaking change for Web Component `ul is="data-list"` - Changed element to `"data-list"`
  * utils.js - Added new function polyfillCustomElements()
  * `input-filter.js, sortable-table.js, leaflet-map.js` - Added `window._webComponentPolyfills` and related code
* React Component `JsonData` - Added new optional props `fetchOptions` and `fetchHeaders`
* Web Component `json-data` - Added data caching support with new attribute `load-only-once="true"`
* `DataFormsJS.js` - Set scroll position to `0, 0` on hash change for SPA's
* `DataFormsJS.js` and `jsPlugins.js` for both React and Web Components - Updated CSS `white-space` style for `.dataformsjs-error` and `.dataformsjs-fatal-error`

## 2.0.0 (November 18, 2019)

* Breaking change for React Components File Structure, no new features added.
* Switched React Components from JSX to JavaScript so that `npm install dataformsjs` works better with `create-react-app`.
* Updated build process for React Components.

## 1.0.1 (November 15, 2019)

* Fix package.json file for NPM Publishing

## 1.0.0 (November 14, 2019)

* Initial public release
