import {Injectable} from '@angular/core';
import {FlApiService, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProcess} from '../model/entities/biox-processable.entity';
import {createViewModel} from '../model/global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../utils/view-model.datasource';
import {BioxProcessTypeDatasource, BioxProcessTypeVM} from '../model/entities/biox-process-type.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProcessTypeService {

  constructor(private apiService: FlApiService) {
  }

  public getProcesses(page: number, pageSize: number): Observable<FlPage<BioxProcessTypeVM>> {
    return this.apiService.get(`process-type/list`, createViewModel(BioxProcess),
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProcessesDatasource(): BioxProcessTypeDatasource {
    return new ViewModelDatasourcePaginated(this.getProcessesMethod(), 20, true);
  }

  private getProcessesMethod(): FlGetPageFunction<BioxProcessTypeVM> {
    return (page: number, pageSize: number): Observable<FlPage<BioxProcessTypeVM>> => this.getProcesses(page, pageSize);
  }
}
