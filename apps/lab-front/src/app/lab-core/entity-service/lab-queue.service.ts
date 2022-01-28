import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabQueueJob} from '../model/entities/lab-queue.entity';
import {LabExperiment} from '../model/entities/lab-experiment.entity';

@Injectable({providedIn: 'root'})
export class LabQueueService {

  private readonly route: string = 'queue';

  constructor(private apiService: FlApiService) {
  }

  public getQueueJobs(): Observable<LabQueueJob[]> {
    return this.apiService.get(`${this.route}/jobs`, LabQueueJob);
  }

  public removeExperimentFromQueue(experimentId: string): Observable<LabExperiment> {
    return this.apiService.deleteById(`${this.route}/experiment`, experimentId, LabExperiment);
  }
}
