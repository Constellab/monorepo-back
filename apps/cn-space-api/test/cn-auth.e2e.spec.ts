import supertest from 'supertest';

import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from './test-credentials';
import { CnTestE2EHelper } from './test-e2e-helper.class';

const ACCESS_COOKIE = 'Authorization';
const REFRESH_COOKIE = 'Refresh_Token';

/**
 * Mirrors `CN_JWT_CONFIG.defaultAccessTokenDurationInSeconds`, which applies because the
 * test environment sets no `ACCESS_TOKEN_DURATION_SECONDS`. Restated rather than imported
 * so a change to the shipped default has to be acknowledged here.
 */
const ACCESS_TOKEN_DURATION_IN_MILLISECONDS = 15 * 60 * 1000;

function setCookies(response: supertest.Response): string[] {
  const raw = response.headers['set-cookie'];
  if (!raw) {
    return [];
  }
  return Array.isArray(raw) ? raw : [raw];
}

/** Full `Set-Cookie` entry for a cookie name, attributes included. */
function setCookieEntry(response: supertest.Response, name: string): string | undefined {
  return setCookies(response).find((cookie) => cookie.startsWith(`${name}=`));
}

/** Value of a cookie in a `Set-Cookie` header, without its attributes. */
function setCookieValue(response: supertest.Response, name: string): string | undefined {
  const entry = setCookieEntry(response, name);
  return entry?.split(';')[0].substring(`${name}=`.length);
}

/**
 * Reference E2E test — copy this structure for other resource suites.
 *
 * It exercises the full stack: HTTP -> controller -> service -> argon2 verify
 * -> JWT mint -> Authorization cookie, plus reaching a protected route with the
 * resulting token.
 *
 * Requires a running local MySQL test database (see TESTING.md). The helper
 * drops and re-creates it, then seeds the admin user, in beforeAll.
 */
