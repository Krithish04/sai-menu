import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { getRedisClient } from "./store";

export const COOKIE_NAME = "shree_sai_admin_token";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "default_development_auth_secret_key_32_bytes";
  return new TextEncoder().encode(secret);
}

/**
 * Constant-time password check against process.env.ADMIN_PASSWORD
 */
export function verifyPassword(provided: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !provided) return false;

  const bufProvided = Buffer.from(provided, "utf-8");
  const bufExpected = Buffer.from(expected, "utf-8");

  if (bufProvided.length !== bufExpected.length) {
    // Prevent timing leaks by running constant-time comparison against itself
    crypto.timingSafeEqual(bufProvided, bufProvided);
    return false;
  }

  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

/**
 * Signs an httpOnly JWT valid for 7 days
 */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

/**
 * Verifies the JWT session token
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Rate limit failed login attempts (5 per 15 minutes) using Redis or memory
 */
const memRateLimit = new Map<string, { count: number; expiresAt: number }>();

export async function checkLoginRateLimit(ip: string): Promise<{ allowed: boolean; error?: string }> {
  const redis = getRedisClient();
  const key = `ratelimit:login:${ip}`;

  if (redis) {
    try {
      const attempts = await redis.get<number>(key);
      if (attempts && attempts >= 5) {
        return {
          allowed: false,
          error: "Too many failed login attempts. Please try again in 15 minutes.",
        };
      }
      return { allowed: true };
    } catch {
      // Fall through to memory
    }
  }

  // Memory fallback
  const record = memRateLimit.get(ip);
  const now = Date.now();
  if (record && record.expiresAt > now) {
    if (record.count >= 5) {
      return {
        allowed: false,
        error: "Too many failed login attempts. Please try again in 15 minutes.",
      };
    }
  } else if (record && record.expiresAt <= now) {
    memRateLimit.delete(ip);
  }

  return { allowed: true };
}

export async function recordFailedLogin(ip: string): Promise<void> {
  const redis = getRedisClient();
  const key = `ratelimit:login:${ip}`;

  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, 900); // 15 minutes
      }
      return;
    } catch {
      // Fall through to memory
    }
  }

  // Memory fallback
  const now = Date.now();
  const record = memRateLimit.get(ip);
  if (!record || record.expiresAt <= now) {
    memRateLimit.set(ip, { count: 1, expiresAt: now + 900 * 1000 });
  } else {
    record.count += 1;
  }
}

export async function resetLoginRateLimit(ip: string): Promise<void> {
  const redis = getRedisClient();
  const key = `ratelimit:login:${ip}`;

  if (redis) {
    try {
      await redis.del(key);
    } catch {
      // ignore
    }
  }
  memRateLimit.delete(ip);
}


