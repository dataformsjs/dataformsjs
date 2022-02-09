/**
 * DataFormsJS Build Script
 *
 * This script is used to generate (*.min.js) files and also to build
 * React Components in [js/react/es5/*.js] that are compatible for IE,
 * old Safari and other browsers.
 *
 * This script requires the following npm packages:
 *     https://www.npmjs.com/package/uglify-js
 *     https://www.npmjs.com/package/terser
 *     https://www.npmjs.com/package/@babel/standalone
 *
 * Reason for the different packages:
 *     [uglify-js] Used to minimized ES5 Files (DataFormsJS Framework)
 *     [terser] Used to minimized React, Web Components, and Framework Classes (ES6 code)
 *     [@babel] DataFormsJS React Components are published as both ES6
 *          and ES5 Version so Babel is used to compile from the ES6 Version
 *          to ES5 Version prior to minification.
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
 *
 * Additionally this script should be ran after the [package.json] version
 * update but prior to new NPM release because it includes the version
 * number in several of the minimized files.
 */

/* eslint-env node */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "global"] */
/* eslint no-regex-spaces: "off" */
/* eslint spaced-comment: ["error", "always"] */
/* jshint esversion: 8, node: true */

const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const Babel = require('@babel/standalone');
const UglifyJS = require('uglify-js');
const { minify } = require('terser');

// Handle CRLF for Windows when comparing files
const isWindows = (process.platform === 'win32');

// Include only specific components for the main React build file [DataFormsJS.js].
// This excludes components/classes such as [<ImageGallery>, <LeafletMap>, I18n]
// that would not be used with most apps.
const buildClasses = ['Cache', 'ErrorBoundary', 'Format', 'InputFilter', 'JsonData', 'LazyLoad', 'SortableTable', 'CssVars'];

/**
 * Main function
 */
