# DataFormsJS Change Log

DataFormsJS uses [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

Overall the core Framework files and API are expected to remain stable however the version number is expected to increase to much larger numbers in the future due to the changes to smaller scripts and components. This change log includes Framework release history and new website features or major changes.

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
  * Added `app.settings.lazyLoadingViewSelector` to allow for loading screens between page views when using `app.lazyLoad`. In most cases loading logic is used on actual page content however this helps with the user experince to indicate page change on slow mobile devices and scripts are being loaded.
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
