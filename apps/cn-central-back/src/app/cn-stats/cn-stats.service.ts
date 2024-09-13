import { Injectable } from '@nestjs/common';
import { CnStats } from './cn-stats.class';
import { CnLabInstancesService } from '../cn-lab-instances/cn-lab-instances.service';
import { CnGroupsService } from '../cn-groups/cn-groups.service';
import { CnExperimentsService } from '../cn-folders-aggregate/cn-experiments/cn-experiments.service';
import { CnReportsService } from '../cn-folders-aggregate/cn-reports/cn-reports.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnHierarchyObjectService } from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.service';

@Injectable()
export class CnStatsService {
  constructor(private folderService: CnHierarchyObjectService,
              private labInstanceService: CnLabInstancesService,
              private groupService: CnGroupsService,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService) {
  }

  public async getStats(): Promise<CnStats> {
    const stats: CnStats = new CnStats();

    const currentUserInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    const rootFolders = await this.folderService.getRootFoldersOfUser(currentUserInfo.userId, currentUserInfo.spaceId, 0, 1);
    stats.onGoingFolderNumber = rootFolders.totalElements;
    stats.teamsNumber = (await this.groupService.getAllTeamsByUserAndSpace(currentUserInfo.userId, currentUserInfo.spaceId)).length;
    stats.runningLabNumber = (await this.labInstanceService.getCurrentRunningLabInstances()).length;
    stats.validatedExperimentNumber = (await this.experimentService.getCurrentUserCreatedExperiment()).length;
    stats.validatedReportNumber = (await this.reportService.getCurrentUserCreatedReport()).length;

    return stats;
  }
}
