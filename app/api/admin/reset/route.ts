import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { resetToOriginalMenu } from "@/lib/store";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthorized = await verifySessionToken(token || "");

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { confirmation } = await req.json();
    if (confirmation !== "RESET") {
      return NextResponse.json(
        { error: "Confirmation code 'RESET' required" },
        { status: 400 }
      );
    }

    const result = await resetToOriginalMenu();
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to reset menu" },
        { status: 500 }
      );
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
