import {Injectable} from '@angular/core';
import {CaReport} from '../model/entities/ca-report.class';
import {FlApiService, FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaReportService {

  private readonly route: string = 'reports';

  constructor(private apiService: FlApiService) {
  }

  getReportsOfExperiment(experimentId: string): FlArrayObs<CaReport> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/experiment/${experimentId}`, CaReport));
  }
}
