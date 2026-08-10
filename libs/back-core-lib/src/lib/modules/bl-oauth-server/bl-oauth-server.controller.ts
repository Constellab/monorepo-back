import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { BlPublic, BlPublicSecure } from '../../decorators/bl-public.decorator';
import { BlJwtAsymmetricService } from '../bl-jwt/bl-jwt-asymmetric.service';
import { BL_OAUTH_PATHS } from '../bl-oauth/bl-oauth.constants';
import { BlAuthServerMetadata, blBuildAuthServerMetadata } from '../bl-oauth/bl-oauth-metadata.builder';
import { blVerifyPkce } from '../bl-oauth/bl-oauth-pkce.util';
import { blValidateRedirectUris } from '../bl-oauth/bl-oauth-redirect-uri.validator';
import { blBuildUrlWithParams, blStripTrailingSlashes } from '../bl-oauth/bl-oauth-url.util';
import { BL_REFRESH_TOKEN_SERVICE_PROVIDER } from '../bl-refresh-token/bl-refresh-token.class';
import { BlRefreshTokenService } from '../bl-refresh-token/bl-refresh-token.service';
import { BlResourceRegistry } from '../bl-resource-server/bl-resource.registry';
import { BlOAuthAuthorizeQueryDto } from './bl-oauth-authorize.dto';
import { blValidateAuthorizeParams } from './bl-oauth-authorize.validator';
import { BlOAuthClient, BlOAuthClientStore } from './bl-oauth-client.store';
import { BlOAuthCodeStore } from './bl-oauth-code.store';
import {
  BlOAuthConsentDecisionQueryDto,
  BlOAuthConsentDetailsResponse,
  BlOAuthConsentIdQueryDto,
  BlOAuthConsentResourceResponse,
  BlOAuthConsentTokenBody,
  BlOAuthConsentTokenResponse,
} from './bl-oauth-consent.dto';
import { BlOAuthConsentStore, BlOAuthPendingAuthorization } from './bl-oauth-consent.store';
import { BL_OAUTH_GRANT_SERVICE_PROVIDER, BlOAuthGrantService } from './bl-oauth-grant.service';
import {
  BL_OAUTH_CURRENT_USER_RESOLVER,
  BL_OAUTH_SERVER_CONFIG_PROVIDER,
  BlOAuthCurrentUserResolver,
  BlOAuthServerConfig,
  BlOAuthUser,
} from './bl-oauth-server.class';
import { BlOAuthException, BlOAuthExceptionFilter } from './bl-oauth-server.exception';

interface BlOAuthRegisterBody {
  redirect_uris?: unknown;
  client_name?: unknown;
}

interface BlOAuthTokenBody {
  grant_type?: string;
  code?: string;
  redirect_uri?: string;
  client_id?: string;
  code_verifier?: string;
  refresh_token?: string;
  /**
   * Which of the approved Resources this token is for.
   *
   * On the authorization code grant it *selects* among what the user approved (RFC 8707
   * §2.2) — it can never name anything they did not. On the refresh grant it is accepted
   * only to be *rejected* when it disagrees with the binding stored at authorization time:
   * it is never the source of the audience there, which is what would let a client widen
   * its own scope on renewal.
   */
  resource?: string;
}

/** RFC 7009 §2.1. `token_type_hint` is advisory and we do not need it. */
interface BlOAuthRevokeBody {
  token?: string;
  client_id?: string;
}

/** RFC 7591 §3.2.1 response: the registration, plus the capabilities it is fixed to. */
interface BlOAuthRegisterResponse extends BlOAuthClient {
  token_endpoint_auth_method: 'none';
  grant_types: string[];
  response_types: string[];
}

interface BlOAuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
}

/**
 * Validation pipe for the query parameters of the interactive endpoints: turns the declared
 * DTO types into a runtime guarantee and reports failures as OAuth errors instead of Nest's
 * default shape.
 */
const oauthQueryPipe = new ValidationPipe({
  transform: true,
  exceptionFactory: (errors) => {
    const detail = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .filter((message) => message.length > 0)
      .join('; ');
    return new BlOAuthException('invalid_request', detail || 'invalid authorization request');
  },
});

