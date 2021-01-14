import {Injectable} from '@angular/core';
import {ServerInfo} from '../model/entities/server-info.class';
import {Observable} from 'rxjs';
import {FlApiService, FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class ServerInfoService {

  private readonly route: string = 'servers-info';

  constructor(private apiService: FlApiService) {
  }

  public findAllArrayObs(): FlArrayObs<ServerInfo> {
    return new FlEntityArrayObs(this.findAll());
  }

  public findAll(): Observable<ServerInfo[]> {
    return this.apiService.get(this.route, ServerInfo);
  }

  public create(serverInfo: ServerInfo): Observable<ServerInfo> {
    return this.apiService.post(this.route, serverInfo, ServerInfo);
  }

  public update(serverInfo: ServerInfo): Observable<ServerInfo> {
    return this.apiService.put(this.route, serverInfo, ServerInfo);
  }
}
