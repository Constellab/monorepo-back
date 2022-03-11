import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaGroup} from '../model/entities/ca-group.entity';

@Injectable({
  providedIn: 'root'
})
export class CaGroupService {

  private readonly route = 'groups';

  constructor(private apiService: FlApiService) {
  }

  public getCurrentGroups(): Observable<CaGroup[]> {
    return this.apiService.get(`${this.route}/current`);
  }
}
