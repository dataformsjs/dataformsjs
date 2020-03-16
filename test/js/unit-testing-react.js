/*
    IMPORTANT - Unit Tests defined here for [jsxLoader.js] may not cover all logic and code.

    Until every line of code in [jsxLoader.js] is verified here all React demos must work when
    testing locally without any code changes to the JSX code in the related files. It's likely
    that if the Unit Tests pass then all demos will work but to be on the safe side they should
    also be tested.

    Run `npm start` at the root directory to start the server for demo pages then view
    them using URL's below. Additionally each page would have to be changed to use the
    local version instead of the server version.

    For most updates simply doing regression testing after publishing a new release
    and updating the CDN version if HTML files is ok.

    http://127.0.0.1:8080/places-demo-react
    http://127.0.0.1:8080/image-classification-react
    http://127.0.0.1:8080/log-table-react
    http://127.0.0.1:8080/countries-no-spa-react
    http://127.0.0.1:8080/countries-no-spa-preact
    http://127.0.0.1:8080/hacker-news-react
    http://127.0.0.1:8080/examples/hello-world/en/react.htm
    http://127.0.0.1:8080/examples/hello-world/en/preact.htm
    http://127.0.0.1:8080/examples/hello-world/en/rax.htm
*/

var expect = chai.expect;

// Babel script count is based on DataFormsJS React Components are loaded in [unit-testing-react.htm]
var componentScripts = document.querySelectorAll('script[type="text/babel"][src*="src/react/es6"]').length;
var expectedScriptCount = {
    addedToPage: 6 + componentScripts,
    compiler: 5 + componentScripts,
    compilerAndSrc: 2 + componentScripts,
};

// Get starting value because by the time Tests run this will be updated
var startingIsSupported = jsxLoader.isSupportedBrowser;

