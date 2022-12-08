import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {LabLogsBetweenDates} from '../model/entities/lab-log.entity';
import {Observable} from 'rxjs';
import {LabProcessClass} from '../model/entities/process/lab-process.entity';


@Injectable({
  providedIn: 'root'
})
export class LabProcessService {

  private readonly route = 'process';

  constructor(private apiService: FlApiService) {
  }

  public getProcessLogs(processType: LabProcessClass, id: string): Observable<LabLogsBetweenDates> {
    return this.apiService.get(`${this.route}/logs/${processType}/${id}`, LabLogsBetweenDates);
  }
}
