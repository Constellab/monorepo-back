import { Injectable } from '@nestjs/common';
import { CnExperiment, CnExperimentProtocol } from './cn-experiment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CnCreateLabExperimentDto, CnSaveExperimentResultDTO } from './cn-experiment.dto';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnLabConfigsService } from '../../cn-lab-configs/cn-lab-configs.service';
import {
  BlAbstractService,
  BlBadRequestException,
  BlQuillMigrator,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnProtocolMigrator } from './cn-protocol-migrator.class';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
  CnHierarchyObjectType
} from '../cn_hierarchy_objects/cn-hierarchy-object.entity';

@Injectable()
export class CnExperimentsService extends BlAbstractService<CnExperiment> {

  constructor(@InjectRepository(CnExperiment) private repository: Repository<CnExperiment>,
              private labConfigService: CnLabConfigsService) {
    super(repository, CnExperiment);
  }

  getExperimentsByParentFolder(parentFolderId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        hierarchyRepresentation: { parentId: parentFolderId }
      },
      order: { lastModifiedAt: 'DESC' as any }
    });
  }

  getExperimentsByLabInstance(labInstanceId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        labInstance: { id: labInstanceId }
      },
      order: { lastModifiedAt: 'DESC' as any }
    });
  }

  getExperimentsByRootFolderAndLabInstance(rootFolderId: string, labInstanceId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: [
        // find by folder parent root id (if experiment is link to leaf folder)
        {
          hierarchyRepresentation: {
            rootParentId: rootFolderId
          },
          labInstance: {
            id: labInstanceId
          }
        },
        // find by folder (if experiment is linked to root folder)
        {
          hierarchyRepresentation: {
            parentId: rootFolderId
          },
          labInstance: {
            id: labInstanceId
          }
        }]
    });
  }

  public async saveLabExperiment(parentFolder: CnHierarchyObject, createLabExperimentDto: CnCreateLabExperimentDto): Promise<CnSaveExperimentResultDTO> {

    const experimentDB: CnExperiment = await this.findById(createLabExperimentDto.experiment.id, { hierarchyRepresentation: true });
    if (experimentDB && experimentDB.hierarchyRepresentation.parentId !== parentFolder.id) {
      throw new BlUnauthorizedException('Can\'t change the folder of a synced experiment');
    }

    const labConfig = await this.labConfigService.getOrCreateLabConfig(createLabExperimentDto.lab_config);

    const labExperimentDto = createLabExperimentDto.experiment;
    const experiment = new CnExperiment();

    // if this is a creation
    if (!experimentDB) {
      experiment.hierarchyRepresentation = CnHierarchyObjectEntity.newSubHierarchyObject(
        CnHierarchyObjectType.EXPERIMENT, labExperimentDto.title, labExperimentDto.last_modified_by,
        labExperimentDto.last_modified_at, parentFolder
      );
      // also set the id of the folder hierarchy because it should be the same as the experiment id
      experiment.hierarchyRepresentation.id = labExperimentDto.id;
    }

    experiment.id = labExperimentDto.id;
    experiment.title = labExperimentDto.title;
    experiment.description = BlQuillMigrator.migrateOptional(labExperimentDto.description);
    experiment.status = labExperimentDto.status;
    experiment.labConfig = labConfig;
    experiment.protocol = this.migrateProtocol(createLabExperimentDto.protocol);

    experiment.createdBy = labExperimentDto.created_by;
    experiment.createdAt = labExperimentDto.created_at;

    experiment.lastModifiedBy = labExperimentDto.last_modified_by;
    experiment.lastModifiedAt = labExperimentDto.last_modified_at;

    // handle validated
    experiment.isValidated = labExperimentDto.is_validated;
    experiment.validatedAt = labExperimentDto.validated_at;
    experiment.validatedBy = labExperimentDto.validated_by;

    // handle last_sync
    experiment.lastSyncAt = labExperimentDto.last_sync_at;
    experiment.lastSyncBy = labExperimentDto.last_sync_by;

    if (experimentDB) {
      const exp = await this.updateWithCompare(experiment, experimentDB);
      return { experiment: exp, mode: 'update' };
    } else {
      experiment.labInstance = CnCurrentUserHelper.getCurrentLabInstance();
      const exp = await this.create(experiment);
      return { experiment: exp, mode: 'create' };
    }
  }

  public async deleteExperiment(id: string, entityManager: EntityManager): Promise<CnExperiment> {
    const experiment = await this.findById(id);

    // no error if experiment not found for more resilience
    if (!experiment) {
      return null;
    }

    if (experiment.isValidated) {
      throw new BlBadRequestException('Can\'t delete a validated experiment');
    }
    await this.deleteById(id, entityManager);
    return experiment;
  }

  findByIdAndCheckWithReports(id: string): Promise<CnExperiment> {
    return this.findByIdAndCheck(id, { reports: true });
  }


  public async getCurrentUserCreatedExperiment(): Promise<CnExperiment[]> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    return await this.repository.find({
      where: {
        createdBy: {
          id: userInfo.userId
        },
        hierarchyRepresentation: {
          spaceId: userInfo.spaceId
        }
      },
      order: {
        lastModifiedAt: 'DESC' as any
      }
    });
  }

  //Get user last 3 experiments
  public async getCurrentUserLastExperiments(): Promise<CnExperiment[]> {
    return (await this.getCurrentUserCreatedExperiment()).slice(0, 3);
  }

  public async getExperimentLabConfig(experimentId: string): Promise<CnLabConfig> {
    return (await this.repository.findOne({
      where: { id: experimentId },
      relations: { labConfig: { brickVersions: { brick: true } } }
    })).labConfig;
  }

  public migrateProtocol(protocol: CnExperimentProtocol): CnExperimentProtocol {
    const protocolMigrator = new CnProtocolMigrator();
    return protocolMigrator.migrateProtocol(protocol);
  }

}

