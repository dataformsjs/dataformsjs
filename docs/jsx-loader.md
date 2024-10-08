<h1 align="center">
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-loader.png" title="DataFormsJS JSX Loader">
</h1>

<p align="center">An ultra-fast and tiny (6.6 kB) browser based compiler for JSX / React.</p>
<hr>

<table>
	<tbody>
		<tr align="center"><td colspan="2">
            🌐 &nbsp; 🌎 &nbsp; 🌏 &nbsp; 🌍
		</td></tr>
    	<tr>
			<td><a href="https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.pt-BR.md">Português (Brasil)</a>
		</tr>
    	<tr>
			<td><a href="https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.zh-CN.md">中文 (简体)</a>
		</tr>
	</tbody>
</table>

## What is it? 🎉

A single JavaScript file `jsxLoader.js` that compiles / [transpiles](https://en.wikipedia.org/wiki/Source-to-source_compiler) JSX to JS for modern browsers and for old browsers it will download and use Polyfills and Babel Standalone.

**Source:** https://github.com/dataformsjs/dataformsjs/blob/master/js/react/jsxLoader.js

**Demo:** https://dataformsjs.com/examples/hello-world/en/react.htm

**Many Examples** https://awesome-web-react.js.org/

## Why ❓

The `jsxLoader.js` script was created to provide a fast method for including React with JSX on web pages and web apps with no build process, CLI tools, or large dependencies needed; simply use React with JSX in a webpage or site and include the needed CDN or JavaScript files.

CLI Development tools such as `webpack`, `babel`, and `create-react-app` are great but they do not make sense for all sites, web pages, and development workflows; and `Babel Standalone` is huge to include on each page - 320 kB when gzipped and 1.5 MB of JavaScript for the Browser to process. With a browser based options for JSX you can **easily include React Components on any page** without having to build the entire site using React or JSX.

As of 2024 over 99% of the global population views webpages with modern browsers so the 6.6 kb `jsxLoader.js` will compile and load JSX code on webpages for all modern browsers; for the smaller percentage of the population that views websites on a legacy browser (IE 11 on Windows Server, old iOS, and old Android) `jsxLoader.js` will automatically download Babel Standalone and use it to correctly compile and load JSX code. `jsxLoader.js` provides a good trade-off - fast for most users with modern browsers and it still works on old browsers.

Prior to the `jsxLoader.js` being created all React demos on DataFormsJS used Babel Standalone. Babel Standalone is great for prototyping and works with React DevTools however due to its size it takes a lot of memory and causes an initial delay in loading the page so it’s generally avoided on production sites. On mobile devices the delay can be many seconds. Here is an example of before and after performance differences when using `Babel` vs `jsxLoader`.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Rreact-speed-and-memory-with-babel.png" alt="React with Babel">

Performance is great because jsxLoader compiles code to modern JS for modern browser and because it’s a minimal compiler it’s very fast to process.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/React-speed-and-memory-with-jsxLoader.png" alt="React with jsxLoader">

## Can it be used for production apps and sites? 🚀

**Yes**, it was created for this reason.

The script is tested with a variety of devices and browsers including the following:

* Modern Browsers:
  * Chrome
  * Safari - Desktop and iOS (iPhone/iPad)
  * Firefox
  * Edge (Chromium and EdgeHTML)
  * Samsung Internet
  * UC Browser
  * Opera
* Legacy Browsers:
  * IE 11
  * Safari iOS

In addition to React, it also works and is tested with the React alternative library, Preact.

The `jsxLoader.js` script is very small to download (6.6 kB - min and gzip) and compiles code very fast (often in milliseconds for each JSX script).

## How to use? 🌟

```html
<!-- Include React on the Page -->
<script src="https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js" crossorigin="anonymous"></script>

<!--
    Include the DataFormsJS JSX Loader.
    Either [jsxLoader.min.js] or [jsxLoader.js] can be used.
-->
<script src="https://cdn.jsdelivr.net/npm/dataformsjs@5/js/react/jsxLoader.min.js"></script>

<!--
    Include JSX components and scripts using [type="text/babel"].
    This is the same method that would be used with Babel Standalone.
-->
<script type="text/babel" src="https://cdn.jsdelivr.net/npm/dataformsjs@5/js/react/es6/JsonData.js"></script>
<script type="text/babel" src="app.jsx"></script>
<script type="text/babel">

    class HelloMessage extends React.Component {
        render() {
            return (
                <div>Hello {this.props.name}</div>
            );
        }
    }

    ReactDOM.render(
        <HelloMessage name="World" />,
        document.getElementById('root')
    );

</script>

<!--
    If a script uses `import` or requires other features on available with
    JavaScript Modules you can specify [data-type="module"] so that the compiled
    script will be added to the page as <script type="module">.

    [data-type="module"] is also supported by Babel Standalone.

    When using jsxLoader you cannot import JSX files directly as you would
    do so from a local build process with Vite, Create-React-App, etc.
    `import` would only work for regular JavaScript files. To see how to
    dynamically import JSX search this page for `<LazyLoad>`.
-->
<script type="text/babel" data-type="module">
    import { object } from './library/file.js'
</script>
```

## Demos 🌐

### React <img src="https://raw.githubusercontent.com/dataformsjs/website/master/public/img/logos/react.svg" width="32" height="32">
* https://dataformsjs.com/examples/hello-world/en/react.htm
* https://dataformsjs.com/examples/places-demo-react.htm
* https://dataformsjs.com/examples/image-classification-react.htm
* https://dataformsjs.com/examples/image-gallery-react.htm
* https://dataformsjs.com/examples/log-table-react.htm
* https://dataformsjs.com/examples/countries-no-spa-react.htm
* https://dataformsjs.com/examples/countries-no-spa-graphql.htm
* https://dataformsjs.com/examples/hacker-news-react.htm
* https://dataformsjs.com/examples/web-components-with-react.htm
* https://dataformsjs.com/getting-started/en/template-react.htm
* https://dataformsjs.com/getting-started/en/template-react-graphql.htm
* https://dataformsjs.com/examples/code-playground-react.htm
* https://awesome-web-react.js.org/

### Preact <img src="https://raw.githubusercontent.com/dataformsjs/website/master/public/img/logos/preact.svg" width="32" height="32">
* https://dataformsjs.com/examples/hello-world/en/preact.htm
* https://dataformsjs.com/examples/places-demo-preact.htm
* https://dataformsjs.com/examples/countries-no-spa-preact.htm
* https://dataformsjs.com/examples/image-gallery-preact.htm
* https://dataformsjs.com/examples/web-components-with-preact.htm
* https://dataformsjs.com/getting-started/en/template-preact.htm
* https://dataformsjs.com/getting-started/en/template-preact-router.htm
* https://dataformsjs.com/getting-started/en/template-preact-graphql.htm

### Vue 3 <img src="https://raw.githubusercontent.com/dataformsjs/website/master/public/img/logos/vue.svg" width="32" height="32">
* https://dataformsjs.com/examples/hello-world/en/vue3-with-jsx.htm
* https://dataformsjs.com/examples/vue3-dynamic-jsx.htm

### Rax <img src="https://raw.githubusercontent.com/dataformsjs/website/master/public/img/logos/rax.png" width="32" height="32">
* https://dataformsjs.com/examples/hello-world/en/rax.htm

### Node <img src="https://nodejs.org/static/images/favicons/favicon.png" width="32" height="32">
* https://github.com/dataformsjs/dataformsjs/blob/master/scripts/jsx-loader-node-demo.js

## Try it online in the Code Playground 🚀

* https://dataformsjs.com/en/playground _Main site playground uses CodeMirror_
* https://dataformsjs.com/examples/code-playground-react.htm _Demo built with React using Monaco Editor from VS code_

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Playground-React.png" alt="React Code Playground">

## Will it work for all sites and apps? 💫

The script is intended to handle most but not all JSX Syntax. An overall goal is that most JSX should work with only a slight update if needed on edge cases.

Once this script was created all React demos for DataFormsJS were able to use it instead of Babel without having to make any JSX code changes and this is expected for most sites.

### Handling node import/export statements and browser exports/require

Because JSX is converted directly to JS for the browser, code that uses `import` and `export` statements for node will not work in the browser. However the `jsxLoader.js` script provides a flexible API that can be used to customize the generated code so that `import` and `export` statements or other code can be handled by the browser.

For example, if you use the following in your JSX Code:

```js
import { useState } from 'react';
```

Then you have several options:

1) Remove it and use `React.useState` instead of `useState` in your code. This works because `React` is a global variable for the browser.

