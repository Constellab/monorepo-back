import {Injectable} from '@angular/core';
import {CaSpaceService} from './ca-space.service';
import {CaSpace} from '../model/entities/space/ca-space.class';
import {FlCleanableService, FlCleanerService, FlCookieService} from '@monorepo/front-core-lib';
import {BehaviorSubject, filter, firstValueFrom, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CaUserDatasourcePaginated} from '../model/entities/ca-user.class';
import {Title} from '@angular/platform-browser';
import {CaSpaceRole, CaSpaceUser} from '../model/entities/space/ca-space-user.class';
import {CaSpaceUserSearchFields} from '../entity-module/ca-space-core/model/ca-space-user-search.class';
import {ClPage} from '@monorepo/core-lib';
import {CaEnvironmentHelper} from '../utils/ca-environment.helper';

/**
 * Service to manage the current space
 */
@Injectable({
  providedIn: 'root'
})
export class CaCurrentSpaceService implements FlCleanableService {

  private currentSpaceDomainDev: string;

  private currentSpace$: BehaviorSubject<CaSpace> = new BehaviorSubject(null);
  private currentUserRoleInSpace: CaSpaceRole;

  // key use to store the current space in the local storage only for dev env
  private devSpaceStorageKey: string = 'local-space';

  constructor(private spaceService: CaSpaceService,
              private cookieService: FlCookieService,
              private titleService: Title) {
    FlCleanerService.getInstance().registerService(this);
  }

  public init(): void {
    // in dev, load the domain from the local storage
    if (!CaEnvironmentHelper.isProduction()) {
      this.currentSpaceDomainDev = this.cookieService.getStringCookie(this.devSpaceStorageKey);
    }
  }

  public getCurrentSpaceDomainDev(): string {
    return this.currentSpaceDomainDev;
  }

  /**
   * For dev environment
   * @param domain
   */
  public setCurrentSpaceDomainDev(domain: string): void {
    this.currentSpaceDomainDev = domain;
    this.cookieService.setCookie(this.devSpaceStorageKey, domain);
  }

  public setCurrentSpace(space: CaSpace): void {
    this.currentSpace$.next(space);
    this.currentSpaceDomainDev = space.domain;
    this.titleService.setTitle(space.name);

    if (!CaEnvironmentHelper.isProduction()) {
      this.cookieService.setCookie(this.devSpaceStorageKey, space.domain);
    }
  }

  public setCurrentSpaceUserRole(role: CaSpaceRole): void {
    this.currentUserRoleInSpace = role;
  }


  public getCurrentSpace$(): Observable<CaSpace> {
    return this.currentSpace$.asObservable().pipe(
      filter(space => space != null)
    );
  }

  public getCurrentSpacePromise(): Promise<CaSpace> {
    return firstValueFrom(this.getCurrentSpace$());
  }

  public getCurrentSpacePhoto$(): Observable<string> {
    return this.getCurrentSpace$().pipe(
      map(space => space.photo ?
        this.spaceService.getSpacePhoto(space.photo) : null)
    );
  }

  // return true if the current user if an admin of the current space
  public isSpaceAdmin(): boolean {
    return this.currentUserRoleInSpace === CaSpaceRole.ADMIN;
  }

  //////////////////////////// API METHODS ////////////////////////////

  public getCurrentSpaceUsersDatasource(): CaUserDatasourcePaginated {
    return this.spaceService.getSpaceSimpleUsersDatasource('current');
  }

  public searchSpaceUsers(page: number, pageSize: number,
                          filters?: CaSpaceUserSearchFields): Observable<ClPage<CaSpaceUser>> {
    return this.spaceService.searchSpaceUsers('current', page, pageSize, filters);
  }

  public addUserToSpace(userId: string): Observable<CaSpaceUser> {
    return this.spaceService.addUserToSpace('current', userId);
  }

  public activateUser(userId: string): Observable<void> {
    return this.spaceService.activateUser('current', userId);
  }

  public deactivateUser(userId: string): Observable<void> {
    return this.spaceService.deactivateUser('current', userId);
  }

  public updateUserRole(userId: string, role: CaSpaceRole): Observable<void> {
    return this.spaceService.updateUserRole('current', userId, role);
  }

  public removeUserFromSpace(userId: string): Observable<void> {
    return this.spaceService.removeUserFromSpace('current', userId);
  }


  clean(): void {
    this.currentSpace$.next(null);
    this.currentUserRoleInSpace = null;
    this.currentSpaceDomainDev = null;
    if (!CaEnvironmentHelper.isProduction()) {
      this.cookieService.removeCookie(this.devSpaceStorageKey);
    }
  }


}
