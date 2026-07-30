// Namespace import, matching test-e2e-helper.class.ts: `esModuleInterop` is off, so a
// default import would compile but be undefined at runtime.
import * as supertest from 'supertest';

import { TEST_ADMIN_EMAIL } from './test-credentials';
import { HnTestE2EHelper } from './test-e2e-helper.class';

const ACCESS_COOKIE = 'Authorization';
const REFRESH_COOKIE = 'Refresh_Token';
const SEVEN_DAYS_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

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
 * It exercises the full stack: HTTP -> controller -> service -> JWT mint ->
 * Authorization cookie, plus reaching a protected route with the token.
 *
 * hn local login is email-only (no password check — see HnUserService), so the
 * seeded admin email is what matters. Requires a running local MySQL test
 * database (see TESTING.md); the helper drops and re-creates it in beforeAll.
 */
describe('Auth (e2e)', () => {
  const helper = new HnTestE2EHelper('');

  // Booting the app + dropping/synchronizing the whole schema is slow, so the
  // setup hook needs a generous timeout (default is 5s).
  beforeAll(async () => {
    await helper.initAppModule();
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  describe('POST /auth/login', () => {
    it('logs in a known user and sets the Authorization cookie', async () => {
      // POST returns 201 (NestJS default status for POST handlers)
      const response = await helper
        .post('auth/login', { email: TEST_ADMIN_EMAIL, password: 'anything' })
        .expect(201)
        .getResponse();

      expect(response.body.status).toBe('LOGGED_IN');
      expect(response.body.expiresIn).toBeGreaterThan(0);

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((cookie) => cookie.startsWith('Authorization='))).toBe(true);
      expect(response.body.token).toBeUndefined();
    });

    it('returns 2FA_REQUIRED for an unknown user (no local account)', async () => {
      // hn has no password check locally: an unknown email falls through to the
      // 2FA branch rather than logging in.
      const response = await helper
        .post('auth/login', { email: 'does-not-exist@gencovery.com', password: 'anything' })
        .expect(201)
        .getResponse();

      expect(response.body.status).toBe('2FA_REQUIRED');
    });
  });

  describe('token pair', () => {
    it('sets both cookies, the refresh one scoped to /auth', async () => {
      const response = await helper
        .post('auth/login', { email: TEST_ADMIN_EMAIL, password: 'anything' })
        .expect(201)
        .getResponse();

      expect(setCookieValue(response, ACCESS_COOKIE)).toBeTruthy();
      expect(setCookieValue(response, REFRESH_COOKIE)).toBeTruthy();

      // The long-lived credential must not travel on every API call, and must stay
      // unreachable from JS.
      const refreshEntry = setCookieEntry(response, REFRESH_COOKIE) ?? '';
      expect(refreshEntry).toContain('Path=/auth');
      expect(refreshEntry).toContain('HttpOnly');
    });

    it('reports an access lifetime far shorter than the previous 7 days', async () => {
      const response = await helper
        .post('auth/login', { email: TEST_ADMIN_EMAIL, password: 'anything' })
        .expect(201)
        .getResponse();

      expect(response.body.expiresIn).toBeGreaterThan(0);
      expect(response.body.expiresIn).toBeLessThan(SEVEN_DAYS_IN_MILLISECONDS);
    });
  });

  describe('POST /auth/refresh', () => {
    /** Log in over raw supertest so the refresh cookie is available to the test. */
    async function loginRaw(): Promise<{ access: string; refresh: string }> {
      const response = await supertest(helper.app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_ADMIN_EMAIL, password: 'anything' })
        .expect(201);

      return {
        access: setCookieValue(response, ACCESS_COOKIE) ?? '',
        refresh: setCookieValue(response, REFRESH_COOKIE) ?? '',
      };
    }

    it('rotates the refresh token and re-issues an access token', async () => {
      const initial = await loginRaw();

      const response = await supertest(helper.app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE}=${initial.refresh}`])
        .expect(201);

      expect(response.body.status).toBe('LOGGED_IN');
      expect(setCookieValue(response, REFRESH_COOKIE)).not.toBe(initial.refresh);
      expect(setCookieValue(response, ACCESS_COOKIE)).toBeTruthy();
    });

    it('issues an access token that reaches a protected route', async () => {
      const initial = await loginRaw();

      const refreshed = await supertest(helper.app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE}=${initial.refresh}`])
        .expect(201);

      await supertest(helper.app.getHttpServer())
        .get('/user')
        .set('Cookie', [`${ACCESS_COOKIE}=${setCookieValue(refreshed, ACCESS_COOKIE)}`])
        .expect(200);
    });

    it('refuses a replayed refresh token (rotation is single-use)', async () => {
      const initial = await loginRaw();

      await supertest(helper.app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE}=${initial.refresh}`])
        .expect(201);

      // Presenting the consumed token again is what a stolen token looks like.
      await supertest(helper.app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE}=${initial.refresh}`])
        .expect(401);
    });

    it('refuses a request with no refresh cookie', async () => {
      await supertest(helper.app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('refuses an unknown refresh token', async () => {
      await supertest(helper.app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE}=${'0'.repeat(64)}`])
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('revokes the session server-side, so it can no longer be renewed', async () => {
      const login = await supertest(helper.app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_ADMIN_EMAIL, password: 'anything' })
        .expect(201);
      const refresh = setCookieValue(login, REFRESH_COOKIE) ?? '';

      await supertest(helper.app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`${REFRESH_COOKIE}=${refresh}`])
        .send({})
        .expect(201);

      // This is what logout could not do before: the row is gone, so the session is
      // dead rather than merely forgotten by the browser.
      await supertest(helper.app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`${REFRESH_COOKIE}=${refresh}`])
        .expect(401);
    });

    it('succeeds with no refresh cookie at all', async () => {
      await supertest(helper.app.getHttpServer()).post('/auth/logout').send({}).expect(201);
    });
  });

  describe('protected routes', () => {
    // NOTE: keep this test before the login test below — the helper stores the
    // token once logged in, so "no token" must be asserted first.
    it('rejects a request with no token (401)', async () => {
      await helper.get('user').expect(401).getResponse();
    });

    it('reaches a protected route after loginAsAdmin', async () => {
      await helper.loginAsAdmin();

      const user = await helper.get('user').expect(200).getResponseBody();
      expect(user.email).toBe(TEST_ADMIN_EMAIL);
    });
  });
});
