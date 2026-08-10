import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

import { BlJwtAsymmetricVerifier } from './bl-jwt-asymmetric.verifier';
import {
  BL_JWT_KEY_SOURCE,
  BL_JWT_REMOTE_KEY_CONFIG_PROVIDER,
  BlJwtRemoteKeyConfig,
} from './bl-jwt-key.class';
import { BlJwtRemoteKeyStore } from './bl-jwt-remote-key.store';

export interface BlJwtRemoteVerifierModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => BlJwtRemoteKeyConfig;
  inject?: any[];
}

/**
 * The verifying half of the asymmetric path, over keys published by another application.
 *
 * What a Resource Server mounts instead of `BlJwtAsymmetricModule`. Both provide
 * `BlJwtAsymmetricVerifier`, and they differ in exactly one binding: where the public keys
 * come from. Nothing here can sign, and there is no key material to configure — a
 * Resource Server holds the URL of the Authorization Server and nothing else, which is the
 * whole point of publishing a key set (ADR-0001).
 *
 * Serves no `jwks_uri` either: publishing keys belongs to the Authorization Server, and an
 * application republishing keys it does not hold would let a client verify against a
 * document one hop further from the truth.
 *
 * `@Global()` and registered once from the application module, for the same reason
 * `BlJwtAsymmetricModule` is: the Resource Server guard is referenced by @rekog's
 * dynamically created MCP controllers, which resolve their dependencies outside any module
 * the application declares imports for. It also keeps the fetched key set cached once —
 * re-registering per consumer would give each its own cache and its own outbound request.
 */
@Global()
@Module({})
export class BlJwtRemoteVerifierModule {
  public static forRootAsync(asyncOptions: BlJwtRemoteVerifierModuleAsyncOptions): DynamicModule {
    return {
      module: BlJwtRemoteVerifierModule,
      imports: asyncOptions.imports ?? [],
      providers: [
        {
          provide: BL_JWT_REMOTE_KEY_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject,
        },
        BlJwtRemoteKeyStore,
        { provide: BL_JWT_KEY_SOURCE, useExisting: BlJwtRemoteKeyStore },
        BlJwtAsymmetricVerifier,
      ],
      // The key source is exported alongside the verifier so a test can substitute the
      // published key set — the one thing an e2e suite cannot stand up, since the
      // Authorization Server is a different application.
      exports: [BlJwtAsymmetricVerifier, BL_JWT_KEY_SOURCE],
    };
  }
}
