# DataFormsJS Change Log

DataFormsJS uses [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

Overall the core Framework files and API are expected to remain stable however the version number is expected to increase to much larger numbers in the future due to the changes to smaller scripts and components. This change log includes Framework release history and new website features or major changes.

## Next Release (Changes not yet published on npm)

* Added features and additional examples pages for Vue
  * All Handlebar Examples now have a corresponding Vue Example
  * All Standard Framework files now support Vue
  * Originally DataFormsJS was created to use Handlebars so until this release not all Framework scripts worked with Vue
* Confirmed Vue 3.0.0 Release works with the Framework, previously earlier Beta and Release Candidate versions were confirmed.
  * https://www.dataformsjs.com/unit-testing/vue-3
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
* Entry Form and List Editor Updates for IE
  * Example Page was previously broken on IE due to `js/pages/entryForm.js` being loaded without a polyfill for `Object.assign`. Using `app.LazyLoad` in the page HTML fixed the example. They entry form and related code worked with IE, simply the example was not working.
    * https://www.dataformsjs.com/examples/entry-form-demo-hbs.htm
  * `js/plugins/listEditor.js` - Fix so that checkbox and radio changes would be tracked. This affected IE 11 because IE 11 was not tracking `element.oninput` for checkboxes and radio inputs.
* Added Framework Plugin for pickadate.js - https://amsul.ca/pickadate.js/
  * `js/plugins/pickadate.js` https://github.com/dataformsjs/dataformsjs/blob/master/js/plugins/pickadate.js
  * Example is included on the entry form demos
* `js/plugins/modalAlert.js` - Removed un-needed `console.log` statement that was left from development

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
  * Updated 'jsxLoader.babelUrl' from version `7.8.4` to version `7.10.4`. New URL: `https://unpkg.com/@babel/standalone@7.10.4/babel.js`
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
