# DataFormsJS Change Log

DataFormsJS uses [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

Overall the core Framework files are expected to remain stable however the version number is expected to increase to much larger numbers in the future due to the changes to smaller scripts and components.

## 3.1.5 (December 4, 2019)

* Plugin [i18n.js] - Added support for i18n nav menus for the selected page and multiple languages with new attributes [data-i18n-nav-lang] and [data-i18n-nav-selected].

## 3.1.4 (November 29, 2019)

* Updated readme file for npm

## 3.1.3 (November 29, 2019)

* Fixed error when using multple rendering engines in a single app where changes to the URL source on existing HTML controls would use the wrong rendering engine. Rare edge case error that affected the main site.
* Updated npm package.json file to include the broswer property

## 3.1.2 (November 25, 2019)

* Fixed error from previous fix where plugins that call [next(false)] from [onRouteLoad(next)] would not trigger the next route to finish loading. Affected [js/plugins/i18n.js].

## 3.1.1 (November 25, 2019)

* DataFormsJS.js - Fix for race conditions where a previous page is still loading and the new page is called multiple times. The errors would only show on pages that use a lot of custom JavaScript and if the user clicks quickly from page to page while services or resources were still loading.

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
