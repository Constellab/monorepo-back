import { BlPublic } from '@monorepo/back-core-lib';
import { BadRequestException, Body, Controller, Get, HttpCode, Post } from '@nestjs/common';

import { HnOAuthConfig } from './hn-oauth.config';
import { HN_OAUTH_PATHS } from './hn-oauth.constants';
import { HnOAuthClient, HnOAuthClientStore } from './hn-oauth-client.store';
import {
  HnAuthServerMetadata,
  hnBuildAuthServerMetadata,
  hnBuildProtectedResourceMetadata,
  HnProtectedResourceMetadata,
} from './hn-oauth-metadata.builder';

interface HnOAuthRegisterBody {
  redirect_uris?: unknown;
  client_name?: unknown;
}

/**
 * OAuth 2.1 endpoints for the (general) Constellab authorization server.
 * Public (bypass the global JWT/admin guards). The discovery documents MUST resolve
 * at the host root so MCP clients can find them.
 */
@Controller()
export class HnOAuthController {
  constructor(
    private readonly config: HnOAuthConfig,
    private readonly clientStore: HnOAuthClientStore
  ) {}

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

  /**
   * Dynamic Client Registration (RFC 7591). Public client, PKCE, no secret.
   */
  @BlPublic()
  @Post(HN_OAUTH_PATHS.register)
  @HttpCode(201)
  register(@Body() body: HnOAuthRegisterBody): HnOAuthClient & Record<string, unknown> {
    const redirectUris = this.parseRedirectUris(body?.redirect_uris);
    const clientName = typeof body?.client_name === 'string' ? body.client_name : undefined;

    const client = this.clientStore.register({ redirect_uris: redirectUris, client_name: clientName });

    return {
      ...client,
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code'],
      response_types: ['code'],
    };
  }

  private parseRedirectUris(value: unknown): string[] {
    if (
      !Array.isArray(value) ||
      value.length === 0 ||
      !value.every((uri): uri is string => typeof uri === 'string' && uri.length > 0)
    ) {
      throw new BadRequestException({
        error: 'invalid_redirect_uri',
        error_description: 'redirect_uris must be a non-empty array of strings',
      });
    }
    return value;
  }
}
