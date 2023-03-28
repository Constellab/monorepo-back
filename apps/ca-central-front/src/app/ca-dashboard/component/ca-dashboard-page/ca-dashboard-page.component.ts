import {Component, OnDestroy, OnInit} from '@angular/core';
import {CaCurrentSpaceService} from '../../../ca-core/service-api/ca-current-space.service';
import {Observable} from 'rxjs';
import {CaSpace} from '../../../ca-core/model/entities/space/ca-space.class';
import {CaUserDatasourcePaginated} from '../../../ca-core/model/entities/ca-user.class';
import {CaCommunityHelper} from '../../../ca-core/utils/ca-community.helper';

/**
 * Page containing the user dashboard
 */
@Component({
  selector: 'ca-dashboard-page',
  templateUrl: './ca-dashboard-page.component.html',
  styleUrls: ['./ca-dashboard-page.component.scss']
})
export class CaDashboardPageComponent implements OnInit, OnDestroy {

  hubLink: string = CaCommunityHelper.getCommunityUrl();

  currentSpace$: Observable<CaSpace> = this.currentSpaceService.getCurrentSpace$();
  spaceUsers: CaUserDatasourcePaginated = this.currentSpaceService.getCurrentSpaceUsersDatasource();

  currentDate: Date = new Date();

  constructor(private currentSpaceService: CaCurrentSpaceService) {

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.spaceUsers.disconnect();
  }
}
