import { BlUnauthorizedException } from '@monorepo/back-core-lib';

import { CnAuthContextLabToken } from '../../cn-core/utils/cn-auth-context.class';
import { CnRootFolderUserRole } from '../cn-folder-user/cn-folder-user.entity';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnFoldersAggregateSecurityI } from './cn-folders-security.service';

/**
 * Security for the folders aggregate service when call is made
 * from the lab using an access token.
 * For now, we only check the space, and we consider the access
 * token has the right to do everything in the space.
 */
export class CnFoldersSecurityLabAccessToken implements CnFoldersAggregateSecurityI {
  constructor(private labAuthContext: CnAuthContextLabToken) {}

  checkFindAllBySpace(): void {
    throw new BlUnauthorizedException();
  }

  checkCreateRootFolder(): void {
    // Lab tokens are allowed to create root folders
  }

  getRoleForObject(hierarchyObject: CnHierarchyObject): CnRootFolderUserRole {
    if (hierarchyObject.spaceId !== this.labAuthContext.space.id) {
      throw new BlUnauthorizedException('Wrong space');
    }

    return CnRootFolderUserRole.OWNER;
  }
}
