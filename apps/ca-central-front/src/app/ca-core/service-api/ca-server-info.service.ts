import {Injectable} from '@angular/core';
import {CaServerInfo} from '../model/entities/ca-server-info.class';
import {Observable} from 'rxjs';
import {FlApiService, FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaServerInfoService {

  private readonly route: string = 'servers-info';

  constructor(private apiService: FlApiService) {
  }

  public findAllArrayObs(): FlArrayObs<CaServerInfo> {
    return new FlEntityArrayObs(this.findAll());
  }

  public findAll(): Observable<CaServerInfo[]> {
    return this.apiService.get(this.route, CaServerInfo);
  }

  public create(serverInfo: CaServerInfo): Observable<CaServerInfo> {
    return this.apiService.post(this.route, serverInfo, CaServerInfo);
  }

  public update(serverInfo: CaServerInfo): Observable<CaServerInfo> {
    return this.apiService.put(this.route, serverInfo, CaServerInfo);
  }
}
