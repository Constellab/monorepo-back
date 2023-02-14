import {Injectable} from '@nestjs/common';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {existsSync, readFileSync} from 'fs';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnFrontService} from '../../cn-core/services/cn-front.service';

export interface CnLabOnPremiseConfig {
  dockerCompose: string;
  config: any;
}


@Injectable()
export class CnLabInstanceOnPremiseService {

  constructor(private configService: CnCoreConfigService,
              private frontService: CnFrontService) {
  }

  public generateOnPremiseConfig(labInstance: CnLabInstance): CnLabOnPremiseConfig {
    return {
      dockerCompose: this.generateDockerCompose(labInstance),
      config: this.getConfig()
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
              {'name': 'skeleton', 'version': '0.1.0', 'is_brick': true}
            ]
          }
        ],
        'variables': {}
      }
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
