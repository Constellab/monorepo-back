import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {LabShareLink, LabShareLinkDatasource, LabShareLinkType} from '../model/entities/lab-share.entity';
import {Observable} from 'rxjs';
import {ClPageI} from '@monorepo/core-lib';

@Injectable({
  providedIn: 'root'
})
export class LabShareLinkService {

  private route: string = 'share-link';

  constructor(private apiService: FlApiService) {
  }

  public create(shareLink: Partial<LabShareLink>): Observable<LabShareLink>{
    return this.apiService.post(this.route, shareLink, LabShareLink, {serialization: LabShareLink});
  }

  public update(shareLink: Partial<LabShareLink>): Observable<LabShareLink>{
    return this.apiService.put(this.route, shareLink, LabShareLink, {serialization: LabShareLink});
  }

  public delete(id: string): Observable<void>{
    return this.apiService.deleteById(this.route, id);
  }

  public getAll(page: number, size: number): Observable<ClPageI<LabShareLink>>{
    return this.apiService.get(this.route, LabShareLink, {
      page: page, pageSize: size, resultIsPaginated: true
    });
  }

  public getAllDatasource(): LabShareLinkDatasource{
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getAll(page, size), 20);
  }

  public getDownloadLink(entityType: LabShareLinkType, token: string): string{
    return this.apiService.getBaseRouteUrl(`${this.route}/${entityType.toLowerCase()}/download/${token}`);
  }

  public getShareLink(entityType: LabShareLinkType, entityId: string): Observable<LabShareLink> {
    return this.apiService.get(`${this.route}/${entityType}/${entityId}`, LabShareLink)
  }
}
