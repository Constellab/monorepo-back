import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

import { BlProtectedResourceMetadataController } from './bl-protected-resource-metadata.controller';
import { BlResourceGuard } from './bl-resource.guard';
import { BlResourceRegistry } from './bl-resource.registry';
import { BL_RESOURCE_SERVER_CONFIG_PROVIDER, BlResourceServerConfig } from './bl-resource-server.class';

export interface BlResourceServerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => BlResourceServerConfig;
  inject?: any[];
}

/**
 * The Resource Server half of OAuth: the registry of Resources this application serves,
 * the guard that protects them, and their discovery documents.
 *
 * Mountable without the Authorization Server, which is the point — an application that
 * only verifies tokens never loads the code that mints them.
 *
 * `@Global()` and registered once from the application module, like
 * `BlJwtAsymmetricModule`. That is not decoration: the guard is referenced by @rekog's
 * dynamically created MCP controllers, which resolve their dependencies outside any
 * module the application declares imports for. It also keeps the discovery routes
 * registered once — re-registering per consumer would duplicate them.
 */
@Global()
@Module({})
export class BlResourceServerModule {
  public static forRootAsync(asyncOptions: BlResourceServerModuleAsyncOptions): DynamicModule {
    return {
      module: BlResourceServerModule,
      imports: asyncOptions.imports ?? [],
      controllers: [BlProtectedResourceMetadataController],
      providers: [
        {
          provide: BL_RESOURCE_SERVER_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject,
        },
        BlResourceRegistry,
        BlResourceGuard,
      ],
      exports: [BlResourceRegistry, BlResourceGuard],
    };
  }
}
