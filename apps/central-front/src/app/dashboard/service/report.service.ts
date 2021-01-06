import {Injectable} from '@angular/core';
import {ApiService} from '../../core/service-api/api.service';
import {Report} from '../../core/model/entities/report.class';
import {ArrayObs} from '../../core/model/datasource/array-obs.class';
import {EntityArrayObs} from '../../core/model/datasource/entity-array.class';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly route: string = 'reports';

  constructor(private apiService: ApiService) {
  }

  getReportsOfExperiment(experimentId: string): ArrayObs<Report> {
    return new EntityArrayObs(this.apiService.get(`${this.route}/experiment/${experimentId}`, Report));
  }
}
