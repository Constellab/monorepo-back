import {Injectable, Logger} from '@nestjs/common';
import {CnExperiment, CnExperimentProtocol} from './cn-experiment.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnCreateLabExperimentDto, CnSaveExperimentResultDTO} from './cn-experiment.dto';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnLabConfigsService} from '../../cn-lab-configs/cn-lab-configs.service';
import {
  BlAbstractService,
  BlBadRequestException,
  BlQuillMigrator,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {CnLabConfig} from '../../cn-lab-configs/cn-lab-config.entity';

@Injectable()
export class CnExperimentsService extends BlAbstractService<CnExperiment> {
  private readonly logger = new Logger(CnExperimentsService.name);

  constructor(@InjectRepository(CnExperiment) private repository: Repository<CnExperiment>,
              private labConfigService: CnLabConfigsService) {
    super(repository, CnExperiment);
  }

  getExperimentsByProject(projectId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        projectId: projectId
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

  getExperimentsByLabInstance(labInstanceId: string): Promise<CnExperiment[]> {
    return this.repository.find({
      where: {
        labInstance: {id: labInstanceId}
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

  public async saveLabExperiment(project: CnProject, createLabExperimentDto: CnCreateLabExperimentDto): Promise<CnSaveExperimentResultDTO> {

    const experimentDB: CnExperiment = await this.findById(createLabExperimentDto.experiment.id);
    if (experimentDB && experimentDB.projectId !== project.id) {
      throw new BlUnauthorizedException('Can\'t change the project of a synced experiment');
    }

    const labConfig = await this.labConfigService.getOrCreateLabConfig(createLabExperimentDto.lab_config);

    const labExperimentDto = createLabExperimentDto.experiment;
    const experiment = new CnExperiment();
    experiment.id = labExperimentDto.id;
    experiment.projectId = project.id;
    experiment.title = labExperimentDto.title;
    experiment.description = BlQuillMigrator.migrateOptional(labExperimentDto.description);
    experiment.status = labExperimentDto.status;
    experiment.labConfig = labConfig;
    experiment.protocol = this.migrateProtocolFromV1ToV2(createLabExperimentDto.protocol);

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
      return {experiment: exp, mode: 'update'};
    } else {
      experiment.labInstance = CnCurrentUserHelper.getCurrentLabInstance();
      const exp = await this.create(experiment);
      return {experiment: exp, mode: 'create'};
    }
  }

  public async deleteExperiment(id: string): Promise<CnExperiment> {
    const experiment = await this.findById(id);

    // no error if experiment not found for more resilience
    if (!experiment) {
      return null;
    }

    if (experiment.isValidated) {
      throw new BlBadRequestException('Can\'t delete a validated experiment');
    }
    await this.deleteById(id);
    return experiment;
  }

  findByIdAndCheckWithReports(id: string): Promise<CnExperiment> {
    return this.findByIdAndCheck(id, {reports: true});
  }


  public async getCurrentUserCreatedExperiment(): Promise<CnExperiment[]> {
    const userInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    return await this.repository.find({
      where: {
        createdBy: {
          id: userInfo.userId
        },
        project: {
          spaceId: userInfo.spaceId
        }
      },
      order: {
        lastModifiedAt: 'DESC' as any
      },
      relations: ['project'],

    });
  }

  //Get user last 3 experiments
  public async getCurrentUserLastExperiments(): Promise<CnExperiment[]> {
    return (await this.getCurrentUserCreatedExperiment()).slice(0, 3);
  }

  public async getExperimentLabConfig(experimentId: string): Promise<CnLabConfig> {
    return (await this.repository.findOne({
      where: {id: experimentId},
      relations: {labConfig: {brickVersions: {brick: true}}},
    })).labConfig;
  }

  public findAll(): Promise<CnExperiment[]> {
    return this.repository.find();
  }

  public async migrateAllProtocolsFromV1ToV2(): Promise<void> {
    this.logger.log('[START] Migrating all protocols from V1 to V2');

    const experiments = await this.repository.find();

    for (const experiment of experiments) {
      experiment.protocol = this.migrateProtocolFromV1ToV2(experiment.protocol);
      await this.repository.save(experiment);
    }

    this.logger.log('[END] Migrating all protocols from V1 to V2');
  }

  // to keep until all labs are V 0.7.5 or higher
  public migrateProtocolFromV1ToV2(protocol: CnExperimentProtocol): CnExperimentProtocol {
    if (protocol.version >= 2) {
      return protocol;
    }

    return this.migrateProcessFromV1ToV2Recur(protocol.data);
  }

  private migrateProcessFromV1ToV2Recur(protocol: any): any {
    for (const key in protocol.nodes) {
      const process = protocol.graph.nodes[key];
      if (!process.name) {
        process.name = process.human_name;
      }

      process.process_type = {
        human_name: process.human_name,
        short_description: process.short_description
      };

      delete process.human_name;
      delete process.short_description;

      if (process.graph && process.graph.nodes) {
        this.migrateProcessFromV1ToV2Recur(process.graph);
      }
    }

    return process;
  }
}
