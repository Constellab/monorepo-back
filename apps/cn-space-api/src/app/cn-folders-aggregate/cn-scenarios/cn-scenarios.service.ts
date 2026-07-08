import { BlAbstractService, BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnLabConfigsService } from '../../cn-lab-configs/cn-lab-configs.service';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
  CnHierarchyObjectVisibility,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnProtocolMigrator } from './cn-protocol-migrator.class';
import { CnCreateLabScenarioDto, CnSaveScenarioResultDTO } from './cn-scenario.dto';
import {
  CnScenario,
  CnScenarioEntity,
  CnScenarioWithHierarchy,
  CnScenarioWithLab,
  CnScenarioWithNotes,
} from './cn-scenario.entity';
import { CnScenarioProtocol } from './cn-scenario-protocol.class';

@Injectable()
export class CnScenariosService extends BlAbstractService<CnScenarioEntity> {
  constructor(
    @InjectRepository(CnScenarioEntity) private repository: Repository<CnScenarioEntity>,
    private labConfigService: CnLabConfigsService
  ) {
    super(repository, CnScenarioEntity);
  }

  getScenariosByRootFolderAndLab(rootFolderId: string, labId: string): Promise<CnScenario[]> {
    return this.repository.find({
      where: [
        // find by folder parent root id (if scenario is link to leaf folder)
        {
          hierarchyRepresentation: {
            rootParentId: rootFolderId,
          },
          lab: {
            id: labId,
          },
        },
        // find by folder (if scenario is linked to root folder)
        {
          hierarchyRepresentation: {
            parentId: rootFolderId,
          },
          lab: {
            id: labId,
          },
        },
      ],
    });
  }

  public async saveLabScenario(
    parentFolder: CnHierarchyObject,
    createLabScenarioDto: CnCreateLabScenarioDto
  ): Promise<CnSaveScenarioResultDTO> {
    const scenarioDB = await this.findScenarioWithHierarchyById(createLabScenarioDto.scenario.id);
    if (scenarioDB && scenarioDB.hierarchyRepresentation.parentId !== parentFolder.id) {
      throw new BlUnauthorizedException("Can't change the folder of a synced scenario");
    }

    const labConfig = await this.labConfigService.getOrCreateLabConfig(createLabScenarioDto.lab_config);

    const labScenarioDto = createLabScenarioDto.scenario;
    const scenario = new CnScenarioEntity();

    scenario.id = labScenarioDto.id;
    scenario.title = labScenarioDto.title;
    scenario.description = labScenarioDto.description?.toJson() ?? null;
    scenario.status = labScenarioDto.status;
    scenario.labConfig = labConfig;
    scenario.protocol = this.migrateProtocol(createLabScenarioDto.protocol);

    scenario.createdBy = labScenarioDto.created_by;
    scenario.createdAt = labScenarioDto.created_at;

    scenario.lastModifiedBy = labScenarioDto.last_modified_by;
    scenario.lastModifiedAt = labScenarioDto.last_modified_at;

    // handle validated
    scenario.isValidated = labScenarioDto.is_validated;
    scenario.validatedAt = labScenarioDto.validated_at;
    scenario.validatedBy = labScenarioDto.validated_by;

    // handle last_sync
    if (labScenarioDto.last_sync_at == null || labScenarioDto.last_sync_by == null) {
      throw new BlBadRequestException('The scenario is missing last sync information');
    }
    scenario.lastSyncAt = labScenarioDto.last_sync_at;
    scenario.lastSyncBy = labScenarioDto.last_sync_by;

    // if this is a creation
    if (!scenarioDB) {
      scenario.hierarchyRepresentation = CnHierarchyObjectEntity.newSubHierarchyObject(
        parentFolder,
        scenario.getHierarchyObjectInfo()
      );
      // also set the id of the folder hierarchy because it should be the same as the scenario id
      scenario.hierarchyRepresentation.id = labScenarioDto.id;
    }

    if (scenarioDB) {
      const exp = await this.updateWithCompare(scenario, scenarioDB as CnScenarioEntity);
      return { scenario: exp, mode: 'update' };
    } else {
      scenario.lab = CnCurrentUserHelper.getAndCheckCurrentLab();
      const exp = await this.create(scenario);
      return { scenario: exp, mode: 'create' };
    }
  }

  public async deleteScenario(scenario: CnScenario, entityManager: EntityManager): Promise<void> {
    if (scenario.isValidated) {
      throw new BlBadRequestException("Can't delete a validated scenario");
    }
    await this.deleteById(scenario.id, entityManager);
  }

  findByIdAndCheckWithNotes(id: string): Promise<CnScenarioWithNotes> {
    return this.findByIdAndCheck(id, { notes: true });
  }

  public async getUserAllCreatedScenario(userId: string, spaceId: string): Promise<CnScenario[]> {
    return await this.repository.find({
      where: {
        createdBy: {
          id: userId,
        },
        hierarchyRepresentation: {
          spaceId: spaceId,
        },
      },
      order: {
        lastModifiedAt: 'DESC',
      },
    });
  }

  public async getScenarioLabConfig(scenarioId: string): Promise<CnLabConfig> {
    const scenario = await this.repository.findOne({
      where: { id: scenarioId },
      relations: { labConfig: { brickVersions: { brick: true } } },
    });
    if (scenario == null) {
      throw new BlBadRequestException(`Scenario with id ${scenarioId} not found`);
    }
    return scenario.labConfig;
  }

  public async findScenarioWithHierarchyById(id: string): Promise<CnScenarioWithHierarchy | null> {
    return this.findById(id, { hierarchyRepresentation: true });
  }

  public async findWithLabById(id: string): Promise<CnScenarioWithLab | null> {
    return this.findById(id, { lab: true, hierarchyRepresentation: true });
  }

  public async findWithLabByIdAndCheck(id: string): Promise<CnScenarioWithLab> {
    return this.findByIdAndCheck(id, { lab: true, hierarchyRepresentation: true });
  }

  public migrateProtocol(protocol: CnScenarioProtocol): CnScenarioProtocol {
    const protocolMigrator = new CnProtocolMigrator();
    return protocolMigrator.migrateProtocol(protocol);
  }

  public findByLab(labId: string): Promise<CnScenarioWithHierarchy[]> {
    return this.repository.find({
      where: {
        lab: { id: labId },
        hierarchyRepresentation: {
          visibility: CnHierarchyObjectVisibility.VISIBLE,
        },
      },
      relations: { hierarchyRepresentation: true },
    });
  }
}
