import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaLab} from '../model/entities/ca-lab.class';
import {FlApiService, FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class CaLabService {

  private readonly route: string = 'labs';

  constructor(private apiService: FlApiService) {
  }

  public getCurrentLabs(): FlArrayObs<CaLab> {
    return new FlEntityArrayObs(this.apiService.get(this.route + '/current', CaLab));
  }

  public findAll(): Observable<CaLab[]> {
    return this.apiService.get(this.route, CaLab);
  }

  public create(lab: Partial<CaLab>): Observable<CaLab> {
    return this.apiService.post(this.route, lab, CaLab);
  }

  public update(lab: Partial<CaLab>): Observable<CaLab> {
    return this.apiService.put(this.route, lab, CaLab);
  }
}
