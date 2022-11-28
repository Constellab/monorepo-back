import {Injectable} from '@angular/core';
import {CaOrganizationService} from './ca-organization.service';
import {CaOrganization, CaOrganizationRole} from '../model/entities/ca-organization.class';
import {FlCleanableService, FlCleanerService, FlCookieService} from '@monorepo/front-core-lib';
import {environment} from '../../../environments/ca-environment';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CaUserDatasourcePaginated} from '../model/entities/ca-user.class';

/**
 * Service to manage the current organization
 */
@Injectable({
  providedIn: 'root'
})
export class CaCurrentOrganizationService implements FlCleanableService {

  private currentOrganizationDomainDev: string;

  private currentOrganization$: BehaviorSubject<CaOrganization> = new BehaviorSubject(null);
  private currentUserRoleInOrganization: CaOrganizationRole;

  // key use to store the current organization in the local storage only for dev env
  private devOrganizationStorageKey: string = 'local-organization';

  constructor(private organizationService: CaOrganizationService,
              private cookieService: FlCookieService) {
    FlCleanerService.getInstance().registerService(this);
  }

  public init(): void {
    // in dev, load the domain from the local storage
    if (!environment.production) {
      this.currentOrganizationDomainDev = this.cookieService.getStringCookie(this.devOrganizationStorageKey);
    }
  }

  public getCurrentOrganizationDomainDev(): string {
    return this.currentOrganizationDomainDev;
  }

  /**
   * For dev environment
   * @param domain
   */
  public setCurrentOrganizationDomainDev(domain: string): void {
    this.currentOrganizationDomainDev = domain;
    this.cookieService.setCookie(this.devOrganizationStorageKey, domain);
  }

  public setCurrentOrganization(organization: CaOrganization): void {
    this.currentOrganization$.next(organization);
    this.currentOrganizationDomainDev = organization.domain;

    if (!environment.production) {
      this.cookieService.setCookie(this.devOrganizationStorageKey, organization.domain);
    }
  }

  public setCurrentOrganizationUserRole(role: CaOrganizationRole): void {
    this.currentUserRoleInOrganization = role;
  }


  public getCurrentOrganization$(): Observable<CaOrganization> {
    return this.currentOrganization$.asObservable().pipe(
      filter(organization => organization != null)
    );
  }

  public getCurrentOrganizationPhoto$(): Observable<string> {
    return this.getCurrentOrganization$().pipe(
      map(organization => organization.photo ?
        this.organizationService.getOrganizationPhoto(organization.photo) : null)
    );
  }

  // return true if the current user if an admin of the current organization
  public isOrganizationAdmin(): boolean {
    return this.currentUserRoleInOrganization === CaOrganizationRole.ADMIN;
  }

  public getCurrentOrganizationUsersDatasource(): CaUserDatasourcePaginated {
    return this.organizationService.getOrganizationSimpleUsersDatasource('current');
  }


  clean(): void {
    this.currentOrganization$.next(null);
    this.currentUserRoleInOrganization = null;
    this.currentOrganizationDomainDev = null;
  }


}
