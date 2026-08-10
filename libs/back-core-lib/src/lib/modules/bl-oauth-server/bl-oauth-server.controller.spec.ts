import { HttpStatus } from '@nestjs/common';
import { createHash } from 'crypto';
import { Request, Response } from 'express';

import { BlJwtAsymmetricService } from '../bl-jwt/bl-jwt-asymmetric.service';
import { BlRefreshTokenRotation, BlRefreshTokenService } from '../bl-refresh-token/bl-refresh-token.service';
import { BlResourceRegistry } from '../bl-resource-server/bl-resource.registry';
import { BlOAuthClient, BlOAuthClientStore } from './bl-oauth-client.store';
import { BlOAuthCodeBinding, BlOAuthCodeStore } from './bl-oauth-code.store';
import { BlOAuthConsentDecisionQueryDto } from './bl-oauth-consent.dto';
import { BlOAuthConsentStore, BlOAuthPendingAuthorization } from './bl-oauth-consent.store';
import { BlOAuthGrantService } from './bl-oauth-grant.service';
import { BlOAuthServerConfig, BlOAuthUser } from './bl-oauth-server.class';
import { BlOAuthServerController } from './bl-oauth-server.controller';
import { BlOAuthException } from './bl-oauth-server.exception';

const MCP_TOKEN_TTL_SECONDS = 60 * 60;
const ISSUER = 'https://api.example.com';
const RESOURCE_PATH = '/mcp/community-doc';
const RESOURCE = `${ISSUER}${RESOURCE_PATH}`;
const SECOND_RESOURCE_PATH = '/mcp/space';
const SECOND_RESOURCE = `${ISSUER}${SECOND_RESOURCE_PATH}`;
const OTHER_RESOURCE = `${ISSUER}/mcp/space-doc`;
const CLIENT_ID = 'client-1';
const REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';
const CONSENT_ID = 'pending-42';
const CONSENT_TOKEN = 'minted-consent-token';
const FRONT_CONSENT_URL = 'https://example.com/oauth/consent';

/** Real PKCE pair, so the spec exercises `blVerifyPkce` rather than a stub of it. */
const CODE_VERIFIER = 'a'.repeat(64);
const CODE_CHALLENGE = createHash('sha256').update(CODE_VERIFIER).digest('base64url');

const user: BlOAuthUser = { id: 'user-1', email: 'user@example.com' };
const otherUser: BlOAuthUser = { id: 'user-2', email: 'someone.else@example.com' };

const client: BlOAuthClient = {
  client_id: CLIENT_ID,
  redirect_uris: [REDIRECT_URI],
  client_name: 'Some AI client',
};

interface Mocks {
  controller: BlOAuthServerController;
  consume: jest.Mock;
  createCode: jest.Mock;
  issue: jest.Mock;
  rotate: jest.Mock;
  revoke: jest.Mock;
  revokeOAuthToken: jest.Mock;
  generateTokenForAudience: jest.Mock;
  findClient: jest.Mock;
  findPending: jest.Mock;
  consumePending: jest.Mock;
  issueDecisionToken: jest.Mock;
  consumeDecisionToken: jest.Mock;
  approve: jest.Mock;
  areAllGranted: jest.Mock;
  revokeGrant: jest.Mock;
  resolveCurrentUser: jest.Mock;
}

/**
 * The token, revocation and consent-decision grants: the parts of this controller that
 * decide rather than delegate — which grant runs, whether a code, a rotation or a decision is
 * acceptable, and where the audience comes from.
 *
 * `/authorize` and `/register` are deliberately not here. Everything they do is observable to
 * a client — a redirect, a status, a code that does or does not work — and is asserted over
 * HTTP in the applications' `*-oauth-flow.e2e.spec.ts`. Restating them against these doubles
 * would be asserting on intermediate state, which is what breaks when internals move.
 */
