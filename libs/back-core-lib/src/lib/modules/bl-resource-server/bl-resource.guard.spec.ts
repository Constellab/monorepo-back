import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { BlDecodedToken } from '../bl-jwt/bl-jwt.class';
import { BlJwtAsymmetricVerifier } from '../bl-jwt/bl-jwt-asymmetric.verifier';
import { BlResourceGuard } from './bl-resource.guard';
import { BlResourceRegistry } from './bl-resource.registry';
import { BlResourceDescription } from './bl-resource-server.class';

const BASE_URL = 'https://api.example.com';
const RESOURCE_PATH = '/mcp/community-doc';
const RESOURCE = `${BASE_URL}${RESOURCE_PATH}`;
const UNREGISTERED_PATH = '/mcp/not-a-resource';

const TOKEN = 'a.jwt.token';

/**
 * A decoded payload as `BlJwtAsymmetricVerifier.verifyToken` would return it.
 *
 * Typed rather than cast: `jest.Mock.mockReturnValue` accepts anything, so an assertion
 * here would check nothing and a payload that drifts from `BlDecodedToken` would pass
 * unnoticed.
 */
const payload = (overrides: Partial<BlDecodedToken> = {}): BlDecodedToken => ({
  sub: 'user-1',
  email: 'user@example.com',
  ...overrides,
});

interface Harness {
  guard: BlResourceGuard;
  verifyToken: jest.Mock;
  setHeader: jest.Mock;
  context: ExecutionContext;
}

/**
 * A guard wired to one registered resource, called on `path` with `authorization`.
 * `verifyToken` is a mock: this spec is about the audience decision, not about JWT
 * cryptography, which `BlJwtAsymmetricVerifier` owns and
 * `bl-jwt-asymmetric.verifier.spec.ts` covers — including the algorithm pinning.
 */
function buildHarness(
  options: { path?: string; authorization?: string; remoteResources?: BlResourceDescription[] } = {}
): Harness {
  const { path = RESOURCE_PATH, authorization, remoteResources } = options;

  const verifyToken = jest.fn().mockResolvedValue(payload({ aud: RESOURCE }));
  const setHeader = jest.fn();

  const request = { path, headers: authorization == null ? {} : { authorization } } as unknown as Request;
  const response = { setHeader } as unknown as Response;

  const registry = new BlResourceRegistry({
    baseUrl: BASE_URL,
    authorizationServerUrl: BASE_URL,
    resources: [{ path: RESOURCE_PATH, name: 'The documentation' }],
    remoteResources,
  });

  return {
    guard: new BlResourceGuard({ verifyToken } as unknown as BlJwtAsymmetricVerifier, registry),
    verifyToken,
    setHeader,
    context: {
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
    } as unknown as ExecutionContext,
  };
}

/** The `resource_metadata` URL the guard advertised, or null if it set no header. */
function advertisedMetadataUrl(setHeader: jest.Mock): string | null {
  const call = setHeader.mock.calls.find(([name]) => name === 'WWW-Authenticate');
  if (!call) {
    return null;
  }
  return /resource_metadata="([^"]+)"/.exec(call[1] as string)?.[1] ?? null;
}

