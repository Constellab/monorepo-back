import {Injectable} from '@angular/core';
import {ApiService} from '../../core/service-api/api.service';
import {Report} from '../../core/model/entities/report.class';
import {FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly route: string = 'reports';

  constructor(private apiService: ApiService) {
  }

  getReportsOfExperiment(experimentId: string): FlArrayObs<Report> {
    return new FlEntityArrayObs(this.apiService.get(`${this.route}/experiment/${experimentId}`, Report));
  }
}
