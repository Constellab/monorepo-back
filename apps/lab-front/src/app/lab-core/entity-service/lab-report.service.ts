import {Injectable} from '@angular/core';
import {FlAdvancedSearchInput, FlApiService, FlSearchConverter, FlSearchService} from '@monorepo/front-core-lib';
import {LabReport, LabReportContent, LabReportForm} from '../model/entities/lab-report.entity';
import {Observable} from 'rxjs';
import {ClPageI} from '@monorepo/core-lib';
import {LabExperiment} from '../model/entities/lab-experiment.entity';
import {LabReportSearch} from '../entity-module/lab-report-core/model/lab-report-advanced-search.class';

@Injectable({providedIn: 'root'})
export class LabReportService implements FlSearchService<LabReport> {

  private route: string = 'report';

  constructor(private apiService: FlApiService) {
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

  public validate(reportId: string): Observable<LabReport> {
    return this.apiService.put(`${this.route}/${reportId}/validate`, null, LabReport);
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


}
