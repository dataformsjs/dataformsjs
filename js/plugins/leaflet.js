/**
 * DataFormsJS Plugin to setup Leaflet Maps using OpenStreetMaps for Images.
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
/* global app, L */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';

    app.addPlugin('leaflet', function (element) {
        // Get either document or specific element
        element = (element === undefined ? document : element);

        // Add maps to all elements with the attribute [data-leaflet]
        var maps = element.querySelectorAll('[data-leaflet]');
        Array.prototype.forEach.call(maps, function(mapEl) {
            // Get settings from element attribute
            var lat = parseFloat(mapEl.getAttribute('data-latitude'));
            var long = parseFloat(mapEl.getAttribute('data-longitude'));
            var zoom = parseInt(mapEl.getAttribute('data-zoom'), 10);
            var markerText = mapEl.getAttribute('data-marker');

            // Validate
            var numAttr = [
                { attr:'data-latitude', value:lat },
                { attr:'data-longitude', value:long },
                { attr:'data-zoom', value:zoom },
            ];
            for (var n = 0, m = numAttr.length; n < m; n++) {
                // Only allow numbers
                if (isNaN(numAttr[n].value)) {
                    // If [dataBind.js] with [data-bind-attr] is being used then this plugin is running prior
                    // to the values being bound so exist as [dataBind.js] will call this again after updating attributes.
                    var attrValue = mapEl.getAttribute(numAttr[n].attr);
                    if (mapEl.getAttribute('data-bind-attr') !== null && (attrValue.startsWith('[') || attrValue === '')) {
                        return;
                    }
                    // Invalid attribute
                    app.showErrorAlert('Leaflet Map - Invalid Attribute for [' + numAttr[n].attr + '], see console for Map Element');
                    console.log(numAttr[n].attr);
                    console.log(mapEl.getAttribute(numAttr[n].attr));
                    console.log(mapEl);
                    return;
                }
            }

            // Create map
            var map = L.map(mapEl).setView([lat, long], zoom);

            // Add title images
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add optional marker and marker text
            if (markerText !== null) {
                var marker = L.marker([lat, long]).addTo(map);
                if (markerText) {
                    marker.bindPopup(markerText);
                }
                marker.openPopup();
            }
        });
    });
})();
