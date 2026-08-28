import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Redis } from 'ioredis';

import { BL_REDIS_CLIENT, BL_REDIS_CONFIG_PROVIDER, BlRedisConfig, BlRedisStore } from './bl-redis.class';
import { BlRedisService } from './bl-redis.service';

export interface BlRedisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => BlRedisConfig;
  inject?: any[];
}

function createRedisClient(config: BlRedisConfig): Redis {
  return new Redis({
    host: config.host,
    port: config.port,
    // ioredis would send an AUTH with an empty string, which the local dev server
    // rejects; undefined means "do not authenticate".
    password: config.password || undefined,
    keyPrefix: config.keyPrefix,
    // Fail a command after a few attempts instead of queueing it indefinitely: the
    // callers are HTTP request handlers, so a hung command is a hung request.
    maxRetriesPerRequest: 3,
  });
}

/**
 * Provides a single shared Redis connection and the {@link BlRedisService} wrapper.
 */
@Global()
@Module({})
export class BlRedisModule {
  public static forRootAsync(asyncOptions: BlRedisModuleAsyncOptions): DynamicModule {
    return {
      module: BlRedisModule,
      imports: [...(asyncOptions.imports ?? [])],
      providers: [
        {
          provide: BL_REDIS_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject,
        },
        {
          provide: BL_REDIS_CLIENT,
          useFactory: createRedisClient,
          inject: [BL_REDIS_CONFIG_PROVIDER],
        },
        BlRedisService,
        // Consumers depend on the narrow abstraction, not the ioredis-backed class,
        // which keeps them substitutable in tests.
        { provide: BlRedisStore, useExisting: BlRedisService },
      ],
      exports: [BlRedisService, BlRedisStore],
    };
  }
}
