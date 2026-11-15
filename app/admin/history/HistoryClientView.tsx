"use client";

import React, { useState } from "react";
import { ValidatedSnapshot } from "@/lib/schema";
import { ArrowLeft, RotateCcw, Clock, Calendar, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HistoryClientViewProps {
  initialSnapshots: ValidatedSnapshot[];
}

export function HistoryClientView({
  initialSnapshots,
}: HistoryClientViewProps) {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState(initialSnapshots);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleRestore = async (snapshotId: string) => {
    if (
      !confirm(
        "Are you sure you want to restore this snapshot? Your current menu will be backed up automatically before restoring."
      )
    ) {
      return;
    }

    setRestoringId(snapshotId);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to restore snapshot");
      }

      setStatusMsg({
        type: "success",
        text: "Snapshot successfully restored! The public menu has been updated.",
      });

      // Refresh list
      const histRes = await fetch("/api/admin/history");
      if (histRes.ok) {
        const hData = await histRes.json();
        setSnapshots(hData.history);
      }
      router.refresh();
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to restore",
      });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 max-w-2xl mx-auto border-x border-cream-300 p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cream-300">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-muted hover:text-indigo min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Menu Editor</span>
        </Link>
        <span className="ribbon-tag text-xs font-bold py-0.5">Safety Net</span>
      </div>

      <div className="py-4">
        <h1 className="font-serif text-2xl font-bold text-indigo-deep">
          Menu Snapshot History
        </h1>
        <p className="text-xs text-indigo-muted mt-1">
          Last 30 automatic snapshots stored before each change. Restore any
          previous version with one tap.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded mb-4 flex items-center gap-2 text-xs font-bold border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-ribbon/10 text-ribbon-dark border-ribbon/30"
          }`}
        >
          {statusMsg.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-ribbon shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Snapshots List */}
      {snapshots.length === 0 ? (
        <div className="p-8 text-center rounded-lg border-2 border-dashed border-cream-300 bg-cream-50">
          <Clock className="w-8 h-8 text-indigo-muted mx-auto mb-2 opacity-60" />
          <p className="font-semibold text-indigo-deep text-sm">
            No snapshots recorded yet
          </p>
          <p className="text-xs text-indigo-muted mt-1">
            Snapshots will be saved here automatically whenever you make changes in
            the admin panel.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {snapshots.map((snap) => {
            const date = new Date(snap.timestamp);
            const dateStr = date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeStr = date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });

            const totalDishes = snap.data.sections.reduce(
              (acc, sec) => acc + (sec.items?.length || 0),
              0
            );

            return (
              <div
                key={snap.id}
                className="p-3.5 rounded-lg border border-cream-300 bg-cream-50 hover:bg-cream-100/60 transition-colors shadow-paper flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-indigo-deep">
                      {snap.summary}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-muted bg-cream-200 px-2 py-0.5 rounded">
                      {totalDishes} dishes · {snap.data.sections.length} categories
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-indigo-muted">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-ribbon" />
                      <span>{dateStr}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-ribbon" />
                      <span>{timeStr}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestore(snap.id)}
                  disabled={restoringId === snap.id}
                  className="min-h-[40px] px-3.5 py-1.5 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded bg-cream-200 hover:bg-cream-300 border border-cream-300 text-indigo disabled:opacity-50 transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-ribbon" />
                  <span>
                    {restoringId === snap.id ? "Restoring..." : "Restore Snapshot"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
