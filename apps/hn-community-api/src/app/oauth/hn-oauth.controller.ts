import { BlPublic } from '@monorepo/back-core-lib';
import { Controller, Get } from '@nestjs/common';

import { HnOAuthConfig } from './hn-oauth.config';
import { HN_OAUTH_PATHS } from './hn-oauth.constants';
import {
  HnAuthServerMetadata,
  hnBuildAuthServerMetadata,
  hnBuildProtectedResourceMetadata,
  HnProtectedResourceMetadata,
} from './hn-oauth-metadata.builder';

/**
 * OAuth 2.1 discovery endpoints for the (general) Constellab authorization server.
 * Both are public (bypass the global JWT/admin guards) and MUST resolve at the host
 * root so MCP clients can discover them.
 */
@Controller()
export class HnOAuthController {
  constructor(private readonly config: HnOAuthConfig) {}

  @BlPublic()
  @Get(HN_OAUTH_PATHS.authorizationServerMetadata)
  getAuthServerMetadata(): HnAuthServerMetadata {
    return hnBuildAuthServerMetadata(this.config.issuer);
  }

  @BlPublic()
  @Get(HN_OAUTH_PATHS.protectedResourceMetadata)
  getProtectedResourceMetadata(): HnProtectedResourceMetadata {
    // v1: a single primary resource (community-doc). Per-resource PRM documents
    // will be added when a second MCP resource exists.
    return hnBuildProtectedResourceMetadata(this.config.resources[0], this.config.issuer);
  }
}
