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
    private hierarchyObjectService: CnHierarchyObjectService,
    private folderUserService: CnFolderUserService
  ) {}

  public async getAndCheckAuthorizationForFindOneByHierarchyObject(
    hierarchyObjectId: string
  ): Promise<CnHierarchyObject> {
    const folder = await this.hierarchyObjectService.findByIdAndCheck(hierarchyObjectId);

    await this.checkFindOneAndGetRootFolder(folder.id);
    return folder;
  }

  public async getAndCheckAuthorizationForFolderUpdate(folderId: string): Promise<CnHierarchyObject> {
    const folder = await this.hierarchyObjectService.findByIdAndCheck(folderId);
    this.checkHierarchyObject(folder);

    await this.checkUpdate(folder);
    return folder;
  }

  /**
   * Check the authorization for a hierarchy object update
   * @param hierarchyObjectId
   * @param allowObjectInTrash if true, the object can be in trash
   */
  public async getAndCheckAuthorizationForHierarchyObjectUpdate(
    hierarchyObjectId: string,
    allowObjectInTrash: boolean = false
  ): Promise<CnHierarchyObject> {
    const hierarchyObject = await this.hierarchyObjectService.findByIdAndCheck(hierarchyObjectId);
    if (!allowObjectInTrash) {
      this.checkHierarchyObject(hierarchyObject);
    }

    // if this is a folder, we check the folder security
    if (hierarchyObject.isFolder()) {
      await this.checkUpdate(hierarchyObject);
    }
    return hierarchyObject;
  }

  public async checkFindOneAndGetRootFolder(hierarchyObjectId: string): Promise<CnHierarchyObject> {
    const hierarchyObject = await this.hierarchyObjectService.findByIdAndCheck(hierarchyObjectId);
    this.checkHierarchyObject(hierarchyObject);

    const securityService = this.getSecurityService();
    return securityService.checkFindOneAndGetRootFolder(hierarchyObject);
  }

  ////////////////////////////// CHECKS //////////////////////////////

  private async checkUpdate(hierarchyObject: CnHierarchyObject): Promise<void> {
    const securityService = this.getSecurityService();
    return securityService.checkUpdate(hierarchyObject);
  }

  /**
   * Only the leader or leader of a parent folder can update the leader of children folder
   */
  public async checkUpdateFolderLeader(hierarchyObject: CnHierarchyObject): Promise<void> {
    this.checkHierarchyObject(hierarchyObject);
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

  private checkHierarchyObject(hierarchyObject: CnHierarchyObject): void {
    if (hierarchyObject.visibility === 'TRASH') {
      throw new BlUnauthorizedException('The object is in the trash, please restore it before using it');
    }
  }

  private getSecurityService(): CnFoldersAggregateSecurityI {
    const authContext = CnCurrentUserHelper.getAndCheckAuthContext();

    if (authContext.type === 'labToken') {
      return new CnFoldersSecurityLabAccessToken(authContext, this.hierarchyObjectService);
    } else if (
      authContext.type === 'user' ||
      authContext.type === 'labProd' ||
      authContext.type === 'labDev'
    ) {
      return new CnFoldersSecurityUser(
        authContext.userInfo,
        this.hierarchyObjectService,
        this.folderUserService
      );
    }

    throw new BlUnauthorizedException();
  }
}
