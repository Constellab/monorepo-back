import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BiotaData, BiotaDataDatasource} from '../model/biota-data.class';
import {ViewModel} from '../../core/model/global/view-model.entity';
import {ClPageI} from '@monorepo/core-lib';

@Injectable({
  providedIn: 'root'
})
export class BiotaDatabaseService {

  constructor(private apiService: FlApiService) {
  }

  public countDatabaseEntries(databaseType: string): Observable<number> {
    return this.apiService.get(`model/${databaseType}/count`).pipe(
      map(value => {
        if (typeof value === 'number') {
          return value;
        } else {
          throw new Error(value);
        }
      })
    );
  }

  public getDatabaseData(type: string, page: number, pageSize: number): Observable<ClPageI<BiotaData>> {
    return this.apiService.get(`resource/${type}/`, ViewModel,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getDatabaseDatasource(type: string): BiotaDataDatasource {
    return new FlEntityPaginatedDatasource<BiotaData>(
      (page: number, pageSize: number): Observable<ClPageI<BiotaData>> => this.getDatabaseData(type, page, pageSize),
      20, true);
  }

}
