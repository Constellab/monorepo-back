import { CnTestE2EHelper } from './test-e2e-helper.class';

/**
 * cn-folders E2E — root folder lifecycle in a space.
 *
 * Folder routes read the current space from the auth context, so requests carry
 * the `local-space` cookie. Creating a root folder with no explicit storage
 * falls back to the space's default folder bucket (seeded by the fixture
 * factory), so no real cloud provisioning happens here.
 *
 * Requires a running local MySQL test database (see TESTING.md).
 */
describe('Folders (e2e)', () => {
  const helper = new CnTestE2EHelper('folders');
  // folders are trashed/deleted through the hierarchy-objects controller
  const hierarchyHelper = new CnTestE2EHelper('hierarchy-objects');

  let spaceDomain: string;
  let folderId: string;

  beforeAll(async () => {
    await helper.initAppModule({ seedFixtures: true });
    // reuse the same running app for the hierarchy-objects routes
    hierarchyHelper.app = helper.app;
    spaceDomain = helper.fixtures.enterpriseSpaceDomain;
  }, 60_000);

  afterAll(async () => {
    await helper.close();
  });

  // NOTE: assert "no token" BEFORE logging in (the helper stores the token).
  it('rejects root folder listing with no token (401)', async () => {
    await helper.get('root/current', { page: 0, pageSize: 10 }).expect(401).getResponse();
  });

  it('creates a root folder (using the space default storage)', async () => {
    await helper.loginAsAdmin();
    helper.setCurrentSpaceDomain(spaceDomain);

    const folder = await helper.post('', { name: 'My Root Folder' }).expect(201).getResponseBody();
    expect(folder.name).toBe('My Root Folder');
    folderId = folder.id;
  });

  it('finds the folder by id', async () => {
    const folder = await helper.get(folderId).expect(200).getResponseBody();
    expect(folder.id).toBe(folderId);
  });

  it('renames the folder', async () => {
    const folder = await helper.put(`${folderId}/name`, { name: 'Renamed Root Folder' }).expect(200).getResponseBody();
    expect(folder.name).toBe('Renamed Root Folder');
  });

  it('lists the current root folders including the new one', async () => {
    const page = await helper.get('root/current', { page: 0, pageSize: 10 }).expect(200).getResponseBody();
    expect(page.objects.some((folder: { id: string }) => folder.id === folderId)).toBe(true);
  });

  describe('cross-user access', () => {
    afterAll(() => {
      helper.setCurrentSpaceDomain(undefined);
    });

    it('denies a non-member user access to the folder (403)', async () => {
      await helper.loginAsSecondUser();
      // act inside the enterprise space so the guard yields 403 (non-member)
      helper.setCurrentSpaceDomain(spaceDomain);

      await helper.get(folderId).expect(403).getResponse();
    });
  });

  it('moves the folder to trash', async () => {
    await helper.loginAsAdmin();
    hierarchyHelper.setToken(helper.getToken());
    hierarchyHelper.setCurrentSpaceDomain(spaceDomain);

    await hierarchyHelper.put(`${folderId}/move-to-trash`, {}).expect(200).getResponse();

    // the trashed folder is no longer accessible through the normal find route
    helper.setCurrentSpaceDomain(spaceDomain);
    await helper.get(folderId).expect(401).getResponse();
  });
});
