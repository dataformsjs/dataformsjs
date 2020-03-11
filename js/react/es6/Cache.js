/**
 * This is a standard JavaScript class to provide an easy to use API for
 * caching and re-using.
 *
 * It's intended purpose is for use with state in React Components for
 * SPA's to cache the page state between page changes, however since it's
 * generic it can be used for general caching as well.
 *
 * Example Usage:
 *     class MyComponent extends React.Component {
 *         constructor(props) {
 *             super(props);
 *             this.state = Cache.get('name', defaultValues);
 *         }
 *
 *         componentDidUpdate() {
 *             Cache.set('name', this.state);
 *         }
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env es6 */

const cachedValues = {};

export default class Cache {
    /**
     * Return an object that was cached with the [set()]
     * function or return the default values.
     *
     * @param {string} name
     * @param {object} defaultValues
     */
    static get(name, defaultValues) {
        if (cachedValues[name] === undefined) {
            return defaultValues;
        }
        return cachedValues[name];
    }

    /**
     * Save an object to the cache
     *
     * @param {string} name
     * @param {object} data
     */
    static set(name, data) {
        cachedValues[name] = data;
    }
}