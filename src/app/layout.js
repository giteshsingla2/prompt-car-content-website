import Script from "next/script";
import HeaderCode from "@/components/HeaderCode";
import TopBanner from "@/components/TopBanner";
import { getCachedSettings } from "@/lib/dataCache";
import "./globals.css";

export const metadata = {
  title: "AutoPostr. — AI Car Concept Prompt Library",
  description: "A small library combining detailed car reviews with ready-to-use AI image prompts. Unlock a prompt, watch a short ad, and copy it to your favourite generator.",
};

export default async function RootLayout({ children }) {
  // Fetch settings from cache (only hits DB on first load or after revalidateTag('settings'))
  let headerCode = "";
  try {
    const settings = await getCachedSettings();
    headerCode = settings["header_code"] || "";
  } catch (e) {
    // DB unavailable — skip header code injection
  }

  const interstitialAdUnit = process.env.NEXT_PUBLIC_GAM_INTERSTITIAL_AD_UNIT || "/21775744923/example/interstitial";
  const topBannerAdUnit = process.env.NEXT_PUBLIC_GAM_TOP_BANNER_AD_UNIT || "/21775744923/example/adaptive-banner";
  const anchorAdUnit = process.env.NEXT_PUBLIC_GAM_ANCHOR_AD_UNIT || "/21775744923/example/anchor";

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Google Publisher Tag (GPT) library */}
        <Script
          src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
          strategy="afterInteractive"
        />
        {/* Global GPT slots setup */}
        <Script id="gpt-global-ad-setup" strategy="afterInteractive">
          {`
            window.googletag = window.googletag || { cmd: [] };
            
            // Skip ad slot initialization on admin / login paths
            if (window.location.pathname.indexOf('z4q8wx-postr-92k') === -1) {
              googletag.cmd.push(function() {
                // 1. Define Top Banner (300x250, 300x600, 320x50 — all viewports)
                var topBannerSlot = googletag.defineSlot(
                  '${topBannerAdUnit}',
                  [[300, 250], [300, 600], [320, 50]],
                  'div-gpt-ad-top-banner'
                );
                
                if (topBannerSlot) {
                  topBannerSlot.addService(googletag.pubads());
                }

                // 2. Define Bottom Anchor Ad (out-of-page floating slot)
                var anchorSlot = googletag.defineOutOfPageSlot(
                  '${anchorAdUnit}',
                  googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR
                );
                if (anchorSlot) {
                  anchorSlot.addService(googletag.pubads());
                }

                // 3. Define Web Interstitial Ad (displays between page loads)
                var interstitialSlot = googletag.defineOutOfPageSlot(
                  '${interstitialAdUnit}',
                  googletag.enums.OutOfPageFormat.INTERSTITIAL
                );
                if (interstitialSlot) {
                  interstitialSlot.addService(googletag.pubads());
                }

                // Listen to slot render end to notify TopBanner component of status and loaded size
                googletag.pubads().addEventListener('slotRenderEnded', function(event) {
                  if (event.slot.getSlotElementId() === 'div-gpt-ad-top-banner') {
                    var customEvent = new CustomEvent('topAdRendered', {
                      detail: {
                        isEmpty: event.isEmpty,
                        size: event.size
                      }
                    });
                    window.dispatchEvent(customEvent);
                  }
                });

                googletag.enableServices();

                // Trigger display for static layout slots
                if (topBannerSlot) {
                  googletag.display('div-gpt-ad-top-banner');
                }
                if (anchorSlot) {
                  googletag.display(anchorSlot);
                }
                if (interstitialSlot) {
                  googletag.display(interstitialSlot);
                }
              });
            }
          `}
        </Script>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-26WXS953GL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-26WXS953GL');
          `}
        </Script>
        {/* Ad Unfilled Tracker — sets collector URL before tracker script runs */}
        {process.env.NEXT_PUBLIC_COLLECTOR_URL && (
          <>
            <Script
              id="ad-tracker-config"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.adTrackerConfig = { collectorUrl: "https://ads.punjigyan.com/api/collect" };`
              }}
            />
            <Script src="/ad-tracker.js" strategy="afterInteractive" />
          </>
        )}
        {/* Custom header code from DB (managed via admin panel Settings) */}
        <HeaderCode code={headerCode} />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
