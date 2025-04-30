import { Injectable } from '@nestjs/common';
import { CnLabStatsRequestDTO } from './cn-lab-stats.dto';
import { CnLabStatsRunningResponseDTO } from './cn-lab-running-stats.dto';
import { CnLab, CnLabBillingMode } from '../cn-lab.entity';
import { CnLabStatsStorageResponseDTO } from './cn-lab-storage-stats.dto';
import { CnLabsService } from '../cn-labs.service';
import { CnLabBackupAggregateService } from '../backup/cn-lab-backup-aggregate.service';
import { CnServerPriceService } from '../../cn-servers-info/server-price/cn-server-price.service';
import { CnStoragePriceService } from '../../cn-servers-info/storage-price/cn-storage-price.service';
import { CnLabVolumeService } from '../volume/cn-lab-volume.service';
import { CnLabStatsStorage } from './cn-lab-stats.storage';
import { CnLabStatsRunningService } from './cn-lab-stats-running.service';
import { CnLabStatusHistoryService } from '../status/cn-lab-status-history.service';

@Injectable()
export class CnLabStatsAggregateService {
  constructor(
    private labsService: CnLabsService,
    private backupService: CnLabBackupAggregateService,
    private serverPriceService: CnServerPriceService,
    private storagePriceService: CnStoragePriceService,
    private labVolumeService: CnLabVolumeService,
    private labStatusHistoryService: CnLabStatusHistoryService
  ) {}

  public async getLabRunningStats(
    lab: CnLab,
    request: CnLabStatsRequestDTO
  ): Promise<CnLabStatsRunningResponseDTO> {
    if (lab.isCloud() && !lab.isFreeLab && lab.billingMode === CnLabBillingMode.HOURLY) {
      const labServerStandard = await this.labsService.getLabServerStandard(lab.id);
      const serverPrices = await this.serverPriceService.getServerAllPrices(labServerStandard.id, 'ASC');
      const statusHistories = await this.labStatusHistoryService.getAllStatusHistory(lab.id);

      const labStatsRunningService = new CnLabStatsRunningService(request, statusHistories);
      return labStatsRunningService.getLabRunningKpisWithBilling(serverPrices);
    } else {
      return this.getLabRunningStatus(lab.id, request);
    }
  }

  public async getLabRunningDuration(labId: string, request: CnLabStatsRequestDTO): Promise<number> {
    const stats = await this.getLabRunningStatus(labId, request);
    return stats.runningDuration;
  }

  private async getLabRunningStatus(
    labId: string,
    request: CnLabStatsRequestDTO
  ): Promise<CnLabStatsRunningResponseDTO> {
    const statusHistories = await this.labStatusHistoryService.getAllStatusHistory(labId);
    const labStatsRunningService = new CnLabStatsRunningService(request, statusHistories);
    return labStatsRunningService.getRunningStatus();
  }

  public async getLabStorageStats(
    lab: CnLab,
    request: CnLabStatsRequestDTO
  ): Promise<CnLabStatsStorageResponseDTO> {
    if (!lab.isCloud()) {
      throw new Error('Storage stats are only available for cloud labs');
    }

    const storagePrices = await this.storagePriceService.findAll('ASC');
    const backupHistory = await this.backupService.getAllBackupHistory(lab.id);
    const labVolumes = await this.labVolumeService.getAllVolumes(lab.id);

    const labStatsStorage = new CnLabStatsStorage(storagePrices, labVolumes, backupHistory, request);
    return labStatsStorage.getStorageStats();
  }
}
