import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

import { BlJwksController } from './bl-jwks.controller';
import { BlJwtAsymmetricService } from './bl-jwt-asymmetric.service';
import { BL_JWT_ASYMMETRIC_CONFIG_PROVIDER, BlJwtAsymmetricConfig } from './bl-jwt-key.class';
import { BlJwtKeyStore } from './bl-jwt-key.store';

export interface BlJwtAsymmetricModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => BlJwtAsymmetricConfig;
  inject?: any[];
}

/**
 * The asymmetric signing path: the key set, the service that mints and verifies MCP
 * access tokens with it, and the endpoint that publishes the public half.
 *
 * Separate from `BlJwtModule` rather than an option on it, so an application that only
 * verifies Session tokens never loads key material it has no use for, and — once the
 * Authorization Server moves — a Resource Server can take the verification side without
 * taking the ability to mint.
 *
 * `@Global()` and registered once from the application module, like `BlJwtModule`. That
 * is not decoration: the MCP guard is referenced by @rekog's dynamically created
 * controllers, which resolve their dependencies outside any module the application
 * declares imports for. It also keeps the key set loaded once and the `jwks_uri` route
 * registered once — re-registering per consumer would mint two independent key stores and
 * a duplicate route.
 */
@Global()
@Module({})
export class BlJwtAsymmetricModule {
  public static forRootAsync(asyncOptions: BlJwtAsymmetricModuleAsyncOptions): DynamicModule {
    return {
      module: BlJwtAsymmetricModule,
      imports: asyncOptions.imports ?? [],
      controllers: [BlJwksController],
      providers: [
        {
          provide: BL_JWT_ASYMMETRIC_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject,
        },
        BlJwtKeyStore,
        BlJwtAsymmetricService,
      ],
      exports: [BlJwtAsymmetricService, BlJwtKeyStore],
    };
  }
}
