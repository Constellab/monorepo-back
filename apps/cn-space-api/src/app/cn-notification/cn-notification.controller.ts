import { ClPage } from '@monorepo/core-lib';
import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { CnNotificationCountBySpace } from './cn-notification.dto';
import { CnNotification } from './cn-notification.entity';
import { CnNotificationService } from './cn-notification.service';

@Controller('notification')
export class CnNotificationController {
  constructor(private readonly notificationService: CnNotificationService) {}

  @Get()
  getUserNotifications(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnNotification>> {
    return this.notificationService.getUserNotifications(page, size);
  }

  @Post('readAll')
  readAllNotifications(): Promise<void> {
    return this.notificationService.readAllNotification();
  }

  @Post('read/:notifId')
  read(@Param('notifId', new ParseUUIDPipe()) notifId: string): Promise<void> {
    return this.notificationService.read(notifId);
  }

  @Post('read')
  readNotifications(@Body() notificationIds: string[]): Promise<void> {
    return this.notificationService.readNotifications(notificationIds);
  }

  @Get('count-not-read-by-space')
  countBySpace(): Promise<CnNotificationCountBySpace[]> {
    return this.notificationService.countNotReadBySpace();
  }
}
