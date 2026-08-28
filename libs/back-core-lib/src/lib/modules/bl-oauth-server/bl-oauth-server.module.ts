import { DynamicModule, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

import { BlOAuthClientStore } from './bl-oauth-client.store';
import { BlOAuthCodeStore } from './bl-oauth-code.store';
import { BlOAuthConsentStore } from './bl-oauth-consent.store';
import { BL_OAUTH_SERVER_CONFIG_PROVIDER, BlOAuthServerConfig } from './bl-oauth-server.class';
import { BlOAuthServerController } from './bl-oauth-server.controller';

export interface BlOAuthServerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => BlOAuthServerConfig;
  inject?: any[];
}

/**
 * The Authorization Server half of OAuth: dynamic client registration, /authorize, /token,
 * /revoke, the client and code stores, and the authorization server discovery document.
 *
 * Mounted by exactly one application, which is why it is built to be *movable* rather than
 * parameterized: everything here is the protocol, and the only application-shaped piece is
 * the current-user resolver.
 *
 * Not `@Global()`, unlike the Resource Server half — nothing outside resolves what is in
 * here, and the routes must be registered once.
 *
 * `imports` must make three tokens resolvable, all of which are the mounting application's
 * own and none of which can be a class the library depends on:
 * - `BL_OAUTH_CURRENT_USER_RESOLVER`, a {@link BlOAuthCurrentUserResolver}
 * - `BL_REFRESH_TOKEN_SERVICE_PROVIDER`, the application's `BlRefreshTokenService` subclass
 * - `BL_OAUTH_GRANT_SERVICE_PROVIDER`, the application's `BlOAuthGrantService` subclass
 *
 * Everything else it needs — `BlResourceRegistry`, `BlJwtAsymmetricService`, `BlRedisStore` —
 * comes from modules the application module already registers globally.
 */
@Module({})
export class BlOAuthServerModule {
  public static forRootAsync(asyncOptions: BlOAuthServerModuleAsyncOptions): DynamicModule {
    return {
      module: BlOAuthServerModule,
      imports: asyncOptions.imports ?? [],
      controllers: [BlOAuthServerController],
      providers: [
        {
          provide: BL_OAUTH_SERVER_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject,
        },
        BlOAuthClientStore,
        BlOAuthCodeStore,
        BlOAuthConsentStore,
      ],
    };
  }
}
