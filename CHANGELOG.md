# DataFormsJS Change Log

DataFormsJS uses [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

Overall the core Framework files are expected to remain stable however the version number is expected to increase to much larger numbers in the future due to the changes to smaller scripts and components.

## 3.1.0 (November 25, 2019)

* Web Components - New functions in [js/web-components/utils.js] - [showErrorAlert()] and [showOldBrowserWarning()]
* Web Components - [showOldBrowserWarning()] checks modern browsers that support &lt;script type="module"&gt; but do not support custom elements (known to affect MS Edge using the EdgeHTML rendering engine)
* Web Components - Check Old Browsers from &lt;url-hash-router&gt; and &lt;json-data&gt;
* Web Components - Updated all [*.min.js] files to use the [*.min.js] version of related files from import statements

## 3.0.0 (November 21, 2019)

* Web Components - Add polyfill support for specific components for Safari, Samsung Internet, and Edge
  * Breaking change for Web Component &lt;ul is="data-list"&gt; - Changed element to &lt;"data-list"&gt;
  * utils.js - Added new function polyfillCustomElements()
  * [input-filter.js], [sortable-table.js], [leaflet-map.js] - Added [window._webComponentPolyfills] and related code
* React Component &lt;JsonData&gt; - Added new optional props [fetchOptions] and [fetchOptions]
* Web Component &lt;json-data&gt; - Added data caching support with new attribute [load-only-once="true"]
* DataFormsJS.js - Set scroll position to [0, 0] on hash change for SPA's
* DataFormsJS.js and jsPlugins.js for both React and Web Components - Updated CSS [white-space] style for [.dataformsjs-error] and [.dataformsjs-fatal-error]

## 2.0.0 (November 18, 2019)

* Breaking change for React Components File Structure, no new features added.
* Switched React Components from JSX to JavaScript so that "npm install dataformsjs" works better with create-react-app.
* Updated build process for React Components.

## 1.0.1 (November 15, 2019)

* Fix package.json file for NPM Publishing

## 1.0.0 (November 14, 2019)

* Initial public release
