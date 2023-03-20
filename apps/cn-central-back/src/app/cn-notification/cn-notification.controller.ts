import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query
} from '@nestjs/common';
import {CnNotificationService, CnNotificationType} from './cn-notification.service';
import {ClPage} from '@monorepo/core-lib';
import {CnNotification, CnNotificationNumber} from './cn-notification.entity';

@Controller('notification')
export class CnNotificationController {
  constructor(private readonly notificationService: CnNotificationService) {
  }



  @Get()
  getUserNotifications(@Query('onlyNotRead', new ParseBoolPipe()) onlyNotRead: boolean,
                       @Query('page', new ParseIntPipe()) page: number,
                       @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<any>> {
    return this.notificationService.getUserNotifications(onlyNotRead, page, size);
  }

  @Get('not-read')
  getNotReadNotifications(): Promise<CnNotification[]> {
    return this.notificationService.getNotReadNotifications();
  }

  @Post('readAll')
  readAllNotifications(): Promise<void> {
    return this.notificationService.readAllNotification();
  }

  @Post('read/:notifId')
  read(@Param('notifId', new ParseUUIDPipe()) notifId: string): Promise<void> {
    return this.notificationService.read(notifId);
  }

  @Get('current-notifications-number')
  async getCurrentNotificationsNumber(): Promise<CnNotificationNumber> {
    return await this.notificationService.getCurrentNotificationsNumber();
  }

  @Get('space-user-notifications-number/:spaceId')
  getSpaceUserNotificationsNumber(@Param('spaceId', new ParseUUIDPipe()) spaceId: string): Promise<CnNotificationNumber> {
    return this.notificationService.getSpaceUserNotificationsNumber(spaceId);
  }

  @Get('other-spaces-notifications-number')
  getOtherSpacesNotificationsNumber(): Promise<CnNotificationNumber> {
    return this.notificationService.getOtherSpacesNotificationsNumber();
  }

  @Post('entity-notifications-by-link')
  getEntityNotificationByLink(@Body('notificationType', new ParseEnumPipe(CnNotificationType)) notificationType: CnNotificationType,
                              @Body('link') link: string): Promise<CnNotificationNumber> {
    return this.notificationService.getEntityNotificationByLink(notificationType, link);
  }

  @Post('read-entity-notifications-by-link')
  readEntityNotificationsByLink(@Body('notificationType', new ParseEnumPipe(CnNotificationType)) notificationType: CnNotificationType,
                                @Body('link') link: string): Promise<void> {
    return this.notificationService.readEntityNotificationsByLink(notificationType, link);
  }
}
