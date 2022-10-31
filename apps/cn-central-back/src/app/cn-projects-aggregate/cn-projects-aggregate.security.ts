import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnProjectsService} from './cn-projects/cn-projects.service';
import {CnUserOrgaInfo} from '../cn-users/cn-user.dto';
import {CnGroupsAggregateService} from '../cn-groups/cn-groups-aggregate.service';


/**
 * Class to check the user authorization on projects
 */
@Injectable()
export class CnProjectsAggregateSecurity {

  constructor(private groupAggregateService: CnGroupsAggregateService,
              private projectsService: CnProjectsService) {
  }

  public async checkFindOneAndGetRootProject(project: CnProject, userInfo: CnUserOrgaInfo): Promise<CnProject> {
    // check the organization context
    if (project.organizationId !== userInfo.organizationId) throw new UnauthorizedException();

    // the authorization are handle at the projet level
    const rootProject = await this.projectsService.getRootProjectWithSharedGroup(project);

    if (userInfo.isOrganizationAdmin()) return rootProject;

    // check if the user is a member of one of the groups that were shared with the project
    if (!await this.groupAggregateService.userIsInAnyGroup(userInfo.userId, rootProject.getSharedGroupIds())) {
      throw new UnauthorizedException();
    }

    return rootProject;
  }


  public async checkFindOne(project: CnProject, userInfo: CnUserOrgaInfo): Promise<void> {
    await this.checkFindOneAndGetRootProject(project, userInfo);
  }

  public async checkUpdate(project: CnProject, userInfo: CnUserOrgaInfo): Promise<void> {
    // check the organization context
    if (project.organizationId !== userInfo.organizationId) throw new UnauthorizedException();

    if (userInfo.isOrganizationAdmin()) return;

    if (project.leader.id !== userInfo.userId) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Only the leader or leader of a parent project can update the leader of children project
   */
  public async checkUpdateProjectLeader(project: CnProject, userInfo: CnUserOrgaInfo): Promise<void> {
    // check the organization context
    if (project.organizationId !== userInfo.organizationId) throw new UnauthorizedException();

    if (userInfo.isOrganizationAdmin()) return;

    const ancestors = await this.projectsService.getAncestors(project);
    for (const ancestor of ancestors) {
      if (ancestor.leader.id === userInfo.userId) {
        return;
      }
    }
    throw new UnauthorizedException();
  }
}
