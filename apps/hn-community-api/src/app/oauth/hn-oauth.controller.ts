import { BlJwtService, BlPublic } from '@monorepo/back-core-lib';
import { BadRequestException, Body, Controller, Get, HttpCode, Post } from '@nestjs/common';

import { HN_JWT_CONFIG } from '../auth/hn-jwt.config';
import { HnOAuthConfig } from './hn-oauth.config';
import { HN_OAUTH_PATHS } from './hn-oauth.constants';
import { HnOAuthClient, HnOAuthClientStore } from './hn-oauth-client.store';
import { HnOAuthCodeStore } from './hn-oauth-code.store';
import {
  HnAuthServerMetadata,
  hnBuildAuthServerMetadata,
  hnBuildProtectedResourceMetadata,
  HnProtectedResourceMetadata,
} from './hn-oauth-metadata.builder';
import { hnVerifyPkce } from './hn-oauth-pkce.util';

interface HnOAuthRegisterBody {
  redirect_uris?: unknown;
  client_name?: unknown;
}

interface HnOAuthTokenBody {
  grant_type?: string;
  code?: string;
  redirect_uri?: string;
  client_id?: string;
  code_verifier?: string;
}

interface HnOAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

/**
 * OAuth 2.1 endpoints for the (general) Constellab authorization server.
 * Public (bypass the global JWT/admin guards). The discovery documents MUST resolve
 * at the host root so MCP clients can discover them.
 */
@Controller()
export class HnOAuthController {
  constructor(
    private readonly config: HnOAuthConfig,
    private readonly clientStore: HnOAuthClientStore,
    private readonly codeStore: HnOAuthCodeStore,
    private readonly jwtService: BlJwtService
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

  /**
   * Token endpoint (authorization_code grant + PKCE). Exchanges a one-time code for
   * an access token (JWT) whose `aud` is the resource the code was issued for.
   */
  @BlPublic()
  @Post(HN_OAUTH_PATHS.token)
  @HttpCode(200)
  token(@Body() body: HnOAuthTokenBody): HnOAuthTokenResponse {
    if (body?.grant_type !== 'authorization_code') {
      throw this.oauthError('unsupported_grant_type', 'only authorization_code is supported');
    }
    const { code, redirect_uri: redirectUri, client_id: clientId, code_verifier: codeVerifier } = body;
    if (!code || !redirectUri || !clientId || !codeVerifier) {
      throw this.oauthError(
        'invalid_request',
        'code, redirect_uri, client_id and code_verifier are required'
      );
    }

    const binding = this.codeStore.consume(code);
    if (
      !binding ||
      binding.clientId !== clientId ||
      binding.redirectUri !== redirectUri ||
      !hnVerifyPkce(codeVerifier, binding.codeChallenge)
    ) {
      throw this.oauthError('invalid_grant', 'authorization code is invalid, expired or mismatched');
    }

    const accessToken = this.jwtService.generateTokenForAudience(
      binding.user.id,
      binding.user.email,
      binding.resource
    );
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: HN_JWT_CONFIG.tokenDurationInSeconds,
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

  private oauthError(error: string, errorDescription: string): BadRequestException {
    return new BadRequestException({ error, error_description: errorDescription });
  }
}
