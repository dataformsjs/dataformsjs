/**
 * DataFormsJS Build Script
 *
 * IMPORTANT - Everytime this script runs it installs 2 global NPM commands.
 *     npm install uglify-js -g
 *     npm install uglify-es -g
 *     https://www.npmjs.com/package/uglify-js
 *     https://www.npmjs.com/package/uglify-es
 * 
 * If running this file from Mac or Linux use sudo:
 *     sudo node ./dataformsjs/scripts/build.js
 *
 * Both commands share the use global shell command [uglifyjs] so if you
 * run this file you may need to switch back to the more widely used [uglify-js]
 * after this file runs.
 *
 * This script also requires React Components to be compiled from Babel to a
 * JavaScript file prior to running this script. This script is being used for
 * the initial rollout of DataFormsJS and will likely be modified in the future
 * to use local NPM Packages and better handle React Components.
 *
 * For React Component changes prior to running this script run
 * [DataFormsJS\examples\server.js] then open:
 *     http://127.0.0.1:8080/jsx-build
 *     - Then download the zip file [DataFormsJS.React.zip] and replace contents in [js/react/es5]
 *
 * The reason that local node dependencies are not being used is because the
 * project is copied from computer to computer during initial development
 * so no local node packages are being used to keep the project size small.
 * The build process will likely change in the near future now that DataFormsJS
 * has been published.
 *
 * This script has no error handling so if there is a build error it will
 * stop the script which is intended.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const execSync = require('child_process').execSync;
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Child Process Timeout
const tenSeconds = 10 * 1000;
const execOptions = { timeout: tenSeconds };

/**
 * Main function
 */
(async () => {
    const {jsFiles, webFiles} = await getAllFiles();

    // Process all JavaScript files using [uglify-js]
    console.log(`JavaScript Files (${jsFiles.length}):`);
    installGlobal('uglify-js');
    jsFiles.forEach(file => {
        console.log(file);
        const outFile = file.replace('.js', '.min.js');
        const cmd = `uglifyjs "${file}" -o "${outFile}" -c -m`;
        execSync(cmd, execOptions);
    });

    // Process all Web Component files using [uglify-es]
    console.log(`\nWeb Component Files (${webFiles.length}):`);
    installGlobal('uglify-es');
    webFiles.forEach(file => {
        console.log(file);
        const outFile = file.replace('.js', '.min.js');
        const cmd = `uglifyjs "${file}" -o "${outFile}" -c -m`;
        execSync(cmd, execOptions);
    });

    // Additional file updates
    await updateCopyright(jsFiles, webFiles);
    await updateImport(webFiles);
})();

/**
 * Install a Global NPM Command. [WARN] statements are expected from [npm]
 * when this runs.
 *
 * @param {string} name
 */
function installGlobal(name) {
    const cmd = `npm install ${name} -g`;
    const stdout = execSync(cmd, execOptions).toString('utf8');
    if (stdout) {
        console.log('stdout:', stdout);
    }
}

/**
 * Return an array of files for [uglify-js] and another array
 * of files for [uglify-es].
 *
 * @returns {object}
 */
async function getAllFiles() {
    const rootDir = __dirname + '/../js/';
    const jsDir = ['controls', 'extensions', 'pages', 'plugins', 'react'];
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

/**
 * Add small copyright header to core files. Only a few files are updated.
 * Bascially one file for the Framework, one file for React, and two files
 * for Web Components.
 *
 * @param {array} jsFiles
 * @param {array} webFiles
 */
async function updateCopyright(jsFiles, webFiles) {
    const copyright = '// @link https://www.dataformsjs.com\n// @author Conrad Sollitt (http://www.conradsollitt.com)\n// @license MIT\n';
    let updateFiles = jsFiles.filter(f => {
        return f.endsWith('DataFormsJS.js') || f.endsWith('DataFormsJS.React.js');
    });
    updateFiles = updateFiles.concat(webFiles.filter(f => {
        return f.endsWith('json-data.js') || f.endsWith('url-hash-router.js');
    }));
    updateFiles = updateFiles.map(f => f.replace('.js', '.min.js'));

    for (const file of updateFiles) {
        let contents = await readFile(file, 'utf8');
        contents = copyright + contents;
        await writeFile(file, contents);
    }
}

/**
 * Update import statements for Web Components use minified version:
 *     import { ... } from './utils.js';
 * becomes:
 *     import { ... } from './utils-min.js';
 *
 * @param {array} webFiles
 */
async function updateImport(webFiles) {
    for (const file of webFiles) {
        const outFile = file.replace('.js', '.min.js');
        let contents = await readFile(outFile, 'utf8');
        contents = contents.replace('./utils.js', './utils.min.js').replace('./utils-sort.js', './utils-sort.min.js');
        await writeFile(outFile, contents);
    }
}