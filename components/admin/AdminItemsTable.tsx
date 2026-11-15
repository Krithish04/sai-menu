"use client";

import React, { useState } from "react";
import { Item, Price, Section } from "@/types/menu";
import { Edit2, Trash2, ChevronUp, ChevronDown, Plus, Star } from "lucide-react";

interface AdminItemsTableProps {
  categories: Section[];
  searchQuery: string;
  onUpdateItem: (catId: string, updatedItem: Item) => void;
  onDeleteItem: (catId: string, itemId: string) => void;
  onMoveItem: (catId: string, itemIdx: number, direction: "up" | "down") => void;
  onOpenItemDrawer: (cat: Section, item?: Item | null) => void;
}

export function AdminItemsTable({
  categories,
  searchQuery,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
  onOpenItemDrawer,
}: AdminItemsTableProps) {
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");

  const q = searchQuery.trim().toLowerCase();

  const filteredCategories = categories.filter((cat) => {
    if (selectedCatFilter !== "all" && cat.id !== selectedCatFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Category Quick Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setSelectedCatFilter("all")}
          className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border select-none ${
            selectedCatFilter === "all"
              ? "bg-indigo-deep text-white border-indigo-deep shadow-xs"
              : "bg-cream-50 hover:bg-cream-200 text-indigo border-cream-300"
          }`}
        >
          All Categories ({categories.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCatFilter(c.id)}
            className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border select-none ${
              selectedCatFilter === c.id
                ? "bg-indigo-deep text-white border-indigo-deep shadow-xs"
                : "bg-cream-50 hover:bg-cream-200 text-indigo border-cream-300"
            }`}
          >
            <span>{c.en}</span>
            <span className="ml-1 text-[10px] opacity-70">({c.items.length})</span>
          </button>
        ))}
      </div>

      {/* Tables by Category */}
      {filteredCategories.map((category) => {
        const matchingItems = category.items.filter((it) => {
          if (!q) return true;
          return (
            it.en.toLowerCase().includes(q) ||
            it.gu.toLowerCase().includes(q) ||
            category.en.toLowerCase().includes(q)
          );
        });

        if (q && matchingItems.length === 0) return null;

        const colList = category.columns as readonly string[];

        return (
          <div
            key={category.id}
            id={`category-table-${category.id}`}
            className="rounded-lg border border-cream-300 bg-cream-50 overflow-hidden shadow-paper"
          >
            {/* Category Table Title & Action */}
            <div className="px-4 py-3 bg-cream-100 border-b border-cream-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="ribbon-tag text-xs font-bold py-0.5">
                  {category.en}
                </span>
                {category.gu && (
                  <span className="font-gujarati text-xs sm:text-sm font-semibold text-indigo-muted truncate">
                    {category.gu}
                  </span>
                )}
                <span className="text-[11px] font-semibold text-indigo-muted bg-cream-200 px-2 py-0.5 rounded-full border border-cream-300 shrink-0">
                  {matchingItems.length} items
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenItemDrawer(category, null)}
                className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1 text-xs font-semibold rounded bg-indigo text-white hover:bg-indigo-deep transition-colors shadow-2xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Desktop / Tablet Table View (>=640px) */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream-100 border-b border-cream-300 text-[11px] font-bold uppercase tracking-wider text-indigo-muted select-none">
                    <th className="py-2.5 px-3 min-w-[160px]">Item (English)</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Item (Gujarati)</th>
                    {colList.map((col) => (
                      <th
                        key={col}
                        className="py-2.5 px-2 text-right w-24 capitalize"
                      >
                        {col} (₹)
                      </th>
                    ))}
                    <th className="py-2.5 px-2 text-center w-20">Sold Out</th>
                    <th className="py-2.5 px-2 text-center w-20">Featured</th>
                    <th className="py-2.5 px-3 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200/60">
                  {matchingItems.map((item, idx) => (
                    <DesktopTableRow
                      key={item.id}
                      item={item}
                      category={category}
                      isFirst={idx === 0}
                      isLast={idx === matchingItems.length - 1}
                      onUpdateItem={(up) => onUpdateItem(category.id, up)}
                      onDeleteItem={() => onDeleteItem(category.id, item.id)}
                      onMoveItem={(dir) => onMoveItem(category.id, idx, dir)}
                      onEdit={() => onOpenItemDrawer(category, item)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (<640px) */}
            <div className="block sm:hidden divide-y divide-cream-200/60">
              {matchingItems.map((item, idx) => (
                <MobileCardRow
                  key={item.id}
                  item={item}
                  category={category}
                  isFirst={idx === 0}
                  isLast={idx === matchingItems.length - 1}
                  onUpdateItem={(up) => onUpdateItem(category.id, up)}
                  onDeleteItem={() => onDeleteItem(category.id, item.id)}
                  onMoveItem={(dir) => onMoveItem(category.id, idx, dir)}
                  onEdit={() => onOpenItemDrawer(category, item)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Single Desktop Table Row with inline keyboard price edits
interface RowProps {
  item: Item;
  category: Section;
  isFirst: boolean;
  isLast: boolean;
  onUpdateItem: (updated: Item) => void;
  onDeleteItem: () => void;
  onMoveItem: (direction: "up" | "down") => void;
  onEdit: () => void;
}

function DesktopTableRow({
  item,
  category,
  isFirst,
  isLast,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
  onEdit,
}: RowProps) {
  const colList = category.columns as readonly string[];

  const handlePriceBlur = (
    field: keyof Price,
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const valStr = e.target.value.trim();
    const updated = { ...item.price };
    if (!valStr || valStr === "-") {
      delete updated[field];
    } else {
      const num = parseInt(valStr, 10);
      if (!isNaN(num) && num >= 0) {
        updated[field] = num;
      }
    }
    onUpdateItem({ ...item, price: updated });
  };

  const handleKeyDown = (
    field: keyof Price,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      // Save and move focus to next input
      e.currentTarget.blur();
      const inputs = Array.from(
        document.querySelectorAll<HTMLInputElement>('input[data-price-cell="true"]')
      );
      const currentIndex = inputs.indexOf(e.currentTarget);
      if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
        inputs[currentIndex + 1].select();
      }
    } else if (e.key === "Escape") {
      // Cancel edit and revert value
      e.currentTarget.value =
        item.price[field] !== undefined ? String(item.price[field]) : "";
      e.currentTarget.blur();
    }
  };

  return (
    <tr
      className={`min-h-[44px] hover:bg-cream-100/70 transition-colors ${
        item.soldOut ? "opacity-60 bg-cream-200/30" : ""
      }`}
    >
      {/* English Name */}
      <td className="py-2 px-3 font-semibold text-indigo-deep">
        <span className={item.soldOut ? "line-through text-indigo-muted" : ""}>
          {item.en}
        </span>
      </td>

      {/* Gujarati Name */}
      <td className="py-2 px-3 font-gujarati text-sm text-indigo-muted">
        {item.gu || "—"}
      </td>

      {/* Dynamic Price Columns with Inline Edit */}
      {colList.map((col) => {
        const field = col as keyof Price;
        const currentVal = item.price[field];
        return (
          <td key={col} className="py-1 px-2 text-right">
            <input
              type="number"
              min="0"
              step="1"
              data-price-cell="true"
              defaultValue={currentVal !== undefined ? currentVal : ""}
              key={`${item.id}-${col}-${currentVal}`}
              onBlur={(e) => handlePriceBlur(field, e)}
              onKeyDown={(e) => handleKeyDown(field, e)}
              aria-label={`${item.en} ${col} price`}
              className="w-20 min-h-[36px] px-2 py-1 text-right tabular-nums font-semibold text-sm bg-cream-100/80 hover:bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon focus:outline-none"
              placeholder="—"
            />
          </td>
        );
      })}

      {/* Sold Out Toggle */}
      <td className="py-2 px-2 text-center">
        <button
          type="button"
          onClick={() => onUpdateItem({ ...item, soldOut: !item.soldOut })}
          aria-label={item.soldOut ? "Mark Available" : "Mark Sold Out"}
          className={`min-h-[36px] px-2.5 py-1 text-xs font-semibold rounded transition-colors select-none ${
            item.soldOut
              ? "bg-ribbon text-white shadow-2xs"
              : "bg-cream-200 hover:bg-cream-300 text-indigo"
          }`}
        >
          {item.soldOut ? "Sold" : "Avail"}
        </button>
      </td>

      {/* Featured Star Toggle */}
      <td className="py-2 px-2 text-center">
        <button
          type="button"
          onClick={() => onUpdateItem({ ...item, featured: !item.featured })}
          aria-label={item.featured ? "Unfeature" : "Mark Sai Special"}
          className={`min-h-[36px] min-w-[36px] p-1.5 rounded-full transition-colors inline-flex items-center justify-center ${
            item.featured
              ? "text-[#D9A441] bg-amber-500/15"
              : "text-indigo-muted/40 hover:text-indigo-muted hover:bg-cream-200"
          }`}
        >
          <Star
            className={`w-4 h-4 ${
              item.featured ? "fill-[#D9A441]" : "fill-none"
            }`}
          />
        </button>
      </td>

      {/* Actions (Edit, Up, Down, Delete) */}
      <td className="py-2 px-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            title="Edit Details"
            className="p-1.5 rounded hover:bg-cream-200 text-indigo-muted hover:text-indigo min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMoveItem("up")}
            title="Move Up"
            className="p-1.5 rounded hover:bg-cream-200 text-indigo-muted disabled:opacity-30 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMoveItem("down")}
            title="Move Down"
            className="p-1.5 rounded hover:bg-cream-200 text-indigo-muted disabled:opacity-30 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDeleteItem}
            title="Delete Item"
            className="p-1.5 rounded hover:bg-ribbon/10 text-ribbon min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Mobile Stacked Card View (<640px)
function MobileCardRow({
  item,
  category,
  isFirst,
  isLast,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
  onEdit,
}: RowProps) {
  const colList = category.columns as readonly string[];

  const handlePriceChange = (field: keyof Price, valStr: string) => {
    const trimmed = valStr.trim();
    const updated = { ...item.price };
    if (!trimmed) {
      delete updated[field];
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 0) {
        updated[field] = num;
      }
    }
    onUpdateItem({ ...item, price: updated });
  };

  return (
    <div
      className={`p-3 space-y-2.5 ${
        item.soldOut ? "opacity-70 bg-cream-200/40" : "bg-cream-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className={`font-semibold text-sm text-indigo-deep block ${
              item.soldOut ? "line-through text-indigo-muted" : ""
            }`}
          >
            {item.en}
          </span>
          {item.gu && (
            <span className="font-gujarati text-xs text-indigo-muted block">
              {item.gu}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onUpdateItem({ ...item, featured: !item.featured })}
            aria-label="Toggle Sai Special"
            className={`p-1.5 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center ${
              item.featured ? "text-[#D9A441]" : "text-indigo-muted/50"
            }`}
          >
            <Star
              className={`w-5 h-5 ${
                item.featured ? "fill-[#D9A441]" : "fill-none"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => onUpdateItem({ ...item, soldOut: !item.soldOut })}
            aria-label="Toggle Sold Out"
            className={`min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded select-none ${
              item.soldOut
                ? "bg-ribbon text-white"
                : "bg-cream-200 text-indigo"
            }`}
          >
            {item.soldOut ? "Sold Out" : "In Stock"}
          </button>
        </div>
      </div>

      {/* Price inputs on mobile */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-cream-200">
        {colList.map((col) => {
          const field = col as keyof Price;
          const currentVal = item.price[field];
          return (
            <div key={col} className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-indigo-muted w-12 truncate">
                {col}
              </span>
              <input
                type="number"
                min="0"
                defaultValue={currentVal !== undefined ? currentVal : ""}
                onBlur={(e) => handlePriceChange(field, e.target.value)}
                className="w-full min-h-[44px] px-2 text-sm tabular-nums font-semibold bg-cream-100 border border-cream-300 rounded"
                placeholder="—"
              />
            </div>
          );
        })}
      </div>

      {/* Card actions footer */}
      <div className="flex items-center justify-end gap-1 pt-1 border-t border-cream-200/60">
        <button
          type="button"
          onClick={onEdit}
          className="min-h-[44px] px-3 py-1 text-xs font-semibold rounded text-indigo hover:bg-cream-200 flex items-center gap-1"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onMoveItem("up")}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-indigo-muted disabled:opacity-30"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => onMoveItem("down")}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-indigo-muted disabled:opacity-30"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDeleteItem}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ribbon"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
