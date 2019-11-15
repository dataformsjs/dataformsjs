/**
 * DataFormsJS <data-list> Control
 */

/* Validates with both [jshint] and [eslint] */
/* global app */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function() {
    'use strict';

    /**
     * DataFormsJS <data-list> Control
     */
    var dataList = {
        /**
         * HTML Element Type for the Control 
         */
        type: 'ul',

        /**
         * Data for the control
         */
        data: {
            source: null,
        },

        /**
         * Event that gets called when a <json-control> is rendered on screen
         *
         * @this dataTable.data
         * @param {object} model
         */
        html: function(model) {
            var html,
                n,
                m;

            // Get List from Model
            var list = null;
            if (app.plugins.dataBind && app.plugins.dataBind.getBindValue) {
                list = app.plugins.dataBind.getBindValue(this.source);
            } else {
                list = (model && model[this.source] ? model[this.source] : null);
            }
            
            // Return empty string for if no data
            if (list === null || (Array.isArray(list) && list.length === 0)) {
                return '';
            }

            // Validate data type
            if (!Array.isArray(list)) {
                console.error('Invalid list data type for <data-list>');
                console.log(list);
                return;
            }

            // Render the List Contents
            html = [];
            for (n = 0, m = list.length; n < m; n++) {
                html.push('<li>' + app.escapeHtml(list[n]) + '</li>');
            }
            return html.join('');
        },
    };

    /**
     * Add control to app
     */
    app.addControl('data-list', dataList);
})();