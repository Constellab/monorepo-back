import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProcessType, BioxProcessTypeDatasource, BioxProcessTypeTree} from '../model/entities/processable-spec/biox-process-type.entity';
import {ClPage} from '@monorepo/core-lib';
import {createTypedTree} from '../model/global/tree-by-type.class';

@Injectable({
  providedIn: 'root'
})
export class BioxProcessTypeService {

  private readonly route: string = 'process-type';

  constructor(private apiService: FlApiService) {
  }

  public getProcesses(page: number, pageSize: number): Observable<ClPage<BioxProcessType>> {
    return this.apiService.get(this.route, BioxProcessType,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProcessesDatasource(): BioxProcessTypeDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number): Observable<ClPage<BioxProcessType>> => this.getProcesses(page, pageSize),
      20, true);
  }


  public getProcessTypesTree(): Observable<BioxProcessTypeTree[]> {
    return this.apiService.get(`${this.route}/typedTree`, createTypedTree(BioxProcessType));
  }
}
