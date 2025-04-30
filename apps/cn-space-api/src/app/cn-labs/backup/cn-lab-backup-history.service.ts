import { Injectable } from '@nestjs/common';
import { BlAbstractService } from '@monorepo/back-core-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CnLabBackupHistory, CnLabBackupHistoryEntity } from './cn-lab-backup-history.entity';
import {
  CnLabBackupBucket,
  CnLabBackupFrequency,
  CnLabBackupsHistory,
  CnLabBackupStatus,
  CnLabBackupTriggerMode,
  CnSaveBackupHistoryDTO,
} from './cn-lab-backup.dto';
import { CnLab, CnLabEntity } from '../cn-lab.entity';
import { CnBucketsService } from '../../cn-object-storages/cn-buckets/cn-buckets.service';
import { ClDateHelper, ClPageI, ClStringHelper } from '@monorepo/core-lib';
import { CnLabBackupHistoryDetail, CnLabBackupType } from './cn-lab-backup-history-detail.entity';
import { CnBucket } from '../../cn-object-storages/cn-buckets/cn-bucket.entity';

@Injectable()
export class CnLabBackupHistoryService extends BlAbstractService<CnLabBackupHistoryEntity> {
  constructor(
    @InjectRepository(CnLabBackupHistoryEntity) repository: Repository<CnLabBackupHistoryEntity>,
    private bucketService: CnBucketsService,
    private datasource: DataSource
  ) {
    super(repository, CnLabBackupHistoryEntity);
  }

  public async saveHistories(history: CnLabBackupsHistory, lab: CnLab): Promise<CnSaveBackupHistoryDTO[]> {
    const histories: CnSaveBackupHistoryDTO[] = [];
    for (const historyDto of history.backups) {
      histories.push(await this.saveHistory(historyDto, lab));
    }
    return histories;
  }

  public async saveHistory(historyDto: CnLabBackupBucket, lab: CnLab): Promise<CnSaveBackupHistoryDTO> {
    let history: CnLabBackupHistoryEntity = await this.repo.findOne({
      where: { backupId: historyDto.id },
      relations: { lab: true },
    });

    const isHistoryNew = history == null;
    if (history == null) {
      history = new CnLabBackupHistoryEntity();
      history.backupId = historyDto.id;
      history.lab = lab as CnLabEntity;
    } else {
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
    history.endedAt = historyDto.endUploadAt;
    history.status = historyDto.status;
    history.s3Prefix = historyDto.s3Prefix;

    await this.datasource.transaction(async (entityManager) => {
      history = await entityManager.save(history);

      let dataDetails: CnLabBackupHistoryDetail = history.dataDetails;
      if (dataDetails == null) {
        dataDetails = new CnLabBackupHistoryDetail();
        dataDetails.type = CnLabBackupType.DATA;
        dataDetails.history = history;
      }
      dataDetails.updateInfo(historyDto.data);
      await entityManager.save(dataDetails);

      let dbDetails: CnLabBackupHistoryDetail = history.dbDetails;
      if (dbDetails == null) {
        dbDetails = new CnLabBackupHistoryDetail();
        dbDetails.type = CnLabBackupType.DB;
        dbDetails.history = history;
      }
      dbDetails.updateInfo(historyDto.db);
      await entityManager.save(dbDetails);
    });

    return {
      isNew: isHistoryNew,
      history: await this.findByIdAndCheck(history.id, CnLabBackupHistoryEntity.defaultRelation),
    };
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
