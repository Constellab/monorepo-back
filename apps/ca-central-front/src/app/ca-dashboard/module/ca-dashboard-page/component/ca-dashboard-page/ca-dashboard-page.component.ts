import {Component, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../../../environments/ca-environment';
import {CaCurrentOrganizationService} from '../../../../../ca-core/service-api/ca-current-organization.service';
import {Observable} from 'rxjs';
import {CaOrganization} from '../../../../../ca-core/model/entities/ca-organization.class';
import {CaUserDatasourcePaginated} from '../../../../../ca-core/model/entities/ca-user.class';

/**
 * Page containing the user dashboard
 */
@Component({
  selector: 'ca-dashboard-page',
  templateUrl: './ca-dashboard-page.component.html',
  styleUrls: ['./ca-dashboard-page.component.scss']
})
export class CaDashboardPageComponent implements OnInit, OnDestroy {

  hubLink: string = environment.hubUrl;

  currentSpace$: Observable<CaOrganization> = this.currentOrganizationService.getCurrentOrganization$();
  spaceUsers: CaUserDatasourcePaginated = this.currentOrganizationService.getCurrentOrganizationUsersDatasource();

  currentDate: Date = new Date();

  constructor(private currentOrganizationService: CaCurrentOrganizationService) {

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spaceUsers.disconnect();
  }
}
