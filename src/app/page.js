"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Tag, Unlock, Lock, Clock, ImagePlus, Search } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TopBanner from "@/components/TopBanner";
import { getPostSlug } from "@/lib/carArticles";

function InFeedAd({ index }) {
  const containerRef = useRef(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  // Set up intersection observer to detect when user gets close to the ad slot
  useEffect(() => {
    if (hasIntersected) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasIntersected(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null, // Viewport
        rootMargin: "250px", // Trigger slightly before it comes into viewport (for smooth loading)
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasIntersected]);

  // Request the ad unit only after intersection occurs
  useEffect(() => {
    if (!hasIntersected) return;

    window.googletag = window.googletag || { cmd: [] };
    let slot;
    const adUnit = process.env.NEXT_PUBLIC_GAM_INFEED_AD_UNIT || "/21775744923/example/banner";

    googletag.cmd.push(() => {
      slot = googletag.defineSlot(adUnit, [[300, 250], [320, 50]], `div-gpt-ad-infeed-${index}`);
      if (slot) {
        slot.addService(googletag.pubads());
        googletag.display(`div-gpt-ad-infeed-${index}`);
      }
    });

    return () => {
      googletag.cmd.push(() => {
        if (slot) {
          googletag.destroySlots([slot]);
        }
      });
    };
  }, [hasIntersected, index]);

  return (
    <div className="pf-ad-card-infeed" ref={containerRef}>
      {hasIntersected && (
        <div id={`div-gpt-ad-infeed-${index}`} style={{ display: "inline-block" }} />
      )}
    </div>
  );
}

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  // Fetch posts from MongoDB API and load URL parameters
  useEffect(() => {
    const initPage = async () => {
      // 1. Parse URL query parameters
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get("cat");
        const qParam = urlParams.get("q");
        if (catParam) {
          setActiveCategory(catParam);
        }
        if (qParam) {
          setQuery(qParam);
        }

        // Load unlocked posts from local storage
        const unlockedRaw = localStorage.getItem("unlocked-ids-v2");
        if (unlockedRaw) {
          try {
            setUnlockedIds(JSON.parse(unlockedRaw));
          } catch (e) {
            setUnlockedIds([]);
          }
        }
      }

      // 2. Fetch posts from DB
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const list = await res.json();
          setPosts(list);
        }
      } catch (e) {
        console.error("Failed to load posts from API:", e);
      }

      setLoading(false);
    };

    initPage();
  }, []);

  const categories = Array.from(new Set(posts.map((p) => p.category)));
  
  // Filter logic
  const filtered = posts.filter((p) => {
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    const matchesQuery =
      !query.trim() ||
      p.title.toLowerCase().includes(query.trim().toLowerCase()) ||
      p.category.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="pf-app">
      <Header activeView="home" />
      <TopBanner />

      {loading ? (
        <div className="pf-loading">
          <Loader2 className="pf-spin" size={22} /> Loading feed from database…
        </div>
      ) : (
        <div className="pf-shell">
          <main className="pf-main">
            <div>
              <div className="pf-hero">
                <span className="pf-eyebrow">AI Car Concept Prompts</span>
                <h1>Unveiling the Future of Cars.</h1>
                <p>Read detailed reviews of top Indian and global cars, and unlock the exact AI image prompts used to generate these stunning concept visuals.</p>
              </div>

              {/* Category tabs */}
              <div className="pf-tabs">
                <a
                  className={"pf-tab" + (activeCategory === "All" ? " is-active" : "")}
                  href="/"
                >
                  All
                </a>
                {categories.map((c) => (
                  <a
                    key={c}
                    className={"pf-tab" + (activeCategory === c ? " is-active" : "")}
                    href={`/?cat=${encodeURIComponent(c)}`}
                  >
                    {c}
                  </a>
                ))}
              </div>

              {query && (
                <p className="pf-query-note">
                  Showing results for “{query}” · {filtered.length} found
                </p>
              )}

              {posts.length === 0 ? (
                <div className="pf-empty">
                  <ImagePlus size={26} />
                  <p>No car concepts yet. Add your first car concept to get started.</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="pf-empty">
                  <Search size={26} />
                  <p>Nothing matches that search or category.</p>
                </div>
              ) : (
                <div className="pf-grid">
                  {/* Reduce array to insert InFeedAds after every 2 posts */}
                  {filtered.reduce((acc, p, index) => {
                    acc.push(
                      <a
                        className="pf-card"
                        key={p.id}
                        href={`/posts/${getPostSlug(p)}`}
                        style={{ textDecoration: "none" }}
                      >
                        <div className="pf-card-img">
                          <img src={p.image} alt={p.title} loading="lazy" />
                        </div>
                        <div className="pf-card-body">
                          <div className="pf-card-tags">
                            <span className="pf-tag"><Tag size={11} /> {p.category}</span>
                            {unlockedIds.includes(p.id) ? (
                              <span className="pf-tag pf-tag-open"><Unlock size={11} /> Unlocked</span>
                            ) : (
                              <span className="pf-tag pf-tag-locked"><Lock size={11} /> Locked</span>
                            )}
                          </div>
                          <h3>{p.title}</h3>
                          <div className="pf-card-meta">
                            <Clock size={12} /> {p.date} · by {p.author}
                          </div>
                        </div>
                      </a>
                    );

                    // Insert ad unit after every 2 posts (index 1, 3, 5...)
                    if ((index + 1) % 2 === 0) {
                      acc.push(<InFeedAd key={`infeed-ad-${index}`} index={index} />);
                    }

                    return acc;
                  }, [])}
                </div>
              )}
            </div>
          </main>

          <Sidebar
            categories={categories}
            activeCategory={activeCategory}
            initialQuery={query}
          />
        </div>
      )}
    </div>
  );
}
