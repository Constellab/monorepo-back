import {Injectable} from '@angular/core';
import {CaReport} from '../model/entities/ca-report.class';
import {FlApiService, FlTextEditorImageService, FlTextEditorUploadedImage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaReportService extends FlTextEditorImageService{

  private readonly route: string = 'reports';

  constructor(private apiService: FlApiService) {
    super();
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

  // don't implement following because it is in readonly
  deleteImage(): Observable<void> {
    return undefined;
  }
  uploadImage(): Observable<FlTextEditorUploadedImage> {
    return undefined;
  }



}
