import {Injectable} from '@angular/core';
import {CaNotificationsService} from '../service-api/ca-notifications.service';
import {CaNotification, CaNotificationType} from '../model/entities/ca-notification.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CaCurrentSpaceService} from '../service-api/ca-current-space.service';
import {CaSpace} from '../model/entities/space/ca-space.class';

@Injectable({providedIn: 'root'})
export class CaNotificationState {
  private currentSpaceId: string;
  private notifications$: BehaviorSubject<CaNotification[]> = new BehaviorSubject([]);

  constructor(private notificationService: CaNotificationsService,
              private currentSpaceService: CaCurrentSpaceService) {

  }

  public init(): void {
    this.currentSpaceService.getCurrentSpace$().subscribe((space: CaSpace) => {
      this.currentSpaceId = space.id;
    });
    this.notificationService.getAllNotRead().subscribe((notifications: CaNotification[]) => {
      this.notifications$.next(notifications);
    });
  }

  public getNotReadNotificationsNumber(): Observable<number | string> {
    return this.notifications$.asObservable().pipe(map((notifications: CaNotification[]) => {
      notifications = notifications.filter((notif: CaNotification) =>
        notif.space == null || notif.space.id === this.currentSpaceId);
      if (notifications.length > 0) {
        return notifications.length;
      } else {
        return '';
      }
    }));
  }

  public getOtherSpacesNotificationsNumber(): Observable<number | string> {
    return this.notifications$.asObservable().pipe(map((notifications: CaNotification[]) => {
      notifications = notifications.filter((notif: CaNotification) => notif.space != null && notif.space.id !== this.currentSpaceId);
      if (notifications.length > 0) {
        return notifications.length;
      } else {
        return '';
      }
    }));
  }

  public getSpaceUserNotificationsNumber(spaceId: string): Observable<number | string> {
    return this.notifications$.asObservable().pipe(map((notifications: CaNotification[]) => {
      notifications = notifications.filter((notif: CaNotification) => notif.space != null && notif.space.id === spaceId);
      if (notifications.length > 0) {
        return notifications.length;
      } else {
        return '';
      }
    }));
  }

  public getEntityNotificationsNumberByLink(link: string): Observable<number | string> {
    return this.notifications$.asObservable().pipe(map((notifications: CaNotification[]) => {
      notifications = notifications.filter((notif: CaNotification) => notif.link === link &&
        notif.space != null && notif.space.id == this.currentSpaceId);
      if (notifications.length > 0) {
        return notifications.length;
      } else {
        return '';
      }
    }));
  }

  public readEntityNotificationsByLink(link: string, notificationType: CaNotificationType): Observable<void> {
    return this.getEntityNotificationsNumberByLink(link).pipe(map((notifNumber) => {
      if (notifNumber > 0) {
        this.notificationService.readEntityNotificationsByLink(link, notificationType).subscribe(() => {
          this.init();
        });
      }
    }));
  }
}
