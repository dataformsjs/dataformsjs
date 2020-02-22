<h1 align="center">
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/logo/favicon-144.png" height="64" title="DataFormsJS JSX Loader">
</h1>

<p align="center">An ultra-fast and tiny browser based compiler for JSX / React.</p>
<hr>

## What is it? :tada:

A single JavaScript file `jsxLoader.js` that compiles / transpiles JSX to JS for modern browsers and for old browsers it will download and use Polyfills and Babel Standalone.

https://github.com/dataformsjs/dataformsjs/blob/master/js/react/jsxLoader.js

## Why :question:

The `jsxLoader.js` script was created to provide a fast method for including React with JSX on web pages and web apps with no build process, CLI tools, or large dependencies needed; simply use React with JSX in a webpage or site and included needed CDN or JavaScript files.

CLI Development tools such as `webpack`, `babel`, and `create-react-app` are great but they do not make sense for all sites, web pages, and development workflows; and Babel Standalone is huge to include on each page - 320 KB when gzipped and 1.5 MB of JavaScipt for the Browser to process. With a browser based options for JSX you can **easily include React Components on any page** without having to build the entire site using React or JSX.

Old Browsers typically account for less than 5 % of users for most sites - mostly IE and old iOS/Safari. Generally if someone is browsing from IE they are used to slow pages and if someone is browsing from an old iPhone or iPad they end up with many broken sites so simply having a site work is good even if it's slow. This script provides a good trade-off - fast for most users with modern browsers and it still works on old browsers.

## Can it be used for production apps and sites? :rocket:

**Yes**, it was created for this reason.

The script is tested with a variety of devices and browsers including the following:

* Modern Browsers:
  * Chrome
  * Safari - Desktop and iOS (iPhone/iPad)
  * Firefox
  * Edge (EdgeHTML)
  * Samsung Internet
  * UC Browser
* Legacy Browsers:
  * IE 11
  * Safari iOS

It also works and is tested with React alternative libaries such as Preact.

The `jsxLoader.js` script is very small to download (18 kb) and compiles code very fast (often in milliseconds for each JSX script).

## How to use? :star2:

```html
<!-- Include React on the Page -->
<script src="https://unpkg.com/react@16/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js" crossorigin="anonymous"></script>

<!-- Include the DataFormsJS JSX Loader -->
<script src="https://cdn.jsdelivr.net/npm/dataformsjs@3.6.0/js/react/jsxLoader.min.js"></script>

<!--
    Include JSX components and scripts using [type="text/babel"].
    This is the same method that would be used with Babel Standalone.
-->
<script type="text/babel" src="https://cdn.jsdelivr.net/npm/dataformsjs@3.6.0/js/react/es6/JsonData.js"></script>
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
```

## Demos :globe_with_meridians:

### React <img src="https://www.dataformsjs.com/img/logos/react.svg" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/en/react.htm
* https://www.dataformsjs.com/examples/places-demo-react.htm
* https://www.dataformsjs.com/examples/image-classification-react.htm
* https://www.dataformsjs.com/examples/log-table-react.htm
* https://www.dataformsjs.com/examples/countries-no-spa-react.htm
* https://www.dataformsjs.com/examples/countries-no-spa-graphql.htm

### Preact <img src="https://www.dataformsjs.com/img/logos/preact.svg" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/en/preact.htm
* https://www.dataformsjs.com/examples/countries-no-spa-preact.htm

### Rax <img src="https://www.dataformsjs.com/img/logos/rax.png" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/en/rax.htm

## Try it online in the Code Playground :rocket:

<p align="center">
    <a href="https://www.dataformsjs.com/en/playground">https://www.dataformsjs.com/en/playground</a>
</p>

<p align="center">
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Playground-React.png" alt="React Code Playground">
</p>

## Will it work for all sites and apps? :dizzy:

The script is intended to handle most but not all JSX Syntax. An overall goal is that most JSX should work with only a slight update if needed on edge cases.