```javaScript
const [count, setCount] = React.useState(0);
```

2) Manually define the function to link to the global object in the JSX code.

```javascript
const useState = React.useState;
```

3) Add a custom find and replace update.

```html
<script>
    jsxLoader.jsUpdates.push({
        find: /import { useState } from 'react';/g,
        replace: 'var useState = React.useState;'
    });
</script>
```

Often components, functions, etc that need to be imported for node will exist as global variables in the browser so for browser based JSX development you can often exclude `import` and `export` statements.

By default the following import and export statements are automatically handled:

```javascript
import React from 'react';
export function ...
export default class ...
```

Related to node `import` and `export` are the browser `exports` object and `require(module)` function which are required by many React Libraries when linking to the library directly. In many cases this can be handled by simply calling `jsxLoader.addBabelPolyfills();` before loading the library from a `<script>` tag on the page.

In some cases a library will load a module from `require(name)` where the name doesn't match `window.name`. For example the popular node library `classnames` links to `window.classNames`. To handle this add a property to `jsxLoader.globalNamespaces` for mapping prior to calling `jsxLoader.addBabelPolyfills();`.

```javascript
jsxLoader.globalNamespaces.classnames = 'classNames';
jsxLoader.addBabelPolyfills();
```

**Example usage of `jsxLoader.addBabelPolyfills()`:**
* https://awesome-web-react.js.org/examples/ui/react-toastify.htm
* https://awesome-web-react.js.org/examples/state-management/react-recoil.htm

