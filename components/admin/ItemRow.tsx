"use client";

import React, { useState } from "react";
import { Item, Price, Section } from "@/types/menu";
import { PriceInput } from "./PriceInput";
import { ChevronUp, ChevronDown, Edit2, Trash2, Check, X, Star } from "lucide-react";

interface ItemRowProps {
  item: Item;
  category: Section;
  allCategories: Section[];
  isFirst: boolean;
  isLast: boolean;
  onUpdateItem: (updated: Item) => void;
  onMoveCategory: (targetCategoryId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function ItemRow({
  item,
  category,
  allCategories,
  isFirst,
  isLast,
  onUpdateItem,
  onMoveCategory,
  onMoveUp,
  onMoveDown,
  onDelete,
}: ItemRowProps) {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editEn, setEditEn] = useState(item.en);
  const [editGu, setEditGu] = useState(item.gu);
  const [selectedCatId, setSelectedCatId] = useState(category.id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const colList = category.columns as readonly string[];
  const hasCol = (col: string) => colList.includes(col);

  const handlePriceChange = (field: keyof Price, val: number | undefined) => {
    const updatedPrice: Price = { ...item.price };
    if (val === undefined) {
      delete updatedPrice[field];
    } else {
      updatedPrice[field] = val;
    }
    onUpdateItem({ ...item, price: updatedPrice });
  };

  const handleToggleSoldOut = () => {
    onUpdateItem({ ...item, soldOut: !item.soldOut });
  };

  const handleToggleFeatured = () => {
    onUpdateItem({ ...item, featured: !item.featured });
  };

  const handleSaveDetails = () => {
    if (!editEn.trim()) return;

    onUpdateItem({
      ...item,
      en: editEn.trim(),
      gu: editGu.trim(),
    });

    if (selectedCatId !== category.id) {
      onMoveCategory(selectedCatId);
    }

    setIsEditingDetails(false);
  };

  const handleCancelDetails = () => {
    setEditEn(item.en);
    setEditGu(item.gu);
    setSelectedCatId(category.id);
    setIsEditingDetails(false);
  };

  return (
    <div
      className={`p-2.5 rounded-md border transition-all ${
        item.soldOut
          ? "bg-cream-200/50 border-cream-300/80"
          : "bg-cream-50 border-cream-200 hover:border-cream-300"
      }`}
    >
      {/* Primary Display & Price Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Reorder buttons, Name & Sold Out state */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Reorder Up/Down */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              aria-label="Move item up"
              className="p-1 text-indigo-muted hover:text-indigo disabled:opacity-20 min-h-[22px] min-w-[22px] flex items-center justify-center rounded hover:bg-cream-200"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              aria-label="Move item down"
              className="p-1 text-indigo-muted hover:text-indigo disabled:opacity-20 min-h-[22px] min-w-[22px] flex items-center justify-center rounded hover:bg-cream-200"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Names */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold text-sm sm:text-base text-indigo-deep truncate ${
                  item.soldOut ? "line-through opacity-60" : ""
                }`}
              >
                {item.en}
              </span>
              {item.featured && (
                <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-500/15 border border-amber-600/30 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                  <span>Sai Special</span>
                </span>
              )}
              {item.soldOut && (
                <span className="shrink-0 text-[10px] font-bold uppercase text-ribbon bg-ribbon/10 px-1.5 py-0.5 rounded border border-ribbon/30">
                  Not today
                </span>
              )}
            </div>
            {item.gu && (
              <span className="text-xs text-indigo-muted font-gujarati block truncate">
                {item.gu}
              </span>
            )}
          </div>
        </div>

        {/* Right: Inline Price Inputs & Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-1.5 sm:gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-cream-200">
          {/* Sold Out Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSoldOut}
            className={`min-h-[36px] px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              item.soldOut
                ? "bg-ribbon text-white"
                : "bg-cream-200 text-indigo-muted hover:text-indigo hover:bg-cream-300"
            }`}
          >
            {item.soldOut ? "Sold Out" : "In Stock"}
          </button>

          {/* Inline Price Columns */}
          <div className="flex items-center gap-1.5">
            {hasCol("single") && (
              <PriceInput
                value={item.price.single}
                onChange={(val) => handlePriceChange("single", val)}
                label="Single"
              />
            )}
            {hasCol("plate") && (
              <PriceInput
                value={item.price.plate}
                onChange={(val) => handlePriceChange("plate", val)}
                label="Plate"
              />
            )}
            {hasCol("oil") && (
              <PriceInput
                value={item.price.oil}
                onChange={(val) => handlePriceChange("oil", val)}
                label="Oil"
              />
            )}
            {hasCol("butter") && (
              <PriceInput
                value={item.price.butter}
                onChange={(val) => handlePriceChange("butter", val)}
                label="Butter"
              />
            )}
            {hasCol("half") && (
              <PriceInput
                value={item.price.half}
                onChange={(val) => handlePriceChange("half", val)}
                label="Half"
              />
            )}
            {hasCol("full") && (
              <PriceInput
                value={item.price.full}
                onChange={(val) => handlePriceChange("full", val)}
                label="Full"
              />
            )}
            {hasCol("price") && (
              <PriceInput
                value={item.price.price ?? item.price.single ?? item.price.full}
                onChange={(val) => handlePriceChange("price", val)}
                label="Price"
              />
            )}
          </div>

          {/* Featured / Sai Special Toggle */}
          <button
            type="button"
            onClick={handleToggleFeatured}
            title={item.featured ? "Featured as Sai Special (click to remove)" : "Mark as Sai Special"}
            className={`min-h-[38px] min-w-[38px] p-2 flex items-center justify-center rounded transition-colors ${
              item.featured
                ? "text-amber-600 bg-amber-500/20 hover:bg-amber-500/30"
                : "text-indigo-muted/50 hover:text-amber-600 hover:bg-cream-200"
            }`}
            aria-label={item.featured ? "Unmark Sai Special" : "Mark as Sai Special"}
          >
            <Star className={`w-4 h-4 ${item.featured ? "fill-amber-500 text-amber-600" : ""}`} />
          </button>

          {/* Quick Edit Details Toggle */}
          <button
            type="button"
            onClick={() => setIsEditingDetails(!isEditingDetails)}
            className="min-h-[38px] min-w-[38px] p-2 flex items-center justify-center rounded text-indigo-muted hover:text-indigo hover:bg-cream-200"
            aria-label="Edit item details"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="min-h-[38px] min-w-[38px] p-2 flex items-center justify-center rounded text-ribbon/70 hover:text-ribbon hover:bg-ribbon/10"
            aria-label="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Edit Form */}
      {isEditingDetails && (
        <div className="mt-3 pt-3 border-t border-cream-300 space-y-3 bg-cream-100/50 p-3 rounded">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-muted mb-1">
                English Name *
              </label>
              <input
                type="text"
                value={editEn}
                onChange={(e) => setEditEn(e.target.value)}
                placeholder="e.g. Masala Dosa"
                className="w-full min-h-[38px] px-2.5 py-1 text-sm bg-cream-50 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-muted mb-1">
                Gujarati Name (optional)
              </label>
              <input
                type="text"
                value={editGu}
                onChange={(e) => setEditGu(e.target.value)}
                placeholder="e.g. મસાલા ઢોસા"
                className="w-full min-h-[38px] px-2.5 py-1 text-sm font-gujarati bg-cream-50 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
              />
              <span className="text-[11px] text-indigo-muted/80 block mt-0.5">
                Gujarati name (optional). Menu falls back to English if empty.
              </span>
            </div>
          </div>

          {/* Category Dropdown (Move item to another category) */}
          <div>
            <label className="block text-xs font-bold text-indigo-muted mb-1">
              Category
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full min-h-[38px] px-2.5 py-1 text-sm bg-cream-50 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
            >
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.en} ({c.gu})
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelDetails}
              className="min-h-[36px] px-3 py-1 text-xs font-semibold rounded bg-cream-200 text-indigo hover:bg-cream-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDetails}
              disabled={!editEn.trim()}
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded bg-indigo text-white hover:bg-indigo-deep disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Details</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="mt-2 p-3 rounded bg-ribbon/10 border border-ribbon/30 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-ribbon-dark">
            Delete &quot;{item.en}&quot;?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-cream-200 text-indigo"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(false);
                onDelete();
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-ribbon text-white hover:bg-ribbon-dark"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
