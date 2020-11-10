/**
 * Test Script in active development (November 2020):
 * 
 * https://github.com/dataformsjs/dataformsjs/issues/16
 * 
 * To compare transformed code with Babel, try it online:
 *  https://babeljs.io/repl
 * 
 * In general results should be similar. With the latest version
 * of Babel it will add comments for generated React Code and includes
 * "use strict" by default. The current version of jsxLoader does not
 * add a "use strict" and typically spaces elements one elment per line
 * for readability of the transformed code.
 */

/**
 * Import
 */
const { transform } = require('../js/react/jsxLoader')
// import { transform } from '../js/react/jsxLoader'

/**
 * React Demo
 */
const reactCode = transform('<Comp>hello mama</Comp>')
console.log(reactCode)
// React.createElement(Comp, null, "hello mama");

/**
 * `h` Demo
 */
const desugarizedCode = transform('<Comp>hello mama</Comp>', {pragma: 'h'})
console.log(desugarizedCode)
// h(Comp, null, "hello mama")

/**
 * Nested Elements using Vue 3 `h`
 */
const nestedElement = transform('<Comp>hello mama <span>test</span> <span>test2</span></Comp>', {pragma: 'Vue.h'})
console.log(nestedElement)
/*
Vue.h(Comp, null, "hello mama ", 
            Vue.h("span", null, "test"), " ", 
            Vue.h("span", null, "test2"))
*/