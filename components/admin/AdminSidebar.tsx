"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  TrendingUp,
  QrCode,
  FileSpreadsheet,
  History,
  ExternalLink,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  restaurantName: string;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  restaurantName,
}: AdminSidebarProps) {
  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "items", label: "Menu Items", icon: UtensilsCrossed },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "bulk-price", label: "Bulk Price Change", icon: TrendingUp },
    { id: "qr", label: "QR Code & Print", icon: QrCode },
    { id: "backup", label: "Backup & Excel", icon: FileSpreadsheet },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <>
      {/* Desktop Fixed Left Sidebar (240px on lg: >=1024px) */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col justify-between h-screen sticky top-0 bg-cream-50 border-r border-cream-300 p-4 shadow-xs">
        {/* Top: Restaurant Logo and Name */}
        <div>
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-cream-300">
            <div className="w-8 h-8 rounded-full bg-indigo-deep text-cream-50 flex items-center justify-center font-serif font-bold text-sm shadow-xs shrink-0">
              SS
            </div>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-sm text-indigo-deep truncate">
                {restaurantName}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider text-ribbon">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-indigo-deep text-white shadow-xs"
                      : "text-indigo hover:bg-cream-200"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-cream-100" : "text-indigo-muted"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Live Menu Link and Log out */}
        <div className="pt-4 border-t border-cream-300 space-y-1.5">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md text-indigo hover:bg-cream-200 transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-ribbon" />
              <span>View Live Menu</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <form action="/api/admin/logout" method="POST" className="w-full">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md text-ribbon hover:bg-ribbon/10 transition-colors min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile & Tablet Navigation Bar (<1024px) */}
      <div className="lg:hidden w-full bg-cream-50 border-b border-cream-300 p-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold min-h-[40px] whitespace-nowrap transition-colors border select-none ${
                  isActive
                    ? "bg-indigo-deep text-white border-indigo-deep shadow-xs"
                    : "bg-cream-100 text-indigo border-cream-300 hover:bg-cream-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
