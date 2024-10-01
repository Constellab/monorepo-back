import { Injectable } from '@nestjs/common';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnLab } from './cn-lab.entity';
import { CnLabUserService } from './user/cn-lab-user.service';
import { CnLabUserRole } from './user/cn-lab-user.entity';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';


@Injectable()
export class CnLabsSecurity {

  constructor(private labGroupService: CnLabUserService) {
  }

  public checkAuthorizationToCreateAdmin(lab: CnLab, userInfo: CnUserSpaceInfo): void {
    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * Authorization to update lab properties. Only G admin.
   * @param lab
   * @param userInfo
   */
  public checkAuthorizationToUpdateAdmin(lab: CnLab, userInfo: CnUserSpaceInfo): void {
    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();
  }

  public checkAuthorizationToFindByIdAdmin(userInfo: CnUserSpaceInfo): void {
    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * Anyone can create a desktop  lab
   * @param lab
   */
  public checkAuthorizationCreateDesktopLab(lab: CnLab): void {
    if (!lab.isDesktop()) throw new BlUnauthorizedException();
  }

  /**
   * Authorization to start/stop, update and manage lab users.
   * The user needs to be an owner of the lab
   */
  public async checkAuthorizationToManageLab(lab: CnLab, userInfo: CnUserSpaceInfo): Promise<CnLabUserRole> {
    // check the space context
    if (lab.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    // space admin is considered as owner
    if (userInfo.isSpaceAdmin()) return CnLabUserRole.OWNER;

    const group = await this.labGroupService.findByLabIdAndUserId(lab.id, userInfo.userId);
    // check if the user is the owner of the lab
    if (group == null || group.role !== CnLabUserRole.OWNER) {
      throw new BlUnauthorizedException();
    }

    return group.role;
  }

  public async checkAuthorizationToFindById(lab: CnLab, userInfo: CnUserSpaceInfo): Promise<CnLabUserRole> {
    // check the space context
    if (lab.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    // space admin is considered as owner
    if (userInfo.isSpaceAdmin()) return CnLabUserRole.OWNER;

    // check if the user has access to the lab
    const labUser = await this.labGroupService.findByLabIdAndUserId(lab.id, userInfo.userId);
    if (labUser == null) {
      throw new BlUnauthorizedException(CnErrorText.USER_NOT_IN_LAB);
    }

    return labUser.role;
  }

  public checkAuthorizationToFindAll(userInfo: CnUserSpaceInfo): void {
    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();
  }

  public checkAuthorizationToFindAllBySpace(userInfo: CnUserSpaceInfo): void {
    if (!userInfo.isSpaceAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * For now, only the G admin can call update method on cloud provider (like create server, volume, dns)
   * @param userInfo
   */
  public checkAuthorizationToDeleteServer(userInfo: CnUserSpaceInfo): void {
    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();
  }

  public checkAuthorizationToRestoreBackup(userInfo: CnUserSpaceInfo): void {
    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();
  }

}
