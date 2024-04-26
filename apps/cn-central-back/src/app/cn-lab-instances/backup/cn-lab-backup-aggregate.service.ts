import {Injectable, Logger} from '@nestjs/common';
import {CnLabBackupHistoryService} from './cn-lab-backup-history.service';
import {CnLabBackupOptionService} from './cn-lab-backup-option.service';
import {DataSource, EntityManager} from 'typeorm';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {
  CnCloudProviderRegion
} from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnLabBackupOption} from './cn-lab-backup-option.entity';
import {CnLabBackupHistory} from './cn-lab-backup-history.entity';
import {BlBadRequestException, BlObjectStorageService} from '@monorepo/back-core-lib';
import {CnExternalLabBackupInfoDTO} from '../../cn-external-lab-api/model/cn-external-lab-api.class';
import {ClPageI} from '@monorepo/core-lib';
import {CnLabManagerService} from '../cn-lab-manager.service';
import {
  CnLabBackupBucket,
  CnLabBackupFrequency,
  CnLabBackupStatusDTO,
  CnLabCheckBackupSizeDTO
} from './cn-lab-backup.dto';
import {CnBucket} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';


@Injectable()
export class CnLabBackupAggregateService {
  private readonly logger = new Logger(CnLabBackupAggregateService.name);

  constructor(private backupHistoryService: CnLabBackupHistoryService,
              private backupOptionService: CnLabBackupOptionService,
              private labManagerService: CnLabManagerService,
              private objectStorageService: BlObjectStorageService,
              private datasource: DataSource) {
  }

  //////////////////////////// BACKUP OPTIONS ////////////////////////////

  /**
   * Create 2 backup options for the lab instance to store backup in 2 different s3 regions
   */
  public async createBackupOptions(labInstance: CnLabInstance, dailyBackupRegion: CnCloudProviderRegion,
                                   weeklyBackupRegion: CnCloudProviderRegion,
                                   entityManager: EntityManager): Promise<CnLabBackupOption> {
    return this.backupOptionService.createBackupOptions(labInstance, dailyBackupRegion,
      weeklyBackupRegion, entityManager);
  }

  /**
   * Before deleting the backup options, we check that no backup exists
   */
  public async deleteBackupOptions(labInstance: CnLabInstance, entityManager: EntityManager): Promise<void> {
    // check if some backup exists
    const backupStatus = await this.checkBackupsSize(labInstance);

    for (const status of backupStatus) {
      if (status.status !== 'NONE') {
        throw new BlBadRequestException('Cannot delete the backup options some backup are referenced ' +
          'in the history. Please delete the lab backup first.');
      }

      if (status.nbDocumentsInBucket > 0 || status.sizeInBucket > 0) {
        throw new BlBadRequestException('Cannot delete the backup options because some backups ' +
          'file still exists. Please delete the lab backup first.');
      }
    }

    return this.backupOptionService.deleteBackupOptions(labInstance.id, entityManager);
  }

  //////////////////////////// BACKUP STATUS ////////////////////////////
  /**
   * Get the status of all the backups for the lab instance
   */
  public async getBackupsStatus(labInstance: CnLabInstance): Promise<CnLabBackupStatusDTO[]> {
    const labOptions = await this.backupOptionService.findByLabId(labInstance.id);
    if (labOptions == null) return [];

    const backupStatus1 = await this.getBackupStatus(labInstance, labOptions.frequency1, labOptions.bucket1.region);
    const backupStatus2 = await this.getBackupStatus(labInstance, labOptions.frequency2, labOptions.bucket2.region);

    return [backupStatus1, backupStatus2];
  }

  private async getBackupStatus(labInstance: CnLabInstance, frequency: CnLabBackupFrequency,
                                region: CnCloudProviderRegion): Promise<CnLabBackupStatusDTO> {
    const backupStatus = new CnLabBackupStatusDTO();
    backupStatus.frequency = frequency;
    backupStatus.region = region;
    backupStatus.labVolumeSize = labInstance.volumeSize;

    const lastBackup = await this.backupHistoryService.findLastSuccessBackupByType(labInstance.id, frequency);
    if (lastBackup) {
      backupStatus.lastSuccessBackupSize = lastBackup.dataSize + lastBackup.dbSize;
      backupStatus.lastSuccessBackupAt = lastBackup.endedAt;
      backupStatus.status = 'SUCCESS';
    } else {
      backupStatus.status = 'NONE';
    }

    return backupStatus;
  }

  /////////////////////////////// BACKUP HISTORY ///////////////////////////////

  public async syncBackupHistory(labInstance: CnLabInstance): Promise<void> {
    const backups = await this.labManagerService.getBackupHistory(labInstance);
    await this.backupHistoryService.saveHistories(backups.backups, labInstance);
  }


  public async getBackupHistory(labInstanceId: string, page: number, size: number): Promise<ClPageI<CnLabBackupHistory>> {
    return this.backupHistoryService.getBackupHistory(labInstanceId, page, size);
  }

