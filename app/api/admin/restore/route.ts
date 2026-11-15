import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { restoreSnapshot } from "@/lib/store";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthorized = await verifySessionToken(token || "");

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { snapshotId } = await req.json();
    if (!snapshotId) {
      return NextResponse.json(
        { error: "Snapshot ID is required" },
        { status: 400 }
      );
    }

    const result = await restoreSnapshot(snapshotId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to restore snapshot" },
        { status: 500 }
      );
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
