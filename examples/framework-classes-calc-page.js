/**
 * This class is used for a DataFormsJS Page Object.
 *
 * A DataFormsJS page object is used to define both a model and controller
 * from a single file and is the recommended method when adding new routes/pages
 * to an app using custom code. The script attribute [data-page] can be used to
 * map a script to a page. For detailed usage see examples that use [data-page].
 *
 * When using a JavaScript class the only requirement is that one of the controller
 * functions ['onRouteLoad', 'onBeforeRender', 'onRendered', 'onRouteUnload'] is
 * defined on the class. Controller functions are events handled internally by
 * the DataFormsJS framework when a route changes or content is rendered.
 */

/* global app */
/* jshint esversion: 6 */

/**
 * This file is based on ES5 code from the DataFormsJS Playground:
 *     https://dataformsjs.com/en/playground
 */
class Calculator {
    constructor() {
        this.ops = Object.freeze([ '+', '-', '*', '/' ]);
        this.results = [];
        this.currentOp = this.ops[this.getRandomInt(4)];
        this.currentX = this.getRandomInt(1000000);
        this.currentY = this.getRandomInt(1000000);
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    add(x, y) { return x + y; }
    subtract(x, y) { return x - y; }
    multiply(x, y) { return x * y; }
	divide(x, y) { return x / y; }

    calculate(x, op, y) {
        switch (op) {
            case '+':
                return this.add(x, y);
            case '-':
                return this.subtract(x, y);
            case '*':
                return this.multiply(x, y);
            case '/':
                return this.divide(x, y);
        }
    }

    // Button click event
    calculateResult() {
        // Calculate
        var item = {
            x: parseFloat(this.currentX),
            op: this.currentOp,
            y: parseFloat(this.currentY),
        };
        item.z = this.calculate(item.x, item.op, item.y);
        item.hasError = isNaN(item.z);

        // Add to model property (front of the array)
        this.results.unshift(item);

        // Reset form to a new random value
        this.currentOp = this.ops[this.getRandomInt(4)];
        this.currentX = this.getRandomInt(1000000);
        this.currentY = this.getRandomInt(1000000);

        // Render HTML Controls to show updated model values.
        // This also triggers the [data-bind] plugin for Handlebars, etc.
        if (!app.isUsingVue()) {
            app.refreshAllHtmlControls();
        }
    }

    /**
     * DataFormsJS Event that gets called every time the page is loaded or refreshed.
     * When using Handlebars or a Templating language DOM events are often setup here.
     * When using Vue controller functions may not need to be defined or could be empty.
     */
    onRendered() {
        if (!app.isUsingVue()) {
            document.querySelector('button').onclick = this.calculateResult.bind(this);
        }
    }
}

// The name defined here can be used with [data-page] from HTML
app.addPage('calculator', Calculator);