/**
 * The Constellab OAuth 2.1 Authorization Server: the authorization server discovery
 * document, dynamic client registration, /authorize, the consent step, /token and /revoke.
 *
 * Public (bypasses the mounting application's global guards). The discovery document MUST
 * resolve at the host root so MCP clients can find it.
 *
 * The Resource Server half — the per-Resource discovery documents and the guard that
 * enforces an audience — is `BlResourceServerModule` and is not here. This half is the one
 * that mints, and exactly one application mounts it.
 *
 * The consent endpoints live in this controller rather than one of their own because they
 * are the middle of `/authorize`, not a feature beside it: the same request is validated
 * here, parked here, and finished here, and reading the flow in one place is what makes it
 * apparent that no path through it issues a code without an approval.
 *
 * `@UseFilters(BlOAuthExceptionFilter)` keeps OAuth error bodies intact: the mounting
 * application's global exception filter would otherwise rewrite them to the Constellab
 * `BlApiError` shape and drop the `error` code that OAuth clients parse.
 */
@Controller()
@UseFilters(BlOAuthExceptionFilter)
export class BlOAuthServerController {
  constructor(
    @Inject(BL_OAUTH_SERVER_CONFIG_PROVIDER) private readonly config: BlOAuthServerConfig,
    /**
     * The Resources a token may be minted for, and the words a user is shown about them,
     * read from the Resource Server half rather than kept here: the audience this server
     * writes into a token, the audience a Resource Server checks it against and what the
     * consent screen says is being handed over all come from one list.
     */
    private readonly resources: BlResourceRegistry,
    private readonly clientStore: BlOAuthClientStore,
    private readonly codeStore: BlOAuthCodeStore,
    /** The authorization requests waiting for an answer, and the tokens that carry one. */
    private readonly consentStore: BlOAuthConsentStore,
    /** Signs the MCP access tokens this endpoint hands out. Asymmetric — see `tokenResponse`. */
    private readonly mcpJwtService: BlJwtAsymmetricService,
    /**
     * The mounting application's own refresh token service, reached through the shared
     * alias: each application binds its own subclass over its own table, so there is no
     * class token this could depend on.
     */
    @Inject(BL_REFRESH_TOKEN_SERVICE_PROVIDER)
    private readonly refreshTokenService: BlRefreshTokenService<BlOAuthUser>,
    /**
     * The approvals users have given, reached through an alias for the same reason: a Grant
     * row points at the mounting application's own user record.
     */
    @Inject(BL_OAUTH_GRANT_SERVICE_PROVIDER)
    private readonly grantService: BlOAuthGrantService<BlOAuthUser>,
    /**
     * The one application-shaped seam of this half: only the application that minted a
     * Session token can turn one into a user.
     */
    @Inject(BL_OAUTH_CURRENT_USER_RESOLVER)
    private readonly currentUserResolver: BlOAuthCurrentUserResolver
  ) {}

  @BlPublic()
  @Get(BL_OAUTH_PATHS.authorizationServerMetadata)
  getAuthServerMetadata(): BlAuthServerMetadata {
    return blBuildAuthServerMetadata(this.issuer);
  }

