import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {DateTime} from 'luxon';
import {LabMonitorBetweenDates} from '../model/entities/lab-monitor.entity';
import {ClDateHelper} from '@monorepo/core-lib';


@Injectable({
  providedIn: 'root'
})
export class LabMonitorService {

  private readonly route = 'monitor';

  constructor(private apiService: FlApiService) {
  }

  public getMonitor(fromDate: DateTime, toDate: DateTime): Observable<LabMonitorBetweenDates> {
    return this.apiService.post(`${this.route}`,
      {
        from_date: ClDateHelper.serializeDateTime(fromDate),
        to_date: ClDateHelper.serializeDateTime(toDate)
      },
      LabMonitorBetweenDates);
  }

}
