import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {ArrayObs} from '../model/datasource/array-obs.class';
import {ServerInfo} from '../model/entities/server-info.class';
import {EntityArrayObs} from '../model/datasource/entity-array.class';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerInfoService {

  private readonly route: string = 'servers-info';

  constructor(private apiService: ApiService) {
  }

  public findAllArrayObs(): ArrayObs<ServerInfo> {
    return new EntityArrayObs(this.findAll());
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