describe('BlResourceGuard', () => {
  describe('accepts', () => {
    it('a token whose audience is the resource being called', async () => {
      const { guard, context, setHeader } = buildHarness({ authorization: `Bearer ${TOKEN}` });

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(setHeader).not.toHaveBeenCalled();
    });

    it('a token carrying the resource among several audiences', async () => {
      const { guard, context, verifyToken } = buildHarness({ authorization: `Bearer ${TOKEN}` });
      verifyToken.mockResolvedValue(payload({ aud: ['https://other', RESOURCE] }));

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('a request path with a trailing slash, which names the same resource', async () => {
      const { guard, context } = buildHarness({
        path: `${RESOURCE_PATH}/`,
        authorization: `Bearer ${TOKEN}`,
      });

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });

  describe('rejects', () => {
    const expectRejected = async (harness: Harness): Promise<void> => {
      await expect(harness.guard.canActivate(harness.context)).rejects.toThrow(UnauthorizedException);
    };

    it('a request with no Authorization header', async () => {
      const harness = buildHarness();
      await expectRejected(harness);
      expect(harness.verifyToken).not.toHaveBeenCalled();
    });

    it('a session token, which carries no audience at all', async () => {
      const harness = buildHarness({ authorization: `Bearer ${TOKEN}` });
      // This is the direction the Resource Server guard has always closed: a full-session
      // JWT must not reach a Resource. (`BlJwtStrategy` closes the reverse.)
      harness.verifyToken.mockResolvedValue(payload());

      await expectRejected(harness);
    });

    it('a token minted for another resource', async () => {
      const harness = buildHarness({ authorization: `Bearer ${TOKEN}` });
      harness.verifyToken.mockResolvedValue(payload({ aud: `${BASE_URL}/mcp/space-doc` }));

      await expectRejected(harness);
    });

    it('a token whose audiences all miss the resource', async () => {
      const harness = buildHarness({ authorization: `Bearer ${TOKEN}` });
      harness.verifyToken.mockResolvedValue(payload({ aud: ['https://other', `${BASE_URL}/mcp/space-doc`] }));

      await expectRejected(harness);
    });

    it('a token the JWT service refuses (bad signature, expired)', async () => {
      const harness = buildHarness({ authorization: `Bearer ${TOKEN}` });
      harness.verifyToken.mockRejectedValue(new Error('jwt expired'));

      await expectRejected(harness);
    });

    it('a path that is not a registered resource, without verifying the token', async () => {
      const harness = buildHarness({ path: UNREGISTERED_PATH, authorization: `Bearer ${TOKEN}` });

      await expectRejected(harness);
      // An unregistered path must never be accepted on the strength of a valid token:
      // the audience check would have nothing meaningful to compare against.
      expect(harness.verifyToken).not.toHaveBeenCalled();
    });

    it('a path registered only as a resource this application issues tokens for', async () => {
      // The reason the guard asks `servesResource` and not `isKnownResource`. A Resource in
      // the remote list is served by another application: nothing here is mounted at it, no
      // discovery document names it, and a token minted for it must not open an endpoint here
      // — even in the pathological case where the two hosts are configured to the same value.
      const harness = buildHarness({
        path: UNREGISTERED_PATH,
        authorization: `Bearer ${TOKEN}`,
        remoteResources: [{ url: `${BASE_URL}${UNREGISTERED_PATH}`, name: 'Another application' }],
      });
      harness.verifyToken.mockResolvedValue(payload({ aud: `${BASE_URL}${UNREGISTERED_PATH}` }));

      await expectRejected(harness);
      expect(harness.verifyToken).not.toHaveBeenCalled();
    });

    it('a malformed Authorization header', async () => {
      const harness = buildHarness({ authorization: TOKEN });
      await expectRejected(harness);
      expect(harness.verifyToken).not.toHaveBeenCalled();
    });
  });

  describe('WWW-Authenticate', () => {
    it('points at the metadata document of the resource actually called', async () => {
      const harness = buildHarness();
      await expect(harness.guard.canActivate(harness.context)).rejects.toThrow(UnauthorizedException);

      // Per-resource, not a shared document: this header is the only thing telling the
      // client which audience to request, and every Resource on this host needs a
      // different one.
      expect(advertisedMetadataUrl(harness.setHeader)).toBe(
        `${BASE_URL}/.well-known/oauth-protected-resource${RESOURCE_PATH}`
      );
    });

    it('is emitted on every rejection, since it is what starts the OAuth flow', async () => {
      const cases: Harness[] = [
        buildHarness(),
        buildHarness({ authorization: `Bearer ${TOKEN}` }),
        buildHarness({ path: UNREGISTERED_PATH, authorization: `Bearer ${TOKEN}` }),
      ];
      // Second case: a token that verifies but for the wrong audience.
      cases[1].verifyToken.mockResolvedValue(payload({ aud: 'https://other' }));

      for (const harness of cases) {
        await expect(harness.guard.canActivate(harness.context)).rejects.toThrow(UnauthorizedException);
        // Without this header Claude sees a bare 401 and never discovers the
        // authorization server — the MCP just looks broken.
        expect(advertisedMetadataUrl(harness.setHeader)).not.toBeNull();
      }
    });

    it('still names the unregistered path, whose document 404s, rather than guessing', async () => {
      const harness = buildHarness({ path: UNREGISTERED_PATH });
      await expect(harness.guard.canActivate(harness.context)).rejects.toThrow(UnauthorizedException);

      expect(advertisedMetadataUrl(harness.setHeader)).toBe(
        `${BASE_URL}/.well-known/oauth-protected-resource${UNREGISTERED_PATH}`
      );
    });
  });
});
