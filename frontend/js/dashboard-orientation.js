/**
 * AYICRIP Dashboards — Portrait/Landscape Handling
 * On small screens in portrait, attempts to lock the screen to landscape
 * where the browser supports it (mostly Android Chrome). Where it isn't
 * supported (most iPhones), does nothing further — the CSS in style.css
 * already switches the dashboard to a portrait-friendly stacked layout,
 * and .rotate-prompt-banner becomes visible via the same media query.
 */
(function () {
  'use strict';

  function isSmallPortrait() {
    return window.matchMedia('(max-width: 767.98px)').matches
      && window.matchMedia('(orientation: portrait)').matches;
  }

  var lockAttempted = false;

  function tryLockLandscape() {
    if (lockAttempted) return;
    lockAttempted = true;

    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      screen.orientation.lock('landscape').catch(function () {
        /* Not supported outside fullscreen/installed-PWA context on most
           browsers (notably iOS Safari) — the CSS fallback layout and
           rotate-prompt banner already cover this case. */
      });
    }
  }

  function evaluate() {
    if (isSmallPortrait()) {
      tryLockLandscape();
    } else {
      lockAttempted = false;
    }
  }

  document.addEventListener('DOMContentLoaded', evaluate);
  window.addEventListener('resize', evaluate);
  if (screen.orientation && 'onchange' in screen.orientation) {
    screen.orientation.addEventListener('change', evaluate);
  } else {
    window.addEventListener('orientationchange', evaluate);
  }
})();
