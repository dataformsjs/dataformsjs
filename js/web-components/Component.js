/**
 * Generic base `Component` class that extends `HTMLElement`
 *
 * This class can be used to speed development of custom Web Components
 * by reducing the amount of code needed to create components.
 *
 * Features include:
 *   - Core Web Component functions and concepts are automatically handled:
 *     `constructor()` using Shadow DOM for CSS, `connectedCallback()`,
 *     `observedAttributes()` and `attributeChangedCallback()`
 *   - Automatically translates `props` to both HTML attributes and DOM properties.
 *   - Properties defined from `props` automatically re-render the HTML
 *     when a property or HTML attribute changes.
 *   - Safely escape content by using `html` Tagged Template Literal function.
 *   - Very small in size
 *
 * When to use:
 *   - If you are building an app that uses Web Components this class can
 *     be used to speed up development because it reduces the amount of code
 *     needed and automatically provides and API based on `props`.
 *   - If you want to keep the size of JavaScript small for your app or webpage
 *     the DataFormsJS Web Components (including this class) are very small in size.
 *
 * When not to use:
 *   - If you need to support legacy browsers such as IE
 *   - Content is re-rendered each time so if you have components that has
 *     a lot of HTML with many changes then it may make sense to build
 *     the component from scratch using `extends HTMLElement`.
 *   - By default this class uses only one <slot> element so if you create
 *     a Web Component that needs multiple <slot> elements then you may
 *     want to copy and modify this element or build one from scratch.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/Web_Components
 * @link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */

/* Validates with both [jshint] and [eslint] */
/* jshint esversion:8 */
/* eslint-env browser, es6 */
/* eslint no-prototype-builtins: "off" */

export { escapeHtml, render as html } from './utils.js';

export class Component extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        const css = (this.constructor.css === undefined ? '' : this.constructor.css);
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host { display: block; }
                :host([hidden]) { display: none; }
                ${css}
            </style>
            <slot></slot>
        `;
        shadowRoot.appendChild(template.content.cloneNode(true));
        this.state = {};
        this._wasLoaded = false;
    }

    /**
     * When the element is displayed the first time (added to DOM) properties
     * defined in `static get props()` are copied to an internal state object
     * and add defined getter/setter properties for API usage.
     */
    connectedCallback() {
        if (!this._wasLoaded) {
            const props = this.constructor.props;
            if (typeof props === 'object') {
                for (const prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        // Add props with default value to the state object
                        if (this.state[prop] === undefined) {
                            this.state[prop] = props[prop];
                        }
                        // Define API properties that can be used by JavaScript
                        if (!this.hasOwnProperty(prop)) {
                            Object.defineProperty(this, prop, {
                                get: function() {
                                    return this.state[prop];
                                },
                                set: function(newValue) {
                                    var existingValue = this.state[prop];
                                    if (existingValue !== newValue) {
                                        this.state[prop] = newValue;
                                        this.update();
                                    }
                                }
                            });
                        }
                    }
                }
            }
            this._wasLoaded = true;
        }
        this.update();
    }

    static get observedAttributes() {
        if (this.props === undefined) {
            return [];
        }
        const attr = [];
        for (const prop of Object.keys(this.props)) {
            attr.push(prop);
            // If a [camelCased] property is defined then add HTML attribute
            // support for a dashed-version of the property.
            // Example: `fileName` = `file-name`
            // Regex from:
            //   https://stackoverflow.com/a/47836484/3422084
            const dashed = prop.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
            if (prop !== dashed) {
                attr.push(dashed);
            }
        }
        return attr;
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        function stringToValue(value) {
            switch (value) {
                case 'true':
                case '': // Empty values default to `true`
                    return true;
                case 'false':
                    return false;
                case 'null':
                    return null;
                default:
                    return value;
            }
        }

        const props = this.constructor.props;
        if (props && props[attrName] !== undefined && oldValue !== newValue) {
            this.state[attrName] = stringToValue(newValue);
            this.update();
        } else if (attrName.includes('-')) {
            // Convert from dashed-case to camelCased.
            // Example: `file-name` to `fileName`
            // Regex from:
            //   https://stackoverflow.com/a/6661012/3422084
            const camelCased = attrName.replace(/-([a-z])/g, m => m[1].toUpperCase());
            if (props && props[camelCased] !== undefined && oldValue !== newValue) {
                this.state[camelCased] = stringToValue(newValue);
                this.update();
            }
        }
    }

    /**
     * Render or re-render HTML content based on the `render()` function that is
     * defined from the subclass. This also runs the option `onRendered()` event.
     */
    update() {
        this.innerHTML = (this.render === undefined ? '' : this.render());
        if (this.onRendered) {
            this.onRendered();
        }
    }
}
