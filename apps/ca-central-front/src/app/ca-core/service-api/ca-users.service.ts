import {Injectable} from '@angular/core';
import {mergeMap, Observable} from 'rxjs';
import {CaUser} from '../model/entities/ca-user.class';
import {FlApiService} from '@monorepo/front-core-lib';
import {map} from 'rxjs/operators';
import {ClPageI} from '@monorepo/core-lib';

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

  public getById(id: string): Observable<CaUser>{
    return this.apiService.getById(`${this.route}`, id);
  }

  public getUserPhoto(userId: string): string {
    return this.apiService.getBaseRouteUrl(`${this.route}/photo/${userId}`);
  }

  public findAll(page: number, pageSize: number): Observable<ClPageI<CaUser>> {
    return this.apiService.get(`${this.route}`, CaUser,
      {page: page, pageSize: pageSize, resultIsPaginated: true});
  }

  public editUser(newUserInfo: Partial<CaUser>, newUserPhoto: File): Observable<CaUser> {

    if(newUserPhoto){
      const formData = new FormData();
      formData.append('photo', newUserPhoto);
      return this.apiService.put(this.route + '/edit-photo/' + newUserInfo.id, formData).pipe(
        mergeMap(() => this.apiService.put(this.route + '/edit', newUserInfo, CaUser)),
        map((res) => res)
      );
    } else {
      return this.apiService.put(this.route + '/edit', newUserInfo, CaUser);
    }

  }


}
