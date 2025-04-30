import { Injectable } from '@nestjs/common';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnFolderUserService } from './cn-folder-user/cn-folder-user.service';
import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from './cn_hierarchy_objects/cn-hierarchy-object.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnFoldersSecurityLabAccessToken } from './cn-folders-security-lab-access-token';
import { CnFoldersSecurityUser } from './cn-folders-security-user';

export interface CnFoldersAggregateSecurityI {
  checkFindOneAndGetRootFolder(folder: CnHierarchyObject): Promise<CnHierarchyObject>;

  checkUpdate(folder: CnHierarchyObject): Promise<void>;

  checkUpdateFolderLeader(hierarchyObject: CnHierarchyObject): Promise<void>;

  isFolderLeader(folder: CnHierarchyObject): boolean;

  checkFindAllBySpace(): Promise<void>;
}

/**
 * Class to check the user authorization on folders
 */
@Injectable()
export class CnFoldersSecurityService {
  constructor(
    private folderObjectService: CnHierarchyObjectService,
    private folderUserService: CnFolderUserService
  ) {}

  public async checkFindOneAndGetRootFolder(folder: CnHierarchyObject): Promise<CnHierarchyObject> {
    const securityService = this.getSecurityService();
    return securityService.checkFindOneAndGetRootFolder(folder);
  }

  public async checkFindOne(folder: CnHierarchyObject): Promise<void> {
    await this.checkFindOneAndGetRootFolder(folder);
  }

  public async checkUpdate(folder: CnHierarchyObject): Promise<void> {
    const securityService = this.getSecurityService();
    return securityService.checkUpdate(folder);
  }

  /**
   * Only the leader or leader of a parent folder can update the leader of children folder
   */
  public async checkUpdateFolderLeader(hierarchyObject: CnHierarchyObject): Promise<void> {
    const securityService = this.getSecurityService();
    return securityService.checkUpdateFolderLeader(hierarchyObject);
  }

  /**
   * Only the leader or leader of a parent folder can update the leader of children folder
   */
  public isFolderLeader(hierarchyObject: CnHierarchyObject): boolean {
    const securityService = this.getSecurityService();
    return securityService.isFolderLeader(hierarchyObject);
  }

  public async checkFindAllBySpace(): Promise<void> {
    const securityService = this.getSecurityService();
    return securityService.checkFindAllBySpace();
  }

  private getSecurityService(): CnFoldersAggregateSecurityI {
    const authContext = CnCurrentUserHelper.getAndCheckAuthContext();

    if (authContext.type === 'labToken') {
      return new CnFoldersSecurityLabAccessToken(authContext, this.folderObjectService);
    } else if (
      authContext.type === 'user' ||
      authContext.type === 'labProd' ||
      authContext.type === 'labDev'
    ) {
      return new CnFoldersSecurityUser(
        authContext.userInfo,
        this.folderObjectService,
        this.folderUserService
      );
    }

    throw new BlUnauthorizedException();
  }
}
