import {Injectable} from '@angular/core';
import {CaReport, CaResourceView} from '../model/entities/ca-report.class';
import {FlApiService, FlQuillJson} from '@monorepo/front-core-lib';
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
    return this.apiService.getById(this.route, id, CaReport);
  }

  getContent(reportId: string): Observable<FlQuillJson> {
    return this.apiService.get(`${this.route}/${reportId}/content`);
  }

  ////////////////////////////// METHOD FOR TEXT EDITOR //////////////////////////

  getImageUrl(reportId: string, filename: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/${reportId}/image/${filename}`);
  }

  getView(reportId: string, filename: string): Observable<CaResourceView> {
    return this.apiService.get(`${this.route}/${reportId}/view/${filename}`, CaResourceView);
  }

}
