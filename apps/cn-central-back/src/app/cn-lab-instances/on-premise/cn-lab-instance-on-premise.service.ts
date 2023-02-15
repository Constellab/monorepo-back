import {Injectable} from '@nestjs/common';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {existsSync, readFileSync} from 'fs';
import {CnLabInstance, CnLabOnPremisePlatform} from '../cn-lab-instance.entity';
import {CnFrontService} from '../../cn-core/services/cn-front.service';
import {HttpService} from '@nestjs/axios';
import {lastValueFrom} from 'rxjs';
import {BlBadRequestException} from '@monorepo/back-core-lib';

export interface CnLabOnPremiseConfig {
  dockerCompose: string;
  config: any;
  exeFile: { name: string, buffer: Buffer };
}


@Injectable()
export class CnLabInstanceOnPremiseService {

  private static readonly WINDOWS_EXE_FILE =
    'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/on-premise-start.exe';

  constructor(private configService: CnCoreConfigService,
              private frontService: CnFrontService,
              private httpService: HttpService) {
  }

  public async generateOnPremiseConfig(labInstance: CnLabInstance): Promise<CnLabOnPremiseConfig> {
    const exe = await this.getExeFile(labInstance.onPremisePlatform);
    return {
      dockerCompose: this.generateDockerCompose(labInstance),
      config: this.getConfig(),
      exeFile: exe
    };
  }


  private generateDockerCompose(labInstance: CnLabInstance): string {
    let content = this.readDockerComposeTemplate();

    // replace all '${LAB_ID}' by labInstance.id
    content = content.replace(/\${LAB_ID}/g, labInstance.id);

    // replace variables
    content = content
      .replace(/\${LAB_ID}/g, labInstance.id)
      .replace(/\${LAB_NAME}/g, labInstance.name)
      .replace(/\${CENTRAL_API_KEY}/g, labInstance.glabApiKey)
      .replace(/\${CENTRAL_API_URL}/g, this.configService.getApiUrl())
      .replace(/\${GWS_GIT_LOGIN}/g, this.configService.getGwsGitlabUsername())
      .replace(/\${GWS_GIT_PWD}/g, this.configService.getGwsGitlabPassword())
      .replace(/\${GWS_CORE_PROD_DB_PASSWORD}/g, labInstance.gwsCoreProdDbPassword)
      .replace(/\${SECRET_KEY}/g, labInstance.id)
      .replace(/\${GWS_CORE_DEV_DB_PASSWORD}/g, labInstance.gwsCoreDevDbPassword)
      .replace(/\${CENTRAL_FRONT_URL}/g, this.frontService.getBaseWebsiteURL())
      .replace(/\${HUB_FRONT_URL}/g, this.configService.getHubFrontUrl());

    return content;
  }

  private getConfig(): any {
    return {
      'name': 'app',
      'title': 'Gencovery Lab',
      'description': 'Gencovery Digital Lab as a Service',
      'app_dir': '/app',
      'uri': '91620768-2cdd-11eb-adc1-0242ac120002',
      'variables': {
        'gws_biota:sqlite3db_url': 'https://share.gencovery.com/s/Eo34Y8sxgqSdSMz/download',
        'gws_biota:mariadb_url': ''
      },
      'environment': {
        'pip': [],
        'git': [
          {
            'source': 'https://$GWS_GIT_LOGIN:$GWS_GIT_PWD@gitlab.com/gencovery/core',
            'packages': [
              {'name': 'gws_core', 'version': '0.4.7', 'is_brick': true},
              {'name': 'gws_biota', 'version': '0.4.5', 'is_brick': true},
              {'name': 'skeleton', 'version': '0.1.0', 'is_brick': true}
            ]
          }
        ],
        'variables': {}
      }
    };
  }

  /**
   * Get the exe file used to start the lab
   * @param platform
   * @private
   */
  private async getExeFile(platform: CnLabOnPremisePlatform): Promise<{ name: string, buffer: Buffer }> {
    let name: string = null;
    let url: string = null;

    switch (platform) {
      case CnLabOnPremisePlatform.WINDOWS:
        name = 'on-premise-start.exe';
        url = CnLabInstanceOnPremiseService.WINDOWS_EXE_FILE;
        break;
      default:
        throw new BlBadRequestException(`Platform '${platform}' is not supported`);
    }

    // download the exe form url https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public
    const response = await lastValueFrom(this.httpService.get(url, {responseType: 'arraybuffer'}));
    return {
      name: name,
      buffer: Buffer.from(response.data, 'binary')
    };
  }

  private readDockerComposeTemplate(): string {
    const path = this.configService.getAssetPath('cn-lab-on-premise', 'docker-compose.yml');

    return this.readFile(path).toString();
  }

  /**
   * read a file with a path relative to dist folder
   */
  private readFile(path: string): Buffer {
    if (!existsSync(path)) {
      throw new Error(`The file '${path}' does not exist`);
    }

    return readFileSync(path);
  }
}
