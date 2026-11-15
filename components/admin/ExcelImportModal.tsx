"use client";

import React, { useState } from "react";
import { MenuData } from "@/types/menu";
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
} from "lucide-react";

interface RowError {
  row: number;
  message: string;
}

interface PriceChange {
  itemName: string;
  category: string;
  column: string;
  oldPrice: number | null;
  newPrice: number | null;
}

interface ImportSummary {
  totalOldItems: number;
  totalNewItems: number;
  categoriesCount: number;
  addedCount: number;
  removedCount: number;
  changedCount: number;
  priceChanges: PriceChange[];
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  errors: RowError[];
  summary: ImportSummary | null;
  parsedMenu: MenuData | null;
  onApplySuccess: (newMenu: MenuData) => void;
}

export function ExcelImportModal({
  isOpen,
  onClose,
  fileName,
  errors,
  summary,
  parsedMenu,
  onApplySuccess,
}: ExcelImportModalProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasErrors = errors.length > 0;

  const handleApply = async () => {
    if (!parsedMenu || hasErrors) return;

    setIsApplying(true);
    setApplyError(null);

    try {
      const res = await fetch("/api/admin/excel/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu: parsedMenu }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply Excel changes");
      }

      onApplySuccess(parsedMenu);
      onClose();
    } catch (err: unknown) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply changes");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-indigo-deep/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border-2 border-indigo/30 bg-cream-50 shadow-paper-lift overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cream-300 p-4 sm:p-5 bg-cream-100/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-md ${hasErrors ? "bg-ribbon/10 text-ribbon" : "bg-emerald-100 text-emerald-800"}`}>
              {hasErrors ? <AlertTriangle className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5 text-indigo-deep" />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-indigo-deep leading-tight">
                {hasErrors ? "Excel Validation Errors" : "Excel Menu Changes Preview"}
              </h3>
              <p className="text-xs text-indigo-muted truncate max-w-md">
                File: <span className="font-semibold text-indigo">{fileName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-indigo-muted hover:text-indigo hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {applyError && (
            <div className="p-3 rounded-lg bg-ribbon/10 border border-ribbon/30 text-ribbon-dark text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-ribbon" />
              <span>{applyError}</span>
            </div>
          )}

          {/* Validation Errors State */}
          {hasErrors ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-ribbon/10 border border-ribbon/30 text-ribbon-dark text-xs leading-relaxed">
                <span className="font-bold">Cannot import this file yet.</span> We found {errors.length} issue{errors.length === 1 ? "" : "s"}. Please fix the indicated rows in your spreadsheet and upload again.
              </div>

              <div className="rounded-lg border border-cream-300 bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-cream-100 border-b border-cream-300 text-indigo-deep font-bold">
                      <th className="py-2.5 px-3 w-20">Row</th>
                      <th className="py-2.5 px-3">Problem Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {errors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-cream-50 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-ribbon">
                          Row {err.row}
                        </td>
                        <td className="py-2 px-3 text-indigo-deep">
                          {err.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Successful Validation Preview State */
            <div className="space-y-5">
              {/* Summary Stats Badges */}
              {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-lg bg-cream-100/70 border border-cream-300 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-muted block">
                      Total Items
                    </span>
                    <span className="text-xl font-bold font-mono text-indigo-deep">
                      {summary.totalNewItems}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      New Added
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-700">
                      +{summary.addedCount}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-indigo/5 border border-indigo/20 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-muted block">
                      Updated
                    </span>
                    <span className="text-xl font-bold font-mono text-indigo-primary">
                      {summary.changedCount}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-ribbon/5 border border-ribbon/20 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ribbon-dark block">
                      Removed
                    </span>
                    <span className="text-xl font-bold font-mono text-ribbon">
                      -{summary.removedCount}
                    </span>
                  </div>
                </div>
              )}

              {/* Price Changes Detailed Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-indigo-deep flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-ribbon" />
                    <span>Price Adjustments ({summary?.priceChanges.length || 0})</span>
                  </h4>
                  <span className="text-[11px] text-indigo-muted">
                    Old Price → New Price
                  </span>
                </div>

                {summary && summary.priceChanges.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto rounded-lg border border-cream-300 bg-white shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-cream-100 border-b border-cream-300 text-indigo-deep font-bold z-10">
                        <tr>
                          <th className="py-2 px-3">Item</th>
                          <th className="py-2 px-3">Category</th>
                          <th className="py-2 px-3">Column</th>
                          <th className="py-2 px-3 text-right">Old</th>
                          <th className="py-2 px-3 text-center">→</th>
                          <th className="py-2 px-3 text-right">New</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-200">
                        {summary.priceChanges.map((change, idx) => {
                          const isUp = (change.newPrice || 0) > (change.oldPrice || 0);
                          return (
                            <tr key={idx} className="hover:bg-cream-50 transition-colors">
                              <td className="py-2 px-3 font-semibold text-indigo-deep">
                                {change.itemName}
                              </td>
                              <td className="py-2 px-3 text-indigo-muted">
                                {change.category}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-indigo">
                                {change.column}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-indigo-muted">
                                {change.oldPrice !== null ? `₹${change.oldPrice}` : "—"}
                              </td>
                              <td className="py-2 px-1 text-center text-indigo-muted">
                                <ArrowRight className="w-3 h-3 inline opacity-50" />
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold">
                                <span className={isUp ? "text-emerald-700" : "text-blue-700"}>
                                  {change.newPrice !== null ? `₹${change.newPrice}` : "—"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg border border-cream-300 bg-white text-xs text-indigo-muted text-center">
                    No price changes detected. Item flags, names, or categories were synchronized.
                  </div>
                )}
              </div>

              {/* Safety notice */}
              <div className="p-3 rounded-lg bg-indigo/5 border border-indigo/20 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-deep leading-relaxed">
                  <span className="font-bold">Safe & Reversible:</span> Clicking <em>Apply Changes</em> will store an automatic safety snapshot in <strong>History</strong> and instantly revalidate the live menu website.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-2.5 border-t border-cream-300 p-4 bg-cream-100/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="min-h-[40px] px-4 py-1.5 text-xs font-semibold rounded-lg bg-cream-200 hover:bg-cream-300 border border-cream-300 text-indigo transition-colors"
          >
            Cancel
          </button>

          {!hasErrors && (
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying || !parsedMenu}
              className="min-h-[40px] inline-flex items-center gap-2 px-5 py-1.5 text-xs font-semibold rounded-lg bg-ribbon hover:bg-ribbon-dark text-white transition-colors shadow-paper disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isApplying ? "Applying Changes..." : "Apply Changes"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
