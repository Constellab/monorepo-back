import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnExternalLabSyncedObjectDTO } from '../../cn-external-lab-api/model/cn-external-lab-api.class';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnFolderEventService } from '../cn-folder.event';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from '../cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnNotesService } from '../cn-notes/cn-notes.service';
import { CnFoldersSecurityService } from '../cn-security/cn-folders-security.service';
import { CnCreateLabScenarioDto } from './cn-scenario.dto';
import { CnScenario, CnScenarioWithLab } from './cn-scenario.entity';
import { CnScenarioProtocol } from './cn-scenario-protocol.class';
import { CnScenariosService } from './cn-scenarios.service';

@Injectable()
export class CnScenarioAggregateService {
  constructor(
    private scenarioService: CnScenariosService,
    private noteService: CnNotesService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private securityService: CnFoldersSecurityService,
    private eventService: CnFolderEventService,
    private datasource: DataSource
  ) {}

  public async findScenario(id: string): Promise<CnScenario> {
    await this.securityService.getAndCheckAuthorizationForFindOne(id);
    return await this.scenarioService.findByIdAndCheck(id);
  }

  async getScenariosAssociatedToNotes(noteId: string): Promise<CnScenario[]> {
    // check that the user can get the folder
    await this.securityService.getAndCheckAuthorizationForFindOne(noteId);

    return (await this.noteService.findByIdAndCheckWithScenarios(noteId)).scenarios;
  }

  async createLabScenario(
    parentFolderId: string,
    createLabScenarioDto: CnCreateLabScenarioDto
  ): Promise<CnHierarchyObject> {
    // check that the user can get the folder
    const parentFolder = await this.securityService.getAndCheckAuthorizationForUpdate(parentFolderId);

    const result = await this.scenarioService.saveLabScenario(parentFolder, createLabScenarioDto);

    if (result.mode === 'create') {
      this.eventService.emitFolderEvent('CREATE_SCENARIO', parentFolder, result.scenario);
    } else {
      this.eventService.emitFolderEvent('UPDATE_SCENARIO', parentFolder, result.scenario);
    }

    return this.hierarchyObjectService.findByIdAndCheck(result.scenario.id);
  }

  async deleteScenario(scenarioId: string): Promise<boolean> {
    const scenario = await this.scenarioService.findById(scenarioId);
    // no error if scenario not found for more resilience
    if (!scenario) {
      return false;
    }

    // check if the scenario has associated notes
    const expWithNotes = await this.scenarioService.findByIdAndCheckWithNotes(scenarioId);
    if (expWithNotes.notes.length > 0) {
      throw new BlBadRequestException(
        'The scenario has associated notes in the space, please delete the note first.'
      );
    }

    await this.datasource.transaction(async (entityManager) => {
      await this.scenarioService.deleteScenario(scenario, entityManager);
      await this.hierarchyObjectService.deleteById(scenarioId, entityManager);
    });
    return true;
  }

  async findScenarioTechnicalReport(scenarioId: string): Promise<CnScenarioProtocol> {
    return (await this.findScenario(scenarioId)).protocol;
  }

  async findScenarioLabConfig(scenarioId: string): Promise<CnLabConfig> {
    return this.scenarioService.getScenarioLabConfig(scenarioId);
  }

  public async getScenariosByRootFolderAndLabNotSecure(
    rootFolderId: string,
    labId: string
  ): Promise<CnScenario[]> {
    return this.scenarioService.getScenariosByRootFolderAndLab(rootFolderId, labId);
  }

  public async getScenariosOfCurrentLab(): Promise<CnExternalLabSyncedObjectDTO[]> {
    const scenarios = await this.scenarioService.findByLab(CnCurrentUserHelper.getAndCheckCurrentLab().id);
    return scenarios.map((scenario) => {
      return new CnExternalLabSyncedObjectDTO(
        scenario.id,
        scenario.hierarchyRepresentation.parentId,
        scenario.lastSyncAt,
        scenario.lastSyncBy.id
      );
    });
  }

  public async getScenarioSyncLabDTO(scenarioId: string): Promise<CnScenarioWithLab> {
    return this.scenarioService.findWithLabById(scenarioId);
  }
}
