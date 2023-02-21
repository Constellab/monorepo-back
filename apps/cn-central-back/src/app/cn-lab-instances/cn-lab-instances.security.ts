import {Injectable} from '@nestjs/common';
import {CnUserSpaceInfo} from '../cn-users/cn-user-space-info.dto';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnGroupsAggregateService} from '../cn-groups/cn-groups-aggregate.service';
import {CnLabInstanceUserService} from './user/cn-lab-instance-user.service';
import {CnLabInstanceUserRole} from './user/cn-lab-instance-user.entity';
import {BlUnauthorizedException} from '@monorepo/back-core-lib';


@Injectable()
export class CnLabInstancesSecurity {

  constructor(private groupAggregateService: CnGroupsAggregateService,
              private labInstanceGroupService: CnLabInstanceUserService) {
  }

  public checkAuthorizationToCreateAdmin(labInstance: CnLabInstance, userInfo: CnUserSpaceInfo): void {
    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * Authorization to update lab instance properties. Only G admin.
   * @param labInstance
   * @param userInfo
   */
  public checkAuthorizationToUpdateAdmin(labInstance: CnLabInstance, userInfo: CnUserSpaceInfo): void {
    if (!userInfo.isAdmin()) throw new BlUnauthorizedException();
  }

  /**
   * Anyone can create an on premise  lab instance
   * @param labInstance
   */
  public checkAuthorizationCreateOnPremiseLabInstance(labInstance: CnLabInstance): void {
    if (!labInstance.isOnPremise()) throw new BlUnauthorizedException();
  }

  /**
   * Authorization to start/stop, update and manage lab users.
   * The user needs to be an owner of the lab instance
   */
  public async checkAuthorizationToManageLab(labInstance: CnLabInstance, userInfo: CnUserSpaceInfo): Promise<CnLabInstanceUserRole> {
    // check the space context
    if (labInstance.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    // space admin is considered as owner
    if (userInfo.isSpaceAdmin()) return CnLabInstanceUserRole.OWNER;

    const group = await this.labInstanceGroupService.findByLabInstanceIdAndUserId(labInstance.id, userInfo.userId);
    // check if the user is the owner of the lab instance
    if (group == null || group.role !== CnLabInstanceUserRole.OWNER) {
      throw new BlUnauthorizedException();
    }

    return group.role;
  }


  public async checkAuthorizationToFindById(labInstance: CnLabInstance, userInfo: CnUserSpaceInfo): Promise<CnLabInstanceUserRole> {
    // check the space context
    if (labInstance.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    // space admin is considered as owner
    if (userInfo.isSpaceAdmin()) return CnLabInstanceUserRole.OWNER;

    const group = await this.labInstanceGroupService.findByLabInstanceIdAndUserId(labInstance.id, userInfo.userId);

    // check if the user is a member of one of the groups that were shared with the project
    if (group == null) {
      throw new BlUnauthorizedException();
    }

    return group.role;
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

}
