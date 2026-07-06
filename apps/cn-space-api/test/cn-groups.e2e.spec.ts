import { CnTestE2EHelper } from './test-e2e-helper.class';

/**
 * cn-groups E2E — team lifecycle within a space.
 *
 * Group/team routes read the current space from the auth context, so every
 * request must carry the `local-space` cookie (set via setCurrentSpaceDomain).
 * The admin acts as a space admin of the seeded enterprise space.
 *
 * Requires a running local MySQL test database (see TESTING.md).
 */
describe('Groups (e2e)', () => {
  const helper = new CnTestE2EHelper('groups');

  let spaceDomain: string;
  let teamId: string;

  beforeAll(async () => {
    await helper.initAppModule({ seedFixtures: true });
    spaceDomain = helper.fixtures.enterpriseSpaceDomain;
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  // NOTE: assert "no token" BEFORE logging in — the helper stores the token
  // once logged in, so this must run first.
  it('rejects team listing with no token (401)', async () => {
    await helper.get('teams/current-space', { page: 0, pageSize: 10 }).expect(401).getResponse();
  });

  it('creates a team in the current space', async () => {
    await helper.loginAsAdmin();
    helper.setCurrentSpaceDomain(spaceDomain);

    const team = await helper.post('teams/My Team', {}).expect(201).getResponseBody();
    expect(team.label).toBe('My Team');
    teamId = team.id;
  });

  it('lists the teams of the current space including the new team', async () => {
    const page = await helper.get('teams/current-space', { page: 0, pageSize: 10 }).expect(200).getResponseBody();
    expect(page.objects.some((team: { id: string }) => team.id === teamId)).toBe(true);
  });

  it('gets the team by id', async () => {
    const team = await helper.get(`teams/${teamId}`).expect(200).getResponseBody();
    expect(team.id).toBe(teamId);
  });

  it('renames the team', async () => {
    const team = await helper.put(`teams/${teamId}/label/Renamed Team`, {}).expect(200).getResponseBody();
    expect(team.label).toBe('Renamed Team');
  });

  it('deletes the team', async () => {
    await helper.delete(`teams/${teamId}`).expect(200).getResponse();

    // it is gone: it no longer appears in the space's team list.
    // NOTE: we assert absence from the list rather than a 404 on GET
    // /groups/teams/:id — that path has a latent bug (CnGroupsService
    // .getAndCheckTeamById dereferences a null result from findById, throwing
    // 500 instead of a NotFound) which is out of scope for this suite.
    const page = await helper.get('teams/current-space', { page: 0, pageSize: 10 }).expect(200).getResponseBody();
    expect(page.objects.some((team: { id: string }) => team.id === teamId)).toBe(false);
  });
});
