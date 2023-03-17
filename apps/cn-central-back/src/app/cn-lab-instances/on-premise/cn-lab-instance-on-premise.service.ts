import {Injectable} from '@nestjs/common';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {existsSync, readFileSync} from 'fs';
import {CnLabInstance, CnLabOnPremisePlatform} from '../cn-lab-instance.entity';
import {CnFrontService} from '../../cn-core/services/cn-front.service';
import {HttpService} from '@nestjs/axios';
import {lastValueFrom} from 'rxjs';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnLabConfigsService} from '../../cn-lab-configs/cn-lab-configs.service';
import {CnLabConfigFile} from '../../cn-lab-configs/cn-lab-config-file.class';
import {CnLabInstanceConfigDTO, CnLabInstanceOnPremiseConfig} from '../cn-lab-instance.dto';

export interface CnLabOnPremiseConfig {
  dockerCompose: string;
  config: CnLabConfigFile;
  exeFile: { name: string, buffer: Buffer };
}


@Injectable()
export class CnLabInstanceOnPremiseService {

  constructor(private configService: CnCoreConfigService,
              private frontService: CnFrontService,
              private httpService: HttpService,
              private labConfigService: CnLabConfigsService) {
  }

  public async generateOnPremiseConfig(labInstance: CnLabInstance,
                                       onPremiseConfig: CnLabInstanceOnPremiseConfig): Promise<CnLabOnPremiseConfig> {
    const config = await this.getConfig(labInstance, onPremiseConfig);
    const exe = await this.getExeFile(labInstance.onPremisePlatform);
    return {
      dockerCompose: this.generateDockerCompose(labInstance, config),
      config: config,
      exeFile: exe
    };
  }


  private generateDockerCompose(labInstance: CnLabInstance, config: CnLabConfigFile): string {
    let content = this.readDockerComposeTemplate();

    // replace all '${LAB_ID}' by labInstance.id
    content = content.replace(/\${LAB_ID}/g, labInstance.id);

    // replace variables
    content = content
      .replace(/\${LAB_ID}/g, labInstance.id)
      .replace(/\${LAB_NAME}/g, labInstance.name)
      .replace(/\${CENTRAL_API_KEY}/g, labInstance.glabApiKey)
      .replace(/\${CENTRAL_API_URL}/g, this.configService.getApiUrl())
      .replace(/\${GWS_CORE_PROD_DB_PASSWORD}/g, labInstance.gwsCoreProdDbPassword)
      .replace(/\${SECRET_KEY}/g, labInstance.id)
      .replace(/\${GWS_CORE_DEV_DB_PASSWORD}/g, labInstance.gwsCoreDevDbPassword)
      .replace(/\${CENTRAL_FRONT_URL}/g, this.frontService.getBaseWebsiteURL())
      .replace(/\${HUB_FRONT_URL}/g, this.configService.getCommunityFrontUrl())
      .replace(/\${FRONT_VERSION}/g, config.front_version)
      .replace(/\${GLAB_TAG}/g, config.glab_tag);

    return content;
  }

  private async getConfig(labInstance: CnLabInstance, onPremiseConfig: CnLabInstanceOnPremiseConfig): Promise<CnLabConfigFile> {

    if (labInstance.labConfigId == null) {
      throw new BlBadRequestException('Please configure the lab before generate the config file');
    }

    const config = await this.labConfigService.getCompleteConfig(labInstance.labConfigId);

    const configDTO: CnLabInstanceConfigDTO = {
      glabTag: onPremiseConfig.glabTag,
      brickVersions: []
    };

    for (const brickVersion of config.brickVersions) {
      configDTO.brickVersions.push({
        name: brickVersion.brick.name,
        version: brickVersion.version.toString()
      });
    }

    return this.labConfigService.getLabConfigFile(labInstance, configDTO);
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
        url = this.configService.getLabOnPremiseWindowsExeUrl();
        break;
      case CnLabOnPremisePlatform.MAC:
      case CnLabOnPremisePlatform.LINUX:
        name = 'on-premise-start-mac';
        url = this.configService.getLabOnPremiseMacExeUrl();
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
