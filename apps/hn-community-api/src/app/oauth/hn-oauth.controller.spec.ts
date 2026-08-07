import {
  BlJwtAsymmetricService,
  BlJwtService,
  BlRefreshTokenRotation,
  BlResourceRegistry,
} from '@monorepo/back-core-lib';
import { createHash } from 'crypto';

import { HnRefreshTokenService } from '../auth/refresh-token/hn-refresh-token.service';
import { HnUser } from '../users/hn-user.entity';
import { HnOAuthConfig } from './hn-oauth.config';
import { HnOAuthController } from './hn-oauth.controller';
import { HnOAuthException } from './hn-oauth.exception';
import { HnOAuthClientStore } from './hn-oauth-client.store';
import { HnOAuthCodeBinding, HnOAuthCodeStore } from './hn-oauth-code.store';

const MCP_TOKEN_TTL_SECONDS = 60 * 60;
const ISSUER = 'https://api.example.com';
const RESOURCE_PATH = '/mcp/community-doc';
const RESOURCE = `${ISSUER}${RESOURCE_PATH}`;
const OTHER_RESOURCE = `${ISSUER}/mcp/space-doc`;
const CLIENT_ID = 'client-1';
const REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';

/** Real PKCE pair, so the spec exercises `blVerifyPkce` rather than a stub of it. */
const CODE_VERIFIER = 'a'.repeat(64);
const CODE_CHALLENGE = createHash('sha256').update(CODE_VERIFIER).digest('base64url');

const user = { id: 'user-1', email: 'user@example.com' } as HnUser;

interface Mocks {
  controller: HnOAuthController;
  consume: jest.Mock;
  issue: jest.Mock;
  rotate: jest.Mock;
  revoke: jest.Mock;
  revokeOAuthToken: jest.Mock;
  generateTokenForAudience: jest.Mock;
}

function buildController(): Mocks {
  const consume = jest.fn().mockResolvedValue(null);
  const issue = jest.fn().mockResolvedValue('issued-refresh-token');
  const rotate = jest.fn().mockResolvedValue(null);
  const revoke = jest.fn().mockResolvedValue(undefined);
  const revokeOAuthToken = jest.fn().mockResolvedValue(undefined);
  const generateTokenForAudience = jest.fn().mockReturnValue('access-token');

  const config = {
    mcpAccessTokenDurationInSeconds: MCP_TOKEN_TTL_SECONDS,
    issuer: ISSUER,
  } as unknown as HnOAuthConfig;

  // One registered resource, as in production today. The registry itself is the
  // library's, and `bl-resource.registry.spec.ts` covers what it recognizes.
  const resources = new BlResourceRegistry({
    baseUrl: ISSUER,
    authorizationServerUrl: ISSUER,
    resourcePaths: [RESOURCE_PATH],
  });

  return {
    controller: new HnOAuthController(
      config,
      resources,
      {} as unknown as HnOAuthClientStore,
      { consume } as unknown as HnOAuthCodeStore,
      // Access tokens are minted asymmetrically; the symmetric service is only reached
      // for the browser's own session cookie on /authorize, which this spec never drives.
      { generateTokenForAudience } as unknown as BlJwtAsymmetricService,
      {} as unknown as BlJwtService,
      { issue, rotate, revoke, revokeOAuthToken } as unknown as HnRefreshTokenService
    ),
    consume,
    issue,
    rotate,
    revoke,
    revokeOAuthToken,
    generateTokenForAudience,
  };
}

/** What `/authorize` stored against the code, as `/token` reads it back. */
function codeBinding(overrides: Partial<HnOAuthCodeBinding> = {}): HnOAuthCodeBinding {
  return {
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    codeChallenge: CODE_CHALLENGE,
    resource: RESOURCE,
    user: { id: user.id, email: user.email },
    ...overrides,
  };
}

function rotation(overrides: Partial<BlRefreshTokenRotation<HnUser>> = {}): BlRefreshTokenRotation<HnUser> {
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
      expect(thrown).toBeInstanceOf(HnOAuthException);
      return (thrown as HnOAuthException).error;
    }
  );
}

describe('HnOAuthController', () => {
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
