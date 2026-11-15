import React from "react";
import { Item, Section } from "@/types/menu";
import { LanguageMode } from "./LanguageToggle";

interface MenuItemProps {
  item: Item;
  columns: Section["columns"];
  lang: LanguageMode;
}

export function MenuItem({ item, columns, lang }: MenuItemProps) {
  const isGu = lang === "gu";
  const isBoth = lang === "both";

  const primaryName = isGu && item.gu?.trim() ? item.gu : item.en;
  const secondaryName = isBoth && item.gu?.trim() ? item.gu : null;

  const isSoldOut = Boolean(item.soldOut);

  const colList = columns as readonly string[];
  const hasColumn = (col: string) => colList.includes(col);

  // Helper to render price cell in fixed-width tabular column
  const renderPriceCell = (priceValue: number | undefined) => {
    if (priceValue === undefined || priceValue === null) {
      return (
        <span className="w-11 sm:w-14 text-right text-indigo-muted/30 font-mono text-sm select-none">
          —
        </span>
      );
    }

    return (
      <span
        className={`w-11 sm:w-14 text-right tabular-nums font-semibold text-sm sm:text-base text-indigo-deep tracking-tight ${
          isSoldOut ? "line-through text-indigo-muted/50" : ""
        }`}
      >
        {priceValue}
      </span>
    );
  };

  return (
    <div
      className={`group flex items-center justify-between min-h-[48px] py-1.5 px-1.5 sm:px-2 rounded hover:bg-cream-200/50 active:bg-cream-200 transition-colors gap-2 ${
        isSoldOut ? "opacity-60" : ""
      }`}
    >
      {/* Item Name Container (wraps cleanly to second line without pushing prices) */}
      <div className="flex flex-col justify-center flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`leading-snug text-indigo-deep break-words ${
              item.featured ? "font-bold" : "font-medium"
            } ${isSoldOut ? "line-through" : ""} ${
              isGu ? "font-gujarati text-[17px]" : "font-sans text-[16px]"
            }`}
          >
            {primaryName}
          </span>

          {/* Sai Special: small marigold star and nothing more */}
          {item.featured && (
            <span
              className="text-[#D9A441] text-xs font-bold shrink-0 select-none"
              title={isGu ? "સાંઈ સ્પેશિયલ" : "Sai Special"}
              aria-label={isGu ? "સાંઈ સ્પેશિયલ" : "Sai Special"}
            >
              ★
            </span>
          )}

          {isSoldOut && (
            <span className="shrink-0 text-[10px] tracking-wider uppercase font-bold text-ribbon-dark bg-ribbon/10 border border-ribbon/30 px-1 py-0.2 rounded">
              {isGu ? "આજે નથી" : "Not today"}
            </span>
          )}
        </div>

        {/* Small second line only when mode is Both */}
        {secondaryName && (
          <span className="font-gujarati text-xs text-indigo-muted/80 leading-tight pt-0.5 truncate">
            {secondaryName}
          </span>
        )}
      </div>

      {/* Dotted Leader */}
      <span className="dotted-leader" aria-hidden="true" />

      {/* Fixed-width price columns for alignment across the whole section */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0">
        {hasColumn("single") && renderPriceCell(item.price.single)}
        {hasColumn("plate") && renderPriceCell(item.price.plate)}
        {hasColumn("oil") && renderPriceCell(item.price.oil)}
        {hasColumn("butter") && renderPriceCell(item.price.butter)}
        {hasColumn("half") && renderPriceCell(item.price.half)}
        {hasColumn("full") && renderPriceCell(item.price.full)}
        {hasColumn("price") &&
          renderPriceCell(
            item.price.price ?? item.price.single ?? item.price.full
          )}
      </div>
    </div>
  );
}
