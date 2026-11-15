"use client";

import React, { useState } from "react";
import { Section } from "@/types/menu";
import { Ribbon } from "./Ribbon";
import { MenuItem } from "./MenuItem";
import { checkAvailability } from "@/lib/time";
import { LanguageMode } from "./LanguageToggle";
import { getGroupMotif } from "./GroupMotifs";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MenuSectionProps {
  section: Section;
  lang: LanguageMode;
  isOpen?: boolean;
  onToggle?: () => void;
  defaultOpen?: boolean;
}

const COLUMN_LABELS: Record<string, { en: string; gu: string }> = {
  single: { en: "Single", gu: "સિંગલ" },
  plate: { en: "Plate", gu: "પ્લેટ" },
  oil: { en: "Oil", gu: "ઓઈલ" },
  butter: { en: "Butter", gu: "બટર" },
  half: { en: "Half", gu: "હાફ" },
  full: { en: "Full", gu: "ફુલ" },
};

export function MenuSection({
  section,
  lang,
  isOpen: controlledIsOpen,
  onToggle,
  defaultOpen = false,
}: MenuSectionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const isGu = lang === "gu";
  const sectionTitle = isGu && section.gu?.trim() ? section.gu : section.en;
  const secondaryTitle = !isGu && section.gu?.trim() ? section.gu : null;

  // Don't render hidden sections or empty sections
  if (section.hidden || !section.items || section.items.length === 0) {
    return null;
  }

  const isMultiColumn = section.columns.length > 1;
  const availStatus = checkAvailability(section.availability);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  const itemCount = section.items.length;
  const itemCountLabel = isGu
    ? `${itemCount} વાનગી${itemCount === 1 ? "" : "ઓ"}`
    : `${itemCount} item${itemCount === 1 ? "" : "s"}`;

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      className="scroll-mt-16 rounded-md border border-cream-300 bg-cream-50 overflow-hidden shadow-paper transition-all duration-200"
    >
      {/* Accordion Section Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={`section-content-${section.id}`}
        className="w-full flex items-center justify-between p-2.5 sm:p-3 cursor-pointer select-none bg-cream-100/90 hover:bg-cream-200/50 transition-colors gap-2 border-b-2 border-double border-cream-300"
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="shrink-0 text-indigo-deep opacity-80" aria-hidden="true">
            {getGroupMotif(section.group || "south-indian", 22)}
          </span>
          <Ribbon as="h2">{sectionTitle}</Ribbon>

          {/* Secondary Gujarati subtitle if in English mode */}
          {secondaryTitle && (
            <span className="font-gujarati text-xs sm:text-sm text-indigo-muted font-medium">
              {secondaryTitle}
            </span>
          )}

          {/* Item Count Badge */}
          <span className="text-[11px] font-semibold text-indigo-muted bg-cream-200 px-2 py-0.5 rounded-full border border-cream-300 shrink-0">
            {itemCountLabel}
          </span>

          {/* Availability restriction badge */}
          {availStatus.hasRestriction && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                availStatus.isAvailable
                  ? "text-indigo-muted bg-cream-200 border-cream-300"
                  : "text-ribbon-dark bg-ribbon/10 border-ribbon/30 font-bold"
              }`}
            >
              {isGu ? availStatus.badgeTextGu : availStatus.badgeTextEn}
            </span>
          )}
        </div>

        {/* Accordion Expand/Collapse Indicator */}
        <div className="flex items-center gap-1 shrink-0 pl-1 text-indigo-muted">
          <span className="text-xs font-medium hidden sm:inline text-indigo-muted">
            {isOpen ? (isGu ? "સંકોચો" : "Collapse") : (isGu ? "ખોલો" : "View")}
          </span>
          <span className="p-1 rounded-full text-indigo-deep hover:bg-cream-200 transition-colors">
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </div>
      </div>

      {/* Accordion Body Content */}
      {isOpen && (
        <div
          id={`section-content-${section.id}`}
          className="p-1 sm:p-2 animate-fadeIn"
        >
          {/* Multi-column Headers in normal flow as the first row inside section (NOT sticky) */}
          {isMultiColumn && (
            <div
              data-testid={`column-header-${section.id}`}
              className="flex items-center justify-between py-1.5 px-2 border-b border-cream-300/70 text-[11px] font-bold uppercase tracking-wider text-indigo-muted bg-cream-100/40"
            >
              <span className="flex-1 truncate">
                {isGu ? "વાનગી" : "Dish"}
              </span>
              <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0">
                {section.columns.map((col) => (
                  <span
                    key={col}
                    className="w-11 sm:w-14 text-right text-[11px] sm:text-xs font-bold uppercase tracking-wider text-indigo"
                  >
                    {COLUMN_LABELS[col]
                      ? isGu
                        ? COLUMN_LABELS[col].gu
                        : COLUMN_LABELS[col].en
                      : col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Compressed Items List (min 48px tap target height) */}
          <div className="divide-y divide-cream-200/60" data-testid={`items-list-${section.id}`}>
            {section.items.map((item) => (
              <div key={item.id} id={item.id} data-item-id={item.id}>
                <MenuItem
                  item={item}
                  columns={section.columns}
                  lang={lang}
                />
              </div>
            ))}
          </div>

          {/* Section Notes (like a printed footnote on a faint tinted strip) */}
          {section.notes && section.notes.length > 0 && (
            <div className="mt-2 py-1.5 px-2.5 rounded bg-cream-200/40 border border-cream-300/50 space-y-1">
              {section.notes.map((note, idx) => {
                const noteText = isGu && note.gu?.trim() ? note.gu : note.en;
                return (
                  <p
                    key={idx}
                    className="font-serif italic text-xs text-indigo-muted leading-relaxed"
                  >
                    <span className="text-ribbon font-bold mr-1">※</span>
                    {noteText}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
