import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  createSessionToken,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
  COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. Check rate limit
  const rateLimit = await checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: rateLimit.error || "Too many attempts" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      await recordFailedLogin(ip);
      return NextResponse.json(
        { error: "Invalid password format" },
        { status: 400 }
      );
    }

    // 2. Constant-time password check
    const isValid = verifyPassword(password);
    if (!isValid) {
      await recordFailedLogin(ip);
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // 3. Clear rate limit on success
    await resetLoginRateLimit(ip);

    // 4. Create signed JWT
    const token = await createSessionToken();

    // 5. Set signed httpOnly cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
