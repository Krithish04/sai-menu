"use client";

import React, { useState } from "react";
import { Section } from "@/types/menu";
import { X, Check, Trash2, Plus, AlertTriangle } from "lucide-react";
import { MENU_GROUPS, getDefaultGroupForSection } from "@/lib/groups";

interface CategorySettingsModalProps {
  category: Section;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Section) => void;
  onDelete: (categoryId: string) => void;
}

const COLUMN_PRESETS = [
  { id: "price", label: "Single Price", cols: ["price"] as Section["columns"] },
  { id: "half-full", label: "Half / Full", cols: ["half", "full"] as Section["columns"] },
  { id: "oil-butter", label: "Oil / Butter", cols: ["oil", "butter"] as Section["columns"] },
  { id: "single-plate", label: "Single / Plate", cols: ["single", "plate"] as Section["columns"] },
];

export function CategorySettingsModal({
  category,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: CategorySettingsModalProps) {
  const [en, setEn] = useState(category.en);
  const [gu, setGu] = useState(category.gu);
  const [group, setGroup] = useState<string>(
    category.group || getDefaultGroupForSection(category.id)
  );
  const [hidden, setHidden] = useState(Boolean(category.hidden));
  const [columnsType, setColumnsType] = useState<string>(() => {
    const cols = category.columns as readonly string[];
    if (cols.includes("half")) return "half-full";
    if (cols.includes("oil")) return "oil-butter";
    if (cols.includes("single")) return "single-plate";
    return "price";
  });

  const [hasAvailability, setHasAvailability] = useState(
    Boolean(category.availability)
  );
  const [availFrom, setAvailFrom] = useState(category.availability?.from || "13:00");
  const [availTo, setAvailTo] = useState(category.availability?.to || "23:00");

  const [notes, setNotes] = useState<{ en: string; gu?: string }[]>(
    category.notes || []
  );

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleAddNote = () => {
    setNotes([...notes, { en: "", gu: "" }]);
  };

  const handleUpdateNote = (index: number, field: "en" | "gu", val: string) => {
    const updated = [...notes];
    updated[index] = { ...updated[index], [field]: val };
    setNotes(updated);
  };

  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!en.trim()) return;

    const selectedPreset =
      COLUMN_PRESETS.find((p) => p.id === columnsType) || COLUMN_PRESETS[0];

    const cleanNotes = notes
      .filter((n) => n.en.trim().length > 0)
      .map((n) => ({
        en: n.en.trim(),
        gu: n.gu?.trim() || undefined,
      }));

    const updatedSection: Section = {
      ...category,
      en: en.trim(),
      gu: gu.trim(),
      group,
      hidden,
      columns: selectedPreset.cols,
      availability: hasAvailability
        ? { from: availFrom, to: availTo }
        : undefined,
      notes: cleanNotes.length > 0 ? cleanNotes : undefined,
    };

    onSave(updatedSection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-indigo-deep/60 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg border-2 border-cream-300 bg-cream-50 shadow-paper-lift overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-300 bg-cream-100">
          <div className="flex items-center gap-2">
            <span className="ribbon-tag text-xs font-bold py-0.5">Settings</span>
            <h3 className="font-serif font-bold text-base text-indigo-deep">
              {category.en}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-indigo-muted hover:text-indigo hover:bg-cream-200"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Category Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-muted mb-1">
                English Name *
              </label>
              <input
                type="text"
                value={en}
                onChange={(e) => setEn(e.target.value)}
                required
                className="w-full min-h-[38px] px-2.5 py-1 text-sm bg-cream-50 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-muted mb-1">
                Gujarati Name
              </label>
              <input
                type="text"
                value={gu}
                onChange={(e) => setGu(e.target.value)}
                className="w-full min-h-[38px] px-2.5 py-1 text-sm font-gujarati bg-cream-50 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
              />
            </div>
          </div>

          {/* Group Assignment for Two-Level Navigation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-muted mb-1">
              Menu Group (Top Level Navigation)
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full min-h-[38px] px-2.5 py-1 text-sm bg-cream-50 border border-cream-300 rounded text-indigo-deep font-semibold focus:ring-2 focus:ring-ribbon"
            >
              {MENU_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.en} ({g.gu})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-indigo-muted mt-0.5">
              Determines which group tab this section appears under on the customer menu.
            </p>
          </div>

          {/* Visibility Toggle */}
          <div className="p-3 rounded border border-cream-300 bg-cream-100/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-deep block">
                Visibility
              </span>
              <span className="text-[11px] text-indigo-muted">
                {hidden
                  ? "Category is currently hidden from public customers"
                  : "Category is visible to customers"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setHidden(!hidden)}
              className={`min-h-[36px] px-3 py-1 text-xs font-semibold rounded transition-colors ${
                hidden
                  ? "bg-ribbon text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {hidden ? "Hidden" : "Visible"}
            </button>
          </div>

          {/* Price Columns Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-muted mb-1.5">
              Price Columns Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COLUMN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setColumnsType(preset.id)}
                  className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded border text-left flex items-center justify-between transition-colors ${
                    columnsType === preset.id
                      ? "bg-indigo text-white border-indigo"
                      : "bg-cream-100 text-indigo border-cream-300 hover:bg-cream-200"
                  }`}
                >
                  <span>{preset.label}</span>
                  {columnsType === preset.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Window */}
          <div className="p-3 rounded border border-cream-300 bg-cream-100/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-deep">
                Time Restriction (Asia/Kolkata)
              </span>
              <input
                type="checkbox"
                id="hasAvail"
                checked={hasAvailability}
                onChange={(e) => setHasAvailability(e.target.checked)}
                className="w-4 h-4 text-ribbon rounded focus:ring-ribbon"
              />
            </div>
            {hasAvailability && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-cream-200">
                <div>
                  <label className="block text-[11px] font-bold text-indigo-muted mb-1">
                    From Time
                  </label>
                  <input
                    type="time"
                    value={availFrom}
                    onChange={(e) => setAvailFrom(e.target.value)}
                    className="w-full min-h-[36px] px-2 text-sm bg-cream-50 border border-cream-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-indigo-muted mb-1">
                    To Time
                  </label>
                  <input
                    type="time"
                    value={availTo}
                    onChange={(e) => setAvailTo(e.target.value)}
                    className="w-full min-h-[36px] px-2 text-sm bg-cream-50 border border-cream-300 rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-muted">
                Section Notes ({notes.length})
              </label>
              <button
                type="button"
                onClick={handleAddNote}
                className="inline-flex items-center gap-1 text-xs font-semibold text-ribbon hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            {notes.map((note, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded border border-cream-300 bg-cream-100/40 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={note.en}
                    onChange={(e) => handleUpdateNote(idx, "en", e.target.value)}
                    placeholder="English note (e.g. Extra Sambhar ₹20)"
                    className="flex-1 min-h-[34px] px-2 text-xs bg-cream-50 border border-cream-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNote(idx)}
                    className="p-1 text-ribbon hover:bg-ribbon/10 rounded"
                    aria-label="Remove note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={note.gu || ""}
                  onChange={(e) => handleUpdateNote(idx, "gu", e.target.value)}
                  placeholder="Gujarati note (optional)"
                  className="w-full min-h-[34px] px-2 text-xs font-gujarati bg-cream-50 border border-cream-300 rounded"
                />
              </div>
            ))}
          </div>

          {/* Delete Category Confirmation */}
          <div className="pt-3 border-t border-cream-300">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ribbon hover:underline py-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete this category</span>
              </button>
            ) : (
              <div className="p-3 rounded bg-ribbon/10 border border-ribbon/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-ribbon-dark">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Delete &quot;{category.en}&quot; and all its {category.items.length} items?
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="min-h-[34px] px-2.5 py-1 text-xs font-semibold rounded bg-cream-200 text-indigo"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(category.id);
                      onClose();
                    }}
                    className="min-h-[34px] px-3 py-1 text-xs font-semibold rounded bg-ribbon text-white hover:bg-ribbon-dark"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-300">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] px-4 py-1.5 text-xs font-semibold rounded bg-cream-200 text-indigo hover:bg-cream-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!en.trim()}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded bg-indigo text-white hover:bg-indigo-deep disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
