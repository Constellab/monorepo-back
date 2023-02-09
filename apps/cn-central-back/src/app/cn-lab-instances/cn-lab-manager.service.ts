import {BadRequestException, Injectable, Logger} from '@nestjs/common';
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
import {CnBrickGWS, CnBrickVersionTechnicalKey} from '../cn-bricks/cn-brick.dto';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnSpace} from '../cn-spaces/cn-space.entity';
import {CnExternalLabBackup, CnExternalLabBackupHistory} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {BlBadRequestException, BlBucketConfig} from '@monorepo/back-core-lib';

/**
 * Service to call the api of the lab manager
 */
@Injectable()
export class CnLabManagerService {
  private readonly logger = new Logger(CnLabManagerService.name);


  constructor(private labManagerApiService: CnExternalLabManagerApiService,
              private brickService: CnBricksService,
              private configService: CnCoreConfigService) {
  }

  public async healthCheck(labManagerUrl: string): Promise<boolean> {
    return this.labManagerApiService.healthCheck(labManagerUrl);
  }

  public async getLabStatus(labInstance: CnLabInstance): Promise<CnLabManagerStatus> {
    const isRunning = await this.healthCheck(labInstance.getLabManagerApiInfo().apiUrl);
    if (!isRunning) {
      throw new BlBadRequestException('The lab manager is not running');
    }

    return this.labManagerApiService.getStatus(labInstance.getLabManagerApiInfo());
  }

  public async listContainers(labInstance: CnLabInstance): Promise<CnLabDockerPs[]> {
    return this.labManagerApiService.listContainers(labInstance.getLabManagerApiInfo());
  }

  public async getLogs(labInstance: CnLabInstance, containerName: string): Promise<string> {
    return this.labManagerApiService.getLogs(labInstance.getLabManagerApiInfo(), containerName);
  }

