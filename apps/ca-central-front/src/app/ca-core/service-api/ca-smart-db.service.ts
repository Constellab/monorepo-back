import {Injectable} from '@angular/core';
import {FlApiService, FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaSmartDbDoc, CaSmartDbDocSearchResult} from '../../ca-smart-db/model/ca-smart-db-doc.class';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CaSmartDb, CaSmartDbDatasource} from '../model/entities/ca-smart-db.entity';

@Injectable({
  providedIn: 'root'
})
export class CaSmartDbService {

  private readonly route = 'smart-db';

  constructor(private apiService: FlApiService) {
  }

  public getCurrentSmartDbs(page: number, pageSize: number): Observable<ClPageI<CaSmartDb>> {
    return this.apiService.get(`${this.route}/current`, CaSmartDb,
      {resultIsPaginated: true, page: page, pageSize: pageSize});
  }

  public getCurrentSmartDbsDatasource(pageSize: number): CaSmartDbDatasource {
    return new FlEntityPaginatedDatasource(
      (page, size) => this.getCurrentSmartDbs(page, size), pageSize);
  }


  public findById(smartDbId: string): Observable<CaSmartDb> {
    return this.apiService.getById(this.route, smartDbId, CaSmartDb);
  }


  ///////////////////// DOC /////////////////////

  public findDocById(smartDbId: string, id: string): Observable<CaSmartDbDoc> {
    return this.apiService.get(this.getDocsRoute(smartDbId, id));
  }

  public search(smartDbId: string, search: string, page: number, pageSize: number): Observable<ClPage<CaSmartDbDocSearchResult>> {
    return this.apiService.get(this.getDocsRoute(smartDbId, `search/${search}`), null, {
      resultIsPaginated: true, page: page, pageSize: pageSize
    });
  }

  public getDownloadSmartDbLink(smartDbId: string): string {
    return this.apiService.getBaseRouteUrl(this.getDocsRoute(smartDbId, 'download'));
  }

  public init(smartDbId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post(this.getDocsRoute(smartDbId, 'init'), formData);
  }

  public uploadData(smartDbId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post(this.getDocsRoute(smartDbId, 'upload'), formData);
  }

  public validateDoc(smartDbId: string, doc: CaSmartDbDoc): Observable<CaSmartDbDoc> {
    return this.apiService.put(this.getDocsRoute(smartDbId, 'validate'), doc);
  }

  // use to get the list of not validated by a user
  public getNotValidated(smartDbId: string, page: number, pageSize: number): Observable<ClPageI<CaSmartDbDoc>> {
    return this.apiService.get(this.getDocsRoute(smartDbId, 'not-validated'), null, {
      resultIsPaginated: true, page: page, pageSize: pageSize
    });
  }

  private getDocsRoute(smartDbId: string, route: string): string {
    return `${this.route}/${smartDbId}/docs/${route}`;
  }
}
