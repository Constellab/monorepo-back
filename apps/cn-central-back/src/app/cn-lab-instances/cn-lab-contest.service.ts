import { Injectable } from '@nestjs/common';

import { CnCloudProviderName } from '../cn-cloud-providers/cn-cloud-provider.entity';
import { CnLabInstance, CnLabInstanceBillingMode, CnLabInstanceVolumeType } from './cn-lab-instance.entity';
import { CnBrickGWS } from '../cn-bricks/cn-brick.dto';
import { CnLabGreenOptionType } from './green-option/cn-lab-green-option.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnLabFactoryBrick, CnLabFactoryData, CnLabFactoryService } from './cn-lab-factory.service';
import { DataSource } from 'typeorm';
import { CnLabInstanceAggregateService } from './cn-lab-instance-aggregate.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { Type } from 'class-transformer';

export class CnCreateLabContestDto {
  @Type(() => CnUser)
  user: CnUser;
  @Type(() => CnSpace)
  space: CnSpace;
}

/**
 * Service to configure and manage lab for the constellab contest
 */
@Injectable()
export class CnLabContestService {

  // SERVER INFO
  public static readonly CLOUD_PROVIDER: CnCloudProviderName = 'AZURE';
  public static readonly CLOUD_PROVIDER_REGION = 'northeurope';
  public static readonly CLOUD_PROVIDER_INSTANCE_TYPE = 'Standard_D4as_v5';
  public static readonly VOLUME_SIZE = 250;
  public static readonly VOLUME_TYPE = CnLabInstanceVolumeType.HIGH_SPEED;
  public static readonly BILLING_MODE = CnLabInstanceBillingMode.HOURLY;
  public static readonly DOMAIN = CnLabInstance.SUPPORTED_MAIN_DOMAINS[0];

  // CONFIG
  public static readonly BRICKS: CnLabFactoryBrick[] = [{
    name: CnBrickGWS.GWS_CORE,
    version: '0.8.0-beta.3'
  }];

  // GREEN OPTION, stop lab after 30 minutes of inactivity
  public static readonly GREEN_OPTION_TYPE: CnLabGreenOptionType = CnLabGreenOptionType.STOP_AFTER_INACTIVITY_TIME;
  public static readonly GREEN_OPTION_INACTIVITY_DURATION: number = 60;

  constructor(private labFactoryService: CnLabFactoryService,
              private datasource: DataSource,
              private labInstanceAggregateService: CnLabInstanceAggregateService) {
  }

  public async createLabContest(labContest: CnCreateLabContestDto): Promise<CnLabInstance> {
    if(!CnCurrentUserHelper.isAdmin()){
      throw new BlUnauthorizedException();
    }

    const data: CnLabFactoryData = {
      user: labContest.user,
      space: labContest.space,
      domain: CnLabContestService.DOMAIN,
      volumeSize: CnLabContestService.VOLUME_SIZE,
      volumeType: CnLabContestService.VOLUME_TYPE,
      billingMode: CnLabContestService.BILLING_MODE,
      cloudProvider: {
        name: CnLabContestService.CLOUD_PROVIDER,
        region: CnLabContestService.CLOUD_PROVIDER_REGION,
        instanceType: CnLabContestService.CLOUD_PROVIDER_INSTANCE_TYPE
      },
      bricks: CnLabContestService.BRICKS,
      greenOption: {
        type: CnLabContestService.GREEN_OPTION_TYPE,
        inactivityDuration: CnLabContestService.GREEN_OPTION_INACTIVITY_DURATION
      },
      isFreeLab: false
    };

    const labInstance = await this.datasource.transaction(async entityManager => {
      return await this.labFactoryService.createLab(data, entityManager);
    });

    // init the server asynchronously
    await this.labInstanceAggregateService.initServer(labInstance.id);

    return labInstance;
  }
}
