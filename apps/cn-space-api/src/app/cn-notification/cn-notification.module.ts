import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnNotificationController } from './cn-notification.controller';
import { CnNotification } from './cn-notification.entity';
import { CnNotificationListener } from './cn-notification.listener';
import { CnNotificationService } from './cn-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnNotification])],
  controllers: [CnNotificationController],
  providers: [CnNotificationService, CnNotificationListener],
  exports: [CnNotificationService],
})
export class CnNotificationModule {}
