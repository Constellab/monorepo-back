import {Injectable} from '@angular/core';
import {CleanableService, CleanerService} from '../utils/cleanable-service';
import {User, UserCategory} from '../model/entities/user.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {ApiService} from './api.service';
import {map} from 'rxjs/operators';
import {SupportedLanguage} from '../model/global/supported-language.class';
import {CoreTranslateService} from '../module/translate/service/core-translate.service';

/**
 * Service to handle the current authenticated user
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticatedUserService implements CleanableService {

  private readonly usersRoute: string = 'users';

  private userAuthenticated: User;
  // subject to subscribe to user changes
  private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);


  constructor(private apiService: ApiService,
              private translateService: CoreTranslateService) {
    CleanerService.getInstance().registerService(this);
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
  private checkAndChangeUserLanguage(lang: SupportedLanguage): void {
    // if the language has changed
    if (this.translateService.getUserLanguageCookie() !== lang) {
      this.translateService.changeAppLanguage(lang);
    }
  }

  clean(): void {
    this.userAuthenticated = null;
    this.userSubject.next(null);
  }

  /////////////////////////////// METHOD ON AUTHENTICATED USER //////////////////////////
  public isAdmin(): boolean {
    return this.userAuthenticated?.isAdmin() ?? false;
  }

  public isCategory(...categories: UserCategory[]): boolean {
    return this.userAuthenticated?.isCategory(...categories) ?? false;
  }
}
