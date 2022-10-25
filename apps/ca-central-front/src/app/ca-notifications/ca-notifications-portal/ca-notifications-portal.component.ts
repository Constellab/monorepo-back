import {Component, OnInit} from '@angular/core';
import {CaAuthenticatedUserService} from '../../ca-core/service-api/ca-authenticated-user.service';
import {CaNotificationsService} from '../../ca-core/service-api/ca-notifications.service';
import {CaNotificationDatasourcePaginated} from '../../ca-core/model/entities/ca-notification.class';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';


@Component({
  selector: 'ca-notifications-portal',
  templateUrl: './ca-notifications-portal.component.html',
  styleUrls: ['./ca-notifications-portal.component.scss']
})
export class CaNotificationsPortalComponent implements OnInit {

  notifications: CaNotificationDatasourcePaginated;
  slideState: boolean = true;

  constructor(
    private authUserService: CaAuthenticatedUserService,
    private notificationsService: CaNotificationsService) {
  }

  ngOnInit(): void {
    this.updateNotifications();
  }

  private updateNotifications(): void{
    this.notifications = this.notificationsService.getUserNotifications(this.authUserService.getUser().id, !this.slideState);
  }


  onSlideChange(event: MatSlideToggleChange): void{
    this.slideState = event.checked;
    this.updateNotifications();
  }

  readAllNotifications(): void{
    this.notificationsService.readAllNotifications(this.authUserService.getUser().id).subscribe(() => {
      this.updateNotifications();
    });
  }

}
