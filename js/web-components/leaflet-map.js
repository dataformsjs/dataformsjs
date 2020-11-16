/**
 * DataFormsJS <div is="leaflet-map"> Web Component
 *
 * Leaflet is a widely used open source alternative to Google Maps.
 *
 * Using Leaflet with OpenStreetMaps is free, however many options exist with
 * Leaflet such as premium maps from Mapbox so if your needs are different
 * then simply copy and use this as a starting point for your site.
 *
 * @link https://leafletjs.com
 * @link https://www.openstreetmap.org
 * @link https://www.mapbox.com
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* global L */
/* jshint esversion:8 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import { defineExtendsPolyfill, showError } from './utils.js';

class LeafletMap extends HTMLDivElement {
    constructor() {
        super();
        this._map = null;
        this._isConnected = false;
    }

    connectedCallback() {
        this._isConnected = true;
        this.createMap();
    }

    disconnectedCallback() {
        this._isConnected = false;
        if (this._map !== null) {
            this._map.remove();
            this._map = null;
        }
    }

    static get observedAttributes() {
        return ['latitude', 'longitude', 'zoom', 'marker'];
    }

    attributeChangedCallback(attr, /* oldVal, newVal */) {
        if (!this._isConnected) {
            // This can happen if using <leaflet-map> with React
            // while the component is being created.
            return;
        }
        if (LeafletMap.observedAttributes.includes(attr)) {
            this.createMap();
        }
    }

    createMap() {
        // Get settings from element attribute
        const lat = parseFloat(this.getAttribute('latitude'));
        const long = parseFloat(this.getAttribute('longitude'));
        const zoom = parseInt(this.getAttribute('zoom'), 10);
        const markerText = this.getAttribute('marker');

        // Validate
        const numAttr = [
            { attr:'latitude', value:lat },
            { attr:'longitude', value:long },
            { attr:'zoom', value:zoom },
        ];
        for (let n = 0, m = numAttr.length; n < m; n++) {
            // Only allow numbers
            if (isNaN(numAttr[n].value)) {
                // If [json-data.js] with [data-bind-attr] is being used then wait for
                // the bound values to be updated before creating the map.
                const attrValue = this.getAttribute(numAttr[n].attr);
                if (this.getAttribute('data-bind-attr') !== null && (attrValue === null || attrValue.startsWith('[') || attrValue === '' || attrValue === 'null')) {
                    return;
                }
                // Invalid attribute
                showError(this, 'Leaflet Map - Invalid Attribute for [' + numAttr[n].attr + ']');
                console.log(numAttr[n].attr);
                console.log(this.getAttribute(numAttr[n].attr));
                console.log(this);
                return;
            }
        }

        // Make sure Leaflet `L` object is loaded
        if (window.L === undefined) {
            showError(this, 'Error - Unable to show map because Leaflet is not loaded on the page.');
            return;
        }

        // Create map
        if (this._map !== null) {
            this._map.remove();
            this._map = null;
        }
        this._map = L.map(this).setView([lat, long], zoom);

        // Add title images
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        }).addTo(this._map);

        // Add optional marker and marker text
        if (markerText !== null) {
            const marker = L.marker([lat, long]).addTo(this._map);
            if (markerText) {
                marker.bindPopup(markerText);
            }
            marker.openPopup();
        }
    }
}

window.customElements.define('leaflet-map', LeafletMap, { extends: 'div' });
defineExtendsPolyfill('leaflet-map', 'div', (el) => {
    el._map = null;
    LeafletMap.prototype.createMap.apply(el);
});