Once this script was created all React demos for DataFormsJS were able to use it instead of Babel without having to make any JSX code changes and this is expected for most sites.

### Handling node require and import statements

Because JSX is converted directly to JS for the browser, code that uses `require` and `import` statements for node will not work in the browser. However it does provide a flexible API that can be used to customize the generated code so that `import` and `require` statements or other code can be handled by the browser.

For example, if you use the following in your JSX Code:

```javaScript
import { useState } from 'react';
```

Then you have two options:

1) Remove it and use `React.useState` instead of `useState` in your code. This works because `React` is a global variable for the browser.

```javaScript
const [count, setCount] = React.useState(0);
```

2) Add a custom find and replace update.

```html
<script>
    jsxLoader.jsUpdates.push({
        find: /import { useState } from 'react';/g,
        replace: 'var useState = React.useState;'
    });
</script>
```

Often components, functions, etc that need to be imported for node will exist as global variables in the browser so for browser based JSX development you can often exclude `import` and `require` statements.

By default the following import is automatically handled:

```javascript
import React from 'react';
```

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

This also includes the JavaScript spread syntax which only has partial support for modern browsers. For example `...numbers` will work with Chrome, Firefox, Edge, etc but it will not work with the UC Browser which is widely used in Asian Countries. If you use the spread syntax in your app see additional notes in the [Advanced Usage] section of this document.

## Code Splitting :scissors:

A seperate DataFormsJS React Component `<LazyLoad>` exists and allows for browser based apps to dynamically load `*.js`, `*.css`, and `*.jsx` scripts the first time they are used by a component.

Examples from the Places Demo App:
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-react.htm
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/html/search-places-react.jsx

In the below example all 3 files will be downloaded when the Component `LoadMapAndPage` is mounted. While the scripts are being loaded a Component `<ShowLoading>` will be displayed and once all scripts are finished downloading then the Component `<ShowCity>` will be dynamically created. In this example a string value is used for `ShowCity` because the Component will not exist until the file `place-react.jsx` is downloaded.

Additionally the added properties `data` and `params` will be passed as props to `ShowCity`; any custom properties used will be passed to the child element. If `ShowCity` already exists before calling `<LazyLoad>` then `isLoaded={<isLoaded />}` could be used.

```jsx
function LoadMapAndPage(props) {
    return (
        <LazyLoad
            scripts={[
                'https://unpkg.com/leaflet@1.5.1/dist/leaflet.css',
                'https://unpkg.com/leaflet@1.5.1/dist/leaflet.js',
                './html/place-react.jsx',
            ]}
            isLoading={<ShowLoading />}
            isLoaded='isLoaded'
            data={props.data}
            params={props.params} />
    );
}
```

By default all `scripts` are downloaded asynchronously without waiting for ealier scripts to complete. This option is the fastest however it will not work for all code. In the below example `chosen.jquery.min.js` must be loaded after `jquery-3.4.1.min.js` so the property `loadScriptsInOrder` is used to tell `LazyLoad` to load scripts in sequential order.

Additionally this script shows that `{children}` can be used instead of the `isLoaded` property.

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

## Advanced Usage and Internals :microscope:

