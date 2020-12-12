<p align="center">
	<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/logo/DataFormsJS-144px.png">
</p>

# 🌟 DataFormsJSへようこそ！

**訪問してくれてありがとう！** 🌠👍

DataFormsJSは、新しいJavaScriptフレームワークとスタンドアロンのReactおよびWebコンポーネントです。 DataFormsJSはサイズが小さく、習得が容易で、迅速な開発のために設計されており、開発者とエンドユーザーの両方に素晴らしい体験を提供します。 新しい（2019年11月に最初に公開された）DataFormsJSは長年にわたって記述および使用されており、多数の単体テストを含む非常に安定しています。

このリポジトリには、DataFormsJSのフレームワーク、サンプルページ、ユニットテストが含まれています。 メインWebサイトは別のリポジトリに存在します。

## 💫 Why use DataFormsJS?

|<img src="https://www.dataformsjs.com/img/icons/fast.svg" alt="Faster Development" width="60">|<img src="https://www.dataformsjs.com/img/icons/small-size.svg" alt="Small Size" width="60">|<img src="https://www.dataformsjs.com/img/icons/light-switch.svg" alt="Easy to Learn" width="60">|
|---|---|---|
|**Faster Development** Display data from Web and GraphQL Services using only HTML Markup and define App and Site features using HTML Attributes.|**Small Size** All files are small in size and downloaded only when used allowing for greater performance and a smaller site.|**Easy to Learn** DataFormsJS is built around HTML, CSS, JavaScript, Templating and has a minimal JavaScript and HTML API so you can get started immediately.|

|<img src="https://www.dataformsjs.com/img/icons/column.svg" alt="Stability" width="60">|<img src="https://www.dataformsjs.com/img/icons/water.svg" alt="Flexibility" width="60">|<img src="https://www.dataformsjs.com/img/icons/star.svg" alt="Better Sites" width="60">|
|---|---|---|
|**Stability** Designed for long term use; a site developed with DataFormsJS today will work great and be easy to maintain decades from now.|**Flexibility** Works well with other code and the API is designed for flexibility and custom features. If you can think it, you can build it with DataFormsJS.|**Better Sites** DataFormsJS is designed to be a great experience for both developers and end users allowing you to create better sites.|

|Works with|<img src="https://www.dataformsjs.com/img/logos/react.svg" alt="React" width="64"><div>React</div>|<img src="https://www.dataformsjs.com/img/logos/vue.svg" alt="Vue" width="64"><div>Vue</div>|<img src="https://www.dataformsjs.com/img/logos/handlebars.png" alt="Handlebars" width="64"><div>Handlebars</div>|<img src="https://www.dataformsjs.com/img/logos/graphql.svg" alt="GraphQL" width="64"><div>GraphQL</div>|<img src="https://www.dataformsjs.com/img/logos/preact.svg" alt="Preact" width="64"><div>Preact</div>|and more!|
|---|---|---|---|---|---|---|

|Learn something new!|<div><img src="https://www.dataformsjs.com/img/icons/web-components.svg" alt="Web Components" width="64"></div><div>Web Components</div>|
|---|---|

## 🚀 Getting Started

**Getting started with DataFormsJS is extremely easy.**

Install from **npm**, this option works great if you are using `create-react-app` or want a copy of all files locally:
```
npm install dataformsjs
```

**Download this Repository**. It’s small to download because this repository has no dependencies and loads HandlebarsJS, Vue, and React from a CDN. To view example pages Node needs to be installed and then you can start the local server using:
```
npm start
```

The start screen allows you to quickly filter and view many different examples and resources.

<p align="center">
<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/dataformsjs-start-page.png" alt="DataFormsJS npm start page">
</p>

JavaScript files for the Framework and standalone React and Web Components exist under the `js` directory. Full Directory Structure:

```
dataformsjs
├── docs
├── examples
│   ├── *.htm
│   └── server.js
└── js
│   ├── DataFormsJS.js
│   ├── react\*.js
│   ├── web-components\*.js
│   └── *\*.js
├── scripts\*.js
├── server\app.js
└── test
    ├── *.htm
    └── server.js
```

**Develop online** using the code playground: https://www.dataformsjs.com/jp/playground

<p align="center">
<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Playground.png" alt="Code Playground">
</p>

**Download a template file** using scripts from a CDN: https://www.dataformsjs.com/jp/getting-started

<p align="center">
<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Getting-Started-Templates.png" alt="Getting Started Templates">
</p>

## 📄 Example Code

This example uses Vue for templating. If you save it with a text editor you can view it locally in your browser. Additionally the main site contains many templates and examples. DataFormsJS works with both Vue 2 and Vue 3.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>DataFormsJS Example using Vue</title>
    </head>
    <body>
        <header>
            <nav>
                <a href="#/">Home</a>
                <a href="#/data">Data Example</a>
            </nav>
        </header>

        <main id="view"></main>

        <template data-route="/">
            <h1>Hello World!</h1>
        </template>

        <template id="loading-screen">
            <h2>Loading...</h2>
        </template>

        <script
            type="text/x-template"
            data-engine="vue"
            data-route="/data"
            data-page="jsonData"
            data-url="https://www.dataformsjs.com/data/geonames/countries"
            data-load-only-once
            data-lazy-load="jsonData, flags"
            data-countries>

            <h2 v-if="isLoading" class="loading">Loading...</h2>
            <h2 v-if="hasError" class="error">{{ errorMessage }}</h2>
            <div v-if="isLoaded">
                <h1>Countries</h1>
                <ul>
                    <li v-for="country in countries">
                        <i v-bind:class="country.iso.toLowerCase() + ' flag'"></i>
                        <span>{{ country.country }}<span>
                    </li>
                </ul>
            </div>
        </script>

        <!-- Vue 2 -->
        <script src="https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js"></script>

        <!-- Vue 3 -->
        <!-- <script src="https://cdn.jsdelivr.net/npm/vue@3.0.0/dist/vue.global.prod.js"></script> -->

        <!-- DataFormsJS -->
        <script src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/DataFormsJS.min.js"></script>
        <script>
            app.lazyLoad = {
                jsonData: 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/pages/jsonData.min.js',
                flags: 'https://cdn.jsdelivr.net/npm/semantic-ui-flag@2.4.0/flag.min.css',
            };
            app.settings.lazyTemplateSelector = '#loading-screen';
        </script>
    </body>
</html>
```

This example uses React with the `jsxLoader.min.js` script for converting JSX to JS directly it the browser and it includes DataFormsJS React Components from `DataFormsJS.min.js`. If you copy the contents of this code it will also work in a browser. All React Components are also compatible with Preact when using jsxLoader.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>DataFormsJS Example using React</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui-flag@2.4.0/flag.min.css">
    </head>
    <body>
        <div id="root"></div>

        <script type="text/babel">
            function ShowLoading() {
                return <div className="loading">Loading...</div>;
            }

            function ShowError(props) {
                return <div className="error">{props.error}</div>;
            }

            function ShowCountries(props) {
                return (
                    <React.Fragment>
                        <h1>Countries</h1>
                        <ul>
                            {props.data && props.data.countries && props.data.countries.map(country => {
                                return (
                                    <li key={country.iso}>
                                        <i className={country.iso.toLowerCase() + ' flag'}></i>
                                        <span>{country.country}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </React.Fragment>
                )
            }

            class App extends React.Component {
                render() {
                    return (
                        <ErrorBoundary>
                            <JsonData
                                url="https://www.dataformsjs.com/data/geonames/countries"
                                isLoading={<ShowLoading />}
                                hasError={<ShowError />}
                                isLoaded={<ShowCountries />}
                                loadOnlyOnce={true} />
                        </ErrorBoundary>
                    )
                }
            }

            ReactDOM.render(
                <App />,
                document.getElementById('root')
            );
        </script>

        <script crossorigin="anonymous" src="https://unpkg.com/react@17.0.1/umd/react.production.min.js"></script>
        <script crossorigin="anonymous" src="https://unpkg.com/react-dom@17.0.1/umd/react-dom.production.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/react/jsxLoader.min.js"></script>
        <script type="module" src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/react/es6/DataFormsJS.min.js"></script>
        <script nomodule src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/react/es5/DataFormsJS.min.js"></script>
    </body>
</html>
```