describe('jsxLoader.js', function() {
    describe('API', function() {
        it('should exists as window.jsxLoader', function() {
            expect(window.jsxLoader).to.be.instanceof(Object);
        });

        it('should have jsxLoader.polyfillUrl', function() {
            expect(jsxLoader).to.have.property('polyfillUrl', 'https://polyfill.io/v3/polyfill.min.js?features=Array.from,Array.isArray,Array.prototype.find,Object.assign,Object.keys,URL,fetch,Promise,Promise.prototype.finally,String.prototype.endsWith,String.prototype.startsWith,String.prototype.includes,String.prototype.repeat,WeakSet,Symbol,Number.isInteger,String.prototype.codePointAt,String.fromCodePoint');
        });

        it('should have jsxLoader.babelUrl', function() {
            expect(jsxLoader).to.have.property('babelUrl', 'https://unpkg.com/@babel/standalone@7.8.4/babel.min.js');
        });

        it('should have jsxLoader.babelOptions', function() {
            expect(jsxLoader.babelOptions).to.deep.equal({ presets: ['es2015', 'react'] });
        });

        it('should have jsxLoader.logCompileTime', function() {
            expect(typeof jsxLoader.logCompileTime).to.equal('boolean');
        });

        it('should have jsxLoader.logCompileDetails', function() {
            expect(typeof jsxLoader.logCompileDetails).to.equal('boolean');
        });

        it('should have jsxLoader.evalCode', function() {
            expect(jsxLoader).to.have.property('evalCode', 'class foo {}; let result = 1 + 1;');
        });

        it('should have jsxLoader.jsUpdates', function() {
            var list = [
                { find: /export function/g,             replace: 'function' },
                { find: /export default class/g,        replace: 'class' },
                { find: /import React from 'react';/g,  replace: '' },
                { find: /import React from"react";/g,   replace: '' },
            ];
            if (window.preact !== undefined) {
                list.push({ find: /ReactDOM\.render/g, replace: 'preact.render' });
                list.push({ find: /React\.Component/g, replace: 'preact.Component' });
                list.push({ find: /React\.Fragment/g, replace: 'preact.Fragment' });
                list.push({ find: /React\.createElement/g, replace: 'preact.createElement' });
                list.push({ find: /React\.cloneElement/g, replace: 'preact.cloneElement' });
                list.push({ find: /React\.createRef/g, replace: 'preact.createRef' });
                list.push({ find: /onChange:/g, replace: 'onInput:' });
                list.push({ find: /import preact from 'preact';/g, replace: '' });
                list.push({ find: /import preact from"preact";/g, replace: '' });
            }
            expect(jsxLoader.jsUpdates).to.deep.equal(list);
        });

        it('should have jsxLoader.isSupportedBrowser start with null', function() {
            expect(startingIsSupported).to.be.null;
        });

        it('should have jsxLoader.isSupportedBrowser set to a boolean', function() {
            expect(typeof jsxLoader.isSupportedBrowser).to.equal('boolean');
        });

        it('should have jsxLoader.needsPolyfill set to a boolean', function() {
            expect(typeof jsxLoader.needsPolyfill).to.equal('boolean');
        });

        it('should have jsxLoader.maxRecursiveCalls', function() {
            expect(jsxLoader).to.have.property('maxRecursiveCalls', 1000);
        });

        it('should have jsxLoader.hasPendingScripts() === false', function() {
            expect(jsxLoader.hasPendingScripts()).to.equal(false);
        });

        it('should be able to call jsxLoader.setup() twice', function() {
            var beforeCount = document.querySelectorAll('script[type="text/babel"]:not([data-added-to-page])').length;
            jsxLoader.setup();
            var afterCount = document.querySelectorAll('script[type="text/babel"]:not([data-added-to-page])').length;
            expect(beforeCount).to.equal(afterCount);
        });

        it('should be able to load a script after the page loads using jsxLoaded.loadScript(element)', function(done) {
            var script = document.querySelector('script[type="text/jsx"]');
            jsxLoader.loadScript(script).then(function() {
                var html = document.querySelector('.test-content.added-by-test').innerHTML;
                expect(html).to.equal('<div>Hello World</div>');
                done();
            });
        });

        it('should have jsxLoader.addBabelPolyfills()', function() {
            expect(jsxLoader.addBabelPolyfills).to.be.instanceof(Function);
        });

        it('should have jsxLoader.downloadScript()', function() {
            expect(jsxLoader.downloadScript).to.be.instanceof(Function);
        });

        it('should have jsxLoader.addAdditionalPolyfills()', function() {
            expect(jsxLoader.addAdditionalPolyfills).to.be.instanceof(Function);
        });

        it('should have jsxLoader.compiler', function() {
            expect(jsxLoader.compiler).to.be.instanceof(Object);
        });

        it('should have jsxLoader.compiler.compile()', function() {
            expect(jsxLoader.compiler.compile).to.be.instanceof(Function);
        });

        it('should have jsxLoader.compiler.isMinimized()', function() {
            // The compiler has other available functions, but in general they
            // would not be used by external apps or code.
            expect(jsxLoader.compiler.isMinimized).to.be.instanceof(Function);
        });
    });

    // Check content rendered from [test/js/unit-testing.jsx]
    describe('Page Loaded and Content', function() {
        it('should have content added to the page', function() {
            var html = document.getElementById('root').innerHTML;
            expect(html).does.not.equal('');
        });

        // The result number for this and a few tested depending on how <JsonData> is added to the calling page.\
        // When added as <script type="text/babel" src="src/react/es6/JsonData.js"></script> it will be processed
        // by the [jsxLoader.js] before being added as JavaScript on the page.
        it('should have correct number of babel scripts with [data-added-to-page]', function() {
            var scripts = document.querySelectorAll('script[type="text/babel"][data-added-to-page]');
            expect(scripts.length).to.equal(expectedScriptCount.addedToPage);
        });

        it('should have 2 error babel scripts with [data-added-to-page][data-error]', function() {
            var scripts = document.querySelectorAll('script[type="text/babel"][data-added-to-page][data-error]');
            expect(scripts.length).to.equal(2);
        });

        it('should have correct number of scripts with [data-compiler]', function() {
            var scripts = document.querySelectorAll('script[data-compiler]');
            expect(scripts.length).to.equal(expectedScriptCount.compiler);
        });

        it('should have correct number of scripts with [data-compiler][data-src]', function() {
            var scripts = document.querySelectorAll('script[data-compiler][data-src]');
            expect(scripts.length).to.equal(expectedScriptCount.compilerAndSrc);
        });

        it('should have <h1> with `Unit Testing Content`', function() {
            var el = document.querySelector('#root h1');
            expect(el.textContent).to.equal('Unit Testing Content');
        });

        it('should code to use strict mode', function() {
            var el = document.querySelector('.is-strict-mode');
            expect(el.textContent).to.equal('use strict: true');
        });

        it('should have <HelloMessage> with `Hello World`', function() {
            var el = document.querySelector('div#hello-1');
            expect(el.textContent).to.equal('Hello World');
        });

        it('should have <HelloMessage> with `Hello Test`', function() {
            var el = document.querySelector('div#hello-2');
            expect(el.textContent).to.equal('Hello Test');
        });

        it('should have div-1', function() {
            var el = document.querySelector('#div-1');
            expect(el.textContent).to.equal(' div-1');
        });

        it('should have div-2', function() {
            var el = document.querySelector('#div-2');
            expect(el.textContent).to.equal('  div-2');
        });

        it('should have div-3', function() {
            var el = document.querySelector('#div-3');
            expect(el.textContent).to.equal('div-3');
        });

        it('should have div-4', function() {
            var el = document.querySelector('#div-4');
            expect(el.textContent).to.equal('Hello World');
        });

        it('should have div-5', function() {
            var el = document.querySelector('#div-5');
            expect(el.textContent).to.equal("123 & 456 '");
        });

        it('should have div-6', function() {
            var el = document.querySelector('#div-6');
            expect(el.textContent).to.equal(' Hello World ');
        });

        it('should have div-7 with from &nbsp; escape characters', function() {
            var el = document.querySelector('#div-7');
            expect(el.textContent).to.equal('  Hello World  ');
        });

        it('should have div-8 with from &nbsp; characters (ASCII == 160)', function() {
            var el = document.querySelector('#div-8');
            expect(el.textContent).to.equal('  Hello World  ');
        });

        it('should have div-9 with link text', function() {
            var el = document.querySelector('#div-9');
            expect(el.textContent).to.equal('https://www.dataformsjs.com/');
        });

        it('should have div-9 attribute', function() {
            var el = document.querySelector('#div-9');
            expect(el.getAttribute('data-selector')).to.equal('ul.link > li');
        });

        it('should have <ul class="links"> with 3 links', function() {
            var links = document.querySelectorAll('ul.links li > a[target="_blank"]');
            expect(links).to.be.lengthOf(3);
        });

        it('should have correct content in <ul class="links"> for link 1', function() {
            var link = document.querySelector('ul.links li:first-child > a');
            expect(link.textContent).to.equal('https://www.dataformsjs.com/en/');
        });

        it('should have correct content in <ul class="links"> for link 2', function() {
            var link = document.querySelector('ul.links li:nth-child(2) > a');
            expect(link.textContent).to.equal('https://www.dataformsjs.com/pt-BR/');
        });

        it('should have correct content in <ul class="links"> for link 3', function() {
            var link = document.querySelector('ul.links li:last-child > a');
            expect(link.textContent).to.equal('https://www.dataformsjs.com/zh-CN/');
        });

        it('should have <ul class="links2"> with 4 elements', function() {
            var links = document.querySelectorAll('ul.links2 li');
            expect(links).to.be.lengthOf(4);
        });

        it('should have <input id="file-1" type="file" accept="image/*" multiple />', function() {
            var input = document.querySelector('input#file-1[type="file"][accept="image/*"][multiple]');
            expect(input).to.be.an.instanceof(HTMLInputElement);
        });

        it('should have <select> with empty value', function() {
            var el = document.querySelector('select option[value=""]');
            expect(el.textContent).to.equal('Empty');
        });

        it('should have <select> with item 1', function() {
            var el = document.querySelector('select option[value="item-1"]');
            expect(el.textContent).to.equal('Item 1');
        });

        it('should have test html string rendered correctly', function() {
            var el = document.getElementById('test-html-string');
            expect(el.textContent).to.equal("'<div>test</div>'");
        });

        it('should support elements in ternary operator for true conditions', function() {
            var el = document.querySelector('.expect-true span');
            expect(el.textContent).to.equal('true');
        });

        it('should support elements in ternary operator for false conditions', function() {
            var el = document.querySelector('.expect-false span');
            expect(el.textContent).to.equal('false');
        });

        it('should support custom namespaces starting with lowercase letter', function() {
            var el = document.querySelector('.test-namespace-1');
            expect(el.textContent).to.equal('Hello from [testNamespace.Hello]');
        });

        it('should support custom namespaces starting with uppercase letter', function() {
            var el = document.querySelector('.test-namespace-2');
            expect(el.textContent).to.equal('Hello from [TestNamespace.Hello]');
        });

        it('should have <div class="link-count"><span> with link count', function() {
            var el = document.querySelector('div.link-count span');
            expect(el.textContent).to.equal('Link Count: 3');
        });

        it('should have <div class="link-count-2"><span> with link count', function() {
            var el = document.querySelector('div.link-count-2 span');
            expect(el.textContent).to.equal('Link Count 2: 3');
        });

        it('should have 1 <table>', function() {
            var tables = document.querySelectorAll('table');
            expect(tables).to.be.lengthOf(1);
        });

        it('should have <table> with expected attributes', function() {
            var table = document.querySelector('table[data-sort][data-sort-class-odd="row-odd"][data-sort-class-even="row-even"]');
            expect(table).to.be.instanceof(HTMLTableElement);
        });

        it('should have correct number of table columns', function() {
            var columns = document.querySelectorAll('table thead tr th');
            expect(columns).to.be.lengthOf(5);
        });

        it('should have correct content in last table column', function() {
            var column = document.querySelector('table thead tr th:nth-child(5)');
            expect(column.textContent).to.equal('Column 4');
        });

        it('should have correct number of table rows', function() {
            var rows = document.querySelectorAll('table tbody tr');
            expect(rows).to.be.lengthOf(5);
        });

        it('should have correct number of table cells', function() {
            var cells = document.querySelectorAll('table tbody tr td');
            expect(cells).to.be.lengthOf(25);
        });

        it('should have correct content in table cell at first row and first column', function() {
            var cell = document.querySelector('table tbody tr:first-child td:first-child');
            expect(cell.textContent).to.equal('R-0 C-0');
        });

        it('should have correct content in table cell at last row and last column', function() {
            var cell = document.querySelector('table tbody tr:last-child td:last-child');
            expect(cell.textContent).to.equal('R-4 C-4');
        });

        it('should have correct class in table body', function() {
            var tbody = document.querySelector('table tbody');
            expect(tbody.className).to.equal('click-to-highlight');
        });

        it('should have node-1', function() {
            var node = document.querySelector('section #node-1 > span');
            expect(node.textContent).to.equal('node-1');
        });

        it('should have node-2', function() {
            var node = document.querySelector('section #node-1 #node-2 > span');
            expect(node.textContent).to.equal('    node-2');
        });

        it('should have node-3', function() {
            var node = document.querySelector('section #node-1 #node-2 #node-3 > span');
            expect(node.textContent).to.equal('        node-3');
        });

        it('should have node-4', function() {
            var node = document.querySelector('section #node-1 #node-2 #node-3 #node-4 > span');
            expect(node.textContent).to.equal('            node-4');
        });

        it('should have node-5', function() {
            var node = document.querySelector('section #node-1 #node-2 #node-3 #node-5 span');
            expect(node.textContent).to.equal('            node-5');
        });

        it('should have node-6', function() {
            var node = document.querySelector('section #node-1 #node-2 #node-3 #node-6');
            expect(node.textContent.trim()).to.equal('node-6 Test');
        });

        it('should have node-7', function() {
            var node = document.querySelector('section #node-1 #node-2 #node-3 #node-7');
            expect(node.textContent.trim()).to.equal('node-7 Test Test Test Test');
        });

        it('should have blog', function() {
            var node = document.querySelector('.blog');
            expect(node.textContent).to.equal('Blog');
        });

        it('should have video', function() {
            var node = document.querySelector('.video');
            expect(node.textContent).to.equal('Video');
        });

        it('should have odd-number', function() {
            var node = document.querySelector('#odd-number');
            expect(node.textContent).to.equal('1 is an odd number');
        });

        it('should have odd-number <i>', function() {
            var node = document.querySelector('#odd-number i');
            expect(node.textContent).to.equal('odd');
        });

        it('should have even-number', function() {
            var node = document.querySelector('#even-number');
            expect(node.textContent).to.equal('2 is an even number');
        });

        it('should have even-number <strong>', function() {
            var node = document.querySelector('#even-number strong');
            expect(node.textContent).to.equal('even');
        });

        it('should have greeting', function() {
            var node = document.querySelector('.greeting');
            expect(node.textContent).to.equal('First Last');
        });

        it('should have display-prop-test', function() {
            var node = document.querySelector('#display-prop-test');
            expect(node.textContent).to.equal('display-prop-1 test');
        });

        it('should have display-prop-test[message]', function() {
            var node = document.querySelector('#display-prop-test');
            expect(node.getAttribute('message')).to.equal('Hello World test');
        });

        it('should have display-prop-1', function() {
            var node = document.querySelector('#display-prop-1');
            expect(node.textContent).to.equal('display-prop-1');
        });

        it('should have display-prop-1[message]', function() {
            var node = document.querySelector('#display-prop-1');
            expect(node.getAttribute('message')).to.equal('Hello World');
        });

        it('should have users list 1 - user 1', function() {
            var node = document.querySelector('.users #user-1');
            expect(node.textContent).to.equal('User1');
        });

        it('should have users list 1 - user 2', function() {
            var node = document.querySelector('.users #user-2');
            expect(node.textContent).to.equal('User2');
        });

        it('should have users list 2 - user 1', function() {
            var node = document.querySelector('.users-2 #user2-1');
            expect(node.textContent).to.equal('User1 Test');
        });

        it('should have users list 2 - user 2', function() {
            var node = document.querySelector('.users-2 #user2-2');
            expect(node.textContent).to.equal('User2 Test');
        });

        it('should support shorthand fragments <>', function() {
            var el = document.querySelector('.shorthand-fragment');
            expect(el.textContent).to.equal('Shorthand Fragment Check');
        });

        it('should have 2nd shorthand fragment element', function() {
            var el = document.querySelector('.shorthand-fragment2');
            expect(el.textContent).to.equal('Shorthand Fragment Check 2');
        });
    });

    // NOTE - this section covers the compiler but in general all compiler logic should be handled by
    // actual JSX in [unit-testing.jsx] and the previous test section. This section only handles a
    // small portion of the compiler and not all logic. When adding new scripts to obtain the value
    // of `js` use `console.log(JSON.stringify(js));` then copy from DevTools.
    describe('Compiler', function() {
        function getCompilerError(jsx) {
            var error = null;
            try {
                jsxLoader.compiler.compile(jsx);
            } catch (e) {
                error = e.toString();
            }
            return error;
        }

        it('should compile simple element', function() {
            var jsx = '<div></div>';
            var js = jsxLoader.compiler.compile(jsx);
            expect(js).to.equal("React.createElement(\"div\", null)");
        });

        it('should compile simple element with 1 child', function() {
            var jsx = '<Test>Hello</Test>';
            var js = jsxLoader.compiler.compile(jsx);
            expect(js).to.equal("React.createElement(Test, null, \"Hello\")");
        });

        it('should compile simple element with 2 children', function() {
            var jsx = '<div>Hello {this.props.name}</div>';
            var js = jsxLoader.compiler.compile(jsx);
            expect(js).to.equal("React.createElement(\"div\", null, \"Hello \", this.props.name)");
        });

        it('should compile nested elements', function() {
            var jsx = '<div><div>Hello {this.props.name}</div></div>';
            var js = jsxLoader.compiler.compile(jsx);
            expect(js).to.equal("React.createElement(\"div\", null, \n            React.createElement(\"div\", null, \"Hello \", this.props.name))");
        });

        it('should compile simple element with props', function() {
            var jsx = '<Test message="test" value={123}>Hello</Test>';
            var js = jsxLoader.compiler.compile(jsx);
            console.log(js);
            console.log(JSON.stringify(js));
            expect(js).to.equal('React.createElement(Test, {message: "test", value: 123}, "Hello")');
        });

        it('should have correct child whitespace nodes', function() {
            var jsx = '<div><strong className={this.props.cssClass}>Test:</strong> {this.props.name} <section>Test [{this.props.name}] <span className="test">Test2</span></section></div>';
            var js = jsxLoader.compiler.compile(jsx);
            expect(js).to.equal('React.createElement(\"div\", null, \n            React.createElement(\"strong\", {className: this.props.cssClass}, \"Test:\"), \" \", this.props.name, \" \",  React.createElement(\"section\", null, \"Test [\", this.props.name, \"] \", \n                React.createElement(\"span\", {className: \"test\"}, \"Test2\")))');
        });

        it('should have a helpfull error message for different closing element', function() {
            var error = getCompilerError('<div></span>');
            expect(error).to.equal('Error: Found closing element [span] that does not match opening element [div] from Token # 1 at Line #: 1, Column #: 10, Line: <div></span');
        });

        it('should have a helpfull error message for missing closing element', function() {
            var error = getCompilerError('\n\n<div><span></div>');
            expect(error).to.equal('Error: Found closing element [div] that does not match opening element [span] from Token # 3 at Line #: 3, Column #: 15, Line: <div><span></div');
        });

        it('should error in the tokenizer for recusive calls', function() {
            jsxLoader.maxRecursiveCalls = 1;
            var error = getCompilerError('<Parent data={<Child />}</Parent>');
            expect(error).to.equal('Error: Call count exceeded in tokenizer. If you have a large JSX file that is valid you can increase them limit using the property `jsxLoader.maxRecursiveCalls`.');
            jsxLoader.maxRecursiveCalls = 1000; // Reset
        });

        it('should error in the parser for recusive calls', function() {
            jsxLoader.maxRecursiveCalls = 1;
            var error = getCompilerError('<Parent><Child></Child></Parent>');
            expect(error).to.equal('Error: Call count exceeded in parser. If you have a large JSX file that is valid you can increase them limit using the property `jsxLoader.maxRecursiveCalls`.');
            jsxLoader.maxRecursiveCalls = 1000; // Reset
        });

        it('should error with a minimized js `for` loop', function() {
            // The jsxLoader is not a full JavaScript parser so it currently doesn't handle minimized code like this.
            // See also the next test.
            var error = getCompilerError('for(let n=0;n<m;n++) {console.log(n);} <div></div>');
            console.log(error);
            expect(error).to.equal('Error: Unhandled character in element properties: ` <div` at Line #: 1, Column #: 43, Line: for(let n=0;n<m;n++) {console.log(n);} <div>');
        });

        it('should work with a spaced js `for` loop', function() {
            // Simlar to the above but spaces are used so the code compiles correctly.
            var jsx = 'for (let n = 0; n < m; n++) {console.log(n);} <div></div>';
            var js = jsxLoader.compiler.compile(jsx);
            expect(js).to.equal('for (let n = 0; n < m; n++) {console.log(n);} React.createElement("div", null)');
        });

        it('should support @jsx code hint on single line comment', function() {
            var jsx = '// @jsx preact.createElement\n<div></div>';
            var js = jsxLoader.compiler.compile(jsx);
            expect(js).to.equal("                            \npreact.createElement(\"div\", null)");
        });

        it('should support @jsx code hint on multline line comment', function() {
            var jsx = '/* @jsx Rax.createElement */<div></div>';
            var js = jsxLoader.compiler.compile(jsx);
            expect(js).to.equal("                            Rax.createElement(\"div\", null)");
        });

        it('should support @jsx code hint on JSDoc comment', function() {
            var jsx = '/**\n\t@jsx h */<div></div>';
            var js = jsxLoader.compiler.compile(jsx);
            expect(js).to.equal("   \n          h(\"div\", null)");
        });
    });
});

