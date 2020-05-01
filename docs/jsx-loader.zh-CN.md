<h1 align="center">
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-loader.png" title="DataFormsJS JSX Loader">
</h1>

<p align="center">基于浏览器的超高速微型JSX/React编译器.</p>
<hr>

<table>
	<tbody>
		<tr align="center"><td colspan="2">
<g-emoji class="g-emoji" alias="globe_with_meridians" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f310.png"><img class="emoji" alt="globe_with_meridians" height="20" width="20" src="https://github.githubassets.com/images/icons/emoji/unicode/1f310.png"></g-emoji> <g-emoji class="g-emoji" alias="earth_americas" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f30e.png"><img class="emoji" alt="earth_americas" height="20" width="20" src="https://github.githubassets.com/images/icons/emoji/unicode/1f30e.png"></g-emoji> <g-emoji class="g-emoji" alias="earth_asia" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f30f.png"><img class="emoji" alt="earth_asia" height="20" width="20" src="https://github.githubassets.com/images/icons/emoji/unicode/1f30f.png"></g-emoji> <g-emoji class="g-emoji" alias="earth_africa" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f30d.png"><img class="emoji" alt="earth_africa" height="20" width="20" src="https://github.githubassets.com/images/icons/emoji/unicode/1f30d.png"></g-emoji>
		</td></tr>
    	<tr>
			<td><a href="https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.pt-BR.md">葡萄牙语(巴西)</a>
		</tr>
	</tbody>
</table>

## 这是什么? :tada:

