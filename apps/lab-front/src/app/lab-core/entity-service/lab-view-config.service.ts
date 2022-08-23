import {Injectable} from '@angular/core';
import {
  FlAdvancedSearchInput,
  FlApiService,
  FlSearchConverter,
  FLSearchFunction,
  FlTag
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {ClPageI} from '@monorepo/core-lib';
import {LabViewConfig} from '../model/entities/resource/lab-view-config.entity';
import {
  LabViewConfigSearch,
  LabViewConfigSearchFields
} from '../entity-module/lab-view-config-core/model/lab-view-config-search.class';
import {LabTag} from '../model/entities/lab-tag.entity';

@Injectable({providedIn: 'root'})
export class LabViewConfigService {

  private route: string = 'view-config';

  constructor(private apiService: FlApiService) {
  }

  public updateTitle(id: string, title: string): Observable<LabViewConfig> {
    return this.apiService.put(`${this.route}/${id}/title`, {title: title}, LabViewConfig);
  }

  // update highlighted
  public updateHighlighted(id: string, highlighted: boolean): Observable<LabViewConfig> {
    return this.apiService.put(`${this.route}/${id}/highlighted`, {highlighted: highlighted}, LabViewConfig);
  }


  public saveTags(id: string, tags: FlTag[]): Observable<LabTag[]> {
    return this.apiService.put(`${this.route}/${id}/tags`, tags, LabTag);
  }


  ///////////////////////////////////////////// SEARCH /////////////////////////////////////////////

  public getViewConfigSearchFunction(reportId?: string): FLSearchFunction<LabViewConfig> {
    if (reportId) {
      return (page: number, pageSize: number, filters?: LabViewConfigSearchFields) =>
        this.searchForReport(reportId, page, pageSize, filters);
    } else {
      return (page: number, pageSize: number, filters?: LabViewConfigSearchFields) =>
        this.search(page, pageSize, filters);
    }
  }

  private search(page: number, pageSize: number,
                 filters: LabViewConfigSearchFields): Observable<ClPageI<LabViewConfig>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, LabViewConfigSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/search`, data, LabViewConfig, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }

  private searchForReport(reportId: string, page: number, pageSize: number,
                          filters: LabViewConfigSearchFields): Observable<ClPageI<LabViewConfig>> {
    const data: FlAdvancedSearchInput = {
      filtersCriteria: FlSearchConverter.convertObjectToSearchCriteriaList(filters, LabViewConfigSearch.advancedSearchConverter),
      sortsCriteria: null
    };
    return this.apiService.post(`${this.route}/search/report/${reportId}`, data, LabViewConfig, {
      page: page, pageSize: pageSize, resultIsPaginated: true
    });
  }


}
