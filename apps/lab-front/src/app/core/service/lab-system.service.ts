import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabSystemService {

  private readonly route: string = 'system';

  constructor(private apiService: FlApiService) {
  }

  /**
   * Call route to completely reset the dev environment (reset tables and data)
   */
  public resetDevEnvironment(): Observable<void> {
    return this.apiService.post(`${this.route}/dev-reset`, null);

  }
}
