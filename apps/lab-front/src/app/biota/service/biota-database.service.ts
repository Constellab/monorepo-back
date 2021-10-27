import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BiotaData, BiotaDataDatasource} from '../model/biota-data.class';
import {ViewModel} from '../../core/model/global/view-model.entity';
import {ClPageI} from '@monorepo/core-lib';
import {BiotaDatabaseSearch} from '../model/biota-database.class';

@Injectable({
  providedIn: 'root'
})
export class BiotaDatabaseService {

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

  public getDatabaseData(typingName: string, page: number, pageSize: number): Observable<ClPageI<BiotaData>> {
    return this.apiService.get(`resource/${typingName}/`, ViewModel,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getDatabaseDatasource(typingName: string): BiotaDataDatasource {
    return new FlEntityPaginatedDatasource<BiotaData>(
      (page: number, pageSize: number): Observable<ClPageI<BiotaData>> => this.getDatabaseData(typingName, page, pageSize),
      20, true);
  }

  public search(search : BiotaDatabaseSearch, page: number, pageSize: number): Observable<ClPageI<BiotaData>> {
    return this.apiService.post(`model/${search.typingName}/search`, {search_text: search.searchText}, ViewModel,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public searchDatasource(search : BiotaDatabaseSearch): BiotaDataDatasource {
    return new FlEntityPaginatedDatasource<BiotaData>(
      (page: number, pageSize: number): Observable<ClPageI<BiotaData>> => this.search(search, page, pageSize),
      20, true);
  }

}
