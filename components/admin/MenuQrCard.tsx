"use client";

import React, { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import Link from "next/link";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Archive,
  FileText,
  Sparkles,
  Layers,
  Utensils,
} from "lucide-react";

interface MenuQrCardProps {
  restaurantName: string;
  guRestaurantName: string;
}

export function MenuQrCard({ restaurantName, guRestaurantName }: MenuQrCardProps) {
  const [siteUrl, setSiteUrl] = useState("http://localhost:3000");
  const [masterDataUrl, setMasterDataUrl] = useState<string>("");
  const [masterSvg, setMasterSvg] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Table QR Section States
  const [tableMode, setTableMode] = useState<"single" | "range">("single");
  const [singleTable, setSingleTable] = useState<number>(1);
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(20);
  const [tableDataUrl, setTableDataUrl] = useState<string>("");
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      setSiteUrl(url.replace(/\/+$/, ""));
    }
  }, []);

  // Generate Master Menu QR (Level H, 4-module margin)
  useEffect(() => {
    if (!siteUrl) return;

    QRCode.toDataURL(siteUrl, {
      errorCorrectionLevel: "H",
      margin: 4,
      width: 1200,
      color: {
        dark: "#141B42", // Brand Indigo
        light: "#FFFFFF",
      },
    }).then(setMasterDataUrl);

    QRCode.toString(siteUrl, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 4,
      color: {
        dark: "#141B42",
        light: "#FFFFFF",
      },
    }).then(setMasterSvg);
  }, [siteUrl]);

  // Generate Single Table QR
  const currentTableUrl = `${siteUrl}/?t=${singleTable}`;
  useEffect(() => {
    if (!siteUrl) return;

    QRCode.toDataURL(currentTableUrl, {
      errorCorrectionLevel: "H",
      margin: 4,
      width: 1200,
      color: {
        dark: "#141B42",
        light: "#FFFFFF",
      },
    }).then(setTableDataUrl);
  }, [currentTableUrl, siteUrl]);

  // Copy URL to Clipboard
  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download Master PNG (1200px)
  const handleDownloadMasterPng = () => {
    if (!masterDataUrl) return;
    const a = document.createElement("a");
    a.href = masterDataUrl;
    a.download = "shree-sai-menu-qr-1200px.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download Master SVG
  const handleDownloadMasterSvg = () => {
    if (!masterSvg) return;
    const blob = new Blob([masterSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shree-sai-menu-qr.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download Master PDF (A4 sheet with emblem, headers, QR, contact)
  const handleDownloadMasterPdf = async () => {
    if (!masterDataUrl) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    // Draw background warm cream tint
    doc.setFillColor(252, 249, 242);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Decorative double border
    doc.setDrawColor(20, 27, 66); // Brand indigo
    doc.setLineWidth(1.2);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
    doc.setDrawColor(184, 34, 43); // Ribbon red
    doc.setLineWidth(0.4);
    doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

    // Restaurant Name Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(20, 27, 66);
    doc.text(restaurantName.toUpperCase(), pageWidth / 2, 38, { align: "center" });

    // Subtitle & Heritage
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(67, 77, 126);
    doc.text("Pure Vegetarian · Since 1989 · Salabatpura, Surat", pageWidth / 2, 46, { align: "center" });

    // Ribbon Callout Banner
    doc.setFillColor(184, 34, 43); // Ribbon red
    doc.rect(35, 54, pageWidth - 70, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("SCAN FOR MENU / DIGITAL MENU", pageWidth / 2, 63, { align: "center" });

    // Master QR Code Image (110mm x 110mm)
    const qrSize = 112;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 78;

    // White QR container box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 210, 184);
    doc.setLineWidth(0.8);
    doc.rect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, "FD");
    doc.addImage(masterDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Instructions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(20, 27, 66);
    doc.text("Point your phone camera to view our live menu", pageWidth / 2, 208, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(67, 77, 126);
    doc.text(`Direct link: ${siteUrl}`, pageWidth / 2, 216, { align: "center" });

    // Contact & Footer
    doc.setDrawColor(226, 210, 184);
    doc.setLineWidth(0.5);
    doc.line(30, 230, pageWidth - 30, 230);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 27, 66);
    doc.text("Takeaway & Delivery Orders: 8140882995, 9499570333", pageWidth / 2, 240, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(110, 121, 168);
    doc.text("Shree Sai Restaurant · Authentic South Indian, Pav Bhaji & Chinese Cuisine", pageWidth / 2, 248, { align: "center" });

    doc.save("shree-sai-menu-qr-a4.pdf");
  };

  // Download Single Table PNG
  const handleDownloadTablePng = () => {
    if (!tableDataUrl) return;
    const a = document.createElement("a");
    a.href = tableDataUrl;
    a.download = `shree-sai-table-${singleTable}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download All Tables as ZIP (using JSZip)
  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    const start = Math.min(rangeStart, rangeEnd);
    const end = Math.max(rangeStart, rangeEnd);
    const total = end - start + 1;

    try {
      const zip = new JSZip();
      const folder = zip.folder("shree-sai-table-qrs");

      for (let i = start; i <= end; i++) {
        setZipProgress(`Generating Table ${i} (${i - start + 1}/${total})...`);
        const url = `${siteUrl}/?t=${i}`;
        const dataUrl = await QRCode.toDataURL(url, {
          errorCorrectionLevel: "H",
          margin: 4,
          width: 1200,
          color: {
            dark: "#141B42",
            light: "#FFFFFF",
          },
        });

        // Strip data URL header to get raw base64
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        folder?.file(`table-${i}.png`, base64Data, { base64: true });
      }

      setZipProgress("Compressing ZIP archive...");
      const content = await zip.generateAsync({ type: "blob" });

      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `shree-sai-tables-${start}-to-${end}-qrs.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Failed to generate ZIP of table QRs:", err);
      alert("Failed to build ZIP archive. Please try a smaller range.");
    } finally {
      setIsZipping(false);
      setZipProgress("");
    }
  };

  return (
    <section
      id="menu-qr-card"
      className="mt-8 p-4 sm:p-6 rounded-xl border-2 border-indigo/20 bg-cream-50 shadow-paper space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo/10 text-indigo-deep">
            <QrCode className="w-6 h-6 text-ribbon" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="ribbon-tag text-[10px] font-bold py-0.5 px-2">
                QR Center
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-indigo-deep">
                Menu QR Code & Table Tents
              </h3>
            </div>
            <p className="text-xs text-indigo-muted mt-0.5">
              Live QR code for digital menu access, print sheets, and table-specific batch archives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/print/qr"
            target="_blank"
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-ribbon hover:bg-ribbon-dark text-white transition-colors shadow-paper"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Open Print Sheets</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Master Menu QR Code */}
        <div className="p-4 sm:p-5 rounded-lg border border-cream-300 bg-white space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-ribbon" />
                <h4 className="font-serif font-bold text-sm sm:text-base text-indigo-deep">
                  Main Digital Menu QR
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cream-200 text-indigo-deep">
                Level H · 4-Module Margins
              </span>
            </div>

            {/* QR Code and Target URL Display */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-3">
              <div className="shrink-0 p-2.5 rounded-lg border-2 border-indigo/20 bg-white shadow-xs">
                {masterDataUrl ? (
                  <Image
                    src={masterDataUrl}
                    alt="Master Menu QR Code"
                    width={180}
                    height={180}
                    unoptimized
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-indigo-muted">
                    Generating...
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-muted block">
                  Scan Destination URL
                </span>
                <div className="flex items-center gap-1.5 p-2 rounded bg-cream-100 border border-cream-300 text-xs font-mono text-indigo-deep break-all">
                  <span className="flex-1 select-all">{siteUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 p-1 rounded hover:bg-cream-200 text-indigo-muted hover:text-indigo"
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-indigo-muted leading-relaxed">
                  Scans directly to the public live menu. Suitable for entrance posters, billing counter standees, and flyers.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons for Master Menu */}
          <div className="pt-2 border-t border-cream-200 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Download PNG */}
              <button
                type="button"
                onClick={handleDownloadMasterPng}
                disabled={!masterDataUrl}
                className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-2.5 py-1 text-xs font-semibold rounded bg-cream-100 hover:bg-cream-200 border border-cream-300 text-indigo transition-colors"
                title="Download 1200px High-Resolution PNG"
              >
                <Download className="w-3.5 h-3.5 text-indigo-muted" />
                <span>PNG (1200px)</span>
              </button>

              {/* Download SVG */}
              <button
                type="button"
                onClick={handleDownloadMasterSvg}
                disabled={!masterSvg}
                className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-2.5 py-1 text-xs font-semibold rounded bg-cream-100 hover:bg-cream-200 border border-cream-300 text-indigo transition-colors"
                title="Download Scalable Vector SVG for Print Vendors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-muted" />
                <span>Vector SVG</span>
              </button>

              {/* Download PDF */}
              <button
                type="button"
                onClick={handleDownloadMasterPdf}
                disabled={!masterDataUrl}
                className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-2.5 py-1 text-xs font-semibold rounded bg-indigo/10 hover:bg-indigo/20 border border-indigo/30 text-indigo-deep transition-colors"
                title="Download Ready-to-Print A4 Poster PDF"
              >
                <FileText className="w-3.5 h-3.5 text-ribbon" />
                <span>A4 Poster PDF</span>
              </button>

              {/* Print Dialog */}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-2.5 py-1 text-xs font-semibold rounded bg-ribbon hover:bg-ribbon-dark text-white transition-colors shadow-xs"
                title="Open Browser Print Dialog"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Table QR Section */}
        <div className="p-4 sm:p-5 rounded-lg border border-cream-300 bg-white space-y-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <div className="flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-ribbon" />
                <h4 className="font-serif font-bold text-sm sm:text-base text-indigo-deep">
                  Table QR Codes (?t=N)
                </h4>
              </div>

              {/* Single vs Range Selector */}
              <div className="inline-flex rounded-md border border-cream-300 bg-cream-100 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTableMode("single")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    tableMode === "single"
                      ? "bg-indigo text-white shadow-xs"
                      : "text-indigo-muted hover:text-indigo"
                  }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setTableMode("range")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    tableMode === "range"
                      ? "bg-indigo text-white shadow-xs"
                      : "text-indigo-muted hover:text-indigo"
                  }`}
                >
                  Range (ZIP)
                </button>
              </div>
            </div>

            {tableMode === "single" ? (
              <div className="pt-3 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-indigo-deep">
                    Table Number:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-indigo-muted">Input:</span>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={singleTable}
                      onChange={(e) =>
                        setSingleTable(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-16 min-h-[30px] px-2 text-center font-bold font-mono bg-cream-100 border border-cream-300 rounded text-indigo"
                    />
                  </div>
                </div>

                {/* Quick Table Chips */}
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSingleTable(n)}
                      className={`min-h-[28px] px-2 text-xs font-bold rounded transition-colors ${
                        singleTable === n
                          ? "bg-ribbon text-white"
                          : "bg-cream-100 hover:bg-cream-200 border border-cream-300 text-indigo"
                      }`}
                    >
                      T{n}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="shrink-0 p-1.5 rounded border border-indigo/20 bg-white shadow-xs">
                    {tableDataUrl ? (
                      <Image
                        src={tableDataUrl}
                        alt={`Table ${singleTable} QR`}
                        width={90}
                        height={90}
                        unoptimized
                        className="w-20 h-20 object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-indigo-deep">
                      Table {singleTable} QR Code
                    </div>
                    <p className="font-mono text-[11px] text-indigo-muted truncate max-w-[200px]">
                      {currentTableUrl}
                    </p>
                    <p className="text-[10px] text-indigo-muted">
                      Customers opening this link get auto-badged as Table {singleTable}.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-3 space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-indigo-deep">
                    Batch Export Range:
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-indigo-muted">From:</span>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={rangeStart}
                      onChange={(e) =>
                        setRangeStart(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-16 min-h-[34px] px-2 text-center font-bold font-mono bg-cream-100 border border-cream-300 rounded text-indigo"
                    />
                    <span className="text-indigo-muted">To:</span>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={rangeEnd}
                      onChange={(e) =>
                        setRangeEnd(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-16 min-h-[34px] px-2 text-center font-bold font-mono bg-cream-100 border border-cream-300 rounded text-indigo"
                    />
                    <span className="text-indigo-muted ml-auto font-mono">
                      {Math.max(rangeStart, rangeEnd) -
                        Math.min(rangeStart, rangeEnd) +
                        1}{" "}
                      tables
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cream-100/70 border border-cream-300 text-[11px] text-indigo-muted leading-relaxed">
                  Generates an individual 1200px PNG for every table in the specified range (`table-1.png` to `table-20.png`), packaged into a single ZIP archive for your graphics or print vendor.
                </div>
              </div>
            )}
          </div>

          {/* Action buttons for Table QR */}
          <div className="pt-2 border-t border-cream-200">
            {tableMode === "single" ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTablePng}
                  disabled={!tableDataUrl}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3 py-1 text-xs font-semibold rounded bg-cream-100 hover:bg-cream-200 border border-cream-300 text-indigo transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-muted" />
                  <span>Download Table {singleTable}</span>
                </button>

                <Link
                  href={`/print/qr?mode=single&table=${singleTable}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3 py-1 text-xs font-semibold rounded bg-indigo hover:bg-indigo-deep text-white transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Card (4-up)</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-1.5 text-xs font-semibold rounded-lg bg-ribbon hover:bg-ribbon-dark text-white transition-colors shadow-paper disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  <span>
                    {isZipping
                      ? zipProgress || "Compressing ZIP..."
                      : `Download All Tables as ZIP (${rangeStart}–${rangeEnd})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
