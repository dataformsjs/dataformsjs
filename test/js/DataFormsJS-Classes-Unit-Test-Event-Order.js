/**
 * This file contains classes based on objects from:
 *      DataFormsJS-Pages-Unit-Test-Event-Order.js
 *      DataFormsJS-Plugins-Unit-Test-Event-Order.js
 *
 * Framework support for Page and Plugin classes was added to DataFormsJS in early 2022.
 * This tests do not run with IE or legacy browsers.
 */

class PageEventOrder {
    constructor() {
        this.triggeredIsUpdatingView = false;
        this.viewHasBeenUpdated = false;
        this.classEvents = [];
    }

    // Each function adds a string to the events array of the model
    onRouteLoad() {
        this.classEvents.push('pageClass:onRouteLoad');

        // Flag variable so app.updateView() is called only once
        // each time the controller loads
        this.viewHasBeenUpdated = false;
    }

    onBeforeRender() {
        this.classEvents.push('pageClass:onBeforeRender');
    }

    onRendered() {
        this.classEvents.push('pageClass:onRendered');

        // Due to timing when app.updateView() is called
        // [app.isUpdatingView()] should equal true the 2nd
        // time this function runs on the unit test.
        if (app.isUpdatingView()) {
            this.triggeredIsUpdatingView = true;
        }

        // This will be true the 2nd time this function
        // is called once [app.updateView()] is ran.
        if (this.viewHasBeenUpdated) {
            return;
        }

        // Mark this view as being updated
        // and update the view again.
        this.viewHasBeenUpdated = true;
        app.updateView();
    }

    onRouteUnload() {
        this.classEvents.push('pageClass:onRouteUnload');
    }
}

class PluginEventOrder {
    onAllowRouteChange(path) {
        this.addEvent('pluginClass:onAllowRouteChange(' + path + ')');
        return true;
    }
    onBeforeRender() {
        this.addEvent('pluginClass:onBeforeRender');
    }
    onRendered() {
        this.addEvent('pluginClass:onRendered');
    }
    onRouteUnload() {
        this.addEvent('pluginClass:onRouteUnload');
    }

    addEvent(eventName) {
        if (app.activeModel && app.activeModel.classEvents) {
            app.activeModel.classEvents.push(eventName);
        }
    }
}

app.addPage('PageEventOrder', PageEventOrder);
app.addPlugin('PluginEventOrder', PluginEventOrder);
