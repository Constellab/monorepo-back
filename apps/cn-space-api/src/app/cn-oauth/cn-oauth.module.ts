import { BL_OAUTH_CURRENT_USER_RESOLVER, BL_OAUTH_GRANT_SERVICE_PROVIDER } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnRefreshTokenModule } from '../cn-auth/cn-refresh-token/cn-refresh-token.module';
import { CnOAuthCurrentUserResolver } from './cn-oauth-current-user.resolver';
import { CnOAuthGrant } from './cn-oauth-grant.entity';
import { CnOAuthGrantService } from './cn-oauth-grant.service';

/**
 * Everything this application contributes to the Authorization Server, which is only what
 * `BlOAuthServerModule` cannot resolve for itself: the current user behind a Session token,
 * the refresh tokens, and the Grants — the two latter because both point at this
 * application's own user record.
 *
 * The endpoints, the stores, the consent step and the grant logic all live in
 * `bl-oauth-server`; this module is what the application module passes into its
 * `forRootAsync` imports. Configuration goes the other way, through the factory.
 *
 * `CnRefreshTokenModule` is re-exported rather than re-declared: it is what provides
 * `BL_REFRESH_TOKEN_SERVICE_PROVIDER`, the alias through which shared code reaches this
 * application's own refresh token service.
 */
@Module({
  imports: [CnRefreshTokenModule, TypeOrmModule.forFeature([CnOAuthGrant])],
  providers: [
    CnOAuthCurrentUserResolver,
    { provide: BL_OAUTH_CURRENT_USER_RESOLVER, useExisting: CnOAuthCurrentUserResolver },
    CnOAuthGrantService,
    // The Authorization Server reads the approvals through the alias, since there is no
    // class token shared across applications.
    { provide: BL_OAUTH_GRANT_SERVICE_PROVIDER, useExisting: CnOAuthGrantService },
  ],
  exports: [
    BL_OAUTH_CURRENT_USER_RESOLVER,
    BL_OAUTH_GRANT_SERVICE_PROVIDER,
    CnOAuthGrantService,
    CnRefreshTokenModule,
  ],
})
export class CnOAuthModule {}
