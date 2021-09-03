/**
 * DataFormsJS <animation-service> Web Component
 *
 * This component allows for animation with the built-in IntersectionObserver
 * object. This class does not provide built-in animations rather it is used
 * with CSS defined in the app for animation.
 * 
 * Usage:
 *
 * Define this Web Component on the page
 *     <animation-service></animation-service>
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
 * IntersectionObserver is used to detect when the element is visible
 * to the user and then it will add the class from the [data-animate] attribute
 * to the element:
 *      <div class="show-and-scale" data-animate="show-and-scale">...</div>
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
        let elements = document.querySelectorAll('[data-animate]');
        elements = Array.from(elements).filter(el => {
            return !el.classList.contains(el.getAttribute('data-animate'));
        });
        if (elements.length === 0) {
            return;
        }

        const animationObserver = new IntersectionObserver((entries, observer) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
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
