"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, X, ArrowLeft, LogOut, Code, Sparkles } from "lucide-react";

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "settings"

  // Post form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [blurb, setBlurb] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Settings
  const [headerCode, setHeaderCode] = useState("");
  const [headerCodeSaving, setHeaderCodeSaving] = useState(false);
  const [headerCodeLoaded, setHeaderCodeLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, settingsRes] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/settings"),
        ]);
        if (postsRes.ok) setPosts(await postsRes.json());
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setHeaderCode(s.header_code || "");
        }
        setHeaderCodeLoaded(true);
      } catch (e) {
        console.error("Failed to load data:", e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImage(data.url);
        showToast("Image uploaded successfully!");
      } else {
        const data = await res.json();
        setErr(data.error || "Failed to upload image.");
      }
    } catch (err) {
      setErr("Network error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  // --- Post Management ---
  const submitPost = async (e) => {
    e.preventDefault();
    if (!image.trim() || !prompt.trim()) {
      setErr("Image URL and prompt are required.");
      return;
    }
    setErr("");
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, prompt }),
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts((prev) => [newPost, ...prev]);
        showToast("Car post published successfully!");
        setImage(""); setPrompt("");
      } else {
        const data = await res.json();
        setErr(data.error || "Failed to publish car post.");
      }
    } catch (e) {
      setErr("Network error publishing car post.");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        showToast("Poster deleted.");
      } else {
        showToast("Failed to delete poster.");
      }
    } catch (e) {
      showToast("Network error deleting poster.");
    }
  };

  // --- Settings Management ---
  const saveHeaderCode = async () => {
    setHeaderCodeSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "header_code", value: headerCode }),
      });
      if (res.ok) {
        showToast("Header code saved! Reload the page to see it take effect.");
      } else {
        showToast("Failed to save header code.");
      }
    } catch (e) {
      showToast("Network error saving settings.");
    } finally {
      setHeaderCodeSaving(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
        Loading dashboard…
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        body { margin: 0; background: #FBF2E2; }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={styles.logoMark}><Sparkles size={16} color="#fff" /></div>
            <span style={styles.logoText}>POSTR<span style={{ color: "#E07A2E" }}>.</span></span>
            <span style={styles.badge}>Admin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <a href="/" style={styles.navLink}><ArrowLeft size={14} /> Home Feed</a>
            <button onClick={logout} style={styles.logoutBtn}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        <div style={styles.tabBarInner}>
          <button
            style={{ ...styles.tab, ...(activeTab === "posts" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("posts")}
          >
            Car Posts ({posts.length})
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === "settings" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("settings")}
          >
            <Code size={14} /> Site Settings
          </button>
        </div>
      </div>

      <div style={styles.shell}>
        {/* === POSTS TAB === */}
        {activeTab === "posts" && (
          <main style={styles.main}>
            <div style={styles.adminWarning}>
              <X size={13} /> This page is not linked anywhere publicly. Keep the URL private.
            </div>

            <h1 style={styles.h1}>Publish a new car concept</h1>
            <p style={styles.meta}>Publishes straight to the live feed. The car article content is automatically assigned from the pre-written list.</p>

            <form style={styles.form} onSubmit={submitPost}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={styles.label}>
                  Upload Car Concept Image
                  <div style={styles.dropZone}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: "none" }} 
                      id="image-file-input"
                    />
                    <label htmlFor="image-file-input" style={styles.fileLabel}>
                      {uploading ? (
                        <><Loader2 size={20} style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} /> Uploading image...</>
                      ) : (
                        "Click to choose an image file"
                      )}
                    </label>
                  </div>
                </label>

                <label style={styles.label}>
                  Or Paste Image URL
                  <input style={styles.input} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://picsum.photos/seed/yourkey/900/650" />
                </label>

                {image && (
                  <div style={styles.previewContainer}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#9a8f7a", textTransform: "uppercase" }}>Preview:</span>
                    <img src={image} alt="Upload Preview" style={styles.previewImage} />
                  </div>
                )}
              </div>

              <label style={styles.label}>
                Prompt text (the AI prompt)
                <textarea style={{ ...styles.input, resize: "vertical" }} rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Full prompt used to generate this car concept image…" />
              </label>
              {err && <p style={{ margin: 0, color: "#C24B36", fontSize: "13px", fontWeight: 500 }}>{err}</p>}
              <button style={styles.primaryBtn} type="submit" disabled={saving || uploading}>
                {saving ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Publishing…</> : <><Plus size={16} /> Publish post</>}
              </button>
            </form>

            <h3 style={styles.invHeading}>All car concepts · {posts.length}</h3>
            <div style={styles.inventory}>
              {posts.map((p) => (
                <div style={styles.invRow} key={p.id}>
                  <img src={p.image} alt={p.title} style={styles.invImg} />
                  <div style={styles.invMeta}>
                    <strong style={{ fontSize: "14px", color: "#1C2340" }}>{p.title}</strong>
                    <span style={{ fontSize: "12px", color: "#9a8f7a" }}>{p.category} · {p.date}</span>
                  </div>
                  <button style={styles.deleteBtn} onClick={() => deletePost(p.id)} title="Delete post">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* === SETTINGS TAB === */}
        {activeTab === "settings" && (
          <main style={styles.main}>
            <h1 style={styles.h1}>Site Settings</h1>
            <p style={styles.meta}>Changes take effect on the next page load after saving.</p>

            <div style={styles.settingsCard}>
              <h3 style={styles.settingsTitle}><Code size={18} style={{ color: "#E07A2E" }} /> Header Code Injection</h3>
              <p style={{ fontSize: "13.5px", color: "#9a8f7a", margin: "0 0 14px", lineHeight: "1.6" }}>
                Paste any HTML here (Google Analytics, AdSense, custom meta tags, etc.).
                This code will be injected into the <code style={{ background: "#F7E7D2", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>&lt;head&gt;</code> of every page.
              </p>
              <label style={styles.label}>
                Header Code
                <textarea
                  style={{
                    ...styles.input,
                    resize: "vertical",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12.5px",
                    lineHeight: "1.6",
                    minHeight: "160px",
                  }}
                  rows={8}
                  value={headerCode}
                  onChange={(e) => setHeaderCode(e.target.value)}
                  placeholder={`<!-- Example: Google AdSense -->\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossorigin="anonymous"></script>\n\n<!-- Example: Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>`}
                />
              </label>
              <button style={styles.primaryBtn} onClick={saveHeaderCode} disabled={headerCodeSaving || !headerCodeLoaded}>
                {headerCodeSaving ? (
                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
                ) : (
                  "Save Header Code"
                )}
              </button>
            </div>
          </main>
        )}
      </div>

      {toast && (
        <div style={styles.toast}>{toast}</div>
      )}
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#FBF2E2",
    fontFamily: "'Inter', sans-serif",
    color: "#544f45",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#9a8f7a",
    fontSize: "15px",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #ECDFC4",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoMark: {
    background: "linear-gradient(135deg, #E07A2E, #C1631E)",
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
    fontSize: "22px",
    color: "#1C2340",
  },
  badge: {
    background: "#F7E7D2",
    color: "#C1631E",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#544f45",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "7px 12px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "none",
    border: "1px solid #ECDFC4",
    color: "#C24B36",
    fontSize: "13px",
    fontWeight: "600",
    padding: "7px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tabBar: {
    background: "#fff",
    borderBottom: "1px solid #ECDFC4",
  },
  tabBarInner: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    gap: "4px",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "14px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#9a8f7a",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    color: "#E07A2E",
    borderBottomColor: "#E07A2E",
  },
  shell: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "32px 24px 80px",
  },
  main: {},
  h1: {
    fontFamily: "'Fraunces', serif",
    fontSize: "30px",
    color: "#1C2340",
    margin: "0 0 6px",
  },
  meta: {
    fontSize: "13.5px",
    color: "#9a8f7a",
    margin: "0 0 20px",
  },
  adminWarning: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#FBEAE6",
    color: "#C24B36",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "20px",
    maxWidth: "680px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    background: "#fff",
    border: "1px solid #ECDFC4",
    borderRadius: "16px",
    padding: "26px",
    marginBottom: "36px",
    maxWidth: "680px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#9a8f7a",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    background: "#FBF2E2",
    border: "1px solid #ECDFC4",
    color: "#1C2340",
    padding: "11px 13px",
    borderRadius: "9px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "400",
    textTransform: "none",
    letterSpacing: "normal",
    outline: "none",
    width: "100%",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#E07A2E",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(224,122,46,0.2)",
    alignSelf: "flex-start",
  },
  invHeading: {
    fontFamily: "'Fraunces', serif",
    fontSize: "19px",
    color: "#1C2340",
    margin: "0 0 14px",
  },
  inventory: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "680px",
  },
  invRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#fff",
    border: "1px solid #ECDFC4",
    borderRadius: "12px",
    padding: "10px 12px",
  },
  invImg: {
    width: "48px",
    height: "48px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  invMeta: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "2px",
  },
  deleteBtn: {
    background: "none",
    border: "1px solid #ECDFC4",
    color: "#C24B36",
    padding: "8px",
    borderRadius: "9px",
    cursor: "pointer",
  },
  settingsCard: {
    background: "#fff",
    border: "1px solid #ECDFC4",
    borderRadius: "16px",
    padding: "28px",
    maxWidth: "680px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  settingsTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: "20px",
    color: "#1C2340",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  toast: {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1C2340",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
    zIndex: 9999,
  },
  dropZone: {
    border: "2px dashed #ECDFC4",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    background: "#FBF2E2",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color 0.2s",
  },
  fileLabel: {
    color: "#E07A2E",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    background: "#F7E7D2",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ECDFC4",
    marginTop: "4px",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "200px",
    objectFit: "contain",
    borderRadius: "6px",
    marginInline: "auto",
  },
};