You can [view the code here](https://github.com/dataformsjs/dataformsjs/blob/master/js/react/jsxLoader.js)! All code is in a single file and includes many helpfull comments to allow for understanding of how it works.

The jsxLoader script provides a number of properties and functions that can be used to customize how it runs. Below are the most common uses.

```html
<script src="jsxLoader.js"></script>
<script>
    // View compiler speed for each script in DevTools console
    jsxLoader.logCompileTime = true;

    // View the generated code for each script in DevTools console
    jsxLoader.logCompileDetails = true;

    // Call this if using Preact instead of React. Additionaly if your Preact
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
<script>
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

### Use Babel for Apps that include the Spread Sytnax

If you have a site that uses code like this `<Greeting {...props} />` the JSX Loader will convert it to `React.createElement(Greeting, ...props)` for modern browsers however not all modern browsers support this syntax. This is particularly important if your site is viewed by users in Asian Countries that use the UC Browser (as of 2020).

There are several options:

1) Avoid using the spread syntax 
2) Use code shown in the example below that uses Babel for these Browsers
3) Use complex find and replace code (example in the Unit Tests) to handle it

```js
(function (){
    if (jsxLoader.needsPolyfill) {
        var isSupportedBrowser;
        try {
            eval(jsxLoader.evalCode);
            isSupportedBrowser = true;
        } catch (e) {
            isSupportedBrowser = false;
        }
        if (isSupportedBrowser) {
            jsxLoader.evalCode = 'const { id, ...other } = { id:123, test:456 }';
        }
    }
})();
```

### Add Support for old Safari (old iPhones, iPads, etc)

Old versions of Safari (example: iOS 9) support `class` but not support `let` or `const`. By default these versions of Safari will use Babel, however the jsxLoader can be used to compile JSX with some customization. This would need to be handled by the developer of the app to make sure that find and replace updates for `const, let, var` work correctly for the site using it. As of 2020 the percentage is users this would affect is very low however Babel is very slow on old mobile devices.

```js
// This would need to run before the Document `DOMContentLoaded` event
(function() {
    // Only run check if the user is using an old browser
    if (jsxLoader.needsPolyfill) {
        // Are `const` and `let` supported?
        var isSupportedBrowser;
        try {
            eval(jsxLoader.evalCode);
            isSupportedBrowser = true;
        } catch (e) {
            isSupportedBrowser = false;
        }
        if (!isSupportedBrowser) {
            // Is `class` supported?
            var evalCode = '"use strict"; class foo {}';
            try {
                eval(evalCode);
                isSupportedBrowser = true;
            } catch (e) {
                isSupportedBrowser = false;
            }
            // If `class` is supported but not `const|let`
            // then replace it with `var ` in the generated code.
            if (isSupportedBrowser) {
                jsxLoader.evalCode = evalCode;
                jsxLoader.jsUpdates.push({ find: /(const |let )/g, replace: 'var ' });
            }
        }
    }
})();
```

### How JS Code is added to the Page

The `jsxLoader.js` script runs on the Document `DOMContentLoaded` event and first checks the environment to determine if polyfills are needed and if Babel should be used. It then downloads JSX Code (or reads inline JSX code), compiles it to regular JavaScript, and adds it back to the page as JavaScript in the `<head>` element.

Scripts added on the page will have a `data-compiler` attribute with the value of either `jsxLoader` or `Babel` to indicate which compiler was used. If the script was downloaded then it will include the `data-src` attribute with the URL of the original JSX script.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-added-to-page-as-js.png" alt="JSX Code compiled to JavaScript">

## Known Issues :warning:

* In general if a known issue requires a lot of code it will likely not be supported because this script is intended as a small and fast JSX parser/compiler and not a full featured JavaScript parser/compiler.
* Error messages may not be very friendly for some unexpected syntax errors so using linting in a Code Editor is recommened during development to avoid errors from `jsxLoader.js`. If you develop with Visual Studio Code or other popular editors this should happen automatically. If you have syntax errors with the generated code and it’s not clear why then using Chrome DevTools is recommended. Because generated JavaScript is added back in dynamic elements most Browsers will display the wrong location of the error but Chrome will often show it in the correct location.
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-debug-error-in-chrome.png" alt="Debug Errors with Chrome Dev Tools">
* Minimized `for` loops may cause issues: `for(n=0;n<m;n++)` as the `<m;n++)` will likely be parsed as an element. However if a full file is minimized it will be processed as JavaScript which means minimized Components will generally work by default.
* Sometimes extra child whitespace is generated in child nodes of `React.createElement('element', props, ...children)` compared to what would be created when using Babel. Generally this doesn’t happen often but it has been found in the [log demo page](https://www.dataformsjs.com/examples/log-table-react.htm). This issue has no visual effect on the page, no performance decrease, and doesn't happen often so it's considered acceptable.
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
