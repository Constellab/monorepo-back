import {Module} from '@nestjs/common';
import {CnSupportService} from './cn-support.service';
import {CnNotificationModule} from '../cn-notification/cn-notification.module';
import {CnCoreModule} from '../cn-core/cn-core.module';

@Module({
  imports: [
    CnCoreModule,

    CnNotificationModule,
  ],
  providers: [CnSupportService],
  exports: [CnSupportService]
})
export class CnSupportModule {
}
