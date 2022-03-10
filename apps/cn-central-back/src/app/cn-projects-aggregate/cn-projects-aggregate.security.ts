import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnGroupsService} from '../cn-groups/cn-groups.service';


@Injectable()
export class CnProjectsAggregateSecurity {

  constructor(private groupsService: CnGroupsService) {
  }


  public async checkFindOne(project: CnProject, user: CnUser): Promise<void> {
    const groupIds = await this.groupsService.getGroupIdsFromUser(user);

    if (!project.isSharedToGroup(groupIds)) {
      throw new UnauthorizedException();
    }
  }

  public async checkUpdate(project: CnProject, user: CnUser): Promise<void> {
    return this.checkFindOne(project, user);
  }
}
