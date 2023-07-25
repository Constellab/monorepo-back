import {Injectable} from '@nestjs/common';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {BlBadRequestException, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {CnBrickGWS, CnBrickVersionDTO} from '../../cn-bricks/cn-brick.dto';
import {CnLabConfig} from '../../cn-lab-configs/cn-lab-config.entity';
import {CnLabConfigDto} from '../../cn-lab-configs/cn-lab-config.dto';
import {CnBrickVersion} from '../../cn-bricks/cn-brick-version.entity';
import {CnBricksService} from '../../cn-bricks/cn-bricks.service';
import {CnLabConfigsService} from '../../cn-lab-configs/cn-lab-configs.service';
import {
  CnLabInstance,
  CnLabInstanceBillingMode,
  CnLabInstanceType,
  CnLabInstanceVolumeType
} from '../cn-lab-instance.entity';
import {ClDateHelper, ClStringHelper} from '@monorepo/core-lib';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnServersInfoService} from '../../cn-servers-info/cn-servers-info.service';
import {CnServerInfo} from '../../cn-servers-info/cn-server-info.entity';
import {CnSpaceUserService} from '../../cn-spaces/cn-space-user.service';
import {CnSpace} from '../../cn-spaces/cn-space.entity';
import {DataSource, EntityManager} from 'typeorm';
import {CnLabGreenOptionService} from '../green-option/cn-lab-green-option.service';
import {CnLabGreenOptionFormDto} from '../green-option/cn-lab-green-option.dto';
import {
  CnLabGreenOptionStopAfterInactivityValue,
  CnLabGreenOptionType
} from '../green-option/cn-lab-green-option.entity';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnLabInstanceUserService} from '../user/cn-lab-instance-user.service';
import {CnLabInstanceUserRole} from '../user/cn-lab-instance-user.entity';
import {CnUsersService} from '../../cn-users/cn-users.service';
import {CnCloudProviderAggregateService} from '../../cn-cloud-providers/cn-cloud-provider-aggregate.service';
import {CnLabInstanceAggregateService} from '../cn-lab-instance-aggregate.service';

/**
 * Service to configure and manage the free trial lab instance for users
 */
@Injectable()
export class CnLabFreeTrialService {

  private readonly CLOUD_PROVIDER: CnCloudProviderName = 'AZURE';
  private readonly CLOUD_PROVIDER_REGION = 'northeurope';
  private readonly CLOUD_PROVIDER_INSTANCE_TYPE = 'Standard_B2s';
  private readonly VOLUME_SIZE = 500;
  private readonly VOLUME_TYPE = CnLabInstanceVolumeType.HIGH_SPEED;
  private readonly BILLING_MODE = CnLabInstanceBillingMode.HOURLY;
  private readonly domain = CnLabInstancesService.SUPPORTED_MAIN_DOMAINS[0];

  constructor(private brickService: CnBricksService,
              private labConfigService: CnLabConfigsService,
              private labInstanceService: CnLabInstancesService,
              private cloudProviderAggregateService: CnCloudProviderAggregateService,
              private serversInfoService: CnServersInfoService,
              private spaceUsersService: CnSpaceUserService,
              private datasource: DataSource,
              private greenOptions: CnLabGreenOptionService,
              private labUserService: CnLabInstanceUserService,
              private userService: CnUsersService,
              private labInstanceAggregateService: CnLabInstanceAggregateService) {
  }

  public async createFreeTrialLabInstanceCurrentUser(): Promise<CnLabInstance> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    return await this.createFreeTrialLabInstance(user);
  }

  public async createFreeTrialLabInstanceForUser(userId: string): Promise<CnLabInstance> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException('Only admin can create free trial lab instance for user');
    }
    const user = await this.userService.findByIdAndCheck(userId);
    return await this.createFreeTrialLabInstance(user);
  }

  private async createFreeTrialLabInstance(user: CnUser): Promise<CnLabInstance> {

    // if (user.labTrialStatDate != null) {
    //   throw new BlBadRequestException('You already used your free trial lab. Please contact us to get more information.');
    // }

    let labInstance: CnLabInstance = new CnLabInstance();
    labInstance.name = ClStringHelper.generateUUID();
    labInstance.virtualHost = `${labInstance.name}.${this.domain}`;
    labInstance.space = await this.getUserSpace(user.id);
    labInstance.type = CnLabInstanceType.CLOUD;
    labInstance.labConfig = await this.getLabConfig();
    labInstance.region = await this.getRegion();
    labInstance.serverInfo = await this.getServerInfo();
    labInstance.volumeSize = this.VOLUME_SIZE;
    labInstance.volumeType = this.VOLUME_TYPE;
    labInstance.billingMode = this.BILLING_MODE;

    const labInstanceDb = await this.datasource.transaction(async (entityManager) => {
      labInstance = await this.labInstanceService.create(labInstance, entityManager);

      await this.addUserToLabInstance(labInstance, user, entityManager);

      await this.createGreenOptions(labInstance, entityManager);

      await this.markFreeTrialAsStarted(user, entityManager);

      return labInstance;
    });

    await this.labInstanceAggregateService.initServer(labInstance.id);

    return labInstanceDb;

  }

  private async getUserSpace(userId: string): Promise<CnSpace> {
    const space = await this.spaceUsersService.getUserDefaultSpace(userId);

    if (space == null) {
      throw new BlBadRequestException(`No space found for your user`);
    }
    return space;
  }

  private async getRegion(): Promise<CnCloudProviderRegion> {
    return await this.cloudProviderAggregateService.findRegionByCloudProviderNameAndTechnicalName(
      this.CLOUD_PROVIDER, this.CLOUD_PROVIDER_REGION);
  }

  private async getServerInfo(): Promise<CnServerInfo> {
    return await this.serversInfoService.findByCloudProviderAndName(this.CLOUD_PROVIDER, this.CLOUD_PROVIDER_INSTANCE_TYPE);
  }


  /**
   * Return the lab config for the free trial lab instance
   * @private
   */
  private async getLabConfig(): Promise<CnLabConfig> {
    const configDto: CnLabConfigDto = {
      version: 1,
      brick_versions: []
    };

    // set latest version for GWS_CORE and GWS_ACADEMY
    configDto.brick_versions.push(await this.getLatestBrickVersion(CnBrickGWS.GWS_CORE));
    configDto.brick_versions.push(await this.getLatestBrickVersion(CnBrickGWS.GWS_ACADEMY));

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

  private async createGreenOptions(labInstance: CnLabInstance, entityManager?: EntityManager): Promise<void> {
    const greenOptions: CnLabGreenOptionFormDto = {
      type: CnLabGreenOptionType.STOP_AFTER_INACTIVITY_TIME,
      value: {
        inactivityDuration: 60
      } as CnLabGreenOptionStopAfterInactivityValue,
      isPersistent: true
    };
    await this.greenOptions.createFromDTO(greenOptions, labInstance, entityManager);
  }

  private async markFreeTrialAsStarted(user: CnUser, entityManager: EntityManager): Promise<void> {
    user.labTrialStatDate = ClDateHelper.getDate();
    await this.userService.update(user, entityManager);
  }
}
