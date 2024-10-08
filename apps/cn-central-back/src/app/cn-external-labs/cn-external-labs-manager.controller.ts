import { Body, Controller, Get, Post } from '@nestjs/common';
import { CnLabAggregateService } from '../cn-labs/cn-lab-aggregate.service';
import { CnLabManagerGuard } from '../cn-core/decorators/cn-lab-manager-guard.decorator';
import { CnLabRobotAuthentication } from '../cn-core/decorators/cn-lab-guard.decorator';
import { BlParsePipe } from '@monorepo/back-core-lib';
import { CnLabManagerBackupInfoDTO } from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabBackupBucket, CnLabBackupsHistory } from '../cn-labs/backup/cn-lab-backup.dto';
import { CnLabBucketHistory } from '../cn-labs/backup/cn-lab-backup-history.entity';

/**
 * Specific controller for route called by the lab manager. These routes are not called by a user
 */
@CnLabManagerGuard()
@Controller('external-labs-manager')
export class CnExternalLabsManagerController {

  constructor(private labAggregator: CnLabAggregateService) {
  }

  @CnLabRobotAuthentication()
  @Get('lab/backup-info')
  async getLabBackupInfo(): Promise<CnLabManagerBackupInfoDTO> {
    return this.labAggregator.getCurrentLabBackupInfo();
  }

  // TODO @lab-manager-v1.12.0 : remove once the lab manager is updated
  @CnLabRobotAuthentication()
  @Post('lab/backup-history')
  async saveBackupHistory(@Body() backups: CnLabBackupBucket[]): Promise<CnLabBucketHistory[]> {
    const history = CnLabBackupsHistory.fromV2Backups(backups);
    return this.labAggregator.saveCurrentLabBackupHistory(history);
  }

  @CnLabRobotAuthentication()
  @Post('lab/backup-history-v2')
  async saveBackupHistoryV2(@Body(new BlParsePipe(CnLabBackupsHistory)) backupsHistory: CnLabBackupsHistory): Promise<CnLabBucketHistory[]> {
    return this.labAggregator.saveCurrentLabBackupHistory(backupsHistory);
  }
}
