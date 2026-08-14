(function () {
  'use strict';

  // adTrackerConfig is injected by the Next.js layout via a beforeInteractive Script
  if (typeof adTrackerConfig === 'undefined' || !adTrackerConfig.collectorUrl) {
    return; // not configured yet, do nothing
  }

  var eventBuffer = [];
  var FLUSH_INTERVAL_MS = 8000; // safety flush for long page sessions

  function pushEvent(adUnit, unfilled) {
    eventBuffer.push({ adUnit: adUnit, unfilled: unfilled });
  }

  function flush() {
    if (eventBuffer.length === 0) return;

    var payload = JSON.stringify({
      domain: window.location.hostname,
      pageUrl: window.location.href,
      events: eventBuffer
    });

    eventBuffer = [];

    // fetch with keepalive:true — survives page unload like sendBeacon, but also
    // lets us set headers if ever needed again (kept for reliability/consistency).
    if (window.fetch) {
      fetch(adTrackerConfig.collectorUrl, {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8'
        },
        keepalive: true,
        mode: 'cors'
      }).catch(function (e) {
        console.error('[ad-tracker] fetch failed', e);
      });
    } else if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' });
      navigator.sendBeacon(adTrackerConfig.collectorUrl, blob);
    }
  }

  function initTracking() {
    if (typeof googletag === 'undefined' || !googletag.pubads) {
      return;
    }

    googletag.cmd.push(function () {
      googletag.pubads().addEventListener('slotRenderEnded', function (event) {
        try {
          var adUnit = event.slot.getAdUnitPath();
          pushEvent(adUnit, event.isEmpty === true);
        } catch (e) {
          // fail silently — never let tracking errors break the page's ads
        }
      });
    });
  }

  // Flush when the user leaves or backgrounds the tab — most reliable moment for sendBeacon
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);

  // Safety net for long-lived pages (infinite scroll, SPA-like themes)
  setInterval(flush, FLUSH_INTERVAL_MS);

  if (document.readyState === 'complete') {
    initTracking();
  } else {
    window.addEventListener('load', initTracking);
  }
})();
