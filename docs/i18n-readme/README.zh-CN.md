<p align="center">
	<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/logo/favicon-144.png">
</p>

# :star2: 欢迎来到 DataFormsJS!

**非常感谢您的访问!**

_如果你看到这条信息，说明您是我们最早期的用户!_ 🌠👍

DataFormsJS是一个新的JavaScript框架独立于Reaction和Web组件。DataFormsJS体积小，易于学习，设计用于快速开发，并为开发人员和最终用户带来极好的体验。虽然它是新的(2019年11月首次发布)，但DataFormsJS经过多年的编写和使用，非常稳定，包含了大量的单元测试。

该项目包含DataFormsJS的框架、示例页面和单元测试。主网站代码位于 dataformsjs/websie。

## :dizzy: 为什么选择 DataFormsJS?

|<img src="https://www.dataformsjs.com/img/icons/fast.svg" alt="Faster Development" width="60">|<img src="https://www.dataformsjs.com/img/icons/small-size.svg" alt="Small Size" width="60">|<img src="https://www.dataformsjs.com/img/icons/light-switch.svg" alt="Easy to Learn" width="60">|
|---|---|---|
|**快速开发** 仅使用HTML标记显示来自Web和GraphQL服务的数据，并使用HTML属性定义应用程序和站点功能.|**更小的体积** 所有文件都很小，只有在使用时才会下载，从而实现更高的性能和更小的站点.|**易于掌握** DataFormsJS是围绕HTML、CSS、JavaScript、模板构建的，并且具有最低限度的JavaScript和HTML API，因此您可以立即开始使用.|

|<img src="https://www.dataformsjs.com/img/icons/column.svg" alt="Stability" width="60">|<img src="https://www.dataformsjs.com/img/icons/water.svg" alt="Flexibility" width="60">|<img src="https://www.dataformsjs.com/img/icons/star.svg" alt="Better Sites" width="60">|
|---|---|---|
|**稳定性** 设计用于长期使用；今天使用DataFormsJS开发的站点将工作得很好，并且几十年后也易于维护.|**灵活性** 它可以很好地与其他代码配合使用，并且API的设计具有灵活性和自定义功能。如果可以，您可以使用DataFormsJS构建它.|**更棒的网站** DataFormsJS旨在为开发人员和最终用户提供出色的体验，使您能够创建更好的站点.|

|Works with|<img src="https://www.dataformsjs.com/img/logos/handlebars.png" alt="Handlebars" width="64"><div>Handlebars</div>|<img src="https://www.dataformsjs.com/img/logos/vue.svg" alt="Vue" width="64"><div>Vue</div>|<img src="https://www.dataformsjs.com/img/logos/react.svg" alt="React" width="64"><div>React</div>|<img src="https://www.dataformsjs.com/img/logos/graphql.svg" alt="GraphQL" width="64"><div>GraphQL</div>|and more!|
|---|---|---|---|---|---|

|Learn something new!|<div><img src="https://www.dataformsjs.com/img/icons/web-components.svg" alt="Web Components" width="64"></div><div>Web Components</div>|
|---|---|

## :rocket: 开始入门

**入门 DataFormsJS 非常简单.**

使用 **npm** 安装, 如果您正在使用Create-Reaction-app或希望在本地复制所有文件，则此选项非常有用:
```
npm install dataformsjs
```

**下载本储存库**. 它下载起来很小，因为这个存储库没有本地依赖项，并且从CDN加载Handlebar、Vue和Reaction。要运行所有示例文件，需要安装Node，然后您可以运行以下服务器之一:

```
dataformsjs
├── examples
│   └── server.js
└── test
    └── server.js
```

框架和独立Reaction以及Web组件的JavaScript文件位于 [js] 目录.

```
dataformsjs
└── js
    ├── DataFormsJS.js
    ├── react\*.js
    ├── web-components\*.js
    └── *
```

**在线演示** 可以在线上直接运行代码: https://www.dataformsjs.com/en/playground

<p align="center">
<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Playground.png" alt="Code Playground" width="800">
</p>

**下载一个模板** 使用CDN: https://www.dataformsjs.com/en/getting-started

<p align="center">
<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Getting-Started-Templates.png" alt="Getting Started Templates" width="800">
</p>

## :page_facing_up: 示例代码

本例使用Vue作为模板。如果使用文本编辑器保存，则可以在浏览器中本地查看。此外，主站点还包含许多模板和示例。

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

