# DataFormsJS Change Log

DataFormsJS uses [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning).

Overall the core Framework files are expected to remain stable however the version number is expected to increase to much larger numbers in the future due to the changes to smaller scripts and components.

## (Active Changes - Published to GitHub but not yet NPM)

* React Component <JsonData> - Added new optional props [fetchOptions] and [fetchOptions]
* Web Component <json-data> - Added data caching support with new attribute [load-only-once="true"]
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
