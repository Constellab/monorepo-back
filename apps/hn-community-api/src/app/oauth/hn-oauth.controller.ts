import { BlCookieHelper, BlJwtService, BlPublic } from '@monorepo/back-core-lib';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { HN_JWT_CONFIG } from '../auth/hn-jwt.config';
import { HnOAuthConfig } from './hn-oauth.config';
import { HN_OAUTH_PATHS } from './hn-oauth.constants';
import { HnOAuthException, HnOAuthExceptionFilter } from './hn-oauth.exception';
import { HnAuthorizeQueryDto } from './hn-oauth-authorize.dto';
import { hnValidateAuthorizeParams } from './hn-oauth-authorize.validator';
import { HnOAuthClient, HnOAuthClientStore } from './hn-oauth-client.store';
import { HnOAuthCodeStore, HnOAuthCodeUser } from './hn-oauth-code.store';
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
 * Validation pipe for `/authorize`: turns the declared DTO types into a runtime
 * guarantee and reports failures as OAuth errors instead of Nest's default shape.
 */
const authorizeQueryPipe = new ValidationPipe({
  transform: true,
  exceptionFactory: (errors) => {
    const detail = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .filter((message) => message.length > 0)
      .join('; ');
    return new HnOAuthException('invalid_request', detail || 'invalid authorization request');
  },
});

/**
 * OAuth 2.1 endpoints for the (general) Constellab authorization server.
 * Public (bypass the global JWT/admin guards). The discovery documents MUST resolve
 * at the host root so MCP clients can discover them.
 *
 * `@UseFilters(HnOAuthExceptionFilter)` keeps OAuth error bodies intact: the global
 * `HnCoreExceptionHandlerFilter` would otherwise rewrite them to the Constellab
 * `BlApiError` shape and drop the `error` code that OAuth clients parse.
 */
@Controller()
@UseFilters(HnOAuthExceptionFilter)
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
   * Authorization endpoint (Authorization Code + PKCE).
   *
   * v1 slice: validates the request, then relies on the existing Constellab session
   * cookie. If logged in → issues a one-time code and redirects back to the client.
   * If not → redirects to the front login with a `returnUrl` (front dependency).
   */
  @BlPublic()
  @Get(HN_OAUTH_PATHS.authorize)
  authorize(
    @Query(authorizeQueryPipe) query: HnAuthorizeQueryDto,
    @Req() request: Request,
    @Res() response: Response
  ): void {
    const validation = hnValidateAuthorizeParams(query, this.clientStore, this.config);

    if (!validation.ok) {
      if (validation.kind === 'pre_redirect') {
        // client_id / redirect_uri untrusted → never redirect (open-redirect defense)
        throw new HnOAuthException(validation.error, validation.errorDescription);
      }
      response.redirect(
        this.buildRedirectUrl(validation.redirectUri, {
          error: validation.error,
          error_description: validation.errorDescription,
          state: validation.state,
        })
      );
      return;
    }

    const { params } = validation;
    const user = this.currentUserFromCookie(request);
    if (!user) {
      const returnUrl = `${this.config.issuer}${request.originalUrl}`;
      response.redirect(`${this.config.frontLoginUrl}?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    const code = this.codeStore.create({
      clientId: params.client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      resource: params.resource,
      user,
    });
    response.redirect(this.buildRedirectUrl(params.redirectUri, { code, state: params.state }));
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
      throw new HnOAuthException('unsupported_grant_type', 'only authorization_code is supported');
    }
    const { code, redirect_uri: redirectUri, client_id: clientId, code_verifier: codeVerifier } = body;
    if (!code || !redirectUri || !clientId || !codeVerifier) {
      throw new HnOAuthException(
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
      throw new HnOAuthException('invalid_grant', 'authorization code is invalid, expired or mismatched');
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

  /** Resolve the logged-in user from the Constellab session cookie, or null. */
  private currentUserFromCookie(request: Request): HnOAuthCodeUser | null {
    const token = BlCookieHelper.getCookieFromHeader(
      request.headers.cookie ?? '',
      HN_JWT_CONFIG.authorizationCookie
    );
    if (!token) {
      return null;
    }
    try {
      const payload = this.jwtService.verifyToken(token);
      return { id: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  }

  /** Append query params to a (validated) redirect URI. */
  private buildRedirectUrl(base: string, params: Record<string, string | undefined>): string {
    const url = new URL(base);
    for (const [key, value] of Object.entries(params)) {
      if (value != null) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  private parseRedirectUris(value: unknown): string[] {
    if (
      !Array.isArray(value) ||
      value.length === 0 ||
      !value.every((uri): uri is string => typeof uri === 'string' && uri.length > 0)
    ) {
      throw new HnOAuthException(
        'invalid_redirect_uri',
        'redirect_uris must be a non-empty array of strings'
      );
    }
    return value;
  }
}
