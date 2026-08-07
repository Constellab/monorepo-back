import { Global, Module } from '@nestjs/common';

import { HnRefreshTokenModule } from '../auth/refresh-token/hn-refresh-token.module';
import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnMcpResourceGuard } from './hn-mcp-resource.guard';
import { HnOAuthConfig } from './hn-oauth.config';
import { HnOAuthController } from './hn-oauth.controller';
import { HnOAuthClientStore } from './hn-oauth-client.store';
import { HnOAuthCodeStore } from './hn-oauth-code.store';

/**
 * General (resource-agnostic) Constellab OAuth 2.1 authorization server.
 *
 * Marked @Global so `HnOAuthConfig` and the `HnMcpResourceGuard` resolve everywhere,
 * including inside the dynamically-created @rekog MCP controllers that reference the
 * guard via their `guards` option.
 *
 * Covers discovery metadata, dynamic client registration, /authorize, /token and the
 * reusable Resource Server guard.
 */
@Global()
@Module({
  // HnRefreshTokenModule: /oauth/token now issues and rotates a refresh token, and
  // /oauth/revoke deletes one. No cycle — that module only reaches for HnCoreModule.
  imports: [HnCoreConfigModule, HnRefreshTokenModule],
  controllers: [HnOAuthController],
  providers: [HnOAuthConfig, HnMcpResourceGuard, HnOAuthClientStore, HnOAuthCodeStore],
  exports: [HnOAuthConfig, HnMcpResourceGuard, HnOAuthClientStore, HnOAuthCodeStore],
})
export class HnOAuthModule {}