**All contributions are welcome.** 对于重大更改，包括中断对现有代码的更改或更新现有图形和文件，请先打开一个问题，讨论您想要更改的内容。要贡献的项目的一些示例:

* 打字错误和语法错误-如果您看到任何错误，欢迎更正并提交.
* 文档和教程。目前，大多数文档都在快速参考部分和代码注释中，因此随着时间的推移，将需要和编写大量文档.
* 将来还会有更多的例子被开发出来。如果您有想法，欢迎提交.
* 附加的单元测试和测试方法-核心框架文件和特性是单元测试的，但是每一行代码都应该在所有文件中进行单元测试。目前没有针对Vue、Reaction和Web组件的单元测试.
* 其他脚本、Reaction组件、Web组件和功能.
* 新想法 - 如果您对如何改进有想法，欢迎打开一个issue并进行讨论.

[docs/to-do-list.txt](https://github.com/dataformsjs/dataformsjs/blob/master/docs/to-do-list.txt) 你可以在这个文件里找到目录清单，便于展开工作.

## :moneybag: 我们需要翻译!

**如果你对某个语言有信心? <a href="https://www.fastsitephp.com/en/translators-needed" target="_blank">一定要点击我</a>.**

DataFormsJS正在寻找付费翻译员，以便它可以快速翻译成多种语言。翻译可以分很多步骤来完成，所以即使你只有一两个小时的时间，帮上忙赚点钱也足够了.

当前需要的语言：阿拉伯语、法语、德语、意大利语、日语、波斯语、俄语

## :question: FAQ

**为什么要创建DataFormsJS?**

DataFormsJS的最初开发和使用是在2013年私下进行的，以便快速开发高质量和无错误的单页应用程序(SPA)。DataFormsJS被设计为具有小尺寸、高性能，并且与其他框架相比，开发速度要快得多。快速开发的几个原因包括仅使用标记和模板(手柄、下划线等)显示JSON服务。以及使用HTML属性和小型JavaScript插件定义应用程序和网站功能.

许多公司在许多不同类型的应用程序中使用了DataFormsJS的早期版本.

既然REACT和VUE都变得非常流行，就已经开发了独立的REACT组件来帮助REACT开发，并且框架已经扩展到支持VUE。此外，已经开发了独立的Web组件，以便在不使用JavaScript框架的情况下在现代浏览器中实现类似的功能.

**为什么过了这么长时间才开源?**

DataFormsJS的作者当时有许多繁忙的工作，同时还在从事另一个大型项目 [FastSitePHP](https://www.fastsitephp.com/).

**DataFormsJS有多大?**

_所有大小都基于来自Web服务器的缩小脚本和gzip压缩._

* **DataFormsJS 框架压缩后 – 10 kb** (120 kb 未压缩时)
* 其他文件 诸如 (controllers, plugins, etc) 一般只有 1-3 kb 每个文件.
* 通常，在使用框架时，初始页面加载大小约为15KB，然后加载额外插件、页面、控制器等的附加页面大小约为几KB.
* React (包含所有组件) – 6.1 kb
* 单独的Reaction组件在解压缩并包含注释时在3到12 KB之间.
* 每个Web组件通常约为1至3 KB，通常您将使用多个组件，因此在示例应用程序中，每个应用程序的总大小约为15 KB.

虽然DataFormsJS框架很小，但它通常会与较大的模板或视图引擎一起使用:

* Handlebars: ~ 22 kb
* Vue: ~ 33 kb
* Underscore: ~ 6 kb
* Nunjucks - ~ 25 kb

此外，在复杂或大型站点中，预计第三方代码将占据最大数量的JavaScript。例如，在线运行代码站点上使用的CodeMirror文本编辑器大约为250 KB，但是DataFormsJS能够在需要时仅下载第三方代码.

**DataFormsJS的未来计划是什么?**

DataFormsJS将长期存在，并将无限期地开发新的功能、组件、示例、文档等。虽然DataFormsJS是一个框架，但它也包括独立的Web组件，这些组件可以在没有框架的情况下使用。随着时间的推移，将会开发出许多额外的框架插件和Web组件。

DataFormsJS将继续以允许基于Web的开发的方式进行开发(例如，代码在线运行站点)，并将保持较小的大小，仅在需要时加载脚本。

## :memo: 许可

本项目基于 **MIT License** - 详细内容参考 [LICENSE](LICENSE) .
