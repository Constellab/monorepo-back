import {Injectable} from '@angular/core';
import {FlApiService, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProcess, BioxProcessDatasource, BioxProcessVM} from '../model/entities/biox-processable.entity';
import {ViewModelDatasourcePaginated} from '../utils/view-model.datasource';
import {createViewModel} from '../model/global/view-model.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProcessService {

  constructor(private apiService: FlApiService) {
  }

  public getProcesses(page: number, pageSize: number): Observable<FlPage<BioxProcessVM>> {
    return this.apiService.get(`process/list`, createViewModel(BioxProcess),
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProcessesDatasource(): BioxProcessDatasource {
    return new ViewModelDatasourcePaginated(this.getProcessesMethod(), 20, true);
  }

  private getProcessesMethod(): FlGetPageFunction<BioxProcessVM> {
    return (page: number, pageSize: number): Observable<FlPage<BioxProcessVM>> => this.getProcesses(page, pageSize);
  }
}
