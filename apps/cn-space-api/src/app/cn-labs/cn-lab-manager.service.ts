import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';

import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnExternalLabManagerApiService } from '../cn-external-lab-api/cn-external-lab-manager-api.service';
import {
  CnLabManagerAdminerInfo,
  CnLabManagerBackupInfoDTO,
  CnLabManagerComposeList,
  CnLabManagerComposeUpOptions,
  CnLabManagerContainerSize,
  CnLabManagerDockerInspect,
  CnLabManagerDockerLogs,
  CnLabManagerDockerPsFull,
  CnLabManagerErrorLogs,
  CnLabManagerInitConfig,
  CnLabManagerRestoreBackupDTO,
  CnLabManagerStatus,
  CnManagerLabComposeRestartOptions,
  CnManagerLabPullBiotaOptions,
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabConfigFile } from '../cn-lab-configs/cn-lab-config-file.class';
import { CnLabConfigsService } from '../cn-lab-configs/cn-lab-configs.service';
import { CnLabBackupsHistory } from './backup/cn-lab-backup.dto';
import { CnLabConfigDTO } from './cn-lab.dto';
import { CnLab } from './cn-lab.entity';

/**
 * Service to call the api of the lab manager
 */
@Injectable()
export class CnLabManagerService {
  private readonly logger = new Logger(CnLabManagerService.name);

  constructor(
    private labManagerApiService: CnExternalLabManagerApiService,
    private configService: CnCoreConfigService,
    private labConfigService: CnLabConfigsService
  ) {}

  ////////////////////////////////////////// HEALTH & STATUS //////////////////////////////////////////

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

  public async getStartingError(lab: CnLab): Promise<CnLabManagerErrorLogs> {
    return this.labManagerApiService.getStartingError(lab.getLabManagerApiInfo());
  }

