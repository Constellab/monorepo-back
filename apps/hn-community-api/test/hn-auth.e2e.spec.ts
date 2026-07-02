import { TEST_ADMIN_EMAIL } from './test-credentials';
import { HnTestE2EHelper } from './test-e2e-helper.class';

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
