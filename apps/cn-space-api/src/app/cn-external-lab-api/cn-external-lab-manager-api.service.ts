import {
  BlBadRequestException,
  BlExternalApiError,
  BlExternalApiHttpOption,
  BlExternalApiService,
} from '@monorepo/back-core-lib';
import { ClDeserializationRef } from '@monorepo/core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, lastValueFrom, Observable, throwError } from 'rxjs';

import {
  CnExternalApiInfo,
  cnExternalLabApiKeyHeader,
  cnExternalLabApiKeySchema,
} from '../cn-core/model/config/cn-config.class';
import { CnLabConfigFile } from '../cn-lab-configs/cn-lab-config-file.class';
import { CnLabBackupsHistory } from '../cn-labs/backup/cn-lab-backup.dto';
import {
  CnLabManagerAdminerInfo,
  CnLabManagerBackupInfoDTO,
  CnLabManagerComposeUpOptions,
  CnLabManagerContainerSize,
  CnLabManagerDockerLogs,
  CnLabManagerDockerPsFull,
  CnLabManagerErrorLogs,
  CnLabManagerInitConfig,
  CnLabManagerRestoreBackupDTO,
  CnLabManagerStatus,
  CnManagerLabComposeRestartOptions,
  CnManagerLabPullBiotaOptions,
} from './model/cn-lab-manager.class';

/**
 * Service to call the api of the lab manager
 */
@Injectable()
export class CnExternalLabManagerApiService {
  private baseLabRoute: string = 'lab';
  private baseBackupRoute: string = 'backup';

  private logger = new Logger(CnExternalLabManagerApiService.name);

  constructor(private apiService: BlExternalApiService) {}

  public async healthCheck(labUrl: string): Promise<boolean> {
    return lastValueFrom(
      this.apiService.get(this.constructRoute(labUrl, `health-check`), null, {
        logError: false,
        timeout: 2500,
      })
    )
      .then(() => true)
      .catch(() => false);
  }

