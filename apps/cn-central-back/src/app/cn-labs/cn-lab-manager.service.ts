import { Injectable, Logger } from '@nestjs/common';
import {
  CnLabManagerBackupInfoDTO,
  CnLabManagerComposeUpOptions,
  CnLabManagerDockerPs,
  CnLabManagerDockerPsFull,
  CnLabManagerInitConfig,
  CnLabManagerRestoreBackupDTO,
  CnLabManagerStatus,
  CnManagerLabComposeRestartOptions,
  CnManagerLabPullBiotaOptions
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnExternalLabManagerApiService } from '../cn-external-lab-api/cn-external-lab-manager-api.service';
import { CnLab } from './cn-lab.entity';
import { CnLabConfigDTO } from './cn-lab.dto';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { BlBadRequestException } from '@monorepo/back-core-lib';
import { CnLabConfigFile } from '../cn-lab-configs/cn-lab-config-file.class';
import { CnLabConfigsService } from '../cn-lab-configs/cn-lab-configs.service';
import { CnLabBackupBucket, CnLabBackupsHistory } from './backup/cn-lab-backup.dto';

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

  public async getLabStatus(lab: CnLab): Promise<CnLabManagerStatus> {
    const isRunning = await this.healthCheck(lab.getLabManagerApiInfo().apiUrl);
    if (!isRunning) {
      throw new BlBadRequestException('The lab manager is not running');
    }

    return this.labManagerApiService.getStatus(lab.getLabManagerApiInfo());
  }

  public getLabManagerRecommendedVersion(): string {
    return this.configService.getLabManagerRecommendedVersion();
  }

  public async listContainers(lab: CnLab): Promise<CnLabManagerDockerPs[]> {
    return this.labManagerApiService.listContainers(lab.getLabManagerApiInfo());
  }

  public async getContainerDetails(lab: CnLab, containerName: string): Promise<CnLabManagerDockerPsFull> {
    return this.labManagerApiService.getContainerDetails(lab.getLabManagerApiInfo(), containerName);
  }

  public async startComposeContainer(lab: CnLab, serviceName: string): Promise<void> {
    return this.labManagerApiService.startComposeContainer(lab.getLabManagerApiInfo(), serviceName);
  }

  public async stopContainer(lab: CnLab, containerName: string): Promise<boolean> {
    return this.labManagerApiService.stopContainer(lab.getLabManagerApiInfo(), containerName);
  }

  public async deleteContainer(lab: CnLab, containerName: string): Promise<boolean> {
    return this.labManagerApiService.deleteContainer(lab.getLabManagerApiInfo(), containerName);
  }

  public async getLogs(lab: CnLab, containerName: string): Promise<string> {
    return this.labManagerApiService.getLogs(lab.getLabManagerApiInfo(), containerName);
  }

  public async exportLogs(lab: CnLab, containerName: string): Promise<string> {
    return this.labManagerApiService.exportLogs(lab.getLabManagerApiInfo(), containerName);
  }

  public async initAll(lab: CnLab, spaceDomain: string): Promise<void> {
    const initConfig: CnLabManagerInitConfig = this.getLabManagerInitConfig(lab, spaceDomain);
    return this.labManagerApiService.initAll(lab.getLabManagerApiInfo(), initConfig);
  }

  public configureLabManager(lab: CnLab, spaceDomain: string): Promise<void> {
    const initConfig: CnLabManagerInitConfig = this.getLabManagerInitConfig(lab, spaceDomain);
    return this.labManagerApiService.configureLabManager(lab.getLabManagerApiInfo(), initConfig);
  }

  private getLabManagerInitConfig(lab: CnLab, spaceDomain: string): CnLabManagerInitConfig {
    return {
      centralApiKey: lab.glabApiKey,
      centralApiUrl: this.configService.getApiUrl(),
      centralFrontUrl: `https://${spaceDomain}.${this.configService.getCentralFrontDomain()}`,
      space: {
        apiKey: lab.glabApiKey,
        apiUrl: this.configService.getApiUrl(),
        frontUrl: `https://${spaceDomain}.${this.configService.getCentralFrontDomain()}`
      },
      community: {
        frontUrl: this.configService.getCommunityFrontUrl(),
        apiUrl: this.configService.getCommunityApiUrl(),
        apiKey: this.configService.getCommunityApiKey()
      },
      codelabToken: lab.codelabToken,
      communityFrontUrl: this.configService.getCommunityFrontUrl(),
      communityApiUrl: this.configService.getCommunityApiUrl(),
      communityApiKey: this.configService.getCommunityApiKey(),
      gwsCoreProdPassword: lab.gwsCoreProdDbPassword,
      gwsCoreDevPassword: lab.gwsCoreDevDbPassword,
      dockerRegistry: {
        url: this.configService.getDockerRegistryUrl(),
        username: this.configService.getDockerRegistryUsername(),
        password: this.configService.getDockerRegistryPassword()
      },
      // enable the captcha only on constellab standard domain
      captchaSiteKey: lab.isConstellabDomain() ? this.configService.getCaptchaSiteKey() : null,
      labConfig: {
        enableBackup: lab.isCloud()
      },
      openaiApiKey: this.configService.getOpenaiAPIKey()
    };
  }

  public async upContainers(lab: CnLab, options?: CnLabManagerComposeUpOptions): Promise<void> {
    return this.labManagerApiService.upContainers(lab.getLabManagerApiInfo(), options);
  }

  public async restartContainers(lab: CnLab, options?: CnManagerLabComposeRestartOptions): Promise<void> {
    return this.labManagerApiService.restartContainers(lab.getLabManagerApiInfo(), options);
  }

  public async stopContainers(lab: CnLab): Promise<void> {
    return this.labManagerApiService.stopContainers(lab.getLabManagerApiInfo());
  }

  public async deleteContainers(lab: CnLab): Promise<void> {
    return this.labManagerApiService.deleteContainers(lab.getLabManagerApiInfo());
  }

  public async pullContainers(lab: CnLab): Promise<void> {
    return this.labManagerApiService.pullContainers(lab.getLabManagerApiInfo());
  }

  public async pullBiota(lab: CnLab, options: CnManagerLabPullBiotaOptions): Promise<void> {
    return this.labManagerApiService.pullBiota(lab.getLabManagerApiInfo(), options);
  }

  public async stopCurrentTask(lab: CnLab): Promise<void> {
    return this.labManagerApiService.stopCurrentTask(lab.getLabManagerApiInfo());
  }

  public async systemPrune(lab: CnLab): Promise<void> {
    return this.labManagerApiService.systemPrune(lab.getLabManagerApiInfo());
  }

  public async startAdminer(lab: CnLab): Promise<boolean> {
    return this.labManagerApiService.startAdminer(lab.getLabManagerApiInfo());
  }

  public async stopAdminer(lab: CnLab): Promise<boolean> {
    return this.labManagerApiService.stopAdminer(lab.getLabManagerApiInfo());
  }

  public async updateConfig(lab: CnLab, config: CnLabConfigDTO): Promise<void> {
    const configFile: CnLabConfigFile = await this.labConfigService.getLabConfigFile(lab, config);

    return this.labManagerApiService.updateConfig(lab.getLabManagerApiInfo(), configFile);
  }

  public async getConfig(lab: CnLab): Promise<CnLabConfigDTO> {
    const configFile: CnLabConfigFile = await this.labManagerApiService.getConfig(lab.getLabManagerApiInfo());

    return this.labConfigService.configFileToLabConfig(configFile);
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

  public async createProdBackup(lab: CnLab, backup: CnLabManagerBackupInfoDTO): Promise<CnLabBackupBucket[]> {
    return this.labManagerApiService.createProdBackup(lab.getLabManagerApiInfo(), backup);
  }

  public async stopCurrentBackup(lab: CnLab): Promise<CnLabBackupBucket[]> {
    return this.labManagerApiService.stopCurrentBackup(lab.getLabManagerApiInfo());
  }

  public async getBackupHistory(lab: CnLab): Promise<CnLabBackupsHistory> {
    return this.labManagerApiService.getBackupHistory(lab.getLabManagerApiInfo());
  }

  public async getLastBackupsStatus(lab: CnLab): Promise<CnLabBackupBucket[]> {
    return this.labManagerApiService.getLastBackupsStatus(lab.getLabManagerApiInfo());
  }

  public async restoreBackup(lab: CnLab, restoreBackupDTO: CnLabManagerRestoreBackupDTO): Promise<void> {
    return this.labManagerApiService.restoreBackup(lab.getLabManagerApiInfo(), restoreBackupDTO);
  }
}
