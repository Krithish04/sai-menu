"use client";

import React, { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import Link from "next/link";
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Smartphone,
  Layers,
  Sparkles,
} from "lucide-react";

interface QrManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTable?: number;
}

type QrTargetMode = "master" | "table" | "custom";

export function QrManagerModal({
  isOpen,
  onClose,
  initialTable = 1,
}: QrManagerModalProps) {
  const [targetMode, setTargetMode] = useState<QrTargetMode>("table");
  const [tableNum, setTableNum] = useState<number>(initialTable);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrSvg, setQrSvg] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Compute base URL from window location if available
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Compute target URL based on mode
  const getTargetUrl = useCallback(() => {
    const cleanBase = baseUrl.replace(/\/+$/, "");
    if (targetMode === "master") {
      return cleanBase;
    }
    if (targetMode === "table") {
      return `${cleanBase}/?t=${tableNum}`;
    }
    if (targetMode === "custom") {
      return customUrl.trim() || cleanBase;
    }
    return cleanBase;
  }, [baseUrl, targetMode, tableNum, customUrl]);

  const currentUrl = getTargetUrl();

  // Generate QR code data URL and SVG whenever currentUrl changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const generateCodes = async () => {
      try {
        const [dataUrl, svg] = await Promise.all([
          QRCode.toDataURL(currentUrl, {
            errorCorrectionLevel: "H",
            margin: 2,
            width: 800,
            color: {
              dark: "#141B42", // Brand Indigo
              light: "#FFFFFF",
            },
          }),
          QRCode.toString(currentUrl, {
            type: "svg",
            errorCorrectionLevel: "H",
            margin: 2,
            color: {
              dark: "#141B42",
              light: "#FFFFFF",
            },
          }),
        ]);

        if (isMounted) {
          setQrDataUrl(dataUrl);
          setQrSvg(svg);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error("Failed to generate QR code:", err);
        if (isMounted) setIsGenerating(false);
      }
    };

    generateCodes();

    return () => {
      isMounted = false;
    };
  }, [currentUrl, isOpen]);

  // Copy URL to clipboard
  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download PNG
  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    const filename =
      targetMode === "master"
        ? "shree-sai-menu-qr.png"
        : targetMode === "table"
        ? `shree-sai-table-${tableNum}-qr.png`
        : "shree-sai-custom-qr.png";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename =
      targetMode === "master"
        ? "shree-sai-menu-qr.svg"
        : targetMode === "table"
        ? `shree-sai-table-${tableNum}-qr.svg`
        : "shree-sai-custom-qr.svg";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const printUrl =
    targetMode === "table"
      ? `/print/qr?mode=single&table=${tableNum}`
      : `/print/qr?mode=master`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-indigo-deep/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl border-2 border-indigo/30 bg-cream-50 p-4 sm:p-6 shadow-paper-lift space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-300 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-indigo/10 text-indigo-deep">
              <QrCode className="w-5 h-5 text-ribbon" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-indigo-deep leading-tight">
                Menu QR Code Generator & Print
              </h3>
              <p className="text-xs text-indigo-muted">
                Create table-specific QR codes or print batch table tent sheets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-indigo-muted hover:text-indigo hover:bg-cream-200 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Mode Selector Tabs */}
        <div className="flex rounded-lg border border-cream-300 bg-cream-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTargetMode("table")}
            className={`flex-1 py-2 px-3 rounded-md transition-colors ${
              targetMode === "table"
                ? "bg-indigo text-white shadow-sm"
                : "text-indigo-muted hover:text-indigo"
            }`}
          >
            Table Specific (1–20)
          </button>
          <button
            type="button"
            onClick={() => setTargetMode("master")}
            className={`flex-1 py-2 px-3 rounded-md transition-colors ${
              targetMode === "master"
                ? "bg-indigo text-white shadow-sm"
                : "text-indigo-muted hover:text-indigo"
            }`}
          >
            Master Menu QR
          </button>
          <button
            type="button"
            onClick={() => setTargetMode("custom")}
            className={`flex-1 py-2 px-3 rounded-md transition-colors ${
              targetMode === "custom"
                ? "bg-indigo text-white shadow-sm"
                : "text-indigo-muted hover:text-indigo"
            }`}
          >
            Custom Link / Text
          </button>
        </div>

        {/* Configuration for selected mode */}
        {targetMode === "table" && (
          <div className="space-y-2.5 bg-cream-100/60 p-3.5 rounded-lg border border-cream-300">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-deep uppercase tracking-wider">
                Select Table Number:
              </label>
              <span className="text-xs font-semibold text-ribbon">
                Table {tableNum} selected
              </span>
            </div>

            {/* Quick table chips 1-20 */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTableNum(num)}
                  className={`min-h-[34px] text-xs font-bold rounded transition-colors ${
                    tableNum === num
                      ? "bg-ribbon text-white shadow-sm"
                      : "bg-cream-50 hover:bg-cream-200 border border-cream-300 text-indigo"
                  }`}
                >
                  T{num}
                </button>
              ))}
            </div>

            {/* Custom Table Number input for tables beyond 20 */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-indigo-muted">Custom Table #:</span>
              <input
                type="number"
                min="1"
                max="99"
                value={tableNum}
                onChange={(e) => setTableNum(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 min-h-[32px] px-2 py-0.5 text-center font-bold bg-cream-50 border border-cream-300 rounded text-indigo"
              />
            </div>
          </div>
        )}

        {targetMode === "custom" && (
          <div className="space-y-2 bg-cream-100/60 p-3.5 rounded-lg border border-cream-300">
            <label className="text-xs font-bold text-indigo-deep uppercase tracking-wider">
              Enter Custom Destination URL:
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/promo or WiFi info"
              className="w-full min-h-[38px] px-3 py-1.5 text-xs bg-cream-50 border border-cream-300 rounded focus:ring-2 focus:ring-ribbon text-indigo"
            />
            <p className="text-[11px] text-indigo-muted">
              Useful for generating WiFi sign-in QR, Google review link, or Instagram account.
            </p>
          </div>
        )}

        {/* Live Preview & URL details */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-cream-300 bg-white">
          {/* QR Image Preview */}
          <div className="relative shrink-0 w-44 h-44 rounded-lg border-2 border-indigo/20 p-2 bg-white flex items-center justify-center shadow-xs">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt="Generated QR Code"
                width={160}
                height={160}
                unoptimized
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs text-indigo-muted">Generating QR...</div>
            )}
            {isGenerating && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo">Updating...</span>
              </div>
            )}
          </div>

          {/* Details & Copy */}
          <div className="flex-1 space-y-3 w-full">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo/10 text-indigo-deep mb-1">
                <Sparkles className="w-3 h-3 text-ribbon" />
                <span>
                  {targetMode === "table"
                    ? `Table ${tableNum} Menu QR`
                    : targetMode === "master"
                    ? "Master Menu QR"
                    : "Custom URL QR"}
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-indigo-deep">
                Scan Destination
              </h4>
            </div>

            {/* URL Display with Copy Button */}
            <div className="flex items-center gap-1.5 p-2 rounded bg-cream-100 border border-cream-300 text-xs font-mono text-indigo-deep break-all">
              <span className="flex-1 select-all">{currentUrl}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded hover:bg-cream-200 text-indigo-muted hover:text-indigo transition-colors"
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
              {targetMode === "table"
                ? `Customers scanning this code will open the digital menu with an authentic Table ${tableNum} header badge.`
                : "Scans directly to the main menu without table pre-selection."}
            </p>
          </div>
        </div>

        {/* Action Buttons: Download & Print */}
        <div className="space-y-3 pt-1 border-t border-cream-200">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-muted">
            Export & Print Actions
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Download High-Res PNG */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!qrDataUrl}
              className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-cream-200 hover:bg-cream-300 border border-cream-300 text-indigo transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-indigo-muted" />
              <span>Download PNG (1200px)</span>
            </button>

            {/* Download Vector SVG */}
            <button
              type="button"
              onClick={handleDownloadSvg}
              disabled={!qrSvg}
              className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-cream-200 hover:bg-cream-300 border border-cream-300 text-indigo transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-indigo-muted" />
              <span>Download Vector SVG</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Print Current Selection */}
            <Link
              href={printUrl}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-ribbon hover:bg-ribbon-dark text-white transition-colors shadow-paper"
            >
              <Printer className="w-4 h-4" />
              <span>
                {targetMode === "table"
                  ? `Print Table ${tableNum} Tent (4-up)`
                  : "Print Master QR (4-up)"}
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </Link>

            {/* Print All 20 Tables */}
            <Link
              href="/print/qr?mode=tables"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo hover:bg-indigo-deep text-white transition-colors shadow-paper"
            >
              <Layers className="w-4 h-4" />
              <span>Print All 20 Tables (5 sheets)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
