"use client";

import React from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved" | "failed";

interface SaveStatusProps {
  status: SaveState;
  onRetry?: () => void;
}

export function SaveStatus({ status, onRetry }: SaveStatusProps) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-muted/10 text-indigo border border-indigo-muted/20">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo" />
        <span>Saving…</span>
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>Saved ✓</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-ribbon/10 text-ribbon-dark border border-ribbon/30 hover:bg-ribbon/20 transition-colors"
    >
      <AlertCircle className="w-3.5 h-3.5 text-ribbon" />
      <span>Failed, retry ⟳</span>
    </button>
  );
}