### Using JavaScript that only has partial browser support

Another issue is using JavaScript that only works in some modern browsers. For example using Class fields / properties will work in some Browsers (Chrome, Firefox) but not work with other Browsers (As of 2020 this includes Safari, Edge (EdgeHTML), and Samsung Internet).

```jsx
class App extends React.Component {
    // This version works with Chrome and Firefox,
    // but will cause errors with many mobile devices
    state = {
        message: 'Hello World',
    };

    componentDidMount() {
        window.setTimeout(() => {
            this.setState({
                message: 'Updated from Timer'
            });
        }, 500);
    }

    render() {
        return (
            <div>{this.state.message}</div>
        )
    }
}
```

```jsx
class App extends React.Component {
    // By defining class properties in the `constructor()`
    // the code will work on all modern browsers.
    constructor(props) {
        super(props);
        this.state = {
            message: 'Hello World',
        };
    }
}
```

## Code Splitting ✂️

A separate DataFormsJS React Component `<LazyLoad>` exists and allows for browser based apps to dynamically load `*.js`, `*.css`, and `*.jsx` scripts the first time they are used by a component.

Examples from the Places Demo App:
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-react.htm
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/html/search-places-react.jsx

Source code for `<LazyLoad>`
* https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/LazyLoad.js

In the below example all 3 files will be downloaded when the Component `LoadMapAndPage` is mounted. While the scripts are being loaded a Component `<ShowLoading>` will be displayed and once all scripts are finished downloading then the Component `<ShowCity>` will be dynamically created. In this example a string value is used for `ShowCity` because the Component will not exist until the file `place-react.jsx` is downloaded.

Additionally the added properties `data` and `params` will be passed as props to `ShowCity`; any custom properties used will be passed to the child element. If `ShowCity` already exists before calling `<LazyLoad>` then `isLoaded={<isLoaded />}` could be used.

```jsx
function LoadMapAndPage(props) {
    return (
        <LazyLoad
            scripts={[
                'https://cdn.jsdelivr.net/npm/leaflet@1.5.1/dist/leaflet.css',
                'https://cdn.jsdelivr.net/npm/leaflet@1.5.1/dist/leaflet.js',
                './html/place-react.jsx',
            ]}
            isLoading={<ShowLoading />}
            isLoaded="ShowCity"
            data={props.data}
            params={props.params} />
    );
}
```

By default all `scripts` are downloaded asynchronously without waiting for ealier scripts to complete. This option is the fastest however it will not work for all code. In the below example `chosen.jquery.min.js` must be loaded after `jquery-3.4.1.min.js` so the property `loadScriptsInOrder` is used to tell `LazyLoad` to load scripts in sequential order.

Additionally the below snippet shows that `{children}` can be used instead of the `isLoaded` property.

