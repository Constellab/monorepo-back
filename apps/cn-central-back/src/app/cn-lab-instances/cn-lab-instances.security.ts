import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUserOrgaInfo} from '../cn-users/cn-user.dto';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnGroupsAggregateService} from '../cn-groups/cn-groups-aggregate.service';
import {CnLabInstanceUserService} from './cn-lab-instance-user.service';
import {CnLabInstanceUserRole} from './cn-lab-instance-user.entity';


@Injectable()
export class CnLabInstancesSecurity {

  constructor(private groupAggregateService: CnGroupsAggregateService,
              private labInstanceGroupService: CnLabInstanceUserService) {
  }

  public checkAuthorizationToCreate(userInfo: CnUserOrgaInfo): void {
    if (!userInfo.isAdmin()) throw new UnauthorizedException();
  }

  /**
   * Authorization to update lab instance properties. Only G admin.
   * @param labInstance
   * @param userInfo
   */
  public checkAuthorizationToUpdate(labInstance: CnLabInstance, userInfo: CnUserOrgaInfo): void {
    if (!userInfo.isAdmin()) throw new UnauthorizedException();
  }

  /**
   * Authorization to start/stop, update and manage lab users.
   * The user needs to be an owner of the lab instance
   */
  public async checkAuthorizationToManageLab(labInstance: CnLabInstance, userInfo: CnUserOrgaInfo): Promise<CnLabInstanceUserRole> {
    // check the organization context
    if (labInstance.organizationId !== userInfo.organizationId) throw new UnauthorizedException();

    // organization admin is considered as owner
    if (userInfo.isOrganizationAdmin()) return CnLabInstanceUserRole.OWNER;

    const group = await this.labInstanceGroupService.findByLabInstanceIdAndUserId(labInstance.id, userInfo.userId);
    // check if the user is the owner of the lab instance
    if (group == null || group.role !== CnLabInstanceUserRole.OWNER) {
      throw new UnauthorizedException();
    }

    return group.role;
  }


  public async checkAuthorizationToFindById(labInstance: CnLabInstance, userInfo: CnUserOrgaInfo): Promise<CnLabInstanceUserRole> {
    // check the organization context
    if (labInstance.organizationId !== userInfo.organizationId) throw new UnauthorizedException();

    // organization admin is considered as owner
    if (userInfo.isOrganizationAdmin()) return CnLabInstanceUserRole.OWNER;

    const group = await this.labInstanceGroupService.findByLabInstanceIdAndUserId(labInstance.id, userInfo.userId);

    // check if the user is a member of one of the groups that were shared with the project
    if (group == null) {
      throw new UnauthorizedException();
    }

    return group.role;
  }

  public checkAuthorizationToFindAll(userInfo: CnUserOrgaInfo): void {
    if (!userInfo.isAdmin()) throw new UnauthorizedException();
  }

  public checkAuthorizationToFindAllByOrganization(userInfo: CnUserOrgaInfo): void {
    if (!userInfo.isOrganizationAdmin()) throw new UnauthorizedException();
  }

}
