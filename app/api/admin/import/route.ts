import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { saveMenu } from "@/lib/store";
import { MenuDataSchema } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthorized = await verifySessionToken(token || "");

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawData = await req.json();

    const validation = MenuDataSchema.safeParse(rawData);
    if (!validation.success) {
      const issues = validation.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return NextResponse.json(
        { error: `Invalid menu backup file: ${issues}` },
        { status: 400 }
      );
    }

    const saveResult = await saveMenu(
      validation.data as unknown as import("@/data/menu").MenuData,
      "Imported menu JSON backup"
    );

    if (!saveResult.success) {
      return NextResponse.json(
        { error: saveResult.error || "Failed to save imported menu" },
        { status: 500 }
      );
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to parse imported JSON" },
      { status: 400 }
    );
  }
}
