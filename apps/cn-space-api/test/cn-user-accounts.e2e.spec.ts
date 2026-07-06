import { TEST_USER_EMAIL, TEST_USER_ID, TEST_USER_PASSWORD } from './cn-test-fixture.factory';
import { CnTestE2EHelper } from './test-e2e-helper.class';

/**
 * cn-user-accounts E2E — account admin lifecycle + profile edit.
 *
 * Covers an admin locking a user (LOCKED_BY_ADMIN), the locked user being
 * refused login, the admin unlocking, the user logging in again, and the user
 * editing their own profile. Acts on the seeded second user so the admin
 * account stays usable across the suite.
 *
 * Requires a running local MySQL test database (see TESTING.md).
 */
describe('User accounts (e2e)', () => {
  const admin = new CnTestE2EHelper('accounts');
  const user = new CnTestE2EHelper(''); // hits /auth/* and /users/*

  beforeAll(async () => {
    await admin.initAppModule({ seedFixtures: true });
    // share the same running app with the second (non-admin) helper
    user.app = admin.app;
    await admin.loginAsAdmin();
  }, 60_000);

  afterAll(async () => {
    await admin.close();
  });

  describe('admin lock / unlock lifecycle', () => {
    it('the second user can log in before being locked', async () => {
      await user.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    });

    it('an admin locks the user', async () => {
      const locked = await admin.put(`${TEST_USER_ID}/lock`, {}).expect(200).getResponseBody();
      expect(locked.status).toBe('LOCKED_BY_ADMIN');
    });

    it('the locked user can no longer log in (401)', async () => {
      await user.post('auth/login', { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }).expect(401).getResponse();
    });

    it('an admin unlocks the user', async () => {
      const unlocked = await admin.put(`${TEST_USER_ID}/unlock`, {}).expect(200).getResponseBody();
      expect(unlocked.status).toBe('READY');
    });

    it('the unlocked user can log in again', async () => {
      await user.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    });
  });

  describe('profile edit', () => {
    beforeAll(async () => {
      await user.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    });

    it('the user edits their own profile', async () => {
      const edited = await user
        .put('users/current/edit', {
          firstname: 'Edited',
          lastname: 'Name',
          activity: 'Researcher',
          company: 'Gencovery',
          biography: 'bio',
          phone: '0123456789',
        })
        .expect(200)
        .getResponseBody();
      expect(edited.firstname).toBe('Edited');

      const current = await user.get('users/current').expect(200).getResponseBody();
      expect(current.firstname).toBe('Edited');
      expect(current.activity).toBe('Researcher');
    });
  });

  describe('authorization', () => {
    it('a non-admin cannot lock another user (401)', async () => {
      await user.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
      // reuse the accounts route base via a fresh helper sharing the app + token
      const userAccounts = new CnTestE2EHelper('accounts');
      userAccounts.app = admin.app;
      userAccounts.setToken(user.getToken());
      // lockUser throws BlUnauthorizedException (401) for non-admins
      await userAccounts.put(`${TEST_USER_ID}/lock`, {}).expect(401).getResponse();
    });
  });
});
