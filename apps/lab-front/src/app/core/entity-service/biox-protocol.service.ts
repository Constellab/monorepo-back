import {Injectable} from '@angular/core';
import {FlApiWithCacheService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {clRxjsDebug} from '@monorepo/core-lib';
import {BioxFlow} from '../model/global/biox-connection.class';
import {BioxProtocol} from '../model/entities/proccesable/biox-protocol.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProtocolService {


  constructor(private apiService: FlApiWithCacheService) {
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
