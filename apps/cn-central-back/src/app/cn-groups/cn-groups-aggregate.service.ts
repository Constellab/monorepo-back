import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnGroup, CnGroupTeam} from './cn-group.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {DeleteResult} from 'typeorm';
import {ClHelpService, ClPageI} from '@monorepo/core-lib';
import {CnUserTeamService} from './cn-user-team.service';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnOrganizationUserService} from '../cn-organizations/cn-organization-user.service';
import {CnGroupsSecurity} from './cn-groups.security';
import {CnGroupsService} from './cn-groups.service';

@Injectable()
export class CnGroupsAggregateService {

  constructor(private groupsService: CnGroupsService,
              private userGroupService: CnUserTeamService,
              private usersService: CnUsersService,
              private organizationUserService: CnOrganizationUserService,
              private groupSecurity: CnGroupsSecurity) {
  }


  ////////////////////////////////////// GROUPS  ////////////////////////////////

  public async createTeam(label: string): Promise<CnGroupTeam> {
    return await this.groupsService.createTeam(label);
  }

  public async updateTeamLabel(id: string, label: string): Promise<CnGroup> {
    const team: CnGroupTeam = await this.getAndCheckCurrentAuthorizationToUpdateTeam(id);
    return this.groupsService.updateTeamLabel(team, label);
  }


  public async deleteTeamById(id: string): Promise<DeleteResult> {
    await this.getAndCheckCurrentAuthorizationToUpdateTeam(id);

    return this.groupsService.deleteById(id);
  }


  public async getCurrentUserAllTeams(): Promise<CnGroup[]> {
    return this.groupsService.getAllTeamsOfUser(CnCurrentUserHelper.getAndCheckCurrentUser().id,
      CnCurrentUserHelper.getCurrentOrganization().id);
  }

  public async getCurrentUserTeams(page: number, size: number): Promise<ClPageI<CnGroup>> {
    return this.groupsService.getTeamsOfUser(CnCurrentUserHelper.getAndCheckCurrentUser().id,
      CnCurrentUserHelper.getCurrentOrganization().id, page, size);
  }

  // method not secured
  public async getAllGroupIdsOfUser(userId: string, organizationId: string): Promise<string[]> {
    return await this.groupsService.getAllGroupIdsOfUser(userId, organizationId);
  }


  /**
   * Return the group if the user can view it
   * @param id
   */
  public async getAndCheckTeamById(id: string): Promise<CnGroupTeam> {
    await this.getAndCheckCurrentAuthorizationToGetTeam(id);

    return this.groupsService.getAndCheckTeamById(id);
  }


  ////////////////////////////////////// GROUP USERS ////////////////////////////////


  /**
   * Add a user to a group. The current user need to be in the group and the added user need to be in the
   * same organization.
   * @param userId
   * @param groupId
   */
  public async addUserToTeam(userId: string, groupId: string): Promise<CnUser> {
    await this.getAndCheckCurrentAuthorizationToUpdateTeam(groupId);

    // check that the added user is in the current organization
    const organization = CnCurrentUserHelper.getAndCheckCurrentOrganization();
    if (!(await this.organizationUserService.userIsOrganizationMember(organization.id, userId))) {
      throw new UnauthorizedException(CnErrorText.USER_NOT_IN_ORGANIZATION);
    }

    await this.userGroupService.addUserToTeam(groupId, userId);
    return this.usersService.findByIdAndCheck(userId);
  }

  public async removeUserFromTeam(userId: string, groupId: string): Promise<void> {
    await this.getAndCheckCurrentAuthorizationToUpdateTeam(groupId);

    await this.userGroupService.removeUserFromTeam(groupId, userId);
  }

  public async getUsersOfTeam(groupId: string, page: number, size: number): Promise<ClPageI<CnUser>> {
    await this.getAndCheckCurrentAuthorizationToGetTeam(groupId);

    return this.userGroupService.getUsersOfTeam(groupId, page, size);
  }

  public async userIsInAnyGroup(userId: string, groupIds: string | string[]): Promise<boolean> {
    // if one of the provided group is the user own group
    const userSingleGroup = await this.groupsService.getUserSingleGroup(userId);
    if (userSingleGroup && groupIds.includes(userSingleGroup.id)) {
      return true;
    }

    groupIds = ClHelpService.convertObjectOrArrayToArray(groupIds);
    return await this.userGroupService.userIsInAnyTeams(groupIds, userId);
  }

  // method not secured
  public async getUsersOfGroupes(groupIds: string[]): Promise<CnUser[]> {
    return await this.groupsService.getUsersOfGroupes(groupIds);
  }


  /////////////////////////////// AUTHORIZATION ///////////////////////////////

  private async getAndCheckCurrentAuthorizationToGetTeam(groupId: string): Promise<CnGroupTeam> {
    return await this.groupSecurity.getAndCheckAuthorizationToGetTeam(CnCurrentUserHelper.getAndCheckCurrentUser(),
      CnCurrentUserHelper.getCurrentOrganization().id, groupId);
  }

  private async getAndCheckCurrentAuthorizationToUpdateTeam(groupId: string): Promise<CnGroupTeam> {
    return await this.groupSecurity.getAndCheckAuthorizationToUpdateTeam(CnCurrentUserHelper.getAndCheckCurrentUser(),
      CnCurrentUserHelper.getCurrentOrganization().id, groupId);
  }
}
