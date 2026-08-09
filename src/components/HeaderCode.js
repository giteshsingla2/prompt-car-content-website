/**
 * HeaderCode — Server Component
 *
 * Accepts a `code` prop (raw HTML string from DB) and injects
 * it into the <head> of every page.
 *
 * Supported formats (auto-detected):
 *  - External script tag:  <script async src="https://..."></script>
 *  - Inline JS:            <script>window.dataLayer = [];</script>  OR  just the raw JS
 */

import Script from "next/script";

function extractScriptSrc(code) {
  const match = code.match(/src=["']([^"']+)["']/);
  return match ? match[1] : null;
}

function extractInlineScript(code) {
  const match = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  return match ? match[1].trim() : null;
}

function isExternalScript(code) {
  return /<script[^>]+src=/i.test(code);
}

function isHtml(code) {
  return /<[a-z][\s\S]*>/i.test(code);
}

export default function HeaderCode({ code }) {
  const raw = (code || "").trim();
  if (!raw) return null;

  // Case 1: External <script src="..."> tag
  if (isExternalScript(raw)) {
    const src = extractScriptSrc(raw);
    if (src) {
      return (
        <Script
          id="header-code-external"
          src={src}
          strategy="afterInteractive"
          crossOrigin="anonymous"
          async
        />
      );
    }
  }

  // Case 2: Inline <script>...</script> wrapper
  if (isHtml(raw)) {
    const inline = extractInlineScript(raw);
    if (inline) {
      return (
        <Script
          id="header-code-inline"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: inline }}
        />
      );
    }
  }

  // Case 3: Bare JS code (no HTML tags)
  return (
    <Script
      id="header-code-raw"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: raw }}
    />
  );
}