```jsx
<LazyLoad
    isLoading={<ShowLoading />}
    loadScriptsInOrder={true}
    scripts={[
        'https://code.jquery.com/jquery-3.4.1.min.js',
        'https://cdn.jsdelivr.net/npm/chosen-js@1.8.7/chosen.css',
        'https://cdn.jsdelivr.net/npm/chosen-js@1.8.7/chosen.jquery.min.js',
        'css/countries-chosen.css',
    ]}>
    {children}
</LazyLoad>
```

In general using `<LazyLoad>` is recommended when all JSX is linked from multiple external files and one file depends on another.

```html
<!--
    For example if [data-page.jsx] first requires [app.jsx] to be loaded
    using this might cause an error on some page loads if [app.jsx] is
    downloaded and compiled before [data-page.jsx].
 -->
<script type="text/babel" src="data-page.jsx"></script>
<script type="text/babel" src="app.jsx"></script>

<!--
    One solution would be to embed the [app.jsx] file in the main HTML page
    because embedded code is compiled after all downloaded scripts.
-->
<script type="text/babel" src="data-page.jsx"></script>
<script type="text/babel">
    function App() {
        return <DataPage />
    }

    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
</script>

<!--
    The other solution is to use <LazyLoad> from [app.jsx].
    This example is from the DataFormsJS Playground.
-->
<script type="text/babel">
    function LazyLoadDataPage(props) {
        return (
            <LazyLoad
                scripts="data-react.jsx"
                isLoading={<ShowLoading />}
                isLoaded="ShowCountries"
                data={props.data}
                params={props.params} />
        );
    }
</script>
```

## Debugging 🐛

Since jsxLoader is browser based debugging is handled with your Browser's built-in DevTools. Two methods are recommended.

### Debug the Compiled Code

Add a `debugger;` line in the code. If DevTools is open, then it will stop on the code just like if a breakpoint were manually set and if DevTools is now open then there will be no effect.

This will allow you to debug the compiled JavaScript rather than the original JSX Code. When using this method the code will appear in a JavaScript Virtual Machine "VM" file and you will likely not be able to select it from the file list.

```js
if (condition) {
    debugger;
}
```

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-debug-1-debugger.png" alt="Debug using debugger statement">

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-debug-2-devtools.png" alt="Debug jsxLoader with DevTools">


### Debug JSX

You can debug the JSX directly in DevTools by forcing jsxLoader to use Babel Standalone configured with source maps. Because source maps are used the file name will appear in DevTools.

IMPORTANT - if using this option make sure to comment out or remove the settings after, otherwise your page would be downloading full Babel Standalone in production.

```js
jsxLoader.isSupportedBrowser = false;
jsxLoader.sourceMaps = true;
```

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-debug-3-sourcemaps.png" alt="Debug with Babel Standalone">

## Advanced Usage and Internals 🔬

