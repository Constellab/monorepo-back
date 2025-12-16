import { BlParsePipe, BlPublic } from '@monorepo/back-core-lib';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CnLabRobotAuthentication } from '../cn-core/decorators/cn-lab-guard.decorator';
import { CnLabManagerGuard } from '../cn-core/decorators/cn-lab-manager-guard.decorator';
import {
  CnLabManagerBackupInfoDTO,
  CnLabManagerCreateDnsChallenge,
} from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabBackupsHistory } from '../cn-labs/backup/cn-lab-backup.dto';
import { CnLabBackupHistory } from '../cn-labs/backup/cn-lab-backup-history.entity';
import { CnLabAggregateService } from '../cn-labs/cn-lab-aggregate.service';
import { CnLabMigrateService } from '../cn-labs/migration/cn-lab-migrate.service';
import { CnLabMigrationPlanDTO } from '../cn-labs/migration/cn-lab-migration.dto';
/**
 * Specific controller for route called by the lab manager. These routes are not called by a user
 */
@CnLabManagerGuard()
@Controller('external-labs-manager')
export class CnExternalLabsManagerController {
  constructor(
    private labAggregator: CnLabAggregateService,
    private migrateService: CnLabMigrateService
  ) {}

  @CnLabRobotAuthentication()
  @Get('lab/backup-info-v2')
  async getLabBackupInfoV2(): Promise<CnLabManagerBackupInfoDTO> {
    return this.labAggregator.getCurrentLabBackupInfo();
  }

  @CnLabRobotAuthentication()
  @Post('lab/backup-history-v2')
  async saveBackupHistory(
    @Body(new BlParsePipe(CnLabBackupsHistory)) backupsHistory: CnLabBackupsHistory
  ): Promise<CnLabBackupHistory[]> {
    return this.labAggregator.saveCurrentLabBackupHistory(backupsHistory);
  }

  /**
   * @deprecated Use version-upgrade-info/:currentVersion instead
   * To remove once all datalab are on version 2.8.0
   * @returns
   */
  @BlPublic()
  @Get('recommended-version')
  getLabManagerRecommendedVersion(): { labManagerRecommendedVersion: string } {
    return { labManagerRecommendedVersion: this.labAggregator.getLabManagerRecommendedVersion() };
  }

  @BlPublic()
  @Get('version-upgrade-info/:currentVersion')
  getVersionUpgradeInfo(@Param('currentVersion') currentVersion: string): CnLabMigrationPlanDTO {
    return this.migrateService.getVersionUpgradeInfo(currentVersion);
  }

  @CnLabRobotAuthentication()
  @Get('desktop/update-lab-manager-command')
  getUpdateLabManagerCommand(): { command: string } {
    return { command: this.labAggregator.getDesktopUpdateLabManagerCommand() };
  }

  // Route for the DNS challenge to generate wildcard certificate
  // for the lab. This is called by the traefik service of the lab
  @CnLabRobotAuthentication()
  @Post('lab/dns/present')
  async present(@Body() body: CnLabManagerCreateDnsChallenge): Promise<any> {
    await this.labAggregator.createDnsChallenge(body);
    return {
      success: true,
      message: 'DNS record created successfully',
    };
  }

  @CnLabRobotAuthentication()
  @Post('lab/dns/cleanup')
  async deleteDnsChallenge(): Promise<any> {
    await this.labAggregator.deleteDnsChallenge();
    return {
      success: true,
      message: 'DNS record deleted successfully',
    };
  }
}
