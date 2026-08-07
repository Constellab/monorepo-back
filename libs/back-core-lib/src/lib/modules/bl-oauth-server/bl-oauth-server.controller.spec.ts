import { createHash } from 'crypto';
import { Request, Response } from 'express';

import { BlJwtAsymmetricService } from '../bl-jwt/bl-jwt-asymmetric.service';
import { BlRefreshTokenRotation, BlRefreshTokenService } from '../bl-refresh-token/bl-refresh-token.service';
import { BlResourceRegistry } from '../bl-resource-server/bl-resource.registry';
import { BlOAuthAuthorizeQueryDto } from './bl-oauth-authorize.dto';
import { BlOAuthClientStore } from './bl-oauth-client.store';
import { BlOAuthCodeBinding, BlOAuthCodeStore } from './bl-oauth-code.store';
import { BlOAuthRedisMock } from './bl-oauth-redis.mock';
import { BlOAuthServerConfig, BlOAuthUser } from './bl-oauth-server.class';
import { BlOAuthServerController } from './bl-oauth-server.controller';
import { BlOAuthException } from './bl-oauth-server.exception';

const MCP_TOKEN_TTL_SECONDS = 60 * 60;
const ISSUER = 'https://api.example.com';
const FRONT_LOGIN_URL = 'https://example.com/login';
const RESOURCE_PATH = '/mcp/community-doc';
const RESOURCE = `${ISSUER}${RESOURCE_PATH}`;
const OTHER_RESOURCE = `${ISSUER}/mcp/space-doc`;
const CLIENT_ID = 'client-1';
const REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';

/** Real PKCE pair, so the spec exercises `blVerifyPkce` rather than a stub of it. */
const CODE_VERIFIER = 'a'.repeat(64);
const CODE_CHALLENGE = createHash('sha256').update(CODE_VERIFIER).digest('base64url');

const user: BlOAuthUser = { id: 'user-1', email: 'user@example.com' };

interface Mocks {
  controller: BlOAuthServerController;
  consume: jest.Mock;
  create: jest.Mock;
  issue: jest.Mock;
  rotate: jest.Mock;
  revoke: jest.Mock;
  revokeOAuthToken: jest.Mock;
  generateTokenForAudience: jest.Mock;
  resolveCurrentUser: jest.Mock;
  clientStore: BlOAuthClientStore;
}

function buildController(): Mocks {
  const consume = jest.fn().mockResolvedValue(null);
  const create = jest.fn().mockResolvedValue('the-code');
  const issue = jest.fn().mockResolvedValue('issued-refresh-token');
  const rotate = jest.fn().mockResolvedValue(null);
  const revoke = jest.fn().mockResolvedValue(undefined);
  const revokeOAuthToken = jest.fn().mockResolvedValue(undefined);
  const generateTokenForAudience = jest.fn().mockReturnValue('access-token');
  const resolveCurrentUser = jest.fn().mockResolvedValue(null);

  const config: BlOAuthServerConfig = {
    issuer: ISSUER,
    frontLoginUrl: FRONT_LOGIN_URL,
    allowedRedirectUris: [REDIRECT_URI],
    mcpAccessTokenDurationInSeconds: MCP_TOKEN_TTL_SECONDS,
  };

  // One registered resource, as in production today. The registry itself is the Resource
  // Server half's, and `bl-resource.registry.spec.ts` covers what it recognizes.
  const resources = new BlResourceRegistry({
    baseUrl: ISSUER,
    authorizationServerUrl: ISSUER,
    resourcePaths: [RESOURCE_PATH],
  });

  // The real store over an in-memory Redis, so `/authorize` goes through the same client
  // and redirect-URI lookups a request faces rather than a stub agreeing with itself.
  const clientStore = new BlOAuthClientStore(new BlOAuthRedisMock());

  return {
    controller: new BlOAuthServerController(
      config,
      resources,
      clientStore,
      { consume, create } as unknown as BlOAuthCodeStore,
      // Access tokens are minted asymmetrically; nothing here reads a Session token — that
      // is the resolver's job, and it is a mock below.
      { generateTokenForAudience } as unknown as BlJwtAsymmetricService,
      { issue, rotate, revoke, revokeOAuthToken } as unknown as BlRefreshTokenService<BlOAuthUser>,
      { resolveCurrentUser }
    ),
    consume,
    create,
    issue,
    rotate,
    revoke,
    revokeOAuthToken,
    generateTokenForAudience,
    resolveCurrentUser,
    clientStore,
  };
}

