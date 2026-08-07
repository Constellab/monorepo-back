import { Module } from '@nestjs/common';

import { HnRefreshTokenModule } from '../auth/refresh-token/hn-refresh-token.module';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnOAuthConfig } from './hn-oauth.config';
import { HnOAuthController } from './hn-oauth.controller';
import { HnOAuthClientStore } from './hn-oauth-client.store';
import { HnOAuthCodeStore } from './hn-oauth-code.store';

/**
 * General (resource-agnostic) Constellab OAuth 2.1 authorization server: the
 * authorization server discovery document, dynamic client registration, /authorize,
 * /token and /revoke.
 *
 * The Resource Server half it hands tokens to — the guard, the per-Resource discovery
 * documents and the registry of known Resources — comes from `BlResourceServerModule`,
 * which the application module mounts. This half is the one that mints.
 *
 * No longer `@Global`: that was there so the MCP guard resolved inside @rekog's
 * dynamically created controllers, and the guard now comes from the (global) resource
 * server module. Nothing outside this module resolves what is left.
 */
@Module({
  // HnRefreshTokenModule: /oauth/token now issues and rotates a refresh token, and
  // /oauth/revoke deletes one. No cycle — that module only reaches for HnCoreModule.
  imports: [HnCoreConfigModule, HnRefreshTokenModule],
  controllers: [HnOAuthController],
  providers: [HnOAuthConfig, HnOAuthClientStore, HnOAuthCodeStore],
  exports: [HnOAuthConfig, HnOAuthClientStore, HnOAuthCodeStore],
})
export class HnOAuthModule {}
