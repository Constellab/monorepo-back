import { CnFoldersAggregateSecurityI } from './cn-folders-aggregate-security.service';
import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnAuthContextLab } from '../cn-core/utils/cn-current-user.helper';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnHierarchyObjectService } from './cn_hierarchy_objects/cn-hierarchy-object.service';

/**
 * Security for the folders aggregate service when call is made from
 * an api call using a token from a lab
 */
export class CnFoldersAggregateSecurityToken implements CnFoldersAggregateSecurityI {
  constructor(
    private labAuthContext: CnAuthContextLab,
    private folderObjectService: CnHierarchyObjectService
  ) {}

  async checkFindAllBySpace(): Promise<void> {
    return;
  }

  checkFindOneAndGetRootFolder(folder: CnHierarchyObject): Promise<CnHierarchyObject> {
    if (folder.spaceId !== this.labAuthContext.userInfo.spaceId)
      throw new BlUnauthorizedException('Wrong space');

    return this.folderObjectService.getRootFolder(folder);
  }

  async checkUpdate(folder: CnHierarchyObject): Promise<void> {
    if (folder.spaceId !== this.labAuthContext.userInfo.spaceId)
      throw new BlUnauthorizedException('Wrong space');
  }

  async checkUpdateFolderLeader(hierarchyObject: CnHierarchyObject): Promise<void> {
    if (hierarchyObject.spaceId !== this.labAuthContext.userInfo.spaceId)
      throw new BlUnauthorizedException('Wrong space');
  }

  isFolderLeader(): boolean {
    return true;
  }
}
