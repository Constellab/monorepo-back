import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {DateTime} from 'luxon';
import {Observable} from 'rxjs';
import {LabProgressBarMessages} from '../model/entities/lab-progress-bar.entity';

@Injectable({
  providedIn: 'root'
})
export class LabProgressBarService {

  private readonly route: string = 'progress-bar';


  constructor(private apiService: FlApiService) {
  }

  public getDownloadProgressBarUrl(id: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${id}/download`);
  }

  public getProgressBarMessages(id: string, nbOfMessages: number, fromDatetime?: DateTime): Observable<LabProgressBarMessages> {
    const route = fromDatetime ? `${this.route}/${id}/messages/${fromDatetime}` : `${this.route}/${id}/messages`;
    return this.apiService.get(route, LabProgressBarMessages,
      {params: {nb_of_messages: nbOfMessages.toString()}});
  }
}
