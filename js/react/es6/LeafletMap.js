/**
 * DataFormsJS React Component <LeafletMap>
 *
 * Leaflet is a widely used open source alternative to Google Maps.
 *
 * This Component is designed to be a minimal component for displaying a map
 * with an optional marker. Using Leaflet with OpenStreetMaps is free, however
 * many options exist with Leaflet such as premium maps from Mapbox so if your
 * needs are different then simply copy and use this as a starting point for
 * your site.
 *
 * Additionally another node package exists [react-leaflet] that provides a
 * much larger React API for working with Leaflet and could also be used
 * instead of copying this file if you need to use the Leaflet API.
 *
 * Leaflet modifies the DOM directly so if the component is re-rendered the
 * map will be re-drawn and any user interactions would be lost.
 *
 * @link https://leafletjs.com
 * @link https://www.openstreetmap.org
 * @link https://www.mapbox.com
 * @link https://react-leaflet.js.org
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* global L */
/* jshint esversion:6 */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import React from 'react';

export default class LeafletMap extends React.Component {
    constructor(props) {
        super(props);
        this.div = React.createRef();
    }

    componentDidMount() {
        // Get settings from props
        const lat = parseFloat(this.props.latitude);
        const long = parseFloat(this.props.longitude);
        const zoom = parseInt(this.props.zoom, 10);
        const markerText = this.props.marker;

        // Validate
        const numAttr = [
            { attr:'latitude', value:lat },
            { attr:'longitude', value:long },
            { attr:'zoom', value:zoom },
        ];
        for (let n = 0, m = numAttr.length; n < m; n++) {
            // Only allow numbers
            if (isNaN(numAttr[n].value)) {
                console.error('<LeafletMap> - Invalid Prop for [' + numAttr[n].attr + '], value was not a number.');
                console.log(numAttr[n].attr);
                console.log(this.props);
                return;
            }
        }

        // Create map
        const map = L.map(this.div.current).setView([lat, long], zoom);

        // Add title images
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add optional marker and marker text
        if (markerText !== null) {
            const marker = L.marker([lat, long]).addTo(map);
            if (markerText) {
                marker.bindPopup(markerText);
            }
            marker.openPopup();
        }
    }

    render() {
        // JSX Version:
        // return <div className="leaflet-map" ref={this.div} />
        return React.createElement('div', {
            className: 'leaflet-map',
            ref: this.div
        });
    }
}
