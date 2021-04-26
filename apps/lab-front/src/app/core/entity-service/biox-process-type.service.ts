import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProcess} from '../model/entities/biox-processable.entity';
import {BioxProcessType, BioxProcessTypeDatasource} from '../model/entities/biox-process-type.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProcessTypeService {

  constructor(private apiService: FlApiService) {
  }

  public getProcesses(page: number, pageSize: number): Observable<FlPage<BioxProcessType>> {
    return this.apiService.get(`process-type/list`, BioxProcess,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProcessesDatasource(): BioxProcessTypeDatasource {
    return new FlEntityPaginatedDatasource(this.getProcessesMethod(), 20, true);
  }

  private getProcessesMethod(): FlGetPageFunction<BioxProcessType> {
    return (page: number, pageSize: number): Observable<FlPage<BioxProcessType>> => this.getProcesses(page, pageSize);
  }
}
