/**
 * Plugin Class Template
 */

/* global app */
/* jshint esversion: 6 */

class MyPlugin {
    /**
     * Event that runs only once per hash change and before the view is
     * rendered. Plugins that use [onRouteLoad()] run only one function
     * at a time. This event would typically be used to download resources
     * needed by the page that are not part of the page's controller. Since
     * this blocks the view from updating is should only be used with very
     * fast web services, for example downloading simple JSON files.
     *
     * If calling [next(false)] then the route will not be loaded; this should
     * only be used if the plugin changes the URL - [window.location = 'new_url'].
     *
     * @param {function} next
     */
    onRouteLoad(next) {
        console.log('plugin.onRouteLoad');
        next();
    }

    /**
     * Event called before the current view is rendered
     */
    onBeforeRender() {
        console.log('plugin.onBeforeRender');
    }

    /**
     * Event called after the HTML is rendered and before the page's controller
     * [onRendered()] function runs. Defining and using [element] is optional and
     * only passed when certain functions such as [app.refreshHtmlControl()] are called.
     *
     * @param {undefined|HTMLElement}
     */
    onRendered(element) {
        console.log('plugin.onRendered');
        /* eslint no-unused-vars: "off" */
        element = (element === undefined ? document : element);
    }

    /**
     * Event called only once per hash change or page refresh
     * and occurs before the current page is unloaded.
     */
    onRouteUnload() {
        console.log('plugin.onRouteUnload');
    }
};

/**
 * Add Plugin to DataFormsJS
 */
app.addPlugin('pluginName', MyPlugin);
