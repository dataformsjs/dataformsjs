/**
 * DataFormsJS <markdown-content> Web Component
 *
 * This Web Component can be used to render Markdown to HTML using one of 3 widely used
 * Markdown Libraries [marked, markdown-it, and remarkable].
 *
 * This Web Component does not include a Markdown Library rather one needs to be included
 * on the page before this Component is used. Additionally if [highlight.js] is included
 * on the page it will be used for Syntax Highlighting and if [DOMPurify] is included
 * the rendered HTML will be sanitized for security.
 *
 * Options are preset, however this Web Component is small in size using simple logic
 * so and designed to be easy to modify if you have a site with different markdown needs.
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
 *     *) Additional Attributes:
 *        link-target="_blank"
 *        link-rel="noopener"
 *        link-root-url="https..."
 *        load-only-once
 *        use-root-url="false"
 *        show-source
 *     *) When the attribute [show-source] is included the raw text is displayed in a <pre>
 *        element so when using this component can be used to show text or other files
 *        without having to include an additional markdown library.
 *
 * Example:
 * @link https://github.com/dataformsjs/dataformsjs/blob/master/examples/markdown-web.htm
 *
 * Libraries used by this Component:
 * @link https://github.com/markedjs/marked
 * @link https://github.com/markdown-it/markdown-it
 * @link https://github.com/markdown-it/markdown-it-emoji
 * @link https://github.com/jonschlinkert/remarkable
 * @link https://github.com/highlightjs/highlight.js
 * @link https://github.com/cure53/DOMPurify
 */

/* Validates with both [eslint] and [jshint] */
/* global hljs, marked, markdownit, markdownitEmoji, remarkable, DOMPurify  */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */
/* jshint esversion:8 */

import { showError } from './utils.js';

/**
 * Markdown Caching for when [load-only-once] is used.
 *
 * Content is cached in memory only while the user has the page open.
 * To prevent the cache from taking up to much memory in the event of
 * a bot clicking on every page, topic, etc in a site the cache will
 * be reset if it reaches the max size.
 */
const markdownCache = [];
const maxCacheSize = 100;

function saveMarkdownToCache(url, content, errorMessage) {
    if (markdownCache.length > maxCacheSize) {
        markdownCache.length = 0; // Clear array
    }
    for (let n = 0, m = markdownCache.length; n < m; n++) {
        if (url === markdownCache[n].url) {
            return; // Already saved
        }
    }
    markdownCache.push({ url, content, errorMessage });
}

function getMarkdownFromCache(url) {
    for (let n = 0, m = markdownCache.length; n < m; n++) {
        if (url === markdownCache[n].url) {
            return markdownCache[n];
        }
    }
    return null;
}

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
        this.errorMessage = null;
        this.isFetching = false;
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

    get loadOnlyOnce() {
        return this.hasAttribute('load-only-once');
    }

    set loadOnlyOnce(newValue) {
        if (newValue) {
            this.setAttribute('load-only-once', '');
        } else {
            this.removeAttribute('load-only-once');
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

        // Option to load markdown from cache rather than fetching each time.
        // Good for use with SPA's where content does not change often and the user
        // might view same page several times.
        if (this.loadOnlyOnce) {
            const cache = getMarkdownFromCache(url);
            if (cache) {
                this.content = cache.content;
                this.errorMessage = cache.errorMessage;
                this.render();
                return;
            }
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
        this.isFetching = true;
        fetch(url)
        .then(res => {
            const status = res.status;
            if ((status >= 200 && status < 300) || status === 304) {
                return Promise.resolve(res);
            } else {
                const error = `Error loading markdown content from [${url}]. Server Response Code: ${status}, Response Text: ${res.statusText}`;
                return Promise.reject(error);
            }
        })
        .then(res => { return res.text(); })
        .then(text => {
            this.content = text;
            this.errorMessage = null;
            this.isFetching = false;
            this.render();
        })
        .catch(error => {
            this.errorMessage = error;
            this.isFetching = false;
            this.render();
        })
        .finally(() => {
            if (this.loadOnlyOnce) {
                saveMarkdownToCache(url, this.content, this.errorMessage);
            }
        });
    }

    dispatchRendered() {
        this.dispatchEvent(new Event('app:markdownRendered', { bubbles: true }));
    }

    render() {
        // Still loading, this can happen while `fetch` is running
        // and [show-source] is being set by the DOM and [loading-selector]
        // is set to show an exiting loading screen.
        if (this.isFetching) {
            return;
        }

        // Error message (for example a failed fetch)
        if (this.errorMessage) {
            showError(this, this.errorMessage);
            this.dispatchRendered();
            return;
        }

        // Nothing to show
        if (this.content === null) {
            this.innerHTML = '';
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
            if (marked.marked && marked.marked.parse) {
                html = marked.marked.parse(this.content); // 4.#
            } else {
                html = marked(this.content); // 3.#
            }
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
            }).use(remarkable.linkify);
            html = (md).render(this.content);
        } else {
            showError(this, 'Error - Unable to show Markdown content because a Markdown JavaScript library was not found on the page.');
            this.dispatchRendered();
            return;
        }

        // Clean/Sanitize the HTML for Security if DOMPurify is loaded
        if (window.DOMPurify !== undefined) {
            html = DOMPurify.sanitize(html);
        }

        // Set Content
        this.innerHTML = html;

        // Update code blocks so they highlight with the
        // correct theme if using [highlight.js].
        if (window.hljs !== undefined) {
            const codeBlocks = this.querySelectorAll('code[class*="language-"]');
            for (let code of codeBlocks) {
                code.classList.add('hljs');
            }
        }

        // Update all [a.target] and [a.rel] attributes if specified.
        // Example: [link-target="_blank"] and [link-rel="noopener"]
        const linkTarget = this.getAttribute('link-target');
        const linkRel = this.getAttribute('link-rel');
        if (linkTarget || linkRel) {
            const links = this.querySelectorAll('a');
            for (const link of links) {
                link.target = (linkTarget ? linkTarget : link.target);
                link.rel = (linkRel ? linkRel : link.rel);
            }
        }

        // Handle relative links and images by default
        const useRootUrl = this.getAttribute('use-root-url');
        if (useRootUrl !== 'false') {
            // Get the root URL of the document if using URL
            const url = this.url;
            let rootUrl;
            if (url) {
                const parts = url.split('/');
                rootUrl = url.substr(0, url.length - parts[parts.length - 1].length);
            }

            // Update all local links if [link-root-url] is specified or if [url] is used.
            // For example Github readme docs would often point to links in the local repository.
            // This feature can be used to specify the root URL so that all links work correctly,
            // and link to the main source display page and not raw content.
            let linkRootUrl = this.getAttribute('link-root-url');
            linkRootUrl = (linkRootUrl ? linkRootUrl : rootUrl);
            if (linkRootUrl) {
                const links = this.querySelectorAll('a:not([href^="http:"]):not([href^="https:"])');
                for (const link of links) {
                    const href = link.getAttribute('href');
                    link.setAttribute('data-original-href', href);
                    link.setAttribute('href', linkRootUrl + href);
                }
            }

            // Update Images that use a relative URL based on the document
            const images = this.querySelectorAll('img:not([src^="http:"]):not([src^="https:"])');
            for (const img of images) {
                const src = img.getAttribute('src');
                img.setAttribute('data-original-src', src);
                img.setAttribute('src', rootUrl + src);
            }
        }

        // Run event to let app know content has been rendered
        this.dispatchRendered();
    }
}

/**
 * Add <markdown-content> element to the page
 */
window.customElements.define('markdown-content', MarkdownContent);
