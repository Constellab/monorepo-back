import {Injectable} from '@nestjs/common';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnProjectsService} from './cn-projects/cn-projects.service';
import {CnUserSpaceInfo} from '../cn-users/cn-user.dto';
import {CnGroupsAggregateService} from '../cn-groups/cn-groups-aggregate.service';
import {BlUnauthorizedException} from '@monorepo/back-core-lib';


/**
 * Class to check the user authorization on projects
 */
@Injectable()
export class CnProjectsAggregateSecurity {

  constructor(private groupAggregateService: CnGroupsAggregateService,
              private projectsService: CnProjectsService) {
  }

  public async checkFindOneAndGetRootProject(project: CnProject, userInfo: CnUserSpaceInfo): Promise<CnProject> {
    // check the space context
    if (project.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    // the authorization are handle at the projet level
    const rootProject = await this.projectsService.getRootProjectWithSharedGroup(project);

    if (userInfo.isSpaceAdmin()) return rootProject;

    // enable always the leader to have access to the project
    if(rootProject.leader.id === userInfo.userId) return rootProject;

    // check if the user is a member of one of the groups that were shared with the project
    if (!await this.groupAggregateService.userIsInAnyGroup(userInfo.userId, rootProject.getSharedGroupIds())) {
      throw new BlUnauthorizedException();
    }

    return rootProject;
  }


  public async checkFindOne(project: CnProject, userInfo: CnUserSpaceInfo): Promise<void> {
    await this.checkFindOneAndGetRootProject(project, userInfo);
  }

  public async checkUpdate(project: CnProject, userInfo: CnUserSpaceInfo): Promise<void> {
    // check the space context
    if (project.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    if (userInfo.isSpaceAdmin()) return;

    if (project.leader.id !== userInfo.userId) {
      throw new BlUnauthorizedException();
    }
  }

  /**
   * Only the leader or leader of a parent project can update the leader of children project
   */
  public async checkUpdateProjectLeader(project: CnProject, userInfo: CnUserSpaceInfo): Promise<void> {
    // check the space context
    if (project.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException();

    if (userInfo.isSpaceAdmin()) return;

    const ancestors = await this.projectsService.getAncestors(project);
    for (const ancestor of ancestors) {
      if (ancestor.leader.id === userInfo.userId) {
        return;
      }
    }
    throw new BlUnauthorizedException();
  }

  public async checkFindAllBySpace(userInfo: CnUserSpaceInfo): Promise<void> {
    // check the space context
    if (!userInfo.isSpaceAdmin()) throw new BlUnauthorizedException();
  }
}
