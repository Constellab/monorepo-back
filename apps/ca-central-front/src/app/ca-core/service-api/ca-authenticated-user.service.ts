import {Inject, Injectable} from '@angular/core';
import {CaUser} from '../model/entities/ca-user.class';
import {BehaviorSubject, mergeMap, Observable} from 'rxjs';
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
import {CaCurrentSpaceService} from './ca-current-space.service';
import {CaSpaceInfoDto} from '../model/entities/space/ca-space.class';
import {CaSpaceService} from './ca-space.service';
import {DOCUMENT} from '@angular/common';
import {CaEnvironmentHelper} from '../utils/ca-environment.helper';

/**
 * Service to handle the current authenticated user
 */
@Injectable({
  providedIn: 'root'
})
export class CaAuthenticatedUserService implements FlCleanableService {

  private readonly currentUserRoute: string = 'users/current';

  private userAuthenticated: CaUser;
  // subject to subscribe to user changes
  private userSubject: BehaviorSubject<CaUser> = new BehaviorSubject<CaUser>(null);


  constructor(private apiService: FlApiService,
              private translateService: FlTranslateService,
              private themeService: FlThemeService,
              private spaceService: CaSpaceService,
              private currentSpaceService: CaCurrentSpaceService,
              @Inject(DOCUMENT) private document: Document) {
    FlCleanerService.getInstance().registerService(this);
  }

  /**
   * Call the get user information route and store the user in the service
   */
  public loadCurrentInfo(): Observable<CaSpaceInfoDto> {
    this.currentSpaceService.init();
    return this.spaceService.getCurrentInfo().pipe(
      map(spaceInfo => this.storeCurrentAuthenticatedInfo(spaceInfo))
    );
  }

  /**
   * Call the get user information route and store the user in the service
   */
  public loadAuthenticatedUser(): Observable<CaUser> {
    return this.apiService.get(this.currentUserRoute, CaUser).pipe(
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
  public setCurrentSpaceDomainDev(domain: string): void {
    this.currentSpaceService.setCurrentSpaceDomainDev(domain);
  }

  private storeCurrentAuthenticatedInfo(spaceInfo: CaSpaceInfoDto): CaSpaceInfoDto {

    if (CaEnvironmentHelper.isProduction()) {
      // if the website space domain does not correspond to the user space domain
      // redirect to the website space domain
      const url = this.document.defaultView.location.href;
      const domain = ClStringHelper.getLowestDomainFromUrl(url);
      if (domain !== spaceInfo.space.domain) {
        this.document.defaultView.location.href = `https://${spaceInfo.space.domain}.${CaEnvironmentHelper.getFrontDomain()}`;
        // throw an error so the guard does not navigate to the page
        throw new Error('Redirect to the space domain');
      }
    }

    this.currentSpaceService.setCurrentSpace(spaceInfo.space);
    this.currentSpaceService.setCurrentSpaceUserRole(spaceInfo.roleInSpace);
    this.storeUserAuthenticated(spaceInfo.user);
    return spaceInfo;
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
    return this.apiService.put(`${this.currentUserRoute}/language/${lang}`, null).pipe(
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
    return this.apiService.put(`${this.currentUserRoute}/theme/${theme}`, null).pipe(
      tap(() => this.changeThemeSuccess(theme))
    );
  }

  private changeThemeSuccess(theme: ClTheme): void {
    this.userAuthenticated.theme = theme;
    this.notifyUserChange();
  }

  public editUser(newUserInfo: Partial<CaUser>, newUserPhoto: File): Observable<CaUser> {

    if (newUserPhoto) {
      const formData = new FormData();
      formData.append('photo', newUserPhoto);
      return this.apiService.put(this.currentUserRoute + '/photo/' + newUserInfo.id, formData).pipe(
        mergeMap(() => this.apiService.put(this.currentUserRoute + '/edit', newUserInfo, CaUser)),
        map((res) => res)
      );
    } else {
      return this.apiService.put(this.currentUserRoute + '/edit', newUserInfo, CaUser);
    }
  }

  public has2FA(): Observable<boolean> {
    return this.apiService.get(`${this.currentUserRoute}/2-fa`).pipe(
      map(response => response.enabled)
    );
  }

  public set2FA(enabled: boolean): Observable<boolean> {
    return this.apiService.put(`${this.currentUserRoute}/2-fa`, {enabled}).pipe(
      map(response => response.enabled)
    );
  }

  /////////////////////////////// OTHER //////////////////////////
  public isAdmin(): boolean {
    return this.userAuthenticated?.isAdmin() ?? false;
  }

  /**
   * return true is the authenticated user is an admin of the current space or
   * a G admin
   */
  public isCurrentSpaceAdmin(): boolean {
    return this.isAdmin() || this.currentSpaceService.isSpaceAdmin();
  }

  public isCategory(...categories: CmUserCategory[]): boolean {
    return this.userAuthenticated?.isCategory(...categories) ?? false;
  }

  clean(): void {
    this.userAuthenticated = null;
    this.userSubject.next(null);
  }
}
