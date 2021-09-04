/**
 * DataFormsJS <animation-service> Web Component
 *
 * This component allows for animation with the browsers Intersection Observer API.
 * This class does not provide built-in animations from JavaScript; rather it is
 * used with CSS defined in the app for animation. An example/starting-template
 * is available from the file [animation-service.css] in this directory.
 *
 * ---------
 *   Usage
 * ---------
 * Define this Web Component on the page
 *     <animation-service></animation-service>
 *
 * Or optionally include a specific intersection ratio
 *     <animation-service intersection-ratio="0.3"></animation-service>
 *
 * Use [data-animate] on elements in the page
 *     <div data-animate="show-and-scale">...</div>
 *
 * Define CSS for the animation:
 *      [data-animate].show-and-scale {
 *          animation: show-and-scale .5s ease-in-out forwards;
 *      }
 *      @keyframes show-and-scale {
 *          from { opacity: 0; transform: scale(.5); }
 *          to { opacity: 1; transform: scale(1); }
 *      }
 *
 * ----------------
 *   How it works
 * ----------------
 * IntersectionObserver is used to detect when the element is visible
 * to the user and then it will add the class from the [data-animate] attribute
 * to the element:
 *      <div class="show-and-scale" data-animate="show-and-scale">...</div>
 *
 * When used with CSS this allows for high performance and efficient animations.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes
 */

/* Validates with both [eslint] and [jshint] */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */
/* jshint esversion:8 */

import { WebComponentService } from './WebComponentService.js';

/**
 * Define the <animation-service> element
 */
window.customElements.define('animation-service', class AnimationService extends WebComponentService {
    onLoad() {
        // Find elements to animate that have not yet been animated
        let elements = document.querySelectorAll('[data-animate]');
        elements = Array.from(elements).filter(el => {
            return !el.classList.contains(el.getAttribute('data-animate'));
        });
        if (elements.length === 0) {
            return;
        }

        // Get optional [intersection-ratio] attribute (value is a float, example: "0.3")
        let intersectionRatio = this.getAttribute('intersection-ratio');
        if (intersectionRatio !== null) {
            intersectionRatio = parseFloat(intersectionRatio);
            if (isNaN(intersectionRatio)) {
                intersectionRatio = null;
            }
        }

        // Use Intersection Observer to monitor when elements come into view
        const animationObserver = new IntersectionObserver((entries, observer) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    if (intersectionRatio !== null && entry.intersectionRatio < intersectionRatio) {
                        return;
                    }
                    const className = entry.target.getAttribute('data-animate');
                    entry.target.classList.add(className);
                    observer.unobserve(entry.target);
                }
            }
        });

        for (const element of elements) {
            animationObserver.observe(element);
        }
    }
});
