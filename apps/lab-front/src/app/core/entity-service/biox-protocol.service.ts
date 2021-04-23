import {Injectable} from '@angular/core';
import {FlApiWithCacheService, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {createViewModel} from '../model/global/view-model.entity';
import {ViewModelDatasourcePaginated} from '../utils/view-model.datasource';
import {BioxProtocol, BioxProtocolDatasource, BioxProtocolVM} from '../model/entities/biox-processable.entity';
import {map} from 'rxjs/operators';
import {clRxjsDebug} from '@monorepo/core-lib';

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


  public getProtocolOfExperiment(experimentId: string): Observable<BioxProtocol> {
    return this.getAndInitProtocol(experimentId, 'experiment_uri');
  }

  public getProtocol(protocolId: string): Observable<BioxProtocol> {
    return this.getAndInitProtocol(protocolId, 'protocol_uri');
  }

  private getAndInitProtocol(id: string, objectType: string): Observable<BioxProtocol> {
    return this.apiService.get(`protocol?${objectType}=${id}`, BioxProtocol).pipe(
      map(flow => this.initProtocolConnectionsAndNodes(flow)),
      clRxjsDebug(),
    );
  }

  private initProtocolConnectionsAndNodes(flow: BioxProtocol): BioxProtocol {
    console.log(flow);
    flow.data.initConnectionsAndNodes();
    return flow;
  }
}
