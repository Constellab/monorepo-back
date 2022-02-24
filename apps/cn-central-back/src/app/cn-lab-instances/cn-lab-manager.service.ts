import {BadRequestException, Injectable} from '@nestjs/common';
import {
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabManagerInitConfig,
  CnLabManagerStatus,
  CnLabManagerUpdateConfigDTO
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnExternalLabManagerApiService} from '../cn-external-lab-api/cn-external-lab-manager-api.service';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstanceConfigDTO} from './cn-lab-instance.dto';
import {CnBricksService} from '../cn-bricks/cn-bricks.service';
import {CmVersion} from '@monorepo/common-model';
import {CnBrickGWS} from '../cn-bricks/cn-brick.dto';
import {CnLabFrontVersionsService} from '../cn-lab-front-versions/cn-lab-front-versions.service';

/**
 * Service to call the api of the lab manager
 */
@Injectable()
export class CnLabManagerService {


  constructor(private labManagerApiService: CnExternalLabManagerApiService,
              private brickService: CnBricksService,
              private labFrontService: CnLabFrontVersionsService) {
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

  public async updateConfig(labInstance: CnLabInstance, config: CnLabInstanceConfigDTO): Promise<void> {
    // check if the gws core is in the brick list
    const gwsCore = config.brickVersions.find(brickVersion => brickVersion.name === CnBrickGWS.GWS_CORE);

    if (gwsCore == null) {
      throw new BadRequestException(`The brick '${CnBrickGWS.GWS_CORE}' must be set in the config`);
    }

    // retrieve the lab front version
    const gwsCoreVersion = CmVersion.fromString(gwsCore.version);
    const frontVersion = await this.labFrontService.findByGwsCoreVersion(gwsCoreVersion.major, gwsCoreVersion.minor, gwsCoreVersion.patch);
    if (frontVersion == null) {
      throw new BadRequestException(`The front version does not exists for '${CnBrickGWS.GWS_CORE}' version '${gwsCore.version}'`);
    }

    const labManagerConfig: CnLabManagerUpdateConfigDTO = {
      frontVersion: frontVersion.version.toString(),
      bricks: []
    };

    for (const brick of config.brickVersions) {
      const brickVersion = await this.brickService.getBrickVersionAndCheck(brick.name, CmVersion.fromString(brick.version));

      labManagerConfig.bricks.push({
        name: brickVersion.brick.name,
        version: brickVersion.version.toString(),
        isHidden: brick.isHidden,
        repo: brickVersion.getRepo(),
        commit: brickVersion.commitRef,
        repoType: brickVersion.repoType,
      });
    }

    return this.labManagerApiService.updateConfig(labInstance.getLabManagerApiInfo(), labManagerConfig);
  }

  public async getConfig(labInstance: CnLabInstance): Promise<CnLabInstanceConfigDTO> {
    const labManagerConfig = await this.labManagerApiService.getConfig(labInstance.getLabManagerApiInfo());


    const labInstanceConfig: CnLabInstanceConfigDTO = {
      brickVersions: []
    };
    for (const brick of labManagerConfig.bricks) {
      labInstanceConfig.brickVersions.push({
        name: brick.name,
        version: brick.version,
        isHidden: brick.isHidden
      });
    }

    return labInstanceConfig;
  }
}