When working with node or webpack you will typically import Libraries using an `import` statement:

```js
// Use React Hooks
import React, { useState, useReducer } from 'react';

// Use React Router
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink
} from "react-router-dom";

// Use Redux
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux';
```

When working with the `jsxLoader` and compiling JSX directly in a browser the recommend method for importing is to simply reference the global classes or functions of the libraries that you need for your app:

```js
// Use React Hooks
const useState = React.useState;
const useReducer = React.useReducer;

// Use React Router
const Router = ReactRouterDOM.HashRouter;
const Route = ReactRouterDOM.Route;
const NavLink = ReactRouterDOM.NavLink;
const Link = ReactRouterDOM.Link;

// Use Redux
const Provider = ReactRedux.Provider;
const connect = ReactRedux.connect;
const createStore = Redux.createStore;
```

Many examples exist for popular React Libraries using `jsxLoader` at the following site:

https://awesome-web-react.js.org/

<p align="center">
	<a href="https://awesome-web-react.js.org/"><img width="312" height="350" src="https://raw.githubusercontent.com/dataformsjs/awesome-web-react/master/img/awesome-web-react.svg" alt="Awesome Web React"></a>
</p>

This example uses DataFormsJS Web Components. Web Components are well defined standard and provide for functionally similar to JavaScript Frameworks while using less JavaScript code.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>DataFormsJS Example using Web Components</title>
    </head>
    <body>
        <header>
            <nav>
                <a href="#/">Home</a>
                <a href="#/data">Data Example</a>
            </nav>
        </header>

        <main id="view"></main>

        <template id="loading-screen">
            <h2>Loading...</h2>
        </template>

        <!--
            <url-router> and <url-route> will be used to define #hash routes
        -->
        <url-router view-selector="#view" loading-template-selector="#loading-screen">
            <!-- Home Page -->
            <url-route path="/">
                <template>
                    <h1>Hello World!</h1>
                </template>
            </url-route>

            <!--
                Display a list of Countries from a JSON Service. Elements
                with [data-bind] are populated with data from the Web Service.

                [lazy-load] is used along with `window.lazyLoad` near the bottom
                of this file to dynamically load scripts only if they will be used.
            -->
            <url-route path="/data" lazy-load="json_data, data_list, flags">
                <template>
                    <json-data url="https://www.dataformsjs.com/data/geonames/countries">
                        <is-loading>
                            <div>Loading...</div>
                        </is-loading>
                        <has-error>
                            <div data-bind="errorMessage"></div>
                        </has-error>
                        <is-loaded>
                            <data-list
                                data-bind="countries"
                                template-selector="#country"
                                root-element="ul">
                            </data-list>
                        </is-loaded>
                    </json-data>
                </template>
            </url-route>
        </url-router>

        <!--
            Template for <data-list> using Template literals (Template strings)
        -->
        <template id="country">
            <li>
                <i class="${iso.toLowerCase() + ' flag'}"></i>
                <span>${country}<span>
            </li>
        </template>

        <!-- DataFormsJS Web Components -->
        <script type="module" src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/web-components/url-router.min.js"></script>
        <script nomodule src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/web-components/polyfill.min.js"></script>
        <script>
            window.lazyLoad = {
                json_data: { module: 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/web-components/json-data.min.js' },
                data_list: { module: 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/web-components/data-list.min.js' },
                flags: 'https://cdn.jsdelivr.net/npm/semantic-ui-flag@2.4.0/flag.min.css',
            };
        </script>
    </body>
</html>
```

## 🤝 Contributing

**All contributions are welcome.** For major changes including breaking changes to existing code or updating existing graphics and files, please open an issue first to discuss what you would like to change. Some examples of items to contribute:

* Typos and Grammar Mistakes - If you see any please fix and submit.
* Documentation and Tutorials. Currently most documentation is in the quick reference section and code comments so a lot of documentation will be needed and written over time.
* Many more examples will be developed in the future. If you have ideas please submit.
* Additional Unit Tests and Testing Methods - Core Framework files and features are Unit Tested however every line of code should be Unit Tested in all files. Currently there is are no Unit Tests for Vue, React, and Web Components.
* Additional Scripts, React Components, Web Components, and Features.
* New Ideas - If you have ideas on how to improve then please open an issue to discuss.

The [docs/to-do-list.txt](https://github.com/dataformsjs/dataformsjs/blob/master/docs/to-do-list.txt) file contains the full list of items that are currently pending and is good place to start.

## ❓ FAQ

**Why was DataFormsJS Created?**

Initial development and use of DataFormsJS occurred privately in 2013 to allow for rapid development of high quality and bug free Single Page Applications (SPA). DataFormsJS was designed to have a small size, great performance, and to be much faster for development compared to other Frameworks. A few of the reasons for fast development include displaying JSON services using only Markup and Templating (Handlebars, Underscore, etc.) and defining App and Site features using HTML attributes and small JavaScript Plugins.

Early versions of DataFormsJS were used a number of companies in many different types of apps.

Now that both React and Vue have become very popular separate React Components have been developed to help with React Development and the Framework has been expanded to support Vue. Additionally separate Web Components have been developed to allow for similar functionality in modern browsers without using a JavaScript framework.

**Why did it take so long to release?**

The author of DataFormsJS had a number of busy jobs at the time and was also working on another large project at the same time [FastSitePHP](https://www.fastsitephp.com/en/).

**How large is DataFormsJS?**

_All sizes are based on minified scripts and gzip compression from the web server._

* **DataFormsJS Framework – 10.8 kB** (149 kB full version uncompressed)
* Additional files (controllers, plugins, etc) are typically only 1-3 kB each.
* In general when using the Framework expect about 15 kB for the intial page load, and then several kB for additional pages that load extra plugins, pages, controllers, etc.

* **React JSX Loader – 5.7 kB** (85 kB full version uncompressed)
* **React (All Components in JavaScript) – 5.1 kB**
* Individual React Components are between 3 and 12 KB when uncompressed and including comments.
* Web Components are typically around 1 to 3 KB each, typically you will use a number of components so in the example apps this adds up to about 15 kB for each app.

While the DataFormsJS Framework is small it will generally be used with a larger Templating or View Engine:

* React: ~ 40 kB
* Handlebars: ~ 22 kB
* Vue 2: ~ 33 kB
* Vue 3: ~ 40 kB
* Underscore: ~ 6 kB
* Nunjucks - ~ 25 kB

Additionally in a complex or large site third-party code is expected to account for the largest amount of JavaScript. For example CodeMirror Text Editor used on the Playground site is around 250 kB, however DataFormsJS has the ability to download only third-party code when it will be needed.

**How do I use the JSX Loader for React?**

See the main document: https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.md

**What are the future plans for DataFormsJS?**

DataFormsJS is here for the long run and will be developed indefinitely with new features, components, examples, docs, etc. While DataFormsJS is a Framework it also includes standalone web components which can be used without the Framework. Over time many additional framework plugins and web components will be developed.

DataFormsJS will continue to be developed in a manner that allows for web based development (for example: the playground site) and will be kept small in size loading scripts only when needed.

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
