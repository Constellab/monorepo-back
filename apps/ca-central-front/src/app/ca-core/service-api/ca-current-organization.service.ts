import {Injectable} from '@angular/core';
import {CaOrganizationService} from './ca-organization.service';
import {CaOrganization, CaOrganizationRole} from '../model/entities/ca-organization.class';
import {FlCleanableService, FlCleanerService, FlLocalStorageService} from '@monorepo/front-core-lib';
import {environment} from '../../../environments/ca-environment';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

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
              private localStorageService: FlLocalStorageService) {
    FlCleanerService.getInstance().registerService(this);
  }

  public init(): void {
    // in dev, load the domain from the local storage
    if (!environment.production) {
      this.currentOrganizationDomainDev = this.localStorageService.getItem(this.devOrganizationStorageKey);
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
    this.localStorageService.setItem(this.devOrganizationStorageKey, domain);
  }

  public setCurrentOrganization(organization: CaOrganization, role: CaOrganizationRole): void {
    this.currentOrganization$.next(organization);
    this.currentUserRoleInOrganization = role;
    this.currentOrganizationDomainDev = organization.domain;

    if (!environment.production) {
      this.localStorageService.setItem(this.devOrganizationStorageKey, organization.domain);
    }
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

  clean(): void {
    this.currentOrganization$.next(null);
    this.currentUserRoleInOrganization = null;
    this.currentOrganizationDomainDev = null;
  }


}
