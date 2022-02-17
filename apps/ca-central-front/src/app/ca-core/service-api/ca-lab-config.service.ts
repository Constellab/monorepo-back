import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaLabConfig} from '../model/entities/ca-lab-config.class';
import {FlApiService} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaLabConfigService {

  private readonly route: string = 'labs';

  constructor(private apiService: FlApiService) {
  }

  public findAll(): Observable<CaLabConfig[]> {
    return this.apiService.get(this.route, CaLabConfig);
  }
}
