import {Injectable} from '@angular/core';
import {CaReport} from '../model/entities/ca-report.class';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaReportService {

  private readonly route: string = 'reports';

  constructor(private apiService: FlApiService) {
  }

  getReportsByExperiment(experimentId: string): Observable<CaReport[]> {
    return this.apiService.get(`${this.route}/experiment/${experimentId}`, CaReport);
  }

  getReportsByProject(projectId: string): Observable<CaReport[]> {
    return this.apiService.get(`${this.route}/project/${projectId}`, CaReport);
  }

  getById(id: string): Observable<CaReport> {
    return this.apiService.getById(this.route, id);
  }


  ////////////////////////////// METHOD FOR TEXT EDITOR //////////////////////////

  getImageUrl(filename: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/image/${filename}`);
  }

}
