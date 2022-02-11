import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlSearchConverter,
  FlSearchService,
  FlTextEditorImageService,
  FlTextEditorUploadedImage
} from '@monorepo/front-core-lib';
import {LabReport, LabReportContent, LabReportForm} from '../model/entities/lab-report.entity';
import {Observable} from 'rxjs';
import {ClPageI} from '@monorepo/core-lib';
import {LabExperiment} from '../model/entities/lab-experiment.entity';
import {LabReportSearch} from '../entity-module/lab-report-core/model/lab-report-advanced-search.class';
import {LabProject} from '../model/entities/lab-project.class';
import {map} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class LabReportService extends FlTextEditorImageService implements FlSearchService<LabReport> {

  private route: string = 'report';

  constructor(private apiService: FlApiService,
              private dialogService: FlDialogService) {
    super();
  }

  public create(reportForm: LabReportForm): Observable<LabReport> {
    return this.apiService.post(this.route, reportForm, LabReport);
  }

  public createForExperiment(reportForm: LabReportForm, experimentId: string): Observable<LabReport> {
    return this.apiService.post(`${this.route}/experiment/${experimentId}`, reportForm, LabReport);
  }

  public update(id: string, reportForm: LabReportForm): Observable<LabReport> {
    return this.apiService.put(`${this.route}/${id}`, reportForm, LabReport);
  }

  public updateContent(id: string, content: LabReportContent): Observable<LabReport> {
    if (content == null) {
      content = {ops: []};
    }
    return this.apiService.put(`${this.route}/${id}/content`, content, LabReport);
  }

  public delete(id: string): Observable<void> {
    return this.apiService.deleteById(this.route, id);
  }

  public addExperiment(reportId: string, experimentId: string): Observable<LabExperiment> {
    return this.apiService.put(`${this.route}/${reportId}/add-experiment/${experimentId}`, null, LabExperiment);
  }

  public removeExperiment(reportId: string, experimentId: string): Observable<void> {
    return this.apiService.delete(`${this.route}/${reportId}/remove-experiment/${experimentId}`, null);
  }

  public removeExperimentWithConfirmation(reportId: string, experimentId: string): Observable<FlConfirmDialogResult<void>> {
    const input: FlConfirmDialogInput = {
      title: 'biox.report_disassociate_experiment',
      content: 'biox.report_disassociate_experiment_confirmation',
      translateTitleAndContent: true,
      observable: this.removeExperiment(reportId, experimentId),
      successMessage: 'biox.report_experiment_disassociated',
      translateMessage: true
    };

    return this.dialogService.openConfirmDialog(input).afterClosed();
  }

  public validate(reportId: string, project: LabProject): Observable<LabReport> {
    return this.apiService.put(`${this.route}/${reportId}/validate`, project, LabReport);
  }

  ///////////////////////////////////////////// GET /////////////////////////////////////////////

  public getReport(id: string): Observable<LabReport> {
    return this.apiService.getById(this.route, id, LabReport);
  }

  public getByExperiment(experimentId: string): Observable<LabReport[]> {
    return this.apiService.get(`${this.route}/experiment/${experimentId}`, LabReport);
  }

  public getExperimentByReports(reportId: string): Observable<LabExperiment[]> {
    return this.apiService.get(`${this.route}/${reportId}/experiments`, LabExperiment);
  }

  public advancedSearch(page: number, pageSize: number, filters: any): Observable<ClPageI<LabReport>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, LabReportSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/advanced-search`, data, LabReport, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  ///////////////////////////////////////////// IMAGE /////////////////////////////////////////////


  public getFilePath(filename: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/image/${filename}`);
  }


  deleteImage(filename: string): Observable<void> {
    return this.apiService.delete(`${this.route}/image/${filename}`);
  }

  uploadImage(file: File): Observable<FlTextEditorUploadedImage> {
    const formData = new FormData();
    formData.append('image', file);
    return this.apiService.post(`${this.route}/image`, formData).pipe(
      map(
        (uploadedFile: any) => {
          return {
            url: this.getFilePath(uploadedFile.filename),
            width: uploadedFile.width,
            height: uploadedFile.height,
          };
        }
      )
    );
  }


}