  /**
   * Authorization endpoint (Authorization Code + PKCE).
   *
   * Validates the request, then asks the mounting application who is logged in. Three
   * outcomes, and only one of them produces a code:
   * - not logged in → the front login, carrying a `returnUrl` back here (front dependency);
   * - logged in, and every Resource asked for is already approved for this client → a code,
   *   because the user has already answered this exact question;
   * - logged in, and anything is unapproved → the consent screen, and nothing is created.
   */
  @BlPublic()
  @Get(BL_OAUTH_PATHS.authorize)
  async authorize(
    @Query(oauthQueryPipe) query: BlOAuthAuthorizeQueryDto,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    const validation = await blValidateAuthorizeParams(query, this.clientStore, this.resources);

    if (!validation.ok) {
      if (validation.kind === 'pre_redirect') {
        // client_id / redirect_uri untrusted → never redirect (open-redirect defense)
        throw new BlOAuthException(validation.error, validation.errorDescription);
      }
      response.redirect(
        blBuildUrlWithParams(validation.redirectUri, {
          error: validation.error,
          error_description: validation.errorDescription,
          state: validation.state,
        })
      );
      return;
    }

    const { params } = validation;
    const user = await this.currentUserResolver.resolveCurrentUser(request);
    if (!user) {
      this.redirectToLogin(response, `${this.issuer}${request.originalUrl}`);
      return;
    }

    const pending: BlOAuthPendingAuthorization = {
      clientId: params.client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      resources: params.resources,
      state: params.state,
      user,
    };

    // A client the user has already approved for every Resource it is asking for is not
    // asking a new question. Prompting again would train users to click through the screen,
    // and it is also how a client obtains its second Grant out of a single approval: it
    // comes back here for the other Resource and is sent straight home with a code.
    if (await this.grantService.areAllGranted(user.id, pending.clientId, pending.resources)) {
      await this.issueCode(response, pending);
      return;
    }

    // Nothing is granted here — a pending authorization is a question, not an answer, and
    // abandoning the screen leaves only a record that expires.
    this.redirectToConsentPage(response, await this.consentStore.createPending(pending));
  }

  /**
   * Re-enter the flow at its consent step, after the session died under the consent page and
   * the user went through login.
   *
   * Served under `/oauth/authorize/` like the rest of the step, and that is not cosmetic:
   * the login page honours a `returnUrl` only when it points at the authorization endpoint,
   * which is what keeps it from being an open redirect. A consent route anywhere else would
   * be dropped by the front, and the user would land in the application with a client still
   * waiting.
   *
   * Whether the request is still worth resuming is not decided here. This is a browser
   * navigation, so every answer it gives is something a person looks at, and the page is the
   * only thing in the flow that can say "this request no longer exists" in words — it asks
   * for the description and shows that screen when there is none. Answering an expired id
   * with an error body would leave the user staring at JSON.
   */
  @BlPublic()
  @Get(BL_OAUTH_PATHS.consent)
  async resumeConsent(
    @Query(oauthQueryPipe) query: BlOAuthConsentIdQueryDto,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    const user = await this.currentUserResolver.resolveCurrentUser(request);
    if (!user) {
      // Straight back to login rather than to the page, which would only bounce here again.
      this.redirectToLogin(response, `${this.issuer}${request.originalUrl}`);
      return;
    }

    this.redirectToConsentPage(response, query.consent_id);
  }

  /**
   * What is being asked, for the consent page to render.
   *
   * A description and nothing else: this call creates nothing and grants nothing, which is
   * what makes closing the page safe. Every field is served as given — the page hardcodes
   * nothing about the client or its access, so a Resource added on this side reaches users
   * without a front-end deployment.
   */
  @BlPublic()
  @Get(BL_OAUTH_PATHS.consentDetails)
  async getConsentDetails(
    @Query(oauthQueryPipe) query: BlOAuthConsentIdQueryDto,
    @Req() request: Request
  ): Promise<BlOAuthConsentDetailsResponse> {
    const user = await this.requireCurrentUser(request);
    const pending = await this.requirePending(query.consent_id, user);

    const client = await this.clientStore.find(pending.clientId);
    if (!client) {
      // The registration expired or was never there. The flow cannot complete, so the page
      // is told the request no longer exists rather than being asked to describe a client
      // nobody can name.
      throw this.unknownConsentRequest();
    }

    return {
      // Attacker-chosen: registration is dynamic, so this is a claim about the client and
      // is sent as one. The client id below is the only identifier that cannot be forged.
      client_name: client.client_name ?? client.client_id,
      client_id: client.client_id,
      // There is no client vetting. Stated rather than omitted, so the page has no reason
      // to guess, and so the day there is one it is a value change rather than a redesign.
      client_name_is_verified: false,
      user_email: pending.user.email,
      resources: this.describeResources(pending.resources),
      warning: this.config.consentWarning,
    };
  }

