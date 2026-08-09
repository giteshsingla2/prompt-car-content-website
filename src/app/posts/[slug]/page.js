"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { ArrowLeft, Tag, Unlock, Lock, Clock, Copy, Check, PlayCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TopBanner from "@/components/TopBanner";

export default function PostDetailPage({ params }) {
  // Resolve params Promise
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  // Extract ID from the end of the slug (separated by a hyphen)
  // Slugs are formatted as clean-title-slug-[id]
  const parts = slug ? slug.split("-") : [];
  const id = parts.length > 0 ? parts[parts.length - 1] : slug;

  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Google Ad Manager state
  const [adStatus, setAdStatus] = useState("loading"); // loading, ready, visible, closed, unfilled
  const rewardedEventRef = useRef(null);
  const adUnitPath = process.env.NEXT_PUBLIC_GAM_REWARDED_AD_UNIT || "/21775744923/example/rewarded";
  const timerRef = useRef(null);

  // Toast helper
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // Helper to unlock the prompt
  const unlockPrompt = () => {
    setUnlocked(true);
    if (typeof window !== "undefined") {
      const unlockedRaw = localStorage.getItem("unlocked-ids-v2");
      let unlockedList = [];
      if (unlockedRaw) {
        try {
          unlockedList = JSON.parse(unlockedRaw);
        } catch (e) {
          unlockedList = [];
        }
      }
      if (!unlockedList.includes(id)) {
        unlockedList.push(id);
        localStorage.setItem("unlocked-ids-v2", JSON.stringify(unlockedList));
      }
    }
  };

  // Fetch post details and all posts for sidebar categories
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [postRes, allRes] = await Promise.all([
          fetch(`/api/posts/${id}`),
          fetch("/api/posts"),
        ]);

        if (postRes.ok) {
          const data = await postRes.json();
          setPost(data);
        }

        if (allRes.ok) {
          const list = await allRes.json();
          setAllPosts(list);
        }
      } catch (error) {
        console.error("Failed to load details:", error);
      }
      setLoading(false);
    };

    fetchData();

    // Check unlocked status from local storage
    if (typeof window !== "undefined") {
      const unlockedRaw = localStorage.getItem("unlocked-ids-v2");
      if (unlockedRaw) {
        try {
          const unlockedList = JSON.parse(unlockedRaw);
          if (unlockedList.includes(id)) {
            setUnlocked(true);
            setAdStatus("unlocked");
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, [id]);

  // Google Publisher Tag (GPT) Rewarded Web Ads setup
  useEffect(() => {
    if (loading || !post || unlocked || !id) return;

    window.googletag = window.googletag || { cmd: [] };
    let rewardedSlot = null;
    let didTriggerReward = false;

    googletag.cmd.push(() => {
      // 1. Define rewarded out-of-page slot
      rewardedSlot = googletag.defineOutOfPageSlot(
        adUnitPath,
        googletag.enums.OutOfPageFormat.REWARDED
      );

      if (rewardedSlot) {
        rewardedSlot.addService(googletag.pubads());

        // 2. Listen to GPT Rewarded events
        googletag.pubads().addEventListener("rewardedSlotReady", (event) => {
          console.log("GPT Rewarded slot loaded and ready.");
          rewardedEventRef.current = event;
          setAdStatus("ready");
          if (timerRef.current) clearTimeout(timerRef.current);
        });

        googletag.pubads().addEventListener("rewardedSlotGranted", (event) => {
          console.log("GPT Rewarded reward granted!");
          didTriggerReward = true;
          unlockPrompt();
          setAdStatus("unlocked");
        });

        googletag.pubads().addEventListener("rewardedSlotClosed", (event) => {
          console.log("GPT Rewarded ad closed.");
          // Clean up slot to allow reload if needed
          googletag.destroySlots([rewardedSlot]);
          setAdStatus("closed");
        });

        googletag.pubads().addEventListener("slotRenderEnded", (event) => {
          if (event.slot === rewardedSlot) {
            if (event.isEmpty) {
              console.log("GPT Rewarded slot is empty (unfilled). Auto-revealing prompt.");
              didTriggerReward = true;
              unlockPrompt();
              setAdStatus("unfilled");
              if (timerRef.current) clearTimeout(timerRef.current);
            }
          }
        });

        googletag.enableServices();
        googletag.display(rewardedSlot);
      } else {
        // Fallback if slot cannot be initialized
        console.log("Failed to define slot. Auto-revealing.");
        unlockPrompt();
        setAdStatus("unfilled");
      }
    });

    // 3. Fallback Timeout: If GAM ad script is blocked (by ad blocker) or fails to load in 3.5 seconds
    timerRef.current = setTimeout(() => {
      if (!didTriggerReward && adStatus === "loading") {
        console.log("Ad load timeout (blocker or network latency). Auto-revealing prompt.");
        unlockPrompt();
        setAdStatus("unfilled");
      }
    }, 3500);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      googletag.cmd.push(() => {
        if (rewardedSlot) {
          googletag.destroySlots([rewardedSlot]);
        }
      });
    };
  }, [loading, post, unlocked, id]);

  // GPT Banner setup above prompt card
  useEffect(() => {
    if (loading || !post) return;

    window.googletag = window.googletag || { cmd: [] };
    let bannerSlot = null;
    const bannerAdUnit = process.env.NEXT_PUBLIC_GAM_DETAIL_BANNER_AD_UNIT || "/21775744923/example/banner";

    googletag.cmd.push(() => {
      bannerSlot = googletag.defineSlot(
        bannerAdUnit,
        [[300, 600], [300, 250]],
        "div-gpt-ad-detail-banner"
      );

      if (bannerSlot) {
        bannerSlot.addService(googletag.pubads());
        googletag.display("div-gpt-ad-detail-banner");
      }
    });

    return () => {
      googletag.cmd.push(() => {
        if (bannerSlot) {
          googletag.destroySlots([bannerSlot]);
        }
      });
    };
  }, [loading, post]);

  // Click handler to open the rewarded overlay
  const handleWatchAd = () => {
    if (rewardedEventRef.current) {
      setAdStatus("visible");
      rewardedEventRef.current.makeRewardedVisible();
    } else {
      // If ad was requested but slot ready didn't fire, auto-unlock on button press
      console.log("Rewarded ad event not ready. Auto-unlocking prompt.");
      unlockPrompt();
    }
  };

  const copyPrompt = async () => {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(post.prompt);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = post.prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    showToast("Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 1800);
  };

  const categories = Array.from(new Set(allPosts.map((p) => p.category)));

  if (loading) {
    return (
      <div className="pf-app">
        <Header activeView="home" />
        <TopBanner />
        <div className="pf-loading">
          <Loader2 className="pf-spin" size={22} /> Loading details...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pf-app">
        <Header activeView="home" />
        <TopBanner />
        <div className="pf-shell">
          <main className="pf-main">
            <div className="pf-empty">
              <h2>Post Not Found</h2>
              <p>The poster you are trying to view does not exist or has been deleted.</p>
              <a className="pf-btn pf-btn-primary" href="/">
                Go back to home feed
              </a>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-app">
      <Header activeView="home" />
      <TopBanner />

      <div className="pf-shell">
        <main className="pf-main">
          <article className="pf-post">
            <a className="pf-back" href="/">
              <ArrowLeft size={15} /> Back to all reviews
            </a>

            <span className="pf-eyebrow">{post.category}</span>
            <h1 className="pf-post-title">{post.title}</h1>
            <div className="pf-post-meta">
              <Clock size={13} /> {post.date} &nbsp;·&nbsp; by {post.author}
            </div>

            {/* Render contentPart1 */}
            {post.contentPart1 ? (
              <div 
                className="pf-post-content" 
                style={{ marginBottom: "24px" }}
                dangerouslySetInnerHTML={{ __html: post.contentPart1 }} 
              />
            ) : (
              <p className="pf-post-blurb">{post.blurb}</p>
            )}

            {/* Prompt Box Section (Image + Prompt Card) */}
            <div className="pf-prompt-section" style={{ margin: "32px 0" }}>
              <div className="pf-post-img" style={{ marginBottom: "16px" }}>
                <img src={post.image} alt={post.title} />
              </div>

              <p className="pf-post-blurb" style={{ fontStyle: "italic", fontSize: "14px", color: "var(--accent)" }}>
                Want to generate a similar concept image? The full AI image prompt used to create the car visual above is detailed below. Unlock it to copy and use it in your favorite generator.
              </p>

              {/* Above-prompt responsive ad banner */}
              <div className="pf-ad-detail-wrapper">
                <div id="div-gpt-ad-detail-banner" />
              </div>

              <div className="pf-prompt-card">
                {unlocked ? (
                  // Unlocked View
                  <div className="pf-reveal-card" style={{ maxWidth: "100%", margin: "0" }}>
                    <div className="pf-reveal-head">
                      <span className="pf-tag pf-tag-open"><Unlock size={12} /> Unlocked</span>
                      <span>Your Prompt</span>
                    </div>
                    <pre className="pf-prompt-text">{post.prompt}</pre>
                    <button className="pf-btn pf-btn-primary" onClick={copyPrompt}>
                      {copied ? (
                        <>
                          <Check size={16} /> Copied to clipboard
                        </>
                      ) : (
                        <>
                          <Copy size={16} /> Copy prompt
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  // Locked View
                  <>
                    <div className="pf-prompt-card-head">
                      <span className="pf-tag pf-tag-locked"><Lock size={12} /> Locked</span>
                      <span>Prompt hidden</span>
                    </div>
                    <p className="pf-prompt-blur">
                      Ultra detailed, ready-to-paste prompt for this exact car concept — camera details, style
                      and lighting all spelled out.
                    </p>
                    
                    {adStatus === "loading" ? (
                      <button className="pf-btn pf-btn-primary" disabled>
                        <Loader2 className="pf-spin" size={16} /> Loading ad sponsor…
                      </button>
                    ) : (
                      <button className="pf-btn pf-btn-primary" onClick={handleWatchAd}>
                        <PlayCircle size={16} /> Watch ad to unlock prompt
                      </button>
                    )}
                    {adStatus === "unfilled" && (
                      <p style={{ fontSize: "12px", color: "var(--accent)", marginTop: "10px", fontStyle: "italic" }}>
                        Sponsor unavailable. The prompt was automatically unlocked for you.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Render contentPart2 */}
            {post.contentPart2 ? (
              <div 
                className="pf-post-content" 
                style={{ marginTop: "24px" }}
                dangerouslySetInnerHTML={{ __html: post.contentPart2 }} 
              />
            ) : (
              post.content && !post.contentPart1 && (
                <div 
                  className="pf-post-content" 
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
              )
            )}
          </article>
        </main>

        <Sidebar categories={categories} />
      </div>

      {toast && <div className="pf-toast">{toast}</div>}
    </div>
  );
}
