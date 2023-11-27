import {Injectable} from '@nestjs/common';
import {BlExternalApiHttpOption, BlExternalApiService} from '@monorepo/back-core-lib';
import {ClDeserializationRef} from '@monorepo/core-lib';
import {lastValueFrom, Observable} from 'rxjs';
import {
  CnExternalApiInfo,
  cnExternalLabApiKeyHeader,
  cnExternalLabApiKeySchema
} from '../cn-core/model/config/cn-config.class';
import {
  CnLabComposeRestartOptions,
  CnLabComposeUpOptions,
  CnLabDockerPsFull,
  CnLabManagerInitConfig,
  CnLabPullBiotaOptions
} from './model/cn-lab-manager.class';
import {CnExternalLabBackupInfoDTO} from './model/cn-external-lab-api.class';
import {CnLabConfigFile} from '../cn-lab-configs/cn-lab-config-file.class';
import {CnLabBackupBucket, CnLabBackupHistory} from '../cn-lab-instances/backup/cn-lab-backup.dto';

/**
 * Service to call the api of the lab manager
 */
@Injectable()
export class CnExternalLabManagerApiService {

  private baseLabRoute: string = 'lab';
  private baseBackupRoute: string = 'backup';

  constructor(private apiService: BlExternalApiService) {
  }

  public async healthCheck(labUrl: string): Promise<boolean> {
    return lastValueFrom(this.apiService.get(this.constructRoute(labUrl, `health-check`),
      null, {logError: false, timeout: 2500}))
      .then(() => true)
      .catch(() => false);
  }

  public async getStatus(apiInfo: CnExternalApiInfo): Promise<any> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/status`));
  }

  public async listContainers(apiInfo: CnExternalApiInfo): Promise<CnLabDockerPsFull[]> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/containers`));
  }

  public async getContainerDetails(apiInfo: CnExternalApiInfo, containerName: string): Promise<CnLabDockerPsFull> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/containers/${containerName}`));
  }

  public async getLogs(apiInfo: CnExternalApiInfo, containerName: string): Promise<string> {
    return lastValueFrom(this.get(apiInfo, `${this.baseLabRoute}/containers/${containerName}/logs`));
  }

  public async initAll(apiInfo: CnExternalApiInfo, initConfig: CnLabManagerInitConfig): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/init-all`, initConfig));
  }

  public async upContainers(apiInfo: CnExternalApiInfo, options?: CnLabComposeUpOptions): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/up-containers`, options));
  }

  public async restartContainers(apiInfo: CnExternalApiInfo, options?: CnLabComposeRestartOptions): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/restart-containers`, options));
  }

  public async downContainers(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/delete-containers`, null));
  }

  public async pullContainers(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/pull-containers`, null));
  }

  public async pullBiota(apiInfo: CnExternalApiInfo, options: CnLabPullBiotaOptions): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/pull-biota-db`, options));
  }

  public async registryLogin(apiInfo: CnExternalApiInfo): Promise<void> {
    return lastValueFrom(this.post(apiInfo, `${this.baseLabRoute}/registry-login`, null));
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


  ///////////////////////////////////// BACKUP /////////////////////////////////////

  createProdBackup(apiInfo: CnExternalApiInfo, createBackup: CnExternalLabBackupInfoDTO): Promise<CnLabBackupBucket[]> {
    return lastValueFrom(this.post(apiInfo, `${this.baseBackupRoute}/prod/MANUAL`, createBackup, CnLabBackupBucket));
  }

  stopCurrentBackup(apiInfo: CnExternalApiInfo): Promise<CnLabBackupBucket[]> {
    return lastValueFrom(this.post(apiInfo, `${this.baseBackupRoute}/stop-current`, null, CnLabBackupBucket));
  }

  getLastBackupsStatus(apiInfo: CnExternalApiInfo): Promise<CnLabBackupBucket[]> {
    return lastValueFrom(this.get(apiInfo, `${this.baseBackupRoute}/last-status`));
  }

  getBackupHistory(apiInfo: CnExternalApiInfo): Promise<CnLabBackupHistory> {
    return lastValueFrom(this.get(apiInfo, `${this.baseBackupRoute}/history`, CnLabBackupHistory));
  }


  ///////////////////////////////////// GENERIC METHODS /////////////////////////////////////


  /**
   * Make a http post with the ip of the lab and the API key of the lab in header
   */
  private post(apiInfo: CnExternalApiInfo, route: string, body: any, classReference?: ClDeserializationRef,
               options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.post(this.constructRoute(apiInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(apiInfo.apiKey, options));
  }

  /**
   * Make a http put with the ip of the lab and the API key of the lab in header
   */
  private put(apiInfo: CnExternalApiInfo, route: string, body: any, classReference?: ClDeserializationRef,
              options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.put(this.constructRoute(apiInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(apiInfo.apiKey, options));
  }

  /**
   * Make a http GET with the ip of the lab and the API key of the lab in header
   */
  private get(apiInfo: CnExternalApiInfo, route: string, classReference?: ClDeserializationRef,
              options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.get(this.constructRoute(apiInfo.apiUrl, route),
      classReference, this.getRequestOptions(apiInfo.apiKey, options));
  }

  private constructRoute(labUrl: string, route: string): string {
    return `${labUrl}/${route}`;
    // uncomment for local host tests
    // return `http://localhost:3080/${route}`;
  }


  // get the axios request config with the api key in the header
  private getRequestOptions(apiKey: string, options: BlExternalApiHttpOption): BlExternalApiHttpOption {
    return Object.assign(options, {headers: this.getHeader(apiKey)});
  }

  // get the header with api key
  private getHeader(apiKey: string): any {
    const header: any = {};
    header[cnExternalLabApiKeyHeader] = `${cnExternalLabApiKeySchema} ${apiKey}`;
    return header;
  }

}
