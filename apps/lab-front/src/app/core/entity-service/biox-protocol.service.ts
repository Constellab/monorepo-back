import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {createViewModel} from '../model/global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../utils/view-model.datasource';
import {BioxProtocol, BioxProtocolDatasource, BioxProtocolVM} from '../model/entities/biox-processable.entity';
import {map} from 'rxjs/operators';
import {ClGetPageFunction, ClPage, clRxjsDebug} from '@monorepo/core-lib';
import {BioxFlow} from '../model/global/biox-connection.class';

@Injectable({
  providedIn: 'root'
})
export class BioxProtocolService {


  constructor(private apiService: FlApiWithCacheService) {
  }

  public getProtocols(page: number, pageSize: number): Observable<ClPage<BioxProtocolVM>> {
    return this.apiService.get(`protocol/list`, createViewModel(BioxProtocol),
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProtocolsDatasource(): BioxProtocolDatasource {
    return new ViewModelDatasourcePaginated(this.getProtocolsMethod(), 20, true);
  }

  private getProtocolsMethod(): ClGetPageFunction<BioxProtocolVM> {
    return (page: number, pageSize: number): Observable<ClPage<BioxProtocolVM>> => this.getProtocols(page, pageSize);
  }

  public getProtocol(protocolId: string): Observable<BioxProtocol> {
    return this.apiService.get(`protocol/${protocolId}`, BioxProtocol);
  }

  public getProtocolAsFlow(protocolId: string): Observable<BioxFlow<BioxProtocol>> {
    return this.getProtocol(protocolId).pipe(
      map(flow => this.initProtocolFlow(flow)),
      clRxjsDebug(),
    );
  }

  private initProtocolFlow(protocol: BioxProtocol): BioxFlow<BioxProtocol> {
    console.log(protocol);
    return new BioxFlow<BioxProtocol>(protocol);
  }
}
