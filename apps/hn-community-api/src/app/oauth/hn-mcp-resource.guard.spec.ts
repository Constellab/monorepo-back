import { BlDecodedToken, BlJwtAsymmetricService } from '@monorepo/back-core-lib';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { HnMcpResourceGuard } from './hn-mcp-resource.guard';
import { HnOAuthConfig } from './hn-oauth.config';

const ISSUER = 'https://api.example.com';
const RESOURCE_PATH = '/mcp/community-doc';
const RESOURCE = `${ISSUER}${RESOURCE_PATH}`;
const UNREGISTERED_PATH = '/mcp/not-a-resource';

const TOKEN = 'a.jwt.token';

/**
 * A decoded payload as `BlJwtAsymmetricService.verifyToken` would return it.
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
  guard: HnMcpResourceGuard;
  verifyToken: jest.Mock;
  setHeader: jest.Mock;
  context: ExecutionContext;
}

/**
 * A guard wired to one registered resource, called on `path` with `authorization`.
 * `verifyToken` is a mock: this spec is about the audience decision, not about JWT
 * cryptography, which `BlJwtAsymmetricService` owns and
 * `bl-jwt-asymmetric.service.spec.ts` covers — including the algorithm pinning.
 */
function buildHarness(options: { path?: string; authorization?: string } = {}): Harness {
  const { path = RESOURCE_PATH, authorization } = options;

  const verifyToken = jest.fn().mockReturnValue(payload({ aud: RESOURCE }));
  const setHeader = jest.fn();

  const request = { path, headers: authorization == null ? {} : { authorization } } as unknown as Request;
  const response = { setHeader } as unknown as Response;

  const config = {
    issuer: ISSUER,
    isKnownResource: (resource: string) => resource === RESOURCE,
  } as unknown as HnOAuthConfig;

  return {
    guard: new HnMcpResourceGuard({ verifyToken } as unknown as BlJwtAsymmetricService, config),
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

describe('HnMcpResourceGuard', () => {
  describe('accepts', () => {
    it('a token whose audience is the resource being called', () => {
      const { guard, context, setHeader } = buildHarness({ authorization: `Bearer ${TOKEN}` });

      expect(guard.canActivate(context)).toBe(true);
      expect(setHeader).not.toHaveBeenCalled();
    });

    it('a token carrying the resource among several audiences', () => {
      const { guard, context, verifyToken } = buildHarness({ authorization: `Bearer ${TOKEN}` });
      verifyToken.mockReturnValue(payload({ aud: ['https://other', RESOURCE] }));

      expect(guard.canActivate(context)).toBe(true);
    });

    it('a request path with a trailing slash, which names the same resource', () => {
      const { guard, context } = buildHarness({
        path: `${RESOURCE_PATH}/`,
        authorization: `Bearer ${TOKEN}`,
      });

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('rejects', () => {
    const expectRejected = (harness: Harness): void => {
      expect(() => harness.guard.canActivate(harness.context)).toThrow(UnauthorizedException);
    };

    it('a request with no Authorization header', () => {
      const harness = buildHarness();
      expectRejected(harness);
      expect(harness.verifyToken).not.toHaveBeenCalled();
    });

    it('a session token, which carries no audience at all', () => {
      const harness = buildHarness({ authorization: `Bearer ${TOKEN}` });
      // This is the direction `HnMcpResourceGuard` has always closed: a full-session
      // JWT must not reach the MCP. (`BlJwtStrategy` closes the reverse.)
      harness.verifyToken.mockReturnValue(payload());

      expectRejected(harness);
    });

    it('a token minted for another resource', () => {
      const harness = buildHarness({ authorization: `Bearer ${TOKEN}` });
      harness.verifyToken.mockReturnValue(payload({ aud: `${ISSUER}/mcp/space-doc` }));

      expectRejected(harness);
    });

    it('a token whose audiences all miss the resource', () => {
      const harness = buildHarness({ authorization: `Bearer ${TOKEN}` });
      harness.verifyToken.mockReturnValue(payload({ aud: ['https://other', `${ISSUER}/mcp/space-doc`] }));

      expectRejected(harness);
    });

    it('a token the JWT service refuses (bad signature, expired)', () => {
      const harness = buildHarness({ authorization: `Bearer ${TOKEN}` });
      harness.verifyToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expectRejected(harness);
    });

    it('a path that is not a registered resource, without verifying the token', () => {
      const harness = buildHarness({ path: UNREGISTERED_PATH, authorization: `Bearer ${TOKEN}` });

      expectRejected(harness);
      // An unregistered path must never be accepted on the strength of a valid token:
      // the audience check would have nothing meaningful to compare against.
      expect(harness.verifyToken).not.toHaveBeenCalled();
    });

    it('a malformed Authorization header', () => {
      const harness = buildHarness({ authorization: TOKEN });
      expectRejected(harness);
      expect(harness.verifyToken).not.toHaveBeenCalled();
    });
  });

  describe('WWW-Authenticate', () => {
    it('points at the metadata document of the resource actually called', () => {
      const harness = buildHarness();
      expect(() => harness.guard.canActivate(harness.context)).toThrow(UnauthorizedException);

      // Per-resource, not a shared document: this header is the only thing telling the
      // client which audience to request, and every MCP on this host needs a different one.
      expect(advertisedMetadataUrl(harness.setHeader)).toBe(
        `${ISSUER}/.well-known/oauth-protected-resource${RESOURCE_PATH}`
      );
    });

    it('is emitted on every rejection, since it is what starts the OAuth flow', () => {
      const cases: Harness[] = [
        buildHarness(),
        buildHarness({ authorization: `Bearer ${TOKEN}` }),
        buildHarness({ path: UNREGISTERED_PATH, authorization: `Bearer ${TOKEN}` }),
      ];
      // Second case: a token that verifies but for the wrong audience.
      cases[1].verifyToken.mockReturnValue(payload({ aud: 'https://other' }));

      for (const harness of cases) {
        expect(() => harness.guard.canActivate(harness.context)).toThrow(UnauthorizedException);
        // Without this header Claude sees a bare 401 and never discovers the
        // authorization server — the MCP just looks broken.
        expect(advertisedMetadataUrl(harness.setHeader)).not.toBeNull();
      }
    });

    it('still names the unregistered path, whose document 404s, rather than guessing', () => {
      const harness = buildHarness({ path: UNREGISTERED_PATH });
      expect(() => harness.guard.canActivate(harness.context)).toThrow(UnauthorizedException);

      expect(advertisedMetadataUrl(harness.setHeader)).toBe(
        `${ISSUER}/.well-known/oauth-protected-resource${UNREGISTERED_PATH}`
      );
    });
  });
});
