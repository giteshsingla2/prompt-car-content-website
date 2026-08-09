import { Sparkles } from "lucide-react";

export default function Header({ activeView }) {
  return (
    <header className="pf-header">
      <div className="pf-header-inner">
        <a className="pf-logo" href="/">
          <span className="pf-logo-mark"><Sparkles size={16} /></span>
          POSTR<span className="pf-logo-dot">.</span>
        </a>
        <nav className="pf-nav">
          <a
            className={"pf-nav-link" + (activeView === "home" ? " is-active" : "")}
            href="/"
          >
            All Reviews
          </a>
          <a
            className={"pf-nav-link" + (activeView === "about" ? " is-active" : "")}
            href="/about"
          >
            About Us
          </a>
        </nav>
      </div>
    </header>
  );
}
