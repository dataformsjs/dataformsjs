/* global module */
module.exports = {
    // Running:
    //     Windows:
    //        "node_modules/.bin/eslint.cmd" js
    //
    //     If testing many changes output to a file using:
    //        "node_modules/.bin/eslint.cmd" js > eslint_results.txt
    //
    // The root folder/directory under [js] and most directories under it is
    // intended for browser using ECMA Version 5. Key files such as
    // [DataFormsJS.js] and [jsxLoader.js] will download needed polyfills
    // such as `Promise` and `fetch` so common settings such as
    // `env.es2020: true` are excluded.
    env: {
        browser: true,
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 5,
        sourceType: 'script',
    },
    // All [*.min.js] files and files under [js/react/es5] are built automaticaly
    // from [js/react/es6] files of the same name using [scripts/build.js].
    ignorePatterns: ['**/*.min.js', '**/js/react/es5/*'],
    // In general DataFormsJS uses intentation of 4 however it would trigger many
    // errors with eslint using default settings because `case` statements are 
    // currently indented under `switch` and generally promise `then()` functions
    // are at the same level on most DataFormsJS code.
    rules: {
        'no-prototype-builtins': 0,
        // 'indent': ['error', 4],
        // 'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix']
    },
    overrides: [
        // React and Web Components use modern module syntax
        {
            files: ['**/js/web-components/*', '**/js/react/es6/*'],
            excludedFiles: ['jsPlugins.js', 'polyfill.js'],
            parserOptions: {
                ecmaVersion: 11,
                sourceType: 'module',
            },
        },
        {
            files: ['*.jsx'],
            parserOptions: {
                ecmaVersion: 11,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            },
            plugins: [
                'react'
            ],
        },
    ]
};
