import {Injectable} from '@nestjs/common';
import {CnStats} from './cn-stats.class';
import {CnLabInstancesService} from '../cn-lab-instances/cn-lab-instances.service';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnProjectsService} from '../cn-projects-aggregate/cn-projects/cn-projects.service';
import {CnExperimentsService} from '../cn-projects-aggregate/cn-experiments/cn-experiments.service';
import {CnReportsService} from '../cn-projects-aggregate/cn-reports/cn-reports.service';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';

@Injectable()
export class CnStatsService {
  constructor(private projectService: CnProjectsService,
              private labInstanceService: CnLabInstancesService,
              private groupService: CnGroupsService,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService) {
  }

  public async getStats(): Promise<CnStats>{
    const stats: CnStats = new CnStats();

    const currentUserInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    stats.onGoingProjectNumber = await this.projectService.getOnGoingProjectsNumber();
    stats.teamsNumber = (await this.groupService.getAllTeamsByUserAndSpace(currentUserInfo.userId, currentUserInfo.spaceId)).length;
    stats.runningLabNumber = (await this.labInstanceService.getCurrentRunningLabInstances()).length;
    stats.validatedExperimentNumber = (await this.experimentService.getCurrentUserCreatedExperiment()).length;
    stats.validatedReportNumber = (await this.reportService.getCurrentUserCreatedReport()).length;

    return stats;
  }
}
