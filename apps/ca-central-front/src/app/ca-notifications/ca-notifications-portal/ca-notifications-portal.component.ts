import {Component, OnInit} from '@angular/core';
import {CaAuthenticatedUserService} from '../../ca-core/service-api/ca-authenticated-user.service';
import {CaNotificationsService} from '../../ca-core/service-api/ca-notifications.service';
import {
  CaNotificationDatasourcePaginated,
  CaNotificationType
} from '../../ca-core/model/entities/ca-notification.class';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {ClStringHelper} from '@monorepo/core-lib';
import {CaNotificationState} from '../../ca-core/state/ca-notification.state';


@Component({
  selector: 'ca-notifications-portal',
  templateUrl: './ca-notifications-portal.component.html',
  styleUrls: ['./ca-notifications-portal.component.scss']
})
export class CaNotificationsPortalComponent implements OnInit {

  notifications: CaNotificationDatasourcePaginated;
  slideState: boolean = true;

  constructor(private authUserService: CaAuthenticatedUserService,
              private notificationState: CaNotificationState,
              private notificationsService: CaNotificationsService) {
  }

  ngOnInit(): void {
    this.updateNotifications();
  }

  private updateNotifications(): void {
    this.notifications = this.notificationsService.getUserNotifications(this.authUserService.getUser().id, !this.slideState);
  }


  onSlideChange(event: MatSlideToggleChange): void {
    this.slideState = event.checked;
    this.updateNotifications();
  }

  readAllNotifications(): void {
    this.notificationsService.readAllNotifications().subscribe(() => {
      this.updateNotifications();
    });
  }


  getNotificationLink(link: string): string {
    const l = link.split('?');
    return ClStringHelper.isHttpLink(l[0]) ? l[0] : l[0];
  }

  getNotificationQueryParams(link: string): { [query: string]: string } {
    const l = link.split('?');
    const qP: { [query: string]: string } = {};
    if (l[1]) {
      for (const query of l[1].split('&')) {
        const q = query.split('=');
        qP[q[0]] = q[1];
      }
    }
    return qP;
  }

  getNotificationObjectIcon(objectType: CaNotificationType): string {
    switch (objectType) {
      case CaNotificationType.EXPERIMENT_COMMENT:
        return 'science';
      case CaNotificationType.PROJECT_COMMENT:
        return 'project';
      case CaNotificationType.REPORT_COMMENT:
        return 'report';
      case CaNotificationType.NEW_USER:
        return 'people';
      default:
        return '';
    }
  }
}
