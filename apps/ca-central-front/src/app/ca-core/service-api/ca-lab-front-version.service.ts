import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {
  CaLabFrontVersion,
  CaLabFrontVersionDatasource,
  CaSaveLabFrontVersionDTO
} from '../model/entities/ca-lab-front-version.class';
import {Observable} from 'rxjs';
import {ClPageI} from '@monorepo/core-lib';


@Injectable({providedIn: 'root'})
export class CaLabFrontVersionService {

  private readonly route = 'lab-front-versions';

  constructor(private apiService: FlApiService) {
  }

  public create(saveLabFront: CaSaveLabFrontVersionDTO): Observable<CaLabFrontVersion> {
    return this.apiService.post(this.route, saveLabFront, CaLabFrontVersion);
  }

  public update(saveLabFront: CaSaveLabFrontVersionDTO): Observable<CaLabFrontVersion> {
    return this.apiService.put(this.route, saveLabFront, CaLabFrontVersion);
  }

  public delete(id: string): Observable<void> {
    return this.apiService.deleteById(this.route, id);
  }

  public getAll(page: number, pageSize: number): Observable<ClPageI<CaLabFrontVersion>> {
    return this.apiService.get(this.route, CaLabFrontVersion,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getAllDatasource(): CaLabFrontVersionDatasource {
    return new FlEntityPaginatedDatasource((page: number, pageSize: number) =>
      this.getAll(page, pageSize), 20);
  }
}