function buildController(): Mocks {
  const consume = jest.fn().mockResolvedValue(null);
  const createCode = jest.fn().mockResolvedValue('the-code');
  const issue = jest.fn().mockResolvedValue('issued-refresh-token');
  const rotate = jest.fn().mockResolvedValue(null);
  const revoke = jest.fn().mockResolvedValue(undefined);
  const revokeOAuthToken = jest.fn().mockResolvedValue(null);
  const generateTokenForAudience = jest.fn().mockReturnValue('access-token');
  const findClient = jest.fn().mockResolvedValue(client);
  const findPending = jest.fn().mockResolvedValue(null);
  const consumePending = jest.fn().mockResolvedValue(null);
  const issueDecisionToken = jest.fn().mockResolvedValue(CONSENT_TOKEN);
  const consumeDecisionToken = jest.fn().mockResolvedValue(null);
  const approve = jest.fn().mockResolvedValue(undefined);
  const areAllGranted = jest.fn().mockResolvedValue(false);
  const revokeGrant = jest.fn().mockResolvedValue(undefined);
  const resolveCurrentUser = jest.fn().mockReturnValue(user);

  const config: BlOAuthServerConfig = {
    issuer: ISSUER,
    frontLoginUrl: 'https://example.com/login',
    frontConsentUrl: FRONT_CONSENT_URL,
    consentWarning: 'It will be able to do anything you can.',
    allowedRedirectUris: [REDIRECT_URI],
    mcpAccessTokenDurationInSeconds: MCP_TOKEN_TTL_SECONDS,
  };

  // Two registered Resources, so a request naming several can be told from one naming an
  // unserved one. The registry itself is the Resource Server half's, and
  // `bl-resource.registry.spec.ts` covers what it recognizes.
  const resources = new BlResourceRegistry({
    baseUrl: ISSUER,
    authorizationServerUrl: ISSUER,
    resources: [
      { path: RESOURCE_PATH, name: 'The documentation', description: 'Search the docs' },
      { path: SECOND_RESOURCE_PATH, name: 'Your Spaces' },
    ],
  });

  return {
    controller: new BlOAuthServerController(
      config,
      resources,
      { find: findClient } as unknown as BlOAuthClientStore,
      { consume, create: createCode } as unknown as BlOAuthCodeStore,
      {
        findPending,
        consumePending,
        issueDecisionToken,
        consumeDecisionToken,
      } as unknown as BlOAuthConsentStore,
      // Access tokens are minted asymmetrically; nothing here reads a Session token — that is
      // the resolver's job.
      { generateTokenForAudience } as unknown as BlJwtAsymmetricService,
      { issue, rotate, revoke, revokeOAuthToken } as unknown as BlRefreshTokenService<BlOAuthUser>,
      {
        approve,
        areAllGranted,
        revoke: revokeGrant,
      } as unknown as BlOAuthGrantService<BlOAuthUser>,
      { resolveCurrentUser }
    ),
    consume,
    createCode,
    issue,
    rotate,
    revoke,
    revokeOAuthToken,
    generateTokenForAudience,
    findClient,
    findPending,
    consumePending,
    issueDecisionToken,
    consumeDecisionToken,
    approve,
    areAllGranted,
    revokeGrant,
    resolveCurrentUser,
  };
}

/** What `/authorize` stored against the code, as `/token` reads it back. */
function codeBinding(overrides: Partial<BlOAuthCodeBinding> = {}): BlOAuthCodeBinding {
  return {
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    codeChallenge: CODE_CHALLENGE,
    resources: [RESOURCE],
    user,
    ...overrides,
  };
}

/** What `/authorize` parked for the user to answer. */
function pendingAuthorization(
  overrides: Partial<BlOAuthPendingAuthorization> = {}
): BlOAuthPendingAuthorization {
  return {
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    codeChallenge: CODE_CHALLENGE,
    resources: [RESOURCE],
    state: 'the-state',
    user,
    ...overrides,
  };
}

function decisionQuery(
  overrides: Partial<BlOAuthConsentDecisionQueryDto> = {}
): BlOAuthConsentDecisionQueryDto {
  return {
    consent_id: CONSENT_ID,
    decision: 'allow',
    consent_token: CONSENT_TOKEN,
    ...overrides,
  };
}

