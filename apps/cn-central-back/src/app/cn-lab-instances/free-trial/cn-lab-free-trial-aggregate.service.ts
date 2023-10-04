import {Injectable} from '@nestjs/common';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {BlBadRequestException, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {CnBrickVersionDTO} from '../../cn-bricks/cn-brick.dto';
import {CnLabConfig} from '../../cn-lab-configs/cn-lab-config.entity';
import {CnLabConfigDto} from '../../cn-lab-configs/cn-lab-config.dto';
import {CnBrickVersion} from '../../cn-bricks/cn-brick-version.entity';
import {CnBricksService} from '../../cn-bricks/cn-bricks.service';
import {CnLabConfigsService} from '../../cn-lab-configs/cn-lab-configs.service';
import {CnLabInstance, CnLabInstanceType} from '../cn-lab-instance.entity';
import {ClStringHelper} from '@monorepo/core-lib';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnServersInfoService} from '../../cn-servers-info/cn-servers-info.service';
import {CnServerInfo} from '../../cn-servers-info/cn-server-info.entity';
import {DataSource, EntityManager} from 'typeorm';
import {CnLabGreenOptionService} from '../green-option/cn-lab-green-option.service';
import {CnLabGreenOptionFormDto} from '../green-option/cn-lab-green-option.dto';
import {CnLabGreenOptionStopAfterInactivityValue} from '../green-option/cn-lab-green-option.entity';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnLabInstanceUserService} from '../user/cn-lab-instance-user.service';
import {CnLabInstanceUserRole} from '../user/cn-lab-instance-user.entity';
import {CnCloudProviderAggregateService} from '../../cn-cloud-providers/cn-cloud-provider-aggregate.service';
import {CnLabInstanceAggregateService} from '../cn-lab-instance-aggregate.service';
import {CnFreeTrialUpdateDto, CnLabFreeTrialGetDto} from './cn-lab-free-trial.dto';
import {CnLabFreeTrialService} from './cn-lab-free-trial.service';
import {CnLabFreeTrial} from './cn-lab-free-trial.entity';
import {CnLabInstanceStatus} from '../status/cn-lab-instance-status.enum';

/**
 * Service to configure and manage the free trial lab instance for users
 */
@Injectable()
export class CnLabFreeTrialAggregateService {


  constructor(private labFreeTrialService: CnLabFreeTrialService,
              private brickService: CnBricksService,
              private labConfigService: CnLabConfigsService,
              private labInstanceService: CnLabInstancesService,
              private cloudProviderAggregateService: CnCloudProviderAggregateService,
              private serversInfoService: CnServersInfoService,
              private datasource: DataSource,
              private greenOptions: CnLabGreenOptionService,
              private labUserService: CnLabInstanceUserService,
              private labInstanceAggregateService: CnLabInstanceAggregateService) {
  }

