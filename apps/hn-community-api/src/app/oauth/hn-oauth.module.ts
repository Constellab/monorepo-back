import { Global, Module } from '@nestjs/common';

import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnMcpResourceGuard } from './hn-mcp-resource.guard';
import { HnOAuthConfig } from './hn-oauth.config';
import { HnOAuthController } from './hn-oauth.controller';

/**
 * General (resource-agnostic) Constellab OAuth 2.1 authorization server.
 *
 * Marked @Global so `HnOAuthConfig` and the `HnMcpResourceGuard` resolve everywhere,
 * including inside the dynamically-created @rekog MCP controllers that reference the
 * guard via their `guards` option.
 *
 * v1 scope: discovery metadata + the Resource Server guard. Client registration,
 * /authorize and /token are added in later steps.
 */
@Global()
@Module({
  imports: [HnCoreConfigModule],
  controllers: [HnOAuthController],
  providers: [HnOAuthConfig, HnMcpResourceGuard],
  exports: [HnOAuthConfig, HnMcpResourceGuard],
})
export class HnOAuthModule {}
