import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaSmartDbDoc} from '../model/ca-document.class';
import {ClPage} from '@monorepo/core-lib';
import {environment} from '../../../environments/ca-environment';

@Injectable({
  providedIn: 'root'
})
export class CaSmartDbService {

  private readonly route = 'app';

  constructor(private apiService: FlApiService) {
  }

  public findById(id: string): Observable<CaSmartDbDoc> {
    return this.apiService.get(`${this.route}/${id}`, null, {
      overrideApiUrl: environment.smartDbApiUrl
    });
  }

  public search(search: string, page: number, pageSize: number): Observable<ClPage<CaSmartDbDoc>> {
    return this.apiService.get(`${this.route}/search/${search}`, null, {
      resultIsPaginated: true, page: page, pageSize: pageSize, overrideApiUrl: environment.smartDbApiUrl
    });
  }
}
