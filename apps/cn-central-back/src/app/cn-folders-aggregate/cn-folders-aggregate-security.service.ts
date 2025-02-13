import { Injectable } from '@nestjs/common';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnFolderUserService } from './cn-folder-user/cn-folder-user.service';
import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from './cn_hierarchy_objects/cn-hierarchy-object.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';

/**
 * Class to check the user authorization on folders
 */
@Injectable()
export class CnFoldersAggregateSecurity {
  constructor(
    private folderObjectService: CnHierarchyObjectService,
    private folderUserService: CnFolderUserService
  ) {}

  public async checkFindOneAndGetRootFolder(folder: CnHierarchyObject): Promise<CnHierarchyObject> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    // check the space context
    if (folder.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    // the authorization are handle at the projet level
    const rootFolder = await this.folderObjectService.getRootFolder(folder);

    if (userInfo.isSpaceAdmin()) return rootFolder;

    // enable always the leader to have access to the folder
    if (rootFolder.user.id === userInfo.userId) return rootFolder;

    // check if the user is a member of one of the groups that were shared with the folder
    if (!(await this.folderUserService.userIsInRootFolder(rootFolder.id, userInfo.userId))) {
      throw new BlUnauthorizedException(CnErrorText.NO_ACCESS_TO_FOLDER);
    }

    return rootFolder;
  }

  public async checkFindOne(folder: CnHierarchyObject): Promise<void> {
    await this.checkFindOneAndGetRootFolder(folder);
  }

  public async checkUpdate(folder: CnHierarchyObject): Promise<void> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    // check the space context
    if (folder.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    if (userInfo.isSpaceAdmin()) return;

    if (folder.user.id !== userInfo.userId) {
      throw new BlUnauthorizedException(CnErrorText.NO_FOLDER_LEADER);
    }
  }

  /**
   * Only the leader or leader of a parent folder can update the leader of children folder
   */
  public async checkUpdateFolderLeader(hierarchyObject: CnHierarchyObject): Promise<void> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    // check the space context
    if (hierarchyObject.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    if (userInfo.isSpaceAdmin()) return;

    const ancestors = await this.folderObjectService.getAncestors(hierarchyObject);
    for (const ancestor of ancestors) {
      if (ancestor.user.id === userInfo.userId) {
        return;
      }
    }
    throw new BlUnauthorizedException();
  }

  /**
   * Only the leader or leader of a parent folder can update the leader of children folder
   */
  public isFolderLeader(hierarchyObject: CnHierarchyObject): boolean {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    // check the space context
    if (hierarchyObject.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    if (userInfo.isSpaceAdmin()) return true;

    return hierarchyObject.user.id === userInfo.userId;
  }

  public async checkFindAllBySpace(userInfo: CnUserSpaceInfo): Promise<void> {
    // check the space context
    if (!userInfo.isSpaceAdmin()) throw new BlUnauthorizedException('Only space admin can list all folders');
  }
}
