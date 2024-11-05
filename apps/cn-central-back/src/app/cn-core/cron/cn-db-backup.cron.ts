import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BlBucketConfig, BlBucketType, BlDbBackupService } from '@monorepo/back-core-lib';
import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';
import { DataSource } from 'typeorm';

@Injectable()
export class CnDbBackupCron {
  private readonly logger = new Logger(CnDbBackupCron.name);

  constructor(
    private backupService: BlDbBackupService,
    private configService: CnCoreConfigService,
    private datasource: DataSource
  ) {}

  // cron every day at 00:00 to backup the DB in the object storage
  @Cron('0 0 0 * * *')
  async backupDb(): Promise<void> {
    this.logger.log('[Cron] Start of backup db');
    const bucketConfig: BlBucketConfig = {
      type: 's3',
      config: {
        bucket: this.configService.getDbBackupBucket(),
        bucketType: BlBucketType.NORMAL,
        endpoint: this.configService.getDbBackupEndpoint(),
        region: this.configService.getDbBackupRegion(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
      },
    };

    await this.backupService.backupDb(this.datasource.manager, bucketConfig, 'cn-space.json');

    this.logger.log('[Cron] End of backup db');
  }
}