这是一个单独的JavaScript文件`jsxLoader.js`,用来为新浏览器和旧浏览器编译/ [transpiles](https://en.wikipedia.org/wiki/Source-to-source_compiler)(传输)JSX到JS,它将下载和使用Polyfills and Babel Standalone.

**源代码:** https://github.com/dataformsjs/dataformsjs/blob/master/js/react/jsxLoader.js

**演示:** https://www.dataformsjs.com/examples/hello-world/zh-CN/react.htm

## 为什么 :question:

`jsxLoader.js`脚本的创建是为了提供一种快速在web页面和web应用程序中加入React和JSX的方法,而无需构建过程，CLI工具或大型依赖,只需在网页或站点中使用React和JSX,并加入所需的CDN或JavaScript文件.

CLI开发工具,如`webpack`, `babel`,`create-react-app`是非常好的工具，但是他们并不适用于所有的站点,网页以及开发工作流程.`Babel Standalone`非常庞大,每个页面上都包含-gzip压缩后为320 kB和1.5 MB JavaScipt文件供浏览器处理.使用基于浏览器的JSX选项,您可以**轻松地在任何页面中使用React组件**而无需使用React或JSX构建整个网站.

对于大多数网站来说,旧的浏览器通常只占不到5%的用户,主要是IE和旧的IOS以及Safari.一般来说,如果有人在IE上浏览网页,他们习惯了缓慢的网页,如果有人在旧的iPhone或iPad上浏览,他们会遇到很多损坏的网站.所以，简单的有个运行的网站是不错的,即使它的速度很慢.这个脚本提供了一个很好的折中方案，对于使用新浏览器的用户来说，速度很快，并仍然能在旧的浏览器上工作.

在创建`jsxLoader.js`之前,DataFormsJS上的所有React演示都使用了Babel Standalone.Babel Standalone非常适合用于原型制作，并且能和React DevTools一起使用,但是由于其体积大,需要占用大量内存,并且会导致页面加载的初始延迟,因此通常在创建站点上是避免这种情况的.在移动设备上,延迟可能长达数秒. 下面是一个使用`Babel`和`jsxLoader`之间的性能差异的例子.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Rreact-speed-and-memory-with-babel.png" alt="React with Babel">

性能之所以出色,是因为jsxLoader将代码编译为用于新版浏览器的新JS,并且因为它是极小的编译器,所以处理起来非常快.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/React-speed-and-memory-with-jsxLoader.png" alt="React with jsxLoader">

## 它可以用于生产应用和网站吗? :rocket:

**是的**,它就是为此而创建的.

该脚本已通过多种设备和浏览器进行了测试,包括以下内容:

* 新版浏览器:
  * Chrome
  * Safari - Desktop and iOS (iPhone/iPad)
  * Firefox
  * Edge (Chromium and EdgeHTML)
  * Samsung Internet
  * UC Browser
  * Opera
* 旧版浏览器:
  * IE 11
  * Safari iOS

此外,对React来说,它也可以工作,并已通过React的代替库Preact进行了测试.

`jsxLoader.js`脚本的下载量很小(5.2 kB - min and gzip),并且编译速度非常快(每个JSX脚本通常以毫秒为单位).

## 如何使用? :star2:

```html
<!-- Include React on the Page -->
<script src="https://unpkg.com/react@16.13.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@16.13.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>

<!--
    Include the DataFormsJS JSX Loader.
    Either [jsxLoader.min.js] or [jsxLoader.js] can be used.
-->
<script src="https://cdn.jsdelivr.net/npm/dataformsjs@4.0.1/js/react/jsxLoader.min.js"></script>

<!--
    Include JSX components and scripts using [type="text/babel"].
    This is the same method that would be used with Babel Standalone.
-->
<script type="text/babel" src="https://cdn.jsdelivr.net/npm/dataformsjs@4.0.1/js/react/es6/JsonData.js"></script>
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

## 演示 :globe_with_meridians:

### React <img src="https://www.dataformsjs.com/img/logos/react.svg" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/zh-CN/react.htm
* https://www.dataformsjs.com/examples/places-demo-react.htm
* https://www.dataformsjs.com/examples/image-classification-react.htm
* https://www.dataformsjs.com/examples/log-table-react.htm
* https://www.dataformsjs.com/examples/countries-no-spa-react.htm
* https://www.dataformsjs.com/examples/countries-no-spa-graphql.htm
* https://www.dataformsjs.com/examples/hacker-news-react.htm

### Preact <img src="https://www.dataformsjs.com/img/logos/preact.svg" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/zh-CN/preact.htm
* https://www.dataformsjs.com/examples/countries-no-spa-preact.htm

### Rax <img src="https://www.dataformsjs.com/img/logos/rax.png" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/zh-CN/rax.htm

## 在线代码编辑器上尝试 :rocket:

<a href="https://www.dataformsjs.com/zh-CN/playground">https://www.dataformsjs.com/zh-CN/playground</a>

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Playground-React.png" alt="React Code Playground">

## 它是否适用于所有的网站和应用? :dizzy:

改脚本旨在处理大多数(但不是全部)JSX语法.总体目标是，如果需要在极端情况下使用,大多数JSx只需要进行少量更新.

创建此脚本后,所有DataFormsJS的React演示程序都可以使用它代替Babel,而无需进行任何JSX代码更改,并且这也是大多数网站所期待的.

### 处理节点请求和导入语句

由于浏览器将JSX直接转换为JS, 因此对节点使用`require`和`import`语句的代码将不能在浏览器中使用.然而`jsxLoader.js`提供了灵活的API,可用于自定义生成的代码,以便浏览器可以处理`import`和`require`语句以及其他代码.

例如,如果您在JSX代码中使用以下代码:

```js
import { useState } from 'react';
```

然后您有两个选择:

1) 删除它并在代码中使用`React.useState`而不是`useState`.之所以可以运行是因为`React`浏览器的全局变量.

```javaScript
const [count, setCount] = React.useState(0);
```

2) 添加自定义查找和替换更新.

```html
<script>
    jsxLoader.jsUpdates.push({
        find: /import { useState } from 'react';/g,
        replace: 'var useState = React.useState;'
    });
</script>
```

通常,需要为节点导入的组件,功能等将作为全局变量存在于浏览器中,因此对于基于浏览器的JSX开发,您通常可以排除“ import”和“ require”语句.

默认情况下，以下导入是自动处理的:

```javascript
import React from 'react';
```

### 使用只支持部分浏览器的JavaScript

另一个问题是使用只适用于一些现代浏览器的JavaScript.例如使用Class fields / properties在某些浏览器(Chrome, Firefox)中可以工作,但在其他浏览器中无法工作(截至2020,包括Safari,Edge (EdgeHTML),和Samsung Internet).

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

这还包括JavaScript扩展语法,它只对新版浏览器提供部分支持.例如`...numbers`在Chrome, Firefox等浏览器中工作,但不适用于所有版本的Edge或在亚洲国家/地区广泛使用的UC浏览器.如果您在应用中使用扩展语法,请参阅本文档的[Advanced Usage]中的附加说明.

## 代码分割 :scissors:

一个单独的DataFormsJS React组件`<LazyLoad>`它允许基于浏览器的应用程序在组件首次使用它们时动态加载 `*.js`, `*.css`, 和 `*.jsx`脚本.

Places演示应用程序中的示例:
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-react.htm
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/html/search-places-react.jsx

在下面的例子中,所有三个文件都将在安装`LoadMapAndPage`后下载.在加载脚本时,将显示组件`<ShowLoading>` ,并且所有脚本下载完成后,将动态创建组件`<ShowCity>`.在此示例中,将字符串值用于`ShowCity` ,因为在下载文件`place-react.jsx`之前,该组件将不存在.

另外,添加的属性`data`和`params`将作为道具传递给`ShowCity`; 使用的所有自定义属性都将传递给子元素.如果在调用`<LazyLoad>`前`ShowCity`已经存在,那么可以使用`isLoaded={<isLoaded />}`.

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
            isLoaded="ShowCity"
            data={props.data}
            params={props.params} />
    );
}
```

默认情况下,所有`scripts`都是异步下载,而无需等待较早的脚本完成.此选项是最快的,但不适用于所有代码.在下面的例子中，必须在`jquery-3.4.1.min.js`之后加载`chosen.jquery.min.js`,以便使用属性`loadScriptsInOrder`告诉`LazyLoad`按顺序加载脚本.

此外，以下代码段显示可以使用`{children}`来代替`isLoaded`属性.

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

## 高级用法和内部机制 :microscope:

你可以[在这里查看代码](https://github.com/dataformsjs/dataformsjs/blob/master/js/react/jsxLoader.js)! 所有代码都在一个文件中，并包含许多有用的注释，以便理解它是如何工作的.

jsxLoader脚本提供了许多可用于自定义其运行方式的属性和功能.以下是最常见的用途.

```js
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
```

### jsxLoader.logCompileTime

当使用`jsxLoader.logCompileTime`时,编译每个脚本所花费的时间将记录在DevTools控制台中.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-loader-log-compile-time.png" alt="Log Compile time to DevTools Console">

### jsxLoader.logCompileDetails

当使用`jsxLoader.logCompileDetails`时,主要编译器步骤的全部详细信息将记录到DevTools控制台中.这包括:

* Tokens generated from Lexical Analysis
* Abstract Syntax Tree (AST) generated from the Tokens
* Generated Code from the AST

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-loader-log-compile-details.png" alt="Log Compile Details to DevTools Console">

### 将Babel用于包含扩展语法的应用程序

如果您的网站使用的是类似`<Greeting {...props} />`的代码,则JSX Loader会将其转换为适用于新版浏览器的`React.createElement(Greeting, ...props)`，但并不是所有新版浏览器都支持此语法.如果使用UC浏览器的亚洲国家的用户(截至2020)或使用Edge的用户(Windows 10默认浏览器)查看您的网站,这一点尤为重要.

有几种选择:

1) 避免使用扩展语法
2) 使用代码如下面的代码片段所示,因此Babel将用于不支持扩展语法的浏览器

