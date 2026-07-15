import { BlAbstractService } from '@monorepo/back-core-lib';
import { ClDateHelper, ClPageI, ClStringHelper } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { CnBucket } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnBucketsService } from '../../cn-object-storages/cn-buckets/cn-buckets.service';
import { CnLab, CnLabEntity } from '../cn-lab.entity';
import {
  CnLabBackupBucket,
  CnLabBackupFrequency,
  CnLabBackupsHistory,
  CnLabBackupStatus,
  CnLabBackupTriggerMode,
} from './cn-lab-backup.dto';
import { CnLabBackupEventService } from './cn-lab-backup.event';
import { CnLabBackupHistory, CnLabBackupHistoryEntity } from './cn-lab-backup-history.entity';
import { CnLabBackupHistoryDetail, CnLabBackupType } from './cn-lab-backup-history-detail.entity';

@Injectable()
export class CnLabBackupHistoryService extends BlAbstractService<CnLabBackupHistoryEntity> {
  constructor(
    @InjectRepository(CnLabBackupHistoryEntity) repository: Repository<CnLabBackupHistoryEntity>,
    private bucketService: CnBucketsService,
    private datasource: DataSource,
    private backupEventService: CnLabBackupEventService
  ) {
    super(repository, CnLabBackupHistoryEntity);
  }

  public async saveHistories(history: CnLabBackupsHistory, lab: CnLab): Promise<CnLabBackupHistory[]> {
    const histories: CnLabBackupHistory[] = [];
    for (const historyDto of history.backups) {
      histories.push(await this.saveHistory(historyDto, lab));
    }
    return histories;
  }

  public async saveHistory(historyDto: CnLabBackupBucket, lab: CnLab): Promise<CnLabBackupHistory> {
    const existingHistory: CnLabBackupHistoryEntity | null = await this.repo.findOne({
      where: { backupId: historyDto.id },
      relations: { lab: true },
    });

    const isHistoryNew = existingHistory == null;
    const oldStatus = existingHistory?.status;

    let history: CnLabBackupHistoryEntity;
    if (existingHistory == null) {
      history = new CnLabBackupHistoryEntity();
      history.backupId = historyDto.id;
      history.lab = lab as CnLabEntity;
    } else {
      history = existingHistory;
      if (history.lab.id !== lab.id) {
        throw new Error(`The backup history ${historyDto.id} does not belong to the lab ${lab.id}`);
      }
    }

    history.bucket = await this.bucketService.findByNameAndRegionAndCheck(
      historyDto.bucket,
      historyDto.region
    );

    history.frequency = historyDto.frequency;
    history.triggerMode = historyDto.triggerMode;
    history.startedAt = historyDto.startUploadAt;
    history.endedAt = historyDto.endUploadAt ?? null;
    history.status = historyDto.status;
    history.s3Prefix = historyDto.s3Prefix;

    await this.datasource.transaction(async (entityManager) => {
      history = await entityManager.save(history);

      let dataDetails: CnLabBackupHistoryDetail | null = history.dataDetails;
      if (dataDetails == null) {
        dataDetails = new CnLabBackupHistoryDetail();
        dataDetails.type = CnLabBackupType.DATA;
        dataDetails.history = history;
      }
      dataDetails.updateInfo(historyDto.data);
      await entityManager.save(dataDetails);

      let dbDetails: CnLabBackupHistoryDetail | null = history.dbDetails;
      if (dbDetails == null) {
        dbDetails = new CnLabBackupHistoryDetail();
        dbDetails.type = CnLabBackupType.DB;
        dbDetails.history = history;
      }
      dbDetails.updateInfo(historyDto.db);
      await entityManager.save(dbDetails);
    });

    const savedHistory = await this.findByIdAndCheck(history.id, CnLabBackupHistoryEntity.defaultRelation);

    // Emit event if status is ERROR and it's either a new backup or status changed from non-ERROR to ERROR
    const isNewErrorStatus = isHistoryNew && historyDto.status === CnLabBackupStatus.ERROR;
    const isStatusChangedToError =
      !isHistoryNew && oldStatus !== CnLabBackupStatus.ERROR && historyDto.status === CnLabBackupStatus.ERROR;

    if (isNewErrorStatus || isStatusChangedToError) {
      this.backupEventService.emitBackupEvent(
        {
          type: 'BACKUP_STATUS_ERROR',
          entity: savedHistory,
        },
        lab
      );
    }

    return savedHistory;
  }

  public markBackupAsDeleted(
    lab: CnLab,
    bucket: CnBucket,
    frequency: CnLabBackupFrequency
  ): Promise<CnLabBackupHistory> {
    const history = new CnLabBackupHistoryEntity();
    history.id = ClStringHelper.generateUUID();
    history.lab = lab as CnLabEntity;
    history.bucket = bucket;
    history.triggerMode = CnLabBackupTriggerMode.MANUAL;
    history.frequency = frequency;
    history.startedAt = ClDateHelper.getDate();
    history.endedAt = ClDateHelper.getDate();
    history.status = CnLabBackupStatus.DELETED;

    return this.save(history);
  }

  public getBackupHistory(labId: string, page: number, size: number): Promise<ClPageI<CnLabBackupHistory>> {
    return this.findPaginated(page, size, {
      where: { lab: { id: labId } },
      relations: CnLabBackupHistoryEntity.defaultRelation,
      order: { startedAt: 'DESC' },
    });
  }

  public findLastCompleteBackupByType(
    labId: string,
    frequency: CnLabBackupFrequency
  ): Promise<CnLabBackupHistory | null> {
    return this.repo.findOne({
      where: {
        lab: { id: labId },
        frequency,
        status: In([CnLabBackupStatus.SUCCESS, CnLabBackupStatus.DELETED]),
      },
      relations: CnLabBackupHistoryEntity.defaultRelation,
      order: { startedAt: 'DESC' },
    });
  }

  public getAllBackupHistory(labId: string): Promise<CnLabBackupHistory[]> {
    return this.repo.find({
      where: { lab: { id: labId } },
      relations: CnLabBackupHistoryEntity.defaultRelation,
      order: { startedAt: 'ASC' },
    });
  }
}
