import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProcess, BioxProcessDatasource} from '../model/entities/biox-processable.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProcessService {

  constructor(private apiService: FlApiService) {
  }

  public getProcesses(page: number, pageSize: number): Observable<FlPage<BioxProcess>> {
    return this.apiService.get(`process/list`, BioxProcess,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProcessesDatasource(): BioxProcessDatasource {
    return new FlEntityPaginatedDatasource(this.getProcessesMethod(), 20, true);
  }

  private getProcessesMethod(): FlGetPageFunction<BioxProcess> {
    return (page: number, pageSize: number): Observable<FlPage<BioxProcess>> => this.getProcesses(page, pageSize);
  }
}
