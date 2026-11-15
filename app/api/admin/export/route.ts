import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { getMenu } from "@/lib/store";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthorized = await verifySessionToken(token || "");

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const menu = await getMenu();
  const dateStr = new Date().toISOString().split("T")[0];

  return new NextResponse(JSON.stringify(menu, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="shree-sai-menu-backup-${dateStr}.json"`,
    },
  });
}
