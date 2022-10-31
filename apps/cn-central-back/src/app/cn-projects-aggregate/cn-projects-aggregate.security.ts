import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnProjectsService} from './cn-projects/cn-projects.service';
import {CnOrganization} from '../cn-organizations/cn-organization.entity';


/**
 * Class to check the user authorization on projects
 */
@Injectable()
export class CnProjectsAggregateSecurity {

  constructor(private groupsService: CnGroupsService,
              private projectsService: CnProjectsService) {
  }

  public async checkFindOneAndGetRootProject(project: CnProject, user: CnUser, organization: CnOrganization): Promise<CnProject> {
    if(project.organizationId !== organization.id) {
      throw new UnauthorizedException();
    }

    // the authorization are handle at the projet level
    const rootProject = await this.projectsService.getRootProjectWithSharedGroup(project);
    const groupIds = await this.groupsService.getAllGroupIdsOfUser(user.id, organization.id);

    if (!rootProject.isSharedToGroup(groupIds)) {
      throw new UnauthorizedException();
    }
    return rootProject;
  }


  public async checkFindOne(project: CnProject, user: CnUser, organization: CnOrganization): Promise<void> {
    await this.checkFindOneAndGetRootProject(project, user,organization);
  }

  public async checkUpdate(project: CnProject, user: CnUser, organization: CnOrganization): Promise<void> {
    if (project.leader.id !== user.id && project.organizationId === organization.id) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Only the leader or leader of a parent project can update the leader of children project
   */
  public async checkUpdateProjectLeader(project: CnProject, user: CnUser, organization: CnOrganization): Promise<void> {
    if (project.organizationId !== organization.id) {
      throw new UnauthorizedException();
    }
    const ancestors = await this.projectsService.getAncestors(project);
    for (const ancestor of ancestors) {
      if (ancestor.leader.id === user.id) {
        return;
      }
    }
    throw new UnauthorizedException();
  }
}
