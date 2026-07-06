import { BlUnauthorizedException } from '@monorepo/back-core-lib';

import { CnRootFolderUserRole } from '../cn-folder-user/cn-folder-user.entity';
import { CnFolderUserService } from '../cn-folder-user/cn-folder-user.service';
import {
  CnHierarchyObject,
  CnHierarchyObjectVisibility,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from '../cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnFoldersSecurityService } from './cn-folders-security.service';

/**
 * Unit test for the folder security orchestration: the trash guard and the
 * required-role threshold (viewer < editor < owner). The role a user has for an
 * object is produced by the strategy resolved from the auth context; here we
 * stub that (getRoleForObject) so the test focuses on the threshold + trash
 * branching, not on the auth-context dispatch (covered by
 * cn-folders-security-user.spec).
 */
describe('CnFoldersSecurityService', () => {
  const objectId = 'object-1';

  let service: CnFoldersSecurityService;
  let hierarchyObjectService: { findByIdAndCheck: jest.Mock };
  let folderUserService: Record<string, jest.Mock>;

  beforeEach(() => {
    hierarchyObjectService = { findByIdAndCheck: jest.fn() };
    folderUserService = {};
    service = new CnFoldersSecurityService(
      hierarchyObjectService as unknown as CnHierarchyObjectService,
      folderUserService as unknown as CnFolderUserService
    );
  });

  function makeObject(visibility = CnHierarchyObjectVisibility.VISIBLE): CnHierarchyObject {
    return { id: objectId, visibility } as unknown as CnHierarchyObject;
  }

  /** Force the role the (stubbed) strategy would grant for the object. */
  function grantRole(role: CnRootFolderUserRole): void {
    jest.spyOn(service, 'getRoleForObject').mockResolvedValue(role);
  }

  describe('getAndCheckAuthorizationForFindOne (requires VIEWER)', () => {
    it('passes for a viewer', async () => {
      hierarchyObjectService.findByIdAndCheck.mockResolvedValue(makeObject());
      grantRole(CnRootFolderUserRole.VIEWER);

      await expect(service.getAndCheckAuthorizationForFindOne(objectId)).resolves.toBeDefined();
    });

    it('rejects an object in the trash', async () => {
      hierarchyObjectService.findByIdAndCheck.mockResolvedValue(
        makeObject(CnHierarchyObjectVisibility.TRASH)
      );
      grantRole(CnRootFolderUserRole.OWNER);

      await expect(service.getAndCheckAuthorizationForFindOne(objectId)).rejects.toThrow(
        BlUnauthorizedException
      );
    });
  });

  describe('getAndCheckAuthorizationForUpdate (requires USER/editor)', () => {
    it('passes for an editor', async () => {
      hierarchyObjectService.findByIdAndCheck.mockResolvedValue(makeObject());
      grantRole(CnRootFolderUserRole.USER);

      await expect(service.getAndCheckAuthorizationForUpdate(objectId)).resolves.toBeDefined();
    });

    it('throws for a viewer (role too low)', async () => {
      hierarchyObjectService.findByIdAndCheck.mockResolvedValue(makeObject());
      grantRole(CnRootFolderUserRole.VIEWER);

      await expect(service.getAndCheckAuthorizationForUpdate(objectId)).rejects.toThrow(
        BlUnauthorizedException
      );
    });

    it('allows a trashed object when allowObjectInTrash is set', async () => {
      hierarchyObjectService.findByIdAndCheck.mockResolvedValue(
        makeObject(CnHierarchyObjectVisibility.TRASH)
      );
      grantRole(CnRootFolderUserRole.USER);

      await expect(service.getAndCheckAuthorizationForUpdate(objectId, true)).resolves.toBeDefined();
    });
  });

  describe('getAndCheckAuthorizationForOwner (requires OWNER)', () => {
    it('passes for an owner', async () => {
      hierarchyObjectService.findByIdAndCheck.mockResolvedValue(makeObject());
      grantRole(CnRootFolderUserRole.OWNER);

      await expect(service.getAndCheckAuthorizationForOwner(objectId)).resolves.toBeDefined();
    });

    it('throws for an editor (role too low)', async () => {
      hierarchyObjectService.findByIdAndCheck.mockResolvedValue(makeObject());
      grantRole(CnRootFolderUserRole.USER);

      await expect(service.getAndCheckAuthorizationForOwner(objectId)).rejects.toThrow(
        BlUnauthorizedException
      );
    });
  });
});
