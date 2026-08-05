export const BL_REDIS_CONFIG_PROVIDER = Symbol();
export const BL_REDIS_CLIENT = Symbol();

export interface BlRedisConfig {
  host: string;
  port: number;
  /** Empty string means no AUTH (the local dev setup). */
  password: string;
  /**
   * Prepended to every key. Set it per application so two apps pointing at the same
   * Redis instance cannot collide.
   */
  keyPrefix?: string;
}

/**
 * Narrow key/value surface the library exposes over Redis.
 *
 * Deliberately minimal: enough for short-lived, single-use records (OAuth codes,
 * refresh tokens) without turning into a general-purpose Redis wrapper.
 */
export abstract class BlRedisStore {
  abstract get(key: string): Promise<string | null>;
  abstract setWithTtl(key: string, value: string, ttlSeconds: number): Promise<void>;
  /** Atomic read-and-delete, so a record can be consumed exactly once. */
  abstract getAndDelete(key: string): Promise<string | null>;
}
