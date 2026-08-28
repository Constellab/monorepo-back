import { BL_REFRESH_CAPABLE_HEADER, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { HN_JWT_CONFIG } from '../../auth/hn-jwt.config';
import { HnJwtAuthGuard } from './hn-jwt-auth.guard';

const TOKEN = 'a.jwt.token';

/**
 * The prototype `HnJwtAuthGuard` inherits `canActivate` from, i.e. the passport mixin.
 * Stubbing it there is what lets this spec drive the only branch that matters here —
 * "the JWT strategy did not authenticate the caller" — without a passport runtime.
 */
const passportPrototype = Object.getPrototypeOf(HnJwtAuthGuard.prototype);

type RouteKind = 'protected' | 'public' | 'optionalAuth';

interface HarnessOptions {
  route: RouteKind;
  /** How the access token reaches the server, if at all. */
  token?: 'cookie' | 'header';
  /** Whether the caller declared it can renew its token and replay. */
  refreshCapable?: boolean;
}

function buildHarness(options: HarnessOptions): { guard: HnJwtAuthGuard; context: ExecutionContext } {
  const { route, token, refreshCapable = false } = options;

  const metadata: Record<string, boolean> = {
    // `BlOptionalAuth` sets both, so the harness mirrors that rather than inventing a
    // combination the decorator cannot produce.
    isPublic: route !== 'protected',
    isOptionalAuth: route === 'optionalAuth',
  };
  const reflector = {
    get: (key: string) => metadata[key] ?? false,
  } as unknown as Reflector;

  const headers: Record<string, string> = {};
  if (token === 'cookie') {
    headers['cookie'] = `${HN_JWT_CONFIG.authorizationCookie}=${TOKEN}`;
  } else if (token === 'header') {
    headers['authorization'] = TOKEN;
  }
  if (refreshCapable) {
    headers[BL_REFRESH_CAPABLE_HEADER] = '1';
  }

  const context = {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  } as unknown as ExecutionContext;

  return { guard: new HnJwtAuthGuard(reflector), context };
}

describe('HnJwtAuthGuard', () => {
  beforeEach(() => {
    // Every case below is "the token was missing or rejected"; the authenticated path
    // is unchanged by the optional-auth work and is not what this spec is about.
    jest.spyOn(passportPrototype, 'canActivate').mockRejectedValue(new Error('unauthorized'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('refuses a protected route', async () => {
    const { guard, context } = buildHarness({ route: 'protected' });

    await expect(guard.canActivate(context)).rejects.toThrow(BlUnauthorizedException);
  });

  it('serves a public route even to a refresh-capable caller holding a dead token', async () => {
    const { guard, context } = buildHarness({ route: 'public', token: 'cookie', refreshCapable: true });

    // @BlPublic keeps its old meaning: it never inspects the credential.
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  describe('@BlOptionalAuth', () => {
    it('serves an anonymous caller', async () => {
      const { guard, context } = buildHarness({ route: 'optionalAuth', refreshCapable: true });

      await expect(guard.canActivate(context)).resolves.toBe(true);
    });

    it('refuses a rejected cookie token when the caller can refresh', async () => {
      const { guard, context } = buildHarness({
        route: 'optionalAuth',
        token: 'cookie',
        refreshCapable: true,
      });

      // The whole point: a 200 here would silently hand back the anonymous half of the
      // results for a session that is still valid.
      await expect(guard.canActivate(context)).rejects.toThrow(BlUnauthorizedException);
    });

    it('refuses a rejected bearer token when the caller can refresh', async () => {
      const { guard, context } = buildHarness({
        route: 'optionalAuth',
        token: 'header',
        refreshCapable: true,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(BlUnauthorizedException);
    });

    it('serves a rejected token when the caller cannot act on a 401', async () => {
      const { guard, context } = buildHarness({ route: 'optionalAuth', token: 'cookie' });

      // The server-side renderer forwarding the browser's stale cookie, an `<img>`, a
      // crawler: no header, so they get the anonymous page instead of a broken one.
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });
});
