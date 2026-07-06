import { CnSpaceUserRole } from '../src/app/cn-spaces/cn-space-user.entity';
import { TEST_USER_ID } from './cn-test-fixture.factory';
import { CnTestE2EHelper } from './test-e2e-helper.class';

/**
 * cn-spaces E2E — the daily-driver space-management workflows.
 *
 * Covers the happy path for each space operation plus the auth boundaries it
 * must enforce (401 no-token, 403 non-member / non-admin). The seeded admin is
 * a GLOBAL admin (bypasses space checks), so the real permission assertions are
 * driven by the seeded second user, who is NOT a member of the enterprise space.
 *
 * Requires a running local MySQL test database (see TESTING.md).
 */
describe('Spaces (e2e)', () => {
  const helper = new CnTestE2EHelper('spaces');

  // ids resolved from the shared fixtures after setup
  let spaceId: string;
  let spaceDomain: string;

  beforeAll(async () => {
    await helper.initAppModule({ seedFixtures: true });
    spaceId = helper.fixtures.enterpriseSpace.id;
    spaceDomain = helper.fixtures.enterpriseSpaceDomain;
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  describe('unauthenticated access', () => {
    it('rejects my-spaces with no token (401)', async () => {
      await helper.get('my-spaces').expect(401).getResponse();
    });
  });

  describe('as global admin', () => {
    beforeAll(async () => {
      await helper.loginAsAdmin();
      // resolve a current space for the `current-*` routes
      helper.setCurrentSpaceDomain(spaceDomain);
    });

    it('lists the admin spaces including the enterprise fixture', async () => {
      const spaces = await helper.get('my-spaces').expect(200).getResponseBody();
      expect(Array.isArray(spaces)).toBe(true);
      expect(spaces.some((space: { id: string }) => space.id === spaceId)).toBe(true);
    });

    it('returns current-info for the current space', async () => {
      const info = await helper.get('current-info').expect(200).getResponseBody();
      expect(info.space.id).toBe(spaceId);
      expect(info.roleInSpace).toBe(CnSpaceUserRole.ADMIN);
    });

    it('finds a space by id', async () => {
      const space = await helper.get(spaceId).expect(200).getResponseBody();
      expect(space.id).toBe(spaceId);
    });

    it('renames the current space', async () => {
      const newName = 'Renamed Enterprise Space';
      const space = await helper.put(`current-space/name/${newName}`, {}).expect(200).getResponseBody();
      expect(space.name).toBe(newName);
    });

    it('adds the second user to the space, changes role, then removes them', async () => {
      // add (global-admin-only route)
      const membership = await helper.post(`${spaceId}/user/${TEST_USER_ID}`, {}).expect(201).getResponseBody();
      expect(membership.userId).toBe(TEST_USER_ID);
      expect(membership.role).toBe(CnSpaceUserRole.USER);

      // the space now has 2 users
      const users = await helper.get(`${spaceId}/user`, { page: 0, pageSize: 10 }).expect(200).getResponseBody();
      expect(users.totalElements).toBe(2);

      // promote to ADMIN
      await helper.put(`${spaceId}/user/${TEST_USER_ID}/role/${CnSpaceUserRole.ADMIN}`, {}).expect(200).getResponse();

      // deactivate then reactivate
      await helper.put(`${spaceId}/user/${TEST_USER_ID}/deactivate`, {}).expect(200).getResponse();
      await helper.put(`${spaceId}/user/${TEST_USER_ID}/activate`, {}).expect(200).getResponse();

      // remove from the space (leaves only the admin)
      await helper.delete(`${spaceId}/user/${TEST_USER_ID}`).expect(200).getResponse();
      const usersAfter = await helper
        .get(`${spaceId}/user`, { page: 0, pageSize: 10 })
        .expect(200)
        .getResponseBody();
      expect(usersAfter.totalElements).toBe(1);
    });
  });

  describe('as a non-member user', () => {
    beforeAll(async () => {
      await helper.loginAsSecondUser();
      // act "inside" the enterprise space so the guard produces a clean 403
      // (non-member) rather than a 401 (no current space in context)
      helper.setCurrentSpaceDomain(spaceDomain);
    });

    afterAll(() => {
      helper.setCurrentSpaceDomain(undefined);
    });

    it('is refused access to a space it is not a member of (403)', async () => {
      await helper.get(spaceId).expect(403).getResponse();
    });

    it('cannot add a user to a space (403, admin-only route)', async () => {
      await helper.post(`${spaceId}/user/${TEST_USER_ID}`, {}).expect(403).getResponse();
    });
  });

  describe('deletion', () => {
    beforeAll(async () => {
      await helper.loginAsAdmin();
      helper.setCurrentSpaceDomain(spaceDomain);
    });

    it('deletes the (now single-user) enterprise space', async () => {
      await helper.delete(spaceId).expect(200).getResponse();
      // it is gone: finding it again returns 404
      await helper.get(spaceId).expect(404).getResponse();
    });
  });
});
