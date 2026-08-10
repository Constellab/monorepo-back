import { BL_OAUTH_CURRENT_USER_RESOLVER } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';

import { CnRefreshTokenModule } from '../cn-auth/cn-refresh-token/cn-refresh-token.module';
import { CnOAuthCurrentUserResolver } from './cn-oauth-current-user.resolver';

/**
 * Everything this application contributes to the Authorization Server, which is only the
 * two tokens `BlOAuthServerModule` cannot resolve for itself.
 *
 * The endpoints, the stores, the discovery document and the grant logic all live in
 * `bl-oauth-server`; this module is what the application module passes into its
 * `forRootAsync` imports. Configuration goes the other way, through the factory.
 *
 * `CnRefreshTokenModule` is re-exported rather than re-declared: it is what provides
 * `BL_REFRESH_TOKEN_SERVICE_PROVIDER`, the alias through which shared code reaches this
 * application's own refresh token service.
 */
@Module({
  imports: [CnRefreshTokenModule],
  providers: [
    CnOAuthCurrentUserResolver,
    { provide: BL_OAUTH_CURRENT_USER_RESOLVER, useExisting: CnOAuthCurrentUserResolver },
  ],
  exports: [BL_OAUTH_CURRENT_USER_RESOLVER, CnRefreshTokenModule],
})
export class CnOAuthModule {}
