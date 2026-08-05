import { BlRedisStore } from '@monorepo/back-core-lib';

/**
 * In-memory {@link BlRedisStore} for unit tests: no server, no `ioredis`.
 *
 * TTLs are evaluated against `Date.now()`, so a spec can drive expiry with
 * `jest.useFakeTimers()` + `jest.advanceTimersByTime()`. `getAndDelete` deletes
 * before returning, mirroring the atomicity `GETDEL` gives in production.
 *
 * Excluded from the application build by the `**\/*.mock.ts` pattern in
 * `tsconfig.app.json` / `tsconfig.app-nest.json`.
 */
export class HnOAuthRedisMock extends BlRedisStore {
  private readonly entries = new Map<string, { value: string; expiresAt: number }>();

  // eslint-disable-next-line @typescript-eslint/require-await
  async get(key: string): Promise<string | null> {
    const entry = this.entries.get(key);
    if (entry == null) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }
    return entry.value;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async setWithTtl(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.entries.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async getAndDelete(key: string): Promise<string | null> {
    const value = await this.get(key);
    this.entries.delete(key);
    return value;
  }

  /** Test helper: raw entry count, to assert that expiry actually removes records. */
  size(): number {
    return this.entries.size;
  }

  /** Test helper: overwrite a stored value with something unparsable. */
  corrupt(keySuffixMatch: string): void {
    for (const key of this.entries.keys()) {
      if (key.includes(keySuffixMatch)) {
        this.entries.set(key, { value: 'not-json', expiresAt: Date.now() + 60_000 });
      }
    }
  }
}
