import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {BioxStudy} from '../model/entities/biox-study.class';

@Injectable({
  providedIn: 'root'
})
export class BioxStudyService {

  private readonly route: string = 'study';


  constructor(private apiService: FlApiService) {
  }

  public getStudies(): Observable<BioxStudy[]> {
    return this.apiService.get(this.route, BioxStudy);
  }
}
