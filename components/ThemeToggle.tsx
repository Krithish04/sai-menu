"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const THEME_KEY = "shree-sai-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark") {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      } else {
        setTheme("light");
        document.documentElement.classList.remove("dark");
      }
    } catch {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage unavailable
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[44px] px-3 py-1.5 flex items-center gap-1.5 text-xs text-indigo-muted opacity-0" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to daylight mode" : "Switch to night mode"}
      className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-1.5 rounded-full bg-cream-200 hover:bg-cream-300 text-indigo font-medium text-xs border border-cream-300 transition-colors focus-visible:ring-2 focus-visible:ring-ribbon focus-visible:outline-none select-none"
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Daylight mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo" />
          <span>Night mode</span>
        </>
      )}
    </button>
  );
}
