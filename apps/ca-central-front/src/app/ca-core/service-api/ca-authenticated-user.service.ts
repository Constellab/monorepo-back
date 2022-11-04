import {Inject, Injectable} from '@angular/core';
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
import {ClStringHelper, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {CmUserCategory} from '@monorepo/common-model';
import {CaCurrentOrganizationService} from './ca-current-organization.service';
import {CaOrganizationInfoDto} from '../model/entities/ca-organization.class';
import {CaOrganizationService} from './ca-organization.service';
import {DOCUMENT} from '@angular/common';
import {environment} from '../../../environments/ca-environment';

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
              private themeService: FlThemeService,
              private organizationService: CaOrganizationService,
              private currentOrganizationService: CaCurrentOrganizationService,
              @Inject(DOCUMENT) private document: Document) {
    FlCleanerService.getInstance().registerService(this);
  }

  /**
   * Call the get user information route and store the user in the service
   */
  public loadCurrentInfo(): Observable<CaOrganizationInfoDto> {
    this.currentOrganizationService.init();
    return this.organizationService.getCurrentInfo().pipe(
      map(organizationInfo => this.storeCurrentAuthenticatedInfo(organizationInfo))
    );
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

  /**
   * For dev environment
   * @param domain
   */
  public setCurrentOrganizationDomainDev(domain: string): void {
    this.currentOrganizationService.setCurrentOrganizationDomainDev(domain);
  }

  private storeCurrentAuthenticatedInfo(organizationInfo: CaOrganizationInfoDto): CaOrganizationInfoDto {

    if (environment.production) {
      // if the website organization domain does not correspond to the user organization domain
      // redirect to the website organization domain
      const url = this.document.defaultView.location.href;
      const domain = ClStringHelper.getLowestDomainFromUrl(url);
      if (domain !== organizationInfo.organization.domain) {
        this.document.defaultView.location.href = `https://${organizationInfo.organization.domain}.${environment.frontDomain}`;
        // throw an error so the guard does not navigate to the page
        throw new Error('Redirect to the organization domain');
      }
    }

    this.currentOrganizationService.setCurrentOrganization(organizationInfo.organization, organizationInfo.roleInOrga);
    this.storeUserAuthenticated(organizationInfo.user);
    return organizationInfo;
  }

  private storeUserAuthenticated(user: CaUser): CaUser {

    // check the user language
    this.translateService.changeAppLanguage(user.lang);

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

  /////////////////////////////// METHOD ON AUTHENTICATED USER //////////////////////////

  public changeLanguage(lang: ClSupportedLanguage): Observable<void> {
    return this.apiService.put(`${this.usersRoute}/language/${lang}`, null).pipe(
      tap(() => this.changeLanguageSuccess(lang))
    );
  }

  private changeLanguageSuccess(lang: ClSupportedLanguage): void {
    this.translateService.changeAppLanguage(lang);
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

  /**
   * return true is the authenticated user is an admin of the current orga or
   * a G admin
   */
  public isCurrentOrganizationAdmin(): boolean {
    return this.isAdmin() || this.currentOrganizationService.isOrganizationAdmin();
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
