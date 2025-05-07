import { CnFoldersAggregateSecurityI } from './cn-folders-security.service';
import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnHierarchyObjectService } from './cn_hierarchy_objects/cn-hierarchy-object.service';
import { CnAuthContextLabToken } from '../cn-core/utils/cn-auth-context.class';

/**
 * Security for the folders aggregate service when call is made
 * from the lab using an access token.
 * For now, we only check the space, and we consider the access
 * token has the right to do everything in the space.
 */
export class CnFoldersSecurityLabAccessToken implements CnFoldersAggregateSecurityI {
  constructor(
    private labAuthContext: CnAuthContextLabToken,
    private hierarchyObjectService: CnHierarchyObjectService
  ) {}

  async checkFindAllBySpace(): Promise<void> {
    return;
  }

  checkFindOneAndGetRootFolder(folder: CnHierarchyObject): Promise<CnHierarchyObject> {
    if (folder.spaceId !== this.labAuthContext.space.id) throw new BlUnauthorizedException('Wrong space');

    return this.hierarchyObjectService.getRootFolder(folder);
  }

  async checkUpdate(folder: CnHierarchyObject): Promise<void> {
    if (folder.spaceId !== this.labAuthContext.space.id) throw new BlUnauthorizedException('Wrong space');
  }

  async checkUpdateFolderLeader(hierarchyObject: CnHierarchyObject): Promise<void> {
    if (hierarchyObject.spaceId !== this.labAuthContext.space.id)
      throw new BlUnauthorizedException('Wrong space');
  }

  isFolderLeader(): boolean {
    return true;
  }
}
