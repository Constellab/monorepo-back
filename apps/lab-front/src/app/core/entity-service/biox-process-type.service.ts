import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProcessType, BioxProcessTypeDatasource, BioxProcessTypedTree} from '../model/entities/biox-process-type.entity';
import {ClGetPageFunction, ClPage} from '@monorepo/core-lib';
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
    return new FlEntityPaginatedDatasource(this.getProcessesMethod(), 20, true);
  }

  private getProcessesMethod(): ClGetPageFunction<BioxProcessType> {
    return (page: number, pageSize: number): Observable<ClPage<BioxProcessType>> => this.getProcesses(page, pageSize);
  }

  public getProcessTypesGrouped(): Observable<BioxProcessTypedTree[]> {
    return this.apiService.get(`${this.route}/typedTree`, createTypedTree(BioxProcessType));
  }
}
