import { Module } from '@nestjs/common';
import { CnNotificationService } from './cn-notification.service';
import { CnNotificationController } from './cn-notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnNotification } from './cn-notification.entity';
import { CnNotificationListener } from './cn-notification.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnNotification])
  ],
  controllers: [CnNotificationController],
  providers: [
    CnNotificationService,
    CnNotificationListener,
  ],
  exports: [CnNotificationService]
})
export class CnNotificationModule {
}
