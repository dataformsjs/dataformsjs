/* global module */
module.exports = {
    // Running:
    //     https://eslint.org/docs/user-guide/command-line-interface
    //     npx eslint js
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
            files: [
                '**/js/web-components/*',
                '**/js/react/es6/*',
                '**/scripts/build.js',
                '**/js/pages/classes/*',
                '**/js/templates/page-class.js',
                '**/js/templates/page-from-JsonData-class.js',
                '**/js/templates/plugin-class.js',
            ],
            excludedFiles: ['jsPlugins.js', 'polyfill.js'],
            parserOptions: {
                ecmaVersion: 11,
                sourceType: 'module',
            },
        },
    ]
};
