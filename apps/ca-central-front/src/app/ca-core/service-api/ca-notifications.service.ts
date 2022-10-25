import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaNotification, CaNotificationDatasourcePaginated} from '../model/entities/ca-notification.class';
import {ClPage} from '@monorepo/core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaNotificationsService {

  private readonly route = 'notification';

  constructor(private apiService: FlApiService) {
  }

  public getUserNotifications(userId: string, onlyNotRead: boolean = false): CaNotificationDatasourcePaginated {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(userId, page, size, onlyNotRead), 20);
  }

  public getAll(userId: string, page: number, size: number, onlyNotRead: boolean): Observable<ClPage<CaNotification>> {
    return this.apiService.get(`${this.route}/${userId}?onlyNotRead=${onlyNotRead}`, CaNotification,
      {page: page, pageSize: size, resultIsPaginated: true});
  }

  public readAllNotifications(userId: string): Observable<void>{
    return this.apiService.get(`${this.route}/readAll/${userId}`);
  }
}