  public async saveBackupHistory(labInstance: CnLabInstance, backups: CnLabBackupBucket[]): Promise<CnLabBackupHistory[]> {
    return this.backupHistoryService.saveHistories(backups, labInstance);
  }


  /////////////////////////////// OTHER ///////////////////////////////

  public async stopCurrentBackup(labInstance: CnLabInstance): Promise<CnLabBackupHistory[]> {
    const backup = await this.labManagerService.stopCurrentBackup(labInstance);
    return this.backupHistoryService.saveHistories(backup, labInstance);
  }

  public async createProdBackup(labInstance: CnLabInstance): Promise<CnLabBackupHistory[]> {
    // get or create the bucket associated with this lab instance
    const backupInfo = await this.getBackupInfo(labInstance);

    const backups = await this.labManagerService.createProdBackup(labInstance, backupInfo);

    return this.backupHistoryService.saveHistories(backups, labInstance);
  }

  public async getBackupInfo(labInstance: CnLabInstance): Promise<CnExternalLabBackupInfoDTO> {

    // get or create the bucket associated with this lab instance
    const options = await this.backupOptionService.findByLabId(labInstance.id);

    if (options == null) {
      throw new BlBadRequestException('No backup options found for this lab');
    }

    return {
      version: 1,
      // set the '/' prefix to avoid the bucket name to be added to the prefix
      // once all lab manager are on v1.7.0, we can remove this prefix
      s3Prefix: '/' + this.backupOptionService.getBackupS3Prefix(labInstance),
      backupBuckets: [
        {
          backupFrequency: options.frequency1,
          bucketConfig: options.bucket1.getBucketConfig(),
        },
        {
          backupFrequency: options.frequency2,
          bucketConfig: options.bucket2.getBucketConfig(),
        }
      ],
    };
  }

  /**
   * Check the backup size by calculating the size of the backup in the 2 buckets
   * @param labInstance
   */
  public async checkBackupsSize(labInstance: CnLabInstance): Promise<CnLabCheckBackupSizeDTO[]> {
    const labOptions = await this.backupOptionService.findByLabId(labInstance.id);
    if (labOptions == null) return [];

    const backupSizes: CnLabCheckBackupSizeDTO[] = [];
    backupSizes.push(await this.checkBackupSize(labInstance, labOptions.frequency1, labOptions.bucket1));
    backupSizes.push(await this.checkBackupSize(labInstance, labOptions.frequency2, labOptions.bucket2));

    return backupSizes;
  }

  private async checkBackupSize(labInstance: CnLabInstance, frequency: CnLabBackupFrequency,
                                bucket: CnBucket): Promise<CnLabCheckBackupSizeDTO> {
    const prefix = this.backupOptionService.getBackupS3Prefix(labInstance)
    const objectsInfo = await this.objectStorageService.getObjectsSizeByPrefix(
      bucket.getBucketConfig(), prefix);
    const backup1Status = await this.getBackupStatus(labInstance, frequency, bucket.region);

    return CnLabCheckBackupSizeDTO.fromBackupStatusDTO(backup1Status, objectsInfo.totalSize, objectsInfo.nbObjects);
  }

  /**
   * Delete all the backup for the lab
   * @param labInstance
   */
  public async deleteLabAllBackups(labInstance: CnLabInstance): Promise<void> {
    const labOptions = await this.backupOptionService.findByLabId(labInstance.id);

    if (labOptions == null) {
      throw new BlBadRequestException('No backup options found for this lab');
    }

    const prefix = this.backupOptionService.getBackupS3Prefix(labInstance)
    await this.deleteLabBackupInBucket(labOptions.bucket1, prefix, labInstance.id, labOptions.frequency1);
    await this.deleteLabBackupInBucket(labOptions.bucket2, prefix, labInstance.id, labOptions.frequency2);
  }

  /**
   * Delete a lab backup for a bucket
   */
  private async deleteLabBackupInBucket(bucket: CnBucket, prefix: string,
                                        labInstanceId: string, frequency: CnLabBackupFrequency): Promise<void> {
    this.logger.log(`Deleting backup for lab instance ${labInstanceId}, bucket : ${bucket.id}`);
    await this.datasource.transaction(async entityManager => {
      await this.backupHistoryService.deleteLabBackupHistoryByBucket(labInstanceId, bucket.id, entityManager);
      try {
        await this.objectStorageService.deleteObjectsByPrefix(bucket.getBucketConfig(), prefix);
      } catch (e) {
        Logger.error(`Error while deleting the backup file in bucket ${bucket.id} for lab instance ${labInstanceId}. Error ${e}`);
        // eslint-disable-next-line max-len
        throw new BlBadRequestException(`Error while deleting the backup file for region ${bucket.region.name} and frequency ${frequency}.`);
      }
    });

    this.logger.log(`Backup deleted for lab instance ${labInstanceId}, bucket : ${bucket.id}`);
  }
}
