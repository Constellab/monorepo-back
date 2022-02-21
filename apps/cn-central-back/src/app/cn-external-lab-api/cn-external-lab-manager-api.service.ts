import {Injectable} from '@nestjs/common';
import {BlExternalApiHttpOption, BlExternalApiService} from '@monorepo/back-core-lib';
import {ClDeserializationRef} from '@monorepo/core-lib';
import {Observable} from 'rxjs';
import {
  CnExternalApiInfo,
  cnExternalLabApiKeyHeader,
  cnExternalLabApiKeySchema
} from '../cn-core/model/config/cn-config.class';
import {
  CnLabComposeUpOptions,
  CnLabDockerPs,
  CnLabManagerConfigDTO,
  CnLabManagerInitConfig,
  CnLabManagerStatus,
  CnLabManagerUpdateConfigDTO
} from './model/cn-lab-manager.class';

/**
 * Service to call the api of the lab manager
 */
@Injectable()
export class CnExternalLabManagerApiService {

  private baseLabRoute: string = 'lab';

  constructor(private apiService: BlExternalApiService) {
  }

  public async healthCheck(labUrl: string): Promise<boolean> {
    return this.apiService.get(this.constructRoute(labUrl, `health-check`)).toPromise();
  }

  public async getStatus(apiInfo: CnExternalApiInfo): Promise<CnLabManagerStatus> {
    return this.get(apiInfo, `${this.baseLabRoute}/status`).toPromise();
  }

  public async listContainers(apiInfo: CnExternalApiInfo): Promise<CnLabDockerPs[]> {
    return this.get(apiInfo, `${this.baseLabRoute}/containers`).toPromise();
  }

  public async getLogs(apiInfo: CnExternalApiInfo, containerName: string): Promise<string> {
    return this.get(apiInfo, `${this.baseLabRoute}/${containerName}/logs`).toPromise();
  }

  public async initAll(apiInfo: CnExternalApiInfo, initConfig: CnLabManagerInitConfig): Promise<void> {
    return this.post(apiInfo, `${this.baseLabRoute}/init-all`, initConfig).toPromise();
  }

  public async upContainers(apiInfo: CnExternalApiInfo, options?: CnLabComposeUpOptions): Promise<void> {
    return this.post(apiInfo, `${this.baseLabRoute}/up-containers`, options).toPromise();
  }

  public async restartContainers(apiInfo: CnExternalApiInfo, options?: CnLabComposeUpOptions): Promise<void> {
    return this.post(apiInfo, `${this.baseLabRoute}/restart-containers`, options).toPromise();
  }

  public async downContainers(apiInfo: CnExternalApiInfo): Promise<void> {
    return this.post(apiInfo, `${this.baseLabRoute}/down-containers`, null).toPromise();
  }

  public async pullContainers(apiInfo: CnExternalApiInfo): Promise<void> {
    return this.post(apiInfo, `${this.baseLabRoute}/pull-containers`, null).toPromise();
  }

  public async pullBiota(apiInfo: CnExternalApiInfo): Promise<void> {
    return this.post(apiInfo, `${this.baseLabRoute}/pull-biota-db`, null).toPromise();
  }

  public async registryLogin(apiInfo: CnExternalApiInfo): Promise<void> {
    return this.post(apiInfo, `${this.baseLabRoute}/registry-login`, null).toPromise();
  }

  public async stopCurrentTask(apiInfo: CnExternalApiInfo): Promise<void> {
    return this.post(apiInfo, `${this.baseLabRoute}/stop-current-task`, null).toPromise();
  }

  public async systemPrune(apiInfo: CnExternalApiInfo): Promise<void> {
    return this.post(apiInfo, `${this.baseLabRoute}/system-prune`, null).toPromise();
  }

  public async updateConfig(apiInfo: CnExternalApiInfo, config: CnLabManagerUpdateConfigDTO): Promise<void> {
    return this.put(apiInfo, `${this.baseLabRoute}/config`, config).toPromise();
  }

  public async getConfig(apiInfo: CnExternalApiInfo): Promise<CnLabManagerConfigDTO> {
    return this.get(apiInfo, `${this.baseLabRoute}/config`).toPromise();
  }


  /**
   * Make an http post with the ip of the lab and the API key of the lab in header
   */
  private post(apiInfo: CnExternalApiInfo, route: string, body: any, classReference?: ClDeserializationRef,
               options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.post(this.constructRoute(apiInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(apiInfo.apiKey, options));
  }

  /**
   * Make an http put with the ip of the lab and the API key of the lab in header
   */
  private put(apiInfo: CnExternalApiInfo, route: string, body: any, classReference?: ClDeserializationRef,
              options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.put(this.constructRoute(apiInfo.apiUrl, route), body,
      classReference, this.getRequestOptions(apiInfo.apiKey, options));
  }

  /**
   * Make an http GET with the ip of the lab and the API key of the lab in header
   */
  private get(apiInfo: CnExternalApiInfo, route: string, classReference?: ClDeserializationRef,
              options: BlExternalApiHttpOption = {}): Observable<any> {
    return this.apiService.get(this.constructRoute(apiInfo.apiUrl, route),
      classReference, this.getRequestOptions(apiInfo.apiKey, options));
  }

  private constructRoute(labUrl: string, route: string): string {
    return `http://localhost:3010/${route}`;
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
