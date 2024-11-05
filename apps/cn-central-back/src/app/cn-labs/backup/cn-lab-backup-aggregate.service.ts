import { Injectable, Logger } from '@nestjs/common';
import { CnLabBackupHistoryService } from './cn-lab-backup-history.service';
import { CnLabBackupOptionService } from './cn-lab-backup-option.service';
import { DataSource, EntityManager } from 'typeorm';
import { CnLab } from '../cn-lab.entity';
import { CnCloudProviderRegion } from '../../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnLabBackupOption } from './cn-lab-backup-option.entity';
import { CnLabBackupHistory } from './cn-lab-backup-history.entity';
import { BlBadRequestException, BlObjectStorageService } from '@monorepo/back-core-lib';
import { ClPageI } from '@monorepo/core-lib';
import { CnLabManagerService } from '../cn-lab-manager.service';
import {
  CnLabBackupFrequency,
  CnLabBackupsHistory,
  CnLabBackupStatus,
  CnLabBackupStatusDTO,
  CnLabCheckBackupSizeDTO,
  CnSaveBackupHistoryDTO,
} from './cn-lab-backup.dto';
import { CnBucket } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import {
  CnLabManagerBackupInfoDTO,
  CnLabManagerRestoreBackupConfigDTO,
  CnLabManagerRestoreBackupDTO,
} from '../../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabMailService } from '../mail/cn-lab-mail.service';

@Injectable()
export class CnLabBackupAggregateService {
  private readonly logger = new Logger(CnLabBackupAggregateService.name);

  constructor(
    private backupHistoryService: CnLabBackupHistoryService,
    private backupOptionService: CnLabBackupOptionService,
    private labManagerService: CnLabManagerService,
    private objectStorageService: BlObjectStorageService,
    private datasource: DataSource,
    private labMailService: CnLabMailService
  ) {}

  //////////////////////////// BACKUP OPTIONS ////////////////////////////

  /**
   * Create 2 backup options for the lab to store backup in 2 different s3 regions
   */
  public async createBackupOptions(
    lab: CnLab,
    dailyBackupRegion: CnCloudProviderRegion,
    weeklyBackupRegion: CnCloudProviderRegion,
    entityManager: EntityManager
  ): Promise<CnLabBackupOption> {
    return this.backupOptionService.createBackupOptions(
      lab,
      dailyBackupRegion,
      weeklyBackupRegion,
      entityManager
    );
  }

  /**
   * Before deleting the backup options, we check that no backup exists
   */
  public async deleteBackupOptions(lab: CnLab, entityManager: EntityManager): Promise<void> {
    // check if some backup exists
    const backupStatus = await this.checkBackupsSize(lab);

    for (const status of backupStatus) {
      if (status.status !== 'NONE') {
        throw new BlBadRequestException(
          'Cannot delete the backup options some backup are referenced ' +
            'in the history. Please delete the lab backup first.'
        );
      }

      if (status.nbDocumentsInBucket > 0 || status.sizeInBucket > 0) {
        throw new BlBadRequestException(
          'Cannot delete the backup options because some backups ' +
            'file still exists. Please delete the lab backup first.'
        );
      }
    }

    return this.backupOptionService.deleteBackupOptions(lab.id, entityManager);
  }

  //////////////////////////// BACKUP STATUS ////////////////////////////
  /**
   * Get the status of all the backups for the lab
   */
  public async getBackupsStatus(lab: CnLab): Promise<CnLabBackupStatusDTO[]> {
    const labOptions = await this.backupOptionService.findByLabId(lab.id);
    if (labOptions == null) return [];

    const backupStatus1 = await this.getBackupStatus(lab, labOptions.frequency1, labOptions.bucket1.region);
    const backupStatus2 = await this.getBackupStatus(lab, labOptions.frequency2, labOptions.bucket2.region);

    return [backupStatus1, backupStatus2];
  }

