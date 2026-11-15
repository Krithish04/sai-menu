"use client";

import React from "react";

export type LanguageMode = "en" | "gu" | "both";

interface LanguageToggleProps {
  currentLang: LanguageMode;
  onToggle: (lang: LanguageMode) => void;
}

export function LanguageToggle({ currentLang, onToggle }: LanguageToggleProps) {
  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center p-0.5 rounded-full bg-cream-200 border border-cream-300 select-none"
    >
      <button
        type="button"
        onClick={() => onToggle("en")}
        aria-pressed={currentLang === "en"}
        className={`min-h-[38px] px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-ribbon focus-visible:outline-none ${
          currentLang === "en"
            ? "bg-indigo text-cream-50 font-bold"
            : "text-indigo hover:text-indigo-deep"
        }`}
      >
        English
      </button>

      <button
        type="button"
        onClick={() => onToggle("gu")}
        aria-pressed={currentLang === "gu"}
        className={`min-h-[38px] px-2.5 py-1 rounded-full text-xs font-semibold font-gujarati tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-ribbon focus-visible:outline-none ${
          currentLang === "gu"
            ? "bg-ribbon text-white font-bold"
            : "text-indigo hover:text-indigo-deep"
        }`}
      >
        ગુજરાતી
      </button>

      <button
        type="button"
        onClick={() => onToggle("both")}
        aria-pressed={currentLang === "both"}
        className={`min-h-[38px] px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-ribbon focus-visible:outline-none ${
          currentLang === "both"
            ? "bg-indigo-deep text-cream-50 font-bold"
            : "text-indigo hover:text-indigo-deep"
        }`}
      >
        Both
      </button>
    </div>
  );
}