(async () => {
    // Get Version Number from [package.json]
    const packageJson = __dirname + '/../package.json';
    const packageFile = await readFile(packageJson, 'utf8');
    const version = JSON.parse(packageFile).version;

    // Small copyright header to core files. Only a few files are updated.
    // Basically one file for the Framework, one file for React,
    // and two files for Web Components.
    let copyright = `// @link https://www.dataformsjs.com\n// @version ${version}\n// @author Conrad Sollitt (https://conradsollitt.com)\n// @license MIT\n`;
    if (isWindows) {
        copyright = copyright.replace(/\n/g, '\r\n');
    }

    // Build React [js/react/es5/*.js] files from [js/react/es6*.js]
    let { filesChecked, filesUpdated } = await buildReactFiles(copyright);

    // Get all JS Files
    const terser = {
        minify: async (code) => {
            return await minify(code, {
                format: {
                    comments: false,
                }
            });
        }
    };
    const {jsFiles, webFiles} = await getAllFiles();
    const fileGroups = [
        { files:jsFiles,  es6:false, minifier:UglifyJS, title:'JavaScript Files' },
        { files:webFiles, es6:true,  minifier:terser, title:'Web Components / React' },
    ];
    let fileErrors = 0;

    // Process all JavaScript files using [uglify-js]
    // Process all React and Web Component files using [terser]
    const reactCoreComponents = [];
    let reactCoreMinCode = null;
    let reactCoreOutFile = null;
    for (const { files, es6, minifier, title } of fileGroups) {
        console.log('-'.repeat(40));
        console.log(`${title} (${files.length}):`);
        for (const file of files) {
            // Read contents of the full uncompressed file
            let code = await readFile(file, 'utf8');
            filesChecked++;

            // Read existing [*.min.js] file if it exists
            const outFile = file.replace('.js', '.min.js');
            let minCode = null;
            if (fs.existsSync(outFile)) {
                minCode = await readFile(outFile, 'utf8');
            }

            // Skip minifying the main DataFormsJS React Namespace.
            // It's a special file and handled later in code.
            const isReactComponent = (es6 && (file.includes('react/es6/') || file.includes('react\\es6\\')));
            const componentName = (isReactComponent ? path.basename(file).replace('.js', '') : null);
            if (isReactComponent && componentName === 'DataFormsJS') {
                reactCoreMinCode = minCode;
                reactCoreOutFile = outFile;
                continue;
            }

            // Update [version] property in the main [DataFormsJS.js] and in [jsxLoader.js]
            const addVersion = (
                (file.endsWith('DataFormsJS.js') && !file.includes('react')) ||
                file.endsWith('jsxLoader.js')
            );
            if (addVersion) {
                const regex = /{ value: '(\d+.\d+.\d+)', enumerable: true }/;
                const match = code.match(regex);
                if (match === null) {
                    console.error(`[version] property was not found as expected in file: ${file}`);
                    process.exit(1);
                }
                const fileVersion = match[1];
                if (version !== fileVersion) {
                    console.log(`Updating [version] from [${fileVersion}] to [${version}] in file: ${file}`);
                    code = code.replace(regex, function(str, p1) {
                        return str.replace(p1, version);
                    });
                    await writeFile(file, code);
                }
            }

            // Minify in-memory
            let result;
            if (es6) {
                result = await minifier.minify(code);
            } else {
                result = minifier.minify(code);
            }
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
                addCopyright = (file.endsWith('DataFormsJS.js') || file.endsWith('jsxLoader.js'));
            } else {
                addCopyright = (file.endsWith('json-data.js') || file.endsWith('url-router.js'));
            }
            if (addCopyright) {
                newCode = copyright + newCode;
            }

            // Update import statements for Web Components use minified version:
            //    import { ... } from './utils.js';
            // becomes:
            //    import { ... } from './utils-min.js';
            if (es6) {
                newCode = newCode
                    .replace('./utils.js', './utils.min.js')
                    .replace('./utils-sort.js', './utils-sort.min.js')
                    .replace('./utils-format.js', './utils-format.min.js')
                    .replace('./WebComponentService.js', './WebComponentService.min.js');
            }

            // Additional updates for minified React Components so they can be used
            // in a browser as modules, example:
            //     <script type="module" src="js/react/es6/JsonData.min.js"></script>
            if (isReactComponent) {
                newCode = newCode
                    .replace('export default class', `window.${componentName} = class`)
                    .replace('import React from"react";', '')
                    .replace('import LazyLoad from"./LazyLoad.js";', '');

                if (buildClasses.includes(componentName)) {
                    reactCoreComponents.push(newCode + ';');
                }
            }

            // Update file if different
            if (newCode !== minCode) {
                console.log('Writing file: ' + outFile);
                await writeFile(outFile, newCode);
                filesUpdated++;
            }
        }

        // Handle the main React DataFormsJS Namespace
        if (es6) {
            let newCode = copyright + reactCoreComponents.join('\n');
            if (newCode !== reactCoreMinCode) {
                console.log('Writing file: ' + reactCoreOutFile);
                await writeFile(reactCoreOutFile, newCode);
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
    console.log('-'.repeat(40));
    console.log(`** Using version number ${version} in minimized source code.`);
    console.log('This MUST match the release published to NPM.');
    console.log('If code is accidentally published with wrong release number then publish a new patch release with correct version.');
})();

/**
 * Build React [js/react/es5/*.js] files from [js/react/es6*.js] using Babel
 * @param {string} copyright
 * @returns {int} Count of Updated Files
 */
async function buildReactFiles(copyright) {
    // Get all components and classes for React except [DataFormsJS.js].
    // [DataFormsJS.js] is excluded because it is only intended for local development
    // with [create-react-app] and similar projects. The resulting browser version
    // of the [DataFormsJS] namespace is re-created by combining components/classes
    // in this function.
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
    const reactES5_Start_1 = '(function () {\n"use strict";\n\nvar React = (window.React === undefined && window.preact !== undefined ? window.preact : window.React);';
    const reactES5_Start_2 = '(function () {\n"use strict";';
    const reactES5_End = '\n})();';
    const regexModule = /\nObject\.defineProperty\(exports, "__esModule", {\n  value: true\n}\);\n/;
    const regexExports = /\nexports\..+;/;
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
        codeES6 = codeES6.replace("import LazyLoad from './LazyLoad.js';", ''); // Used by CssVars
        codeES6 = codeES6.replace('@license', ''); // Required for all comments to be deleted
        let codeES5_New = Babel.transform(codeES6, options).code;
        if (!codeES5_New.startsWith('"use strict";') || codeES5_New.match(regexModule) === null || codeES5_New.match(regexExports) === null) {
            console.error(`Error unexpected output from Babel for file: ${outFile}`);
            process.exit(1);
        }
        codeES5_New = codeES5_New.replace(regexModule, '');
        codeES5_New = codeES5_New.replace(regexExports, '');
        codeES5_New = codeES5_New.replace(/\nexports\.default/, '\nwindow.' + component);
        let reactES5_Start = (codeES5_New.includes('React.') ? reactES5_Start_1 : reactES5_Start_2);
        codeES5_New = reactES5_Start + codeES5_New.substring('"use strict";'.length) + reactES5_End;
        if (isWindows) {
            codeES5_New = codeES5_New.replace(/\n/g, '\r\n');
        }

        // Compare - only update file if different
        if (codeES5_Old !== codeES5_New) {
            console.log('Updating file: ' + outFile);
            await writeFile(outFile, codeES5_New);
            filesUpdated++;
        }

        // Add code to array for the main [DataFormsJS.js] file.
        if (buildClasses.includes(component)) {
            codeES6 = codeES6.replace('export default class', 'export class');
            allComponents.push(codeES6);
        }
        filesChecked++;
    }

    // Create a [DataFormsJS] class as a Namespace for the main [DataFormsJS.js] file.
    // The resulting file allows either <JsonData> or <DataFormsJS.JsonData> to be used.
    allComponents.push(`
        export class DataFormsJS {
            ${components.filter(name => buildClasses.includes(name)).map(name => {
                return 'static get ' + name + '() { return ' + name + '; }';
            }).join('\n')}
        }
    `);
    let js = Babel.transform(allComponents.join('\n'), options).code;
    if (!js.startsWith('"use strict";') || js.match(regexModule) === null || js.match(regexExports) === null) {
        console.error('Error unexpected output from Babel for the main React DataFormsJS file');
        process.exit(1);
    }
    js = reactES5_Start_1 + js.substring('"use strict";'.length) + reactES5_End;
    js = js.replace(regexModule, '');
    js = js.replace(regexExports, '');
    js = js.replace(/\nexports\./g, '\nwindow.');
    if (isWindows) {
        js = js.replace(/\n/g, '\r\n');
    }
    js = copyright + js;

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
 * of files for [terser].
 *
 * @returns {object}
 */
async function getAllFiles() {
    const rootDir = __dirname + '/../js/';
    const jsDir = ['controls', 'extensions', 'pages', 'plugins', 'react', 'scripts'];
    const webDir = ['pages/classes', 'web-components'];
    const webJsFiles = ['jsPlugins.js', 'old-browser-warning.js', 'safari-nomodule.js'];
    const reactES5 = 'react/es5';
    const reactES6 = 'react/es6';

    // Get all JavaScript files for [uglify-js]
    let jsFiles = await getJsFiles(rootDir);
    for (const dir of jsDir) {
        const files = await getJsFiles(rootDir + dir);
        jsFiles = jsFiles.concat(files);
    }
    const reactFilesES5 = await getJsFiles(rootDir + reactES5);
    jsFiles = jsFiles.concat(reactFilesES5);

    // Get all JavaScript React and Web Component files for [terser]
    let webFiles = [];
    for (const dir of webDir) {
        const files = await getJsFiles(rootDir + dir);
        webFiles = webFiles.concat(files);
    }
    const reactFilesES6 = await getJsFiles(rootDir + reactES6);
    webFiles = webFiles.concat(reactFilesES6);

    // Move specific JavaScript files from Web Component list to JS list
    webJsFiles.forEach(file => {
        const index = webFiles.findIndex(f => f.endsWith(file));
        if (index === -1) {
            console.log('ERROR - ES5 File not found: ' + file);
            console.log(webFiles);
            process.exit(1);
        }
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
