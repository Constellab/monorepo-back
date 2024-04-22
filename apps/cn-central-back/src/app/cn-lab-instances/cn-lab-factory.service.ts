import {
  CnLabInstance,
  CnLabInstanceBillingMode,
  CnLabInstanceType,
  CnLabInstanceVolumeType
} from './cn-lab-instance.entity';
import {CnBrickGWS, CnBrickVersionDTO} from '../cn-bricks/cn-brick.dto';
import {
  CnLabGreenOptionStopAfterInactivityValue,
  CnLabGreenOptionType
} from './green-option/cn-lab-green-option.entity';
import {CnBricksService} from '../cn-bricks/cn-bricks.service';
import {CnLabConfigsService} from '../cn-lab-configs/cn-lab-configs.service';
import {CnCloudProviderAggregateService} from '../cn-cloud-providers/cn-cloud-provider-aggregate.service';
import {CnServersInfoService} from '../cn-servers-info/cn-servers-info.service';
import {EntityManager} from 'typeorm';
import {CnLabGreenOptionService} from './green-option/cn-lab-green-option.service';
import {CnLabInstanceUserService} from './user/cn-lab-instance-user.service';
import {CnLabInstanceAggregateService} from './cn-lab-instance-aggregate.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {ClStringHelper} from '@monorepo/core-lib';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnServerInfo} from '../cn-servers-info/cn-server-info.entity';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabConfigDto} from '../cn-lab-configs/cn-lab-config.dto';
import {CnBrickVersion} from '../cn-bricks/cn-brick-version.entity';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {CnLabInstanceUserRole} from './user/cn-lab-instance-user.entity';
import {CnLabGreenOptionFormDto} from './green-option/cn-lab-green-option.dto';
import {Injectable} from '@nestjs/common';
import {CnCloudProviderName} from '../cn-cloud-providers/cn-cloud-provider.entity';
import {CnSpace} from '../cn-spaces/cn-space.entity';

export interface CnLabFactoryBrick {
  name: CnBrickGWS;
  version?: string; // if not provided, the latest version will be used
}

export interface CnLabFactoryGreenOption {
  type: CnLabGreenOptionType;
  inactivityDuration: number;
}


export interface CnLabFactoryData {
  user: CnUser;
  space: CnSpace;
  domain: string;
  volumeSize: number;
  volumeType: CnLabInstanceVolumeType;
  billingMode: CnLabInstanceBillingMode;
  cloudProvider: {
    name: CnCloudProviderName;
    region: string;
    instanceType: string;
  },
  bricks: CnLabFactoryBrick[];
  greenOption: CnLabFactoryGreenOption;
  isFreeTrial: boolean;
}

/**
 * Service to quickly configure and create a lab instance
 */
@Injectable()
export class CnLabFactoryService {

  constructor(private brickService: CnBricksService,
              private labConfigService: CnLabConfigsService,
              private cloudProviderAggregateService: CnCloudProviderAggregateService,
              private serversInfoService: CnServersInfoService,
              private greenOptions: CnLabGreenOptionService,
              private labUserService: CnLabInstanceUserService,
              private labInstanceAggregateService: CnLabInstanceAggregateService) {
  }

  public async createLab(data: CnLabFactoryData, entityManager: EntityManager): Promise<CnLabInstance> {

    const labInstance: CnLabInstance = new CnLabInstance();
    labInstance.name = ClStringHelper.generateUUID();
    labInstance.virtualHost = `${labInstance.name}.${data.domain}`;
    labInstance.space = data.space;
    labInstance.type = CnLabInstanceType.CLOUD;
    labInstance.labConfig = await this.getLabConfig(data.bricks);
    labInstance.region = await this.getRegion(data.cloudProvider.name, data.cloudProvider.region);
    labInstance.serverInfo = await this.getServerInfo(data.cloudProvider.name, data.cloudProvider.instanceType);
    labInstance.volumeSize = data.volumeSize;
    labInstance.volumeType = data.volumeType;
    labInstance.billingMode = data.billingMode;
    labInstance.isFreeTrial = data.isFreeTrial;

    const dailyBackupRegion = await this.cloudProviderAggregateService.getDefaultS3Region1();
    const weeklyBackupRegion = await this.cloudProviderAggregateService.getDefaultS3Region2();

    const labInstanceDb = await this.labInstanceAggregateService.createLabNotSecure(labInstance,
      dailyBackupRegion, weeklyBackupRegion, entityManager);

    await this.addUserToLabInstance(labInstanceDb, data.user, entityManager);

    await this.createGreenOptions(labInstanceDb, data.greenOption, entityManager);

    return labInstanceDb;
  }

  private async getRegion(cloudProvider: CnCloudProviderName, regionName: string): Promise<CnCloudProviderRegion> {
    const region = await this.cloudProviderAggregateService.findRegionByCloudProviderNameAndTechnicalName(
      cloudProvider, regionName);
    if (!region) {
      throw new BlBadRequestException(`No region found for cloud provider ${cloudProvider} and region ${regionName}`);
    }
    return region;
  }

  private async getServerInfo(cloudProvider: CnCloudProviderName, instanceType: string): Promise<CnServerInfo> {
    const serverInfo = await this.serversInfoService.findByCloudProviderAndName(cloudProvider, instanceType);
    if(!serverInfo){
      throw new BlBadRequestException(`No server info found for cloud provider ${cloudProvider} and instance type ${instanceType}`);
    }
    return serverInfo;
  }


  /**
   * Return the lab config for the free trial lab instance
   * @private
   */
  private async getLabConfig(bricks: CnLabFactoryBrick[]): Promise<CnLabConfig> {
    const configDto: CnLabConfigDto = {
      version: 1,
      brick_versions: []
    };

    for (const brick of bricks) {
      if (!brick.version) {
        configDto.brick_versions.push(await this.getLatestBrickVersion(brick.name));
      } else {
        configDto.brick_versions.push({
          name: brick.name,
          version: brick.version
        });
      }
    }

    return await this.labConfigService.getOrCreateLabConfig(configDto);
  }

  private async getLatestBrickVersion(brickName: string): Promise<CnBrickVersionDTO> {
    const gwsCoreVersion: CnBrickVersion = await this.brickService.getBrickLatestVersion(brickName);
    if (!gwsCoreVersion) {
      throw new BlBadRequestException(`No version found for brick ${brickName}`);
    }
    return {
      name: brickName,
      version: gwsCoreVersion.version.toString()
    };
  }

  private async addUserToLabInstance(labInstance: CnLabInstance, user: CnUser, entityManager?: EntityManager): Promise<void> {
    await this.labUserService.createLabInstanceUser(labInstance, user, CnLabInstanceUserRole.OWNER, entityManager);
  }

  private async createGreenOptions(labInstance: CnLabInstance, greenOption: CnLabFactoryGreenOption,
                                   entityManager: EntityManager): Promise<void> {
    const greenOptions: CnLabGreenOptionFormDto = {
      type: greenOption.type,
      value: {
        inactivityDuration: greenOption.inactivityDuration
      } as CnLabGreenOptionStopAfterInactivityValue,
      isPersistent: true
    };
    await this.greenOptions.createFromDTO(greenOptions, labInstance, entityManager);
  }
}
