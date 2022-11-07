import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUserTeamService} from './cn-user-team.service';
import {CnGroupTeam} from './cn-group.entity';
import {CnGroupsService} from './cn-groups.service';
import {CnUserOrgaInfo} from '../cn-users/cn-user.dto';

/**
 * Class to check the user authorization on groups
 */
@Injectable()
export class CnGroupsSecurity {

  constructor(private userGroupService: CnUserTeamService,
              private groupService: CnGroupsService) {
  }


  /**
   * Get the group and check if the user can get it. He can only if he is an admin or is in group
   */
  public async getAndCheckAuthorizationToGetTeam(userInfo: CnUserOrgaInfo, teamId: string): Promise<CnGroupTeam> {
    const team = await this.groupService.getAndCheckTeamById(teamId);

    // check the organization context
    if (team.organizationId !== userInfo.organizationId) throw new UnauthorizedException();

    if (userInfo.isOrganizationAdmin()) return team;

    if (!(await this.userGroupService.userIsInTeam(teamId, userInfo.userId))) {
      throw new UnauthorizedException();
    }

    return team;
  }

  /**
   * Get the group and check if the user can update it. He can only if he is an admin or is in group
   */
  public async getAndCheckAuthorizationToUpdateTeam(userInfo: CnUserOrgaInfo, team: string): Promise<CnGroupTeam> {
    return await this.getAndCheckAuthorizationToGetTeam(userInfo, team);
  }

  public checkAuthorizationToFindALlTeamByOrganization(userInfo: CnUserOrgaInfo): void {
    if (!userInfo.isOrganizationAdmin()) {
      throw new UnauthorizedException();
    }
  }
}