  public async getStatus(apiInfo: CnExternalApiInfo): Promise<CnLabManagerStatus> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/status`));
  }

  public async getStartingError(apiInfo: CnExternalApiInfo): Promise<CnLabManagerErrorLogs> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/starting/error`));
  }

  public async listContainers(apiInfo: CnExternalApiInfo): Promise<CnLabManagerDockerPsFull[]> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/containers`));
  }

  public async getContainerDetails(
    apiInfo: CnExternalApiInfo,
    containerName: string
  ): Promise<CnLabManagerDockerPsFull> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/containers/${containerName}`));
  }

  public async getContainerSize(
    apiInfo: CnExternalApiInfo,
    containerName: string
  ): Promise<CnLabManagerContainerSize> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/containers/${containerName}/size`));
  }

  public async startComposeContainer(apiInfo: CnExternalApiInfo, serviceName: string): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseLabRoute}/containers/${serviceName}/start`, null));
  }

  public async stopContainer(apiInfo: CnExternalApiInfo, containerName: string): Promise<boolean> {
    return lastValueFrom(this.put(apiInfo, `${this.baseLabRoute}/containers/${containerName}/stop`, null));
  }

  public async deleteContainer(apiInfo: CnExternalApiInfo, containerName: string): Promise<boolean> {
    return lastValueFrom(this.put(apiInfo, `${this.baseLabRoute}/containers/${containerName}/delete`, null));
  }

  public async getLogs(apiInfo: CnExternalApiInfo, containerName: string): Promise<CnLabManagerDockerLogs> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/containers/${containerName}/logs`));
  }

  public async getErrorLogs(
    apiInfo: CnExternalApiInfo,
    containerName: string
  ): Promise<CnLabManagerDockerLogs> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/containers/${containerName}/logs/error`));
  }

  public async exportLogs(apiInfo: CnExternalApiInfo, containerName: string): Promise<string> {
    return lastValueFrom(
      this.get(apiInfo, `${this.baseLabRoute}/containers/${containerName}/logs/export`, null, {
        timeout: 20000,
      })
    );
  }

  public async initAll(apiInfo: CnExternalApiInfo, initConfig: CnLabManagerInitConfig): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/init-all`, initConfig));
  }

  public async configureLabManager(
    apiInfo: CnExternalApiInfo,
    initConfig: CnLabManagerInitConfig
  ): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/configure-lab-manager`, initConfig));
  }

  public async upContainers(
    apiInfo: CnExternalApiInfo,
    options?: CnLabManagerComposeUpOptions
  ): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/up-containers`, options));
  }

  public async restartContainers(
    apiInfo: CnExternalApiInfo,
    options?: CnManagerLabComposeRestartOptions
  ): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/restart-containers`, options));
  }

  public async stopContainers(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/stop-containers`, null));
  }

  public async deleteContainers(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/delete-containers`, null));
  }

  public async pullContainers(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/pull-containers`, null));
  }

  public async pullBiota(apiInfo: CnExternalApiInfo, options: CnManagerLabPullBiotaOptions): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/pull-biota-db`, options));
  }

  public async stopCurrentTask(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/stop-current-task`, null));
  }

  public async systemPrune(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/system-prune`, null));
  }

  public async updateConfig(apiInfo: CnExternalApiInfo, config: CnLabConfigFile): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseLabRoute}/config`, config));
  }

  public async getConfig(apiInfo: CnExternalApiInfo): Promise<CnLabConfigFile> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/config`));
  }

  public async startAdminer(apiInfo: CnExternalApiInfo): Promise<boolean> {
    return lastValueFrom(this.put(apiInfo, `${this.baseLabRoute}/adminer/start`, null));
  }

  public async stopAdminer(apiInfo: CnExternalApiInfo): Promise<boolean> {
    return lastValueFrom(this.put(apiInfo, `${this.baseLabRoute}/adminer/stop`, null));
  }

  public async getAdminerInfo(apiInfo: CnExternalApiInfo): Promise<CnLabManagerAdminerInfo> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/adminer/info`));
  }

  ///////////////////////////////////// BACKUP /////////////////////////////////////

  async createProdBackup(
    apiInfo: CnExternalApiInfo,
    createBackup: CnLabManagerBackupInfoDTO
  ): Promise<CnLabBackupsHistory> {
    return await lastValueFrom(
      this.post(apiInfo, `${this.baseBackupRoute}/prod/MANUAL`, createBackup, CnLabBackupsHistory)
    ).catch((error) => {
      this.logger.error(error);
      throw error;
    });
  }

  async stopCurrentBackup(apiInfo: CnExternalApiInfo): Promise<CnLabBackupsHistory> {
    return await lastValueFrom(
      this.post(apiInfo, `${this.baseBackupRoute}/stop-current`, null, CnLabBackupsHistory)
    );
  }

  async getLastBackupsStatus(apiInfo: CnExternalApiInfo): Promise<CnLabBackupsHistory> {
    return await lastValueFrom(this.get(apiInfo, `${this.baseBackupRoute}/last-status`, CnLabBackupsHistory));
  }

  async getBackupHistory(apiInfo: CnExternalApiInfo): Promise<CnLabBackupsHistory> {
    return await lastValueFrom(this.get(apiInfo, `${this.baseBackupRoute}/history`, CnLabBackupsHistory));
  }

  restoreBackup(apiInfo: CnExternalApiInfo, restoreBackupDTO: CnLabManagerRestoreBackupDTO): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseBackupRoute}/restore`, restoreBackupDTO));
  }

  ///////////////////////////////////// GENERIC METHODS /////////////////////////////////////

  /**
   * Make a http post with the ip of the lab and the API key of the lab in header
   */
  private post(
    apiInfo: CnExternalApiInfo,
    route: string,
    body: any,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    return this.apiService
      .post(
        this.constructRoute(apiInfo.apiUrl, route),
        body,
        classReference,
        this.getRequestOptions(apiInfo.apiKey, options)
      )
      .pipe(catchError((error) => this.catchError(error)));
  }

  /**
   * Make a http put with the ip of the lab and the API key of the lab in header
   */
  private put(
    apiInfo: CnExternalApiInfo,
    route: string,
    body: any,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    return this.apiService
      .put(
        this.constructRoute(apiInfo.apiUrl, route),
        body,
        classReference,
        this.getRequestOptions(apiInfo.apiKey, options)
      )
      .pipe(catchError((error) => this.catchError(error)));
  }

  /**
   * Make a http GET with the ip of the lab and the API key of the lab in header
   */
  private get(
    apiInfo: CnExternalApiInfo,
    route: string,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    return this.apiService
      .get(
        this.constructRoute(apiInfo.apiUrl, route),
        classReference,
        this.getRequestOptions(apiInfo.apiKey, options)
      )
      .pipe(catchError((error) => this.catchError(error)));
  }

  private constructRoute(labUrl: string, route: string): string {
    return `${labUrl}/${route}`;
  }

  // get the axios request config with the api key in the header
  private getRequestOptions(apiKey: string, options: BlExternalApiHttpOption): BlExternalApiHttpOption {
    return Object.assign(options, { headers: this.getHeader(apiKey) });
  }

  // get the header with api key
  private getHeader(apiKey: string): any {
    const header: any = {};
    header[cnExternalLabApiKeyHeader] = `${cnExternalLabApiKeySchema} ${apiKey}`;
    return header;
  }

  private catchError(error: BlExternalApiError): Observable<never> {
    if (error?.error?.code === 'ECONNREFUSED') {
      throw new BlBadRequestException('The lab manager is not running, cannot perform the operation');
    }

    return throwError(error as any);
  }
}
