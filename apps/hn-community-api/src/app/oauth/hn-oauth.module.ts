import { BL_OAUTH_CURRENT_USER_RESOLVER, BL_OAUTH_GRANT_SERVICE_PROVIDER } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnRefreshTokenModule } from '../auth/refresh-token/hn-refresh-token.module';
import { HnOAuthCurrentUserResolver } from './hn-oauth-current-user.resolver';
import { HnOAuthGrant } from './hn-oauth-grant.entity';
import { HnOAuthGrantService } from './hn-oauth-grant.service';

/**
 * Everything this application contributes to the Authorization Server, which is now only
 * what `BlOAuthServerModule` cannot resolve for itself: the current user behind a Session
 * token, the refresh tokens, and the Grants — the two latter because both point at this
 * application's own user record.
 *
 * The endpoints, the stores, the consent step and the grant logic all live in
 * `bl-oauth-server`; this module is what the application module passes into its
 * `forRootAsync` imports. Configuration goes the other way, through the factory.
 *
 * `HnRefreshTokenModule` is re-exported rather than re-declared: it is what provides
 * `BL_REFRESH_TOKEN_SERVICE_PROVIDER`, the alias through which shared code reaches this
 * application's own refresh token service.
 */
@Module({
  imports: [HnRefreshTokenModule, TypeOrmModule.forFeature([HnOAuthGrant])],
  providers: [
    HnOAuthCurrentUserResolver,
    { provide: BL_OAUTH_CURRENT_USER_RESOLVER, useExisting: HnOAuthCurrentUserResolver },
    HnOAuthGrantService,
    // The Authorization Server reads the approvals through the alias, since there is no
    // class token shared across applications.
    { provide: BL_OAUTH_GRANT_SERVICE_PROVIDER, useExisting: HnOAuthGrantService },
  ],
  exports: [
    BL_OAUTH_CURRENT_USER_RESOLVER,
    BL_OAUTH_GRANT_SERVICE_PROVIDER,
    HnOAuthGrantService,
    HnRefreshTokenModule,
  ],
})
export class HnOAuthModule {}