/** What `/authorize` stored against the code, as `/token` reads it back. */
function codeBinding(overrides: Partial<BlOAuthCodeBinding> = {}): BlOAuthCodeBinding {
  return {
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    codeChallenge: CODE_CHALLENGE,
    resource: RESOURCE,
    user,
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

describe('BlOAuthServerController', () => {
  describe('authorize — the current-user seam', () => {
    /** A request carrying nothing the controller reads itself; the resolver decides. */
    const request = { originalUrl: '/oauth/authorize?client_id=x' } as Request;

    function captureRedirect(): { response: Response; redirectedTo: () => string } {
      let location = '';
      const response = {
        redirect: (url: string) => {
          location = url;
        },
      } as Response;
      return { response, redirectedTo: () => location };
    }

    async function authorizeQuery(clientStore: BlOAuthClientStore): Promise<{ client_id: string }> {
      const client = await clientStore.register({ redirect_uris: [REDIRECT_URI] });
      return { client_id: client.client_id };
    }

    function validQuery(clientId: string): BlOAuthAuthorizeQueryDto {
      return {
        client_id: clientId,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        code_challenge: CODE_CHALLENGE,
        code_challenge_method: 'S256',
        resource: RESOURCE,
        state: 'xyz',
      };
    }

    it('sends a logged-out user to the login page carrying the request to return to', async () => {
      const { controller, clientStore, resolveCurrentUser, create } = buildController();
      resolveCurrentUser.mockResolvedValue(null);
      const { client_id: clientId } = await authorizeQuery(clientStore);
      const { response, redirectedTo } = captureRedirect();

      await controller.authorize(validQuery(clientId), request, response);

      // The returnUrl is the whole point of the redirect: without it the user logs in and
      // lands somewhere unrelated, and the client never receives a code.
      const redirect = new URL(redirectedTo());
      expect(`${redirect.origin}${redirect.pathname}`).toBe(FRONT_LOGIN_URL);
      expect(redirect.searchParams.get('returnUrl')).toBe(`${ISSUER}${request.originalUrl}`);
      expect(create).not.toHaveBeenCalled();
    });

    it('issues a code bound to the user the application resolved', async () => {
      const { controller, clientStore, resolveCurrentUser, create } = buildController();
      resolveCurrentUser.mockResolvedValue(user);
      const { client_id: clientId } = await authorizeQuery(clientStore);
      const { response, redirectedTo } = captureRedirect();

      await controller.authorize(validQuery(clientId), request, response);

      // The user reaches the code store only through the seam — this is the whole of what
      // the mounting application contributes to the flow.
      expect(create).toHaveBeenCalledWith({
        clientId,
        redirectUri: REDIRECT_URI,
        codeChallenge: CODE_CHALLENGE,
        resource: RESOURCE,
        user,
      });

      const redirect = new URL(redirectedTo());
      expect(redirect.searchParams.get('code')).toBe('the-code');
      expect(redirect.searchParams.get('state')).toBe('xyz');
    });

    it('accepts a resolver that answers synchronously', async () => {
      const { controller, clientStore, resolveCurrentUser, create } = buildController();
      // Reading a cookie needs no I/O, so an application must not be forced into a promise.
      resolveCurrentUser.mockReturnValue(user);
      const { client_id: clientId } = await authorizeQuery(clientStore);
      const { response } = captureRedirect();

      await controller.authorize(validQuery(clientId), request, response);

      expect(create).toHaveBeenCalled();
    });

    it('never redirects on an untrusted client_id, and never asks who is logged in', async () => {
      const { controller, resolveCurrentUser } = buildController();
      const { response, redirectedTo } = captureRedirect();

      await expect(
        rejectedErrorCode(controller.authorize(validQuery('not-registered'), request, response))
      ).resolves.toBe('invalid_client');

      // Redirecting an unvalidated redirect_uri is the open-redirect hazard; and the
      // session must not be touched for a request that is rejected outright.
      expect(redirectedTo()).toBe('');
      expect(resolveCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('bounds the client name it stores for the lifetime of the client', async () => {
      const { controller } = buildController();

      const registration = await controller.register({
        redirect_uris: [REDIRECT_URI],
        client_name: 'x'.repeat(500),
      });

      // Public endpoint: an unbounded name would let a caller park arbitrary text in the
      // store for 30 days.
      expect(registration.client_name).toHaveLength(200);
    });

    it('rejects a redirect target outside the policy', async () => {
      const { controller } = buildController();

      await expect(
        rejectedErrorCode(controller.register({ redirect_uris: ['https://evil.example/cb'] }))
      ).resolves.toBe('invalid_redirect_uri');
    });

    it('accepts loopback on any port, which is what the CLI will use', async () => {
      const { controller } = buildController();

      const registration = await controller.register({ redirect_uris: ['http://127.0.0.1:54321/cb'] });

      expect(registration.redirect_uris).toEqual(['http://127.0.0.1:54321/cb']);
      expect(registration.token_endpoint_auth_method).toBe('none');
    });
  });

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

  describe('revoke', () => {
    it('deletes the session scoped to the calling client', async () => {
      const { controller, revokeOAuthToken } = buildController();

      await expect(
        controller.revoke({ token: 'a-refresh-token', client_id: CLIENT_ID })
      ).resolves.toBeUndefined();

      expect(revokeOAuthToken).toHaveBeenCalledWith('a-refresh-token', CLIENT_ID);
    });

    it('succeeds for a token that means nothing to us (RFC 7009 §2.2)', async () => {
      const { controller, revokeOAuthToken } = buildController();
      revokeOAuthToken.mockResolvedValue(undefined);

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
