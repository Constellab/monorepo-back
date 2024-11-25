import { Injectable } from '@nestjs/common';
import { CnScenario, CnScenarioProtocol } from './cn-scenario.entity';
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
import { CnLabEntity } from '../../cn-labs/cn-lab.entity';

@Injectable()
export class CnScenariosService extends BlAbstractService<CnScenario> {
  constructor(
    @InjectRepository(CnScenario) private repository: Repository<CnScenario>,
    private labConfigService: CnLabConfigsService
  ) {
    super(repository, CnScenario);
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
    const scenarioDB: CnScenario = await this.findById(createLabScenarioDto.scenario.id, {
      hierarchyRepresentation: true,
    });
    if (scenarioDB && scenarioDB.hierarchyRepresentation.parentId !== parentFolder.id) {
      throw new BlUnauthorizedException("Can't change the folder of a synced scenario");
    }

    const labConfig = await this.labConfigService.getOrCreateLabConfig(createLabScenarioDto.lab_config);

    const labScenarioDto = createLabScenarioDto.scenario;
    const scenario = new CnScenario();

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
      const exp = await this.updateWithCompare(scenario, scenarioDB);
      return { scenario: exp, mode: 'update' };
    } else {
      scenario.lab = CnCurrentUserHelper.getAndCheckCurrentLab() as CnLabEntity;
      const exp = await this.create(scenario);
      return { scenario: exp, mode: 'create' };
    }
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

  findByIdAndCheckWithNotes(id: string): Promise<CnScenario> {
    return this.findByIdAndCheck(id, { notes: true });
  }

  public async getCurrentUserCreatedScenario(): Promise<CnScenario[]> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    return await this.repository.find({
      where: {
        createdBy: {
          id: userInfo.userId,
        },
        hierarchyRepresentation: {
          spaceId: userInfo.spaceId,
        },
      },
      order: {
        lastModifiedAt: 'DESC' as any,
      },
    });
  }

  //Get user last 3 scenarios
  public async getCurrentUserLastScenarios(): Promise<CnScenario[]> {
    return (await this.getCurrentUserCreatedScenario()).slice(0, 3);
  }

  public async getScenarioLabConfig(scenarioId: string): Promise<CnLabConfig> {
    return (
      await this.repository.findOne({
        where: { id: scenarioId },
        relations: { labConfig: { brickVersions: { brick: true } } },
      })
    ).labConfig;
  }

  public migrateProtocol(protocol: CnScenarioProtocol): CnScenarioProtocol {
    const protocolMigrator = new CnProtocolMigrator();
    return protocolMigrator.migrateProtocol(protocol);
  }
}
