"use client";

import React, { useRef } from "react";
import { FileSpreadsheet, Upload, RotateCcw, AlertTriangle, ShieldCheck, Info } from "lucide-react";

interface AdminBackupExcelViewProps {
  onDownloadExcel: () => void;
  onUploadExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isExcelUploading: boolean;
  onOpenResetDialog: () => void;
}

export function AdminBackupExcelView({
  onDownloadExcel,
  onUploadExcel,
  isExcelUploading,
  onOpenResetDialog,
}: AdminBackupExcelViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 w-full max-w-6xl">
      <div>
        <h2 className="font-serif text-lg font-bold text-indigo-deep">
          Backup, Excel Import & Reset Tools
        </h2>
        <p className="text-xs text-indigo-muted mt-0.5">
          Export your complete menu catalog to a formatted Excel workbook (.xlsx), batch-update prices/items offline, or restore factory presets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Actions & Controls */}
        <div className="lg:col-span-5 p-5 rounded-lg border border-cream-300 bg-cream-50 shadow-paper space-y-5">
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-indigo-deep uppercase tracking-wider">
              Excel Actions
            </h3>

            {/* Download Excel */}
            <div className="p-3.5 rounded-lg bg-cream-100 border border-cream-300 space-y-2">
              <span className="text-xs font-bold text-indigo-deep block">
                Export to Excel (.xlsx)
              </span>
              <p className="text-[11px] text-indigo-muted leading-relaxed">
                Generates a clean workbook formatted for non-technical owners with frozen bold headers, cell formatting, and dropdown validations.
              </p>
              <button
                type="button"
                onClick={onDownloadExcel}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-cream-200 hover:bg-cream-300 border border-cream-300 text-indigo transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Download Excel (.xlsx)</span>
              </button>
            </div>

            {/* Upload Excel */}
            <div className="p-3.5 rounded-lg bg-cream-100 border border-cream-300 space-y-2">
              <span className="text-xs font-bold text-indigo-deep block">
                Import from Excel (.xlsx)
              </span>
              <p className="text-[11px] text-indigo-muted leading-relaxed">
                Choose an edited .xlsx file (max 2 MB). The server parses and validates the data, showing a diff preview before applying changes.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={onUploadExcel}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExcelUploading}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-indigo text-white hover:bg-indigo-deep disabled:opacity-50 transition-colors shadow-paper"
              >
                <Upload className="w-4 h-4" />
                <span>{isExcelUploading ? "Analyzing Workbook..." : "Upload Excel File"}</span>
              </button>
            </div>
          </div>

          {/* Reset Factory Menu */}
          <div className="pt-4 border-t border-cream-200 space-y-2">
            <span className="text-xs font-bold text-ribbon-dark uppercase tracking-wider block">
              Danger Zone
            </span>
            <p className="text-[11px] text-indigo-muted leading-relaxed">
              Reset all menu data back to the original photo transcription. A safety snapshot is automatically created first.
            </p>
            <button
              type="button"
              onClick={onOpenResetDialog}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-ribbon/10 hover:bg-ribbon/20 border border-ribbon/30 text-ribbon-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-ribbon" />
              <span>Reset to Original Menu</span>
            </button>
          </div>
        </div>

        {/* Right Column: Workbook Layout & Guidelines */}
        <div className="lg:col-span-7 p-5 rounded-lg border border-cream-300 bg-cream-50 shadow-paper space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-cream-200">
            <Info className="w-4 h-4 text-indigo-muted" />
            <h3 className="font-serif font-bold text-sm text-indigo-deep uppercase tracking-wider">
              Excel Structure & Formatting Guide
            </h3>
          </div>

          <div className="space-y-3 text-xs text-indigo leading-relaxed">
            <div className="p-3 rounded-md bg-cream-100/70 border border-cream-300 space-y-1">
              <span className="font-bold text-indigo-deep block">Sheet 1: Menu</span>
              <p className="text-indigo-muted">
                Contains one row per dish in the current menu order. Columns include:
                <code className="text-[11px] font-mono bg-cream-200 px-1 py-0.5 rounded ml-1">
                  Group | Category (EN) | Category (GU) | Item (EN) | Item (GU) | Half | Full | Single | Plate | Oil | Butter | Sold Out | Featured | Hidden
                </code>
              </p>
            </div>

            <div className="p-3 rounded-md bg-cream-100/70 border border-cream-300 space-y-1">
              <span className="font-bold text-indigo-deep block">Sheet 2: Categories</span>
              <p className="text-indigo-muted">
                Contains category properties, column configurations, availability hours (e.g. 13:00 to 23:00 for Pav Bhaji/Pizza), and notes.
              </p>
            </div>

            <div className="p-3 rounded-md bg-cream-100/70 border border-cream-300 space-y-1">
              <span className="font-bold text-indigo-deep block">Sheet 3: Read me</span>
              <p className="text-indigo-muted">
                Plain English instructions for owners. Explains that column headers must not be renamed, formulas are rejected for security, and flag columns accept &quot;Yes&quot; or &quot;No&quot;.
              </p>
            </div>

            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-600/30 text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-[11px]">
                <strong>Safe Import Guarantee:</strong> Every upload is validated with Zod. A live diff preview highlights added, changed, or removed items before you confirm. Nothing is saved until you click &quot;Apply changes&quot;.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
