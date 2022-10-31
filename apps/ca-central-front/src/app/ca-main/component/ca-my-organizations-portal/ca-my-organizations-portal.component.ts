import {Component, OnInit} from '@angular/core';
import {CaOrganizationService} from '../../../ca-core/service-api/ca-organization.service';
import {Observable} from 'rxjs';
import {CaOrganization} from '../../../ca-core/model/entities/ca-organization.class';
import {environment} from '../../../../environments/ca-environment';
import {FlOverlayRef} from '@monorepo/front-core-lib';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';


/**
 * Portal to list the organization of the user with possibility to switch between them
 */
@Component({
  selector: 'ca-my-organizations-portal',
  templateUrl: './ca-my-organizations-portal.component.html',
  styleUrls: ['./ca-my-organizations-portal.component.scss']
})
export class CaMyOrganizationsPortalComponent implements OnInit {

  myOrganizations$: Observable<CaOrganization[]>;

  isProduction = environment.production;

  constructor(private organizationService: CaOrganizationService,
              private authenticatedUserService: CaAuthenticatedUserService,
              private overlayRef: FlOverlayRef) {
  }

  ngOnInit(): void {
    this.myOrganizations$ = this.organizationService.getMyOrganizations();
  }

  getOrganizationFrontUrl(organization: CaOrganization): string {
    return `https://${organization.domain}.${environment.frontDomain}`;
  }

  switchOrganizationDev(organization: CaOrganization): void {
    this.authenticatedUserService.setCurrentOrganizationDomainDev(organization.domain);
    this.overlayRef.dispose();
    window.location.href = 'http://localhost:4200';
  }
}
