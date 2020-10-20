# DataFormsJS Change Log

DataFormsJS uses [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

Overall the core Framework files and API are expected to remain stable however the version number is expected to increase to much larger numbers in the future due to the changes to smaller scripts and components. This change log includes Framework release history and new website features or major changes.

## Next Release (changes on main/master branch and not yet published to npm)

### Release Overview

* Many many updates are made for overall improvements of DataFormsJS Web Components
  * Added ability to polyfill Web Components for older browsers using the standard Framework that gets loaded from a single file.
  * Added ability to define custom `<template>` for table `<tr>` in `<data-table>`
  * Added option for formatting text from `<json-data>` (date, time, number, custom functions, etc)
  * Added `data-show="js-expression"` to show or hide items from `<json-data>`. It works similar to Vue `v-show`.
  * The new features make for an easier to use API for customizing content on page after data is displayed. Previously the places demo required a lot of custom JavaScript on the page in order to display flag icons, format table data, and additional items.
  * Added new Web Components `<nav is="spa-links">`. Previously SPA Nav Links were handled from custom JavaScript code on the page. Now this functionality is much easier for a site to include as only HTML is needed.
  * `<url-router>` and `<url-hash-router>` now have the ability to lazy load scripts (CSS and JavaScript) per route in a similar manner to the main framework using the new `window.lazyLoad` option and related HTML Attributes.
* Minor enhancments for other DataFormsJS files:
  * Added `app.updateTemplatesForIE()`
  * Added features in `js/plugins/dataBind.js` based on the Web Components version.
  * New file `js/extensions/format.js` which is used with the Web Components Polyfill
* Enhancements for "JavaScript Controls" in the standard Framework. The Framework JavaScript Controls are a similar concept to Web Components.
  * Added ability to easily reload  by calling `app.activeJsControls(control)`. Updating already loaded controls is not common but can be used in very specific scenarios. For example the new Web Components Polyfill uses it.
  * Update API to include `model` as a parameter in `control.onLoad(element, model)`
  * Specific controls `<data-table>` and `<data-list>` have significant new functionality based on the matching Web Components that allows for basic templating from HTML. The template syntax is based on JavaScript template literals (template strings) and with the new features basic sites or apps that previously required Handlebars or Vue for templating could possibly use these instead.
  * Data Attributes for JavaScript controls will not use boolean data types when "true" or "false" are specified. This was created for the new `data-load-only-once` attribute added to `js/controls/json-data.js` for compatability with the Web Components version.
  * Added new functions `app.unloadUnattachedJsControls()` and `app.unloadJsControl(jsControl)`. They are mostly for internal use but are available for advanced usage if needed.
* Image Gallery Update for Overlay when `title/alt` is not used:
  * All versions updated (Web Component, Framework Plugin, React)
  * By default if title is not used the position `{index}/{end}` is displayed. Previously it aligned to the left of the screen. Now it will be aligned in the right of the screen only if title is missing which matches the behavior if the title is included
  * To change position see the following CSS examples (works in all browsers included IE):
    * `.image-gallery-overlay div.no-title { justify-content: flex-start; }`
    * `.image-gallery-overlay div.no-title { justify-content: center; }`

### Breaking Changes

For the standard Framework most breaking changes are minor and only expected to affect internal API's and examples. Several Framework "JavaScript Controls" were updated to match behavior of the Web Components in order to provide more features and so they can be used with the new Web Components Polyfill. If you developed a site or app with any of the breaking changes they are quick to update.

The Web Components have the most complex breaking changes related to API usage however due to the complexity of the earlier API it's unlikely to affect any site. If a site did use the ealier API it is generally quick to update as well.

* `js/web-components/utils.js` - Removed `showOldBrowserWarning()`. The feature has been replaced with the new `js/web-components/polyfill.js` and a function `usingWebComponentsPolyfill()`
* Web Components API for `<json-data>`, `<url-hash-router>`, and `<url-router>` has been changed. Previously the API required `async/await` from module JavaScript and was complex to use. It has now been simplified so that events bubble up to the document can be handled easily from the root document event listener.
  * **Before Update:** https://github.com/dataformsjs/dataformsjs/blob/c23bf5e4cd9e826c61313877ae0c2d2da6d6f889/examples/places-demo-web.htm
  * **After Update:** https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-web.htm
* `js/plugins/filter.js` - Removed error alert for text `Column filter requires a table to be correctly defined` that happened if a table was missing when the filter was loaded. The reason is that it makes sense for certain apps to have a defined filter and only optionally include the table.
* `js/controls/data-table.js` - Replaced `data-source` with `data-bind` and now `<data-table>` will be converted to a `<div>` with a `<table>` in the `<div>` instead of converting to a `<table>` directly. Additionaly `<template>` support has been added.
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
* `js/controls/data-list.js` - Replaced `data-source` with `data-bind` and now `<data-list>` will be converted to a `<div>` with a `<ul>` in the `<div>` instead of converting to a `<ul>` directly. Additionaly `<template>` support has been added.
* Rename `jsPlugins.js` function `refreshJsPlugins()` to `refreshPlugins()` so it matches the standard Framework.
  * Affects Web Components and React
  * `js/web-components/jsPlugins.js`
  * `js/react/jsPlugins.js`
* Combined Framework Pluings `js/pugins/navList.js` and `js/pugins/navLinks.js`
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
