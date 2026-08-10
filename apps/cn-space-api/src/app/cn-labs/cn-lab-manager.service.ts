import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';

import { CnExternalApiInfo } from '../cn-core/model/config/cn-config.class';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnExternalLabManagerApiService } from '../cn-external-lab-api/cn-external-lab-manager-api.service';
import {
  CnBrickInfoDTO,
  CnCustomEnvVariablesDTO,
  CnLabManagerAdminerInfo,
  CnLabManagerBackupInfoDTO,
  CnLabManagerCleanOptions,
  CnLabManagerComposeList,
  CnLabManagerComposeUpOptions,
  CnLabManagerContainerSize,
  CnLabManagerDockerComposeUniqueId,
  CnLabManagerDockerInspect,
  CnLabManagerDockerLogs,
  CnLabManagerDockerLogSearch,
  CnLabManagerDockerPsFull,
  CnLabManagerErrorLogs,
  CnLabManagerInitConfig,
  CnLabManagerLogSearchQuery,
  CnLabManagerRestoreBackupDTO,
  CnLabManagerStatus,
  CnManagerLabComposeRestartOptions,
  CnMcpConfigDTO,
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

  public async healthCheck(apiInfo: CnExternalApiInfo): Promise<boolean> {
    return this.labManagerApiService.healthCheck(apiInfo);
  }

  public async getLabStatus(lab: CnLab): Promise<CnLabManagerStatus> {
    const apiInfo = lab.getLabManagerApiInfo();
    const isRunning = await this.healthCheck(apiInfo);
    if (!isRunning) {
      throw new BlBadRequestException('The lab manager is not running');
    }

    return this.labManagerApiService.getStatus(apiInfo);
  }

  public async getStartingError(lab: CnLab): Promise<CnLabManagerErrorLogs> {
    return this.labManagerApiService.getStartingError(lab.getLabManagerApiInfo());
  }

  public getLabManagerRecommendedVersion(): string {
    return this.configService.getLabManagerRecommendedVersion();
  }

  public async waitForHealthCheck(apiInfo: CnExternalApiInfo): Promise<void> {
    // wait for server to reboot
    let count = 0;
    while (count < 15) {
      const result = await this.healthCheck(apiInfo);
      if (result) {
        return;
      }

      if (count >= 15) {
        break;
      }

      this.logger.log(
        `Waiting for lab manager ${apiInfo.apiUrl} to be available. Attempt ${count + 1} of 15`
      );
      // wait 15 seconds
      await new Promise((r) => setTimeout(r, 15000));
      count++;
    }

    throw new BlBadRequestException(`Server is not available for lab manager ${apiInfo.apiUrl}`);
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

  public cleanLabManager(lab: CnLab, options: CnLabManagerCleanOptions): Promise<void> {
    return this.labManagerApiService.cleanLabManager(lab.getLabManagerApiInfo(), options);
  }

  public getLabManagerInitConfig(lab: CnLab, spaceDomain: string): CnLabManagerInitConfig {
    const codelabToken = lab.codelabToken ?? null;
    const captchaSiteKey = lab.isConstellabDomain() ? this.configService.getCaptchaSiteKey() : null;
    const enableBackup = lab.isCloud();
    const openaiApiKey = lab.isDesktop() ? null : this.configService.getOpenaiAPIKey();

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
      lab: {
        id: lab.id,
        name: lab.name,
        codelabToken,
        captchaSiteKey,
      },
      db: {
        gwsCoreProdPassword: lab.gwsCoreProdDbPassword,
        gwsCoreDevPassword: lab.gwsCoreDevDbPassword,
      },
      backup: {
        enable: enableBackup,
      },
      openaiApiKey,

      // @deprecated - to remove once all lab managers are on version 2.12.0 or higher
      codelabToken,
      gwsCoreProdPassword: lab.gwsCoreProdDbPassword,
      gwsCoreDevPassword: lab.gwsCoreDevDbPassword,
      captchaSiteKey,
      labConfig: {
        enableBackup,
      },
    };
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

  public getMcpConfig(lab: CnLab): Promise<CnMcpConfigDTO> {
    return this.labManagerApiService.getMcpConfig(lab.getLabManagerApiInfo());
  }

  public setMcpConfig(lab: CnLab, enabled: boolean): Promise<void> {
    return this.labManagerApiService.setMcpConfig(lab.getLabManagerApiInfo(), enabled);
  }

  public getCustomEnvVariables(lab: CnLab): Promise<CnCustomEnvVariablesDTO> {
    return this.labManagerApiService.getCustomEnvVariables(lab.getLabManagerApiInfo());
  }

  public setCustomEnvVariables(lab: CnLab, variables: Record<string, string>): Promise<void> {
    return this.labManagerApiService.setCustomEnvVariables(lab.getLabManagerApiInfo(), variables);
  }

  public getBricksInfo(lab: CnLab): Promise<CnBrickInfoDTO[]> {
    return this.labManagerApiService.getBricksInfo(lab.getLabManagerApiInfo());
  }

  ////////////////////////////////////////// DOCKER COMPOSE //////////////////////////////////////////

  public async getAllComposes(lab: CnLab): Promise<CnLabManagerComposeList> {
    return this.labManagerApiService.getAllComposes(lab.getLabManagerApiInfo());
  }

  public async listServices(
    lab: CnLab,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<CnLabManagerDockerInspect[]> {
    return this.labManagerApiService.listServices(lab.getLabManagerApiInfo(), composeId);
  }

  public async upServices(
    lab: CnLab,
    composeId: CnLabManagerDockerComposeUniqueId,
    options: CnLabManagerComposeUpOptions
  ): Promise<void> {
    return this.labManagerApiService.upAllServices(lab.getLabManagerApiInfo(), composeId, options);
  }

  public async restartServices(
    lab: CnLab,
    composeId: CnLabManagerDockerComposeUniqueId,
    options: CnManagerLabComposeRestartOptions
  ): Promise<void> {
    return this.labManagerApiService.restartServices(lab.getLabManagerApiInfo(), composeId, options);
  }

  public async stopServices(lab: CnLab, composeId: CnLabManagerDockerComposeUniqueId): Promise<void> {
    return this.labManagerApiService.stopServices(lab.getLabManagerApiInfo(), composeId);
  }

  public async deleteServices(lab: CnLab, composeId: CnLabManagerDockerComposeUniqueId): Promise<void> {
    return this.labManagerApiService.deleteServices(lab.getLabManagerApiInfo(), composeId);
  }

  public async pullServices(lab: CnLab, composeId: CnLabManagerDockerComposeUniqueId): Promise<void> {
    return this.labManagerApiService.pullServices(lab.getLabManagerApiInfo(), composeId);
  }

  public async getComposeContent(lab: CnLab, composeId: CnLabManagerDockerComposeUniqueId): Promise<string> {
    return this.labManagerApiService.getComposeContent(lab.getLabManagerApiInfo(), composeId);
  }

  public async unregisterSubCompose(lab: CnLab, composeId: CnLabManagerDockerComposeUniqueId): Promise<void> {
    return this.labManagerApiService.unregisterSubCompose(lab.getLabManagerApiInfo(), composeId);
  }

  public async getComposeStatus(lab: CnLab, composeId: CnLabManagerDockerComposeUniqueId): Promise<any> {
    return this.labManagerApiService.getComposeStatus(lab.getLabManagerApiInfo(), composeId);
  }

  public async stopSubComposeProcess(lab: CnLab, composeId: CnLabManagerDockerComposeUniqueId): Promise<any> {
    return this.labManagerApiService.stopSubComposeProcess(lab.getLabManagerApiInfo(), composeId);
  }

  ////////////////////////////////////////// CONTAINERS //////////////////////////////////////////

  public async getContainerDetails(lab: CnLab, containerName: string): Promise<CnLabManagerDockerPsFull> {
    return this.labManagerApiService.getContainerDetails(lab.getLabManagerApiInfo(), containerName);
  }

  public async getContainerSize(lab: CnLab, containerName: string): Promise<CnLabManagerContainerSize> {
    return this.labManagerApiService.getContainerSize(lab.getLabManagerApiInfo(), containerName);
  }

  public async startContainer(lab: CnLab, containerName: string): Promise<void> {
    return this.labManagerApiService.startContainer(lab.getLabManagerApiInfo(), containerName);
  }

  public async stopContainer(lab: CnLab, containerName: string): Promise<void> {
    return this.labManagerApiService.stopContainer(lab.getLabManagerApiInfo(), containerName);
  }

  public async deleteContainer(lab: CnLab, containerName: string): Promise<void> {
    return this.labManagerApiService.deleteContainer(lab.getLabManagerApiInfo(), containerName);
  }

  public async getLogs(lab: CnLab, containerName: string): Promise<CnLabManagerDockerLogs> {
    return this.labManagerApiService.getLogs(lab.getLabManagerApiInfo(), containerName);
  }

  public async getErrorLogs(lab: CnLab, containerName: string): Promise<CnLabManagerDockerLogs> {
    return this.labManagerApiService.getErrorLogs(lab.getLabManagerApiInfo(), containerName);
  }

  public async searchLogs(
    lab: CnLab,
    containerName: string,
    query: CnLabManagerLogSearchQuery
  ): Promise<CnLabManagerDockerLogSearch> {
    return this.labManagerApiService.searchLogs(lab.getLabManagerApiInfo(), containerName, query);
  }

  public async exportLogs(lab: CnLab, containerName: string): Promise<string> {
    return this.labManagerApiService.exportLogs(lab.getLabManagerApiInfo(), containerName);
  }

  ////////////////////////////////////////// ADMINER //////////////////////////////////////////

  public async startAdminer(lab: CnLab): Promise<void> {
    return this.labManagerApiService.startAdminer(lab.getLabManagerApiInfo());
  }

  public async stopAdminer(lab: CnLab): Promise<void> {
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

  ///////////////////////////////////// OLD METHODS /////////////////////////////////////

  public async oldDeleteContainers(lab: CnLab): Promise<void> {
    return this.labManagerApiService.oldDeleteContainers(lab.getLabManagerApiInfo());
  }
}
