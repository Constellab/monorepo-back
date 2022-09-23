import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CaUser} from '../model/entities/ca-user.class';
import {FlApiService} from '@monorepo/front-core-lib';

/**
 * Service for the User entities
 */
@Injectable({
  providedIn: 'root'
})
export class CaUsersService {

  private readonly route: string = 'users';

  constructor(private apiService: FlApiService) {
  }

  public getUserPhoto(userId: string): string{
    return this.apiService.getBaseRouteUrl(`${this.route}/photo/${userId}`);
  }

  public findAll(): Observable<CaUser[]> {
    return this.apiService.get(this.route, CaUser);
  }

  public editUser(newUserInfo: Partial<CaUser>, newUserPhoto: File): Observable<CaUser>{
    const formData = new FormData();
    formData.append('photo', newUserPhoto);
    return this.apiService.put(this.route + '/new-photo/' + newUserInfo.id, formData);
  }



}