  /**
   * Mint the single-use token that makes one decision unforgeable.
   *
   * The cross-site defence of the whole step. Without it, a page on another origin could
   * point a logged-in visitor's browser at the decision endpoint for a pending
   * authorization it started itself, with its own redirect target — an account takeover
   * performed by loading a page. A token can only be obtained by an XHR the CORS policy
   * allows, so only the real consent page can hold one; it is minted on the click, so an
   * abandoned page leaves nothing behind; and it is single use, so it cannot be replayed
   * out of a browser history.
   *
   * Throttled: it is reached without a Bearer token and it writes to a store.
   */
  @BlPublicSecure()
  @Post(BL_OAUTH_PATHS.consentToken)
  @HttpCode(200)
  async createConsentToken(
    @Body() body: BlOAuthConsentTokenBody,
    @Req() request: Request
  ): Promise<BlOAuthConsentTokenResponse> {
    const consentId = typeof body?.consent_id === 'string' ? body.consent_id : '';
    if (!consentId) {
      throw new BlOAuthException('invalid_request', 'consent_id is required');
    }

    const user = await this.requireCurrentUser(request);
    // The token is bound to the user it is minted for as well as to the request, so one
    // obtained in one browser cannot be spent by another session.
    await this.requirePending(consentId, user);

    return { consent_token: await this.consentStore.issueDecisionToken({ consentId, userId: user.id }) };
  }

  /**
   * The user's answer, and the only place a Grant is ever created.
   *
   * A full page navigation answered with a redirect to the client, deliberately not an XHR:
   * the authorization code goes from this server to the client without the front-end ever
   * seeing it.
   *
   * The pending authorization is spent before anything is acted on, so a reload, a back
   * button or a replayed history entry cannot produce a second code — and a refusal is as
   * final as an approval.
   *
   * Nothing here answers with an error body. This is a navigation, so every answer it gives
   * is something a person looks at, and the two ways it can fail both have somewhere better
   * to send them: no session goes back through login carrying this step, and anything else
   * goes back to the page, which is the only thing in the flow that can explain itself in
   * words. A session expiring while the screen sat open is the ordinary case — the page has
   * no way to renew a token for a navigation it does not make — and it must not dead-end on
   * a JSON error with the client still waiting.
   */
  @BlPublic()
  @Get(BL_OAUTH_PATHS.consentDecision)
  async decideConsent(
    @Query(oauthQueryPipe) query: BlOAuthConsentDecisionQueryDto,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    const user = await this.currentUserResolver.resolveCurrentUser(request);
    if (!user) {
      // Back through login, returning to this step rather than to this URL: the decision
      // token is spent on arrival, so replaying this navigation could never work — the user
      // has to be handed the screen again, and press the button again.
      this.redirectToLogin(response, this.resumeConsentUrl(query.consent_id));
      return;
    }

    // Spent first, before the pending authorization is touched: a request arriving without
    // a valid token must leave the pending one exactly as it found it, so the user can
    // still answer for themselves afterwards.
    const decisionToken = await this.consentStore.consumeDecisionToken(query.consent_token);
    if (
      decisionToken == null ||
      decisionToken.consentId !== query.consent_id ||
      decisionToken.userId !== user.id
    ) {
      // Unknown, already spent, or minted for something else — including a forged decision,
      // which this is the defence against. Back to the page: if the request is still there
      // the user can answer it themselves, and if it is not, the page says so.
      this.redirectToConsentPage(response, query.consent_id);
      return;
    }

    const pending = await this.consentStore.consumePending(query.consent_id);
    if (pending == null || pending.user.id !== user.id) {
      // Nowhere else to go: the redirect target was part of the request that is gone, and an
      // unvalidated one must never be redirected to. The page reports it instead.
      this.redirectToConsentPage(response, query.consent_id);
      return;
    }

    if (query.decision === 'deny') {
      // The client is told, rather than left waiting on a flow that silently ended.
      response.redirect(
        blBuildUrlWithParams(pending.redirectUri, {
          error: 'access_denied',
          error_description: 'the user refused the request',
          state: pending.state,
        })
      );
      return;
    }

    // One Grant per Resource, so a renewal can never read an audience wider than the one
    // Resource its own row names. Recorded before the code is issued: the code is what the
    // client turns into a token, and it must not be possible to hold one for an approval that
    // failed to persist.
    //
    // Just the id, as the refresh token is issued with: all the row needs of the user is the
    // foreign key, and handing a whole record to a repository is how an unrelated column ends
    // up written back.
    await this.grantService.approve({ id: pending.user.id }, pending.clientId, pending.resources);

    await this.issueCode(response, pending);
  }

