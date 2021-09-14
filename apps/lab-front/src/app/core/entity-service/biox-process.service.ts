import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {ViewModelDatasourcePaginated} from '../utils/view-model.datasource';
import {createViewModel} from '../model/global/view-model.entity';
import {ClGetPageFunction, ClPage} from '@monorepo/core-lib';
import {BioxProcess, BioxProcessDatasource, BioxProcessVM} from '../model/entities/proccesable/biox-process.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProcessService {

  constructor(private apiService: FlApiService) {
  }

  public getProcesses(page: number, pageSize: number): Observable<ClPage<BioxProcessVM>> {
    return this.apiService.get(`task-type`, createViewModel(BioxProcess),
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getProcessesDatasource(): BioxProcessDatasource {
    return new ViewModelDatasourcePaginated(this.getProcessesMethod(), 20, true);
  }

  private getProcessesMethod(): ClGetPageFunction<BioxProcessVM> {
    return (page: number, pageSize: number): Observable<ClPage<BioxProcessVM>> => this.getProcesses(page, pageSize);
  }
}



