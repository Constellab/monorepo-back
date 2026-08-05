import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

import { BL_REDIS_CLIENT, BlRedisStore } from './bl-redis.class';

/**
 * Key/value access to Redis, implementing {@link BlRedisStore}.
 *
 * `getAndDelete` relies on `GETDEL` (Redis >= 6.2), which is atomic — a `GET`
 * followed by a `DEL` would let two replicas both read the same value before
 * either deleted it, breaking single-use semantics precisely under the concurrency
 * this store exists to handle.
 */
@Injectable()
export class BlRedisService extends BlRedisStore implements OnModuleDestroy {
  private readonly logger = new Logger(BlRedisService.name);

  constructor(@Inject(BL_REDIS_CLIENT) private readonly client: Redis) {
    super();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async setWithTtl(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async getAndDelete(key: string): Promise<string | null> {
    return await this.client.getdel(key);
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      // Shutting down: a failed close must not mask the real reason we are stopping.
      this.logger.warn(`Error while closing the Redis connection: ${String(error)}`);
    }
  }
}
