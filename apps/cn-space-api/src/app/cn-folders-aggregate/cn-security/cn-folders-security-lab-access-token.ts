import { CnFoldersAggregateSecurityI } from './cn-folders-security.service';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnAuthContextLabToken } from '../../cn-core/utils/cn-auth-context.class';
import { CnRootFolderUserRole } from '../cn-folder-user/cn-folder-user.entity';

/**
 * Security for the folders aggregate service when call is made
 * from the lab using an access token.
 * For now, we only check the space, and we consider the access
 * token has the right to do everything in the space.
 */
export class CnFoldersSecurityLabAccessToken implements CnFoldersAggregateSecurityI {
  constructor(private labAuthContext: CnAuthContextLabToken) {}

  async checkFindAllBySpace(): Promise<void> {
    throw new BlUnauthorizedException();
  }

  async getRoleForObject(hierarchyObject: CnHierarchyObject): Promise<CnRootFolderUserRole> {
    if (hierarchyObject.spaceId !== this.labAuthContext.space.id) {
      throw new BlUnauthorizedException('Wrong space');
    }

    return CnRootFolderUserRole.OWNER;
  }
}
