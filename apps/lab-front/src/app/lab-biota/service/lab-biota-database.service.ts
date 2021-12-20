import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabBiotaData, LabBiotaDataDatasource} from '../model/lab-biota-data.class';
import {LabViewModel} from '../../lab-core/model/global/lab-view-model.entity';
import {ClPageI} from '@monorepo/core-lib';
import {LabBiotaDatabaseSearch} from '../model/lab-biota-database.class';

@Injectable({
  providedIn: 'root'
})
export class LabBiotaDatabaseService {

  constructor(private apiService: FlApiService) {
  }

  public countDatabaseEntries(typingName: string): Observable<number> {
    return this.apiService.get(`model/${typingName}/count`).pipe(
      map(value => {
        if (typeof value === 'number') {
          return value;
        } else {
          throw new Error(value);
        }
      })
    );
  }

  public getDatabaseData(typingName: string, page: number, pageSize: number): Observable<ClPageI<LabBiotaData>> {
    return this.apiService.get(`resource/${typingName}/`, LabViewModel,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getDatabaseDatasource(typingName: string): LabBiotaDataDatasource {
    return new FlEntityPaginatedDatasource<LabBiotaData>(
      (page: number, pageSize: number): Observable<ClPageI<LabBiotaData>> => this.getDatabaseData(typingName, page, pageSize),
      20, true);
  }

  public search(search : LabBiotaDatabaseSearch, page: number, pageSize: number): Observable<ClPageI<LabBiotaData>> {
    return this.apiService.post(`model/${search.typingName}/search`, {search_text: search.searchText}, LabViewModel,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public searchDatasource(search : LabBiotaDatabaseSearch): LabBiotaDataDatasource {
    return new FlEntityPaginatedDatasource<LabBiotaData>(
      (page: number, pageSize: number): Observable<ClPageI<LabBiotaData>> => this.search(search, page, pageSize),
      20, true);
  }

}
