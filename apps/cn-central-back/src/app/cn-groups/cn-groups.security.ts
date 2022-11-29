import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUserTeamService} from './cn-user-team.service';
import {CnGroupTeam} from './cn-group.entity';
import {CnGroupsService} from './cn-groups.service';
import {CnUserSpaceInfo} from '../cn-users/cn-user-space-info.dto';

/**
 * Class to check the user authorization on groups
 */
@Injectable()
export class CnGroupsSecurity {

  constructor(private userGroupService: CnUserTeamService,
              private groupService: CnGroupsService) {
  }


  /**
   * Get the group and check if the user can get it.
   * He can only if he is a member of the space
   */
  public async getAndCheckAuthorizationToGetTeam(userInfo: CnUserSpaceInfo, teamId: string): Promise<CnGroupTeam> {
    const team = await this.groupService.getAndCheckTeamById(teamId);

    // check the space context
    if (team.spaceId !== userInfo.spaceId) throw new UnauthorizedException();

    return team;
  }

  /**
   * Get the group and check if the user can update it. He can only if he is an admin or is in group
   */
  public async getAndCheckAuthorizationToUpdateTeam(userInfo: CnUserSpaceInfo, teamId: string): Promise<CnGroupTeam> {
    const team = await this.groupService.getAndCheckTeamById(teamId);

    // check the space context
    if (team.spaceId !== userInfo.spaceId) throw new UnauthorizedException();

    if (userInfo.isSpaceAdmin()) return team;

    if (!(await this.userGroupService.userIsInTeam(teamId, userInfo.userId))) {
      throw new UnauthorizedException();
    }

    return team;  }

  /**
   * A space user can see all the groups of the space
   */
  public checkAuthorizationToFindAllTeamBySpace(userInfo: CnUserSpaceInfo): void {
    if (userInfo.space == null) throw new UnauthorizedException();
    return;
  }
}
