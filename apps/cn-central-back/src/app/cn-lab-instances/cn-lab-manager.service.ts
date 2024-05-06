import {Injectable, Logger} from '@nestjs/common';
import {
  CnLabManagerComposeUpOptions,
  CnLabManagerDockerPs,
  CnLabManagerDockerPsFull,
  CnLabManagerInitConfig,
  CnLabManagerStatus,
  CnManagerLabComposeRestartOptions,
  CnManagerLabPullBiotaOptions
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import {CnExternalLabManagerApiService} from '../cn-external-lab-api/cn-external-lab-manager-api.service';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnLabInstanceConfigDTO} from './cn-lab-instance.dto';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnExternalLabBackupInfoDTO} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnLabConfigFile} from '../cn-lab-configs/cn-lab-config-file.class';
import {CnLabConfigsService} from '../cn-lab-configs/cn-lab-configs.service';
import {CnLabBackupBucket, CnLabBackupHistory} from './backup/cn-lab-backup.dto';

/**
 * Service to call the api of the lab manager
 */
@Injectable()
export class CnLabManagerService {
  private readonly logger = new Logger(CnLabManagerService.name);


  constructor(private labManagerApiService: CnExternalLabManagerApiService,
              private configService: CnCoreConfigService,
              private labConfigService: CnLabConfigsService) {
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

  public getLabManagerRecommendedVersion(): string {
    return this.configService.getLabManagerRecommendedVersion();
  }

  public async listContainers(labInstance: CnLabInstance): Promise<CnLabManagerDockerPs[]> {
    return this.labManagerApiService.listContainers(labInstance.getLabManagerApiInfo());
  }

  public async getContainerDetails(labInstance: CnLabInstance, containerName: string): Promise<CnLabManagerDockerPsFull> {
    return this.labManagerApiService.getContainerDetails(labInstance.getLabManagerApiInfo(), containerName);
  }

  public async getLogs(labInstance: CnLabInstance, containerName: string): Promise<string> {
    return this.labManagerApiService.getLogs(labInstance.getLabManagerApiInfo(), containerName);
  }

  public async initAll(labInstance: CnLabInstance, spaceDomain: string): Promise<void> {
    // send the keys to configure the lab manager
    const initConfig: CnLabManagerInitConfig = {
      centralApiKey: labInstance.glabApiKey,
      codelabToken: labInstance.codelabToken,
      centralApiUrl: this.configService.getApiUrl(),
      centralFrontUrl: `https://${spaceDomain}.${this.configService.getCentralFrontDomain()}`,
      communityFrontUrl: this.configService.getCommunityFrontUrl(),
      communityApiUrl: this.configService.getCommunityApiUrl(),
      communityApiKey: this.configService.getCommunityApiKey(),
      gwsCoreProdPassword: labInstance.gwsCoreProdDbPassword,
      gwsCoreDevPassword: labInstance.gwsCoreDevDbPassword,
      dockerRegistry: {
        url: this.configService.getDockerRegistryUrl(),
        username: this.configService.getDockerRegistryUsername(),
        password: this.configService.getDockerRegistryPassword(),
      },
      // enable the captcha only on constellab standard domain
      captchaSiteKey: labInstance.isConstellabDomain() ? this.configService.getCaptchaSiteKey(): null,
      labConfig: {
        enableBackup: labInstance.isCloud()
      },
      openaiApiKey: this.configService.getOpenaiAPIKey(),
    };
    return this.labManagerApiService.initAll(labInstance.getLabManagerApiInfo(), initConfig);
  }

  public async upContainers(labInstance: CnLabInstance, options?: CnLabManagerComposeUpOptions): Promise<void> {
    return this.labManagerApiService.upContainers(labInstance.getLabManagerApiInfo(), options);
  }

  public async restartContainers(labInstance: CnLabInstance, options?: CnManagerLabComposeRestartOptions): Promise<void> {
    return this.labManagerApiService.restartContainers(labInstance.getLabManagerApiInfo(), options);
  }

  public async downContainers(labInstance: CnLabInstance): Promise<void> {
    return this.labManagerApiService.downContainers(labInstance.getLabManagerApiInfo());
  }

  public async pullContainers(labInstance: CnLabInstance): Promise<void> {
    return this.labManagerApiService.pullContainers(labInstance.getLabManagerApiInfo());
  }

  public async pullBiota(labInstance: CnLabInstance, options: CnManagerLabPullBiotaOptions): Promise<void> {
    return this.labManagerApiService.pullBiota(labInstance.getLabManagerApiInfo(), options);
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
    const configFile: CnLabConfigFile = await this.labConfigService.getLabConfigFile(labInstance, config);

    return this.labManagerApiService.updateConfig(labInstance.getLabManagerApiInfo(), configFile);
  }

  public async getConfig(labInstance: CnLabInstance): Promise<CnLabInstanceConfigDTO> {
    const configFile: CnLabConfigFile = await this.labManagerApiService.getConfig(labInstance.getLabManagerApiInfo());

    return this.labConfigService.configFileToLabInstanceConfig(configFile);
  }

  /**
   * Call health check on the lab manager until the lab is ready
   */
  public async waitForHealthCheck(labManagerUrl: string): Promise<void> {
    // wait for server to reboot
    let count = 0;
    while (count < 15) {

      const result = await this.healthCheck(labManagerUrl);
      if (result) {
        return;
      }

      if (count >= 15) {
        break;
      }

      this.logger.log(`Waiting for lab manager ${labManagerUrl} to be available. Attempt ${count + 1} of 15`);
      // wait 15 seconds
      await new Promise(r => setTimeout(r, 15000));
      count++;
    }

    throw new BlBadRequestException(`Server is not available for lab manager ${labManagerUrl}`);
  }

  /////////////////////////////////////////////// BACKUP /////////////////////////////////////////////////////

  public async createProdBackup(labInstance: CnLabInstance, backup: CnExternalLabBackupInfoDTO): Promise<CnLabBackupBucket[]> {
    return this.labManagerApiService.createProdBackup(labInstance.getLabManagerApiInfo(), backup);
  }

  public async stopCurrentBackup(labInstance: CnLabInstance): Promise<CnLabBackupBucket[]> {
    return this.labManagerApiService.stopCurrentBackup(labInstance.getLabManagerApiInfo());
  }

  public async getBackupHistory(labInstance: CnLabInstance): Promise<CnLabBackupHistory> {
    return this.labManagerApiService.getBackupHistory(labInstance.getLabManagerApiInfo());
  }

  public async getLastBackupsStatus(labInstance: CnLabInstance): Promise<CnLabBackupBucket[]> {
    return this.labManagerApiService.getLastBackupsStatus(labInstance.getLabManagerApiInfo());
  }
}
