import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUserTeamService} from './cn-user-team.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnGroupTeam} from './cn-group.entity';
import {CnGroupsService} from './cn-groups.service';

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
  public async getAndCheckAuthorizationToGetTeam(user: CnUser, organizationId: string, teamId: string): Promise<CnGroupTeam> {
    const team = await this.groupService.getAndCheckTeamById(teamId);
    if (user.isAdmin()) return team;

    if (team.organizationId !== organizationId) {
      throw new UnauthorizedException();
    }

    if (!(await this.userGroupService.userIsInTeam(teamId, user.id))) {
      throw new UnauthorizedException();
    }

    return team;
  }

  /**
   * Get the group and check if the user can update it. He can only if he is an admin or is in group
   */
  public async getAndCheckAuthorizationToUpdateTeam(user: CnUser, organizationId: string, team: string): Promise<CnGroupTeam> {
    return await this.getAndCheckAuthorizationToGetTeam(user, organizationId, team);
  }

}
