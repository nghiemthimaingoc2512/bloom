import type { BloomState } from "./types";

/**
 * BloomRepository is the single seam between Bloom's app state and wherever
 * that state actually lives. Today it's backed by localStorage so the app
 * works instantly with zero infrastructure. To migrate to Supabase later:
 *
 *   1. Implement `SupabaseBloomRepository` below (or in its own file) that
 *      satisfies the same `BloomRepository` interface - reading/writing
 *      rows scoped to the authenticated user instead of a browser key.
 *   2. Swap the export at the bottom of this file.
 *
 * No component or store code needs to change, since everything reads and
 * writes through this interface only.
 */
export interface BloomRepository {
  load(): Promise<BloomState | null>;
  save(state: BloomState): Promise<void>;
  clear(): Promise<void>;
}

const STORAGE_KEY = "bloom:v1:state";

class LocalStorageBloomRepository implements BloomRepository {
  async load(): Promise<BloomState | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as BloomState;
    } catch {
      return null;
    }
  }

  async save(state: BloomState): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be full or unavailable (private browsing, etc).
      // Bloom fails silently here rather than interrupting the experience.
    }
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Example shape for the future Supabase-backed repository. Left unused and
 * commented out so the project has zero required external dependencies
 * until you're ready to wire it up.
 *
 * import { createClient } from "@supabase/supabase-js";
 *
 * class SupabaseBloomRepository implements BloomRepository {
 *   private client = createClient(url, anonKey);
 *
 *   async load(): Promise<BloomState | null> {
 *     const { data } = await this.client
 *       .from("bloom_states")
 *       .select("state")
 *       .eq("user_id", userId)
 *       .maybeSingle();
 *     return data?.state ?? null;
 *   }
 *
 *   async save(state: BloomState): Promise<void> {
 *     await this.client
 *       .from("bloom_states")
 *       .upsert({ user_id: userId, state });
 *   }
 *
 *   async clear(): Promise<void> {
 *     await this.client.from("bloom_states").delete().eq("user_id", userId);
 *   }
 * }
 */

export const bloomRepository: BloomRepository = new LocalStorageBloomRepository();
