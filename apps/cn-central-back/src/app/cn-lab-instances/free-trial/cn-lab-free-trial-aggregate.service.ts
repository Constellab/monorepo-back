import {Injectable} from '@nestjs/common';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {BlBadRequestException, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {DataSource, EntityManager} from 'typeorm';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnLabInstanceAggregateService} from '../cn-lab-instance-aggregate.service';
import {CnFreeTrialUpdateDto, CnLabFreeTrialGetDto} from './cn-lab-free-trial.dto';
import {CnLabFreeTrialService} from './cn-lab-free-trial.service';
import {CnLabFreeTrial} from './cn-lab-free-trial.entity';
import {CnLabInstanceStatus} from '../status/cn-lab-instance-status.enum';
import {CnLabFactoryData, CnLabFactoryService} from '../cn-lab-factory.service';

/**
 * Service to configure and manage the free trial lab instance for users
 */
@Injectable()
export class CnLabFreeTrialAggregateService {


  constructor(private labFreeTrialService: CnLabFreeTrialService,
              private datasource: DataSource,
              private labInstanceAggregateService: CnLabInstanceAggregateService,
              private labFactoryService: CnLabFactoryService) {
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

    const data: CnLabFactoryData = {
      user: user,
      space: CnCurrentUserHelper.getAndCheckCurrentSpace(),
      domain: CnLabFreeTrial.DOMAIN,
      volumeSize: CnLabFreeTrial.VOLUME_SIZE,
      volumeType: CnLabFreeTrial.VOLUME_TYPE,
      billingMode: CnLabFreeTrial.BILLING_MODE,
      cloudProvider: {
        name: CnLabFreeTrial.CLOUD_PROVIDER,
        region: CnLabFreeTrial.CLOUD_PROVIDER_REGION,
        instanceType: CnLabFreeTrial.CLOUD_PROVIDER_INSTANCE_TYPE
      },
      bricks: CnLabFreeTrial.BRICKS.map(brick => ({name: brick})),
      greenOption: {
        type: CnLabFreeTrial.GREEN_OPTION_TYPE,
        inactivityDuration: CnLabFreeTrial.GREEN_OPTION_INACTIVITY_DURATION
      },
      isFreeTrial: true
    };

    const labInstanceDb = await this.datasource.transaction(async (entityManager) => {
      const labInstanceDb = await this.labFactoryService.createLab(data, entityManager);

      await this.markFreeTrialAsStarted(user, labInstanceDb, entityManager);

      return labInstanceDb;
    });

    // init the server asynchronously
    await this.labInstanceAggregateService.initServer(labInstanceDb.id);

    return labInstanceDb;
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

    if (freeTrial.labInstance && freeTrial.labInstance.currentStatus.status !== CnLabInstanceStatus.NO_SERVER) {
      throw new BlBadRequestException('The lab must be deleted before deleting the free trial');
    }

    await this.labFreeTrialService.deleteById(id);

    return this.labFreeTrialService.findFreeTrialUsageForUser(user.id);
  }
}
