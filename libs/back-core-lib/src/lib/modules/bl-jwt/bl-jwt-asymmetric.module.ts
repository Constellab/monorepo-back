import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

import { BlJwksController } from './bl-jwks.controller';
import { BlJwtAsymmetricService } from './bl-jwt-asymmetric.service';
import { BlJwtAsymmetricVerifier } from './bl-jwt-asymmetric.verifier';
import {
  BL_JWT_ASYMMETRIC_CONFIG_PROVIDER,
  BL_JWT_KEY_SOURCE,
  BlJwtAsymmetricConfig,
} from './bl-jwt-key.class';
import { BlJwtKeyStore } from './bl-jwt-key.store';

export interface BlJwtAsymmetricModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => BlJwtAsymmetricConfig;
  inject?: any[];
}

/**
 * The asymmetric signing path: the key set, the service that mints and verifies MCP
 * access tokens with it, and the endpoint that publishes the public half.
 *
 * Mounted by the Authorization Server and by nobody else. A Resource Server mounts
 * `BlJwtRemoteVerifierModule` instead, which provides the same verifier over keys fetched
 * from here — so the ability to mint is not something a Resource Server is trusted to
 * refrain from using, it is something it never has.
 *
 * Separate from `BlJwtModule` rather than an option on it, so an application that only
 * verifies Session tokens never loads key material it has no use for.
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
        // Here the keys a token is checked against are the ones this application signs
        // with, held in memory — it does not verify through its own published document.
        { provide: BL_JWT_KEY_SOURCE, useExisting: BlJwtKeyStore },
        BlJwtAsymmetricService,
        BlJwtAsymmetricVerifier,
      ],
      exports: [BlJwtAsymmetricService, BlJwtAsymmetricVerifier, BlJwtKeyStore],
    };
  }
}
