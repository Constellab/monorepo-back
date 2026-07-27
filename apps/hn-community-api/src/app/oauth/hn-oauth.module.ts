import { Module } from '@nestjs/common';

import { HnCoreConfigModule } from '../core/modules/core-config/hn-core-config.module';
import { HnOAuthConfig } from './hn-oauth.config';
import { HnOAuthController } from './hn-oauth.controller';

/**
 * General (resource-agnostic) Constellab OAuth 2.1 authorization server.
 *
 * v1 scope: discovery metadata endpoints. Client registration, /authorize and
 * /token are added in later steps; the module is designed so several MCP resources
 * (community-doc now, space/gateway later) share this one server.
 */
@Module({
  imports: [HnCoreConfigModule],
  controllers: [HnOAuthController],
  providers: [HnOAuthConfig],
  exports: [HnOAuthConfig],
})
export class HnOAuthModule {}
