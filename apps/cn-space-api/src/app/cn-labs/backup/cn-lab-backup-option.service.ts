import { BlAbstractService, BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CnCloudProviderRegion } from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnBucket, CnBucketContentType } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnObjectStoragesAggregateService } from '../../cn-object-storages/cn-object-storages-aggregate.service';
import { CnLab, CnLabEntity } from '../cn-lab.entity';
import { CnLabBackupFrequency } from './cn-lab-backup.dto';
import { CnLabBackupOption } from './cn-lab-backup-option.entity';

@Injectable()
export class CnLabBackupOptionService extends BlAbstractService<CnLabBackupOption> {
  constructor(
    @InjectRepository(CnLabBackupOption) repository: Repository<CnLabBackupOption>,
    private objectStorageAggregateService: CnObjectStoragesAggregateService
  ) {
    super(repository, CnLabBackupOption);
  }

  public getBackupS3Prefix(lab: CnLab): string {
    return `${lab.spaceId}/${lab.id}`;
  }

  /**
   * Create 2 backup options for the lab to store backup in 2 different s3 regions
   */
  public async createBackupOptions(
    lab: CnLab,
    dailyBackupRegion: CnCloudProviderRegion,
    weeklyBackupRegion: CnCloudProviderRegion,
    entityManager: EntityManager
  ): Promise<CnLabBackupOption> {
    if (!lab.isCloud()) {
      throw new BlBadRequestException('Lab backup option only available for cloud labs');
    }
    const option = new CnLabBackupOption();
    option.lab = lab as CnLabEntity;

    // configure the daily backup
    const bucket1 = await this.objectStorageAggregateService.getBucketByContentTypeAndRegionNotSecure(
      CnBucketContentType.LAB_BACKUP,
      dailyBackupRegion.id
    );

    if (bucket1.isLabBucket()) {
      throw new BlBadRequestException("Can't use a lab bucket for backup");
    }
    option.bucket1 = bucket1;
    option.frequency1 = CnLabBackupFrequency.DAILY;

    // configure the weekly backup
    const bucket2 = await this.objectStorageAggregateService.getBucketByContentTypeAndRegionNotSecure(
      CnBucketContentType.LAB_BACKUP,
      weeklyBackupRegion.id
    );

    if (bucket2.isLabBucket()) {
      throw new BlBadRequestException("Can't use a lab bucket for backup");
    }

    option.bucket2 = bucket2;
    option.frequency2 = CnLabBackupFrequency.WEEKLY;

    return entityManager.save(option);
  }

  public async deleteBackupOptions(labId: string, entityManager: EntityManager): Promise<void> {
    const option = await this.findByLabId(labId);
    if (option) {
      await entityManager.delete(CnLabBackupOption, option.id);
    }
  }

  public async findByLabId(labId: string): Promise<CnLabBackupOption> {
    return this.repo.findOne({
      where: { lab: { id: labId } },
      relations: {
        bucket1: CnBucket.configRelation,
        bucket2: CnBucket.configRelation,
        lab: true,
      },
    });
  }
}
