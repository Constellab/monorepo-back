import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BlBucketConfig, BlBucketType, BlDbBackupService } from '@monorepo/back-core-lib';
import { DataSource } from 'typeorm';
import { HnCoreConfigService } from '../modules/core-config/hn-core-config.service';

@Injectable()
export class HnDbBackupCron {
  private readonly logger = new Logger(HnDbBackupCron.name);

  constructor(
    private backupService: BlDbBackupService,
    private configService: HnCoreConfigService,
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

    await this.backupService.backupDb(this.datasource.manager, bucketConfig, 'hn-community.json');

    this.logger.log('[Cron] End of backup db');
  }
}
