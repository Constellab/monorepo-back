import { BlUnauthorizedException } from '@monorepo/back-core-lib';

import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnUserSpaceInfo } from '../../cn-users/cn-user.dto';
import { CnRootFolderUserRole } from '../cn-folder-user/cn-folder-user.entity';
import { CnFolderUserService } from '../cn-folder-user/cn-folder-user.service';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnFoldersAggregateSecurityI } from './cn-folders-security.service';

/**
 * Security for the folders aggregate service when call is made from a user
 */
export class CnFoldersSecurityUser implements CnFoldersAggregateSecurityI {
  constructor(
    private userInfo: CnUserSpaceInfo,
    private folderUserService: CnFolderUserService
  ) {}

  checkFindAllBySpace(): void {
    // check the space context
    if (!this.userInfo.isSpaceAdmin())
      throw new BlUnauthorizedException('Only space admin can list all folders');
  }

  checkCreateRootFolder(): void {
    if (this.userInfo.isSpaceViewer()) {
      throw new BlUnauthorizedException(CnErrorText.VISITOR_CANNOT_CREATE_FOLDER);
    }
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
