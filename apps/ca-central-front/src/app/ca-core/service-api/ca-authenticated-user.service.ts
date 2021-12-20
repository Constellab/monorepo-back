import {Injectable} from '@angular/core';
import {CaUser} from '../model/entities/ca-user.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {
  FlApiService,
  FlCleanableService,
  FlCleanerService,
  FlThemeService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {CmUserCategory} from '@monorepo/common-model';

/**
 * Service to handle the current authenticated user
 */
@Injectable({
  providedIn: 'root'
})
export class CaAuthenticatedUserService implements FlCleanableService {

  private readonly usersRoute: string = 'users';

  private userAuthenticated: CaUser;
  // subject to subscribe to user changes
  private userSubject: BehaviorSubject<CaUser> = new BehaviorSubject<CaUser>(null);


  constructor(private apiService: FlApiService,
              private translateService: FlTranslateService,
              private themeService: FlThemeService) {
    FlCleanerService.getInstance().registerService(this);
  }

  /**
   * Call the get user information route and store the user in the service
   */
  public loadAuthenticatedUser(): Observable<CaUser> {
    return this.apiService.get(this.usersRoute + '/current', CaUser).pipe(
      map(user => this.storeUserAuthenticated(user))
    );
  }

  public getUser(): CaUser {
    if (this.userAuthenticated == null) {
      console.error('The user is not loaded yet');
      return null;
    }
    return this.userAuthenticated;
  }

  private storeUserAuthenticated(user: CaUser): CaUser {

    // check the user language
    this.checkAndChangeUserLanguage(user.lang);

    // set the user theme
    this.themeService.changeTheme(user.theme);

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

  public changeTheme(theme: ClTheme): Observable<void> {
    return this.apiService.put(`${this.usersRoute}/theme/${theme}`, null).pipe(
      tap(() => this.changeThemeSuccess(theme))
    );
  }

  private changeThemeSuccess(theme: ClTheme): void {
    this.userAuthenticated.theme = theme;
    this.notifyUserChange();
  }


  public isAdmin(): boolean {
    return this.userAuthenticated?.isAdmin() ?? false;
  }

  public isCategory(...categories: CmUserCategory[]): boolean {
    return this.userAuthenticated?.isCategory(...categories) ?? false;
  }

  /////////////////////////////// OTHER //////////////////////////
  clean(): void {
    this.userAuthenticated = null;
    this.userSubject.next(null);
  }
}
