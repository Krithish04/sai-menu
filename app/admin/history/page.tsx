import React from "react";
import { getHistory } from "@/lib/store";
import { HistoryClientView } from "./HistoryClientView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Menu History & Restore | Shree Sai Restaurant",
  robots: { index: false, follow: false },
};

export default async function AdminHistoryPage() {
  const snapshots = await getHistory();

  return <HistoryClientView initialSnapshots={snapshots} />;
}
