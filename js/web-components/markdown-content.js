/**
 * DataFormsJS <markdown-content> Web Component
 *
 * This Web Component can be used to render Markdown to HTML using one of 3 widely used
 * Markdown Libraries (marked, markdown-it, and remarkable).
 *
 * This Web Component does not include a Markdown Library rather one needs to be included
 * on the page before this Component is used. Additionaly if [highlight.js] is included
 * on the page it will be used for Syntax Highlighting.
 *
 * Options are preset, however this Web Component is small in size and easy to modify
 * if you have a site with different markdown needs.
 *
 * Example usage:
 *     *) Load Markdown from URL
 *          <markdown-content url="{url}"></markdown-content>
 *     *) Show loading screen while source from URL is loading
 *          <markdown-content loading-selector="#loading-screen" url="{url}"></markdown-content>
 *     *) Inline Markdown
 *        <markdown-content><script type="text/markdown"># Hello World</script></markdown-content>
 *     *) Empty element with source set form JavaScript
 *        <markdown-content></markdown-content>
 *        document.querySelector('markdown-content').value = '# Hello World'
 *
 * @link https://github.com/markedjs/marked
 * @link https://github.com/markdown-it/markdown-it
 * @link https://github.com/markdown-it/markdown-it-emoji
 * @link https://github.com/jonschlinkert/remarkable
 * @link https://github.com/highlightjs/highlight.js
 */

/* Validates with both [eslint] and [jshint] */
/* global hljs, marked, markdownit, markdownitEmoji, remarkable  */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */
/* jshint esversion:8 */

/*
TODO - new file - features needed:
*) Polyfill
*) Create example page for each markdown lib
*) Need to also test error page
*) Test [data-bind] from <json-data>, this should work because the `value` property is defined
    Both this file and framework version need to handle it
*/

import { showError } from './utils.js';

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>
        :host { display: block; }
        :host([hidden]) { display: none; }
    </style>
    <slot></slot>
    <slot name="markdown"></slot>
`;

/**
 * Optional Highlight Code using [highlight.js].
 * When using [marked] the code must be returned if it is not
 * highlighted and when using [markdown-it] or [Remarkable]
 * empty text must be returned. To handle `returnCode` is set
 * prior to this function being called.
 */
let returnCode = false;
function highlight(code, lang) {
    if (window.hljs === undefined) {
        return (returnCode ? code : '');
    }

    if (lang && hljs.getLanguage(lang)) {
        try {
            return hljs.highlight(lang, code).value;
        } catch (err) {
            console.warn(err);
        }
    }

    try {
        return hljs.highlightAuto(code).value;
    } catch (err) {
        console.warn(err);
    }

    return (returnCode ? code : '');
}

/**
 * Define class for the <markdown-content> element
 */
class MarkdownContent extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        this.content = null;
    }

    connectedCallback() {
        const sourceEl = this.querySelector('script[type="text/markdown"]');
        if (sourceEl) {
            this.content = sourceEl.innerHTML;
        }
        this.render();
    }

    static get observedAttributes() {
        return ['url', 'show-source'];
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        switch (attrName) {
            case 'url':
                if (oldValue !== newValue) {
                    this.fetch();
                }
                break;
            case 'show-source':
                if (oldValue !== newValue) {
                    this.render();
                }
                break;
        }
    }

    clearContent() {
        this.content = null;
        this.render();
    }

    get url() {
        return this.getAttribute('url');
    }

    set url(newValue) {
        this.setAttribute('url', newValue);
    }

    get showSource() {
        return this.hasAttribute('show-source');
    }

    set showSource(newValue) {
        if (newValue) {
            this.setAttribute('show-source', '');
        } else {
            this.removeAttribute('show-source');
        }
    }

    get value() {
        return this.content;
    }

    set value(markdown) {
        this.content = markdown;
        this.render();
    }

    fetch() {
        const url = this.url;
        if (!url) {
            showError(this, 'Error - Unable to show Markdown content because [url] is not set.');
            this.dispatchRendered();
            return;
        }

        // Show loading screen
        const loadingSelector = this.getAttribute('loading-selector');
        if (loadingSelector) {
            const loading = document.querySelector(loadingSelector);
            if (loading) {
                this.innerHTML = '';
                this.appendChild(loading.content.cloneNode(true));
            } else {
                console.warn(`Could not find template from <${this.tagName.toLowerCase()} [loading-selector="${loadingSelector}"]>.`);
            }
        }

        // Fetch content
        fetch(url)
        .then(res => { return res.text(); })
        .then(text => {
            this.content = text;
            this.render();
        });
    }

    dispatchRendered() {
        this.dispatchEvent(new Event('app:markdownRendered', { bubbles: true }));
    }

    render() {
        // Nothing to show
        if (this.content === null) {
            this.innerHTML = '';
            this.dispatchRendered();
            return;
        }

        // Shows as text rather than rendering source
        if (this.showSource) {
            this.innerHTML = '<pre></pre>';
            this.querySelector('pre').textContent = this.content;
            this.dispatchRendered();
            return;
        }

        // Render Markdown to HTML using one of 3 libraries
        let html;
        let md;
        returnCode = false;
        if (window.marked) {
            returnCode = true;
            marked.setOptions({
                highlight: highlight
            });
            html = marked(this.content);
        } else if (window.markdownit) {
            md = markdownit({
                html: true,
                linkify: true,
                typographer: true,
                highlight: highlight
            });
            if (window.markdownitEmoji) {
                md.use(markdownitEmoji);
            }
            html = md.render(this.content);
        } else if (window.remarkable) {
            md = new remarkable.Remarkable({
                html: true,
                typographer: true,
                highlight: highlight
            });
            html = (md).render(this.content);
        } else {
            showError(this, 'Error - Unable to show Markdown content because a Markdown JavaScript library was not found on the page.');
            this.dispatchRendered();
            return;
        }

        // Set Content
        this.innerHTML = html;
        this.dispatchRendered();
    }
}

/**
 * Add <markdown-content> element to the page
 */
window.customElements.define('markdown-content', MarkdownContent);
