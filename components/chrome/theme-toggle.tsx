"use client";

// Client Component (M8). No state, no Context — the click handler mutates
// the data-theme attribute on <html> directly and persists the choice, the
// same DOM-attribute coordination pattern used everywhere else on the site
// (ADR-011). Which of the two labels below is visible is decided entirely
// by CSS keyed to that attribute (see .theme-label-* in globals.css), so
// there is nothing here for React to get right or wrong on first render.
export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing / storage disabled: theme still applies for this
      // page view, it just won't persist across a reload.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle colour theme"
      className="font-mono text-meta text-ink/70 uppercase tracking-[0.1em] hover:text-accent"
    >
      <span className="theme-label-light">Dark</span>
      <span className="theme-label-dark">Light</span>
    </button>
  );
}
