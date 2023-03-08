import {Module} from '@nestjs/common';
import {CnNotificationService} from './cn-notification.service';
import {CnNotificationController} from './cn-notification.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnNotification} from './cn-notification.entity';
import {CnSpaceUserService} from '../cn-spaces/cn-space-user.service';
import {CnSpaceUser} from '../cn-spaces/cn-space-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnNotification, CnSpaceUser])
  ],
  controllers: [CnNotificationController],
  providers: [CnNotificationService, CnSpaceUserService],
  exports: [CnNotificationService]
})
export class CnNotificationModule {
}