  public async initAll(labInstance: CnLabInstance, space: CnSpace): Promise<void> {
    // send the keys to configure the lab manager
    const initConfig: CnLabManagerInitConfig = {
      centralApiKey: labInstance.glabApiKey,
      codelabToken: labInstance.codelabToken,
      centralApiUrl: this.configService.getApiUrl(),
      centralFrontUrl: `https://${space.domain}.${this.configService.getCentralFrontDomain()}`,
      hubFrontUrl: this.configService.getHubFrontUrl(),
      gwsCoreProdPassword: labInstance.gwsCoreProdDbPassword,
      gwsCoreDevPassword: labInstance.gwsCoreDevDbPassword,
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

  public async startAdminer(labInstance: CnLabInstance): Promise<boolean> {
    return this.labManagerApiService.startAdminer(labInstance.getLabManagerApiInfo());
  }

  public async stopAdminer(labInstance: CnLabInstance): Promise<boolean> {
    return this.labManagerApiService.stopAdminer(labInstance.getLabManagerApiInfo());
  }

  public async updateConfig(labInstance: CnLabInstance, config: CnLabInstanceConfigDTO): Promise<void> {
    // check if the gws core is in the brick list
    const gwsCore = config.brickVersions.find(brickVersion => brickVersion.name.toLowerCase() === CnBrickGWS.GWS_CORE.toLowerCase());

    if (gwsCore == null) {
      throw new BlBadRequestException(`The brick '${CnBrickGWS.GWS_CORE}' must be set in the config`);
    }

    // retrieve the lab front version
    const gwsCoreVersion = CmVersion.fromString(gwsCore.version);
    // get gws_core version
    const gwsCoreBrickVersion = await this.brickService.getBrickVersion(CnBrickGWS.GWS_CORE, gwsCoreVersion);
    // get the front version from the technical info
    const frontVersion = gwsCoreBrickVersion.technicalInfo[CnBrickVersionTechnicalKey.GWS_CORE_FRONT_VERSION];
    if (frontVersion == null) {
      throw new BlBadRequestException(`The front version does not exists for '${CnBrickGWS.GWS_CORE}' version '${gwsCore.version}'`);
    }

    // get the maria db url
    const gwsBiota = config.brickVersions.find(brickVersion => brickVersion.name.toLowerCase() === CnBrickGWS.GWS_BIOTA.toLowerCase());
    if (gwsBiota == null) {
      throw new BlBadRequestException(`The brick '${CnBrickGWS.GWS_BIOTA}' must be set in the config`);
    }
    // get gws_core version
    const gwsBiotaBrickVersion = await this.brickService.getBrickVersion(CnBrickGWS.GWS_BIOTA,
      CmVersion.fromString(gwsBiota.version));

    const biotaMariaDbUrl = gwsBiotaBrickVersion.technicalInfo[CnBrickVersionTechnicalKey.GWS_BIOTA_MARIA_DB_URL];
    if (biotaMariaDbUrl == null) {
      throw new BlBadRequestException(`The maria db url does not exists for '${CnBrickGWS.GWS_BIOTA}' version '${gwsBiota.version}'`);
    }

    const labManagerConfig: CnLabManagerUpdateConfigDTO = {
      labId: labInstance.id,
      labName: labInstance.name,
      frontVersion: frontVersion,
      glabTag: config.glabTag || 'latest',
      biotaMariaDbUrl: biotaMariaDbUrl,
      bricks: []
    };

    for (const brick of config.brickVersions) {
      const brickVersion = await this.brickService.getBrickVersionAndCheck(brick.name, CmVersion.fromString(brick.version));

      labManagerConfig.bricks.push({
        name: brickVersion.brick.name,
        version: brickVersion.version.toString(),
        isHidden: true, // force all bricks to be hidden
        repo: brickVersion.getRepo(),
        repoType: brickVersion.repoType,
        technicalInfo: brickVersion.technicalInfo
      });
    }

    return this.labManagerApiService.updateConfig(labInstance.getLabManagerApiInfo(), labManagerConfig);
  }

  public async getConfig(labInstance: CnLabInstance): Promise<CnLabInstanceConfigDTO> {
    const labManagerConfig = await this.labManagerApiService.getConfig(labInstance.getLabManagerApiInfo());


    const labInstanceConfig: CnLabInstanceConfigDTO = {
      brickVersions: [],
      glabTag: labManagerConfig.glabTag
    };
    for (const brick of labManagerConfig.bricks) {
      labInstanceConfig.brickVersions.push({
        name: brick.name,
        version: brick.version,
      });
    }

    return labInstanceConfig;
  }

  /**
   * Call health check on the lab manager until the lab is ready
   */
  public async waitForHealthCheck(labManagerUrl: string): Promise<void> {
    // wait for server to reboot
    let count = 0;
    while (count < 10) {

      const result = await this.healthCheck(labManagerUrl);
      if (result) {
        return;
      }

      if (count >= 10) {
        break;
      }

      this.logger.log(`Waiting for server to be available for lab manager ${labManagerUrl}. Attempt ${count + 1} of 10`);
      // wait 10 seconds
      await new Promise(r => setTimeout(r, 10000));
      count++;
    }

    throw new BadRequestException(`Server is not available for lab manager ${labManagerUrl}`);
  }

  /////////////////////////////////////////////// BACKUP /////////////////////////////////////////////////////

  public async createProdBackup(labInstance: CnLabInstance, bucketConfig: BlBucketConfig): Promise<CnExternalLabBackup> {
    return this.labManagerApiService.createProdBackup(labInstance.getLabManagerApiInfo(), bucketConfig);
  }

  public async stopCurrentBackup(labInstance: CnLabInstance): Promise<boolean> {
    return this.labManagerApiService.stopCurrentBackup(labInstance.getLabManagerApiInfo());
  }

  public async getBackupCurrentStatus(labInstance: CnLabInstance): Promise<CnExternalLabBackup> {
    return this.labManagerApiService.getBackupCurrentStatus(labInstance.getLabManagerApiInfo());
  }

  public async getBackupHistory(labInstance: CnLabInstance): Promise<CnExternalLabBackupHistory> {
    return this.labManagerApiService.getBackupHistory(labInstance.getLabManagerApiInfo());
  }
}
