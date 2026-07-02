import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from './test-credentials';
import { CnTestE2EHelper } from './test-e2e-helper.class';

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
