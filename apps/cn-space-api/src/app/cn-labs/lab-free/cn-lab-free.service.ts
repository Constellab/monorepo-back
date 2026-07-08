import { BlAbstractService } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, LessThanOrEqual, Not, Repository } from 'typeorm';

import { CnSettingsService } from '../../cn-settings/cn-settings.service';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnLab, CnLabEntity } from '../cn-lab.entity';
import { CnLabStatsRequestDTO } from '../stats/cn-lab-stats.dto';
import { CnLabStatsAggregateService } from '../stats/cn-lab-stats-aggregate.service';
import { CN_LAB_RUNNING_STATUSES, CnLabStatus } from '../status/cn-lab-status.enum';
import { CnLabFreeGetDto, CnLabFreeUpdateDto } from './cn-lab-free.dto';
import { CnLabFree } from './cn-lab-free.entity';

/**
 * Service to configure and manage the free lab for users
 */
@Injectable()
export class CnLabFreeService extends BlAbstractService<CnLabFree> {
  constructor(
    @InjectRepository(CnLabFree) repo: Repository<CnLabFree>,
    private labStatsAggregateService: CnLabStatsAggregateService,
    private settingsService: CnSettingsService
  ) {
    super(repo, CnLabFree);
  }

  public createFreeLab(
    user: CnUser,
    lab: CnLab,
    hourLimit: number,
    entityManager: EntityManager
  ): Promise<CnLabFree> {
    const freeLab: CnLabFree = new CnLabFree();
    freeLab.user = user;
    freeLab.lab = lab as CnLabEntity;
    freeLab.usageLimitInHours = hourLimit;
    freeLab.expirationDate = null;

    return this.create(freeLab, entityManager);
  }

  public async updateFreeLab(id: string, updateDto: CnLabFreeUpdateDto): Promise<CnLabFreeGetDto> {
    const labFree = await this.updatePartial(id, updateDto);
    return this.buildUsageDto(labFree);
  }

  public async findFreeLabUsageForUser(userId: string): Promise<CnLabFreeGetDto> {
    const labFree = await this.findFreeLabForUser(userId);
    return this.buildUsageDto(labFree);
  }

  public async findFreeLabUsageForLab(labId: string): Promise<CnLabFreeGetDto> {
    const labFree = await this.findByLabId(labId);
    return this.buildUsageDto(labFree);
  }

  private async buildUsageDto(labFree?: CnLabFree | null): Promise<CnLabFreeGetDto> {
    const config = await this.settingsService.getFreeLabConfig();
    const freeGetDto: CnLabFreeGetDto = new CnLabFreeGetDto();
    freeGetDto.standardInfo = {
      usageLimitInHours: config.hourLimit,
      nbCpus: config.nbCpus,
      ramSize: config.ramSize,
      diskSize: config.volumeSize,
    };
    freeGetDto.freeLab = labFree ?? undefined;

    if (labFree == null) {
      freeGetDto.status = 'NOT_USED';
      return freeGetDto;
    }
    if (labFree.lab == null) {
      freeGetDto.status = 'EXPIRED_AND_DELETED';
      return freeGetDto;
    }

    // retrieve for how long the lab was running
    const request = new CnLabStatsRequestDTO('CURRENT_MONTH');
    const monthRunningDuration = await this.labStatsAggregateService.getLabRunningDuration(
      labFree.lab.id,
      request
    );

    if (labFree.isExpired()) {
      if (labFree.lab.currentStatus.status === CnLabStatus.NO_SERVER) {
        freeGetDto.status = 'EXPIRED_AND_DELETED';
      } else {
        freeGetDto.status = 'EXPIRED';
      }
    } else if (monthRunningDuration > labFree.usageLimitInHours * 3600) {
      freeGetDto.status = 'EXPIRED';
    } else {
      freeGetDto.status = 'IN_PROGRESS';
    }

    freeGetDto.currentUsageInSeconds = monthRunningDuration;
    freeGetDto.deletionDate = labFree.getDeletionDate(config.deletionAfterDays);

    return freeGetDto;
  }

  public async findFreeLabForUser(userId: string): Promise<CnLabFree | null> {
    return await this.repo.findOne({
      where: {
        user: { id: userId },
      },
    });
  }

  public async freeLabStillValid(labId: string): Promise<boolean> {
    const labFree = await this.findByLabId(labId);

    if (labFree == null) return false;

    // check the expiration date
    if (labFree.isExpired()) return false;

    // check the hour limit
    const usage = await this.buildUsageDto(labFree);
    // check the number of hours, valid if the current usage is smaller than the usage limit
    return usage.currentUsageInSeconds < labFree.usageLimitInHours * 3600;
  }

  /**
   * Return the expired free labs that are still running
   */
  public async getExpiredFreeLab(): Promise<CnLabFree[]> {
    return this.repo.find({
      where: {
        expirationDate: LessThanOrEqual(ClDateHelper.getDate().toISODate()),
        lab: { currentStatus: { status: Not(CnLabStatus.NO_SERVER) } },
      },
    });
  }

  public getRunningFreeTrias(): Promise<CnLabFree[]> {
    return this.repo.find({
      where: {
        lab: {
          currentStatus: { status: In([CN_LAB_RUNNING_STATUSES]) },
        },
      },
    });
  }

  private findByLabId(labId: string): Promise<CnLabFree | null> {
    return this.repo.findOne({
      where: { labId: labId },
    });
  }
}
