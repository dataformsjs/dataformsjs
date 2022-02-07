/**
 * This class is used for a DataFormsJS Plugins.
 *
 * DataFormsJS plugins are used to commonly define features that can be shared
 * between different pages. A good usage of plugins is to create them to handle
 * custom attributes so that shared features can be quickly added to a page
 * through HTML markup. In this demo elements on the page with [data-time="{lang}"]
 * will the display in the current time.
 *
 * Compared to components (React, Vue, Web Components, etc) DataFormsJS plugins
 * are created once and called over an over. They can be defined as either a
 * simple function, and object, or as a class.
 */

class Time {
    constructor() {
        this.timers = new Map();
    }

    showTime(el) {
        let lang = el.getAttribute('data-time')
        lang = (lang ? lang : navigator.language);
        const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
        el.textContent = Intl.DateTimeFormat(lang, options).format(new Date());
    }

    onRendered() {
        const elements = document.querySelectorAll('[data-time]');
        for (const el of elements) {
            if (!this.timers.has(el)) {
                this.showTime(el);
                const interval = window.setInterval(() => {
                    this.showTime(el);
                }, 1000);
                this.timers.set(el, interval);
            }
        }
    }

    onRouteUnload() {
        for (const [el, interval] of this.timers) {
            window.clearInterval(interval);
            this.timers.delete(el);
        }
    }
}

// From DevTools this plugin will show under `app.plugins.time` based on the name.
app.addPlugin('time', Time);
