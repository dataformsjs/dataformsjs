<p align="center">
	<img src="https://github.com/dataformsjs/static-files/raw/master/img/logo/favicon-144.png">
</p>

# :star2: Bem-vindo ao DataFormsJS!

**Obrigado pela visita!**

_Se você estiver vendo esta mensagem, será um dos primeiros visitantes!_ 🌠👍

DataFormsJS is a new JavaScript Framework and Standalone React and Web Components. DataFormsJS is small in size, easy to learn, designed for fast development, and to make for a great experience for both developers and end-users. Although it’s new (first published in November of 2019) DataFormsJS was written and used over many years and is extremely stable containing a large number of unit tests.

This repository contains DataFormsJS’s Framework, Example Pages, and Unit Tests. The main website exists on another repository.

## :dizzy: Why use DataFormsJS?

|<img src="https://www.dataformsjs.com/img/icons/fast.svg" alt="Faster Development" width="60">|<img src="https://www.dataformsjs.com/img/icons/small-size.svg" alt="Small Size" width="60">|<img src="https://www.dataformsjs.com/img/icons/light-switch.svg" alt="Easy to Learn" width="60">|
|---|---|---|
|**Faster Development** Display data from Web and GraphQL Services using only HTML Markup and define App and Site features using HTML Attributes.|**Small Size** All files are small in size and downloaded only when used allowing for greater performance and a smaller site.|**Easy to Learn** DataFormsJS is built around HTML, CSS, JavaScript, Templating and has a minimal JavaScript and HTML API so you can get started immediately.|

|<img src="https://www.dataformsjs.com/img/icons/column.svg" alt="Stability" width="60">|<img src="https://www.dataformsjs.com/img/icons/water.svg" alt="Flexibility" width="60">|<img src="https://www.dataformsjs.com/img/icons/star.svg" alt="Better Sites" width="60">|
|---|---|---|
|**Stability** Designed for long term use; a site developed with DataFormsJS today will work great and be easy to maintain decades from now.|**Flexibility** Works well with other code and the API is designed for flexibility and custom features. If you can think it, you can build it with DataFormsJS.|**Better Sites** DataFormsJS is designed to be a great experience for both developers and end users allowing you to create better sites.|

|Works with|<img src="https://www.dataformsjs.com/img/logos/handlebars.png" alt="Handlebars" width="64"><div>Handlebars</div>|<img src="https://www.dataformsjs.com/img/logos/vue.svg" alt="Vue" width="64"><div>Vue</div>|<img src="https://www.dataformsjs.com/img/logos/react.svg" alt="React" width="64"><div>React</div>|<img src="https://www.dataformsjs.com/img/logos/graphql.svg" alt="GraphQL" width="64"><div>GraphQL</div>|and more!|
|---|---|---|---|---|---|

|Learn something new!|<div><img src="https://www.dataformsjs.com/img/icons/web-components.svg" alt="Web Components" width="64"></div><div>Web Components</div>|
|---|---|

## :rocket: Getting Started

**Getting started with DataFormsJS is extremely easy.**

Install from **npm**, this option works great if you are using create-react-app or want a copy of all files locally:
```
npm install dataformsjs
```

**Download this Repository**. It’s small to download because this repository has no local dependencies and loads Handlebars, Vue, and React from a CDN. To run all example files Node needs to be installed and then you can run one of the following servers:

```
dataformsjs
├── examples
│   └── server.js
└── test
    └── server.js
```

JavaScript files for the Framework and standalone React and Web Components exist under the [js] directory. 

```
dataformsjs
└── js
    ├── DataFormsJS.js
    ├── react\*.js
    ├── web-components\*.js
    └── *
```

**Develop online** using the code playground: https://www.dataformsjs.com/pt-BR/playground

<p align="center">
<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Playground.png" alt="Code Playground" width="800">
</p>

**Download a template file** using scripts from a CDN: https://www.dataformsjs.com/pt-BR/getting-started

<p align="center">
<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Getting-Started-Templates.png" alt="Getting Started Templates" width="800">
</p>

## :page_facing_up: Example Code

