import {Injectable} from '@angular/core';
import {FlApiWithCacheService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ClPage, clRxjsDebug} from '@monorepo/core-lib';
import {BioxFlow} from '../model/global/biox-connection.class';
import {BioxProtocolSpec, BioxProtocolSpecDatasource} from '../model/entities/processable-spec/biox-protocol-spec.entity';
import {BioxProtocol} from '../model/entities/proccesable/biox-protocol.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProtocolService {


  constructor(private apiService: FlApiWithCacheService) {
  }

  public getProtocolSpecs(page: number, pageSize: number): Observable<ClPage<BioxProtocolSpec>> {
    return this.apiService.get(`protocol-type`, BioxProtocolSpec,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProtocolSpecsDatasource(): BioxProtocolSpecDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number): Observable<ClPage<BioxProtocolSpec>> => this.getProtocolSpecs(page, pageSize),
      20, true);
  }


  public getProtocol(protocolId: string): Observable<BioxProtocol> {
    return this.apiService.get(`protocol/${protocolId}/gws.protocol.Protocol`, BioxProtocol);
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
