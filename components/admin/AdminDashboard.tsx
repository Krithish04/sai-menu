"use client";

import React, { useState, useRef, useCallback } from "react";
import { MenuData, Section, Item } from "@/data/menu";
import { CategoryPanel } from "./CategoryPanel";
import { SaveStatus, SaveState } from "./SaveStatus";
import { QrManagerModal } from "./QrManagerModal";
import { MenuQrCard } from "./MenuQrCard";
import { ExcelImportModal } from "./ExcelImportModal";
import {
  ExternalLink,
  LogOut,
  Utensils,
  History,
  Plus,
  Layers,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  QrCode,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminDashboardProps {
  initialMenu: MenuData;
}

export function AdminDashboard({ initialMenu }: AdminDashboardProps) {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuData>(initialMenu);
  const [saveStatus, setSaveStatus] = useState<SaveState>("idle");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatEn, setNewCatEn] = useState("");
  const [newCatGu, setNewCatGu] = useState("");

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetConfirmCode, setResetConfirmCode] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [quickPrintTable, setQuickPrintTable] = useState(1);

  // Excel Import states
  const [isExcelUploading, setIsExcelUploading] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFileName, setExcelFileName] = useState("");
  const [excelErrors, setExcelErrors] = useState<{ row: number; message: string }[]>([]);
  const [excelSummary, setExcelSummary] = useState<any>(null);
  const [excelParsedMenu, setExcelParsedMenu] = useState<MenuData | null>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestMenuRef = useRef<MenuData>(initialMenu);
  latestMenuRef.current = menu;

  const persistMenu = useCallback(async (menuToSave: MenuData, summary?: string) => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu: menuToSave, summary }),
      });

      if (!res.ok) {
        throw new Error("Save request failed");
      }

      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
      }, 3000);
    } catch (err) {
      console.error("Auto-save error:", err);
      setSaveStatus("failed");
    }
  }, []);

  const triggerAutoSave = useCallback(
    (newMenu: MenuData, summary?: string) => {
      setMenu(newMenu);
      setSaveStatus("saving");

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        persistMenu(newMenu, summary);
      }, 600);
    },
    [persistMenu]
  );

  const handleUpdateCategory = (updatedCat: Section) => {
    const updatedSections = menu.sections.map((sec) =>
      sec.id === updatedCat.id ? updatedCat : sec
    );
    const newMenu = { ...menu, sections: updatedSections };
    triggerAutoSave(newMenu, `Updated ${updatedCat.en}`);
  };

  const handleMoveCategoryUp = (index: number) => {
    if (index === 0) return;
    const updatedSections = [...menu.sections];
    const temp = updatedSections[index];
    updatedSections[index] = updatedSections[index - 1];
    updatedSections[index - 1] = temp;
    const newMenu = { ...menu, sections: updatedSections };
    triggerAutoSave(newMenu, `Reordered category ${temp.en} up`);
  };

  const handleMoveCategoryDown = (index: number) => {
    if (index === menu.sections.length - 1) return;
    const updatedSections = [...menu.sections];
    const temp = updatedSections[index];
    updatedSections[index] = updatedSections[index + 1];
    updatedSections[index + 1] = temp;
    const newMenu = { ...menu, sections: updatedSections };
    triggerAutoSave(newMenu, `Reordered category ${temp.en} down`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const target = menu.sections.find((s) => s.id === categoryId);
    const updatedSections = menu.sections.filter((s) => s.id !== categoryId);
    const newMenu = { ...menu, sections: updatedSections };
    triggerAutoSave(newMenu, `Deleted category "${target?.en || categoryId}"`);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatEn.trim()) return;

    const baseSlug = newCatEn
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const newId = `${baseSlug}-${Date.now().toString(36)}`;

    const newCategory: Section = {
      id: newId,
      en: newCatEn.trim(),
      gu: newCatGu.trim(),
      columns: ["price"],
      items: [],
    };

    const newMenu = {
      ...menu,
      sections: [...menu.sections, newCategory],
    };

    triggerAutoSave(newMenu, `Added category "${newCategory.en}"`);
    setNewCatEn("");
    setNewCatGu("");
    setIsAddingCategory(false);
  };

  const handleMoveItemToCategory = (
    item: Item,
    sourceCatId: string,
    targetCatId: string
  ) => {
    if (sourceCatId === targetCatId) return;

    const sourceCat = menu.sections.find((s) => s.id === sourceCatId);
    const targetCat = menu.sections.find((s) => s.id === targetCatId);
    if (!sourceCat || !targetCat) return;

    const updatedSections = menu.sections.map((sec) => {
      if (sec.id === sourceCatId) {
        return {
          ...sec,
          items: sec.items.filter((i) => i.id !== item.id),
        };
      }
      if (sec.id === targetCatId) {
        return {
          ...sec,
          items: [...sec.items, item],
        };
      }
      return sec;
    });

    const newMenu = { ...menu, sections: updatedSections };
    triggerAutoSave(
      newMenu,
      `Moved "${item.en}" from ${sourceCat.en} to ${targetCat.en}`
    );
  };

  const handleDownloadExcel = () => {
    window.location.href = "/api/admin/excel/export";
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File exceeds the 2 MB maximum size limit.");
      if (excelFileInputRef.current) excelFileInputRef.current.value = "";
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please upload a valid Excel .xlsx workbook.");
      if (excelFileInputRef.current) excelFileInputRef.current.value = "";
      return;
    }

    setIsExcelUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/excel/preview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to analyze Excel file.");
        return;
      }

      setExcelFileName(file.name);
      setExcelErrors(data.errors || []);
      setExcelSummary(data.summary || null);
      setExcelParsedMenu(data.parsedMenu || null);
      setIsExcelModalOpen(true);
    } catch {
      alert("Failed to upload Excel file. Please try again.");
    } finally {
      setIsExcelUploading(false);
      if (excelFileInputRef.current) excelFileInputRef.current.value = "";
    }
  };

  const handleResetToFactory = async () => {
    if (resetConfirmCode !== "RESET") {
      alert("Please type 'RESET' exactly to confirm.");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "RESET" }),
      });

      if (!res.ok) {
        throw new Error("Reset failed");
      }

      alert("Menu successfully reset to original seed data!");
      window.location.reload();
    } catch {
      alert("Failed to reset menu. Please try again.");
    } finally {
      setIsResetting(false);
      setIsResetDialogOpen(false);
      setResetConfirmCode("");
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 max-w-3xl mx-auto border-x border-cream-300 pb-24">
      {/* Sticky Admin Header */}
      <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-sm border-b border-cream-300 p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="ribbon-tag text-xs font-bold py-1">Admin</span>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-indigo-deep leading-tight">
                {menu.restaurant.name}
              </h1>
              <p className="text-[11px] text-indigo-muted hidden sm:block">
                Edit items, prices & categories in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SaveStatus
              status={saveStatus}
              onRetry={() => persistMenu(latestMenuRef.current, "Retry save")}
            />

            {/* Menu QR Code Navigation Link */}
            <a
              href="#menu-qr-card"
              className="inline-flex items-center gap-1.5 min-h-[38px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded bg-cream-200 border border-cream-300 text-indigo hover:bg-cream-300 transition-colors shadow-xs"
              title="Jump to Menu QR Code & Print Suite"
            >
              <QrCode className="w-3.5 h-3.5 text-ribbon" />
              <span className="hidden sm:inline">Menu QR</span>
            </a>

            {/* Live Menu Button */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded bg-cream-200 border border-cream-300 text-indigo hover:bg-cream-300 transition-colors"
            >
              <Utensils className="w-3.5 h-3.5 text-ribbon" />
              <span className="hidden sm:inline">Live Menu</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            {/* History link */}
            <Link
              href="/admin/history"
              className="inline-flex items-center gap-1.5 min-h-[38px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded bg-cream-200 border border-cream-300 text-indigo hover:bg-cream-300 transition-colors"
              title="Change History"
            >
              <History className="w-3.5 h-3.5 text-indigo-muted" />
              <span className="hidden md:inline">History</span>
            </Link>

            {/* Logout */}
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center justify-center min-h-[38px] min-w-[38px] p-2 text-xs font-semibold rounded bg-ribbon text-white hover:bg-ribbon-dark transition-colors shadow-paper"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main List of Categories */}
      <main className="p-3 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-ribbon" />
            <h2 className="font-serif text-base sm:text-lg font-bold text-indigo-deep">
              Categories ({menu.sections.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1 text-xs font-semibold rounded bg-indigo text-white hover:bg-indigo-deep transition-colors shadow-paper"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        </div>

        {/* Add Category Form Modal */}
        {isAddingCategory && (
          <form
            onSubmit={handleCreateCategory}
            className="p-4 rounded-lg border-2 border-indigo/30 bg-cream-50 space-y-3 shadow-paper"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-deep">
              Add New Category
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newCatEn}
                onChange={(e) => setNewCatEn(e.target.value)}
                placeholder="Category Name in English * (e.g. Desserts)"
                required
                autoFocus
                className="min-h-[38px] px-2.5 py-1 text-sm bg-cream-100/60 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
              />
              <input
                type="text"
                value={newCatGu}
                onChange={(e) => setNewCatGu(e.target.value)}
                placeholder="Category Name in Gujarati (e.g. મીઠાઈ)"
                className="min-h-[38px] px-2.5 py-1 text-sm font-gujarati bg-cream-100/60 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="min-h-[36px] px-3 py-1 text-xs font-semibold rounded bg-cream-200 text-indigo hover:bg-cream-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newCatEn.trim()}
                className="min-h-[36px] inline-flex items-center gap-1.5 px-4 py-1 text-xs font-semibold rounded bg-ribbon text-white hover:bg-ribbon-dark disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Category</span>
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {menu.sections.map((category, idx) => (
            <CategoryPanel
              key={category.id}
              category={category}
              allCategories={menu.sections}
              isFirst={idx === 0}
              isLast={idx === menu.sections.length - 1}
              onUpdateCategory={handleUpdateCategory}
              onMoveItemToCategory={handleMoveItemToCategory}
              onMoveCategoryUp={() => handleMoveCategoryUp(idx)}
              onMoveCategoryDown={() => handleMoveCategoryDown(idx)}
              onDeleteCategory={handleDeleteCategory}
            />
          ))}
        </div>

        {/* Menu QR Code & Table Tents Suite */}
        <MenuQrCard
          restaurantName={menu.restaurant.name}
          guRestaurantName={menu.restaurant.guName}
        />

        {/* Excel Spreadsheet & Reset Tools */}
        <div className="mt-8 p-4 sm:p-5 rounded-xl border-2 border-cream-300 bg-cream-50 space-y-4 shadow-paper">
          <div className="flex items-center justify-between border-b border-cream-200 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-indigo-deep">
                  Excel Spreadsheet & Reset Tools
                </h3>
              </div>
              <p className="text-[11px] text-indigo-muted mt-0.5">
                Download the complete menu as an Excel workbook, upload updated spreadsheets, or reset to original menu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Download Excel */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg bg-cream-200 hover:bg-cream-300 border border-cream-300 text-indigo transition-colors shadow-xs"
              title="Download entire menu as Excel spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Download Excel</span>
            </button>

            {/* Upload Excel */}
            <input
              ref={excelFileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleUploadExcel}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => excelFileInputRef.current?.click()}
              disabled={isExcelUploading}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg bg-indigo text-white hover:bg-indigo-deep transition-colors shadow-paper disabled:opacity-50"
              title="Upload modified Excel spreadsheet (.xlsx)"
            >
              <Upload className="w-4 h-4" />
              <span>{isExcelUploading ? "Analyzing Excel..." : "Upload Excel"}</span>
            </button>

            {/* Reset Factory Menu */}
            <button
              type="button"
              onClick={() => setIsResetDialogOpen(true)}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-ribbon/10 hover:bg-ribbon/20 border border-ribbon/30 text-ribbon-dark transition-colors ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-ribbon" />
              <span>Reset to Original Menu</span>
            </button>
          </div>
        </div>
      </main>

      {/* Reset Confirmation Dialog */}
      {isResetDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-deep/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border-2 border-ribbon bg-cream-50 p-6 shadow-paper-lift space-y-4">
            <div className="flex items-center gap-2 text-ribbon-dark font-serif font-bold text-lg">
              <AlertTriangle className="w-5 h-5 text-ribbon" />
              <span>Reset Menu to Factory Defaults?</span>
            </div>

            <p className="text-xs text-indigo leading-relaxed">
              This will overwrite all current prices, items, and categories with
              the original menu transcribed from the printed photos. A safety
              snapshot will be preserved in History.
            </p>

            <div>
              <label className="block text-xs font-bold text-indigo-muted mb-1">
                Type <span className="font-mono text-ribbon font-bold">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmCode}
                onChange={(e) => setResetConfirmCode(e.target.value)}
                placeholder="RESET"
                className="w-full min-h-[40px] px-3 py-1 font-mono text-sm bg-cream-100 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => {
                  setIsResetDialogOpen(false);
                  setResetConfirmCode("");
                }}
                className="min-h-[38px] px-3.5 py-1 text-xs font-semibold rounded bg-cream-200 text-indigo hover:bg-cream-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToFactory}
                disabled={resetConfirmCode !== "RESET" || isResetting}
                className="min-h-[38px] px-4 py-1 text-xs font-semibold rounded bg-ribbon text-white hover:bg-ribbon-dark disabled:opacity-40 transition-colors"
              >
                {isResetting ? "Resetting..." : "Confirm Factory Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Generator & Print Modal */}
      <QrManagerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        initialTable={quickPrintTable}
      />

      {/* Excel Import Preview & Validation Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        fileName={excelFileName}
        errors={excelErrors}
        summary={excelSummary}
        parsedMenu={excelParsedMenu}
        onApplySuccess={(newMenu) => {
          setMenu(newMenu);
          alert("Menu successfully updated from Excel! A safety snapshot was recorded in History.");
        }}
      />
    </div>
  );
}