  private async getBackupStatus(
    lab: CnLab,
    frequency: CnLabBackupFrequency,
    region: CnCloudProviderRegion
  ): Promise<CnLabBackupStatusDTO> {
    const backupStatus = new CnLabBackupStatusDTO();
    backupStatus.frequency = frequency;
    backupStatus.region = region;

    const lastBackup = await this.backupHistoryService.findLastCompleteBackupByType(lab.id, frequency);
    if (lastBackup) {
      backupStatus.lastSuccessBackupSize = 0;
      if (lastBackup.dataDetails) {
        backupStatus.lastSuccessBackupSize += lastBackup.dataDetails.totalSize;
      }
      if (lastBackup.dbDetails) {
        backupStatus.lastSuccessBackupSize += lastBackup.dbDetails.totalSize;
      }
      backupStatus.lastSuccessBackupAt = lastBackup.endedAt;
      backupStatus.lastSuccessBackupId = lastBackup.id;
      backupStatus.status = lastBackup.status === CnLabBackupStatus.SUCCESS ? 'SUCCESS' : 'DELETED';
    } else {
      backupStatus.status = 'NONE';
    }

    return backupStatus;
  }

  /////////////////////////////// BACKUP HISTORY ///////////////////////////////

  public async syncBackupHistory(lab: CnLab): Promise<void> {
    const backups = await this.labManagerService.getBackupHistory(lab);
    const histories = await this.backupHistoryService.saveHistories(backups, lab);
    await this.checkErrorHistory(histories, lab);
  }

  public async getBackupHistory(
    labId: string,
    page: number,
    size: number
  ): Promise<ClPageI<CnLabBackupHistory>> {
    return this.backupHistoryService.getBackupHistory(labId, page, size);
  }

  public async getAllBackupHistory(labId: string): Promise<CnLabBackupHistory[]> {
    return this.backupHistoryService.getAllBackupHistory(labId);
  }

  public async saveBackupHistory(
    lab: CnLab,
    backupsHistory: CnLabBackupsHistory
  ): Promise<CnLabBackupHistory[]> {
    const histories = await this.backupHistoryService.saveHistories(backupsHistory, lab);
    await this.checkErrorHistory(histories, lab);
    return histories.map((h) => h.history);
  }

  /**
   * Once the backup history is saved, we check if there is an error in 1 of the backup.
   * If there is an error, we email the support
   * @param histories
   * @param lab
   * @private
   */
  private async checkErrorHistory(histories: CnSaveBackupHistoryDTO[], lab: CnLab): Promise<void> {
    for (const history of histories) {
      if (history.isNew && history.history.status === 'ERROR') {
        await this.labMailService.sendLabBackupErrorMail(lab);
        return;
      }
    }
  }

  /////////////////////////////// BACKUP ///////////////////////////////

  public async stopCurrentBackup(lab: CnLab): Promise<CnLabBackupHistory[]> {
    const backup = await this.labManagerService.stopCurrentBackup(lab);
    const histories = await this.backupHistoryService.saveHistories(backup, lab);
    return histories.map((h) => h.history);
  }

  public async createProdBackup(lab: CnLab): Promise<CnLabBackupHistory[]> {
    // get or create the bucket associated with this lab
    const backupInfo = await this.getBackupInfo(lab);

    const backups = await this.labManagerService.createProdBackup(lab, backupInfo);

    const histories = await this.backupHistoryService.saveHistories(backups, lab);
    return histories.map((h) => h.history);
  }

  public async getBackupInfo(lab: CnLab): Promise<CnLabManagerBackupInfoDTO> {
    // get or create the bucket associated with this lab
    const options = await this.backupOptionService.findByLabId(lab.id);

    if (options == null) {
      throw new BlBadRequestException('No backup options found for this lab');
    }

    return {
      version: 1,
      // set the '/' prefix to avoid the bucket name to be added to the prefix
      // once all lab manager are on v1.7.0, we can remove this prefix
      s3Prefix: '/' + this.backupOptionService.getBackupS3Prefix(lab),
      backupBuckets: [
        {
          backupFrequency: options.frequency1,
          bucketConfig: options.bucket1.getBucketConfig(),
        },
        {
          backupFrequency: options.frequency2,
          bucketConfig: options.bucket2.getBucketConfig(),
        },
      ],
    };
  }

