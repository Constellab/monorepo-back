import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {LabLogsBetweenDates} from '../model/entities/lab-log.entity';
import {Observable} from 'rxjs';
import {LabProcessClass} from '../model/entities/process/lab-process.entity';
import {LabMonitorBetweenDates} from '../model/entities/lab-monitor.entity';


@Injectable({
  providedIn: 'root'
})
export class LabProcessService {

  private readonly route = 'process';

  constructor(private apiService: FlApiService) {
  }

  public getProcessLogs(processType: LabProcessClass, id: string): Observable<LabLogsBetweenDates> {
    return this.apiService.get(`${this.route}/${processType}/${id}/logs`, LabLogsBetweenDates);
  }

  public getDownloadProcessLogUrl(processType: LabProcessClass, id: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${processType}/${id}/logs/download`);
  }

  public getProcessMonitor(processType: LabProcessClass, id: string): Observable<LabMonitorBetweenDates> {
    return this.apiService.get(`${this.route}/${processType}/${id}/monitor`, LabMonitorBetweenDates);
  }
}
