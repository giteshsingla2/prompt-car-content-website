import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TopBanner from "@/components/TopBanner";
import { getCachedPosts } from "@/lib/dataCache";
import { Sparkles, ImagePlus, Copy, Zap, Star, Heart } from "lucide-react";

export const metadata = {
  title: "About AutoPostr. — AI Car Concept Prompt Library",
  description:
    "AutoPostr. is a curated library combining detailed car reviews with ready-to-use AI image prompts for generating stunning car designs and concepts.",
};

export default async function AboutPage() {
  let allPosts = [];
  try {
    allPosts = await getCachedPosts();
  } catch (e) {}

  const categories = [...new Set(allPosts.map((p) => p.category))];

  const features = [
    {
      icon: <Sparkles size={22} />,
      title: "Expertly Crafted Prompts",
      body:
        "Every prompt in our library is tested and refined to produce consistent, realistic, and concept-car visuals across leading AI image generators — no guesswork required.",
    },
    {
      icon: <ImagePlus size={22} />,
      title: "Popular Cars Covered",
      body:
        "From SUV heavyweights like the XUV700 to elegant sedans like the Skoda Slavia and high-tech EVs — our growing library spans the full spectrum of popular vehicle styles.",
    },
    {
      icon: <Copy size={22} />,
      title: "One Click to Copy",
      body:
        "Unlock a prompt in seconds, copy it with a single tap, and paste it straight into Midjourney, DALL·E, Stable Diffusion, Firefly, or any other generator you prefer.",
    },
    {
      icon: <Zap size={22} />,
      title: "Skip Hours of Trial & Error",
      body:
        "We obsess over the details — lighting angles, camera angles, color grading, reflection details — so you can go from idea to finished car visual in minutes.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Browse the car reviews",
      body: "Scroll the feed, filter by category (like SUVs, Sedan, EV), and read the car specifications.",
    },
    {
      num: "02",
      title: "Unlock the prompt",
      body: "Watch a short sponsored ad to reveal the full prompt — or it unlocks automatically if no ad is available.",
    },
    {
      num: "03",
      title: "Copy & generate",
      body: "Hit copy, paste the prompt into your favourite AI image tool, and get a stunning car concept in seconds.",
    },
    {
      num: "04",
      title: "Recreate concept visuals",
      body: "We add new vehicle concepts regularly, covering fresh launches, modifications, and trending concept designs.",
    },
  ];

  return (
    <div className="pf-app">
      <Header activeView="about" />
      <TopBanner />

      <div className="pf-shell">
        <main className="pf-main">
          <article className="pf-post">

            {/* Hero */}
            <div style={{
              background: "linear-gradient(135deg, var(--primary) 0%, #C1631E 100%)",
              borderRadius: "18px",
              padding: "52px 40px",
              textAlign: "center",
              marginBottom: "36px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0, opacity: 0.07,
                backgroundImage: "radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h1 style={{
                  fontFamily: "var(--display)", fontSize: "clamp(40px, 8vw, 72px)",
                  color: "#fff", margin: "0 0 12px", lineHeight: 1,
                }}>
                  AutoPostr<span style={{ opacity: 0.7 }}>.</span>
                </h1>
                <p style={{
                  color: "rgba(255,255,255,0.85)", fontSize: "17px",
                  fontWeight: "500", margin: 0, maxWidth: "420px", marginInline: "auto",
                  lineHeight: 1.55,
                }}>
                  Curated car reviews and high-quality AI car concept prompts.
                </p>
              </div>
            </div>

            {/* Mission */}
            <section style={{ marginBottom: "36px" }}>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", color: "var(--ink)", margin: "0 0 12px" }}>
                What is AutoPostr.?
              </h2>
              <p className="pf-post-blurb" style={{ lineHeight: 1.75, margin: 0 }}>
                AutoPostr. is a hand-curated library combining detailed automotive reviews with high-quality AI image prompts. 
                We believe the future of car designs is digital, and we help automotive enthusiasts, designers, and creators see the future. 
                Every prompt in our collection has been written, tested, and refined to reliably produce showroom-quality results across 
                Midjourney, DALL·E, Stable Diffusion, Adobe Firefly, and beyond.
              </p>
            </section>

            {/* Feature Cards */}
            <section style={{ marginBottom: "36px" }}>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", color: "var(--ink)", margin: "0 0 18px" }}>
                Why creators love AutoPostr.
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "14px",
              }}>
                {features.map((f) => (
                  <div key={f.title} style={{
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                    borderRadius: "14px",
                    padding: "20px",
                  }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "11px",
                      background: "var(--tag-bg)", color: "var(--primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "12px",
                    }}>
                      {f.icon}
                    </div>
                    <h3 style={{
                      fontFamily: "var(--display)", fontSize: "17px",
                      color: "var(--ink)", margin: "0 0 8px",
                    }}>
                      {f.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.65 }}>
                      {f.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* How It Works */}
            <section style={{ marginBottom: "36px" }}>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", color: "var(--ink)", margin: "0 0 18px" }}>
                How it works
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {steps.map((s) => (
                  <div key={s.num} style={{
                    display: "flex", gap: "16px", alignItems: "flex-start",
                    background: "var(--card)", border: "1px solid var(--line)",
                    borderRadius: "14px", padding: "18px 20px",
                  }}>
                    <div style={{
                      fontFamily: "var(--display)", fontSize: "28px", lineHeight: 1,
                      color: "var(--primary)", minWidth: "44px", opacity: 0.85,
                    }}>
                      {s.num}
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 5px", fontSize: "15px", fontWeight: "700", color: "var(--ink)" }}>
                        {s.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: "13.5px", color: "var(--muted)", lineHeight: 1.6 }}>
                        {s.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Compatible Tools */}
            <section style={{ marginBottom: "36px" }}>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", color: "var(--ink)", margin: "0 0 14px" }}>
                Works with any AI image generator
              </h2>
              <p className="pf-post-blurb" style={{ margin: "0 0 16px", lineHeight: 1.7 }}>
                Our prompts are written in plain English and optimised for maximum compatibility.
                No matter which tool you prefer, AutoPostr. prompts plug in and produce.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {["Midjourney", "DALL·E 3", "Stable Diffusion", "Adobe Firefly", "Ideogram", "Flux", "Leonardo AI", "Kling AI"].map((tool) => (
                  <span key={tool} style={{
                    background: "var(--tag-bg)", color: "var(--primary-dark)",
                    border: "1px solid var(--line)", borderRadius: "20px",
                    padding: "6px 14px", fontSize: "13px", fontWeight: "600",
                  }}>
                    {tool}
                  </span>
                ))}
              </div>
            </section>

            {/* Stats / Social proof */}
            <section style={{
              background: "var(--card)", border: "1px solid var(--line)",
              borderRadius: "16px", padding: "28px", marginBottom: "36px",
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "24px", textAlign: "center",
            }}>
              {[
                { val: `${allPosts.length || "50"}+`, label: "Concept prompts in library" },
                { val: `${categories.length || "4"}+`, label: "Vehicle categories" },
                { val: "Free", label: "Always free to browse" },
                { val: "Daily", label: "New reviews added" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "34px", color: "var(--primary)", marginBottom: "4px" }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </section>

            {/* CTA */}
            <section style={{ textAlign: "center", padding: "8px 0 8px" }}>
              <Heart size={18} style={{ color: "var(--primary)", marginBottom: "10px" }} />
              <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)", margin: "0 0 10px" }}>
                Ready to create?
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 20px", lineHeight: 1.6 }}>
                Browse the full library, find your visual style, and unlock a prompt in seconds.
              </p>
              <a href="/" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "var(--primary)", color: "#fff", textDecoration: "none",
                padding: "13px 28px", borderRadius: "12px", fontWeight: "700",
                fontSize: "15px", boxShadow: "0 6px 18px rgba(224,122,46,0.25)",
                transition: "all 0.2s",
              }}>
                <Sparkles size={16} />
                Explore the library
              </a>
            </section>

          </article>
        </main>

        <Sidebar categories={categories} />
      </div>
    </div>
  );
}