  public getLabManagerRecommendedVersion(): string {
    return this.configService.getLabManagerRecommendedVersion();
  }

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
      await new Promise((r) => setTimeout(r, 15000));
      count++;
    }

    throw new BlBadRequestException(`Server is not available for lab manager ${labManagerUrl}`);
  }

  public async stopCurrentTask(lab: CnLab): Promise<void> {
    return this.labManagerApiService.stopCurrentTask(lab.getLabManagerApiInfo());
  }

  ////////////////////////////////////////// LAB INITIALIZATION //////////////////////////////////////////

  public async initAll(lab: CnLab, spaceDomain: string): Promise<void> {
    const initConfig: CnLabManagerInitConfig = this.getLabManagerInitConfig(lab, spaceDomain);
    return this.labManagerApiService.initAll(lab.getLabManagerApiInfo(), initConfig);
  }

  public configureLabManager(lab: CnLab, spaceDomain: string): Promise<void> {
    const initConfig: CnLabManagerInitConfig = this.getLabManagerInitConfig(lab, spaceDomain);
    return this.labManagerApiService.configureLabManager(lab.getLabManagerApiInfo(), initConfig);
  }

  public getLabManagerInitConfig(lab: CnLab, spaceDomain: string): CnLabManagerInitConfig {
    return {
      space: {
        prodApiKey: lab.glabProdApiKey,
        devApiKey: lab.glabDevApiKey,
        apiUrl: this.configService.getApiUrl(),
        frontUrl: `https://${spaceDomain}.${this.configService.getFrontDomain()}`,
      },
      community: {
        frontUrl: this.configService.getCommunityFrontUrl(),
        apiUrl: this.configService.getCommunityApiUrl(),
        // don't provide the community api key on desktop
        apiKey: lab.isDesktop() ? null : this.configService.getCommunityApiKey(),
      },
      codelabToken: lab.codelabToken,
      gwsCoreProdPassword: lab.gwsCoreProdDbPassword,
      gwsCoreDevPassword: lab.gwsCoreDevDbPassword,
      // enable the captcha only on constellab standard domain
      captchaSiteKey: lab.isConstellabDomain() ? this.configService.getCaptchaSiteKey() : null,
      labConfig: {
        enableBackup: lab.isCloud(),
      },
      // disable openai on desktop
      openaiApiKey: lab.isDesktop() ? null : this.configService.getOpenaiAPIKey(),
    };
  }

  public async pullBiota(lab: CnLab, options: CnManagerLabPullBiotaOptions): Promise<void> {
    return this.labManagerApiService.pullBiota(lab.getLabManagerApiInfo(), options);
  }

  ////////////////////////////////////////// CONFIGURATION //////////////////////////////////////////

  public async updateConfig(lab: CnLab, config: CnLabConfigDTO): Promise<void> {
    const configFile: CnLabConfigFile = await this.labConfigService.getLabConfigFile(lab, config);

    return this.labManagerApiService.updateConfig(lab.getLabManagerApiInfo(), configFile);
  }

  public async getConfig(lab: CnLab): Promise<CnLabConfigDTO> {
    const configFile: CnLabConfigFile = await this.labManagerApiService.getConfig(lab.getLabManagerApiInfo());

    return this.labConfigService.configFileToLabConfig(configFile);
  }

  ////////////////////////////////////////// DOCKER COMPOSE //////////////////////////////////////////

  public async getAllComposes(lab: CnLab): Promise<CnLabManagerComposeList> {
    return this.labManagerApiService.getAllComposes(lab.getLabManagerApiInfo());
  }

  public async listServices(
    lab: CnLab,
    brickName: string,
    uniqueName: string
  ): Promise<CnLabManagerDockerInspect[]> {
    return this.labManagerApiService.listServices(lab.getLabManagerApiInfo(), brickName, uniqueName);
  }

  public async startComposeService(
    lab: CnLab,
    brickName: string,
    uniqueName: string,
    serviceNames: string[]
  ): Promise<void> {
    return this.labManagerApiService.upServices(
      lab.getLabManagerApiInfo(),
      brickName,
      uniqueName,
      serviceNames
    );
  }

  public async upServices(
    lab: CnLab,
    brickName: string,
    uniqueName: string,
    options: CnLabManagerComposeUpOptions
  ): Promise<void> {
    return this.labManagerApiService.upAllServices(
      lab.getLabManagerApiInfo(),
      brickName,
      uniqueName,
      options
    );
  }

  public async restartServices(
    lab: CnLab,
    brickName: string,
    uniqueName: string,
    options: CnManagerLabComposeRestartOptions
  ): Promise<void> {
    return this.labManagerApiService.restartServices(
      lab.getLabManagerApiInfo(),
      brickName,
      uniqueName,
      options
    );
  }

  public async stopServices(lab: CnLab, brickName: string, uniqueName: string): Promise<void> {
    return this.labManagerApiService.stopServices(lab.getLabManagerApiInfo(), brickName, uniqueName);
  }

  public async deleteServices(lab: CnLab, brickName: string, uniqueName: string): Promise<void> {
    return this.labManagerApiService.deleteServices(lab.getLabManagerApiInfo(), brickName, uniqueName);
  }

  public async pullServices(lab: CnLab, brickName: string, uniqueName: string): Promise<void> {
    return this.labManagerApiService.pullServices(lab.getLabManagerApiInfo(), brickName, uniqueName);
  }

  public async getComposeContent(lab: CnLab, brickName: string, uniqueName: string): Promise<string> {
    return this.labManagerApiService.getComposeContent(lab.getLabManagerApiInfo(), brickName, uniqueName);
  }

  public async unregisterSubCompose(lab: CnLab, brickName: string, uniqueName: string): Promise<void> {
    return this.labManagerApiService.unregisterSubCompose(lab.getLabManagerApiInfo(), brickName, uniqueName);
  }

  ////////////////////////////////////////// CONTAINERS //////////////////////////////////////////

  public async getContainerDetails(lab: CnLab, containerName: string): Promise<CnLabManagerDockerPsFull> {
    return this.labManagerApiService.getContainerDetails(lab.getLabManagerApiInfo(), containerName);
  }

  public async getContainerSize(lab: CnLab, containerName: string): Promise<CnLabManagerContainerSize> {
    return this.labManagerApiService.getContainerSize(lab.getLabManagerApiInfo(), containerName);
  }

  public async stopContainer(lab: CnLab, containerName: string): Promise<boolean> {
    return this.labManagerApiService.stopContainer(lab.getLabManagerApiInfo(), containerName);
  }

  public async deleteContainer(lab: CnLab, containerName: string): Promise<boolean> {
    return this.labManagerApiService.deleteContainer(lab.getLabManagerApiInfo(), containerName);
  }

  public async getLogs(lab: CnLab, containerName: string): Promise<CnLabManagerDockerLogs> {
    return this.labManagerApiService.getLogs(lab.getLabManagerApiInfo(), containerName);
  }

  public async getErrorLogs(lab: CnLab, containerName: string): Promise<CnLabManagerDockerLogs> {
    return this.labManagerApiService.getErrorLogs(lab.getLabManagerApiInfo(), containerName);
  }

  public async exportLogs(lab: CnLab, containerName: string): Promise<string> {
    return this.labManagerApiService.exportLogs(lab.getLabManagerApiInfo(), containerName);
  }

  public async systemPrune(lab: CnLab): Promise<void> {
    return this.labManagerApiService.systemPrune(lab.getLabManagerApiInfo());
  }

  ////////////////////////////////////////// ADMINER //////////////////////////////////////////

  public async startAdminer(lab: CnLab): Promise<boolean> {
    return this.labManagerApiService.startAdminer(lab.getLabManagerApiInfo());
  }

  public async stopAdminer(lab: CnLab): Promise<boolean> {
    return this.labManagerApiService.stopAdminer(lab.getLabManagerApiInfo());
  }

  public async getAdminerInfo(lab: CnLab): Promise<CnLabManagerAdminerInfo> {
    return this.labManagerApiService.getAdminerInfo(lab.getLabManagerApiInfo());
  }

  ////////////////////////////////////////// BACKUP //////////////////////////////////////////

  public async createProdBackup(lab: CnLab, backup: CnLabManagerBackupInfoDTO): Promise<CnLabBackupsHistory> {
    return this.labManagerApiService.createProdBackup(lab.getLabManagerApiInfo(), backup);
  }

  public async stopCurrentBackup(lab: CnLab): Promise<CnLabBackupsHistory> {
    return this.labManagerApiService.stopCurrentBackup(lab.getLabManagerApiInfo());
  }

  public async getBackupHistory(lab: CnLab): Promise<CnLabBackupsHistory> {
    return this.labManagerApiService.getBackupHistory(lab.getLabManagerApiInfo());
  }

  public async getLastBackupsStatus(lab: CnLab): Promise<CnLabBackupsHistory> {
    return this.labManagerApiService.getLastBackupsStatus(lab.getLabManagerApiInfo());
  }

  public async restoreBackup(lab: CnLab, restoreBackupDTO: CnLabManagerRestoreBackupDTO): Promise<void> {
    return this.labManagerApiService.restoreBackup(lab.getLabManagerApiInfo(), restoreBackupDTO);
  }
}
