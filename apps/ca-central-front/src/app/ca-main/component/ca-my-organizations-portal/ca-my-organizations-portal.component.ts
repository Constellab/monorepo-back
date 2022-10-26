import {Component, OnInit} from '@angular/core';
import {CaOrganizationService} from '../../../ca-core/service-api/ca-organization.service';
import {Observable} from 'rxjs';
import {CaOrganization} from '../../../ca-core/model/entities/ca-organization.class';
import {environment} from '../../../../environments/ca-environment';
import {FlOverlayRef} from '@monorepo/front-core-lib';
import {CaCurrentOrganizationService} from '../../../ca-core/service-api/ca-current-organization.service';


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
              private currentOrganizationService: CaCurrentOrganizationService,
              private overlayRef: FlOverlayRef) {
  }

  ngOnInit(): void {
    this.myOrganizations$ = this.organizationService.getMyOrganizations();
  }

  getOrganizationFrontUrl(organization: CaOrganization): string {
    return `https://${organization.domain}.${environment.frontDomain}`;
  }

  switchOrganizationLocal(organization: CaOrganization): void {
    this.currentOrganizationService.setCurrentOrganizationDomain(organization.domain);
    this.overlayRef.dispose();
  }
}
