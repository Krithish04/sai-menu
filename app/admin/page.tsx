import { getMenu } from "@/lib/store";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Shree Sai Restaurant",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const menu = await getMenu();

  return <AdminDashboard initialMenu={menu} />;
}
