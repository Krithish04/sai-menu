"use client";

import React from "react";
import { MenuData } from "@/types/menu";
import {
  Utensils,
  Layers,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  Printer,
  TrendingUp,
  FileSpreadsheet,
  QrCode,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface AdminDashboardOverviewProps {
  menu: MenuData;
  saveStatus: string;
  onNavigateTab: (tab: string) => void;
  onDownloadExcel: () => void;
  onTriggerUploadExcel: () => void;
}

export function AdminDashboardOverview({
  menu,
  saveStatus,
  onNavigateTab,
  onDownloadExcel,
  onTriggerUploadExcel,
}: AdminDashboardOverviewProps) {
  const totalItems = menu.sections.reduce(
    (sum, sec) => sum + (sec.items?.length || 0),
    0
  );

  const soldOutItems = menu.sections.reduce(
    (sum, sec) => sum + sec.items.filter((it) => it.soldOut).length,
    0
  );

  const featuredItems = menu.sections.reduce(
    (sum, sec) => sum + sec.items.filter((it) => it.featured).length,
    0
  );

  return (
    <div className="space-y-8 w-full max-w-6xl">
      {/* 1. Row of 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Menu Items */}
        <div
          onClick={() => onNavigateTab("items")}
          className="p-4 rounded-lg border border-cream-300 bg-cream-50 shadow-paper hover:bg-cream-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-muted">
              Total Dishes
            </span>
            <div className="p-2 rounded-full bg-cream-200 text-indigo">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-indigo-deep">
              {totalItems}
            </span>
            <span className="text-xs text-indigo-muted">across all sections</span>
          </div>
        </div>

        {/* Categories Count */}
        <div
          onClick={() => onNavigateTab("categories")}
          className="p-4 rounded-lg border border-cream-300 bg-cream-50 shadow-paper hover:bg-cream-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-muted">
              Categories
            </span>
            <div className="p-2 rounded-full bg-cream-200 text-indigo">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-indigo-deep">
              {menu.sections.length}
            </span>
            <span className="text-xs text-indigo-muted">
              {menu.sections.filter((s) => s.hidden).length} hidden
            </span>
          </div>
        </div>

        {/* Sold-out Count */}
        <div
          onClick={() => onNavigateTab("items")}
          className="p-4 rounded-lg border border-cream-300 bg-cream-50 shadow-paper hover:bg-cream-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-muted">
              Sold Out Dishes
            </span>
            <div className="p-2 rounded-full bg-ribbon/10 text-ribbon">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-serif text-3xl font-extrabold ${soldOutItems > 0 ? "text-ribbon" : "text-indigo-deep"}`}>
              {soldOutItems}
            </span>
            <span className="text-xs text-indigo-muted">
              {featuredItems} Sai Special
            </span>
          </div>
        </div>

        {/* Last Saved Status */}
        <div className="p-4 rounded-lg border border-cream-300 bg-cream-50 shadow-paper">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-muted">
              Database Sync
            </span>
            <div className="p-2 rounded-full bg-cream-200 text-indigo">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="font-serif text-xl font-bold text-indigo-deep capitalize flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  saveStatus === "saving"
                    ? "bg-amber-500 animate-pulse"
                    : saveStatus === "failed"
                    ? "bg-ribbon"
                    : "bg-emerald-600"
                }`}
              />
              {saveStatus === "saving" ? "Saving Changes..." : "Synced to Redis"}
            </span>
            <span className="text-[11px] text-indigo-muted block mt-0.5">
              Real-time auto-backup active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="p-5 rounded-lg border border-cream-300 bg-cream-50 shadow-paper space-y-3">
        <h3 className="font-serif font-bold text-sm text-indigo-deep uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={onDownloadExcel}
            className="flex items-center gap-2.5 p-3 rounded-md bg-cream-100 hover:bg-cream-200 border border-cream-300 text-indigo text-xs font-semibold transition-colors shadow-2xs min-h-[44px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Download Excel</span>
          </button>

          <button
            type="button"
            onClick={onTriggerUploadExcel}
            className="flex items-center gap-2.5 p-3 rounded-md bg-indigo text-white hover:bg-indigo-deep text-xs font-semibold transition-colors shadow-paper min-h-[44px]"
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span>Upload Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("qr")}
            className="flex items-center gap-2.5 p-3 rounded-md bg-cream-100 hover:bg-cream-200 border border-cream-300 text-indigo text-xs font-semibold transition-colors shadow-2xs min-h-[44px]"
          >
            <QrCode className="w-4 h-4 text-ribbon shrink-0" />
            <span>Print Menu QR</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("bulk-price")}
            className="flex items-center gap-2.5 p-3 rounded-md bg-cream-100 hover:bg-cream-200 border border-cream-300 text-indigo text-xs font-semibold transition-colors shadow-2xs min-h-[44px]"
          >
            <TrendingUp className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Bulk Price Change</span>
          </button>
        </div>
      </div>

      {/* 3. Recent Changes from History */}
      <div className="p-5 rounded-lg border border-cream-300 bg-cream-50 shadow-paper space-y-3">
        <div className="flex items-center justify-between border-b border-cream-200 pb-2">
          <div>
            <h3 className="font-serif font-bold text-sm text-indigo-deep uppercase tracking-wider">
              Change History & Safety Snapshots
            </h3>
            <p className="text-xs text-indigo-muted mt-0.5">
              Every save automatically creates a restorable snapshot in Upstash Redis.
            </p>
          </div>
          <Link
            href="/admin/history"
            className="inline-flex items-center gap-1 text-xs font-semibold text-ribbon hover:text-ribbon-dark hover:underline min-h-[36px]"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="text-xs text-indigo-muted space-y-2 py-2">
          <p>
            You can restore any previous menu version with one click from the{" "}
            <Link href="/admin/history" className="text-ribbon font-semibold hover:underline">
              History page
            </Link>
            . Safety snapshots are recorded before Excel imports, factory resets, and bulk price updates.
          </p>
        </div>
      </div>
    </div>
  );
}
