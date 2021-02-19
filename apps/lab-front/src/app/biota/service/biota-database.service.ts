import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BiotaData, BiotaDataDatasource} from '../model/biota-data.class';
import {ViewModel} from '../../core/model/global/view-model.entity';

@Injectable({
  providedIn: 'root'
})
export class BiotaDatabaseService {

  constructor(private apiService: FlApiService) {
  }

  public countDatabaseEntries(databaseType: string): Observable<number> {
    return this.apiService.get(`count/${databaseType}`).pipe(
      map(value => {
        if (typeof value === 'number') {
          return value;
        } else {
          throw new Error(value);
        }
      })
    );
  }

  public getDatabaseData(type: string, page: number, pageSize: number): Observable<FlPage<BiotaData>> {
    return this.apiService.get(`view/${type}/all/`, ViewModel,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getDatabaseDatasource(type: string): BiotaDataDatasource {
    return new FlEntityPaginatedDatasource<BiotaData>(this.getDatabasesMethod(type), 20, true);
  }

  private getDatabasesMethod(type: string): FlGetPageFunction<BiotaData> {
    return (page: number, pageSize: number): Observable<FlPage<BiotaData>> => this.getDatabaseData(type, page, pageSize);
  }


}
