import { Global, Module } from '@nestjs/common';
import { BlDbBackupService } from './bl-db-backup.service';

@Global()
@Module({
  providers: [BlDbBackupService],
  exports: [BlDbBackupService],
})
export class BlDbBackupModule {}
