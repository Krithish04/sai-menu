import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { saveMenu } from "@/lib/store";
import { MenuDataSchema } from "@/lib/schema";

export async function POST(req: NextRequest) {
  // 1. Verify admin session token
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthorized = await verifySessionToken(token || "");

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { menu, summary } = body;

    // 2. Validate with Zod
    const validation = MenuDataSchema.safeParse(menu);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // 3. Save to Store (creates snapshot in history)
    const saveResult = await saveMenu(
      validation.data as unknown as import("@/data/menu").MenuData,
      summary || "Admin menu edit"
    );

    if (!saveResult.success) {
      return NextResponse.json(
        { error: saveResult.error || "Failed to save menu" },
        { status: 500 }
      );
    }

    // 4. Revalidate public customer menu
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
