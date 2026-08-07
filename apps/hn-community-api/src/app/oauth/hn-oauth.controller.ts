import {
  BL_OAUTH_PATHS,
  BlAuthServerMetadata,
  blBuildAuthServerMetadata,
  blBuildProtectedResourceMetadata,
  BlCookieHelper,
  BlJwtService,
  BlProtectedResourceMetadata,
  BlPublic,
  BlPublicSecure,
  blResourcePathFromMetadataUrl,
  blValidateRedirectUris,
  blVerifyPkce,
} from '@monorepo/back-core-lib';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { HN_JWT_CONFIG } from '../auth/hn-jwt.config';
import { HnRefreshTokenService } from '../auth/refresh-token/hn-refresh-token.service';
import { HN_OAUTH_MAX_CLIENT_NAME_LENGTH, HnOAuthConfig } from './hn-oauth.config';
import { HnOAuthException, HnOAuthExceptionFilter } from './hn-oauth.exception';
import { HnAuthorizeQueryDto } from './hn-oauth-authorize.dto';
import { hnValidateAuthorizeParams } from './hn-oauth-authorize.validator';
import { HnOAuthClient, HnOAuthClientStore } from './hn-oauth-client.store';
import { HnOAuthCodeStore, HnOAuthCodeUser } from './hn-oauth-code.store';

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
  refresh_token?: string;
  /**
   * Accepted on the refresh grant only to be *rejected* when it disagrees with the
   * binding stored at authorization time. It is never the source of the audience —
   * that is what would let a client widen its own scope on renewal.
   */
  resource?: string;
}

/** RFC 7009 §2.1. `token_type_hint` is advisory and we do not need it. */
interface HnOAuthRevokeBody {
  token?: string;
  client_id?: string;
}

/** RFC 7591 §3.2.1 response: the registration, plus the capabilities it is fixed to. */
interface HnOAuthRegisterResponse extends HnOAuthClient {
  token_endpoint_auth_method: 'none';
  grant_types: string[];
  response_types: string[];
}

