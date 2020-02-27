/**
 * DataFormsJS Build Script
 *
 * This script is used to generate (*.min.js) files and also to build
 * React Components in [js/react/es5/*.js] that are compatible for IE,
 * old Safari and other browsers.
 *
 * This script requires the following npm packages:
 *     https://www.npmjs.com/package/uglify-js
 *     https://www.npmjs.com/package/uglify-es
 *     https://www.npmjs.com/package/@babel/standalone
 *
 * To install dependencies download this repository and then run:
 *     npm install
 * 
 * To run from project root:
 *     node run build
 * 
 * Or run the file directly:
 *     node build.js
 *
 * Originally DataFormsJS React Components were built in a browser using
 * Babel Standalone rather than the full version of Babel. Babel Standalone
 * is smaller in size and uses less config so it is used for the build here.
 *
 * This script has minimal error handling so if there is a build error this
 * script may error and then the file will have to be fixed.
 *
 * When running this script will update only files (*.min.js) if the main
 * file has been modified.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const Babel = require('@babel/standalone');
const UglifyJS = require('uglify-js');
const UglifyES = require('uglify-es');

// Handle CRLF for Windows when comparing files
const isWindows = (process.platform === 'win32');

/**
 * Main function
 */
(async () => {
    // Small copyright header to core files. Only a few files are updated.
    // Bascially one file for the Framework, one file for React,
    // and two files for Web Components.
    let copyright = '// @link https://www.dataformsjs.com\n// @author Conrad Sollitt (http://www.conradsollitt.com)\n// @license MIT\n';
    if (isWindows) {
        copyright = copyright.replace(/\n/g, '\r\n');
    }

    // Build React [js/react/es5/*.js] files from [js/react/es6*.js]
    let { filesChecked, filesUpdated } = await buildReactFiles(copyright);

    // Get all JS Files
    const {jsFiles, webFiles} = await getAllFiles();
    const fileGroups = [
        { files:jsFiles,  es6:false, minifier:UglifyJS, title:'JavaScript Files' },
        { files:webFiles, es6:true,  minifier:UglifyES, title:'Web Components / React' },
    ];
    let fileErrors = 0;

    // Process all JavaScript files using [uglify-js]
    // Process all React and Web Component files using [uglify-es]
    for (const { files, es6, minifier, title } of fileGroups) {
        console.log('-'.repeat(40));
        console.log(`${title} (${files.length}):`);
        for (const file of files) {
            // Read contents of the full uncompressed file
            const code = await readFile(file, 'utf8');
            filesChecked++;

            // Read existing [*.min.js] file if it exists
            const outFile = file.replace('.js', '.min.js');
            let minCode = null;
            if (fs.existsSync(outFile)) {
                minCode = await readFile(outFile, 'utf8');
            }

            // Minify in-memory
            const result = minifier.minify(code);
            if (result.error !== undefined) {
                console.error('Unable to compress code, check file:');
                console.error(file);
                fileErrors++;
                continue;
            }
            let newCode = result.code;
            if (isWindows) {
                newCode = newCode.replace(/\n/g, '\r\n');
            }

            // Add copyright
            let addCopyright;
            if (!es6) {
                addCopyright = (file.endsWith('DataFormsJS.js') || file.endsWith('DataFormsJS.React.js') || file.endsWith('jsxLoader.js'));
            } else {
                addCopyright = (file.endsWith('json-data.js') || file.endsWith('url-hash-router.js'));
            }
            if (addCopyright) {
                newCode = copyright + newCode;
            }

            // Update import statements for Web Components use minified version:
            //    import { ... } from './utils.js';
            // becomes:
            //    import { ... } from './utils-min.js';
            if (es6) {
                newCode = newCode.replace('./utils.js', './utils.min.js').replace('./utils-sort.js', './utils-sort.min.js');
            }

            // Update file if different
            if (newCode !== minCode) {
                console.log('Writing file: ' + outFile);
                await writeFile(outFile, newCode);
                filesUpdated++;
            }
        }
    }

    // Status
    console.log('-'.repeat(40));
    console.log('Files Checked: ' + filesChecked);
    console.log('Files Updated: ' + filesUpdated);
    console.log('File Errors: ' + fileErrors);
    if (fileErrors) {
        console.log('Review details from stderr');
        process.exitCode = 1;
    }
})();

/**
 * Build React [js/react/es5/*.js] files from [js/react/es6*.js] using Babel
 * @param {string} copyright
 * @returns {int} Count of Updated Files
 */