  /**
   * Dynamic Client Registration (RFC 7591). Public client, PKCE, no secret.
   *
   * Open registration, but the redirect target is constrained: an unrestricted
   * `redirect_uri` would let anyone collect an authorization code for a user who approved
   * a client believing it was someone else's.
   */
  @BlPublic()
  @Post(BL_OAUTH_PATHS.register)
  @HttpCode(201)
  async register(@Body() body: BlOAuthRegisterBody): Promise<BlOAuthRegisterResponse> {
    const validation = blValidateRedirectUris(body?.redirect_uris, this.config.allowedRedirectUris);
    if (!validation.ok) {
      throw new BlOAuthException('invalid_redirect_uri', validation.errorDescription);
    }

    const client = await this.clientStore.register({
      redirect_uris: validation.redirectUris,
      // Anything else is dropped rather than coerced; the store bounds the length, since it
      // is the store that keeps it.
      client_name: typeof body?.client_name === 'string' ? body.client_name : undefined,
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
  async token(@Body() body: BlOAuthTokenBody): Promise<BlOAuthTokenResponse> {
    switch (body?.grant_type) {
      case 'authorization_code':
        return this.exchangeAuthorizationCode(body);
      case 'refresh_token':
        return this.exchangeRefreshToken(body);
      default:
        throw new BlOAuthException(
          'unsupported_grant_type',
          'only authorization_code and refresh_token are supported'
        );
    }
  }

  /**
   * Revocation endpoint (RFC 7009). Ends the session behind a refresh token, and the Grant
   * it was issued under.
   *
   * Ending the Grant as well is what makes revoking meaningful: without it a dismissed
   * machine could walk straight back in on an approval the user believes they took back,
   * with no screen shown, because the flow would still find the old approval on file.
   *
   * Always 200, including for a token that is unknown, already revoked or not ours
   * (§2.2): telling a caller whether a token exists would turn this into an oracle, and a
   * client retrying a revocation must not see an error.
   *
   * An access token presented here is a no-op — it is a self-contained JWT, validated
   * by signature alone with nothing to delete, so it stays usable until it expires.
   * That is why its lifetime is an hour.
   */
  @BlPublicSecure()
  @Post(BL_OAUTH_PATHS.revoke)
  @HttpCode(200)
  async revoke(@Body() body: BlOAuthRevokeBody): Promise<void> {
    const { token, client_id: clientId } = body ?? {};
    if (!token || !clientId) {
      // The one case RFC 7009 does let us reject: a malformed request, as opposed to a
      // well-formed one carrying a token we know nothing about.
      throw new BlOAuthException('invalid_request', 'token and client_id are required');
    }
    // Scoped to the client, so this unauthenticated endpoint cannot be used to end a
    // browser session or another client's session even if a token leaks into it.
    const revoked = await this.refreshTokenService.revokeOAuthToken(token, clientId);
    if (revoked != null) {
      await this.grantService.revoke(revoked.userId, revoked.clientId, revoked.resource);
    }
  }

  /** Exchange a one-time authorization code for the first token pair. */
  private async exchangeAuthorizationCode(body: BlOAuthTokenBody): Promise<BlOAuthTokenResponse> {
    const { code, redirect_uri: redirectUri, client_id: clientId, code_verifier: codeVerifier } = body;
    if (!code || !redirectUri || !clientId || !codeVerifier) {
      throw new BlOAuthException(
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
      throw new BlOAuthException('invalid_grant', 'authorization code is invalid, expired or mismatched');
    }

    // The binding is the only place the resource is ever taken from — here the request may
    // pick among what was approved, and on renewal it may not pick at all.
    const resource = this.selectApprovedResource(binding.resources, body.resource);

    const refreshToken = await this.refreshTokenService.issue({ id: binding.user.id }, 'oauth', {
      clientId,
      resource,
    });

    return this.tokenResponse(binding.user.id, binding.user.email, resource, refreshToken);
  }

  /**
   * Renew an access token from a refresh token, rotating it.
   *
   * The audience comes from the stored row, never from the request: reading a
   * `resource` parameter here would let a client that was granted read access to one
   * MCP walk it up to another one at renewal time.
   */
  private async exchangeRefreshToken(body: BlOAuthTokenBody): Promise<BlOAuthTokenResponse> {
    const { refresh_token: presentedToken, client_id: clientId } = body;
    if (!presentedToken || !clientId) {
      throw new BlOAuthException('invalid_request', 'refresh_token and client_id are required');
    }

    // `kind: 'oauth'` is what keeps the two surfaces apart: a browser session's refresh
    // token cannot be turned into an MCP access token here, and vice versa on /auth/refresh.
    const rotation = await this.refreshTokenService.rotate(presentedToken, 'oauth');
    if (rotation == null || rotation.resource == null) {
      throw new BlOAuthException('invalid_grant', 'refresh token is invalid, expired or already used');
    }

    if (rotation.clientId !== clientId) {
      // The rotation already burned the token, so the session is unusable anyway; drop
      // the row rather than leave a chain a mismatched caller has a valid token for.
      // A client presenting another client's refresh token is not a bug we accommodate.
      await this.refreshTokenService.revoke(rotation.token);
      throw new BlOAuthException('invalid_grant', 'refresh token was not issued to this client');
    }

    // A client MAY repeat `resource` (RFC 8707 §2.2). Honour it only as an assertion:
    // silently ignoring a mismatch would let it believe it holds an audience it does not.
    if (body.resource != null && body.resource !== rotation.resource) {
      throw new BlOAuthException('invalid_target', 'resource does not match the one originally granted');
    }

    return this.tokenResponse(rotation.user.id, rotation.user.email, rotation.resource, rotation.token);
  }

  /**
   * Which of the approved Resources this token is for.
   *
   * A request may pick among them and nothing else: the list comes from the approval, so
   * whatever it names, the answer is one of the Resources the user actually saw. Picking is
   * required when several were approved rather than defaulted to the first — a token whose
   * audience was chosen by neither the user nor the client is one nobody can reason about.
   */
  private selectApprovedResource(approved: string[], requested: string | undefined): string {
    if (requested != null) {
      if (!approved.includes(requested)) {
        throw new BlOAuthException('invalid_target', 'resource was not among the ones approved');
      }
      return requested;
    }
    if (approved.length === 1) {
      return approved[0];
    }
    throw new BlOAuthException('invalid_target', 'resource is required when several Resources were approved');
  }

  /**
   * Issue the authorization code and send the browser back to the client with it.
   *
   * One place, reached by the two paths that may produce a code — a decision the user just
   * made, and an approval they made earlier — so that what a code is bound to cannot differ
   * between them.
   */
  private async issueCode(response: Response, pending: BlOAuthPendingAuthorization): Promise<void> {
    const code = await this.codeStore.create({
      clientId: pending.clientId,
      redirectUri: pending.redirectUri,
      codeChallenge: pending.codeChallenge,
      resources: pending.resources,
      user: pending.user,
    });
    response.redirect(blBuildUrlWithParams(pending.redirectUri, { code, state: pending.state }));
  }

  /**
   * Mint the access token and describe it.
   *
   * One duration for both the signature and the `expires_in` the client is told: they
   * used to agree only because each side happened to read the same constant, and a
   * client that trusts a longer `expires_in` than the signature stops refreshing in
   * time and starts failing on 401s it did not expect.
   *
   * Signed asymmetrically, unlike a Session token. This is the token that deliberately
   * crosses an application boundary, so verifying it must not require holding the ability
   * to mint it — per ADR-0001. Nothing about the flow above changes with it: only which
   * key signs.
   */
  private tokenResponse(
    userId: string,
    userEmail: string,
    resource: string,
    refreshToken: string
  ): BlOAuthTokenResponse {
    const durationInSeconds = this.config.mcpAccessTokenDurationInSeconds;
    return {
      access_token: this.mcpJwtService.generateTokenForAudience(
        userId,
        userEmail,
        resource,
        durationInSeconds
      ),
      token_type: 'Bearer',
      expires_in: durationInSeconds,
      refresh_token: refreshToken,
    };
  }

  /**
   * The user at the browser, for a consent call that has nothing to answer without one.
   *
   * 401, and not a redirect: these are called by the consent page, which turns the status
   * into its own login bounce carrying the consent id — a redirect would answer an XHR with
   * a login page.
   */
  private async requireCurrentUser(request: Request): Promise<BlOAuthUser> {
    const user = await this.currentUserResolver.resolveCurrentUser(request);
    if (!user) {
      throw new BlOAuthException(
        'login_required',
        'there is no session to decide with',
        HttpStatus.UNAUTHORIZED
      );
    }
    return user;
  }

  /**
   * The pending authorization behind a consent id, once it is established that this user is
   * the one it is waiting for.
   *
   * A request belonging to somebody else is reported as unknown rather than as forbidden:
   * the two answers apart would tell a caller which consent ids exist, and the honest
   * answer to "may I see this?" is the same either way. A shared browser is the ordinary
   * way this happens, not an attack.
   */
  private async requirePending(consentId: string, user: BlOAuthUser): Promise<BlOAuthPendingAuthorization> {
    const pending = await this.consentStore.findPending(consentId);
    if (pending == null || pending.user.id !== user.id) {
      throw this.unknownConsentRequest();
    }
    return pending;
  }

  /**
   * There is nothing to consent to: unknown, expired, already decided, or another user's.
   *
   * 404 because the consent page shows its own "this request no longer exists" screen for
   * it, and must not offer a decision on something that cannot be completed.
   */
  private unknownConsentRequest(): BlOAuthException {
    return new BlOAuthException(
      'invalid_request',
      'unknown or expired consent request',
      HttpStatus.NOT_FOUND
    );
  }

  /**
   * The requested Resources, in the words the user is shown.
   *
   * A Resource this server cannot describe stops the flow instead of being listed as a bare
   * URL or quietly dropped: approving a list that does not match what is being granted is
   * not consent. It means the registry changed under a pending authorization, which is a
   * deployment away rather than a user error.
   */
  private describeResources(resources: string[]): BlOAuthConsentResourceResponse[] {
    return resources.map((resource) => {
      const description = this.resources.describeResource(resource);
      if (description == null) {
        throw new BlOAuthException(
          'server_error',
          'a requested Resource can no longer be described',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      return {
        name: description.name,
        url: description.url,
        description: description.description,
      };
    });
  }

  /**
   * Send the browser to the front login page, to come back to `returnUrl` afterwards.
   *
   * The front honours the parameter only when it points at the authorization endpoint —
   * which is what keeps its login page from being an open redirect — so every URL handed
   * over here lives under `/oauth/authorize`.
   */
  private redirectToLogin(response: Response, returnUrl: string): void {
    response.redirect(blBuildUrlWithParams(this.config.frontLoginUrl, { returnUrl }));
  }

  /**
   * Send the browser to the consent page for a pending authorization.
   *
   * The id is carried through opaquely and the target comes from configuration, so nothing a
   * caller writes decides where the browser goes. Reached both when there is a question to
   * ask and when there is nothing left to ask about — the page tells the two apart by asking
   * for the description, which is also what makes it the one place able to say so in words.
   */
  private redirectToConsentPage(response: Response, consentId: string): void {
    response.redirect(blBuildUrlWithParams(this.config.frontConsentUrl, { consent_id: consentId }));
  }

  /**
   * The URL that re-enters the flow at its consent step — the only one this server ever hands
   * to the login page for it.
   *
   * Under `/oauth/authorize/`, because that is the only path the front's return-URL check
   * trusts; anywhere else it would be dropped and the user would land in the application with
   * a client still waiting.
   */
  private resumeConsentUrl(consentId: string): string {
    return blBuildUrlWithParams(`${this.issuer}/${BL_OAUTH_PATHS.consent}`, { consent_id: consentId });
  }

  /**
   * The configured issuer, normalized here rather than by each caller.
   *
   * A trailing slash on the configured value is the difference between a `returnUrl` of
   * `https://api//oauth/authorize` and a working one, and configuration is where a stray
   * slash comes from.
   */
  private get issuer(): string {
    return blStripTrailingSlashes(this.config.issuer);
  }
}
