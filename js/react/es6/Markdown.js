/**
 * DataFormsJS React Component <Markdown>
 *
 * This Component can be used to download and render Markdown from a web service or URL
 * using one of 3 widely used Markdown Libraries [marked, markdown-it, and remarkable].
 *
 * Additionally if [highlight.js] is included on the page (or passed as a prop) it will
 * be used for Syntax Highlighting and if [DOMPurify] is included the rendered HTML will
 * be sanitized for security.
 *
 * Many existing React Markdown Libraries and code examples exist, however they generally
 * have the Markdown content passed in a prop. This Component was created so that Markdown
 * can be either passed as a prop or download dynamically by the Component itself with
 * similar behavior to the DataFormsJS <markdown-content> Web Component and Framework Control.
 * Additionally this Component can be loaded from CDN without requiring a build process.
 *
 * This Component is relatively small in size and designed in a manner so that it is easy
 * to copy and modify the code if needed for a project that has similar but different needs.
 *
 * Example Usage:
 *
 *   # Download and show Markdown from a URL.
 *   # This assumes the markdown rendering library to use is already included on the page.
 *   const url = "https://raw.githubusercontent.com/dataformsjs/dataformsjs/master/README.md"
 *   <Markdown url={url} />
 *
 *   # Additional supported props and examples:
 *   className="markdown"  - Add a [className] to the root <div> that markdown gets rendered under
 *   showSource={true}   - If including this only markdown source in a <pre> will be displayed
 *   isLoading=(<IsLoading />)   - Loading Component that appears during Markdown fetch
 *   errorStyle={{ backgroundColor:'red', color:'#fff' }}
 *   fetchOptions={{
 *       mode: 'cors',
 *       credentials: 'same-origin',
 *       headers: { 'Content-Type': 'text/markdown' }
 *   }}
 *   linkTarget="_blank"
 *   linkRel="noopener"
 *   linkRootUrl="https..."
 *   useRootUrl={false}
 *
 *   # When using from [create-react-app] or [webpack] the markdown library and optional
 *   # [highlight.js, dompurify] needs to be passed to the Component:
 *   npm install marked
 *   npm install highlight.js
 *   npm install dompurify
 *   import marked from 'marked';
 *   import hljs from 'highlight.js';
 *   import 'highlight.js/styles/atom-one-dark.css';
 *   import DOMPurify from 'dompurify';
 *   <Markdown url="https..." marked={marked} hljs={hljs} DOMPurify={DOMPurify} />
 *
 *   # For [markdown-it] or [remarkable] use one of the following if using webpack.
 *   # [markdown-it-emoji] is optional when using [markdown-it] and [linkify] is
 *   # optional when using [Remarkable].
 *   import markdownit from 'markdown-it';
 *   import markdownitEmoji from 'markdown-it-emoji'
 *   import { Remarkable } from 'remarkable'
 *   import { linkify } from 'remarkable/linkify';
 *   <Markdown url="..." markdownit={markdownit} markdownitEmoji={markdownitEmoji} />
 *   <Markdown url="..." Remarkable={Remarkable} linkify={linkify} />
 *
 * Popular and widely used React Markdown Component (requires node or webpack):
 * @link https://github.com/remarkjs/react-markdown
 *
 * Example:
 * @link https://github.com/dataformsjs/dataformsjs/blob/master/examples/markdown-react.htm
 * @link https://github.com/dataformsjs/dataformsjs/blob/master/examples/markdown-react.jsx
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
/* For online eslint - Source Type = 'module' must be manually selected. */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */
/* eslint no-prototype-builtins: "off" */
/* jshint esversion:6 */

import React from 'react';

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

export default class Markdown extends React.Component {
    constructor(props) {
        super(props);
        const hasContent = (props !== undefined && typeof props.content === 'string');
        this.state = {
            content: (hasContent ? props.content : null),
            html: (hasContent ? this.generateHtml(props.content) : null),
            errorMessage: null,
            isLoaded: false,
        };
        this._isMounted = false;
        this._returnCode = false;
        this.fetchContent = this.fetchContent.bind(this);
        this.highlight = this.highlight.bind(this);
        this.updateContent = this.updateContent.bind(this);
        this.generateHtml = this.generateHtml.bind(this);
        this.markdownEl = React.createRef();
    }

