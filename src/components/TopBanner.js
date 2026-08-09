"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TopBanner() {
  const pathname = usePathname();
  const [adState, setAdState] = useState({
    status: "loading", // "loading" | "filled" | "unfilled"
    height: 600,      // Start with a standard reserved height of 600px
  });

  // Check if current route is the admin/login page
  const isAdmin = pathname && pathname.includes("z4q8wx-postr-92k");

  useEffect(() => {
    if (isAdmin) return;

    const handleAdRendered = (e) => {
      const { isEmpty, size } = e.detail;
      if (isEmpty) {
        setAdState({
          status: "unfilled",
          height: 0,
        });
      } else {
        const height = size && size[1] ? size[1] : 600;
        setAdState({
          status: "filled",
          height,
        });
      }
    };

    window.addEventListener("topAdRendered", handleAdRendered);
    return () => {
      window.removeEventListener("topAdRendered", handleAdRendered);
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  const isUnfilled = adState.status === "unfilled";
  const isLoading = adState.status === "loading";

  return (
    <div
      className="pf-top-ad-wrapper"
      style={{
        height: `${adState.height}px`,
        opacity: isUnfilled ? 0 : 1,
        visibility: isUnfilled ? "hidden" : "visible",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        overflow: "hidden",
        position: "relative",
        background: isLoading ? "rgba(28, 35, 64, 0.03)" : "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        padding: isUnfilled ? "0" : "12px 16px 0",
      }}
    >
      {/* Shimmery Skeleton Placeholder for the Ad Space */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: "12px 16px 0",
            borderRadius: "12px",
            background: "linear-gradient(90deg, rgba(236, 223, 196, 0.3) 25%, rgba(236, 223, 196, 0.65) 37%, rgba(236, 223, 196, 0.3) 63%)",
            backgroundSize: "400% 100%",
            animation: "pf-shimmer 1.4s ease infinite",
          }}
        />
      )}

      {/* Styled animation keyframes */}
      <style>{`
        @keyframes pf-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>

      <div
        id="div-gpt-ad-top-banner"
        style={{
          display: isUnfilled ? "none" : "block",
          zIndex: 2,
        }}
      />
    </div>
  );
}
