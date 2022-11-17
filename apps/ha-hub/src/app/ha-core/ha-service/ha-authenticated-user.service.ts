import {Injectable} from '@angular/core';
import {FlApiService, FlCleanableService, FlCleanerService} from '@monorepo/front-core-lib';
import {BehaviorSubject, Observable} from 'rxjs';
import {HaUser, HaUserCategory} from '../ha-model/ha-entities/ha-user';
import {HaAuthService} from './ha-auth.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HaAuthenticatedUserService implements FlCleanableService{

  private readonly userRoute: string = 'user';
  public userSubject: BehaviorSubject<HaUser> = new BehaviorSubject<HaUser>(null);

  constructor(private apiService: FlApiService,
              private authService: HaAuthService) {
    FlCleanerService.getInstance().registerService(this);
  }

  public init(): void {
    if (this.authService.hasAuthorizationCookie()) {
      this.apiService.get(this.userRoute).subscribe((user: HaUser) => {
        this.userSubject.next(user);
      });
    } else {
      this.userSubject.next(null);
    }
  }

  public getUser(): Observable<HaUser> {
    return this.userSubject.pipe();
  }

  public isAdmin(): Observable<boolean> {
    return this.getUser().pipe(
      map(user => user != null && user.category === HaUserCategory.ADMIN)
    );
  }

  clean(): void {
    this.userSubject.next(null);
  }


}
