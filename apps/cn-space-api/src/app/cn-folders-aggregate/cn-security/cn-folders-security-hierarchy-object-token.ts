import { BlUnauthorizedException } from '@monorepo/back-core-lib';

import { CnAuthContextHierarchyObjectToken } from '../../cn-core/utils/cn-auth-context.class';
import { CnRootFolderUserRole } from '../cn-folder-user/cn-folder-user.entity';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnFoldersAggregateSecurityI } from './cn-folders-security.service';

/**
 * Security for the folders aggregate service when call is made
 * from a hierarchy object access token.
 */
export class CnFoldersSecurityHierarchyObjectToken implements CnFoldersAggregateSecurityI {
  constructor(private authContextFolderToken: CnAuthContextHierarchyObjectToken) {}

  checkFindAllBySpace(): void {
    throw new BlUnauthorizedException();
  }

  checkCreateRootFolder(): void {
    throw new BlUnauthorizedException();
  }

  getRoleForObject(hierarchyObject: CnHierarchyObject): CnRootFolderUserRole {
    if (hierarchyObject.spaceId !== this.authContextFolderToken.space.id) {
      throw new BlUnauthorizedException('Wrong space');
    }

    if (hierarchyObject.id !== this.authContextFolderToken.hierarchyObject.id) {
      throw new BlUnauthorizedException('Invalid token');
    }

    return CnRootFolderUserRole.VIEWER;
  }
}
