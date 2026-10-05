"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "praveen-theme";
const CHANGE_EVENT = "praveen-theme-change";

/**
 * Theme state lives in the DOM, not in React.
 *
 * The inline script in the root layout writes `data-theme` on `<html>` before the
 * first paint, so the document is the source of truth. `useSyncExternalStore`
 * reads it back with a `"dark"` server snapshot, which is exactly what the server
 * rendered — no hydration mismatch, and no `setState` inside an effect.
 */
function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /**
   * React Strict Mode remounts components in development, which resets `<html>`
   * to its JSX attributes. Re-applying the stored value on mount keeps the toggle
   * in step with what the visitor actually chose.
   */
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* Storage can be blocked; the inline script already picked a sensible default. */
    }
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
      syncMeta(stored);
    }
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    syncMeta(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Storage can be blocked; the choice still applies for this page view. */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  const label = theme === "dark" ? "light" : "dark";

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      data-theme-state={theme}
      aria-label={`Switch to ${label} theme`}
      title={`Switch to ${label} theme`}
    >
      <span className="theme-toggle__icons" aria-hidden="true">
        <svg className="theme-toggle__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 1.8v2.4M12 19.8v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
        </svg>
        <svg className="theme-toggle__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a6.9 6.9 0 0 0 11.1 11.1Z" />
        </svg>
      </span>
    </button>
  );
}

/** Keeps the browser chrome colour in step with the active theme. */
function syncMeta(theme: Theme) {
  const color = theme === "light" ? "#f7f3ec" : "#0a0a0f";
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute("content", color);
  }
}