import { Injectable } from '@nestjs/common';
import { CnStats } from './cn-stats.class';
import { CnLabInstancesService } from '../cn-lab-instances/cn-lab-instances.service';
import { CnGroupsService } from '../cn-groups/cn-groups.service';
import { CnExperimentsService } from '../cn-projects-aggregate/cn-experiments/cn-experiments.service';
import { CnReportsService } from '../cn-projects-aggregate/cn-reports/cn-reports.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnFolderHierarchyService } from '../cn-projects-aggregate/cn-folder-hierarchies/cn-folder-hierarchy.service';

@Injectable()
export class CnStatsService {
  constructor(private folderService: CnFolderHierarchyService,
              private labInstanceService: CnLabInstancesService,
              private groupService: CnGroupsService,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService) {
  }

  public async getStats(): Promise<CnStats> {
    const stats: CnStats = new CnStats();

    const currentUserInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    const rootFolders = await this.folderService.getRootFoldersOfUser(currentUserInfo.userId, currentUserInfo.spaceId, 0, 1);
    stats.onGoingProjectNumber = rootFolders.totalElements;
    stats.teamsNumber = (await this.groupService.getAllTeamsByUserAndSpace(currentUserInfo.userId, currentUserInfo.spaceId)).length;
    stats.runningLabNumber = (await this.labInstanceService.getCurrentRunningLabInstances()).length;
    stats.validatedExperimentNumber = (await this.experimentService.getCurrentUserCreatedExperiment()).length;
    stats.validatedReportNumber = (await this.reportService.getCurrentUserCreatedReport()).length;

    return stats;
  }
}
