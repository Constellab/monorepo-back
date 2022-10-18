import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnProjectsService} from './cn-projects/cn-projects.service';


@Injectable()
export class CnProjectsAggregateSecurity {

  constructor(private groupsService: CnGroupsService,
              private projectsService: CnProjectsService) {
  }

  public async checkFindOneAndGetRootProject(project: CnProject, user: CnUser): Promise<CnProject> {
    // the authorization are handle at the projet level
    const rootProject = await this.projectsService.getRootProjectWithSharedGroup(project);
    const groupIds = await this.groupsService.getGroupIdsFromUser(user);

    if (!rootProject.isSharedToGroup(groupIds)) {
      throw new UnauthorizedException();
    }
    return rootProject;
  }


  public async checkFindOne(project: CnProject, user: CnUser): Promise<void> {
    await this.checkFindOneAndGetRootProject(project, user);
  }

  public async checkUpdate(project: CnProject, user: CnUser): Promise<void> {
    if (project.leader.id !== user.id) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Only the leader or leader of a parent project can update the leader of children project
   * @param project
   * @param user
   */
  public async checkUpdateProjectLeader(project: CnProject, user: CnUser): Promise<void> {
    const ancestors = await this.projectsService.getAncestors(project);
    for (const ancestor of ancestors) {
      if (ancestor.leader.id === user.id) {
        return;
      }
    }
    throw new UnauthorizedException();
  }
}
