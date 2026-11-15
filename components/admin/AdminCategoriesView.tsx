"use client";

import React, { useState } from "react";
import { Section } from "@/types/menu";
import { Plus, ChevronUp, ChevronDown, Eye, EyeOff, Settings, Trash2 } from "lucide-react";
import { CategorySettingsModal } from "./CategorySettingsModal";

interface AdminCategoriesViewProps {
  categories: Section[];
  onUpdateCategory: (updatedCat: Section) => void;
  onMoveCategoryUp: (idx: number) => void;
  onMoveCategoryDown: (idx: number) => void;
  onDeleteCategory: (catId: string) => void;
  onCreateCategory: (en: string, gu: string) => void;
}

export function AdminCategoriesView({
  categories,
  onUpdateCategory,
  onMoveCategoryUp,
  onMoveCategoryDown,
  onDeleteCategory,
  onCreateCategory,
}: AdminCategoriesViewProps) {
  const [editingCategory, setEditingCategory] = useState<Section | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newEn, setNewEn] = useState("");
  const [newGu, setNewGu] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEn.trim()) return;
    onCreateCategory(newEn.trim(), newGu.trim());
    setNewEn("");
    setNewGu("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header and Add Category button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-bold text-indigo-deep">
            Menu Categories ({categories.length})
          </h2>
          <p className="text-xs text-indigo-muted mt-0.5">
            Reorder categories, manage visibility, or update notes and service hours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-semibold rounded bg-indigo text-white hover:bg-indigo-deep transition-colors shadow-paper"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Add Category Form Modal */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="p-4 rounded-lg border-2 border-indigo/30 bg-cream-50 space-y-3 shadow-paper max-w-lg"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-deep">
            Add New Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              autoFocus
              value={newEn}
              onChange={(e) => setNewEn(e.target.value)}
              placeholder="English name (e.g. Desserts) *"
              className="min-h-[44px] px-3 py-2 text-sm bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
            />
            <input
              type="text"
              value={newGu}
              onChange={(e) => setNewGu(e.target.value)}
              placeholder="Gujarati name (e.g. મીઠાઈ)"
              className="min-h-[44px] px-3 py-2 text-sm font-gujarati bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="min-h-[38px] px-3.5 py-1 text-xs font-semibold rounded bg-cream-200 text-indigo hover:bg-cream-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newEn.trim()}
              className="min-h-[38px] px-4 py-1 text-xs font-semibold rounded bg-ribbon text-white hover:bg-ribbon-dark disabled:opacity-50 shadow-2xs"
            >
              Create Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Reorderable Table / List */}
      <div className="rounded-lg border border-cream-300 bg-cream-50 overflow-hidden shadow-paper">
        <div className="divide-y divide-cream-200/70">
          {categories.map((cat, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === categories.length - 1;

            return (
              <div
                key={cat.id}
                className={`p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  cat.hidden ? "bg-cream-200/40 opacity-70" : "hover:bg-cream-100/50"
                }`}
              >
                {/* Left info: Reorder arrows, Name, Item count, Column format */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex sm:flex-col items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => onMoveCategoryUp(idx)}
                      title="Move Category Up"
                      className="p-1 rounded text-indigo-muted hover:text-indigo hover:bg-cream-200 disabled:opacity-20 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => onMoveCategoryDown(idx)}
                      title="Move Category Down"
                      className="p-1 rounded text-indigo-muted hover:text-indigo hover:bg-cream-200 disabled:opacity-20 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-sm sm:text-base text-indigo-deep truncate">
                        {cat.en}
                      </span>
                      {cat.gu && (
                        <span className="font-gujarati text-xs sm:text-sm text-indigo-muted">
                          ({cat.gu})
                        </span>
                      )}
                      {cat.hidden && (
                        <span className="text-[10px] uppercase font-bold text-ribbon-dark bg-ribbon/10 border border-ribbon/20 px-1.5 py-0.2 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-indigo-muted mt-0.5">
                      <span>{cat.items.length} items</span>
                      <span>·</span>
                      <span className="capitalize">
                        Columns: {cat.columns.join(" / ")}
                      </span>
                      {cat.availability && (
                        <>
                          <span>·</span>
                          <span>
                            {cat.availability.from} - {cat.availability.to}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls: Hide/Show switch, Settings, Delete */}
                <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-cream-200">
                  {/* Hide / Show Toggle */}
                  <button
                    type="button"
                    onClick={() => onUpdateCategory({ ...cat, hidden: !cat.hidden })}
                    className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                      cat.hidden
                        ? "bg-cream-200 text-indigo-muted border-cream-300 hover:bg-cream-300"
                        : "bg-cream-50 text-indigo border-cream-300 hover:bg-cream-200"
                    }`}
                    title={cat.hidden ? "Show on Public Menu" : "Hide from Public Menu"}
                  >
                    {cat.hidden ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-ribbon" />
                        <span>Hidden</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Visible</span>
                      </>
                    )}
                  </button>

                  {/* Settings Modal (Notes, availability, column type) */}
                  <button
                    type="button"
                    onClick={() => setEditingCategory(cat)}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1 text-xs font-semibold rounded bg-cream-200 hover:bg-cream-300 text-indigo border border-cream-300 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-indigo-muted" />
                    <span>Settings</span>
                  </button>

                  {/* Delete Category */}
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded text-ribbon hover:bg-ribbon/10 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Settings Drawer / Modal */}
      {editingCategory && (
        <CategorySettingsModal
          category={editingCategory}
          isOpen={Boolean(editingCategory)}
          onClose={() => setEditingCategory(null)}
          onSave={(updated) => {
            onUpdateCategory(updated);
            setEditingCategory(null);
          }}
          onDelete={(id) => {
            onDeleteCategory(id);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}