  public async createFreeTrialLabInstanceCurrentUser(): Promise<CnLabInstance> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    return await this.createFreeTrialLabInstance(user);
  }

  private async createFreeTrialLabInstance(user: CnUser): Promise<CnLabInstance> {
    const freeTrial = await this.labFreeTrialService.findFreeTrialForUser(user.id);
    if (freeTrial != null) {
      throw new BlBadRequestException(
        'You already used your free trial lab. Please contact the Constellab support to start working with a real lab.');
    }

    let labInstance: CnLabInstance = new CnLabInstance();
    labInstance.name = ClStringHelper.generateUUID();
    labInstance.virtualHost = `${labInstance.name}.${CnLabFreeTrial.DOMAIN}`;
    labInstance.space = CnCurrentUserHelper.getAndCheckCurrentSpace();
    labInstance.type = CnLabInstanceType.CLOUD;
    labInstance.labConfig = await this.getLabConfig();
    labInstance.region = await this.getRegion();
    labInstance.serverInfo = await this.getServerInfo();
    labInstance.volumeSize = CnLabFreeTrial.VOLUME_SIZE;
    labInstance.volumeType = CnLabFreeTrial.VOLUME_TYPE;
    labInstance.billingMode = CnLabFreeTrial.BILLING_MODE;
    labInstance.isFreeTrial = true;

    const dailyBackupRegion = await this.cloudProviderAggregateService.getDefaultS3Region1();
    const weeklyBackupRegion = await this.cloudProviderAggregateService.getDefaultS3Region2();

    const labInstanceDb = await this.datasource.transaction(async (entityManager) => {
      labInstance = await this.labInstanceAggregateService.createLabNotSecure(labInstance,
        dailyBackupRegion, weeklyBackupRegion, entityManager);

      await this.addUserToLabInstance(labInstance, user, entityManager);

      await this.createGreenOptions(labInstance, entityManager);

      await this.markFreeTrialAsStarted(user, labInstance, entityManager);

      return labInstance;
    });

    // init the server asynchronously
    await this.labInstanceAggregateService.initServer(labInstance.id);

    return labInstanceDb;
  }

  private async getRegion(): Promise<CnCloudProviderRegion> {
    return await this.cloudProviderAggregateService.findRegionByCloudProviderNameAndTechnicalName(
      CnLabFreeTrial.CLOUD_PROVIDER, CnLabFreeTrial.CLOUD_PROVIDER_REGION);
  }

  private async getServerInfo(): Promise<CnServerInfo> {
    return await this.serversInfoService.findByCloudProviderAndName(CnLabFreeTrial.CLOUD_PROVIDER,
      CnLabFreeTrial.CLOUD_PROVIDER_INSTANCE_TYPE);
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
    for (const brick of CnLabFreeTrial.BRICKS) {
      configDto.brick_versions.push(await this.getLatestBrickVersion(brick));
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

  private async createGreenOptions(labInstance: CnLabInstance, entityManager?: EntityManager): Promise<void> {
    const greenOptions: CnLabGreenOptionFormDto = {
      type: CnLabFreeTrial.GREEN_OPTION_TYPE,
      value: {
        inactivityDuration: CnLabFreeTrial.GREEN_OPTION_INACTIVITY_DURATION
      } as CnLabGreenOptionStopAfterInactivityValue,
      isPersistent: true
    };
    await this.greenOptions.createFromDTO(greenOptions, labInstance, entityManager);
  }

  private async markFreeTrialAsStarted(user: CnUser, lab: CnLabInstance, entityManager: EntityManager): Promise<void> {
    await this.labFreeTrialService.createFreeTrial(user, lab, CnLabFreeTrial.HOUR_LIMIT, CnLabFreeTrial.EXPIRATION_DAYS, entityManager);
  }

  public findFreeTrialUsageForCurrentUser(): Promise<CnLabFreeTrialGetDto> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    return this.labFreeTrialService.findFreeTrialUsageForUser(user.id);
  }

  public findFreeTrialUsageForUserAndCheck(userId: string): Promise<CnLabFreeTrialGetDto> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException('You are not allowed to access this resource');
    }
    return this.labFreeTrialService.findFreeTrialUsageForUser(userId);
  }

  public async findFreeTrialUsageForLabInstanceAndCheck(labInstanceId: string): Promise<CnLabFreeTrialGetDto> {
    // check that the user can get the lab instance
    await this.labInstanceAggregateService.findByIdAndCheck(labInstanceId);

    return this.labFreeTrialService.findFreeTrialUsageForLabInstance(labInstanceId);
  }

  public updateFreeTrials(id: string, updateDTO: CnFreeTrialUpdateDto): Promise<CnLabFreeTrialGetDto> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException('You are not allowed to modify this resource');
    }

    return this.labFreeTrialService.updateFreeTrials(id, updateDTO);
  }

  public async deleteFreeTrial(id: string): Promise<CnLabFreeTrialGetDto> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException('You are not allowed to modify this resource');
    }

    const freeTrial = await this.labFreeTrialService.findByIdAndCheck(id);

    const user = freeTrial.user;

    if (freeTrial.labInstance.currentStatus.status !== CnLabInstanceStatus.NO_SERVER) {
      throw new BlBadRequestException('The lab must be deleted before deleting the free trial');
    }

    await this.labFreeTrialService.deleteById(id);

    return this.labFreeTrialService.findFreeTrialUsageForUser(user.id);
  }
}
