/**
 * In most cases the jsxLoader will be used to automatically compile
 * JSX code in the browser, however if needed it's possible that
 * it can be used from node.
 * 
 * https://github.com/dataformsjs/dataformsjs/issues/16
 * 
 * To compare transformed code with Babel, try it online:
 *  https://babeljs.io/repl
 * 
 * In general results should be similar. With the latest version
 * of Babel it will add comments for generated React Code and includes
 * "use strict" by default. The current version of jsxLoader does not
 * add a "use strict" and typically spaces elements one element per line
 * for readability of the transformed code.
 */

/**
 * Import
 */
const { jsxLoader } = require('../js/react/jsxLoader')

/**
 * React Demo
 */
const reactCode = jsxLoader.compiler.compile('<Comp>hello mama</Comp>')
console.log(reactCode)
// React.createElement(Comp, null, "hello mama");

/**
 * `h` Demo
 */
jsxLoader.compiler.pragma = 'h';
 const desugarizedCode = jsxLoader.compiler.compile('<Comp>hello mama</Comp>')
console.log(desugarizedCode)
// h(Comp, null, "hello mama")

/**
 * Nested Elements using Vue 3 `Vue.h` and `Vue.Fragment`
 */
jsxLoader.compiler.pragma = 'Vue.h';
jsxLoader.compiler.pragmaFrag = 'Vue.Fragment';
const nestedElement = jsxLoader.compiler.compile('<>hello mama <span>test</span> <span>test2</span></>')
console.log(nestedElement)
/*
Vue.h(Vue.Fragment, null, "hello mama ", 
            Vue.h("span", null, "test"), " ", 
            Vue.h("span", null, "test2"))
*/