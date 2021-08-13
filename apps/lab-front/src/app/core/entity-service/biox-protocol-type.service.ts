import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {ClPage} from '@monorepo/core-lib';
import {createTypedTree} from '../model/global/typed-tree.class';
import {
  BioxProtocolType,
  BioxProtocolTypeDatasource,
  BioxProtocolTypeTree
} from '../model/entities/processable-type/biox-protocol-type.entity';

@Injectable({
  providedIn: 'root'
})
export class BioxProtocolTypeService {

  private readonly route: string = 'protocol-type';

  constructor(private apiService: FlApiService) {
  }

  public getProtocols(page: number, pageSize: number): Observable<ClPage<BioxProtocolType>> {
    return this.apiService.get(this.route, BioxProtocolType,
      {resultIsPaginated: true, page: (page + 1), pageSize: pageSize});
  }

  public getProtocolsDatasource(): BioxProtocolTypeDatasource {
    return new FlEntityPaginatedDatasource(
      (page: number, pageSize: number): Observable<ClPage<BioxProtocolType>> => this.getProtocols(page, pageSize),
      20, true);
  }

  public getProtocolTypesTree(): Observable<BioxProtocolTypeTree[]> {
    return this.apiService.get(`${this.route}/typedTree`, createTypedTree(BioxProtocolType));
  }
}
