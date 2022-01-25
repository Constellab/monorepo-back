import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaSmartDbDoc} from '../model/ca-document.class';
import {ClPage} from '@monorepo/core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaSmartDbService {

  private readonly route = 'smart-db/doc';

  constructor(private apiService: FlApiService) {
  }

  public findById(id: string): Observable<CaSmartDbDoc> {
    return this.apiService.get(`${this.route}/${id}`, null);
  }

  public search(search: string, page: number, pageSize: number): Observable<ClPage<CaSmartDbDoc>> {
    return this.apiService.get(`${this.route}/search/${search}`, null, {
      resultIsPaginated: true, page: page, pageSize: pageSize
    });
  }

  public getDownloadSmartDbLink(): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/download`);
  }

  public init(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post(`${this.route}/init`, formData);
  }

  public uploadData(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post(`${this.route}/upload`, formData);
  }
}
