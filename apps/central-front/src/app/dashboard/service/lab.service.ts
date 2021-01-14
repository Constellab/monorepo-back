import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Lab} from '../../core/model/entities/lab.class';
import {FlApiService, FlArrayObs, FlEntityArrayObs} from '@monorepo/front-core-lib';

@Injectable({
  providedIn: 'root'
})
export class LabService {

  private readonly route: string = 'labs';

  constructor(private apiService: FlApiService) {
  }

  public getCurrentLabs(): FlArrayObs<Lab> {
    return new FlEntityArrayObs(this.apiService.get(this.route + '/current', Lab));
  }

  public findAll(): Observable<Lab[]> {
    return this.apiService.get(this.route, Lab);
  }

  public create(lab: Partial<Lab>): Observable<Lab> {
    return this.apiService.post(this.route, lab, Lab);
  }

  public update(lab: Partial<Lab>): Observable<Lab> {
    return this.apiService.put(this.route, lab, Lab);
  }
}
