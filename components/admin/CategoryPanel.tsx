"use client";

import React, { useState } from "react";
import { Item, Section, Price } from "@/types/menu";
import { MENU_GROUPS, getDefaultGroupForSection } from "@/lib/groups";
import { ItemRow } from "./ItemRow";
import { CategorySettingsModal } from "./CategorySettingsModal";
import { BulkPriceDialog } from "./BulkPriceDialog";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Plus,
  Settings,
  EyeOff,
  Percent,
} from "lucide-react";

interface CategoryPanelProps {
  category: Section;
  allCategories: Section[];
  isFirst: boolean;
  isLast: boolean;
  onUpdateCategory: (updated: Section) => void;
  onMoveItemToCategory: (
    item: Item,
    sourceCatId: string,
    targetCatId: string
  ) => void;
  onMoveCategoryUp: () => void;
  onMoveCategoryDown: () => void;
  onDeleteCategory: (categoryId: string) => void;
}

export function CategoryPanel({
  category,
  allCategories,
  isFirst,
  isLast,
  onUpdateCategory,
  onMoveItemToCategory,
  onMoveCategoryUp,
  onMoveCategoryDown,
  onDeleteCategory,
}: CategoryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemEn, setNewItemEn] = useState("");
  const [newItemGu, setNewItemGu] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<string>("");

  const handleUpdateItem = (index: number, updatedItem: Item) => {
    const updatedItems = [...category.items];
    updatedItems[index] = updatedItem;
    onUpdateCategory({ ...category, items: updatedItems });
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = category.items.filter((_, i) => i !== index);
    onUpdateCategory({ ...category, items: updatedItems });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedItems = [...category.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index - 1];
    updatedItems[index - 1] = temp;
    onUpdateCategory({ ...category, items: updatedItems });
  };

  const handleMoveDown = (index: number) => {
    if (index === category.items.length - 1) return;
    const updatedItems = [...category.items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index + 1];
    updatedItems[index + 1] = temp;
    onUpdateCategory({ ...category, items: updatedItems });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemEn.trim()) return;

    const parsedPrice = parseInt(newItemPrice.trim(), 10);
    const initialPrice: Price = {};
    const colList = category.columns as readonly string[];
    const hasCol = (col: string) => colList.includes(col);

    if (!isNaN(parsedPrice) && parsedPrice >= 0) {
      if (hasCol("price")) {
        initialPrice.price = parsedPrice;
      } else if (hasCol("single")) {
        initialPrice.single = parsedPrice;
      } else if (hasCol("oil")) {
        initialPrice.oil = parsedPrice;
      } else if (hasCol("half")) {
        initialPrice.half = parsedPrice;
      }
    }

    const newItem: Item = {
      id: `${category.id}-${Date.now().toString(36)}`,
      en: newItemEn.trim(),
      gu: newItemGu.trim(),
      price: initialPrice,
    };

    onUpdateCategory({
      ...category,
      items: [...category.items, newItem],
    });

    setNewItemEn("");
    setNewItemGu("");
    setNewItemPrice("");
    setIsAddingItem(false);
  };

  return (
    <>
      <div
        className={`rounded-lg border-2 overflow-hidden shadow-paper transition-all ${
          category.hidden
            ? "border-cream-300/60 bg-cream-100/40 opacity-75"
            : "border-cream-300 bg-cream-100/60"
        }`}
      >
        {/* Category Header */}
        <div className="w-full flex items-center justify-between p-2.5 sm:p-3.5 bg-cream-200/80 border-b border-cream-300/80 gap-2">
          {/* Left: Reorder Category & Name */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Category Reorder Buttons */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                type="button"
                onClick={onMoveCategoryUp}
                disabled={isFirst}
                aria-label="Move category up"
                className="p-0.5 text-indigo-muted hover:text-indigo disabled:opacity-20 rounded hover:bg-cream-300/80"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onMoveCategoryDown}
                disabled={isLast}
                aria-label="Move category down"
                className="p-0.5 text-indigo-muted hover:text-indigo disabled:opacity-20 rounded hover:bg-cream-300/80"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Accordion toggle trigger */}
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 cursor-pointer select-none min-w-0"
            >
              <span className="p-1 rounded text-indigo-muted">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
              <div className="flex items-baseline gap-1.5 truncate">
                <h3 className="font-serif font-bold text-base sm:text-lg text-indigo-deep truncate">
                  {category.en}
                </h3>
                <span className="font-gujarati text-xs sm:text-sm text-indigo-muted truncate">
                  {category.gu}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-indigo-muted bg-cream-300/80 px-2 py-0.5 rounded shrink-0">
                  {MENU_GROUPS.find((g) => g.id === (category.group || getDefaultGroupForSection(category.id)))?.en || "Group"}
                </span>
                {category.hidden && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ribbon-dark bg-ribbon/10 px-1.5 py-0.5 rounded border border-ribbon/20">
                    <EyeOff className="w-3 h-3" />
                    <span>Hidden</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Dish Counter, Bulk Adjust & Settings Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cream-50 text-indigo border border-cream-300">
              {category.items.length}
            </span>

            {/* Bulk Price Adjust Button */}
            <button
              type="button"
              onClick={() => setIsBulkOpen(true)}
              className="min-h-[36px] min-w-[36px] p-2 flex items-center justify-center rounded text-indigo-muted hover:text-indigo hover:bg-cream-300 transition-colors"
              title="Bulk price adjustment"
            >
              <Percent className="w-4 h-4 text-ribbon" />
            </button>

            {/* Settings Modal Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="min-h-[36px] min-w-[36px] p-2 flex items-center justify-center rounded text-indigo-muted hover:text-indigo hover:bg-cream-300 transition-colors"
              title="Category settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Items Content */}
        {isOpen && (
          <div className="p-3 sm:p-4 space-y-2 bg-cream-50/50">
            {category.items.length === 0 ? (
              <p className="py-4 text-center text-xs text-indigo-muted font-medium italic">
                No items in this category yet. Click &quot;+ Add Item&quot; below.
              </p>
            ) : (
              category.items.map((item, idx) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  category={category}
                  allCategories={allCategories}
                  isFirst={idx === 0}
                  isLast={idx === category.items.length - 1}
                  onUpdateItem={(updated) => handleUpdateItem(idx, updated)}
                  onMoveCategory={(targetCatId) =>
                    onMoveItemToCategory(item, category.id, targetCatId)
                  }
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                  onDelete={() => handleDeleteItem(idx)}
                />
              ))
            )}

            {/* Add Item Row */}
            {!isAddingItem ? (
              <button
                type="button"
                onClick={() => setIsAddingItem(true)}
                className="w-full mt-2 min-h-[42px] flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md border-2 border-dashed border-cream-300 hover:border-indigo/50 text-indigo hover:bg-cream-100 transition-colors"
              >
                <Plus className="w-4 h-4 text-ribbon" />
                <span>Add item to {category.en}</span>
              </button>
            ) : (
              <form
                onSubmit={handleAddItem}
                className="mt-3 p-3 rounded-md border border-cream-300 bg-cream-100/80 space-y-3"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-deep">
                  New Dish in {category.en}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newItemEn}
                    onChange={(e) => setNewItemEn(e.target.value)}
                    placeholder="English name *"
                    required
                    autoFocus
                    className="min-h-[38px] px-2.5 py-1 text-sm bg-cream-50 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
                  />
                  <input
                    type="text"
                    value={newItemGu}
                    onChange={(e) => setNewItemGu(e.target.value)}
                    placeholder="Gujarati name (optional)"
                    className="min-h-[38px] px-2.5 py-1 text-sm font-gujarati bg-cream-50 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="Starting price (₹)"
                    className="min-h-[38px] px-2.5 py-1 text-sm font-mono bg-cream-50 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="min-h-[36px] px-3 py-1 text-xs font-semibold rounded bg-cream-200 text-indigo hover:bg-cream-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newItemEn.trim()}
                    className="min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded bg-ribbon text-white hover:bg-ribbon-dark disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Dish</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Category Settings Modal */}
      <CategorySettingsModal
        category={category}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={onUpdateCategory}
        onDelete={onDeleteCategory}
      />

      {/* Bulk Price Adjust Dialog */}
      <BulkPriceDialog
        category={category}
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onApply={onUpdateCategory}
      />
    </>
  );
}
