import {Controller, Get, Param, ParseBoolPipe, ParseIntPipe, ParseUUIDPipe, Query} from '@nestjs/common';
import {CnNotificationService} from './cn-notification.service';
import {ClPage} from '@monorepo/core-lib';

@Controller('notification')
export class CnNotificationController {
  constructor(private readonly notificationService: CnNotificationService) {
  }


  @Get(':userId')
  getUserNotifications(@Param('userId', new ParseUUIDPipe()) userId: string,
                       @Query('onlyNotRead', new ParseBoolPipe()) onlyNotRead: boolean,
                       @Query('page', new ParseIntPipe()) page: number,
                       @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<any>> {
    return this.notificationService.getUserNotifications(userId, onlyNotRead, page, size);
  }

  @Get('readAll/:userId')
  readAllNotifications(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.notificationService.readAllNotification(userId);
  }
}
