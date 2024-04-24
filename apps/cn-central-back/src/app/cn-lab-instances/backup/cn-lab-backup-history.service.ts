import {Injectable} from '@nestjs/common';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {CnLabBackupHistory} from './cn-lab-backup-history.entity';
import {CnLabBackupBucket, CnLabBackupFrequency, CnLabBackupStatus} from './cn-lab-backup.dto';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnBucketsService} from '../../cn-object-storages/cn-buckets/cn-buckets.service';
import {ClPageI} from '@monorepo/core-lib';
import {CnBucket} from '../../cn-object-storages/cn-buckets/cn-bucket.entity';
import {FindOptionsWhere} from 'typeorm/find-options/FindOptionsWhere';


@Injectable()
export class CnLabBackupHistoryService extends BlAbstractService<CnLabBackupHistory> {

  constructor(@InjectRepository(CnLabBackupHistory) repository: Repository<CnLabBackupHistory>,
              private bucketService: CnBucketsService) {
    super(repository, CnLabBackupHistory);
  }

  public async saveHistories(historiesDto: CnLabBackupBucket[], labInstance: CnLabInstance): Promise<CnLabBackupHistory[]> {
    const histories: CnLabBackupHistory[] = [];
    for (const historyDto of historiesDto) {
      histories.push(await this.saveHistory(historyDto, labInstance));
    }
    return histories;
  }

  public async saveHistory(historyDto: CnLabBackupBucket, labInstance: CnLabInstance): Promise<CnLabBackupHistory> {
    let history: CnLabBackupHistory = await this.repo.findOne({
      where: {backupId: historyDto.id},
      relations: {labInstance: true}
    });


    if (history == null) {
      history = new CnLabBackupHistory();
      history.backupId = historyDto.id;
      history.labInstance = labInstance;
    } else {
      if (history.labInstance.id !== labInstance.id) {
        throw new Error(`The backup history ${historyDto.id} does not belong to the lab instance ${labInstance.id}`);
      }
    }

    history.bucket = await this.bucketService.findByNameAndRegionAndCheck(historyDto.bucket, historyDto.region);

    history.frequency = historyDto.frequency;
    history.triggerMode = historyDto.triggerMode;
    history.startedAt = historyDto.startUploadAt;
    history.endedAt = historyDto.endUploadAt;
    history.status = historyDto.status;
    history.dataStatus = historyDto.dataStatus.status;
    history.dataMessage = historyDto.dataStatus.message;
    history.dataSize = historyDto.dataSize;
    history.dbStatus = historyDto.dbStatus.status;
    history.dbMessage = historyDto.dbStatus.message;
    history.dbSize = historyDto.dbSize;
    history.s3Prefix = historyDto.s3Prefix;
    return await this.repo.save(history);
  }

  public getBackupHistory(labInstanceId: string, page: number, size: number): Promise<ClPageI<CnLabBackupHistory>> {
    return this.findPaginated(page, size, {
      where: {labInstance: {id: labInstanceId}},
      relations: {
        bucket: CnBucket.configRelation
      },
      order: {startedAt: 'DESC' as any},
    });
  }

  public findLastSuccessBackupByType(labInstanceId: string, frequency: CnLabBackupFrequency): Promise<CnLabBackupHistory | null> {
    return this.repo.findOne({
      where: {labInstance: {id: labInstanceId}, frequency, status: CnLabBackupStatus.SUCCESS},
      relations: {
        bucket: CnBucket.configRelation
      },
      order: {startedAt: 'DESC' as any},
    });
  }

  public async deleteLabBackupHistoryByBucket(labInstanceId: string,
                                              bucketId: string,
                                              entityManager: EntityManager): Promise<void> {
    await entityManager.delete(CnLabBackupHistory, {
      labInstance: {id: labInstanceId},
      bucket: {id: bucketId}
    } as FindOptionsWhere<CnLabBackupHistory>);
  }
}
