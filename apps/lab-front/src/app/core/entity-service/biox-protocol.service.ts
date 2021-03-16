import {Injectable} from '@angular/core';
import {FlApiWithCacheService, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProtocol, BioxProtocolDatasource, BioxProtocolVM} from '../model/entities/biox-processable.entity';
import {createViewModel} from '../model/global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../utils/view-model.datasource';

@Injectable({
  providedIn: 'root'
})
export class BioxProtocolService {


  constructor(private apiService: FlApiWithCacheService) {
  }

  public getProtocols(page: number, pageSize: number): Observable<FlPage<BioxProtocolVM>> {
    return this.apiService.get(`protocol/list`, createViewModel(BioxProtocol),
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProtocolsDatasource(): BioxProtocolDatasource {
    return new ViewModelDatasourcePaginated(this.getProtocolsMethod(), 20, true);
  }

  private getProtocolsMethod(): FlGetPageFunction<BioxProtocolVM> {
    return (page: number, pageSize: number): Observable<FlPage<BioxProtocolVM>> => this.getProtocols(page, pageSize);
  }

  public getProtocol(id: string): Observable<BioxProtocolVM> {
    return this.apiService.getByIdWithCache(`protocol`, id, createViewModel(BioxProtocol));
  }


}
