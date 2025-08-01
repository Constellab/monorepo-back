import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnRootFolderUserRole, CnRootFolderUserRoleObj } from '../cn-folder-user/cn-folder-user.entity';
import { CnFolderUserService } from '../cn-folder-user/cn-folder-user.service';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from '../cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnFoldersSecurityHierarchyObjectToken } from './cn-folders-security-hierarchy-object-token';
import { CnFoldersSecurityLabAccessToken } from './cn-folders-security-lab-access-token';
import { CnFoldersSecurityUser } from './cn-folders-security-user';

export interface CnFoldersAggregateSecurityI {
  getRoleForObject(hierarchyObject: CnHierarchyObject): Promise<CnRootFolderUserRole>;

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

  public async getAndCheckAuthorizationForFindOne(hierarchyObjectId: string): Promise<CnHierarchyObject> {
    const hierarchyObject = await this.hierarchyObjectService.findByIdAndCheck(hierarchyObjectId);

    this.checkHierarchyObject(hierarchyObject);

    await this.checkRole(hierarchyObject, CnRootFolderUserRole.VIEWER);
    return hierarchyObject;
  }

  /**
   * Check the authorization to update a hierarchy object
   * @param hierarchyObjectId
   * @param allowObjectInTrash if true, the object can be in trash
   */
  public async getAndCheckAuthorizationForUpdate(
    hierarchyObjectId: string,
    allowObjectInTrash: boolean = false
  ): Promise<CnHierarchyObject> {
    const hierarchyObject = await this.hierarchyObjectService.findByIdAndCheck(hierarchyObjectId);
    if (!allowObjectInTrash) {
      this.checkHierarchyObject(hierarchyObject);
    }

    await this.checkRole(hierarchyObject, CnRootFolderUserRole.USER);
    return hierarchyObject;
  }

  public async getAndCheckAuthorizationForOwner(hierarchyObjectId: string): Promise<CnHierarchyObject> {
    const hierarchyObject = await this.hierarchyObjectService.findByIdAndCheck(hierarchyObjectId);
    this.checkHierarchyObject(hierarchyObject);

    await this.checkRole(hierarchyObject, CnRootFolderUserRole.OWNER);
    return hierarchyObject;
  }

  private async checkRole(hierarchyObject: CnHierarchyObject, role: CnRootFolderUserRole): Promise<void> {
    const userRole = await this.getRoleForObject(hierarchyObject);

    if (new CnRootFolderUserRoleObj(userRole).isLowerThan(role)) {
      throw new BlUnauthorizedException(CnErrorText.FOLDER_ROLE_ERROR, { detailArgs: { role: role } });
    }
  }

  public async getRoleForObject(hierarchyObject: CnHierarchyObject): Promise<CnRootFolderUserRole> {
    const securityService = this.getSecurityService();
    return await securityService.getRoleForObject(hierarchyObject);
  }

  ////////////////////////////// CHECKS //////////////////////////////

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
      return new CnFoldersSecurityLabAccessToken(authContext);
    } else if (authContext.type === 'hierarchyObjectToken') {
      return new CnFoldersSecurityHierarchyObjectToken(authContext);
    } else if (
      authContext.type === 'user' ||
      authContext.type === 'labProd' ||
      authContext.type === 'labDev'
    ) {
      return new CnFoldersSecurityUser(authContext.userInfo, this.folderUserService);
    }

    throw new BlUnauthorizedException();
  }
}
