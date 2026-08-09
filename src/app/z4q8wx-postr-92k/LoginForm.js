"use client";

import React, { useState } from "react";
import { Loader2, Lock } from "lucide-react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        window.location.reload(); // Reload so server checks cookie and shows dashboard
      } else {
        const data = await res.json();
        setError(data.error || "Authentication failed.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      fontFamily: "var(--body)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Inter:wght@400;500;600&display=swap');
        :root {
          --bg:#FBF2E2; --card:#FFFFFF; --ink:#1C2340; --text:#544f45; --muted:#9a8f7a;
          --primary:#E07A2E; --primary-dark:#C1631E; --line:#ECDFC4; --tag-bg:#F7E7D2;
          --display:'Fraunces',serif; --body:'Inter',sans-serif;
        }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "16px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 16px 48px rgba(28,35,64,0.08)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: "12px",
            boxShadow: "0 6px 16px rgba(224,122,46,0.25)",
          }}>
            <Lock size={22} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: "var(--display)", fontSize: "24px", color: "var(--ink)",
            margin: "0 0 4px",
          }}>
            POSTR<span style={{ color: "var(--primary)" }}>.</span>
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
            Admin Access Only
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
              style={{
                background: "var(--bg)", border: "1px solid var(--line)", color: "var(--ink)",
                padding: "12px 14px", borderRadius: "10px", fontSize: "14px",
                fontFamily: "var(--body)", fontWeight: "400", textTransform: "none", letterSpacing: "normal",
                outline: "none", transition: "border-color 0.2s",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
              style={{
                background: "var(--bg)", border: "1px solid var(--line)", color: "var(--ink)",
                padding: "12px 14px", borderRadius: "10px", fontSize: "14px",
                fontFamily: "var(--body)", fontWeight: "400", textTransform: "none", letterSpacing: "normal",
                outline: "none", transition: "border-color 0.2s",
              }}
            />
          </label>

          {error && (
            <p style={{ margin: 0, color: "#C24B36", fontSize: "13px", fontWeight: "500" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--primary)", color: "#fff", border: "none",
              padding: "13px 20px", borderRadius: "10px", fontWeight: "700",
              fontSize: "14.5px", cursor: loading ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(224,122,46,0.2)",
              transition: "all 0.2s",
              marginTop: "4px",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Verifying…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
