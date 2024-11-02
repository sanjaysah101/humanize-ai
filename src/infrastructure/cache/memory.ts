import { ICache } from "@/core/interfaces/cache";

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache implements ICache {
  private cache = new Map<string, CacheItem<unknown>>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  // // Utility method to clean expired items
  // private cleanup(): void {
  //   const now = Date.now();
  //   for (const [key, item] of this.cache.entries()) {
  //     if (now > item.expiresAt) {
  //       this.cache.delete(key);
  //     }
  //   }
  // }
}
