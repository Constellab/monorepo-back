import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnGroupTeam } from './cn-group.entity';
import { CnGroupsService } from './cn-groups.service';
import { CnUserTeamService } from './cn-user-team.service';

/**
 * Class to check the user authorization on groups
 */
@Injectable()
export class CnGroupsSecurity {
  constructor(
    private userGroupService: CnUserTeamService,
    private groupService: CnGroupsService
  ) {}

  /**
   * Get the group and check if the user can get it.
   * He can only if he is a member of the space and is not a visitor.
   */
  public async getAndCheckAuthorizationToGetTeam(
    userInfo: CnUserSpaceInfo,
    teamId: string
  ): Promise<CnGroupTeam> {
    const team = await this.groupService.getAndCheckTeamById(teamId);
    this.checkAuthorizationToGetTeam(userInfo, team);
    return team;
  }

  public checkAuthorizationToGetTeam(userInfo: CnUserSpaceInfo, team: CnGroupTeam): void {
    // the user must be a member of the space, not a visitor
    this.checkIsAtLeastSpaceUser(userInfo);
    // check the space context
    if (team.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();
  }

  /**
   * Get the group and check if the user can update it.
   * A space admin can update any team of the space. Otherwise the user must be a
   * member of the space (not a visitor) and be in the team.
   */
  public async getAndCheckAuthorizationToUpdateTeam(
    userInfo: CnUserSpaceInfo,
    teamId: string
  ): Promise<CnGroupTeam> {
    const team = await this.groupService.getAndCheckTeamById(teamId);

    // check the space context
    if (team.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    if (userInfo.isSpaceAdmin()) return team;

    // the user must be a member of the space, not a visitor
    this.checkIsAtLeastSpaceUser(userInfo);

    if (!(await this.userGroupService.userIsInTeam(teamId, userInfo.userId))) {
      throw new BlUnauthorizedException();
    }

    return team;
  }

  /**
   * A space user (not a visitor) can see all the groups of the space
   */
  public checkAuthorizationToFindAllTeamBySpace(userInfo: CnUserSpaceInfo): void {
    this.checkIsAtLeastSpaceUser(userInfo);
  }

  public checkAuthorizationToCreateTeam(userInfo: CnUserSpaceInfo): void {
    if (userInfo.isSpaceViewer()) {
      throw new BlUnauthorizedException(CnErrorText.VISITOR_CANNOT_CREATE_TEAM);
    }
  }

  /**
   * Check that the user is at least a User of the space (a member that is not a viewer)
   */
  private checkIsAtLeastSpaceUser(userInfo: CnUserSpaceInfo): void {
    if (userInfo.space == null || userInfo.isSpaceViewer()) {
      throw new BlUnauthorizedException();
    }
  }
}
