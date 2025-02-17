import { CnFoldersAggregateSecurityI } from './cn-folders-security.service';
import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnHierarchyObjectService } from './cn_hierarchy_objects/cn-hierarchy-object.service';
import { CnFolderUserService } from './cn-folder-user/cn-folder-user.service';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';

/**
 * Security for the folders aggregate service when call is made from a user
 */
export class CnFoldersSecurityUser implements CnFoldersAggregateSecurityI {
  constructor(
    private userInfo: CnUserSpaceInfo,
    private folderObjectService: CnHierarchyObjectService,
    private folderUserService: CnFolderUserService
  ) {}

  async checkFindAllBySpace(): Promise<void> {
    // check the space context
    if (!this.userInfo.isSpaceAdmin())
      throw new BlUnauthorizedException('Only space admin can list all folders');
  }

  async checkFindOneAndGetRootFolder(folder: CnHierarchyObject): Promise<CnHierarchyObject> {
    // check the space context
    if (folder.spaceId !== this.userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    // the authorization are handle at the projet level
    const rootFolder = await this.folderObjectService.getRootFolder(folder);

    if (this.userInfo.isSpaceAdmin()) return rootFolder;

    // enable always the leader to have access to the folder
    if (rootFolder.user.id === this.userInfo.userId) return rootFolder;

    // check if the user is a member of one of the groups that were shared with the folder
    if (!(await this.folderUserService.userIsInRootFolder(rootFolder.id, this.userInfo.userId))) {
      throw new BlUnauthorizedException(CnErrorText.NO_ACCESS_TO_FOLDER);
    }

    return rootFolder;
  }

  async checkUpdate(folder: CnHierarchyObject): Promise<void> {
    // check the space context
    if (folder.spaceId !== this.userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    if (this.userInfo.isSpaceAdmin()) return;

    if (folder.user.id !== this.userInfo.userId) {
      throw new BlUnauthorizedException(CnErrorText.NO_FOLDER_LEADER);
    }
  }

  async checkUpdateFolderLeader(hierarchyObject: CnHierarchyObject): Promise<void> {
    // check the space context
    if (hierarchyObject.spaceId !== this.userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    if (this.userInfo.isSpaceAdmin()) return;

    const ancestors = await this.folderObjectService.getAncestors(hierarchyObject);
    for (const ancestor of ancestors) {
      if (ancestor.user.id === this.userInfo.userId) {
        return;
      }
    }
    throw new BlUnauthorizedException();
  }

  isFolderLeader(hierarchyObject: CnHierarchyObject): boolean {
    // check the space context
    if (hierarchyObject.spaceId !== this.userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    if (this.userInfo.isSpaceAdmin()) return true;

    return hierarchyObject.user.id === this.userInfo.userId;
  }
}
