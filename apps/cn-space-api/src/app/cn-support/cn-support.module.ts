import { Module } from '@nestjs/common';

import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnNotificationModule } from '../cn-notification/cn-notification.module';
import { CnSupportService } from './cn-support.service';

@Module({
  imports: [CnCoreModule, CnNotificationModule],
  providers: [CnSupportService],
  exports: [CnSupportService],
})
export class CnSupportModule {}
