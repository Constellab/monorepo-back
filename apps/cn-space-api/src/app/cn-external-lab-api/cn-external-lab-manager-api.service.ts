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
  CnLabManagerCleanOptions,
  CnLabManagerComposeList,
  CnLabManagerComposeUpOptions,
  CnLabManagerContainerSize,
  CnLabManagerDockerComposeUniqueId,
  CnLabManagerDockerInspect,
  CnLabManagerDockerLogs,
  CnLabManagerDockerPsFull,
  CnLabManagerErrorLogs,
  CnLabManagerInitConfig,
  CnLabManagerRestoreBackupDTO,
  CnLabManagerStatus,
  CnManagerLabComposeRestartOptions,
} from './model/cn-lab-manager.class';

/**
 * Service to call the api of the lab manager
 */
@Injectable()
export class CnExternalLabManagerApiService {
  private baseLabRoute: string = 'lab';
  private baseDockerComposeRoute: string = 'docker-compose';
  private baseContainersRoute: string = 'docker-containers';
  private baseAdminerRoute: string = 'adminer';
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

  ////////////////////////////////////////// LAB //////////////////////////////////////////

  public async getStatus(apiInfo: CnExternalApiInfo): Promise<CnLabManagerStatus> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/status`, null, { timeout: 10000 }));
  }

  public async getStartingError(apiInfo: CnExternalApiInfo): Promise<CnLabManagerErrorLogs> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/starting/error`));
  }

  public async stopCurrentTask(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/stop-current-task`, null));
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

  public async cleanLabManager(apiInfo: CnExternalApiInfo, options: CnLabManagerCleanOptions): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/system/clean`, options));
  }

  public async updateConfig(apiInfo: CnExternalApiInfo, config: CnLabConfigFile): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseLabRoute}/config`, config));
  }

  public async getConfig(apiInfo: CnExternalApiInfo): Promise<CnLabConfigFile> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/config`));
  }

  ////////////////////////////////////////// DOCKER COMPOSE //////////////////////////////////////////

  public async getAllComposes(apiInfo: CnExternalApiInfo): Promise<CnLabManagerComposeList> {
    return lastValueFrom(this.get(apiInfo, `${this.baseDockerComposeRoute}/list`));
  }

  public async listServices(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<CnLabManagerDockerInspect[]> {
    return lastValueFrom(this.get(apiInfo, `${this.getComposeRoute(composeId)}/services`));
  }

  public async upServices(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId,
    serviceNames: string[]
  ): Promise<void> {
    return lastValueFrom(
      this.put(apiInfo, `${this.getComposeRoute(composeId)}/services/${serviceNames[0]}/start`, null)
    );
  }

  public async upAllServices(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId,
    options: CnLabManagerComposeUpOptions
  ): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.getComposeRoute(composeId)}/up-services`, options));
  }

  public async restartServices(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId,
    options: CnManagerLabComposeRestartOptions
  ): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.getComposeRoute(composeId)}/restart-services`, options));
  }

  public async stopServices(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.getComposeRoute(composeId)}/stop-services`, null));
  }

  public async deleteServices(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.getComposeRoute(composeId)}/delete-services`, null));
  }

  public async pullServices(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.getComposeRoute(composeId)}/pull-services`, null));
  }

  public async getComposeContent(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<string> {
    return lastValueFrom(this.get(apiInfo, `${this.getComposeRoute(composeId)}/content`)).then(
      (res) => res.content
    );
  }

  public async unregisterSubCompose(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<void> {
    return lastValueFrom(this.delete(apiInfo, `${this.getComposeRoute(composeId)}/unregister`));
  }

  public async getComposeStatus(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<any> {
    return lastValueFrom(this.get(apiInfo, `${this.getComposeRoute(composeId)}/status`));
  }

  public async stopSubComposeProcess(
    apiInfo: CnExternalApiInfo,
    composeId: CnLabManagerDockerComposeUniqueId
  ): Promise<any> {
    return lastValueFrom(
      this.put(apiInfo, `${this.getComposeRoute(composeId)}/stop-sub-compose-process`, null)
    );
  }

  private getComposeRoute(composeId: CnLabManagerDockerComposeUniqueId): string {
    return `${this.baseDockerComposeRoute}/${composeId.brickName}/${composeId.uniqueName}/${composeId.env}`;
  }

  ////////////////////////////////////////// CONTAINERS //////////////////////////////////////////
  public async getContainerDetails(
    apiInfo: CnExternalApiInfo,
    containerName: string
  ): Promise<CnLabManagerDockerPsFull> {
    return lastValueFrom(this.get(apiInfo, `${this.baseContainersRoute}/${containerName}`));
  }

  public async getContainerSize(
    apiInfo: CnExternalApiInfo,
    containerName: string
  ): Promise<CnLabManagerContainerSize> {
    return lastValueFrom(this.get(apiInfo, `${this.baseContainersRoute}/${containerName}/size`));
  }

  public async stopContainer(apiInfo: CnExternalApiInfo, containerName: string): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseContainersRoute}/${containerName}/stop`, null));
  }

  public async deleteContainer(apiInfo: CnExternalApiInfo, containerName: string): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseContainersRoute}/${containerName}/delete`, null));
  }

  public async getLogs(apiInfo: CnExternalApiInfo, containerName: string): Promise<CnLabManagerDockerLogs> {
    return lastValueFrom(this.get(apiInfo, `${this.baseContainersRoute}/${containerName}/logs`));
  }

  public async getErrorLogs(
    apiInfo: CnExternalApiInfo,
    containerName: string
  ): Promise<CnLabManagerDockerLogs> {
    return lastValueFrom(this.get(apiInfo, `${this.baseContainersRoute}/${containerName}/logs/error`));
  }

  public async exportLogs(apiInfo: CnExternalApiInfo, containerName: string): Promise<string> {
    return lastValueFrom(
      this.get(apiInfo, `${this.baseContainersRoute}/${containerName}/logs/export`, null, {
        timeout: 20000,
      })
    );
  }

  ////////////////////////////////////////// ADMINER //////////////////////////////////////////

  public async startAdminer(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseAdminerRoute}/start`, null));
  }

  public async stopAdminer(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseAdminerRoute}/stop`, null));
  }

  public async getAdminerInfo(apiInfo: CnExternalApiInfo): Promise<CnLabManagerAdminerInfo> {
    return lastValueFrom(this.get(apiInfo, `${this.baseAdminerRoute}/info`));
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

  ///////////////////////////////////// OLD METHODS /////////////////////////////////////

  public async oldDeleteContainers(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/delete-containers`, null));
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

  /**
   * Make a http DELETE with the ip of the lab and the API key of the lab in header
   */
  private delete(
    apiInfo: CnExternalApiInfo,
    route: string,
    classReference?: ClDeserializationRef,
    options: BlExternalApiHttpOption = {}
  ): Observable<any> {
    return this.apiService
      .delete(
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
