"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MenuData, Section, Item } from "@/types/menu";
import { MENU_GROUPS, MenuGroup, getDefaultGroupForSection } from "@/lib/groups";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MenuSection } from "./MenuSection";
import { LanguageToggle, LanguageMode } from "./LanguageToggle";
import { MenuSearch } from "./MenuSearch";
import { getGroupTabIcon } from "./GroupTabIcons";
import { ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface MenuClientContainerProps {
  initialMenu: MenuData;
  tableNumber?: string | null;
}

const STORAGE_KEY = "shree-sai-lang";

export function MenuClientContainer({
  initialMenu,
  tableNumber: propTableNumber,
}: MenuClientContainerProps) {
  const searchParams = useSearchParams();
  const tableNumber = propTableNumber ?? searchParams.get("t");
  const [lang, setLang] = useState<LanguageMode>("en");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("south-indian");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  const groupTabsNavRef = useRef<HTMLElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});

  // 1. Language detection & storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageMode | null;
    if (saved === "en" || saved === "gu" || saved === "both") {
      setLang(saved);
      document.documentElement.lang = saved === "gu" ? "gu" : "en";
      return;
    }

    if (
      typeof navigator !== "undefined" &&
      navigator.language?.toLowerCase().startsWith("gu")
    ) {
      setLang("gu");
      document.documentElement.lang = "gu";
    } else {
      setLang("en");
      document.documentElement.lang = "en";
    }
  }, []);

  const handleLanguageChange = (newLang: LanguageMode) => {
    setLang(newLang);
    document.documentElement.lang = newLang === "gu" ? "gu" : "en";
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Storage unavailable
    }
  };

  const isGu = lang === "gu";
  const uiLang: "en" | "gu" = lang === "gu" ? "gu" : "en";

  // Filter sections that are not hidden, have items, and assign groups
  const allSections = useMemo(
    () =>
      initialMenu.sections
        .filter((sec) => !sec.hidden && sec.items && sec.items.length > 0)
        .map((sec) => ({
          ...sec,
          group: sec.group || getDefaultGroupForSection(sec.id),
        })),
    [initialMenu]
  );

  // Active groups that actually contain visible sections
  const activeGroups = useMemo(
    () =>
      MENU_GROUPS.filter((group) =>
        allSections.some((sec) => sec.group === group.id)
      ),
    [allSections]
  );

  const currentGroupIndex = activeGroups.findIndex((g) => g.id === selectedGroupId);
  const prevGroup = currentGroupIndex > 0 ? activeGroups[currentGroupIndex - 1] : null;
  const nextGroup =
    currentGroupIndex !== -1 && currentGroupIndex < activeGroups.length - 1
      ? activeGroups[currentGroupIndex + 1]
      : null;

  // Listen to URL hash to support direct linking and back-button group navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash && activeGroups.some((g) => g.id === hash)) {
        setSelectedGroupId(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [activeGroups]);

  // Auto-scroll active group tab into view smoothly
  useEffect(() => {
    if (!groupTabsNavRef.current) return;
    const activeTab = groupTabsNavRef.current.querySelector(
      `[data-group-id="${selectedGroupId}"]`
    ) as HTMLElement | null;

    if (activeTab) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      activeTab.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedGroupId]);

  // Back to top scroll listener (shows after 600px of scroll)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setShowBackToTop(window.scrollY > 600);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  // Sections in the currently selected group
  const displayedSections = useMemo(
    () =>
      allSections.filter(
        (sec) => (sec.group || "south-indian") === selectedGroupId
      ),
    [allSections, selectedGroupId]
  );

  // Featured Sai Special items in this group
  const featuredInCurrentGroup = useMemo(() => {
    const result: { item: Item; section: Section }[] = [];
    for (const sec of displayedSections) {
      for (const it of sec.items) {
        if (it.featured) {
          result.push({ item: it, section: sec });
        }
      }
    }
    return result;
  }, [displayedSections]);

  // Default open state: first section of group is open, others collapsed
  useEffect(() => {
    if (displayedSections.length > 0) {
      setOpenSections((prev) => {
        const updated: Record<string, boolean> = { ...prev };
        displayedSections.forEach((sec, idx) => {
          if (updated[sec.id] === undefined) {
            updated[sec.id] = idx === 0;
          }
        });
        return updated;
      });
    }
  }, [displayedSections]);

  // Check if all displayed sections are currently expanded
  const areAllOpen = useMemo(() => {
    if (displayedSections.length === 0) return false;
    return displayedSections.every((s, idx) => openSections[s.id] ?? (idx === 0));
  }, [displayedSections, openSections]);

  const handleToggleAll = () => {
    const nextState = !areAllOpen;
    setOpenSections((prev) => {
      const updated = { ...prev };
      displayedSections.forEach((sec) => {
        updated[sec.id] = nextState;
      });
      return updated;
    });
  };

  // Accordion toggle: opening one closes others (unless all were expanded), and scrolls to header
  const handleToggleSection = (sectionId: string) => {
    const isCurrentlyOpen =
      openSections[sectionId] ?? (sectionId === displayedSections[0]?.id);

    if (!isCurrentlyOpen) {
      // Opening section: close others in accordion fashion
      setOpenSections({ [sectionId]: true });

      // Smooth scroll to section just below sticky top bar (56px)
      requestAnimationFrame(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const headerOffset = 64;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
          });
        }
      });
    } else {
      // Closing section
      setOpenSections((prev) => ({
        ...prev,
        [sectionId]: false,
      }));
    }
  };

  // Handle group switching with URL hash sync
  const handleGroupSelect = useCallback(
    (groupId: string) => {
      if (groupId === selectedGroupId) return;

      if (typeof window !== "undefined") {
        scrollPositions.current[selectedGroupId] = window.scrollY;
        if (window.location.hash !== `#${groupId}`) {
          window.history.pushState(null, "", `#${groupId}`);
        }
      }

      setSelectedGroupId(groupId);

      // Reset accordion state for new group: first section open
      const firstSection = allSections.find(
        (s) => (s.group || "south-indian") === groupId
      );
      if (firstSection) {
        setOpenSections({ [firstSection.id]: true });
      }

      // Scroll to start of menu
      requestAnimationFrame(() => {
        const menuEl = document.getElementById("main-menu");
        if (menuEl) {
          const headerOffset = 64;
          const elementPosition = menuEl.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "instant",
          });
        }
      });
    },
    [selectedGroupId, allSections]
  );

  // When a search result is clicked: close search, select group, open section, scroll to item & highlight
  const handleSelectSearchResult = (item: Item, section: Section) => {
    setIsSearchOpen(false);
    const targetGroup = section.group || getDefaultGroupForSection(section.id);
    setSelectedGroupId(targetGroup);
    setOpenSections({ [section.id]: true });

    setTimeout(() => {
      const itemEl = document.getElementById(item.id);
      if (itemEl) {
        itemEl.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "center",
        });
        itemEl.classList.add("highlight-item");
        setTimeout(() => {
          itemEl.classList.remove("highlight-item");
        }, 1800);
      }
    }, 250);
  };

  return (
    <div className="min-h-dvh flex flex-col justify-between w-full max-w-xl min-[1100px]:max-w-[1200px] mx-auto shadow-paper-lift bg-cream-100 border-x border-cream-300">
      {/* Accessible Skip Link */}
      <a
        href="#main-menu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo focus:text-white focus:rounded focus:ring-2 focus:ring-ribbon font-semibold text-xs"
      >
        {isGu ? "મુખ્ય મેનુ પર જાઓ" : "Skip to main menu"}
      </a>

      {/* ONE Compact Sticky Bar (~56px high) */}
      <header className="sticky top-0 z-40 w-full h-14 bg-cream-100 border-b border-cream-300 px-2 sm:px-4 flex items-center justify-between gap-2 shadow-xs">
        {/* Left: Compact Search Icon Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label={isGu ? "વાનગી શોધો" : "Search dishes"}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-full text-xs font-semibold bg-cream-50 hover:bg-cream-200 text-indigo border border-cream-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ribbon shrink-0 select-none"
        >
          <Search className="w-4 h-4 text-indigo" />
          <span className="hidden xs:inline sm:inline">
            {isGu ? "શોધો" : "Search"}
          </span>
        </button>

        {/* Middle: Horizontally scrolling group tabs with fade on right edge */}
        <div className="flex-1 min-w-0 h-full flex items-center relative overflow-hidden">
          <nav
            ref={groupTabsNavRef}
            aria-label={isGu ? "વાનગી શ્રેણીઓ" : "Menu Categories"}
            className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 fade-right-edge pr-3"
          >
            {activeGroups.map((group: MenuGroup) => {
              const isActive = group.id === selectedGroupId;
              const groupSections = allSections.filter(
                (sec) => (sec.group || "south-indian") === group.id
              );
              const itemCount = groupSections.reduce(
                (acc, sec) => acc + (sec.items?.length || 0),
                0
              );

              return (
                <button
                  key={group.id}
                  data-group-id={group.id}
                  type="button"
                  onClick={() => handleGroupSelect(group.id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ribbon select-none ${
                    isActive
                      ? "bg-indigo-deep text-cream-50 font-bold border border-indigo-deep shadow-none"
                      : "bg-cream-50 hover:bg-cream-200 text-indigo font-medium border border-cream-300 shadow-none"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="shrink-0">
                    {getGroupTabIcon(group.id, "w-4 h-4")}
                  </span>
                  <span className={isGu ? "font-gujarati" : "font-sans"}>
                    {isGu ? group.gu : group.en}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                      isActive
                        ? "bg-ribbon text-white"
                        : "bg-cream-200 text-indigo-muted"
                    }`}
                  >
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Language Toggle */}
        <div className="flex-none shrink-0 flex items-center">
          <LanguageToggle currentLang={lang} onToggle={handleLanguageChange} />
        </div>
      </header>

      {/* Full-width Search Bar Overlay Component */}
      <MenuSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allSections={allSections}
        lang={lang}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Menu Cover Header (under 220px tall on phones) */}
      <Header
        restaurant={initialMenu.restaurant}
        lang={uiLang}
        tableNumber={tableNumber}
      />

      {/* Main Content Layout (Desktop: Left rail at >=1100px) */}
      <div className="flex-1 flex w-full min-w-0">
        {/* Desktop Left Rail (screens >= 1100px) */}
        <aside className="hidden min-[1100px]:block w-64 shrink-0 p-4 border-r border-cream-300 bg-cream-50/60 sticky top-14 self-start max-h-[calc(100dvh-56px)] overflow-y-auto no-scrollbar">
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-indigo-muted mb-3 px-2">
            {isGu ? "વાનગી શ્રેણીઓ" : "Menu Categories"}
          </h3>
          <nav className="space-y-1">
            {activeGroups.map((group) => {
              const isActive = group.id === selectedGroupId;
              const groupSections = allSections.filter(
                (sec) => (sec.group || "south-indian") === group.id
              );
              const itemCount = groupSections.reduce(
                (acc, sec) => acc + (sec.items?.length || 0),
                0
              );

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleGroupSelect(group.id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-deep text-cream-50 font-bold"
                      : "text-indigo hover:bg-cream-200 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getGroupTabIcon(group.id, "w-4 h-4 shrink-0")}
                    <span className="truncate">
                      {isGu ? group.gu : group.en}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-2 ${
                      isActive
                        ? "bg-ribbon text-white"
                        : "bg-cream-200 text-indigo-muted"
                    }`}
                  >
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Menu Sections Main Area */}
        <main
          id="main-menu"
          className="flex-1 px-3 sm:px-5 lg:px-6 py-4 w-full min-w-0"
        >
          {/* Sai Special / Popular Highlights Shelf */}
          {featuredInCurrentGroup.length > 0 && (
            <div className="mb-4 p-3 rounded-md border border-[#D9A441]/50 bg-[#FBF6EA] shadow-2xs">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[#D9A441] text-sm font-bold">★</span>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-indigo-deep">
                  {isGu ? "સાંઈ સ્પેશિયલ વાનગીઓ" : "Sai Special Highlights"}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {featuredInCurrentGroup.map(({ item, section }) => {
                  const primaryPrice =
                    item.price.price ??
                    item.price.butter ??
                    item.price.full ??
                    item.price.single;
                  return (
                    <div
                      key={`shelf-${item.id}`}
                      className="flex items-center justify-between p-2 rounded bg-cream-100 border border-cream-300 shadow-2xs hover:bg-cream-200/50 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-xs sm:text-sm text-indigo-deep truncate block">
                          {isGu && item.gu ? item.gu : item.en}
                        </span>
                        <span className="text-[10px] text-indigo-muted truncate block">
                          {isGu && section.gu ? section.gu : section.en}
                        </span>
                      </div>
                      {primaryPrice !== undefined && (
                        <span className="tabular-nums font-bold text-sm text-ribbon shrink-0">
                          ₹{primaryPrice}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expand all / Collapse all Control (when multiple sections exist) */}
          {displayedSections.length > 1 && (
            <div className="flex items-center justify-between px-1 mb-3 pb-1 border-b border-cream-300/60">
              <span className="text-xs font-semibold text-indigo-muted">
                {isGu
                  ? `${displayedSections.length} વિભાગો`
                  : `${displayedSections.length} sections in this category`}
              </span>
              <button
                type="button"
                onClick={handleToggleAll}
                className="text-xs font-semibold text-ribbon hover:text-ribbon-dark hover:underline flex items-center gap-1 transition-colors min-h-[36px] px-2.5 py-1 rounded bg-cream-200/60 border border-cream-300/50"
              >
                <span>
                  {areAllOpen
                    ? (isGu ? "બધા સંકોચો" : "Collapse all")
                    : (isGu ? "બધા ખોલો" : "Expand all")}
                </span>
              </button>
            </div>
          )}

          {/* Responsive Column Grid: 1 col on phones (<640px), 2 cols on tablets (≥640px), 3 cols on desktop (≥1100px) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 min-[1100px]:grid-cols-3 gap-3.5 items-start">
            {displayedSections.map((section, idx) => {
              const isOpen = openSections[section.id] ?? (idx === 0);
              return (
                <MenuSection
                  key={section.id}
                  section={section}
                  lang={lang}
                  isOpen={isOpen}
                  onToggle={() => handleToggleSection(section.id)}
                />
              );
            })}
          </div>

          {/* Group Navigation Bar at Bottom */}
          <div className="mt-8 pt-4 border-t border-cream-300 flex items-center justify-between gap-2">
            {prevGroup ? (
              <button
                type="button"
                onClick={() => handleGroupSelect(prevGroup.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-cream-200 text-indigo hover:bg-cream-300 text-xs sm:text-sm font-semibold transition-colors border border-cream-300 min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4 text-ribbon" />
                <span className="truncate">
                  {isGu ? prevGroup.gu : prevGroup.en}
                </span>
              </button>
            ) : (
              <div />
            )}

            {nextGroup && (
              <button
                type="button"
                onClick={() => handleGroupSelect(nextGroup.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-indigo text-cream-50 hover:bg-indigo-deep text-xs sm:text-sm font-semibold transition-colors ml-auto shadow-xs min-h-[44px]"
              >
                <span className="truncate">
                  {isGu ? nextGroup.gu : nextGroup.en}
                </span>
                <ChevronRight className="w-4 h-4 text-cream-100" />
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Floating "Back to Top" Button (appears after 600px of scroll) */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label={isGu ? "ઉપર જાઓ" : "Back to top"}
          className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-indigo-deep text-cream-50 hover:bg-indigo shadow-paper border border-cream-300 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center animate-fadeIn select-none"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer (includes Daylight / Night mode toggle) */}
      <Footer restaurant={initialMenu.restaurant} lang={uiLang} />
    </div>
  );
}
