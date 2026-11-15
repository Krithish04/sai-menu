"use client";

import React, { useRef, useEffect } from "react";

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CloseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

interface SearchBoxProps {
  lang: "en" | "gu";
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
}

export function SearchBox({
  lang,
  searchQuery,
  onSearchChange,
  isOpen,
  onToggleOpen,
}: SearchBoxProps) {
  const isGu = lang === "gu";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClear = () => {
    onSearchChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClose = () => {
    onSearchChange("");
    onToggleOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => onToggleOpen(true)}
        aria-label={isGu ? "મેનુ શોધો" : "Search menu"}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-cream-50 hover:bg-cream-200 text-indigo border border-cream-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ribbon select-none"
      >
        <SearchIcon className="w-4 h-4 text-indigo" />
        <span>{isGu ? "શોધો" : "Search"}</span>
      </button>
    );
  }

  return (
    <div className="w-full flex items-center gap-2 animate-in fade-in duration-150">
      <div className="relative flex-1 flex items-center">
        <SearchIcon className="absolute left-3.5 w-4 h-4 text-indigo-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            isGu ? "વાનગી અથવા કેટેગરી શોધો..." : "Search dishes or categories..."
          }
          className="w-full min-h-[44px] pl-10 pr-10 py-2 text-xs sm:text-sm bg-cream-50 border border-cream-300 rounded-full text-indigo-deep placeholder:text-indigo-muted/60 focus:outline-none focus:ring-2 focus:ring-ribbon focus:border-ribbon transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={isGu ? "સાફ કરો" : "Clear search"}
            className="absolute right-2 p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-indigo-muted hover:text-indigo transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleClose}
        aria-label={isGu ? "બંધ કરો" : "Close search"}
        className="shrink-0 min-h-[44px] px-3.5 py-1 text-xs font-semibold text-indigo-muted hover:text-indigo transition-colors focus-visible:ring-2 focus-visible:ring-ribbon focus-visible:outline-none"
      >
        {isGu ? "રદ કરો" : "Cancel"}
      </button>
    </div>
  );
}
