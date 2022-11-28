import {Injectable} from '@angular/core';
import {CaSpaceService} from './ca-space.service';
import {CaSpace, CaSpaceRole} from '../model/entities/ca-space.class';
import {FlCleanableService, FlCleanerService, FlCookieService} from '@monorepo/front-core-lib';
import {environment} from '../../../environments/ca-environment';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CaUserDatasourcePaginated} from '../model/entities/ca-user.class';

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
              private cookieService: FlCookieService) {
    FlCleanerService.getInstance().registerService(this);
  }

  public init(): void {
    // in dev, load the domain from the local storage
    if (!environment.production) {
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

    if (!environment.production) {
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

  public getCurrentSpaceUsersDatasource(): CaUserDatasourcePaginated {
    return this.spaceService.getSpaceSimpleUsersDatasource('current');
  }


  clean(): void {
    this.currentSpace$.next(null);
    this.currentUserRoleInSpace = null;
    this.currentSpaceDomainDev = null;
  }


}