  /**
   * Check the backup size by calculating the size of the backup in the 2 buckets
   * @param lab
   */
  public async checkBackupsSize(lab: CnLab): Promise<CnLabCheckBackupSizeDTO[]> {
    const labOptions = await this.backupOptionService.findByLabId(lab.id);
    if (labOptions == null) return [];

    const backupSizes: CnLabCheckBackupSizeDTO[] = [];
    backupSizes.push(await this.checkBackupSize(lab, labOptions.frequency1, labOptions.bucket1));
    backupSizes.push(await this.checkBackupSize(lab, labOptions.frequency2, labOptions.bucket2));

    return backupSizes;
  }

  private async checkBackupSize(
    lab: CnLab,
    frequency: CnLabBackupFrequency,
    bucket: CnBucket
  ): Promise<CnLabCheckBackupSizeDTO> {
    const prefix = this.backupOptionService.getBackupS3Prefix(lab);
    const objectsInfo = await this.objectStorageService.getObjectsSizeByPrefix(
      bucket.getBucketConfig(),
      prefix
    );
    const backup1Status = await this.getBackupStatus(lab, frequency, bucket.region);

    return CnLabCheckBackupSizeDTO.fromBackupStatusDTO(
      backup1Status,
      objectsInfo.totalSize,
      objectsInfo.nbObjects
    );
  }

  /**
   * Delete all the backup for the lab
   * @param lab
   */
  public async deleteLabAllBackups(lab: CnLab): Promise<void> {
    const labOptions = await this.backupOptionService.findByLabId(lab.id);

    if (labOptions == null) {
      throw new BlBadRequestException('No backup options found for this lab');
    }

    const prefix = this.backupOptionService.getBackupS3Prefix(lab);
    await this.deleteLabBackupInBucket(labOptions.bucket1, prefix, lab, labOptions.frequency1);
    await this.deleteLabBackupInBucket(labOptions.bucket2, prefix, lab, labOptions.frequency2);
  }

  /**
   * Delete a lab backup for a bucket
   */
  private async deleteLabBackupInBucket(
    bucket: CnBucket,
    prefix: string,
    lab: CnLab,
    frequency: CnLabBackupFrequency
  ): Promise<void> {
    this.logger.log(`Deleting backup for lab ${lab.id}, bucket : ${bucket.id}`);
    try {
      await this.objectStorageService.deleteObjectsByPrefix(bucket.getBucketConfig(), prefix);
    } catch (e) {
      Logger.error(
        `Error while deleting the backup file in bucket ${bucket.id} for lab ${lab.id}. Error ${e}`
      );
      // eslint-disable-next-line max-len
      throw new BlBadRequestException(
        `Error while deleting the backup file for region ${bucket.region.name} and frequency ${frequency}.`
      );
    }

    await this.backupHistoryService.markBackupAsDeleted(lab, bucket, frequency);
    this.logger.log(`Backup deleted for lab ${lab.id}, bucket : ${bucket.id}`);
  }

  /////////////////////////////// RESTORE BACKUP ///////////////////////////////

  public async restoreBackup(
    sourceLab: CnLab,
    destinationLab: CnLab,
    backupHistoryId: string,
    options: CnLabManagerRestoreBackupConfigDTO
  ): Promise<void> {
    // get or create the bucket associated with this lab
    const backupHistory = await this.backupHistoryService.findByIdAndCheck(backupHistoryId, {
      bucket: CnBucket.configRelation,
    });

    const restoreDTO: CnLabManagerRestoreBackupDTO = {
      version: 1,
      bucketConfig: backupHistory.bucket.getBucketConfig(),
      s3Prefix: '/' + this.backupOptionService.getBackupS3Prefix(sourceLab),
      options: {
        restoreDb: options.restoreDb,
        restoreData: options.restoreData,
        force: options.force,
      },
    };

    return this.labManagerService.restoreBackup(destinationLab, restoreDTO);
  }
}
