import {Component, OnInit} from '@angular/core';
import {CaOrganizationService} from '../../../ca-core/service-api/ca-organization.service';
import {combineLatestWith, Observable} from 'rxjs';
import {CaOrganization} from '../../../ca-core/model/entities/ca-organization.class';
import {map} from 'rxjs/operators';
import {CaCurrentOrganizationService} from '../../../ca-core/service-api/ca-current-organization.service';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';


/**
 * Portal to list the organization of the user with possibility to switch between them
 */
@Component({
  selector: 'ca-my-organizations-portal',
  templateUrl: './ca-my-organizations-portal.component.html',
  styleUrls: ['./ca-my-organizations-portal.component.scss']
})
export class CaMyOrganizationsPortalComponent implements OnInit {

  currentOrganization$: Observable<CaOrganization>;
  currentOrganizationRoute: string = CaRouterService.getCurrentOrganizationRoute();

  myOrganizations$: Observable<CaOrganization[]>;

  appRoute = CaRouterService.getAppRoute();

  constructor(private organizationService: CaOrganizationService,
              private currentOrganizationService: CaCurrentOrganizationService) {
  }

  ngOnInit(): void {
    this.currentOrganization$ = this.currentOrganizationService.getCurrentOrganization$();
    // list all the organization of the user except from the current one
    this.myOrganizations$ = this.organizationService.getMyOrganizations().pipe(
      combineLatestWith(this.currentOrganizationService.getCurrentOrganization$()),
      map(([organizations, currentOrganization]) => organizations.filter(orga => orga.id !== currentOrganization.id))
    );
  }

}
