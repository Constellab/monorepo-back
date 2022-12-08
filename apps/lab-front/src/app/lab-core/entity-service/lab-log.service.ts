import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabLogCompleteInfo, LabLogsStatus} from '../model/entities/lab-log.entity';

@Injectable({
  providedIn: 'root'
})
export class LabLogService {

  private readonly route = 'log';


  constructor(private apiService: FlApiService) {
  }

  public getLogsStatus(): Observable<LabLogsStatus> {
    return this.apiService.get(this.route + '/status', LabLogsStatus);
  }

  public getCompleteLog(logName: string): Observable<LabLogCompleteInfo> {
    return this.apiService.get(`${this.route}/${logName}`, LabLogCompleteInfo);
  }

  public getDownloadUrl(logName: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${logName}/download`);
  }

}
