import { BL_OAUTH_CURRENT_USER_RESOLVER } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';

import { HnRefreshTokenModule } from '../auth/refresh-token/hn-refresh-token.module';
import { HnOAuthCurrentUserResolver } from './hn-oauth-current-user.resolver';

/**
 * Everything this application contributes to the Authorization Server, which is now only
 * the two tokens `BlOAuthServerModule` cannot resolve for itself.
 *
 * The endpoints, the stores, the discovery document and the grant logic all live in
 * `bl-oauth-server`; this module is what the application module passes into its
 * `forRootAsync` imports. Configuration goes the other way, through the factory.
 *
 * `HnRefreshTokenModule` is re-exported rather than re-declared: it is what provides
 * `BL_REFRESH_TOKEN_SERVICE_PROVIDER`, the alias through which shared code reaches this
 * application's own refresh token service.
 */
@Module({
  imports: [HnRefreshTokenModule],
  providers: [
    HnOAuthCurrentUserResolver,
    { provide: BL_OAUTH_CURRENT_USER_RESOLVER, useExisting: HnOAuthCurrentUserResolver },
  ],
  exports: [BL_OAUTH_CURRENT_USER_RESOLVER, HnRefreshTokenModule],
})
export class HnOAuthModule {}
