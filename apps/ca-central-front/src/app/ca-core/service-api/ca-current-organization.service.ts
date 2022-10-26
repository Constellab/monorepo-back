import {Inject, Injectable} from '@angular/core';
import {CaOrganizationService} from './ca-organization.service';
import {ClCachedObservable, ClStringHelper} from '@monorepo/core-lib';
import {CaOrganization} from '../model/entities/ca-organization.class';
import {FlLocalStorageService} from '@monorepo/front-core-lib';
import {environment} from '../../../environments/ca-environment';
import {Observable, of, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {DOCUMENT} from '@angular/common';

/**
 * Service to manage the current organization
 */
@Injectable({
  providedIn: 'root'
})
export class CaCurrentOrganizationService {

  private currentOrganizationDomain: string;

  private currentOrganization$: ClCachedObservable<CaOrganization>;

  // key use to store the current organization in the local storage only for dev env
  private devOrganizationStorageKey: string = 'local-organization';

  constructor(private organizationService: CaOrganizationService,
              private localStorageService: FlLocalStorageService,
              private router: Router,
              @Inject(DOCUMENT) private document: Document) {
  }

  public init(): Observable<boolean> {
    // if we are in dev mode we try to get the current organization from the local storage
    if (!environment.production) {
      return this.initProduction();
    } else {
      return this.initDev();
    }
  }

  private initProduction(): Observable<boolean> {
    const url = this.document.defaultView.location.href;
    const domain = ClStringHelper.getLowestDomainFromUrl(url);
    console.log('Domain ', domain);
    this.setCurrentOrganizationDomain(domain, false);
    return of(true);

  }

  /**
   * In dev we don't use sub domain, we store the current organization in the local storage
   * and add it to the header of each request
   * @private
   */
  private initDev(): Observable<boolean> {
    const domain = this.localStorageService.getItem(this.devOrganizationStorageKey);
    if (domain) {
      this.setCurrentOrganizationDomain(domain, false);
      return of(true);
    } else {
      this.currentOrganization$ = new ClCachedObservable<CaOrganization>(this.organizationService.getDefaultOrganization());
      return this.currentOrganization$.getObs().pipe(
        tap(organization => {
          this.currentOrganizationDomain = organization.domain;
          this.localStorageService.setItem(this.devOrganizationStorageKey, organization.domain);
        }),
        map(() => true)
      );
    }
  }

  public getCurrentOrganizationDomain(): string {
    return this.currentOrganizationDomain;
  }

  public setCurrentOrganizationDomain(domain: string, saveInLocalStorage: boolean = true): void {
    this.currentOrganizationDomain = domain;
    this.currentOrganization$ = new ClCachedObservable<CaOrganization>(this.organizationService.getCurrentOrganization());

    if (saveInLocalStorage) {
      this.localStorageService.setItem(this.devOrganizationStorageKey, domain);
    }
  }
}