```js
jsxLoader.evalCode = 'const { id, ...other } = { id:123, test:456 };';
```

### 如何将JS代码添加到页面

`jsxLoader.js`脚本在`DOMContentLoaded`时间上运行,首先检查环境以确定是否需要使用polyfills,以及是否使用Bable.然后,它下载JSX Code (or reads inline JSX code),将其编译为常规JavaScript,然后将其作为JavaScript添加到页面的`<head>`元素中.

页面上添加的脚本将具有一个`data-compiler`属性,其值为`jsxLoader`或`Babel`,以指示使用了哪个编译器.如果脚本已下载,那么它将在原始JSX脚本的URL中包含`data-src`属性.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-added-to-page-as-js.png" alt="JSX Code compiled to JavaScript">

### 本地开发

通常,最小化版本的`jsxLoader.min.js`将用于生产,而`jsxLoader.js`用于开发的脚本的完整版本.因此一旦将其包含在页面中，就可以使用Browser DevTools逐步调试代码.

### 从[jsxLoader.js]构建[jsxLoader.min.js]

DataFormsJS中的所有`*.min.js`文件都是使用依赖于`uglify-js`, `uglify-es`和`Babel`的构建脚本从同名的完整文件版本构建的.`jsxLoader.min.js`只能使用`uglify-js`来构建.

