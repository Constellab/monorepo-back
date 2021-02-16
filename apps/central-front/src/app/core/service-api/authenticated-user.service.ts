import {Injectable} from '@angular/core';
import {User, UserCategory} from '../model/entities/user.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {FlApiService, FlCleanableService, FlCleanerService, FlTranslateService} from '@monorepo/front-core-lib';
import {ClSupportedLanguage} from '@monorepo/core-lib';

/**
 * Service to handle the current authenticated user
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticatedUserService implements FlCleanableService {

  private readonly usersRoute: string = 'users';

  private userAuthenticated: User;
  // subject to subscribe to user changes
  private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);


  constructor(private apiService: FlApiService,
              private translateService: FlTranslateService) {
    FlCleanerService.getInstance().registerService(this);
  }

  /**
   * Call the get user information route and store the user in the service
   */
  public loadAuthenticatedUser(): Observable<User> {
    return this.apiService.get(this.usersRoute + '/current', User).pipe(
      map(user => this.storeUserAuthenticated(user))
    );
  }

  public getUser(): User {
    if (this.userAuthenticated == null) {
      console.error('The user is not loaded yet');
      return null;
    }
    return this.userAuthenticated;
  }

  private storeUserAuthenticated(user: User): User {

    // check the user language
    this.checkAndChangeUserLanguage(user.lang);

    this.userAuthenticated = user;
    this.notifyUserChange();

    return this.userAuthenticated;
  }

  private notifyUserChange(): void {
    // emit the new user
    this.userSubject.next(this.userAuthenticated);
  }

  // change the lang of the user
  private checkAndChangeUserLanguage(lang: ClSupportedLanguage): void {
    // if the language has changed
    if (this.translateService.getUserLanguageCookie() !== lang) {
      this.translateService.changeAppLanguage(lang);
    }
  }


  /////////////////////////////// METHOD ON AUTHENTICATED USER //////////////////////////

  public changeLanguage(lang: ClSupportedLanguage): Observable<void> {
    return this.apiService.put(`${this.usersRoute}/language/${lang}`, null).pipe(
      tap(() => this.changeLanguageSuccess(lang))
    );
  }

  private changeLanguageSuccess(lang: ClSupportedLanguage): void {
    this.checkAndChangeUserLanguage(lang);
    if (this.userAuthenticated) {
      this.userAuthenticated.lang = lang;
      this.notifyUserChange();
    }
  }


  public isAdmin(): boolean {
    return this.userAuthenticated?.isAdmin() ?? false;
  }

  public isCategory(...categories: UserCategory[]): boolean {
    return this.userAuthenticated?.isCategory(...categories) ?? false;
  }

  /////////////////////////////// OTHER //////////////////////////
  clean(): void {
    this.userAuthenticated = null;
    this.userSubject.next(null);
  }
}
