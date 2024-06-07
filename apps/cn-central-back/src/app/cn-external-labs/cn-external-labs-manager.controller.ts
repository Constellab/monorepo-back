import {Body, Controller, Get, Post} from '@nestjs/common';
import {CnLabInstanceAggregateService} from '../cn-lab-instances/cn-lab-instance-aggregate.service';
import {CnLabManagerGuard} from '../cn-core/decorators/cn-lab-manager-guard.decorator';
import {CnLabRobotAuthentication} from '../cn-core/decorators/cn-lab-guard.decorator';
import {BlParsePipe} from '@monorepo/back-core-lib';
import {CnLabBackupBucket} from '../cn-lab-instances/backup/cn-lab-backup.dto';
import {CnLabBackupHistory} from '../cn-lab-instances/backup/cn-lab-backup-history.entity';
import {CnLabManagerBackupInfoDTO} from '../cn-external-lab-api/model/cn-lab-manager.class';

/**
 * Specific controller for route called by the lab manager. These routes are not called by a user
 */
@CnLabManagerGuard()
@Controller('external-labs-manager')
export class CnExternalLabsManagerController {

  constructor(private labInstanceAggregator: CnLabInstanceAggregateService) {
  }

  @CnLabRobotAuthentication()
  @Get('lab/backup-info')
  async getLabBackupInfo(): Promise<CnLabManagerBackupInfoDTO> {
    return this.labInstanceAggregator.getCurrentLabInstanceBackupInfo();
  }

  @CnLabRobotAuthentication()
  @Post('lab/backup-history')
  async saveBackupHistory(@Body(new BlParsePipe(CnLabBackupBucket)) backups: CnLabBackupBucket[]): Promise<CnLabBackupHistory[]> {
    return this.labInstanceAggregator.saveCurrentLabBackupHistory(backups);
  }
}