function rotation(
  overrides: Partial<BlRefreshTokenRotation<BlOAuthUser>> = {}
): BlRefreshTokenRotation<BlOAuthUser> {
  return {
    token: 'rotated-refresh-token',
    user,
    clientId: CLIENT_ID,
    resource: RESOURCE,
    ...overrides,
  };
}

/** A browser request. Only the current-user resolver reads it, and that is stubbed. */
const httpRequest = {} as Request;

/** Where the controller sent the browser, if anywhere. */
function buildResponse(): { response: Response; redirect: jest.Mock } {
  const redirect = jest.fn();
  return { response: { redirect } as unknown as Response, redirect };
}

/**
 * The browser went back to the consent page for this request.
 *
 * The answer to every way a decision can fail short of "no session", because the page is the
 * only thing in the flow that can explain itself to a person — and because a decision is a
 * navigation, so an error body would be what they end up reading.
 */
function expectRedirectToConsentPage(redirect: jest.Mock): void {
  const location = new URL(redirect.mock.calls[0][0] as string);

  expect(`${location.origin}${location.pathname}`).toBe(FRONT_CONSENT_URL);
  expect(location.searchParams.get('consent_id')).toBe(CONSENT_ID);
}

/** The OAuth `error` code of a rejected call, or null if it resolved. */
async function rejectedErrorCode(promise: Promise<unknown>): Promise<string | null> {
  return promise.then(
    () => null,
    (thrown: unknown) => {
      expect(thrown).toBeInstanceOf(BlOAuthException);
      return (thrown as BlOAuthException).error;
    }
  );
}

/** The HTTP status of a rejected call, which is what the consent page branches on. */
async function rejectedStatus(promise: Promise<unknown>): Promise<number | null> {
  return promise.then(
    () => null,
    (thrown: unknown) => {
      expect(thrown).toBeInstanceOf(BlOAuthException);
      return (thrown as BlOAuthException).getStatus();
    }
  );
}

