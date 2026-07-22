import {
  BlBadRequestException,
  BlExternalApiError,
  BlExternalApiHttpOption,
  BlExternalApiService,
  BlHttpException,
} from '@monorepo/back-core-lib';
import { ClDeserializationRef } from '@monorepo/core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, lastValueFrom, Observable, throwError } from 'rxjs';

import {
  CN_EXTERNAL_LAB_API_KEY_HEADER,
  CN_EXTERNAL_LAB_API_KEY_SCHEMA,
  CnExternalApiInfo,
} from '../cn-core/model/config/cn-config.class';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnLabConfigFile } from '../cn-lab-configs/cn-lab-config-file.class';
import { CnLabBackupsHistory } from '../cn-labs/backup/cn-lab-backup.dto';
import { cnApplyIpOverride } from './cn-external-api-ip-override.helper';
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
  CnLabManagerDockerPsFull,
  CnLabManagerErrorLogs,
  CnLabManagerInitConfig,
  CnLabManagerRestoreBackupDTO,
  CnLabManagerStatus,
  CnManagerLabComposeRestartOptions,
  CnMcpConfigDTO,
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

  public async healthCheck(apiInfo: CnExternalApiInfo): Promise<boolean> {
    const requestOptions = this.getRequestOptions(apiInfo, { logError: false, timeout: 2500 });
    return lastValueFrom(
      this.apiService.get(this.buildUrl(apiInfo, `health-check`, requestOptions), undefined, requestOptions)
    )
      .then(() => true)
      .catch(() => false);
  }

  ////////////////////////////////////////// LAB //////////////////////////////////////////

  public async getStatus(apiInfo: CnExternalApiInfo): Promise<CnLabManagerStatus> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/status`, undefined, { timeout: 10000 }));
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

  public async getMcpConfig(apiInfo: CnExternalApiInfo): Promise<CnMcpConfigDTO> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/mcp-config`));
  }

  public async setMcpConfig(apiInfo: CnExternalApiInfo, enabled: boolean): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseLabRoute}/mcp-config`, { enabled }));
  }

  public async getCustomEnvVariables(apiInfo: CnExternalApiInfo): Promise<CnCustomEnvVariablesDTO> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/custom-env-variable`));
  }

  public async setCustomEnvVariables(
    apiInfo: CnExternalApiInfo,
    variables: Record<string, string>
  ): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseLabRoute}/custom-env-variable`, { variables }));
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

  public async startContainer(apiInfo: CnExternalApiInfo, containerName: string): Promise<void> {
    return lastValueFrom(this.put(apiInfo, `${this.baseContainersRoute}/${containerName}/start`, null));
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
      this.get(apiInfo, `${this.baseContainersRoute}/${containerName}/logs/export`, undefined, {
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

  ///////////////////////////////////// BRICKS /////////////////////////////////////

  /**
   * Get the info of the bricks installed on the lab (id, name, description,
   * image, latest version and whether a newer version exists). Mirrors the
   * community brick-info response.
   *
   * The bricks-info route may not exist on older lab managers: in that case
   * the lab manager answers 404 and we return an empty list instead of failing.
   */
  public async getBricksInfo(apiInfo: CnExternalApiInfo): Promise<CnBrickInfoDTO[]> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/bricks-info`)).catch(
      (error: BlExternalApiError) => {
        if (error?.status === 404) {
          return [];
        }
        throw error;
      }
    );
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
    const requestOptions = this.getRequestOptions(apiInfo, options);
    return this.apiService
      .post(this.buildUrl(apiInfo, route, requestOptions), body, classReference, requestOptions)
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
    const requestOptions = this.getRequestOptions(apiInfo, options);
    return this.apiService
      .put(this.buildUrl(apiInfo, route, requestOptions), body, classReference, requestOptions)
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
    const requestOptions = this.getRequestOptions(apiInfo, options);
    return this.apiService
      .get(this.buildUrl(apiInfo, route, requestOptions), classReference, requestOptions)
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
    const requestOptions = this.getRequestOptions(apiInfo, options);
    return this.apiService
      .delete(this.buildUrl(apiInfo, route, requestOptions), classReference, requestOptions)
      .pipe(catchError((error) => this.catchError(error)));
  }

  // build the target url for the route, redirecting to the ip override (and
  // enriching the options with the Host header / SNI) for on-premise labs
  private buildUrl(apiInfo: CnExternalApiInfo, route: string, options: BlExternalApiHttpOption): string {
    return cnApplyIpOverride(`${apiInfo.apiUrl}/${route}`, apiInfo.ipOverride, options);
  }

  // get the axios request config with the api key in the header
  private getRequestOptions(
    apiInfo: CnExternalApiInfo,
    options: BlExternalApiHttpOption
  ): BlExternalApiHttpOption {
    Object.assign(options, { headers: this.getHeader(apiInfo.apiKey) });
    return options;
  }

  // get the header with api key
  private getHeader(apiKey: string): any {
    const header: any = {};
    header[CN_EXTERNAL_LAB_API_KEY_HEADER] = `${CN_EXTERNAL_LAB_API_KEY_SCHEMA} ${apiKey}`;
    return header;
  }

  private catchError(error: BlExternalApiError): Observable<never> {
    if (error?.error?.code === 'ECONNREFUSED') {
      throw new BlBadRequestException(CnErrorText.LAB_MANAGER_UNAVAILABLE);
    }

    // convert the known error from the lab manager to a BlHttpException
    // to show the message to the user
    const knownError = error?.knownError;
    if (knownError) {
      return throwError(() => BlHttpException.fromApiError(knownError));
    }

    return throwError(() => error as any);
  }
}
