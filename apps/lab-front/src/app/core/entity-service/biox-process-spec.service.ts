import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProcessSpec, BioxProcessSpecDatasource, BioxProcessSpecTree} from '../model/entities/processable-spec/biox-process-spec.entity';
import {ClGetPageFunction, ClPage} from '@monorepo/core-lib';
import {createTypedTree} from '../model/global/tree-by-type.class';

@Injectable({
  providedIn: 'root'
})
export class BioxProcessSpecService {

  private readonly route: string = 'process-type';

  constructor(private apiService: FlApiService) {
  }

  public getProcesses(page: number, pageSize: number): Observable<ClPage<BioxProcessSpec>> {
    return this.apiService.get(this.route, BioxProcessSpec,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProcessesDatasource(): BioxProcessSpecDatasource {
    return new FlEntityPaginatedDatasource(this.getProcessesMethod(), 20, true);
  }

  private getProcessesMethod(): ClGetPageFunction<BioxProcessSpec> {
    return (page: number, pageSize: number): Observable<ClPage<BioxProcessSpec>> => this.getProcesses(page, pageSize);
  }

  public getProcessTypesTree(): Observable<BioxProcessSpecTree[]> {
    return this.apiService.get(`${this.route}/typedTree`, createTypedTree(BioxProcessSpec));
  }
}
