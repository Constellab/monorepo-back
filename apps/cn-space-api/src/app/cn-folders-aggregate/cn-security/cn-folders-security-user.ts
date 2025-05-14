import { CnFoldersAggregateSecurityI } from './cn-folders-security.service';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnFolderUserService } from '../cn-folder-user/cn-folder-user.service';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnUserSpaceInfo } from '../../cn-users/cn-user.dto';
import { CnRootFolderUserRole } from '../cn-folder-user/cn-folder-user.entity';

/**
 * Security for the folders aggregate service when call is made from a user
 */
export class CnFoldersSecurityUser implements CnFoldersAggregateSecurityI {
  constructor(
    private userInfo: CnUserSpaceInfo,
    private folderUserService: CnFolderUserService
  ) {}

  async checkFindAllBySpace(): Promise<void> {
    // check the space context
    if (!this.userInfo.isSpaceAdmin())
      throw new BlUnauthorizedException('Only space admin can list all folders');
  }

  async getRoleForObject(hierarchyObject: CnHierarchyObject): Promise<CnRootFolderUserRole> {
    // check the space context
    if (hierarchyObject.spaceId !== this.userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    if (this.userInfo.isSpaceAdmin()) return CnRootFolderUserRole.OWNER;

    const folderUser = await this.folderUserService.findByRootFolderIdAndUserId(
      hierarchyObject.getRootFolderId(),
      this.userInfo.userId
    );

    if (!folderUser) {
      throw new BlUnauthorizedException(CnErrorText.NO_ACCESS_TO_FOLDER);
    }

    return folderUser.role;
  }
}
