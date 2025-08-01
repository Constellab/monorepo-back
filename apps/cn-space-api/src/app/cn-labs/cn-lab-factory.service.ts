import { BlBadRequestException } from '@monorepo/back-core-lib';
import { ClStringHelper } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { CnBrickGWS, CnBrickVersionDTO } from '../cn-bricks/cn-brick.dto';
import { CnBrickVersion } from '../cn-bricks/cn-brick-version.entity';
import { CnBricksService } from '../cn-bricks/cn-bricks.service';
import { CnCloudProviderName } from '../cn-cloud-providers/cn-cloud-provider.entity';
import { CnCloudProviderAggregateService } from '../cn-cloud-providers/cn-cloud-provider-aggregate.service';
import { CnCloudProviderRegion } from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnLabConfigDto } from '../cn-lab-configs/cn-lab-config.dto';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import { CnLabConfigsService } from '../cn-lab-configs/cn-lab-configs.service';
import { CnServerCloud } from '../cn-servers-info/server-cloud/cn-server-cloud.entity';
import { CnServerCloudService } from '../cn-servers-info/server-cloud/cn-server-cloud.service';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnLabBillingMode, CnLabEntity, CnLabType } from './cn-lab.entity';
import { CnLabAggregateService } from './cn-lab-aggregate.service';
import { CnLabGreenOptionFormDto } from './green-option/cn-lab-green-option.dto';
import {
  CnLabGreenOptionStopAfterInactivityValue,
  CnLabGreenOptionType,
} from './green-option/cn-lab-green-option.entity';
import { CnLabGreenOptionService } from './green-option/cn-lab-green-option.service';
import { CnLabUserRole } from './user/cn-lab-user.entity';
import { CnLabUserService } from './user/cn-lab-user.service';
import { CnLabVolumeType } from './volume/cn-lab-volume-entity';

export interface CnLabFactoryBrick {
  name: CnBrickGWS;
  version?: string; // if not provided, the latest version will be used
}

export interface CnLabFactoryGreenOption {
  type: CnLabGreenOptionType;
  inactivityDuration: number;
}

export interface CnLabFactoryData {
  name?: string;
  user: CnUser;
  space: CnSpace;
  domain: string;
  volumeSize: number;
  volumeType: CnLabVolumeType;
  billingMode: CnLabBillingMode;
  cloudProvider: {
    name: CnCloudProviderName;
    region: string;
    instanceType: string;
  };
  bricks: CnLabFactoryBrick[];
  greenOption?: CnLabFactoryGreenOption;
  isFreeLab: boolean;
}

/**
 * Service to quickly configure and create a lab
 */
@Injectable()
export class CnLabFactoryService {
  constructor(
    private brickService: CnBricksService,
    private labConfigService: CnLabConfigsService,
    private cloudProviderAggregateService: CnCloudProviderAggregateService,
    private serverCloudService: CnServerCloudService,
    private greenOptions: CnLabGreenOptionService,
    private labUserService: CnLabUserService,
    private labAggregateService: CnLabAggregateService
  ) {}

  public async createLab(data: CnLabFactoryData, entityManager: EntityManager): Promise<CnLabEntity> {
    const lab: CnLabEntity = new CnLabEntity();
    lab.name = data.name ?? ClStringHelper.generateUUID();
    lab.virtualHost = `${ClStringHelper.generateUUID()}.${data.domain}`;
    lab.space = data.space;
    lab.type = CnLabType.CLOUD;
    lab.labConfig = await this.getLabConfig(data.bricks);
    lab.region = await this.getRegion(data.cloudProvider.name, data.cloudProvider.region);
    lab.serverCloud = await this.getServerCloud(data.cloudProvider.name, data.cloudProvider.instanceType);
    lab.billingMode = data.billingMode;
    lab.isFreeLab = data.isFreeLab;

    const labDb = await this.labAggregateService.createLabNotSecure(
      lab,
      data.volumeSize,
      data.volumeType,
      null,
      null,
      entityManager
    );

    await this.addUserToLab(labDb, data.user, entityManager);

    if (data.greenOption) {
      await this.createGreenOptions(labDb, data.greenOption, entityManager);
    }

    return labDb;
  }

  private async getRegion(
    cloudProvider: CnCloudProviderName,
    regionName: string
  ): Promise<CnCloudProviderRegion> {
    const region =
      await this.cloudProviderAggregateService.findServerRegionByCloudProviderNameAndTechnicalName(
        cloudProvider,
        regionName
      );
    if (!region) {
      throw new BlBadRequestException(
        `No region found for cloud provider ${cloudProvider} and region ${regionName}`
      );
    }
    return region;
  }

  private async getServerCloud(
    cloudProvider: CnCloudProviderName,
    instanceType: string
  ): Promise<CnServerCloud> {
    const serverInfo = await this.serverCloudService.findByCloudProviderAndName(cloudProvider, instanceType);
    if (!serverInfo) {
      throw new BlBadRequestException(
        `No server info found for cloud provider ${cloudProvider} and instance type ${instanceType}`
      );
    }
    return serverInfo;
  }

  /**
   * Return the lab config for the lab
   * @private
   */
  private async getLabConfig(bricks: CnLabFactoryBrick[]): Promise<CnLabConfig> {
    const configDto: CnLabConfigDto = {
      version: 1,
      brick_versions: [],
    };

    for (const brick of bricks) {
      if (!brick.version) {
        configDto.brick_versions.push(await this.getLatestBrickVersion(brick.name));
      } else {
        configDto.brick_versions.push({
          name: brick.name,
          version: brick.version,
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
      version: gwsCoreVersion.version.toString(),
    };
  }

  private async addUserToLab(lab: CnLabEntity, user: CnUser, entityManager?: EntityManager): Promise<void> {
    await this.labUserService.createLabUser(lab, user, CnLabUserRole.OWNER, entityManager);
  }

  private async createGreenOptions(
    lab: CnLabEntity,
    greenOption: CnLabFactoryGreenOption,
    entityManager: EntityManager
  ): Promise<void> {
    const greenOptions: CnLabGreenOptionFormDto = {
      type: greenOption.type,
      value: {
        inactivityDuration: greenOption.inactivityDuration,
      } as CnLabGreenOptionStopAfterInactivityValue,
      isPersistent: true,
    };
    await this.greenOptions.createFromDTO(greenOptions, lab, entityManager);
  }
}
