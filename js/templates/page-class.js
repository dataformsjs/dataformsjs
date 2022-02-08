/**
 * Page Class Template
 */

/* global app */
/* jshint esversion: 6 */

class Page {
    constructor() {
        this.counter = 0;
    }

    logFuncHash(func) {
        console.log('%cpage.' + func + ': ' + window.location.hash, 'color:navy;');
    }

    // Called once when the view is loaded with data
    setupView() {
        // ** Add custom page logic here
        this.logFuncHash('setup');
    }

    /**
     * Controller function that is called once before the route
     * will be loaded. This is usefull for calling web services
     * before any rendering happens. For example, see usage on the
     * core [pages/jsonData.js] file.
     *
     * When using Vue this will be called from the Vue instance
     * [mounted()] function.
     */
        onRouteLoad() {
        console.log('%cPage Loaded', 'font-weight:bold;');
        this.counter++;
        this.logFuncHash('onRouteLoad');
    }

    /**
     * Define the Controller [onBeforeRender()] function.
     * This gets called each time the view is redrawn before
     * the the HTML is rendered.
     *
     * When using Vue this function will not be called so instead
     * use [onRouteLoad()] to handle early controller logic.
     */
    onBeforeRender() {
        this.logFuncHash('onBeforeRender');
    }

    /**
     * Define the Controller [onRendered()] function.
     * This gets called each time the view is redrawn.
     */
    onRendered() {
        this.logFuncHash('onRendered');
        this.setupView();
    }

    /**
     * Define the Controller [onRouteUnload()] function.
     * This event gets called only once per hash change when
     * the current route is unloaded. It can be used to call
     * [window.clearTimeout()] for page timers or cleanup
     * for other resources.
     *
     * When using Vue this will be called from the Vue instance
     * [beforeDestroy()] function.
     */
    onRouteUnload() {
        this.logFuncHash('onRouteUnload');
        console.log('%cPage Unloaded', 'font-weight:bold;');
    }
}

/**
 * Add page to app
 * The name defined here can be used with [data-page] from HTML
 */
app.addPage('pageName', Page);
