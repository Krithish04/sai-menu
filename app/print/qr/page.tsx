"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Printer, ArrowLeft, Smartphone, ShieldCheck } from "lucide-react";

export default function PrintableQrPage() {
  const [mode, setMode] = useState<"tables" | "master" | "single">("tables");
  const [singleTable, setSingleTable] = useState<number>(1);

  // Read query parameters on mount if opened with ?mode=single&table=N
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("mode");
      if (m === "master" || m === "tables" || m === "single") {
        setMode(m);
      }
      const t = parseInt(params.get("table") || "", 10);
      if (t >= 1 && t <= 20) {
        setSingleTable(t);
      }
    }
  }, []);

  // Gujarati numerals helper
  const toGuDigits = (num: number) => {
    const guDigits = ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"];
    return num
      .toString()
      .split("")
      .map((d) => guDigits[parseInt(d, 10)])
      .join("");
  };

  // Generate cards based on selected mode
  const cards =
    mode === "tables"
      ? Array.from({ length: 20 }, (_, i) => ({
          tableNum: i + 1,
          qrSrc: `/qr/table-${i + 1}.png`,
        }))
      : mode === "single"
      ? Array.from({ length: 4 }, () => ({
          tableNum: singleTable,
          qrSrc: `/qr/table-${singleTable}.png`,
        }))
      : Array.from({ length: 4 }, () => ({
          tableNum: null,
          qrSrc: `/qr/menu-qr.png`,
        }));

  // Chunk into groups of 4 for A4 pages
  const pages: (typeof cards)[] = [];
  for (let i = 0; i < cards.length; i += 4) {
    pages.push(cards.slice(i, i + 4));
  }

  return (
    <div className="min-h-screen bg-cream-200 print:bg-white text-indigo">
      {/* Non-printable Screen Toolbar */}
      <div className="no-print sticky top-0 z-50 bg-cream-50/95 backdrop-blur-sm border-b border-cream-300 p-4 shadow-paper">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-muted hover:text-indigo min-h-[40px] px-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Menu</span>
            </Link>
            <span className="text-cream-300">|</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-muted hover:text-indigo min-h-[40px] px-2"
            >
              <ShieldCheck className="w-4 h-4 text-ribbon" />
              <span>Admin</span>
            </Link>
            <div>
              <h1 className="font-serif font-bold text-base sm:text-lg text-indigo-deep">
                Print Table Tent QR Cards
              </h1>
              <p className="text-xs text-indigo-muted">
                A6 Size (4 per A4 sheet) · Designed for laminated table tents
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            {/* Mode Selector */}
            <div className="inline-flex flex-wrap items-center rounded-md border border-cream-300 bg-cream-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode("tables")}
                className={`px-2.5 sm:px-3 py-1.5 rounded min-h-[36px] transition-colors ${
                  mode === "tables"
                    ? "bg-indigo text-white shadow-sm"
                    : "text-indigo-muted hover:text-indigo"
                }`}
              >
                Tables 1–20 (5 sheets)
              </button>
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`px-2.5 sm:px-3 py-1.5 rounded min-h-[36px] transition-colors ${
                  mode === "single"
                    ? "bg-indigo text-white shadow-sm"
                    : "text-indigo-muted hover:text-indigo"
                }`}
              >
                Single Table (1 sheet)
              </button>
              <button
                type="button"
                onClick={() => setMode("master")}
                className={`px-2.5 sm:px-3 py-1.5 rounded min-h-[36px] transition-colors ${
                  mode === "master"
                    ? "bg-indigo text-white shadow-sm"
                    : "text-indigo-muted hover:text-indigo"
                }`}
              >
                Master QR (1 sheet)
              </button>
            </div>

            {/* Single Table Selector if mode is single */}
            {mode === "single" && (
              <div className="flex items-center gap-1 text-xs font-semibold">
                <label htmlFor="table-select" className="text-indigo-muted">
                  Table:
                </label>
                <select
                  id="table-select"
                  value={singleTable}
                  onChange={(e) => setSingleTable(parseInt(e.target.value, 10))}
                  className="min-h-[36px] px-2 py-1 bg-cream-50 border border-cream-300 rounded font-bold text-indigo"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      Table {n} ({toGuDigits(n)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 min-h-[40px] px-3.5 sm:px-4 py-2 rounded-md bg-ribbon hover:bg-ribbon-dark text-white font-semibold text-xs sm:text-sm shadow-paper transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-12 print:space-y-0 print:p-0 print:m-0">
        {pages.map((pageGroup, pageIdx) => (
          <div
            key={pageIdx}
            className="a4-sheet bg-cream-50 print:bg-white shadow-paper-lift print:shadow-none mx-auto border print:border-none border-cream-300 p-3 sm:p-6 print:p-0 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-6 print:gap-4 w-full"
            style={{
              minHeight: "297mm",
              boxSizing: "border-box",
              pageBreakAfter: pageIdx < pages.length - 1 ? "always" : "auto",
              breakAfter: pageIdx < pages.length - 1 ? "page" : "auto",
            }}
          >
            {pageGroup.map((card, cardIdx) => (
              <div
                key={cardIdx}
                className="table-card relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-lg border-2 border-indigo-deep bg-cream-50/70 print:bg-white text-center print:border-indigo-deep print:border-2 w-full max-w-sm sm:max-w-none mx-auto"
                style={{
                  minHeight: "138mm",
                  boxSizing: "border-box",
                }}
              >
                {/* Vintage Corner Ornaments */}
                <div className="absolute top-1.5 left-2 text-cream-400 font-serif text-sm">
                  ❦
                </div>
                <div className="absolute top-1.5 right-2 text-cream-400 font-serif text-sm">
                  ❦
                </div>

                {/* Restaurant Brand Header */}
                <div className="pt-1">
                  <h2 className="font-serif text-lg sm:text-xl font-black text-indigo-deep tracking-tight leading-tight">
                    Shree Sai Restaurant
                  </h2>
                  <p className="font-gujarati text-xs sm:text-sm font-bold text-indigo-muted">
                    શ્રી સાંઈ રેસ્ટોરન્ટ
                  </p>
                  <p className="font-serif italic text-[10px] sm:text-[11px] text-indigo-muted mt-0.5">
                    Since 1989 · Salabatpura, Surat
                  </p>
                </div>

                {/* Table Badge or Menu Ribbon */}
                <div className="my-1.5">
                  <div
                    className="ribbon-tag text-xs sm:text-sm font-bold px-4 py-1"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                    }}
                  >
                    <span>
                      {card.tableNum
                        ? `TABLE ${card.tableNum} · ટેબલ ${toGuDigits(
                            card.tableNum
                          )}`
                        : "DIGITAL MENU · ડિજિટલ મેનુ"}
                    </span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="p-2 rounded-md bg-white border border-cream-300 shadow-xs flex flex-col items-center justify-center">
                  <Image
                    src={card.qrSrc}
                    alt={
                      card.tableNum
                        ? `Table ${card.tableNum} QR Code`
                        : "Menu QR Code"
                    }
                    width={176}
                    height={176}
                    unoptimized
                    className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
                  />
                </div>

                {/* Scan Call to Action */}
                <div className="space-y-0.5 pt-1">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm text-indigo-deep">
                    <Smartphone className="w-3.5 h-3.5 text-ribbon" />
                    <span>Scan for Menu / મેનુ માટે સ્કેન કરો</span>
                  </div>
                  <p className="text-[10px] text-indigo-muted">
                    Open your phone camera & point at the QR code
                  </p>
                </div>

                {/* Footer Tagline */}
                <div className="w-full pt-2 border-t border-cream-300/80 flex items-center justify-between text-[9px] text-indigo-muted font-medium px-1">
                  <span>Pure Veg. South Indian & Fast Food</span>
                  <span>(M) 81408 82995</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          .table-card {
            border: 2px solid #141b42 !important;
            background: #ffffff !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
