import {Injectable} from '@angular/core';
import {CaStats} from '../model/entities/ca-stats.class';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaStatsService {
  private readonly route = 'stats';

  constructor(private apiService: FlApiService) {
  }

  getStats(): Observable<CaStats> {
    return this.apiService.get(`${this.route}`)
  }
}