You can [view the code here](https://github.com/dataformsjs/dataformsjs/blob/master/js/react/jsxLoader.js)! All code is in a single file and includes many helpful comments to allow for understanding of how it works.

The jsxLoader script provides a number of properties and functions that can be used to customize how it runs. Below are the most common uses.

```js
// View compiler speed for each script in DevTools console
jsxLoader.logCompileTime = true;

// View the generated code for each script in DevTools console
jsxLoader.logCompileDetails = true;

// Call this if using Preact instead of React. Additionally if your Preact
// app has unexpected errors when using it you can easily copy, modify, and
// use a custom version of the function so that it works with your app.
jsxLoader.usePreact();

// Add custom file and replace logic for your app or site.
jsxLoader.jsUpdates.push({
    find: /import { useState } from 'react';/g,
    replace: 'var useState = React.useState;'
});

// Additional properties and options exist and can be viewed
// in the source of the [jsxLoader.js] file.
```

### jsxLoader.logCompileTime

When using `jsxLoader.logCompileTime` the time it takes to compile each script will be logged to the DevTools console.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-loader-log-compile-time.png" alt="Log Compile time to DevTools Console">

### jsxLoader.logCompileDetails

When using `jsxLoader.logCompileDetails` full details of the main compiler steps will be logged to the DevTools console. This includes:

* Tokens generated from Lexical Analysis
* Abstract Syntax Tree (AST) generated from the Tokens
* Generated Code from the AST

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-loader-log-compile-details.png" alt="Log Compile Details to DevTools Console">

### How JS Code is added to the Page

The `jsxLoader.js` script runs on the Document `DOMContentLoaded` event and first checks the environment to determine if polyfills are needed and if Babel should be used. It then downloads JSX Code (or reads inline JSX code), compiles it to regular JavaScript, and adds it back to the page as JavaScript in the `<head>` element.

Scripts added on the page will have a `data-compiler` attribute with the value of either `jsxLoader` or `Babel` to indicate which compiler was used. If the script was downloaded then it will include the `data-src` attribute with the URL of the original JSX script.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-added-to-page-as-js.png" alt="JSX Code compiled to JavaScript">

### Local Development

Typically the minimized version `jsxLoader.min.js` will be used for production while the `jsxLoader.js` is the full version of the script that is used for development. It has no dependencies and is browser based so once it is included on a page you can step through the code using Browser DevTools.

### Building [jsxLoader.min.js] from [jsxLoader.js]

All `*.min.js` files in DataFormsJS are built from the full file version of the same name using a build script that depends on `uglify-js`, `terser`, and `Babel`. The `jsxLoader.min.js` can be built using only `uglify-js`.

```bash
# From project root
node install
node run build
```

Or run the [.\scripts\build.js](https://github.com/dataformsjs/dataformsjs/blob/master/scripts/build.js) script directly: `node build.js`.

### Unit Testing

Unit Tests for `jsxLoader.js` run from a browser using Mocha. Often React Components are tested from a mock browser environment using Jest, however it’s important that the `jsxLoader.js` be tested from an actual browser so that it can be verified in as many environments as possible and because it downloads Polyfills and Babel for some browsers.

This method also helps verify that the behavior of the compiled JS code from `jsxLoader.js` matches the same result from Babel. For example modern browsers need to be confirmed as well as IE 11 (which uses Babel).

```bash
# Install Node
# https://nodejs.org

# Download [dataformsjs/dataformsjs] repository:
# https://github.com/dataformsjs/dataformsjs

# Start Server from project root.
# The local test and demo server for DataFormsJS has no dependencies
# outside of built-in Node.js objects.
node ./test/server.js

# Or run the file directly
cd test
node server.js

# View the unit test site and run tests:
# http://127.0.0.1:4000/
```

Or try Unit Tests directly on the main web server:

https://dataformsjs.com/unit-testing/

The image below shows what the Unit Test page looks like. When testing with a modern browser `jsxLoader` will appear in the upper-left-hand corner of the screen.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-modern-browser.png" alt="Unit Testing with Modern Browser">

When testing with a legacy browser such as IE 11 `Babel` will be shown along with `(Polyfill Downloaded)`.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-ie-11.png" alt="Unit Testing with IE 11">

## Known Issues ⚠️

* In general if a known issue requires a lot of code it will likely not be supported because this script is intended as a small and fast JSX parser/compiler and not a full featured JavaScript parser/compiler.
* Error messages may not be very friendly for some unexpected syntax errors so using linting in a Code Editor is recommended during development to avoid errors from `jsxLoader.js`. If you develop with Visual Studio Code or other popular editors this should happen automatically. If you have syntax errors with the generated code and it’s not clear why then using Chrome DevTools is recommended (or Edge built with Chromium). Because generated JavaScript is added back in dynamic elements most Browsers will display the wrong location of the error but latest versions of Chrome and Edge will often show it in the correct location.
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-debug-error-in-chrome.png" alt="Debug Errors with Chrome Dev Tools">
* Sometimes extra child whitespace is generated in child nodes of `React.createElement('element', props, ...children)` compared to what would be created when using Babel. Generally this doesn’t happen often but it has been found in the [log demo page](https://dataformsjs.com/examples/log-table-react.htm). This issue has no visual effect on the page, no performance decrease, and doesn't happen often so it's considered acceptable.
*  Text that looks like elements inside of complex nested template literals (template strings) may cause parsing errors or unexpected results:

    Example parsed correctly:
    ```JavaScript
    const testHtmlString = `${`'<div>test</div>'`}`
    ```
    Result: `testHtmlString = "'<div>test</div>'"`

    Example parsing error:
    ```JavaScript
    const testHtmlString = `${`<div>test</div>`}`
    ```
    Result: `testHtmlString = 'React.createElement("div", null, "test")';`