    componentDidMount() {
        this._isMounted = true;
        if (this.props.url && this.state.content === null) {
            this.fetchContent();
        } else {
            this.updateContent();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate(prevProps) {
        if (this.props.url && prevProps.url !== this.props.url) {
            this.fetchContent();
        } else {
            this.updateContent();
        }
    }

    fetchContent() {
        // Option to load markdown from cache rather than fetching each time.
        // Good for use with SPA's where content does not change often and the user
        // might view same page serveral times.
        if (this.props.loadOnlyOnce) {
            const cache = getMarkdownFromCache(this.props.url);
            if (cache) {
                if (this._isMounted) {
                    this.setState({
                        content: cache.content,
                        html: this.generateHtml(cache.content),
                        errorMessage: cache.errorMessage,
                        isLoaded: true,
                    });
                }
                return;
            }
        }

        // Download Content
        fetch(this.props.url, this.props.fetchOptions)
        .then(res => {
            const status = res.status;
            if ((status >= 200 && status < 300) || status === 304) {
                return Promise.resolve(res);
            } else {
                const error = `Error loading markdown content from [${this.props.url}]. Server Response Code: ${status}, Response Text: ${res.statusText}`;
                return Promise.reject(error);
            }
        })
        .then(res => { return res.text(); })
        .then(text => {
            if (this.props.loadOnlyOnce) {
                saveMarkdownToCache(this.props.url, text, null);
            }
            if (this._isMounted) {
                this.setState({
                    content: text,
                    html: this.generateHtml(text),
                    errorMessage: null,
                    isLoaded: true,
                });
            }
        })
        .catch(error => {
            if (this.props.loadOnlyOnce) {
                saveMarkdownToCache(this.props.url, null, error);
            }
            if (this._isMounted) {
                this.setState({ errorMessage: error });
            }
        });
    }

    /**
     * Optional Highlight Code using [highlight.js].
     * When using [marked] the code must be returned if it is not
     * highlighted and when using [markdown-it] or [Remarkable]
     * empty text must be returned. To handle `returnCode` is set
     * prior to this function being called.
     */
    highlight(code, lang) {
        const hljs = (this.props.hljs || window.hljs);
        if (hljs === undefined) {
            return (this._returnCode ? code : '');
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

        return (this._returnCode ? code : '');
    }

    /**
     * Make optional updates to the DOM after the Component has mounted.
     */
    updateContent() {
        if (!this._isMounted || !this.markdownEl.current) {
            return;
        }

        // Update code blocks so they highlight with the
        // correct theme if using [highlight.js].
        const hljs = (this.props.hljs || window.hljs);
        if (hljs !== undefined) {
            const codeBlocks = this.markdownEl.current.querySelectorAll('code[class*="language-"]');
            for (let n = 0, m = codeBlocks.length; n < m; n++) {
                codeBlocks[n].classList.add('hljs');
            }
        }

        // Update all [a.target] and [a.rel] attributes if specified
        const linkTarget = this.props.linkTarget;
        const linkRel = this.props.linkRel;
        if (linkTarget || linkRel) {
            const links = this.markdownEl.current.querySelectorAll('a');
            Array.prototype.forEach.call(links, function(link) {
                link.target = (linkTarget ? linkTarget : link.target);
                link.rel = (linkRel ? linkRel : link.rel);
            });
        }

        // Handle relative links and images by default
        if (this.props.useRootUrl !== false) {
            // Get the root URL of the document if using URL
            const url = this.props.url;
            let rootUrl;
            if (url) {
                const parts = url.split('/');
                rootUrl = url.substr(0, url.length - parts[parts.length - 1].length);
            }

            // Update all local links if specified.
            // For example Github readme docs would often point to links in the local repository.
            // This feature can be used to specify the root URL so that all links work correctly,
            // and link to the main source display page and not raw content.
            let linkRootUrl = this.props.linkRootUrl;
            linkRootUrl = (linkRootUrl ? linkRootUrl : rootUrl);
            if (linkRootUrl) {
                const links = this.markdownEl.current.querySelectorAll('a:not([href^="http:"]):not([href^="https:"])');
                Array.prototype.forEach.call(links, function(link) {
                    const href = link.getAttribute('href');
                    link.setAttribute('data-original-href', href);
                    link.setAttribute('href', linkRootUrl + href);
                });
            }

            // Update Images that use a relative URL based on the document
            const images = this.markdownEl.current.querySelectorAll('img:not([src^="http:"]):not([src^="https:"])');
            Array.prototype.forEach.call(images, function(img) {
                const src = img.getAttribute('src');
                img.setAttribute('data-original-src', src);
                img.setAttribute('src', rootUrl + src);
            });
        }
    }

    generateHtml(content) {
        // Render Markdown to HTML using one of 3 libraries.
        // This is called outside of `render()` for improved performance
        // on apps that trigger many calls to `render()`.
        let html;
        let md;
        this._returnCode = false;
        if (this.props.marked || window.marked) {
            this._returnCode = true;
            const marked = this.props.marked || window.marked;
            marked.setOptions({
                highlight: this.highlight
            });
            if (marked.marked && marked.marked.parse) {
                html = marked.marked.parse(content); // 4.#
            } else {
                html = marked(content); // 3.#
            }
        } else if (this.props.markdownit || window.markdownit) {
            const markdownit = this.props.markdownit || window.markdownit;
            md = markdownit({
                html: true,
                linkify: true,
                typographer: true,
                highlight: this.highlight
            });
            if (this.props.markdownitEmoji || window.markdownitEmoji) {
                const markdownitEmoji = this.props.markdownitEmoji || window.markdownitEmoji;
                md.use(markdownitEmoji);
            }
            html = md.render(content);
        } else if (this.props.Remarkable || window.remarkable) {
            const Remarkable = this.props.Remarkable || window.remarkable.Remarkable;
            md = new Remarkable({
                html: true,
                typographer: true,
                highlight: this.highlight
            });
            const linkify = (this.props.linkify || window.remarkable.linkify);
            if (linkify) {
                md.use(linkify);
            }
            html = (md).render(content);
        } else {
            throw new Error('Error - Unable to show Markdown content because a Markdown JavaScript library was not found on the page.');
        }

        // Clean/Sanitize the HTML for Security if DOMPurify is loaded
        const DOMPurify = (this.props.DOMPurify || window.DOMPurify);
        if (DOMPurify !== undefined) {
            html = DOMPurify.sanitize(html);
        }

        return html;
    }

    render() {
        // Error message (for example a failed fetch)
        if (this.state.errorMessage) {
            const className = (this.props.className ? this.props.className : '') + ' error';
            const errorStyle = (typeof this.props.errorStyle === 'object' ? this.props.errorStyle : {
                backgroundColor: 'red',
                color: '#fff',
                fontWeight: 'bold',
                border: '1px solid darkred',
                padding: '1em',
            });
            return React.createElement(
                'div',
                {
                    className: className,
                    ref: this.markdownEl,
                    style: errorStyle,
                },
                this.state.errorMessage
            );
        }

        // If still loading content from URL return child node from
        // [isLoading] prop if defined otherwise return null.
        if (this.props.url && !this.state.isLoaded) {
            if (this.props.isLoading) {
                return this.props.isLoading;
            }
            return null;
        }

        // Nothing to show
        if (this.state.content === null) {
            return null;
        }

        // Shows content as text rather than rendering source
        if (this.props.showSource) {
            return React.createElement(
                'div',
                {
                    className: this.props.className,
                    ref: this.markdownEl,
                },
                React.createElement('pre', null, this.state.content)
            );
        }

        // Return <div> with the rendered HTML
        return React.createElement('div', {
            className: this.props.className,
            dangerouslySetInnerHTML: { __html: this.state.html },
            ref: this.markdownEl,
        });
    }
}
