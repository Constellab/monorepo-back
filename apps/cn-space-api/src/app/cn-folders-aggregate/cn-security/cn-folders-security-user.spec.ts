import { BlUnauthorizedException } from '@monorepo/back-core-lib';

import { CnSpaceUserRole } from '../../cn-spaces/cn-space-user.entity';
import { CnUserSpaceInfo } from '../../cn-users/cn-user.dto';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnFolderUser, CnRootFolderUserRole } from '../cn-folder-user/cn-folder-user.entity';
import { CnFolderUserService } from '../cn-folder-user/cn-folder-user.service';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnFoldersSecurityUser } from './cn-folders-security-user';

/**
 * Unit test for the per-user folder access rules. No DB: the folder-user lookup
 * is mocked. Covers the space-context guard, the space-admin shortcut, and the
 * viewer/editor/owner role resolution for a shared folder.
 */
describe('CnFoldersSecurityUser', () => {
  const spaceId = 'space-1';
  const otherSpaceId = 'space-2';
  const rootFolderId = 'root-1';

  let folderUserService: { findByRootFolderIdAndUserId: jest.Mock };

  beforeEach(() => {
    folderUserService = { findByRootFolderIdAndUserId: jest.fn() };
  });

  function makeUserInfo(role: CnSpaceUserRole, isGlobalAdmin = false, id = 'user-1'): CnUserSpaceInfo {
    const user = { id, isAdmin: () => isGlobalAdmin } as unknown as CnUser;
    return new CnUserSpaceInfo(user, { id: spaceId } as never, role);
  }

  function makeSecurity(userInfo: CnUserSpaceInfo): CnFoldersSecurityUser {
    return new CnFoldersSecurityUser(userInfo, folderUserService as unknown as CnFolderUserService);
  }

  function makeObject(objectSpaceId: string): CnHierarchyObject {
    return {
      spaceId: objectSpaceId,
      getRootFolderId: () => rootFolderId,
    } as unknown as CnHierarchyObject;
  }

  describe('checkFindAllBySpace', () => {
    it('passes for a space admin', () => {
      expect(() => makeSecurity(makeUserInfo(CnSpaceUserRole.ADMIN)).checkFindAllBySpace()).not.toThrow();
    });

    it('throws for a non-admin space user', () => {
      expect(() => makeSecurity(makeUserInfo(CnSpaceUserRole.USER)).checkFindAllBySpace()).toThrow(
        BlUnauthorizedException
      );
    });
  });

  describe('checkCreateRootFolder', () => {
    it('passes for a space user (editor)', () => {
      expect(() => makeSecurity(makeUserInfo(CnSpaceUserRole.USER)).checkCreateRootFolder()).not.toThrow();
    });

    it('throws for a space viewer', () => {
      expect(() => makeSecurity(makeUserInfo(CnSpaceUserRole.VIEWER)).checkCreateRootFolder()).toThrow(
        BlUnauthorizedException
      );
    });
  });

  describe('getRoleForObject', () => {
    it('throws when the object is in another space', async () => {
      const security = makeSecurity(makeUserInfo(CnSpaceUserRole.USER));
      await expect(security.getRoleForObject(makeObject(otherSpaceId))).rejects.toThrow(
        BlUnauthorizedException
      );
    });

    it('returns OWNER for a space admin without a folder-user lookup', async () => {
      const security = makeSecurity(makeUserInfo(CnSpaceUserRole.ADMIN));
      await expect(security.getRoleForObject(makeObject(spaceId))).resolves.toBe(CnRootFolderUserRole.OWNER);
      expect(folderUserService.findByRootFolderIdAndUserId).not.toHaveBeenCalled();
    });

    it('returns the folder-user role for a non-admin with access (viewer)', async () => {
      folderUserService.findByRootFolderIdAndUserId.mockResolvedValue({
        role: CnRootFolderUserRole.VIEWER,
      } as CnFolderUser);
      const security = makeSecurity(makeUserInfo(CnSpaceUserRole.USER));

      await expect(security.getRoleForObject(makeObject(spaceId))).resolves.toBe(CnRootFolderUserRole.VIEWER);
      expect(folderUserService.findByRootFolderIdAndUserId).toHaveBeenCalledWith(rootFolderId, 'user-1');
    });

    it('returns the folder-user role for a non-admin with editor access', async () => {
      folderUserService.findByRootFolderIdAndUserId.mockResolvedValue({
        role: CnRootFolderUserRole.USER,
      } as CnFolderUser);
      const security = makeSecurity(makeUserInfo(CnSpaceUserRole.USER));

      await expect(security.getRoleForObject(makeObject(spaceId))).resolves.toBe(CnRootFolderUserRole.USER);
    });

    it('throws for a non-admin with no folder-user entry', async () => {
      folderUserService.findByRootFolderIdAndUserId.mockResolvedValue(null);
      const security = makeSecurity(makeUserInfo(CnSpaceUserRole.USER));

      await expect(security.getRoleForObject(makeObject(spaceId))).rejects.toThrow(BlUnauthorizedException);
    });
  });
});
