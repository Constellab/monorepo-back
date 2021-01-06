import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';
import {Protocol, ProtocolDatasource} from '../model/entities/protocol.entity';
import {EntityPaginatedDatasource} from '../model/datasource/entity-datasource.class';
import {GetPageFunction} from '../model/global/page.class';

@Injectable({
  providedIn: 'root'
})
export class ProtocolService {

  private readonly route: string = 'protocols';

  constructor(private apiService: ApiService) {
  }

  /**
   * Return the list of the current user's projects
   */
  public getMyProtocolsDatasource(): ProtocolDatasource {
    return new EntityPaginatedDatasource(this.getMyProtocolsMethod(), 20);
  }

  /**
   * Return the list of the 4 first project for a user
   */
  public getDashboardMyProtocolsDatasource(): ProtocolDatasource {
    return new EntityPaginatedDatasource(this.getMyProtocolsMethod(), 4);
  }

  private getMyProtocolsMethod(): GetPageFunction<Protocol> {
    return (page: number, pageSize: number) => this.apiService.get(`${this.route}/current`, Protocol,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getCurrentProtocols(): Observable<Protocol[]> {
    return this.apiService.get(`${this.route}/current`, Protocol);
  }

  public findById(id: string): Observable<Protocol> {
    return this.apiService.get(`${this.route}/${id}`, Protocol);
  }

  public create(protocol: Partial<Protocol>): Observable<Protocol> {
    return this.apiService.post(this.route, protocol, Protocol);
  }
}
