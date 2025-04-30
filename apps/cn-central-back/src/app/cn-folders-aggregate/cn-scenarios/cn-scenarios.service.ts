import { Injectable } from '@nestjs/common';
import {
  CnScenario,
  CnScenarioEntity,
  CnScenarioWithHierarchy,
  CnScenarioWithNotes,
} from './cn-scenario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CnCreateLabScenarioDto, CnSaveScenarioResultDTO } from './cn-scenario.dto';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnLabConfigsService } from '../../cn-lab-configs/cn-lab-configs.service';
import { BlAbstractService, BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnProtocolMigrator } from './cn-protocol-migrator.class';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
} from '../cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from '../cn_hierarchy_objects/cn-hierarchy-object.service';
import { CnScenarioProtocol } from './cn-scenario-protocol.class';

@Injectable()
export class CnScenariosService extends BlAbstractService<CnScenarioEntity> {
  constructor(
    @InjectRepository(CnScenarioEntity) private repository: Repository<CnScenarioEntity>,
    private labConfigService: CnLabConfigsService,
    private hierarchyObjectService: CnHierarchyObjectService
  ) {
    super(repository, CnScenarioEntity);
  }

  getScenariosByParentFolder(parentFolderId: string): Promise<CnScenario[]> {
    return this.repository.find({
      where: {
        hierarchyRepresentation: { parentId: parentFolderId },
      },
      order: { lastModifiedAt: 'DESC' as any },
    });
  }

  getScenariosByLab(labId: string): Promise<CnScenario[]> {
    return this.repository.find({
      where: {
        lab: { id: labId },
      },
      order: { lastModifiedAt: 'DESC' as any },
    });
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

  public async updateScenarioFolder(
    scenarioId: string,
    newParentFolder: CnHierarchyObject
  ): Promise<CnScenario> {
    const scenario = await this.findScenarioWithHierarchyById(scenarioId);
    if (!scenario) {
      throw new BlBadRequestException('Scenario not found');
    }

    if (scenario.hierarchyRepresentation.parentId === newParentFolder.id) {
      return scenario;
    }

    await this.hierarchyObjectService.updateLeafParent(scenario.hierarchyRepresentation.id, newParentFolder);

    return this.findByIdAndCheck(scenario.id);
  }

  public async deleteScenario(id: string, entityManager: EntityManager): Promise<CnScenario> {
    const scenario = await this.findById(id);

    // no error if scenario not found for more resilience
    if (!scenario) {
      return null;
    }

    if (scenario.isValidated) {
      throw new BlBadRequestException("Can't delete a validated scenario");
    }
    await this.deleteById(id, entityManager);
    return scenario;
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
        lastModifiedAt: 'DESC' as any,
      },
    });
  }

  public async getScenarioLabConfig(scenarioId: string): Promise<CnLabConfig> {
    return (
      await this.repository.findOne({
        where: { id: scenarioId },
        relations: { labConfig: { brickVersions: { brick: true } } },
      })
    ).labConfig;
  }

  public async findScenarioWithHierarchyById(id: string): Promise<CnScenarioWithHierarchy | null> {
    return this.findById(id, { hierarchyRepresentation: true });
  }

  public migrateProtocol(protocol: CnScenarioProtocol): CnScenarioProtocol {
    const protocolMigrator = new CnProtocolMigrator();
    return protocolMigrator.migrateProtocol(protocol);
  }
}
