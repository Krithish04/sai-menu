"use client";

import React, { useState, useMemo } from "react";
import { Section, Item, Price } from "@/types/menu";
import { TrendingUp, Check, AlertCircle } from "lucide-react";

interface AdminBulkPriceViewProps {
  categories: Section[];
  onApplyBulkPrice: (updatedCategories: Section[], summary: string) => void;
}

export function AdminBulkPriceView({
  categories,
  onApplyBulkPrice,
}: AdminBulkPriceViewProps) {
  const [targetCategory, setTargetCategory] = useState<string>("all");
  const [type, setType] = useState<"fixed" | "percentage">("fixed");
  const [direction, setDirection] = useState<"+" | "-">("+");
  const [amount, setAmount] = useState<string>("10");
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const numericVal = parseFloat(amount) || 0;

  // Selected categories to adjust
  const affectedCategories = useMemo(() => {
    if (targetCategory === "all") return categories;
    return categories.filter((c) => c.id === targetCategory);
  }, [categories, targetCategory]);

  // Compute preview of price changes
  const { previewCategories, diffCount, sampleDiffs } = useMemo(() => {
    let count = 0;
    const diffs: {
      category: string;
      item: string;
      column: string;
      oldVal: number;
      newVal: number;
    }[] = [];

    const updated = affectedCategories.map((cat) => {
      const newItems = cat.items.map((item) => {
        const newPrice: Price = {};

        const adjust = (oldVal: number | undefined, colName: string) => {
          if (oldVal === undefined) return undefined;
          let delta = 0;
          if (type === "fixed") {
            delta = numericVal;
          } else {
            delta = Math.round((oldVal * numericVal) / 100);
          }
          const calculated =
            direction === "+" ? oldVal + delta : Math.max(0, oldVal - delta);

          if (calculated !== oldVal) {
            count++;
            if (diffs.length < 15) {
              diffs.push({
                category: cat.en,
                item: item.en,
                column: colName,
                oldVal,
                newVal: calculated,
              });
            }
          }
          return calculated;
        };

        if (item.price.single !== undefined) newPrice.single = adjust(item.price.single, "single");
        if (item.price.plate !== undefined) newPrice.plate = adjust(item.price.plate, "plate");
        if (item.price.oil !== undefined) newPrice.oil = adjust(item.price.oil, "oil");
        if (item.price.butter !== undefined) newPrice.butter = adjust(item.price.butter, "butter");
        if (item.price.half !== undefined) newPrice.half = adjust(item.price.half, "half");
        if (item.price.full !== undefined) newPrice.full = adjust(item.price.full, "full");
        if (item.price.price !== undefined) newPrice.price = adjust(item.price.price, "price");

        return {
          ...item,
          price: newPrice,
        };
      });

      return {
        ...cat,
        items: newItems,
      };
    });

    return { previewCategories: updated, diffCount: count, sampleDiffs: diffs };
  }, [affectedCategories, type, direction, numericVal]);

  const handleApply = () => {
    if (diffCount === 0) return;

    const summary = `Bulk price update: ${direction}${amount}${
      type === "percentage" ? "%" : "₹"
    } on ${targetCategory === "all" ? "all categories" : targetCategory}`;

    onApplyBulkPrice(previewCategories, summary);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 w-full max-w-5xl">
      <div>
        <h2 className="font-serif text-lg font-bold text-indigo-deep">
          Bulk Price Adjustments
        </h2>
        <p className="text-xs text-indigo-muted mt-0.5">
          Increase or decrease menu prices by fixed amounts or percentages with a live preview before saving.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Adjustment Controls */}
        <div className="lg:col-span-5 p-5 rounded-lg border border-cream-300 bg-cream-50 shadow-paper space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-deep mb-1.5">
              Select Category
            </label>
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-sm bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.en} ({c.items.length} items)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-deep mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("fixed")}
                className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded border transition-colors ${
                  type === "fixed"
                    ? "bg-indigo-deep text-white border-indigo-deep shadow-xs"
                    : "bg-cream-100 text-indigo border-cream-300 hover:bg-cream-200"
                }`}
              >
                Fixed Amount (₹)
              </button>
              <button
                type="button"
                onClick={() => setType("percentage")}
                className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded border transition-colors ${
                  type === "percentage"
                    ? "bg-indigo-deep text-white border-indigo-deep shadow-xs"
                    : "bg-cream-100 text-indigo border-cream-300 hover:bg-cream-200"
                }`}
              >
                Percentage (%)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-deep mb-1.5">
              Direction & Amount
            </label>
            <div className="flex items-center gap-2">
              <div className="flex rounded border border-cream-300 overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setDirection("+")}
                  className={`min-h-[44px] px-4 font-bold text-base transition-colors ${
                    direction === "+"
                      ? "bg-emerald-700 text-white"
                      : "bg-cream-100 text-indigo hover:bg-cream-200"
                  }`}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("-")}
                  className={`min-h-[44px] px-4 font-bold text-base transition-colors ${
                    direction === "-"
                      ? "bg-ribbon text-white"
                      : "bg-cream-100 text-indigo hover:bg-cream-200"
                  }`}
                >
                  −
                </button>
              </div>

              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10"
                  className="w-full min-h-[44px] px-3 py-2 text-sm tabular-nums font-semibold bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-indigo-muted pointer-events-none">
                  {type === "percentage" ? "%" : "₹"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-cream-200">
            <button
              type="button"
              onClick={handleApply}
              disabled={diffCount === 0 || numericVal <= 0}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-indigo text-white hover:bg-indigo-deep disabled:opacity-40 transition-colors shadow-paper"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Apply Price Update ({diffCount} price changes)</span>
            </button>
            {appliedSuccess && (
              <p className="text-xs text-emerald-700 font-semibold text-center mt-2 animate-fadeIn">
                ✓ Bulk prices successfully applied and saved!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Live Price Diff Preview */}
        <div className="lg:col-span-7 p-5 rounded-lg border border-cream-300 bg-cream-50 shadow-paper space-y-4">
          <div className="flex items-center justify-between border-b border-cream-200 pb-2">
            <h3 className="font-serif font-bold text-sm text-indigo-deep">
              Preview of Changes ({diffCount} total prices affected)
            </h3>
            <span className="text-[11px] text-indigo-muted font-medium">
              Formula: {direction}
              {amount}
              {type === "percentage" ? "%" : "₹"}
            </span>
          </div>

          {diffCount === 0 ? (
            <div className="py-12 text-center text-xs text-indigo-muted">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-40 text-indigo-muted" />
              No price changes to preview. Enter an amount above 0.
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-cream-300 text-indigo-muted uppercase tracking-wider font-bold">
                    <th className="py-2 px-2">Category</th>
                    <th className="py-2 px-2">Item</th>
                    <th className="py-2 px-2">Column</th>
                    <th className="py-2 px-2 text-right">Old</th>
                    <th className="py-2 px-2 text-right">New</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200/60 font-medium">
                  {sampleDiffs.map((d, i) => (
                    <tr key={i} className="hover:bg-cream-100/50">
                      <td className="py-2 px-2 text-indigo-muted">{d.category}</td>
                      <td className="py-2 px-2 font-semibold text-indigo-deep">
                        {d.item}
                      </td>
                      <td className="py-2 px-2 uppercase text-indigo-muted">
                        {d.column}
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-indigo-muted line-through">
                        ₹{d.oldVal}
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums font-bold text-emerald-800">
                        ₹{d.newVal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {diffCount > sampleDiffs.length && (
                <p className="text-[11px] text-indigo-muted italic text-center pt-2">
                  ...and {diffCount - sampleDiffs.length} more price changes across {affectedCategories.length} categories.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