async function buildReactFiles(copyright) {
    // Get all components and classes for React except [DataFormsJS.js].
    // [DataFormsJS.js] is excluded because it is only intended for local development
    // with [create-react-app] and similar projects. It is re-created in this function
    // for ES4 based on the classes found in the folder.
    const rootDir = __dirname + '/../js/react';
    const components = await readdir(rootDir + '/es6')
        .then(files => { return files.filter(f => f.endsWith('.js') && !f.endsWith('.min.js') && f !== 'DataFormsJS.js'); })
        .then(files => { return files.map(f => f.replace('.js', '')); })
        .catch(err => { throw err; });

    // Status
    console.log('-'.repeat(40));
    console.log(`React Components (${components.length}):`);

    // Options for Babel
    const options = { presets: ['es2015', 'stage-3', 'react'], comments: false };

    // Read and process files one at a time
    let filesChecked = 0;
    let filesUpdated = 0;
    const defineExports = 'if (window.exports === undefined) { window.exports = window; }\nif (window.React === undefined && window.preact !== undefined) { var React = window.preact; }';
    const allComponents = [];
    for (const component of components) {
        // Read both ES6 Class File and existing ES5 file
        const inFile = path.join(rootDir, 'es6', component + '.js');
        const outFile = path.join(rootDir, 'es5', component + '.js');
        let codeES6 = await readFile(inFile, 'utf8');
        let codeES5_Old = null;
        if (fs.existsSync(outFile)) {
            codeES5_Old = await readFile(outFile, 'utf8');
        }

        // Convert ES6 code to ES5 using Babel
        // Removing `import React` prevents Babel Standalone from requiring a
        // custom `require` function and allows it to use the global `React` class
        // which is already required by any custom `require` function.
        codeES6 = codeES6.replace("import React from 'react';", '');
        codeES6 = codeES6.replace('@license', ''); // Required for all comments to be deleted
        let codeES5_New = Babel.transform(codeES6, options).code;
        if (isWindows) {
            codeES5_New = codeES5_New.replace(/\n/g, '\r\n');
        }
        codeES5_New = codeES5_New.replace('Object.defineProperty(exports', defineExports + '\n\nObject.defineProperty(exports');

        // Compare - only update file if different
        if (codeES5_Old !== codeES5_New) {
            console.log('Updating file: ' + outFile);
            await writeFile(outFile, codeES5_New);
            filesUpdated++;
        }

        // Add code to array for the main [DataFormsJS.js] file
        codeES6 = codeES6.replace('export default class', 'export class');
        allComponents.push(codeES6);
        filesChecked++;
    }

    // Create a [DataFormsJS] class as a Namespace for the main [DataFormsJS.js] file.
    // The resulting file allows either <JsonData> or <DataFormsJS.JsonData> to be used.
    allComponents.push(`
        export class DataFormsJS {
            ${components.map(name => {
                return 'static get ' + name + '() { return ' + name + '; }';
            }).join('\n')}
        };
    `);
    let js = Babel.transform(allComponents.join('\n'), options).code;
    js = copyright + js;
    js = js.replace('Object.defineProperty(exports', defineExports + '\n\nObject.defineProperty(exports');

    // Compare with existing [DataFormsJS.js] File.
    // When comparing convert CRLF -> LF to avoid issues.
    const outFile = path.join(rootDir, 'es5', 'DataFormsJS.js');
    let codeOld = null;
    if (fs.existsSync(outFile)) {
        codeOld = await readFile(outFile, 'utf8');
    }
    if (codeOld.replace(/\r\n/g, '\n') !== js.replace(/\r\n/g, '\n')) {
        console.log('Updating file: ' + outFile);
        await writeFile(outFile, js);
        filesUpdated++;
    }
    filesChecked++;

    // Return file counts
    return { filesChecked, filesUpdated };
}

/**
 * Return an array of files for [uglify-js] and another array
 * of files for [uglify-es].
 *
 * @returns {object}
 */
async function getAllFiles() {
    const rootDir = __dirname + '/../js/';
    const jsDir = ['controls', 'extensions', 'pages', 'plugins', 'react', 'scripts'];
    const webDir = ['web-components'];
    const webJsFiles = ['jsPlugins.js', 'old-browser-warning.js', 'safari-nomodule.js'];
    const reactES5 = ['react/es5'];
    const reactES6 = ['react/es6'];

    // Get all JavaScript files for [uglify-js]
    let jsFiles = await getJsFiles(rootDir);
    jsDir.forEach(async (dir) => {
        const files = await getJsFiles(rootDir + dir);
        jsFiles = jsFiles.concat(files);
    });
    const reactFilesES5 = await getJsFiles(rootDir + reactES5);
    jsFiles = jsFiles.concat(reactFilesES5);

    // Get all JavaScript React and Web Component files for [uglify-es]
    let webFiles = await getJsFiles(rootDir + webDir);
    const reactFilesES6 = await getJsFiles(rootDir + reactES6);
    webFiles = webFiles.concat(reactFilesES6);

    // Move specific JavaScript files from Web Component list to JS list
    webJsFiles.forEach(file => {
        const index = webFiles.findIndex(f => f.includes(file));
        jsFiles.push(webFiles.splice(index, 1)[0]);
    });

    return { jsFiles, webFiles };
}

/**
 * Return an array of JavaScript files from a Directory
 *
 * @param {string} dir
 * @returns {array}
 */
async function getJsFiles(dir) {
    return await readdir(dir)
    .then(files => { return files.filter(f => f.endsWith('.js') && !f.endsWith('.min.js')); })
    .then(files => { return files.map(f => path.join(dir, f)); })
    .catch(err => { throw err; });
}
