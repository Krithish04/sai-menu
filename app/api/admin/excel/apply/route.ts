import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { saveMenu } from "@/lib/store";
import { MenuDataSchema } from "@/lib/schema";
import { MenuData } from "@/types/menu";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthorized = await verifySessionToken(token || "");

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { menu } = body;

    if (!menu) {
      return NextResponse.json({ error: "No menu data provided" }, { status: 400 });
    }

    const validation = MenuDataSchema.safeParse(menu);
    if (!validation.success) {
      const issues = validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: `Validation failed: ${issues}` }, { status: 400 });
    }

    const saveResult = await saveMenu(
      validation.data as MenuData,
      "Updated via Excel Import"
    );

    if (!saveResult.success) {
      return NextResponse.json(
        { error: saveResult.error || "Failed to persist imported menu to database" },
        { status: 500 }
      );
    }

    // Revalidate public page and admin page
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Menu successfully updated and safety snapshot recorded in history",
    });
  } catch (err: unknown) {
    console.error("Excel apply error:", err);
    return NextResponse.json(
      { error: "Failed to apply Excel changes" },
      { status: 500 }
    );
  }
}