describe('Auth (e2e)', () => {
  // routeBase '' so we can hit both /auth/* and other resources like /spaces/*
  const helper = new CnTestE2EHelper('');

  // Booting the app + dropping/synchronizing the whole schema is slow, so the
  // setup hook needs a generous timeout (default is 5s).
  beforeAll(async () => {
    await helper.initAppModule();
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  /**
   * Log in over raw supertest, so the test sees the response itself — the helper only
   * keeps the access token, and these tests are about the refresh cookie beside it.
   */
  function loginRaw(): Promise<supertest.Response> {
    return supertest(helper.app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
      .expect(201);
  }

  /** The refresh token a login handed out, as the browser would send it back. */
  async function loginRefreshToken(): Promise<string> {
    return setCookieValue(await loginRaw(), REFRESH_COOKIE) ?? '';
  }

  /** Present a refresh token to the renewal endpoint, cookie and all. */
  function refreshWith(refreshToken: string): supertest.Test {
    return supertest(helper.app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', [`${REFRESH_COOKIE}=${refreshToken}`]);
  }

  describe('POST /auth/login', () => {
    it('logs in with valid admin credentials and sets the Authorization cookie', async () => {
      // POST returns 201 (NestJS default status for POST handlers)
      const response = await helper
        .post('auth/login', { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
        .expect(201)
        .getResponse();

      expect(response.body.status).toBe('LOGGED_IN');
      expect(response.body.expiresIn).toBeGreaterThan(0);

      // the JWT must be returned as an httpOnly Authorization cookie, not in the body
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((cookie) => cookie.startsWith('Authorization='))).toBe(true);
      expect(response.body.token).toBeUndefined();
    });

    it('rejects an invalid password with 401', async () => {
      await helper
        .post('auth/login', { email: TEST_ADMIN_EMAIL, password: 'wrong-password' })
        .expect(401)
        .getResponse();
    });

    it('rejects an unknown email with 401', async () => {
      await helper
        .post('auth/login', { email: 'does-not-exist@gencovery.com', password: TEST_ADMIN_PASSWORD })
        .expect(401)
        .getResponse();
    });
  });

  describe('token pair', () => {
    it('sets both cookies, the refresh one scoped to /auth', async () => {
      const response = await loginRaw();

      expect(setCookieValue(response, ACCESS_COOKIE)).toBeTruthy();
      expect(setCookieValue(response, REFRESH_COOKIE)).toBeTruthy();

      // The long-lived credential must not travel on every API call, and must stay
      // unreachable from JS.
      const refreshEntry = setCookieEntry(response, REFRESH_COOKIE) ?? '';
      expect(refreshEntry).toContain('Path=/auth');
      expect(refreshEntry).toContain('HttpOnly');
    });

    it('announces exactly the configured access lifetime, in milliseconds', async () => {
      const response = await loginRaw();

      // Pinned to the value rather than "less than the old 7 days", which would still pass
      // at six. The front arms its proactive renewal from this number, so a unit slip here
      // is either a renewal that never fires or one that hammers the route.
      expect(response.body.expiresIn).toBe(ACCESS_TOKEN_DURATION_IN_MILLISECONDS);
    });

    it('gives the access cookie the refresh lifetime, so both cookies live and die together', async () => {
      const response = await loginRaw();

      // `exp` inside the signature is what limits the token; aligning the cookies keeps
      // the browser out of the "refresh cookie but no access cookie" state.
      const accessMaxAge = /Max-Age=(\d+)/.exec(setCookieEntry(response, ACCESS_COOKIE) ?? '')?.[1];
      const refreshMaxAge = /Max-Age=(\d+)/.exec(setCookieEntry(response, REFRESH_COOKIE) ?? '')?.[1];
      expect(accessMaxAge).toBe(refreshMaxAge);
    });
  });

  describe('POST /auth/refresh', () => {
    it('rotates the refresh token and re-issues an access token', async () => {
      const initial = await loginRefreshToken();

      const response = await refreshWith(initial).expect(201);

      expect(response.body.status).toBe('LOGGED_IN');
      expect(setCookieValue(response, REFRESH_COOKIE)).not.toBe(initial);
      expect(setCookieValue(response, ACCESS_COOKIE)).toBeTruthy();
    });

    it('issues an access token that reaches a protected route', async () => {
      const refreshed = await refreshWith(await loginRefreshToken()).expect(201);

      await supertest(helper.app.getHttpServer())
        .get('/spaces/my-spaces')
        .set('Cookie', [`${ACCESS_COOKIE}=${setCookieValue(refreshed, ACCESS_COOKIE)}`])
        .expect(200);
    });

    it('refuses a replayed refresh token (rotation is single-use)', async () => {
      const initial = await loginRefreshToken();

      await refreshWith(initial).expect(201);

      // Presenting the consumed token again is what a stolen token looks like.
      await refreshWith(initial).expect(401);
    });

    it('ends the whole session when a consumed token is replayed', async () => {
      const initial = await loginRefreshToken();

      const rotated = await refreshWith(initial).expect(201);
      const current = setCookieValue(rotated, REFRESH_COOKIE) ?? '';

      await refreshWith(initial).expect(401);

      // Two holders of one chain means one of them is a thief and we cannot tell which,
      // so the token the legitimate holder has just been given goes too.
      await refreshWith(current).expect(401);
    });

    it('refuses a request with no refresh cookie', async () => {
      await supertest(helper.app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('refuses an unknown refresh token', async () => {
      await refreshWith('0'.repeat(64)).expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('revokes the session server-side, so it can no longer be renewed', async () => {
      const refreshToken = await loginRefreshToken();

      await supertest(helper.app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`${REFRESH_COOKIE}=${refreshToken}`])
        .expect(201);

      // This is what logout could not do before: the row is gone, so the session is
      // dead rather than merely forgotten by the browser.
      await refreshWith(refreshToken).expect(401);
    });

    it('revokes the session even when the browser holds the previously rotated token', async () => {
      const initial = await loginRefreshToken();
      const rotated = setCookieValue(await refreshWith(initial).expect(201), REFRESH_COOKIE) ?? '';

      // A browser that lost the rotation response still holds `initial`. Logging out with
      // it must end the session anyway — the token it never received is exactly the one
      // whoever intercepted that response would hold.
      await supertest(helper.app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`${REFRESH_COOKIE}=${initial}`])
        .expect(201);

      await refreshWith(rotated).expect(401);
    });

    it('succeeds with no refresh cookie at all', async () => {
      await supertest(helper.app.getHttpServer()).post('/auth/logout').expect(201);
    });

    it('clears both cookies', async () => {
      const response = await supertest(helper.app.getHttpServer()).post('/auth/logout').expect(201);

      for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
        expect(setCookieEntry(response, name)).toContain('Max-Age=0');
      }
    });

    it('clears the refresh cookie on the path it was set with', async () => {
      const response = await supertest(helper.app.getHttpServer()).post('/auth/logout').expect(201);

      // A mismatched path leaves the browser holding the cookie, so the next call would
      // still present a token this endpoint has just revoked.
      expect(setCookieEntry(response, REFRESH_COOKIE)).toContain('Path=/auth');
    });
  });

  describe('protected routes', () => {
    // NOTE: keep this test before the login test below — the helper stores the
    // token once logged in, so "no token" must be asserted first.
    it('rejects a request with no token (401)', async () => {
      await helper.get('spaces/my-spaces').expect(401).getResponse();
    });

    it('reaches a protected route after loginAsAdmin', async () => {
      await helper.loginAsAdmin();

      const spaces = await helper.get('spaces/my-spaces').expect(200).getResponseBody();
      expect(Array.isArray(spaces)).toBe(true);
    });
  });
});
