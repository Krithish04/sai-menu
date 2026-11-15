"use client";

import React, { useState, useEffect } from "react";
import { Item, Price, Section } from "@/types/menu";
import { X, Check } from "lucide-react";

interface AdminItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item?: Item | null; // null if adding new item
  currentCategory: Section;
  allCategories: Section[];
  onSave: (item: Item, targetCategoryId: string) => void;
}

export function AdminItemDrawer({
  isOpen,
  onClose,
  item,
  currentCategory,
  allCategories,
  onSave,
}: AdminItemDrawerProps) {
  const [en, setEn] = useState("");
  const [gu, setGu] = useState("");
  const [categoryId, setCategoryId] = useState(currentCategory.id);
  const [featured, setFeatured] = useState(false);
  const [soldOut, setSoldOut] = useState(false);
  const [prices, setPrices] = useState<Price>({});

  const targetCategory =
    allCategories.find((c) => c.id === categoryId) || currentCategory;
  const colList = targetCategory.columns as readonly string[];

  useEffect(() => {
    if (item) {
      setEn(item.en || "");
      setGu(item.gu || "");
      setCategoryId(currentCategory.id);
      setFeatured(Boolean(item.featured));
      setSoldOut(Boolean(item.soldOut));
      setPrices({ ...item.price });
    } else {
      setEn("");
      setGu("");
      setCategoryId(currentCategory.id);
      setFeatured(false);
      setSoldOut(false);
      setPrices({});
    }
  }, [item, currentCategory, isOpen]);

  if (!isOpen) return null;

  const handlePriceChange = (col: keyof Price, valStr: string) => {
    const trimmed = valStr.trim();
    const updated = { ...prices };
    if (!trimmed) {
      delete updated[col];
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 0) {
        updated[col] = num;
      }
    }
    setPrices(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!en.trim()) return;

    const newItem: Item = {
      id: item?.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      en: en.trim(),
      gu: gu.trim(),
      price: prices,
      featured,
      soldOut,
    };

    onSave(newItem, categoryId);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-end bg-indigo-deep/50 backdrop-blur-2xs transition-all"
    >
      <div
        className="w-full max-w-[480px] h-full bg-cream-50 border-l border-cream-300 shadow-paper-lift flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-300 bg-cream-100">
          <div>
            <h3 className="font-serif font-bold text-base text-indigo-deep">
              {item ? "Edit Menu Item" : "Add New Menu Item"}
            </h3>
            <p className="text-xs text-indigo-muted">
              {item ? `Editing ${item.en}` : `Adding to ${currentCategory.en}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-indigo-muted hover:text-indigo hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* English Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-deep mb-1">
              Item Name (English) *
            </label>
            <input
              type="text"
              required
              value={en}
              onChange={(e) => setEn(e.target.value)}
              placeholder="e.g. Masala Dosa"
              className="w-full min-h-[44px] px-3 py-2 text-base bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon focus:outline-none"
            />
          </div>

          {/* Gujarati Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-deep mb-1">
              Item Name (Gujarati)
            </label>
            <input
              type="text"
              value={gu}
              onChange={(e) => setGu(e.target.value)}
              placeholder="e.g. મસાલા ઢોસા"
              className="w-full min-h-[44px] px-3 py-2 text-base font-gujarati bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon focus:outline-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-deep mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-sm bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon focus:outline-none"
            >
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.en} {c.gu ? `(${c.gu})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Price Columns based on selected category */}
          <div className="pt-2 border-t border-cream-200">
            <span className="block text-xs font-bold uppercase tracking-wider text-indigo-deep mb-2">
              Prices (₹)
            </span>
            <div className="grid grid-cols-2 gap-3">
              {colList.map((col) => {
                const colKey = col as keyof Price;
                const currentVal = prices[colKey] !== undefined ? prices[colKey] : "";
                return (
                  <div key={col}>
                    <label className="block text-[11px] font-semibold uppercase text-indigo-muted mb-1">
                      {col} Price
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-indigo-muted pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={currentVal}
                        onChange={(e) => handlePriceChange(colKey, e.target.value)}
                        placeholder="—"
                        className="w-full min-h-[44px] pl-7 pr-3 py-2 text-sm tabular-nums font-semibold bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toggles: Featured & Sold Out */}
          <div className="pt-3 border-t border-cream-200 space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-cream-100/70 border border-cream-300 cursor-pointer hover:bg-cream-200/50 transition-colors">
              <div>
                <span className="text-xs font-bold text-indigo-deep block">
                  Sai Special (Featured)
                </span>
                <span className="text-[11px] text-indigo-muted block">
                  Highlights this item with a marigold star in the Sai Special shelf.
                </span>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 rounded text-indigo focus:ring-ribbon"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-cream-100/70 border border-cream-300 cursor-pointer hover:bg-cream-200/50 transition-colors">
              <div>
                <span className="text-xs font-bold text-ribbon-dark block">
                  Sold Out
                </span>
                <span className="text-[11px] text-indigo-muted block">
                  Marks item as &quot;Not today&quot; and strikes it out on public menu.
                </span>
              </div>
              <input
                type="checkbox"
                checked={soldOut}
                onChange={(e) => setSoldOut(e.target.checked)}
                className="w-5 h-5 rounded text-ribbon focus:ring-ribbon"
              />
            </label>
          </div>

          {/* Drawer Actions Footer */}
          <div className="pt-4 border-t border-cream-300 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded bg-cream-200 text-indigo hover:bg-cream-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!en.trim()}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded bg-indigo text-white hover:bg-indigo-deep disabled:opacity-50 transition-colors shadow-paper"
            >
              <Check className="w-4 h-4" />
              <span>{item ? "Save Changes" : "Create Item"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
