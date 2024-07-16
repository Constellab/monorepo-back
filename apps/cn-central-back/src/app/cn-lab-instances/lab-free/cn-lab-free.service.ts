import { Injectable } from '@nestjs/common';
import { BlAbstractService } from '@monorepo/back-core-lib';
import { CnLabInstance } from '../cn-lab-instance.entity';
import { ClDateHelper } from '@monorepo/core-lib';
import { EntityManager, In, LessThanOrEqual, Not, Repository } from 'typeorm';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnLabFree } from './cn-lab-free.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CnLabFreeGetDto, CnLabFreeUpdateDto } from './cn-lab-free.dto';
import { CnLabInstanceStatusService } from '../status/cn-lab-instance-status.service';
import { cnLabInstanceRunningStatuses, CnLabInstanceStatus } from '../status/cn-lab-instance-status.enum';

/**
 * Service to configure and manage the free lab instance for users
 */
@Injectable()
export class CnLabFreeService extends BlAbstractService<CnLabFree> {


  constructor(@InjectRepository(CnLabFree) repo: Repository<CnLabFree>,
              private labStatusService: CnLabInstanceStatusService) {
    super(repo, CnLabFree);
  }

  public createFreeLab(user: CnUser, lab: CnLabInstance,
                         hourLimit: number,
                         entityManager: EntityManager): Promise<CnLabFree> {
    const freeLab: CnLabFree = new CnLabFree();
    freeLab.user = user;
    freeLab.labInstance = lab;
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

  public async findFreeLabUsageForLabInstance(labInstanceId: string): Promise<CnLabFreeGetDto> {
    const labFree = await this.findByLabInstanceId(labInstanceId);
    return this.buildUsageDto(labFree);
  }

  private async buildUsageDto(labFree?: CnLabFree): Promise<CnLabFreeGetDto> {

    const freeGetDto: CnLabFreeGetDto = new CnLabFreeGetDto();
    freeGetDto.standardInfo = {
      usageLimitInHours: CnLabFree.HOUR_LIMIT,
      nbCpus: CnLabFree.NB_CPUS,
      ramSize: CnLabFree.RAM_SIZE,
      diskSize: CnLabFree.VOLUME_SIZE,
    };
    freeGetDto.freeLab = labFree;

    if (labFree == null) {
      freeGetDto.status = 'NOT_USED';
      return freeGetDto;
    }
    if(labFree.labInstance == null){
      freeGetDto.status = 'EXPIRED_AND_DELETED';
      return freeGetDto;
    }

    // retrieve for how long the lab was running
    const monthKpi = await this.labStatusService.getLabInstanceRunningKpisWithBilling(
      labFree.labInstance.id, {period: 'CURRENT_MONTH'});
    const monthRunningDuration = monthKpi.runningDuration;

    if (labFree.isExpired()) {
      if (labFree.labInstance.currentStatus.status === CnLabInstanceStatus.NO_SERVER) {
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
    freeGetDto.deletionDate = labFree.getDeletionDate();

    return freeGetDto;

  }

  public async findFreeLabForUser(userId: string): Promise<CnLabFree> {
    return await this.repo.findOne({
      where: {
        user: {id: userId}
      }
    });
  }

  public async freeLabStillValid(labInstanceId: string): Promise<boolean> {
    const labFree = await this.findByLabInstanceId(labInstanceId);

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
        labInstance: {currentStatus: {status: Not(CnLabInstanceStatus.NO_SERVER)}}
      }
    });
  }


  public getRunningFreeTrias(): Promise<CnLabFree[]> {
    return this.repo.find({
      where: {
        labInstance: {
          currentStatus: {status: In([cnLabInstanceRunningStatuses])}
        }
      }
    });
  }

  private findByLabInstanceId(labInstanceId: string): Promise<CnLabFree | null> {
    return this.repo.findOne({
      where: {labInstanceId: labInstanceId}
    });
  }
}
