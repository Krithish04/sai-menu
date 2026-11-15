"use client";

import React, { useState, useMemo } from "react";
import { Section, Item, Price } from "@/data/menu";
import { X, Check, ArrowRight } from "lucide-react";

interface BulkPriceDialogProps {
  category: Section;
  isOpen: boolean;
  onClose: () => void;
  onApply: (updatedCategory: Section) => void;
}

type AdjustType = "fixed" | "percentage";

export function BulkPriceDialog({
  category,
  isOpen,
  onClose,
  onApply,
}: BulkPriceDialogProps) {
  const [type, setType] = useState<AdjustType>("fixed");
  const [direction, setDirection] = useState<"+" | "-">("+");
  const [amount, setAmount] = useState<string>("10");

  const numericVal = parseFloat(amount) || 0;

  // Compute preview of new prices
  const previewItems = useMemo(() => {
    return category.items.map((item) => {
      const newPrice: Price = {};

      const adjust = (oldVal: number | undefined) => {
        if (oldVal === undefined) return undefined;
        let delta = 0;
        if (type === "fixed") {
          delta = numericVal;
        } else {
          delta = Math.round((oldVal * numericVal) / 100);
        }

        const calculated = direction === "+" ? oldVal + delta : oldVal - delta;
        return Math.max(0, calculated);
      };

      if (item.price.single !== undefined) newPrice.single = adjust(item.price.single);
      if (item.price.plate !== undefined) newPrice.plate = adjust(item.price.plate);
      if (item.price.oil !== undefined) newPrice.oil = adjust(item.price.oil);
      if (item.price.butter !== undefined) newPrice.butter = adjust(item.price.butter);
      if (item.price.half !== undefined) newPrice.half = adjust(item.price.half);
      if (item.price.full !== undefined) newPrice.full = adjust(item.price.full);
      if (item.price.price !== undefined) newPrice.price = adjust(item.price.price);

      return {
        ...item,
        price: newPrice,
      };
    });
  }, [category.items, type, direction, numericVal]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      ...category,
      items: previewItems,
    });
    onClose();
  };

  const formatPriceObj = (p: Price) => {
    return Object.entries(p)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}: ₹${v}`)
      .join(", ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-indigo-deep/60 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-lg border-2 border-cream-300 bg-cream-50 shadow-paper-lift overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-300 bg-cream-100">
          <div className="flex items-center gap-2">
            <span className="ribbon-tag text-xs font-bold py-0.5">Bulk Edit</span>
            <h3 className="font-serif font-bold text-base text-indigo-deep">
              Adjust Prices in {category.en}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-indigo-muted hover:text-indigo hover:bg-cream-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Adjustment Controls */}
        <div className="p-4 border-b border-cream-300 bg-cream-100/50 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Direction */}
            <div className="inline-flex rounded border border-cream-300 bg-cream-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setDirection("+")}
                className={`px-3 py-1.5 text-xs font-bold ${
                  direction === "+"
                    ? "bg-emerald-600 text-white"
                    : "text-indigo-muted hover:text-indigo"
                }`}
              >
                + Increase
              </button>
              <button
                type="button"
                onClick={() => setDirection("-")}
                className={`px-3 py-1.5 text-xs font-bold ${
                  direction === "-"
                    ? "bg-ribbon text-white"
                    : "text-indigo-muted hover:text-indigo"
                }`}
              >
                - Decrease
              </button>
            </div>

            {/* Type */}
            <div className="inline-flex rounded border border-cream-300 bg-cream-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setType("fixed")}
                className={`px-3 py-1.5 text-xs font-bold ${
                  type === "fixed"
                    ? "bg-indigo text-white"
                    : "text-indigo-muted hover:text-indigo"
                }`}
              >
                ₹ Fixed Amount
              </button>
              <button
                type="button"
                onClick={() => setType("percentage")}
                className={`px-3 py-1.5 text-xs font-bold ${
                  type === "percentage"
                    ? "bg-indigo text-white"
                    : "text-indigo-muted hover:text-indigo"
                }`}
              >
                % Percentage
              </button>
            </div>

            {/* Input Value */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-indigo-deep">
                {type === "fixed" ? "₹" : "%"}
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-20 min-h-[36px] px-2 text-center font-mono font-bold text-sm bg-cream-50 border border-cream-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Live Preview List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-muted mb-2">
            Preview of Changes ({category.items.length} dishes)
          </div>
          {category.items.map((original, idx) => {
            const modified = previewItems[idx];
            return (
              <div
                key={original.id}
                className="p-2 rounded bg-cream-100/60 border border-cream-200 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-indigo-deep truncate max-w-[45%]">
                  {original.en}
                </span>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="text-indigo-muted/70 line-through">
                    {formatPriceObj(original.price)}
                  </span>
                  <ArrowRight className="w-3 h-3 text-ribbon" />
                  <span className="font-bold text-indigo-deep">
                    {formatPriceObj(modified.price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-cream-300 bg-cream-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-4 py-1.5 text-xs font-semibold rounded bg-cream-200 text-indigo hover:bg-cream-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded bg-ribbon text-white hover:bg-ribbon-dark shadow-paper"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to All {category.items.length} Dishes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
