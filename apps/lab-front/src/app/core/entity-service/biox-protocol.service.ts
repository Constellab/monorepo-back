import {Injectable} from '@angular/core';
import {FlApiWithCacheService, FlEntityPaginatedDatasource, FlGetPageFunction, FlPage} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxProtocol, BioxProtocolDatasource} from '../model/entities/biox-processable.entity';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BioxProtocolService {


  constructor(private apiService: FlApiWithCacheService) {
  }

  public getProtocols(page: number, pageSize: number): Observable<FlPage<BioxProtocol>> {
    return this.apiService.get(`protocol/list`, BioxProtocol,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize}).pipe(
      map(protocols => this.initProtocolsPageConnections(protocols))
    );
  }

  public getProtocolsDatasource(): BioxProtocolDatasource {
    return new FlEntityPaginatedDatasource(this.getProtocolsMethod(), 20, true);
  }

  private getProtocolsMethod(): FlGetPageFunction<BioxProtocol> {
    return (page: number, pageSize: number): Observable<FlPage<BioxProtocol>> => this.getProtocols(page, pageSize);
  }

  public getProtocol(id: string): Observable<BioxProtocol> {
    return this.apiService.getByIdWithCache(`protocol`, id, BioxProtocol).pipe(
      map(protocol => this.initProtocolConnection(protocol))
    );
  }

  private initProtocolsPageConnections(protocols: FlPage<BioxProtocol>): FlPage<BioxProtocol> {
    this.initProtocolsConnections(protocols.objects);
    return protocols;
  }

  private initProtocolsConnections(protocols: BioxProtocol[]): BioxProtocol[] {
    return protocols.map(p => this.initProtocolConnection(p));
  }

  private initProtocolConnection(protocol: BioxProtocol): BioxProtocol {
    protocol.data.graph.initConnectionsAndNodes();
    return protocol;
  }

}
