import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabUser} from '../model/entities/lab-user.entity';

@Injectable({providedIn: 'root'})
export class LabUserService {

  private readonly route = 'user';

  constructor(private apiService: FlApiService) {
  }

  public getAllUsers(): Observable<LabUser[]> {
    return this.apiService.get(this.route, LabUser);
  }
}
