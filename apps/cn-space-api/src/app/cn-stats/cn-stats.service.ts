import { Injectable } from '@nestjs/common';
import { CnStats } from './cn-stats.class';
import { CnLabsService } from '../cn-labs/cn-labs.service';
import { CnGroupsService } from '../cn-groups/cn-groups.service';
import { CnScenariosService } from '../cn-folders-aggregate/cn-scenarios/cn-scenarios.service';
import { CnNotesService } from '../cn-folders-aggregate/cn-notes/cn-notes.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnHierarchyObjectService } from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.service';

@Injectable()
export class CnStatsService {
  constructor(
    private folderService: CnHierarchyObjectService,
    private labService: CnLabsService,
    private groupService: CnGroupsService,
    private scenarioService: CnScenariosService,
    private noteService: CnNotesService
  ) {}

  public async getStats(): Promise<CnStats> {
    const stats: CnStats = new CnStats();

    const currentUserInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    const rootFolders = await this.folderService.getRootFoldersOfUser(
      currentUserInfo.userId,
      currentUserInfo.spaceId,
      0,
      1
    );
    stats.onGoingFolderNumber = rootFolders.totalElements;
    stats.teamsNumber = (
      await this.groupService.getAllTeamsByUserAndSpace(currentUserInfo.userId, currentUserInfo.spaceId)
    ).length;
    stats.runningLabNumber = (
      await this.labService.getUserRunningLabs(currentUserInfo.userId, currentUserInfo.spaceId)
    ).length;
    stats.validatedScenarioNumber = (
      await this.scenarioService.getUserAllCreatedScenario(currentUserInfo.userId, currentUserInfo.spaceId)
    ).length;
    stats.validatedNoteNumber = (
      await this.noteService.getUserAllCreatedNotes(currentUserInfo.userId, currentUserInfo.spaceId)
    ).length;

    return stats;
  }
}
