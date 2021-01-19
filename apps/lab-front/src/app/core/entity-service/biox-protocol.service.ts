import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {clRxjsDebug} from '@monorepo/core-lib';
import {BioxProtocol, BioxProtocolDatasource} from '../model/global/biox-processable.class';

@Injectable({
  providedIn: 'root'
})
export class BioxProtocolService {

  constructor(private apiService: FlApiService) {
  }

  public getProtocols(page: number, pageSize: number): Observable<FlPage<BioxProtocol>> {
    return this.apiService.get(`protocol/list`, BioxProtocol,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize}).pipe(clRxjsDebug());
  }

  public getProtocolsDatasource(): BioxProtocolDatasource {
    return new FlEntityPaginatedDatasource(this.getProtocolsMethod(), 20, true);
  }

  private getProtocolsMethod(): FlGetPageFunction<BioxProtocol> {
    return (page: number, pageSize: number): Observable<FlPage<BioxProtocol>> => this.getProtocols(page, pageSize);
  }


}
