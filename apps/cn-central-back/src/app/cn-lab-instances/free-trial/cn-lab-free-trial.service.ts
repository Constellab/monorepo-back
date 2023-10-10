import {Injectable} from '@nestjs/common';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {ClDateHelper} from '@monorepo/core-lib';
import {EntityManager, In, LessThanOrEqual, Not, Repository} from 'typeorm';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnLabFreeTrial} from './cn-lab-free-trial.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {CnFreeTrialUpdateDto, CnLabFreeTrialGetDto} from './cn-lab-free-trial.dto';
import {CnLabInstanceStatusService} from '../status/cn-lab-instance-status.service';
import {cnLabInstanceRunningStatuses, CnLabInstanceStatus} from '../status/cn-lab-instance-status.enum';

/**
 * Service to configure and manage the free trial lab instance for users
 */
@Injectable()
export class CnLabFreeTrialService extends BlAbstractService<CnLabFreeTrial> {


  constructor(@InjectRepository(CnLabFreeTrial) repo: Repository<CnLabFreeTrial>,
              private labStatusService: CnLabInstanceStatusService) {
    super(repo, CnLabFreeTrial);
  }

  public createFreeTrial(user: CnUser, lab: CnLabInstance,
                         hourLimit: number, expiresInDays: number,
                         entityManager: EntityManager): Promise<CnLabFreeTrial> {
    const freeTrials: CnLabFreeTrial = new CnLabFreeTrial();
    freeTrials.user = user;
    freeTrials.labInstance = lab;
    freeTrials.usageLimitInHours = hourLimit;
    freeTrials.expirationDate = ClDateHelper.getDate().plus({days: expiresInDays});

    return this.create(freeTrials, entityManager);
  }

  public async updateFreeTrials(id: string, updateDto: CnFreeTrialUpdateDto): Promise<CnLabFreeTrialGetDto> {
    const freeTrial = await this.updatePartial(id, updateDto);
    return this.buildUsageDto(freeTrial);
  }


  public async findFreeTrialUsageForUser(userId: string): Promise<CnLabFreeTrialGetDto> {
    const freeTrials = await this.findFreeTrialForUser(userId);
    return this.buildUsageDto(freeTrials);
  }

  public async findFreeTrialUsageForLabInstance(labInstanceId: string): Promise<CnLabFreeTrialGetDto> {
    const freeTrials = await this.findByLabInstanceId(labInstanceId);
    return this.buildUsageDto(freeTrials);
  }

  private async buildUsageDto(freeTrials?: CnLabFreeTrial): Promise<CnLabFreeTrialGetDto> {

    const trialDto: CnLabFreeTrialGetDto = new CnLabFreeTrialGetDto();
    trialDto.standardInfo = {
      usageLimitInHours: CnLabFreeTrial.HOUR_LIMIT,
      expirationDays: CnLabFreeTrial.EXPIRATION_DAYS,
      greenOptionInactivityDuration: CnLabFreeTrial.GREEN_OPTION_INACTIVITY_DURATION,
    };

    if (freeTrials == null) {
      trialDto.trialStatus = 'NOT_USED';
      return trialDto;
    }
    if(freeTrials.labInstance == null){
      trialDto.trialStatus = 'EXPIRED_AND_DELETED';
      return trialDto;
    }
    // retrieve for how long the lab was running
    const runStatus = await this.labStatusService.getLabInstanceRunningKpis(freeTrials.labInstance.id, {
      period: 'ALL'
    });

    if (freeTrials.isExpired()) {
      if (freeTrials.labInstance.currentStatus.status === CnLabInstanceStatus.NO_SERVER) {
        trialDto.trialStatus = 'EXPIRED_AND_DELETED';
      } else {
        trialDto.trialStatus = 'EXPIRED';
      }
    } else if (runStatus.runningDuration > freeTrials.usageLimitInHours * 3600) {
      trialDto.trialStatus = 'EXPIRED';
    } else {
      trialDto.trialStatus = 'IN_PROGRESS';
    }

    trialDto.freeTrial = freeTrials;
    trialDto.currentUsageInSeconds = runStatus.runningDuration;
    trialDto.deletionDate = freeTrials.getDeletionDate();

    return trialDto;

  }

  public async findFreeTrialForUser(userId: string): Promise<CnLabFreeTrial> {
    return await this.repo.findOne({
      where: {
        user: {id: userId}
      }
    });
  }

  public async trialLabStillValid(labInstanceId: string): Promise<boolean> {
    const freeTrials = await this.findByLabInstanceId(labInstanceId);

    if (freeTrials == null) return false;

    // check the expiration date
    if (freeTrials.isExpired()) return false;

    // check the hour limit
    const usage = await this.buildUsageDto(freeTrials);
    // check the number of hours, valid if the current usage is smaller than the usage limit
    return usage.currentUsageInSeconds < freeTrials.usageLimitInHours * 3600;
  }

  /**
   * Return the expired free trials that are still running
   */
  public async getExpiredFreeTrials(): Promise<CnLabFreeTrial[]> {
    return this.repo.find({
      where: {
        expirationDate: LessThanOrEqual(ClDateHelper.getDate().toISODate()),
        labInstance: {currentStatus: {status: Not(CnLabInstanceStatus.NO_SERVER)}}
      }
    });
  }


  public getRunningFreeTrias(): Promise<CnLabFreeTrial[]> {
    return this.repo.find({
      where: {
        labInstance: {
          currentStatus: {status: In([cnLabInstanceRunningStatuses])}
        }
      }
    });
  }

  private findByLabInstanceId(labInstanceId: string): Promise<CnLabFreeTrial | null> {
    return this.repo.findOne({
      where: {labInstanceId: labInstanceId}
    });
  }
}
