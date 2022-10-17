import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnProjectsService} from './cn-projects/cn-projects.service';
import {CnProjectLevel} from './cn-projects/cn-project-level.enum';


@Injectable()
export class CnProjectsAggregateSecurity {

  constructor(private groupsService: CnGroupsService,
              private projectsService: CnProjectsService) {
  }

  public async checkFindOneAndGetRootProject(project: CnProject, user: CnUser): Promise<CnProject> {
    // the authorization are handle at the projet level
    const rootProject = await this.getRootProject(project);
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
    return this.checkFindOne(project, user);
  }

  private async getRootProject(project: CnProject): Promise<CnProject> {
    if (project.currentLevel === CnProjectLevel.PROJECT) {
      return project;
    }
    return this.projectsService.findWithSharedGroups(project.rootParentId);
  }
}
