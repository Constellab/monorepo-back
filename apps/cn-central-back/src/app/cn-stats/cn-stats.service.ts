import {Injectable} from '@nestjs/common';
import {CnStats} from './cn-stats.class';
import {CnLabInstancesService} from '../cn-lab-instances/cn-lab-instances.service';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnProjectsService} from '../cn-projects-aggregate/cn-projects/cn-projects.service';
import {CnGroupType} from '../cn-groups/cn-group-type.enum';
import {CnExperimentsService} from '../cn-projects-aggregate/cn-experiments/cn-experiments.service';

@Injectable()
export class CnStatsService {
  constructor(private projectService: CnProjectsService,
              private labInstanceService: CnLabInstancesService,
              private groupService: CnGroupsService,
              private experimentService: CnExperimentsService) {
  }

  public async getStats(): Promise<CnStats>{
    const stats: CnStats = new CnStats();

    stats.onGoingProjectNumber = await this.projectService.getOnGoingProjectsNumber();
    stats.teamsNumber = ((await this.groupService.getCurrentUserAllGroups()).filter(group => group.type == CnGroupType.TEAM)).length;
    stats.runningLabNumber = (await this.labInstanceService.getCurrentRunningLabInstances()).length;

    return stats;
  }
}