```bash
# From project root
node install
node run build
```

或者运行[.\scripts\build.js](https://github.com/dataformsjs/dataformsjs/blob/master/scripts/build.js) script directly: `node build.js`.

### 单元测试

使用Mocha从浏览器运行`jsxLoader.js`.通常,是使用Jest在模拟浏览器环境中进行测试的,但是，重要的是必须从实际的浏览器中对`jsxLoader.js`进行测试,以便可以在尽可能多的环境中对其进行验证,因为它会为某些浏览器下载Polyfills和Babel.

该方法还有助于验证来自`jsxLoader.js`的已编译JS代码的行为是否与来自Babel的相同结果相匹配.例如,新版浏览器和IE 11(使用Babel)都需要确认.

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
# http://127.0.0.1:5000/
```

下图显示了“单元测试”页面的外观.当使用现代浏览器进行测试时`jsxLoader`将出现在屏幕的左上角.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-modern-browser.png" alt="Unit Testing with Modern Browser">

当使用IE 11这样的传统浏览器进行测试时,`Babel`将与`(Polyfill Downloaded)`一起显示.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-ie-11.png" alt="Unit Testing with IE 11">

如果正在测试不支持该扩展语法的现代浏览器,则会显示一条有用的警告,因为它会导致某些测试失败.另外,对于需要下载Polyfills(通常是缺少`Promise.prototype.finally`)的新版浏览器,会出现`(Polyfill Downloaded)`.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-uc-browser.png" alt="Unit Testing with UC Browser">

## 已知问题 :warning:

* 一般来说,如果一个已知的问题需要大量的代码,它很可能不被支持,因为此脚本旨在用作小型而快速的JSX解析器/编译器,而不是功能齐全的JavaScript解析器/编译器.
* 对于某些意外的语法错误,错误消息可能不太友好,因此在开发期间建议在代码编辑器中使用linting,以避免来自`jsxLoader.js`的错误.如果使用Visual Studio代码或其他流行的编辑器进行开发,则应自动执行此操作.如果生成的代码有语法错误,并且不清楚为什么建议使用Chrome DevTools(或Chromium构建的Edge).由于生成的JavaScript重新添加到动态元素中,因此大多数浏览器将显示错误的位置,但最新版本的Chrome和Edge经常将其显示在正确的位置.
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-debug-error-in-chrome.png" alt="Debug Errors with Chrome Dev Tools">
* 最小化的`for`循环可能会引起问题: `for(n=0;n<m;n++)` as the `<m;n++)`可能被解析为元素.但是,如果一个完整的文件被最小化,它将被作为JavaScript处理,这意味着最小化的组件通常在默认情况下工作.
* 与使用Babel时会创建的子节点相比,有时在('element', props, ...children)`的子节点中会生成额外的子空白.通常,这种情况很少发生,但可以在[log demo page](https://www.dataformsjs.com/examples/log-table-react.htm)中找到.这个问题对页面没有视觉影响,性能也不会下降,并且不会经常发生,因此被认为是可以接受的.
* 看起来像复杂嵌套模板文本(模板字符串)中的元素的文本,可能导致分析错误或意外结果:

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
