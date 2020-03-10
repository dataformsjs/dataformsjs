/**
 * This is a standard JavaScript class to provide an easy to use API for
 * caching and re-using state.
 *
 * Example Usage:
 *     class MyComponent extends React.Component {
 *         constructor(props) {
 *             super(props);
 *             this.state = StateCache.get('name', {
 *                 defaultString: 'test',
 *                 defaultInt: 123,
 *             });
 *         }
 *
 *         componentDidUpdate() {
 *             StateCache.set('name', this.state);
 *         }
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */

const cachedState = {};

export default class StateCache {
    static get(name, defaultValues) {
        if (cachedState[name] === undefined) {
            cachedState[name] = defaultValues;
        }
        return cachedState[name];
    }

    static set(name, data) {
        cachedState[name] = data;
    }
}