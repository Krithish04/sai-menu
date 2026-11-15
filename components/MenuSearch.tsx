"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Item, Section } from "@/types/menu";
import { LanguageMode } from "./LanguageToggle";
import { ArrowLeft, Search, X } from "lucide-react";

interface MenuSearchProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  allSections: Section[];
  lang: LanguageMode;
  onSelectResult: (item: Item, section: Section) => void;
}

const EXAMPLE_SEARCHES = ["Dosa", "Pizza", "Noodles", "Paneer"];

function normalize(str: string): string {
  return str.toLowerCase().replace(/[\s\.\-_'’]/g, "");
}

function matchesQuery(target: string, query: string): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return true;
  const normT = normalize(t);
  const normQ = normalize(q);
  return normT.length > 0 && normQ.length > 0 && normT.includes(normQ);
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);

  if (idx !== -1) {
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <mark className="bg-[#D9A441]/40 text-indigo-deep font-bold rounded-xs px-0.5">
          {match}
        </mark>
        {after}
      </>
    );
  }

  // If normalized match exists but contains spaces, show clean text
  return text;
}

export function MenuSearch({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  allSections,
  lang,
  onSelectResult,
}: MenuSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isGu = lang === "gu";

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Group search results by section
  const searchResultsBySection = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];

    const grouped: { section: Section; items: Item[] }[] = [];

    for (const section of allSections) {
      if (section.hidden) continue;
      const sectionMatch =
        matchesQuery(section.en, q) || matchesQuery(section.gu, q);

      const matchingItems = section.items.filter((item) => {
        return (
          matchesQuery(item.en, q) ||
          matchesQuery(item.gu, q) ||
          sectionMatch
        );
      });

      if (matchingItems.length > 0) {
        grouped.push({
          section,
          items: matchingItems,
        });
      }
    }

    return grouped;
  }, [allSections, searchQuery]);

  const totalMatches = useMemo(
    () =>
      searchResultsBySection.reduce(
        (sum, group) => sum + group.items.length,
        0
      ),
    [searchResultsBySection]
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isGu ? "વાનગી શોધો" : "Search dishes"}
      className="fixed inset-0 z-50 flex flex-col bg-cream-100 overflow-hidden"
    >
      {/* Full-width Search Bar (Sticky Top) */}
      <div className="w-full h-16 min-h-[56px] px-3 sm:px-4 flex items-center gap-2 bg-cream-100 border-b border-cream-300 shadow-xs shrink-0">
        {/* Back Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={isGu ? "પાછા જાઓ" : "Go back"}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full text-indigo-deep hover:bg-cream-200 transition-colors focus-visible:ring-2 focus-visible:ring-ribbon focus-visible:outline-none shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Input Field with Magnifier and Clear Button */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-indigo-muted pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isGu ? "વાનગી શોધો / Search dishes" : "Search dishes / વાનગી શોધો"}
            className="w-full h-12 min-h-[48px] pl-11 pr-11 text-base text-[16px] font-medium bg-cream-50 border border-cream-300 rounded-full text-indigo-deep placeholder:text-indigo-muted/60 focus:outline-none focus:ring-2 focus:ring-ribbon transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                inputRef.current?.focus();
              }}
              aria-label={isGu ? "સાફ કરો" : "Clear search"}
              className="absolute right-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-indigo-muted hover:text-indigo-deep transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Content Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl w-full mx-auto">
        {/* Empty input state: 4 example search chips */}
        {!searchQuery.trim() && (
          <div className="py-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-muted mb-3">
              {isGu ? "લોકપ્રિય વાનગીઓ:" : "Popular searches:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SEARCHES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => onSearchChange(example)}
                  className="min-h-[44px] px-4 py-2 rounded-full bg-cream-50 hover:bg-cream-200 text-indigo-deep text-sm font-semibold border border-cream-300 transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-ribbon focus-visible:outline-none"
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-md border border-cream-300 bg-cream-50 text-center">
              <p className="font-serif text-sm font-semibold text-indigo-deep">
                {isGu
                  ? "વાનગી અથવા કેટેગરીનું નામ લખીને શોધો"
                  : "Type any dish or category name to search"}
              </p>
              <p className="text-xs text-indigo-muted mt-1">
                {isGu
                  ? "અંગ્રેજી અથવા ગુજરાતી બંનેમાં શોધી શકો છો"
                  : "Works seamlessly in English and Gujarati"}
              </p>
            </div>
          </div>
        )}

        {/* Results Found */}
        {searchQuery.trim() && totalMatches > 0 && (
          <div className="space-y-6">
            <p className="text-xs font-semibold text-indigo-muted">
              {isGu
                ? `મળી આવેલી વાનગીઓ (${totalMatches}):`
                : `Found ${totalMatches} dish${totalMatches === 1 ? "" : "es"}:`}
            </p>

            {searchResultsBySection.map(({ section, items }) => {
              const sectionTitle =
                isGu && section.gu?.trim() ? section.gu : section.en;

              return (
                <div
                  key={section.id}
                  className="rounded-md border border-cream-300 bg-cream-50 overflow-hidden shadow-paper"
                >
                  {/* Category Header */}
                  <div className="px-3 py-2 bg-cream-100 border-b border-cream-300 flex items-center justify-between">
                    <span className="font-serif font-bold text-xs uppercase tracking-wider text-ribbon">
                      {sectionTitle}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-muted">
                      {items.length} {items.length === 1 ? "dish" : "dishes"}
                    </span>
                  </div>

                  {/* List of items */}
                  <div className="divide-y divide-cream-200/60">
                    {items.map((item) => {
                      const primaryPrice =
                        item.price.price ??
                        item.price.full ??
                        item.price.plate ??
                        item.price.butter ??
                        item.price.single;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectResult(item, section)}
                          className="w-full text-left flex items-center justify-between min-h-[48px] px-3 py-2.5 hover:bg-cream-200/60 active:bg-cream-200 transition-colors gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[16px] text-indigo-deep font-semibold ${
                                  isGu ? "font-gujarati" : "font-sans"
                                }`}
                              >
                                {highlightMatch(
                                  isGu && item.gu?.trim() ? item.gu : item.en,
                                  searchQuery
                                )}
                              </span>

                              {/* Secondary name if available */}
                              {isGu && item.en && (
                                <span className="text-xs text-indigo-muted">
                                  ({highlightMatch(item.en, searchQuery)})
                                </span>
                              )}
                              {!isGu && item.gu && (
                                <span className="font-gujarati text-xs text-indigo-muted">
                                  ({item.gu})
                                </span>
                              )}

                              {item.featured && (
                                <span className="text-[#D9A441] text-xs font-bold">
                                  ★
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-indigo-muted/80 block mt-0.5">
                              {sectionTitle}
                            </span>
                          </div>

                          {/* Prices aligned right */}
                          {primaryPrice !== undefined && (
                            <div className="tabular-nums font-bold text-sm sm:text-base text-indigo-deep shrink-0">
                              ₹{primaryPrice}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Friendly Empty Search State */}
        {searchQuery.trim() && totalMatches === 0 && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cream-200 flex items-center justify-center text-indigo-muted">
              <Search className="w-6 h-6 opacity-60" />
            </div>
            <p className="font-serif text-lg font-bold text-indigo-deep">
              {isGu
                ? "કોઈ વાનગી મળી નથી. બીજો શબ્દ શોધો"
                : "No dish found. Try another word"}
            </p>
            <p className="text-xs text-indigo-muted mt-1.5 max-w-xs mx-auto">
              {isGu
                ? `"${searchQuery}" માટે કોઈ પરિણામ મળ્યું નથી. કૃપા કરીને સ્પેલિંગ તપાસો અથવા લોકપ્રિય વાનગીઓ અજમાવો.`
                : `We couldn't find any dish matching "${searchQuery}". Check the spelling or try searching for another dish.`}
            </p>

            {/* Quick Suggestions */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {EXAMPLE_SEARCHES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => onSearchChange(example)}
                  className="min-h-[44px] px-3.5 py-1.5 rounded-full bg-cream-50 hover:bg-cream-200 text-indigo font-medium text-xs border border-cream-300 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="min-h-[44px] px-4 py-2 rounded-md bg-indigo text-cream-50 hover:bg-indigo-deep text-xs font-semibold transition-colors"
              >
                {isGu ? "શોધ સાફ કરો" : "Clear search"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
