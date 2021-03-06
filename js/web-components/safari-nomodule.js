/**
 * From:
 * https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc#file-safari-nomodule-js
 *
 * See also:
 * https://jakearchibald.com/2017/es-modules-in-browsers/
 *
 * Example usage:
 *     <script type="module" src="dataformsjs/js/web-components/json-data.js"></script>
 *     <script nomodule src="dataformsjs/js/web-components/safari-nomodule.js"></script>
 *     <script nomodule src="dataformsjs/js/web-components/old-browser-warning.js"></script>
 *
 * Originally [old-browser-warning.js] was published without the close [X] button.
 * Now that a close button is included it's safe to exclude this script if using
 * [old-browser-warning.js] as the user can still close the warning and as of
 * late 2020 the target browser of this script [Safari 10.1] has very little usage.
 * 
 * Additionally [polyfill.js] for Web Components has been designed to exit with
 * a warning if it is being loaded at the same time with the Web Components.
 */

/**
 * Safari 10.1 supports modules, but does not support the `nomodule` attribute - it will
 * load <script nomodule> anyway. This snippet solve this problem, but only for script
 * tags that load external code, e.g.: <script nomodule src="nomodule.js"></script>
 *
 * Again: this will **not** prevent inline script, e.g.:
 * <script nomodule>alert('no modules');</script>.
 *
 * This workaround is possible because Safari supports the non-standard 'beforeload' event.
 * This allows us to trap the module and nomodule load.
 *
 * Note also that `nomodule` is supported in later versions of Safari - it's just 10.1 that
 * omits this attribute.
 */
(function() {
  var check = document.createElement('script');
  if (!('noModule' in check) && 'onbeforeload' in check) {
    var support = false;
    document.addEventListener('beforeload', function(e) {
      if (e.target === check) {
        support = true;
      } else if (!e.target.hasAttribute('nomodule') || !support) {
        return;
      }
      e.preventDefault();
    }, true);

    check.type = 'module';
    check.src = '.';
    document.head.appendChild(check);
    check.remove();
  }
}());