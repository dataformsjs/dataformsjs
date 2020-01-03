# DataFormsJS Change Log

DataFormsJS uses [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

Overall the core Framework files and API are expected to remain stable however the version number is expected to increase to much larger numbers in the future due to the changes to smaller scripts and components. This change log includes Framework release history and new website features or major changes.

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