describe('DataFormsJS React Components', function() {
    describe('Check that Components are Loaded', function() {
        // Define Tests dynamically, without using dynamic
        // code the tests would look like this:
        //
        //    var obj = new JsonData();
        //    expect(obj).to.be.instanceof(JsonData);
        //
        var classes = 'ErrorBoundary, JsonData, InputFilter, Format, SortableTable, LeafletMap, LazyLoad, Cache';
        classes = classes.split(', ');
        classes.forEach(function(className) {
            it('should have <' + className + '>', function() {
                var obj = new Function('return new ' + className + '();')();
                expect(obj).to.be.instanceof(new Function('return ' + className)());
            });
        });

        // The `I18n` class requires constructor parameters so verify the known error
        it('should have <I18n>', function() {
            var error = null;
            try {
                var obj = new I18n;
            } catch (e) {
                error = e.toString();
            }
            expect(error).to.equal('Error: Error - I18n - Missing default locale See examples for usage.');
        });
    });
});

describe('<JsonData>', function() {
    describe('Component Loaded and Content', function() {
        it('should have show loading state', function() {
            var html;
            // [testJsonDataHtml] is defined from [unit-testing.jsx]
            if (window.testJsonDataHtml !== undefined) {
                html = window.testJsonDataHtml[0];
            } else {
                html = document.querySelector('.test-content.json-data').innerHTML;
            }
            var loading = '<div class="loading">Loading...</div>';
            expect(html).to.equal(loading);
        });

        it('should have show loaded state', function(done) {
            var callCount = 0;
            var interval = window.setInterval(function() {
                // This should happen quickly
                callCount++;
                if (callCount > 200) {
                    window.clearInterval(interval);
                    var error = 'Unexpected error loading <JsonData>, check DevTools';
                    var el = document.querySelector('.test-content.json-data');
                    el.textContent = error;
                    el.className = 'error';
                    el.style.display = '';
                    done();
                    return;
                }

                // Wait until the state changes from [isLoading] to [isLoaded].
                // This is handled by a global variable that is defined from [unit-testing.jsx]
                if (window.testJsonDataHtml === undefined || window.testJsonDataHtml.length !== 2) {
                    return;
                }

                // Check HTML
                window.clearInterval(interval);
                var div = document.querySelector('.test-content.json-data div');
                var span = document.querySelector('.test-content.json-data span');
                var res = 'Response from Server';
                expect([div.textContent, span.textContent]).to.deep.equal([res, res]);
                done();
            }, 20);
        });

        // NOTE - If running from a public static URL (tested AWS S3) this has shown the incorrect error
        // `Error: Script error. (:0)` when testing on Chrome with DevTools open. The error did not occur
        // when testing the same page in Firefox and IE or with DevTools closed. Even though the error happened
        // the content rendered correctly. It should run without error when testing locally on all browsers.
        //
        // The error also happens on Safari (iPhone) however it's related to Mocha as content renders correctly.
        it('should have show error state content', function(done) {
            var el = document.querySelector('.test-content.json-error div');
            var callCount = 0;
            var interval = window.setInterval(function() {
                // This should happen quickly
                callCount++;
                if (callCount > 200) {
                    window.clearInterval(interval);
                    var error = 'Unexpected error loading <JsonData>, check DevTools';
                    if (el === null) {
                        el = el = document.querySelector('.test-content.json-error');
                    }
                    el.textContent = error;
                    el.className = 'error';
                    el.style.display = '';
                    done();
                    return;
                }

                // Wait until the state changes from [isLoading] to [hasError].
                // This is handled by a global variable that is defined from [unit-testing.jsx]
                if (window.testJsonDataErrorHtml === undefined || window.testJsonDataErrorHtml.length !== 2) {
                    return;
                }

                // Check HTML
                window.clearInterval(interval);
                expect(el.textContent).to.deep.equal('Error loading data. Server Response Code: 404, Response Text: Not Found');
                done();
            }, 20);
        });

        it('should have show error state background color', function() {
            var el = document.querySelector('.test-content.json-error div');
            expect(el.style.backgroundColor).to.equal('red');
        });

        it('should have show error state font color', function() {
            var el = document.querySelector('.test-content.json-error div');
            expect(el.style.color).to.equal('rgb(255, 255, 255)');
        });
    });
});