describe('BlOAuthServerController', () => {
  describe('token — grant dispatch', () => {
    it('rejects a grant it does not implement', async () => {
      const { controller } = buildController();
      await expect(rejectedErrorCode(controller.token({ grant_type: 'password' }))).resolves.toBe(
        'unsupported_grant_type'
      );
    });

    it('rejects a missing grant_type rather than defaulting to one', async () => {
      const { controller } = buildController();
      await expect(rejectedErrorCode(controller.token({}))).resolves.toBe('unsupported_grant_type');
    });
  });

  describe('token — authorization_code grant', () => {
    const request = {
      grant_type: 'authorization_code',
      code: 'the-code',
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: CODE_VERIFIER,
    };

    it('returns a refresh token alongside the access token', async () => {
      const { controller, consume, issue } = buildController();
      consume.mockResolvedValue(codeBinding());

      const response = await controller.token(request);

      expect(response.access_token).toBe('access-token');
      expect(response.token_type).toBe('Bearer');
      // Without this the client has no way to renew and must re-run the whole
      // authorization flow every hour.
      expect(response.refresh_token).toBe('issued-refresh-token');
      expect(issue).toHaveBeenCalledWith({ id: user.id }, 'oauth', {
        clientId: CLIENT_ID,
        resource: RESOURCE,
      });
    });

    it('signs the access token for exactly as long as it tells the client', async () => {
      const { controller, consume, generateTokenForAudience } = buildController();
      consume.mockResolvedValue(codeBinding());

      const response = await controller.token(request);

      // One duration, read once: a client trusting an `expires_in` longer than the
      // signature stops refreshing in time and starts failing on unexpected 401s.
      expect(response.expires_in).toBe(MCP_TOKEN_TTL_SECONDS);
      expect(generateTokenForAudience).toHaveBeenCalledWith(
        user.id,
        user.email,
        RESOURCE,
        response.expires_in
      );
    });

    it('does not issue a refresh token when the code is rejected', async () => {
      const { controller, consume, issue } = buildController();
      consume.mockResolvedValue(null);

      await expect(rejectedErrorCode(controller.token(request))).resolves.toBe('invalid_grant');
      expect(issue).not.toHaveBeenCalled();
    });

    it('rejects a mismatched PKCE verifier', async () => {
      const { controller, consume, issue } = buildController();
      consume.mockResolvedValue(codeBinding({ codeChallenge: 'some-other-challenge' }));

      await expect(rejectedErrorCode(controller.token(request))).resolves.toBe('invalid_grant');
      expect(issue).not.toHaveBeenCalled();
    });

    it('requires the four parameters of the grant', async () => {
      const { controller } = buildController();
      await expect(
        rejectedErrorCode(controller.token({ ...request, code_verifier: undefined }))
      ).resolves.toBe('invalid_request');
    });

    it('lets the client pick which approved Resource the token is for', async () => {
      const { controller, consume, generateTokenForAudience } = buildController();
      consume.mockResolvedValue(codeBinding({ resources: [RESOURCE, SECOND_RESOURCE] }));

      await controller.token({ ...request, resource: SECOND_RESOURCE });

      // One approval covers several Resources; a token still names exactly one, and the
      // client says which — that is what keeps one prompt from becoming one wide token.
      expect(generateTokenForAudience).toHaveBeenCalledWith(
        user.id,
        user.email,
        SECOND_RESOURCE,
        MCP_TOKEN_TTL_SECONDS
      );
    });

    it('refuses a Resource the user did not approve, even when it is served here', async () => {
      const { controller, consume, issue, generateTokenForAudience } = buildController();
      consume.mockResolvedValue(codeBinding({ resources: [RESOURCE] }));

      await expect(
        rejectedErrorCode(controller.token({ ...request, resource: SECOND_RESOURCE }))
      ).resolves.toBe('invalid_target');

      // The approval is the ceiling: a code cannot be turned into a token for something the
      // user was never shown.
      expect(issue).not.toHaveBeenCalled();
      expect(generateTokenForAudience).not.toHaveBeenCalled();
    });

    it('requires the client to pick when several Resources were approved', async () => {
      const { controller, consume, issue } = buildController();
      consume.mockResolvedValue(codeBinding({ resources: [RESOURCE, SECOND_RESOURCE] }));

      await expect(rejectedErrorCode(controller.token(request))).resolves.toBe('invalid_target');

      // Defaulting to the first would hand out a token whose audience neither the user nor
      // the client chose.
      expect(issue).not.toHaveBeenCalled();
    });
  });

  describe('token — refresh_token grant', () => {
    const request = {
      grant_type: 'refresh_token',
      refresh_token: 'presented-refresh-token',
      client_id: CLIENT_ID,
    };

    it('rotates on the OAuth surface only', async () => {
      const { controller, rotate } = buildController();
      rotate.mockResolvedValue(rotation());

      await controller.token(request);

      // `oauth` is what stops a browser session's refresh token from being turned
      // into an MCP access token here.
      expect(rotate).toHaveBeenCalledWith('presented-refresh-token', 'oauth');
    });

    it('returns the rotated token, so the old one is spent', async () => {
      const { controller, rotate } = buildController();
      rotate.mockResolvedValue(rotation());

      const response = await controller.token(request);

      expect(response.refresh_token).toBe('rotated-refresh-token');
      expect(response.expires_in).toBe(MCP_TOKEN_TTL_SECONDS);
    });

    it('takes the audience from the stored row, never from the request', async () => {
      const { controller, rotate, generateTokenForAudience } = buildController();
      rotate.mockResolvedValue(rotation({ resource: RESOURCE }));

      // A client asking for a different audience must not get one: this is the
      // audience-escalation path, and the request is not a source of truth for it.
      await expect(
        rejectedErrorCode(controller.token({ ...request, resource: OTHER_RESOURCE }))
      ).resolves.toBe('invalid_target');
      expect(generateTokenForAudience).not.toHaveBeenCalled();
    });

    it('accepts a repeated resource that agrees with the grant (RFC 8707 §2.2)', async () => {
      const { controller, rotate, generateTokenForAudience } = buildController();
      rotate.mockResolvedValue(rotation({ resource: RESOURCE }));

      await controller.token({ ...request, resource: RESOURCE });

      expect(generateTokenForAudience).toHaveBeenCalledWith(
        user.id,
        user.email,
        RESOURCE,
        MCP_TOKEN_TTL_SECONDS
      );
    });

    it('destroys the session when another client presents the token', async () => {
      const { controller, rotate, revoke, generateTokenForAudience } = buildController();
      rotate.mockResolvedValue(rotation({ clientId: 'someone-else' }));

      await expect(rejectedErrorCode(controller.token(request))).resolves.toBe('invalid_grant');

      expect(generateTokenForAudience).not.toHaveBeenCalled();
      // The rotation already burned the presented token, so leaving the row behind
      // would leave a live chain a mismatched caller holds a valid token for.
      expect(revoke).toHaveBeenCalledWith('rotated-refresh-token');
    });

    it('rejects an unknown, expired or already-used token', async () => {
      const { controller, rotate } = buildController();
      rotate.mockResolvedValue(null);

      await expect(rejectedErrorCode(controller.token(request))).resolves.toBe('invalid_grant');
    });

    it('rejects a row carrying no resource instead of minting an audience-less token', async () => {
      const { controller, rotate, generateTokenForAudience } = buildController();
      rotate.mockResolvedValue(rotation({ resource: null }));

      await expect(rejectedErrorCode(controller.token(request))).resolves.toBe('invalid_grant');
      // An `aud`-less token would be accepted as a full session credential everywhere
      // else in the API — the exact confusion `BlJwtStrategy` was hardened against.
      expect(generateTokenForAudience).not.toHaveBeenCalled();
    });

    it('requires client_id, which is how the token is bound to its holder', async () => {
      const { controller, rotate } = buildController();

      await expect(rejectedErrorCode(controller.token({ ...request, client_id: undefined }))).resolves.toBe(
        'invalid_request'
      );
      expect(rotate).not.toHaveBeenCalled();
    });
  });

  describe('the consent details', () => {
    it('describes the client and every Resource it is asking for', async () => {
      const { controller, findPending } = buildController();
      findPending.mockResolvedValue(pendingAuthorization({ resources: [RESOURCE, SECOND_RESOURCE] }));

      const details = await controller.getConsentDetails({ consent_id: CONSENT_ID }, httpRequest);

      expect(details.client_id).toBe(CLIENT_ID);
      expect(details.client_name).toBe('Some AI client');
      // Registration is dynamic, so the name is a claim. Saying so is what lets the page
      // frame it as one rather than as an identity.
      expect(details.client_name_is_verified).toBe(false);
      expect(details.user_email).toBe(user.email);
      expect(details.warning).toBe('It will be able to do anything you can.');
      expect(details.resources).toEqual([
        { name: 'The documentation', url: RESOURCE, description: 'Search the docs' },
        { name: 'Your Spaces', url: SECOND_RESOURCE, description: undefined },
      ]);
    });

    it('falls back to the client id when the client registered no name', async () => {
      const { controller, findPending, findClient } = buildController();
      findPending.mockResolvedValue(pendingAuthorization());
      findClient.mockResolvedValue({ ...client, client_name: undefined });

      const details = await controller.getConsentDetails({ consent_id: CONSENT_ID }, httpRequest);

      // A blank name would read as "no client at all"; the id is the one identifier that
      // cannot be forged, so it is what is left to name it by.
      expect(details.client_name).toBe(CLIENT_ID);
    });

    it('answers 401 when there is no session, so the page can bounce through login', async () => {
      const { controller, resolveCurrentUser } = buildController();
      resolveCurrentUser.mockReturnValue(null);

      await expect(
        rejectedStatus(controller.getConsentDetails({ consent_id: CONSENT_ID }, httpRequest))
      ).resolves.toBe(HttpStatus.UNAUTHORIZED);
    });

    it('answers 404 for a request that is unknown, expired or already decided', async () => {
      const { controller, findPending } = buildController();
      findPending.mockResolvedValue(null);

      await expect(
        rejectedStatus(controller.getConsentDetails({ consent_id: CONSENT_ID }, httpRequest))
      ).resolves.toBe(HttpStatus.NOT_FOUND);
    });

    it("answers 404 for another user's pending request", async () => {
      const { controller, findPending } = buildController();
      findPending.mockResolvedValue(pendingAuthorization({ user: otherUser }));

      // Not 403: telling one user that a consent id belongs to somebody else is the same
      // answer as telling them it exists. A shared browser is the ordinary way this happens.
      await expect(
        rejectedStatus(controller.getConsentDetails({ consent_id: CONSENT_ID }, httpRequest))
      ).resolves.toBe(HttpStatus.NOT_FOUND);
    });

    it('refuses to describe a Resource the registry no longer serves', async () => {
      const { controller, findPending } = buildController();
      findPending.mockResolvedValue(pendingAuthorization({ resources: [RESOURCE, OTHER_RESOURCE] }));

      // Listing it as a bare URL, or dropping it from the list, would ask for an approval
      // that does not match what would be granted.
      await expect(
        rejectedStatus(controller.getConsentDetails({ consent_id: CONSENT_ID }, httpRequest))
      ).resolves.toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('the consent token', () => {
    it('mints a token bound to the request and the user', async () => {
      const { controller, findPending, issueDecisionToken } = buildController();
      findPending.mockResolvedValue(pendingAuthorization());

      const response = await controller.createConsentToken({ consent_id: CONSENT_ID }, httpRequest);

      expect(response.consent_token).toBe(CONSENT_TOKEN);
      expect(issueDecisionToken).toHaveBeenCalledWith({ consentId: CONSENT_ID, userId: user.id });
    });

    it('mints nothing without a session', async () => {
      const { controller, resolveCurrentUser, issueDecisionToken } = buildController();
      resolveCurrentUser.mockReturnValue(null);

      await expect(
        rejectedStatus(controller.createConsentToken({ consent_id: CONSENT_ID }, httpRequest))
      ).resolves.toBe(HttpStatus.UNAUTHORIZED);
      expect(issueDecisionToken).not.toHaveBeenCalled();
    });

    it('mints nothing for a request that another user must answer', async () => {
      const { controller, findPending, issueDecisionToken } = buildController();
      findPending.mockResolvedValue(pendingAuthorization({ user: otherUser }));

      await expect(
        rejectedStatus(controller.createConsentToken({ consent_id: CONSENT_ID }, httpRequest))
      ).resolves.toBe(HttpStatus.NOT_FOUND);
      expect(issueDecisionToken).not.toHaveBeenCalled();
    });

    it('requires a consent_id rather than minting a token for nothing', async () => {
      const { controller, issueDecisionToken } = buildController();

      await expect(rejectedErrorCode(controller.createConsentToken({}, httpRequest))).resolves.toBe(
        'invalid_request'
      );
      expect(issueDecisionToken).not.toHaveBeenCalled();
    });
  });

  describe('the consent decision', () => {
    /** A decision arriving with a token that was really minted for it. */
    function buildDecided(): Mocks {
      const mocks = buildController();
      mocks.consumeDecisionToken.mockResolvedValue({ consentId: CONSENT_ID, userId: user.id });
      mocks.consumePending.mockResolvedValue(pendingAuthorization());
      return mocks;
    }

    it('records one Grant per approved Resource and sends the code back to the client', async () => {
      const mocks = buildDecided();
      mocks.consumePending.mockResolvedValue(
        pendingAuthorization({ resources: [RESOURCE, SECOND_RESOURCE] })
      );
      const { response, redirect } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery(), httpRequest, response);

      // One pass through the screen, one Grant per Resource — each bound to exactly one, so
      // no renewal can ever read an audience wider than the row it rotates.
      expect(mocks.approve).toHaveBeenCalledWith({ id: user.id }, CLIENT_ID, [RESOURCE, SECOND_RESOURCE]);

      const location = new URL(redirect.mock.calls[0][0] as string);
      expect(`${location.origin}${location.pathname}`).toBe(REDIRECT_URI);
      expect(location.searchParams.get('code')).toBe('the-code');
      expect(location.searchParams.get('state')).toBe('the-state');
    });

    it('records the approval before handing out a code', async () => {
      const mocks = buildDecided();
      const { response } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery(), httpRequest, response);

      // A code the client can spend for an approval that failed to persist is a token
      // granted by nobody.
      expect(mocks.approve.mock.invocationCallOrder[0]).toBeLessThan(
        mocks.createCode.mock.invocationCallOrder[0]
      );
    });

    it('binds the code to the parked request, not to anything the browser sent', async () => {
      const mocks = buildDecided();
      const { response } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery(), httpRequest, response);

      expect(mocks.createCode).toHaveBeenCalledWith({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        codeChallenge: CODE_CHALLENGE,
        resources: [RESOURCE],
        user,
      });
    });

    it('refuses: tells the client, grants nothing, issues no code', async () => {
      const mocks = buildDecided();
      const { response, redirect } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery({ decision: 'deny' }), httpRequest, response);

      expect(mocks.approve).not.toHaveBeenCalled();
      expect(mocks.createCode).not.toHaveBeenCalled();

      // The client is told, rather than left waiting on a flow that silently ended.
      const location = new URL(redirect.mock.calls[0][0] as string);
      expect(`${location.origin}${location.pathname}`).toBe(REDIRECT_URI);
      expect(location.searchParams.get('error')).toBe('access_denied');
      expect(location.searchParams.get('state')).toBe('the-state');
      expect(location.searchParams.get('code')).toBeNull();
    });

    it('spends the pending request, so a decision cannot be replayed', async () => {
      const mocks = buildDecided();
      const { response } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery(), httpRequest, response);

      // A reload, a back button or a replayed history entry must not produce a second code.
      expect(mocks.consumePending).toHaveBeenCalledWith(CONSENT_ID);
    });

    it('grants nothing without a minted decision token', async () => {
      const mocks = buildController();
      mocks.consumeDecisionToken.mockResolvedValue(null);
      mocks.consumePending.mockResolvedValue(pendingAuthorization());
      const { response, redirect } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery(), httpRequest, response);

      // Without this check a page on another origin could make a logged-in visitor's browser
      // approve a pending authorization it started itself, with its own redirect target.
      expect(mocks.approve).not.toHaveBeenCalled();
      expect(mocks.createCode).not.toHaveBeenCalled();
      // And the user's own pending request survives, so they can still answer it themselves —
      // which is what the browser is sent back to the page to do.
      expect(mocks.consumePending).not.toHaveBeenCalled();
      expectRedirectToConsentPage(redirect);
    });

    it('grants nothing when the token was minted for another pending request', async () => {
      const mocks = buildController();
      mocks.consumeDecisionToken.mockResolvedValue({ consentId: 'another-pending', userId: user.id });
      const { response, redirect } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery(), httpRequest, response);

      expect(mocks.approve).not.toHaveBeenCalled();
      expect(mocks.consumePending).not.toHaveBeenCalled();
      expectRedirectToConsentPage(redirect);
    });

    it('grants nothing when the token was minted for another user', async () => {
      const mocks = buildController();
      mocks.consumeDecisionToken.mockResolvedValue({ consentId: CONSENT_ID, userId: otherUser.id });
      const { response, redirect } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery(), httpRequest, response);

      expect(mocks.approve).not.toHaveBeenCalled();
      expectRedirectToConsentPage(redirect);
    });

    it('sends a user whose session died back through login, carrying this step', async () => {
      const mocks = buildDecided();
      mocks.resolveCurrentUser.mockReturnValue(null);
      const { response, redirect } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery(), httpRequest, response);

      expect(mocks.consumeDecisionToken).not.toHaveBeenCalled();
      expect(mocks.approve).not.toHaveBeenCalled();

      // The ordinary case: the screen sat open past the Session token's lifetime, and the page
      // cannot renew one for a navigation it does not make. An error body here would dead-end
      // a person on JSON with the client still waiting.
      const location = new URL(redirect.mock.calls[0][0] as string);
      expect(`${location.origin}${location.pathname}`).toBe('https://example.com/login');
      // Back to the consent step rather than to this URL: the decision token is spent on
      // arrival, so replaying this navigation could never work — the user has to be handed the
      // screen again. And the front honours a return URL only under the authorize path.
      const returnUrl = new URL(location.searchParams.get('returnUrl') ?? '');
      expect(returnUrl.pathname).toBe('/oauth/authorize/consent');
      expect(returnUrl.searchParams.get('consent_id')).toBe(CONSENT_ID);
    });

    it('grants nothing when the pending request expired under the user', async () => {
      const mocks = buildController();
      mocks.consumeDecisionToken.mockResolvedValue({ consentId: CONSENT_ID, userId: user.id });
      mocks.consumePending.mockResolvedValue(null);
      const { response, redirect } = buildResponse();

      await mocks.controller.decideConsent(decisionQuery(), httpRequest, response);

      expect(mocks.approve).not.toHaveBeenCalled();
      // Not to the client: its redirect target was part of the request that is gone, and an
      // unvalidated one must never be redirected to. The page reports it instead.
      expectRedirectToConsentPage(redirect);
    });
  });

  describe('revoke', () => {
    it('deletes the session scoped to the calling client', async () => {
      const { controller, revokeOAuthToken } = buildController();

      await expect(
        controller.revoke({ token: 'a-refresh-token', client_id: CLIENT_ID })
      ).resolves.toBeUndefined();

      expect(revokeOAuthToken).toHaveBeenCalledWith('a-refresh-token', CLIENT_ID);
    });

    it('ends the Grant the session was issued under, so the client must be approved again', async () => {
      const { controller, revokeOAuthToken, revokeGrant } = buildController();
      revokeOAuthToken.mockResolvedValue({ userId: user.id, clientId: CLIENT_ID, resource: RESOURCE });

      await controller.revoke({ token: 'a-refresh-token', client_id: CLIENT_ID });

      // Without this a dismissed machine walks straight back in with no screen shown, on an
      // approval the user believes they took back.
      expect(revokeGrant).toHaveBeenCalledWith(user.id, CLIENT_ID, RESOURCE);
    });

    it('ends no Grant for a token that meant nothing to us', async () => {
      const { controller, revokeOAuthToken, revokeGrant } = buildController();
      revokeOAuthToken.mockResolvedValue(null);

      await controller.revoke({ token: 'never-existed', client_id: CLIENT_ID });

      expect(revokeGrant).not.toHaveBeenCalled();
    });

    it('succeeds for a token that means nothing to us (RFC 7009 §2.2)', async () => {
      const { controller, revokeOAuthToken } = buildController();
      revokeOAuthToken.mockResolvedValue(null);

      // Reporting "unknown token" would make this an oracle, and would break a client
      // retrying a revocation it already completed.
      await expect(
        controller.revoke({ token: 'never-existed', client_id: CLIENT_ID })
      ).resolves.toBeUndefined();
    });

    it('still rejects a malformed request', async () => {
      const { controller, revokeOAuthToken } = buildController();

      await expect(rejectedErrorCode(controller.revoke({ client_id: CLIENT_ID }))).resolves.toBe(
        'invalid_request'
      );
      await expect(rejectedErrorCode(controller.revoke({ token: 'a-token' }))).resolves.toBe(
        'invalid_request'
      );
      expect(revokeOAuthToken).not.toHaveBeenCalled();
    });
  });
});