interface HnOAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
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
    private readonly jwtService: BlJwtService,
    private readonly refreshTokenService: HnRefreshTokenService
  ) {}

  @BlPublic()
  @Get(BL_OAUTH_PATHS.authorizationServerMetadata)
  getAuthServerMetadata(): BlAuthServerMetadata {
    return blBuildAuthServerMetadata(this.config.issuer);
  }

  /**
   * The pathless Protected Resource Metadata document.
   *
   * RFC 9728 only defines the per-resource form below, but a client that predates the
   * split asks for this one, so it keeps answering for the primary resource. Kept
   * rather than redirected: a discovery document that 404s makes a client give up on
   * the whole flow.
   */
  @BlPublic()
  @Get(BL_OAUTH_PATHS.protectedResourceMetadata)
  getProtectedResourceMetadata(): BlProtectedResourceMetadata {
    return blBuildProtectedResourceMetadata(this.config.resources[0], this.config.issuer);
  }

  /**
   * Protected Resource Metadata for one resource (RFC 9728 §3.1), e.g.
   * `/.well-known/oauth-protected-resource/mcp/community-doc`.
   *
   * One document per resource is what makes several MCPs on this host distinguishable
   * to a client: each `WWW-Authenticate` points at its own document, and each document
   * names exactly one `resource`. Serving the same document for every path would tell
   * a client calling the space MCP that it should ask for a community-doc audience.
   *
   * The resource comes from the request path, matched against the registry — an
   * unknown path is a 404 rather than a document for a resource we do not serve.
   */
  @BlPublic()
  @Get(`${BL_OAUTH_PATHS.protectedResourceMetadata}/*splat`)
  getProtectedResourceMetadataForPath(@Req() request: Request): BlProtectedResourceMetadata {
    const resourcePath = blResourcePathFromMetadataUrl(request.path);
    const resource = `${this.config.issuer}${resourcePath ?? ''}`;

    if (!resourcePath || !this.config.isKnownResource(resource)) {
      throw new NotFoundException('unknown protected resource');
    }
    return blBuildProtectedResourceMetadata(resource, this.config.issuer);
  }

  /**
   * Authorization endpoint (Authorization Code + PKCE).
   *
   * v1 slice: validates the request, then relies on the existing Constellab session
   * cookie. If logged in → issues a one-time code and redirects back to the client.
   * If not → redirects to the front login with a `returnUrl` (front dependency).
   */
  @BlPublic()
  @Get(BL_OAUTH_PATHS.authorize)
  async authorize(
    @Query(authorizeQueryPipe) query: HnAuthorizeQueryDto,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    const validation = await hnValidateAuthorizeParams(query, this.clientStore, this.config);

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

    const code = await this.codeStore.create({
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
   *
   * Open registration, but the redirect target is constrained: since there is no
   * consent screen (yet), an unrestricted `redirect_uri` would let anyone collect an
   * authorization code for a logged-in user.
   */
  @BlPublic()
  @Post(BL_OAUTH_PATHS.register)
  @HttpCode(201)
  async register(@Body() body: HnOAuthRegisterBody): Promise<HnOAuthRegisterResponse> {
    const validation = blValidateRedirectUris(body?.redirect_uris, this.config.allowedRedirectUris);
    if (!validation.ok) {
      throw new HnOAuthException('invalid_redirect_uri', validation.errorDescription);
    }

    // Bounded because the store keeps it for the lifetime of the client.
    const clientName =
      typeof body?.client_name === 'string'
        ? body.client_name.slice(0, HN_OAUTH_MAX_CLIENT_NAME_LENGTH)
        : undefined;

    const client = await this.clientStore.register({
      redirect_uris: validation.redirectUris,
      client_name: clientName,
    });

    return {
      ...client,
      token_endpoint_auth_method: 'none',
      // Must stay in step with `grant_types_supported` in the discovery document: a
      // client reading its own registration and finding no `refresh_token` there can
      // decide not to use the refresh token /token hands it.
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    };
  }

  /**
   * Token endpoint. Two grants, both yielding the same response shape so a client has
   * one code path: `authorization_code` (+ PKCE) for the initial exchange, and
   * `refresh_token` for renewals.
   *
   * Throttled: unauthenticated, and both grants hit a store.
   */
  @BlPublicSecure()
  @Post(BL_OAUTH_PATHS.token)
  @HttpCode(200)
  async token(@Body() body: HnOAuthTokenBody): Promise<HnOAuthTokenResponse> {
    switch (body?.grant_type) {
      case 'authorization_code':
        return this.exchangeAuthorizationCode(body);
      case 'refresh_token':
        return this.exchangeRefreshToken(body);
      default:
        throw new HnOAuthException(
          'unsupported_grant_type',
          'only authorization_code and refresh_token are supported'
        );
    }
  }

  /**
   * Revocation endpoint (RFC 7009). Ends the session behind a refresh token.
   *
   * Always 200, including for a token that is unknown, already revoked or not ours
   * (§2.2): telling a caller whether a token exists would turn this into an oracle,
   * and a client retrying a revocation must not see an error.
   *
   * An access token presented here is a no-op — it is a self-contained JWT, validated
   * by signature alone with nothing to delete, so it stays usable until it expires.
   * That is why its lifetime is an hour.
   */
  @BlPublicSecure()
  @Post(BL_OAUTH_PATHS.revoke)
  @HttpCode(200)
  async revoke(@Body() body: HnOAuthRevokeBody): Promise<void> {
    const { token, client_id: clientId } = body ?? {};
    if (!token || !clientId) {
      // The one case RFC 7009 does let us reject: a malformed request, as opposed to a
      // well-formed one carrying a token we know nothing about.
      throw new HnOAuthException('invalid_request', 'token and client_id are required');
    }
    // Scoped to the client, so this unauthenticated endpoint cannot be used to end a
    // browser session or another client's session even if a token leaks into it.
    await this.refreshTokenService.revokeOAuthToken(token, clientId);
  }

  /** Exchange a one-time authorization code for the first token pair. */
  private async exchangeAuthorizationCode(body: HnOAuthTokenBody): Promise<HnOAuthTokenResponse> {
    const { code, redirect_uri: redirectUri, client_id: clientId, code_verifier: codeVerifier } = body;
    if (!code || !redirectUri || !clientId || !codeVerifier) {
      throw new HnOAuthException(
        'invalid_request',
        'code, redirect_uri, client_id and code_verifier are required'
      );
    }

    const binding = await this.codeStore.consume(code);
    if (
      !binding ||
      binding.clientId !== clientId ||
      binding.redirectUri !== redirectUri ||
      !blVerifyPkce(codeVerifier, binding.codeChallenge)
    ) {
      throw new HnOAuthException('invalid_grant', 'authorization code is invalid, expired or mismatched');
    }

    // The binding is the only place the resource is ever taken from — here it comes
    // from the code, and on renewal from the stored row. Never from the request.
    const refreshToken = await this.refreshTokenService.issue({ id: binding.user.id }, 'oauth', {
      clientId,
      resource: binding.resource,
    });

    return this.tokenResponse(binding.user.id, binding.user.email, binding.resource, refreshToken);
  }

  /**
   * Renew an access token from a refresh token, rotating it.
   *
   * The audience comes from the stored row, never from the request: reading a
   * `resource` parameter here would let a client that was granted read access to one
   * MCP walk it up to another one at renewal time.
   */
  private async exchangeRefreshToken(body: HnOAuthTokenBody): Promise<HnOAuthTokenResponse> {
    const { refresh_token: presentedToken, client_id: clientId } = body;
    if (!presentedToken || !clientId) {
      throw new HnOAuthException('invalid_request', 'refresh_token and client_id are required');
    }

    // `kind: 'oauth'` is what keeps the two surfaces apart: a browser session's refresh
    // token cannot be turned into an MCP access token here, and vice versa on /auth/refresh.
    const rotation = await this.refreshTokenService.rotate(presentedToken, 'oauth');
    if (rotation == null || rotation.resource == null) {
      throw new HnOAuthException('invalid_grant', 'refresh token is invalid, expired or already used');
    }

    if (rotation.clientId !== clientId) {
      // The rotation already burned the token, so the session is unusable anyway; drop
      // the row rather than leave a chain a mismatched caller has a valid token for.
      // A client presenting another client's refresh token is not a bug we accommodate.
      await this.refreshTokenService.revoke(rotation.token);
      throw new HnOAuthException('invalid_grant', 'refresh token was not issued to this client');
    }

    // A client MAY repeat `resource` (RFC 8707 §2.2). Honour it only as an assertion:
    // silently ignoring a mismatch would let it believe it holds an audience it does not.
    if (body.resource != null && body.resource !== rotation.resource) {
      throw new HnOAuthException('invalid_target', 'resource does not match the one originally granted');
    }

    return this.tokenResponse(rotation.user.id, rotation.user.email, rotation.resource, rotation.token);
  }

  /**
   * Mint the access token and describe it.
   *
   * One duration for both the signature and the `expires_in` the client is told: they
   * used to agree only because each side happened to read the same constant, and a
   * client that trusts a longer `expires_in` than the signature stops refreshing in
   * time and starts failing on 401s it did not expect.
   */
  private tokenResponse(
    userId: string,
    userEmail: string,
    resource: string,
    refreshToken: string
  ): HnOAuthTokenResponse {
    const durationInSeconds = this.config.mcpAccessTokenDurationInSeconds;
    return {
      access_token: this.jwtService.generateTokenForAudience(userId, userEmail, resource, durationInSeconds),
      token_type: 'Bearer',
      expires_in: durationInSeconds,
      refresh_token: refreshToken,
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
}
