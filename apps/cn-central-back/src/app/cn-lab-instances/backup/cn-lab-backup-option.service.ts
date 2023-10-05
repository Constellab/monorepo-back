import {Injectable} from '@nestjs/common';
import {BlAbstractService, BlBadRequestException} from '@monorepo/back-core-lib';
import {CnLabBackupOption} from './cn-lab-backup-option.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnObjectStoragesAggregateService} from '../../cn-object-storages/cn-object-storages-aggregate.service';
import {CnBucket, CnBucketContentType} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import {CnLabBackupFrequency} from './cn-lab-backup.dto';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';


@Injectable()
export class CnLabBackupOptionService extends BlAbstractService<CnLabBackupOption> {

  constructor(@InjectRepository(CnLabBackupOption) repository: Repository<CnLabBackupOption>,
              private objectStorageAggregateService: CnObjectStoragesAggregateService) {
    super(repository, CnLabBackupOption);
  }

  /**
   * Create 2 backup options for the lab instance to store backup in 2 different s3 regions
   */
  public async createBackupOptions(labInstance: CnLabInstance, dailyBackupRegion: CnCloudProviderRegion,
                                   weeklyBackupRegion: CnCloudProviderRegion,
                                   entityManager: EntityManager): Promise<CnLabBackupOption> {
    if (!labInstance.isCloud()) {
      throw new BlBadRequestException('Lab backup option only available for cloud lab instances');
    }
    const option = new CnLabBackupOption();
    option.labInstance = labInstance;

    // configure the daily backup
    option.bucket1 = await this.objectStorageAggregateService.createObjectBucket(
      CnObjectStoragesAggregateService.LabBackupCredentialName,
      dailyBackupRegion, 'lab-backup-daily-' + labInstance.id, labInstance.spaceId, CnBucketContentType.LAB_BACKUP,
      labInstance.id, entityManager);
    option.frequency1 = CnLabBackupFrequency.DAILY;

    // configure the weekly backup
    option.bucket2 = await this.objectStorageAggregateService.createObjectBucket(
      CnObjectStoragesAggregateService.LabBackupCredentialName,
      weeklyBackupRegion, 'lab-backup-weekly-' + labInstance.id, labInstance.spaceId, CnBucketContentType.LAB_BACKUP,
      labInstance.id, entityManager);
    option.frequency2 = CnLabBackupFrequency.WEEKLY;

    return entityManager.save(option);
  }

  public async findByLabId(labInstanceId: string): Promise<CnLabBackupOption> {
    return this.repo.findOne(
      {
        where: {labInstance: {id: labInstanceId}},
        relations: {
          bucket1: CnBucket.configRelation,
          bucket2: CnBucket.configRelation
        }
      });
  }

  public async deleteBackupOptions(labInstanceId: string, entityManager: EntityManager): Promise<void> {
    const option = await this.findByLabId(labInstanceId);
    if (option) {
      await entityManager.delete(CnLabBackupOption, option.id);

      await this.objectStorageAggregateService.deleteBucketNotSecure(option.bucket1, entityManager);
      await this.objectStorageAggregateService.deleteBucketNotSecure(option.bucket2, entityManager);
    }

  }
}
