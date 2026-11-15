import type { Metadata } from "next";
import { Suspense } from "react";
import { getMenu } from "@/lib/store";
import { MenuClientContainer } from "@/components/MenuClientContainer";

export const revalidate = 60; // ISR revalidation

export const metadata: Metadata = {
  title: "Shree Sai Restaurant – Menu | Salabatpura, Surat",
  description:
    "Authentic South Indian, Pav Bhaji, Chinese & fast food since 1989. Salabatpura, Surat. Pure vegetarian taste.",
};

export default async function HomePage() {
  const menuData = await getMenu();

  return (
    <Suspense fallback={null}>
      <MenuClientContainer initialMenu={menuData} />
    </Suspense>
  );
}
