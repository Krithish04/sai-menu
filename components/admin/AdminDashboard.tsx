"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { MenuData, Section, Item } from "@/types/menu";
import { SaveStatus, SaveState } from "./SaveStatus";
import { MenuQrCard } from "./MenuQrCard";
import { ExcelImportModal } from "./ExcelImportModal";
import { AdminSidebar } from "./AdminSidebar";
import { AdminDashboardOverview } from "./AdminDashboardOverview";
import { AdminItemsTable } from "./AdminItemsTable";
import { AdminCategoriesView } from "./AdminCategoriesView";
import { AdminBulkPriceView } from "./AdminBulkPriceView";
import { AdminBackupExcelView } from "./AdminBackupExcelView";
import { AdminItemDrawer } from "./AdminItemDrawer";
import {
  ExternalLink,
  Utensils,
  Search,
  AlertTriangle,
  RotateCcw,
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
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Item Drawer state
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState<Section>(menu.sections[0]);
  const [drawerItem, setDrawerItem] = useState<Item | null>(null);

  // Reset to original state
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetConfirmCode, setResetConfirmCode] = useState("");
  const [isResetting, setIsResetting] = useState(false);

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

  // Sync with URL hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (
        hash === "items" ||
        hash === "categories" ||
        hash === "bulk-price" ||
        hash === "qr" ||
        hash === "backup" ||
        hash === "history" ||
        hash === "overview"
      ) {
        setActiveTab(hash);
      } else if (hash === "menu-qr-card") {
        setActiveTab("qr");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === "history") {
      router.push("/admin/history");
      return;
    }
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `#${tab}`);
    }
  };

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

  // Category update handler
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
    if (!confirm(`Are you sure you want to delete category "${target?.en || categoryId}"?`)) {
      return;
    }
    const updatedSections = menu.sections.filter((s) => s.id !== categoryId);
    const newMenu = { ...menu, sections: updatedSections };
    triggerAutoSave(newMenu, `Deleted category "${target?.en || categoryId}"`);
  };

  const handleCreateCategory = (en: string, gu: string) => {
    const baseSlug = en.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newId = `${baseSlug}-${Date.now().toString(36)}`;

    const newCategory: Section = {
      id: newId,
      en: en.trim(),
      gu: gu.trim(),
      columns: ["price"],
      items: [],
    };

    const newMenu = {
      ...menu,
      sections: [...menu.sections, newCategory],
    };

    triggerAutoSave(newMenu, `Added category "${newCategory.en}"`);
  };

  // Item handlers
  const handleUpdateItem = (catId: string, updatedItem: Item) => {
    const updatedSections = menu.sections.map((sec) => {
      if (sec.id !== catId) return sec;
      return {
        ...sec,
        items: sec.items.map((it) => (it.id === updatedItem.id ? updatedItem : it)),
      };
    });
    const newMenu = { ...menu, sections: updatedSections };
    triggerAutoSave(newMenu, `Updated item "${updatedItem.en}"`);
  };

  const handleDeleteItem = (catId: string, itemId: string) => {
    const cat = menu.sections.find((s) => s.id === catId);
    const item = cat?.items.find((it) => it.id === itemId);
    if (!confirm(`Delete item "${item?.en || itemId}"?`)) return;

    const updatedSections = menu.sections.map((sec) => {
      if (sec.id !== catId) return sec;
      return {
        ...sec,
        items: sec.items.filter((it) => it.id !== itemId),
      };
    });
    const newMenu = { ...menu, sections: updatedSections };
    triggerAutoSave(newMenu, `Deleted "${item?.en || itemId}"`);
  };

  const handleMoveItem = (catId: string, itemIdx: number, direction: "up" | "down") => {
    const cat = menu.sections.find((s) => s.id === catId);
    if (!cat) return;

    const targetIdx = direction === "up" ? itemIdx - 1 : itemIdx + 1;
    if (targetIdx < 0 || targetIdx >= cat.items.length) return;

    const newItems = [...cat.items];
    const temp = newItems[itemIdx];
    newItems[itemIdx] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    const updatedSections = menu.sections.map((s) =>
      s.id === catId ? { ...s, items: newItems } : s
    );
    const newMenu = { ...menu, sections: updatedSections };
    triggerAutoSave(newMenu, `Reordered "${temp.en}"`);
  };

  const handleOpenItemDrawer = (cat: Section, item?: Item | null) => {
    setDrawerCategory(cat);
    setDrawerItem(item || null);
    setIsItemDrawerOpen(true);
  };

  const handleSaveItemDrawer = (savedItem: Item, targetCategoryId: string) => {
    let updatedSections = [...menu.sections];

    if (drawerItem) {
      // Editing existing item
      if (drawerCategory.id === targetCategoryId) {
        // Same category
        updatedSections = updatedSections.map((sec) =>
          sec.id === targetCategoryId
            ? {
                ...sec,
                items: sec.items.map((it) =>
                  it.id === savedItem.id ? savedItem : it
                ),
              }
            : sec
        );
      } else {
        // Moved to a different category
        updatedSections = updatedSections.map((sec) => {
          if (sec.id === drawerCategory.id) {
            return {
              ...sec,
              items: sec.items.filter((it) => it.id !== savedItem.id),
            };
          }
          if (sec.id === targetCategoryId) {
            return {
              ...sec,
              items: [...sec.items, savedItem],
            };
          }
          return sec;
        });
      }
      triggerAutoSave(
        { ...menu, sections: updatedSections },
        `Edited "${savedItem.en}"`
      );
    } else {
      // Adding new item
      updatedSections = updatedSections.map((sec) =>
        sec.id === targetCategoryId
          ? { ...sec, items: [...sec.items, savedItem] }
          : sec
      );
      triggerAutoSave(
        { ...menu, sections: updatedSections },
        `Added "${savedItem.en}"`
      );
    }
  };

  // Bulk Price Apply handler
  const handleApplyBulkPrice = (
    updatedCategories: Section[],
    summary: string
  ) => {
    const updatedMap = new Map(updatedCategories.map((c) => [c.id, c]));
    const newSections = menu.sections.map((sec) =>
      updatedMap.has(sec.id) ? updatedMap.get(sec.id)! : sec
    );
    const newMenu = { ...menu, sections: newSections };
    triggerAutoSave(newMenu, summary);
  };

  // Excel handlers
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

  // Title for main top bar based on active tab
  const getTabTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Dashboard Overview";
      case "items":
        return "Menu Items & Inline Price Editor";
      case "categories":
        return "Menu Categories Management";
      case "bulk-price":
        return "Bulk Price Adjustments";
      case "qr":
        return "Menu QR Code & Print Suite";
      case "backup":
        return "Excel Spreadsheet & Backup Tools";
      default:
        return "Admin Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col lg:flex-row w-full">
      {/* 1. Left Sidebar (Fixed 240px on lg: >=1024px) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        restaurantName={menu.restaurant.name}
      />

      {/* 2. Main Content Area (Full width with 24-32px padding, max 1600px) */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Main Area Sticky Top Bar */}
        <header className="sticky top-0 z-30 w-full h-14 bg-cream-100 border-b border-cream-300 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-serif font-bold text-sm sm:text-base text-indigo-deep truncate">
              {getTabTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live Search Box (Visible when on items tab or global) */}
            <div className="relative hidden sm:flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-indigo-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "items" && e.target.value.trim()) {
                    setActiveTab("items");
                  }
                }}
                placeholder="Search dishes..."
                className="w-48 lg:w-64 min-h-[36px] pl-8 pr-3 py-1 text-xs bg-cream-50 border border-cream-300 rounded-full text-indigo focus:outline-none focus:ring-2 focus:ring-ribbon"
              />
            </div>

            {/* Save Status Badge */}
            <SaveStatus
              status={saveStatus}
              onRetry={() => persistMenu(latestMenuRef.current, "Retry save")}
            />

            {/* Live Menu Link */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 text-xs font-semibold rounded bg-cream-200 hover:bg-cream-300 border border-cream-300 text-indigo transition-colors"
            >
              <Utensils className="w-3.5 h-3.5 text-ribbon" />
              <span className="hidden md:inline">Live Menu</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          </div>
        </header>

        {/* Content Pane (Full width with 24 to 32px padding, max-w-[1600px] on ultra-wide) */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === "overview" && (
            <AdminDashboardOverview
              menu={menu}
              saveStatus={saveStatus}
              onNavigateTab={handleSelectTab}
              onDownloadExcel={handleDownloadExcel}
              onTriggerUploadExcel={() => excelFileInputRef.current?.click()}
            />
          )}

          {activeTab === "items" && (
            <AdminItemsTable
              categories={menu.sections}
              searchQuery={searchQuery}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onMoveItem={handleMoveItem}
              onOpenItemDrawer={handleOpenItemDrawer}
            />
          )}

          {activeTab === "categories" && (
            <AdminCategoriesView
              categories={menu.sections}
              onUpdateCategory={handleUpdateCategory}
              onMoveCategoryUp={handleMoveCategoryUp}
              onMoveCategoryDown={handleMoveCategoryDown}
              onDeleteCategory={handleDeleteCategory}
              onCreateCategory={handleCreateCategory}
            />
          )}

          {activeTab === "bulk-price" && (
            <AdminBulkPriceView
              categories={menu.sections}
              onApplyBulkPrice={handleApplyBulkPrice}
            />
          )}

          {activeTab === "qr" && (
            <div id="menu-qr-card">
              <MenuQrCard
                restaurantName={menu.restaurant.name}
                guRestaurantName={menu.restaurant.guName}
              />
            </div>
          )}

          {activeTab === "backup" && (
            <AdminBackupExcelView
              onDownloadExcel={handleDownloadExcel}
              onUploadExcel={handleUploadExcel}
              isExcelUploading={isExcelUploading}
              onOpenResetDialog={() => setIsResetDialogOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Hidden File Input for Excel Upload */}
      <input
        ref={excelFileInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleUploadExcel}
        className="hidden"
      />

      {/* 480px Item Drawer (Add / Edit item without stretching) */}
      <AdminItemDrawer
        isOpen={isItemDrawerOpen}
        onClose={() => setIsItemDrawerOpen(false)}
        item={drawerItem}
        currentCategory={drawerCategory}
        allCategories={menu.sections}
        onSave={handleSaveItemDrawer}
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
    </div>
  );
}
