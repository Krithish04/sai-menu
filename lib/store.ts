import { Redis } from "@upstash/redis";
import { INITIAL_MENU, MenuData } from "../data/menu";
import { MenuDataSchema, SnapshotSchema, ValidatedSnapshot } from "./schema";
import { migrateMenuGroups } from "./groups";

const MENU_CURRENT_KEY = "menu:current";
const MENU_HISTORY_KEY = "menu:history";
const MAX_HISTORY_SNAPSHOTS = 30;

let redisInstance: Redis | null = null;

function isDynamicServerError(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("DYNAMIC_SERVER_USAGE") || digest.startsWith("NEXT_");
  }
  return false;
}

export function getRedisClient(): Redis | null {
  if (redisInstance) return redisInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || url.includes("your-upstash") || token.includes("your_upstash")) {
    return null;
  }

  try {
    redisInstance = new Redis({
      url,
      token,
      cache: "default",
    });
    return redisInstance;
  } catch (err) {
    console.warn("Failed to initialize Upstash Redis client:", err);
    return null;
  }
}

/**
 * Reads current menu.
 * 1. Attempts to read from Redis.
 * 2. If Redis is empty, seeds with INITIAL_MENU.
 * 3. If Redis is unreachable or unconfigured, gracefully falls back to INITIAL_MENU.
 */
export async function getMenu(): Promise<MenuData> {
  const redis = getRedisClient();

  if (!redis) {
    return migrateMenuGroups(INITIAL_MENU);
  }

  try {
    const rawData = await redis.get<MenuData | string>(MENU_CURRENT_KEY);

    if (!rawData) {
      // First run: seed Redis with INITIAL_MENU
      await seedInitialMenu();
      return migrateMenuGroups(INITIAL_MENU);
    }

    const parsedData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
    const validation = MenuDataSchema.safeParse(parsedData);

    if (validation.success) {
      return migrateMenuGroups(validation.data as MenuData);
    } else {
      console.warn("Stored Redis menu data failed validation. Falling back to INITIAL_MENU:", validation.error.format());
      return migrateMenuGroups(INITIAL_MENU);
    }
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.warn("Redis read failed. Falling back to INITIAL_MENU:", err);
    return migrateMenuGroups(INITIAL_MENU);
  }
}

/**
 * Seeds Redis with INITIAL_MENU if not already present.
 */
async function seedInitialMenu(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.set(MENU_CURRENT_KEY, JSON.stringify(INITIAL_MENU));
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.warn("Failed to seed initial menu in Redis:", err);
  }
}

/**
 * Writes updated menu to Redis with snapshot history (capped at 30 items).
 */
export async function saveMenu(
  newMenu: MenuData,
  summary: string = "Updated menu"
): Promise<{ success: boolean; error?: string }> {
  // Server-side Zod validation with group migration
  const migrated = migrateMenuGroups(newMenu);
  const validation = MenuDataSchema.safeParse(migrated);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    };
  }

  const redis = getRedisClient();
  if (!redis) {
    // In local dev without Redis configured, validate successfully
    return { success: true };
  }

  try {
    // 1. Fetch existing menu to create history snapshot
    const currentMenu = await getMenu();
    const snapshot: ValidatedSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      summary,
      data: currentMenu,
    };

    // 2. Push snapshot to history and trim to last 30
    await redis.lpush(MENU_HISTORY_KEY, JSON.stringify(snapshot));
    await redis.ltrim(MENU_HISTORY_KEY, 0, MAX_HISTORY_SNAPSHOTS - 1);

    // 3. Save new menu as current
    await redis.set(MENU_CURRENT_KEY, JSON.stringify(validation.data));

    return { success: true };
  } catch (err) {
    console.error("Failed to save menu to Redis:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error saving menu to Redis",
    };
  }
}

/**
 * Retrieves the snapshot history (last 30 changes).
 */
export async function getHistory(): Promise<ValidatedSnapshot[]> {
  const redis = getRedisClient();
  if (!redis) return [];

  try {
    const rawList = await redis.lrange<string | ValidatedSnapshot>(MENU_HISTORY_KEY, 0, MAX_HISTORY_SNAPSHOTS - 1);
    if (!rawList || rawList.length === 0) return [];

    const snapshots: ValidatedSnapshot[] = [];
    for (const item of rawList) {
      try {
        const parsed = typeof item === "string" ? JSON.parse(item) : item;
        const valid = SnapshotSchema.safeParse(parsed);
        if (valid.success) {
          snapshots.push(valid.data);
        }
      } catch {
        // Skip malformed history entries
      }
    }
    return snapshots;
  } catch (err) {
    if (isDynamicServerError(err)) throw err;
    console.warn("Failed to get history from Redis:", err);
    return [];
  }
}

/**
 * Restores a snapshot from history by ID.
 */
export async function restoreSnapshot(snapshotId: string): Promise<{ success: boolean; data?: MenuData; error?: string }> {
  const history = await getHistory();
  const target = history.find((s) => s.id === snapshotId);

  if (!target) {
    return { success: false, error: "Snapshot not found in history" };
  }

  const saveResult = await saveMenu(
    target.data as MenuData,
    `Restored snapshot from ${new Date(target.timestamp).toLocaleString("en-IN")}`
  );

  if (saveResult.success) {
    return { success: true, data: target.data as MenuData };
  }

  return { success: false, error: saveResult.error };
}

/**
 * Resets menu back to INITIAL_MENU.
 */
export async function resetToOriginalMenu(): Promise<{ success: boolean; error?: string }> {
  return await saveMenu(INITIAL_MENU, "Reset menu to original factory defaults");
}