This example uses Vue for templating. If you save it with a text editor you can view it locally in your browser. Additionally the main site contains many templates and examples.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
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
        
        <script
            type="text/x-template"
            data-engine="vue"
            data-route="/data"
            data-page="jsonData"
            data-url="https://www.dataformsjs.com/data/geonames/countries"
            data-load-only-once="true"
            data-lazy-load="jsonData, flags"
            data-countries>

            <h3 v-if="isLoading" v-cloak class="loading">Loading...</h3>
            <h3 v-if="hasError" v-cloak class="error">{{ errorMessage }}</h3>
            <div v-if="isLoaded" v-cloak>
                <h1>Countries</h1>
                <ul>
                    <li v-for="country in countries">
                        <i v-bind:class="country.iso.toLowerCase() + ' flag'"></i>
                        <span>{{ country.country }}<span>
                    </li>
                </ul>
            </div>
        </script>

        <script src="https://cdn.jsdelivr.net/npm/vue"></script>
        <script src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/DataFormsJS.min.js"></script>
        <script>
            app.lazyLoad = {
                jsonData: 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/pages/jsonData.min.js',
                flags: 'https://cdn.jsdelivr.net/npm/semantic-ui-flag@2.4.0/flag.min.css',
            };
        </script>
    </body>
</html>
```

## :handshake: Contributing

**All contributions are welcome.** For major changes including breaking changes to existing code or updating existing graphics and files, please open an issue first to discuss what you would like to change. Some examples of items to contribute:

* Typos and Grammar Mistakes - If you see any please fix and submit.
* Documentation and Tutorials. Currently most documentation is in the quick reference section and code comments so a lot of documentation will be needed and written over time.
* Many more examples will be developed in the future. If you have ideas please submit.
* Additional Unit Tests and Testing Methods - Core Framework files and features are Unit Tested however every line of code should be Unit Tested in all files. Currently there is are no Unit Tests for Vue, React, and Web Components.
* Additional Scripts, React Components, Web Components, and Features.
* New Ideas - If you have ideas on how to improve then please open an issue to discuss.

The [docs/to-do-list.txt](https://github.com/dataformsjs/dataformsjs/blob/master/docs/to-do-list.txt) file contains the full list of items that are currently pending and is good place to start.

## :question: FAQ

**Why was DataFormsJS Created?**

Initial development and use of DataFormsJS occurred privately in 2013 to allow for rapid development of high quality and bug free Single Page Applications (SPA). DataFormsJS was designed to have a small size, great performance, and to be much faster for development compared to other Frameworks. A few of the reasons for fast development include displaying JSON services using only Markup and Templating (Handlebars, Underscore, etc.) and defining App and Site features using HTML attributes and small JavaScript Plugins.

Early versions of DataFormsJS were used a number of companies in many different types of apps. 

Now that both React and Vue have become very popular separate React Components have been developed to help with React Development and the Framework has been expanded to support Vue. Additionally separate Web Components have been developed to allow for similar functionality in modern browsers without using a JavaScript framework.

**Why did it take so long to release?**

The author of DataFormsJS had a number of busy jobs at the time and was also working on another large project at the same time [FastSitePHP](https://www.fastsitephp.com/en/).

**How large is DataFormsJS?**

_All sizes are based on minified scripts and gzip compression from the web server._

* **DataFormsJS Framework – 10 kb** (120 kb uncompressed and full version)
* Additional files (controllers, plugins, etc) are typically only 1-3 kb each.
* In general when using the Framework expect about 15 kb for the intial page load, and then several kb for additional pages that load extra plugins, pages, controllers, etc.
* React (All Components in JavaScript) – 6.1 kb
* Individual React Components are between 3 and 12 KB when uncompressed and including comments.
* Web Components are typically around 1 to 3 KB each, typically you will use a number of components so in the example apps this adds up to about 15 kb for each app.

While the DataFormsJS Framework is small it will generally be used with a larger Templating or View Engine:

* Handlebars: ~ 22 kb
* Vue: ~ 33 kb
* Underscore: ~ 6 kb
* Nunjucks - ~ 25 kb

Additionally in a complex or large site third-party code is expected to account for the largest amount of JavaScript. For example CodeMirror Text Editor used on the Playground site is around 250 kb, however DataFormsJS has the ability to download only third-party code when it will be needed.

**What are the future plans for DataFormsJS?**

DataFormsJS is here for the long run and will be developed indefinitely with new features, components, examples, docs, etc. While DataFormsJS is a Framework it also includes standalone web components which can be used without the Framework. Over time many additional framework plugins and web components will be developed.

DataFormsJS will continue to be developed in a manner that allows for web based development (for example: the playground site) and will be kept small in size loading scripts only when needed.

## :memo: License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
