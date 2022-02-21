import {BadRequestException, Injectable} from '@nestjs/common';
import {
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabManagerConfigDTO,
  CnLabManagerInitConfig,
  CnLabManagerStatus,
  CnLabManagerUpdateConfigDTO
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnExternalLabManagerApiService} from '../cn-external-lab-api/cn-external-lab-manager-api.service';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnBricksService} from '../cn-bricks/cn-bricks.service';

/**
 * Service to call the api of the lab manager
 */
@Injectable()
export class CnLabManagerService {


  constructor(private labManagerApiService: CnExternalLabManagerApiService,
              private brickService: CnBricksService) {
  }

  public async healthCheck(labManagerUrl: string): Promise<boolean> {
    return this.labManagerApiService.healthCheck(labManagerUrl);
  }

  public async getLabStatus(labInstance: CnLabInstance): Promise<CnLabManagerStatus> {
    try {
      await this.healthCheck(labInstance.getLabManagerApiInfo().apiUrl);
    } catch (e) {
      throw new BadRequestException('The lab manager is not running');
    }

    return this.labManagerApiService.getStatus(labInstance.getLabManagerApiInfo());
  }

  public async listContainers(labInstance: CnLabInstance): Promise<CnLabDockerPs[]> {
    return this.labManagerApiService.listContainers(labInstance.getLabManagerApiInfo());
  }

  public async getLogs(labInstance: CnLabInstance, containerName: string): Promise<string> {
    return this.labManagerApiService.getLogs(labInstance.getLabManagerApiInfo(), containerName);
  }

  public async initAll(labInstance: CnLabInstance): Promise<void> {
    // send the keys to configure the lab manager
    const initConfig: CnLabManagerInitConfig = {
      centralApiKey: labInstance.glabApiKey,
      codelabToken: labInstance.codelabToken
    };
    return this.labManagerApiService.initAll(labInstance.getLabManagerApiInfo(), initConfig);
  }

  public async upContainers(labInstance: CnLabInstance, options?: CnLabComposeUpOptions): Promise<void> {
    return this.labManagerApiService.upContainers(labInstance.getLabManagerApiInfo(), options);
  }

  public async restartContainers(labInstance: CnLabInstance, options?: CnLabComposeUpOptions): Promise<void> {
    return this.labManagerApiService.restartContainers(labInstance.getLabManagerApiInfo(), options);
  }

  public async downContainers(labInstance: CnLabInstance): Promise<void> {
    return this.labManagerApiService.downContainers(labInstance.getLabManagerApiInfo());
  }

  public async pullContainers(labInstance: CnLabInstance): Promise<void> {
    return this.labManagerApiService.pullContainers(labInstance.getLabManagerApiInfo());
  }

  public async pullBiota(labInstance: CnLabInstance): Promise<void> {
    return this.labManagerApiService.pullBiota(labInstance.getLabManagerApiInfo());
  }

  public async registryLogin(labInstance: CnLabInstance): Promise<void> {
    return this.labManagerApiService.registryLogin(labInstance.getLabManagerApiInfo());
  }

  public async stopCurrentTask(labInstance: CnLabInstance): Promise<void> {
    return this.labManagerApiService.stopCurrentTask(labInstance.getLabManagerApiInfo());
  }

  public async systemPrune(labInstance: CnLabInstance): Promise<void> {
    return this.labManagerApiService.systemPrune(labInstance.getLabManagerApiInfo());
  }

  public async updateConfig(labInstance: CnLabInstance, config: CnLabManagerUpdateConfigDTO): Promise<void> {
    return this.labManagerApiService.updateConfig(labInstance.getLabManagerApiInfo(), config);
  }

  public async getConfig(labInstance: CnLabInstance): Promise<CnLabManagerConfigDTO> {
    return await this.labManagerApiService.getConfig(labInstance.getLabManagerApiInfo());

    // const labInstanceConfig: CnLabInstanceConfigDTO = {
    //   brickVersions: []
    // };
    // for (const brick of labManagerConfig.bricks) {
    //   const version = await this.brickService.getBrickVersion(brick.name, CmVersion.fromString(brick.version));
    //
    //   if (version == null) {
    //     throw new BadRequestException(`The version '${brick.version}' of the brick '${brick.name}' is not referenced in central`);
    //   }
    //   labInstanceConfig.brickVersions.push(version);
    // }
    //
    // return labInstanceConfig;
  }
}
