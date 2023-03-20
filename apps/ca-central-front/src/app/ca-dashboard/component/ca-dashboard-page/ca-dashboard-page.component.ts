import {Component, OnDestroy, OnInit} from '@angular/core';
import {environment} from '../../../../environments/ca-environment';
import {CaCurrentSpaceService} from '../../../ca-core/service-api/ca-current-space.service';
import {Observable} from 'rxjs';
import {CaSpace} from '../../../ca-core/model/entities/space/ca-space.class';
import {CaUserDatasourcePaginated} from '../../../ca-core/model/entities/ca-user.class';
import {FlThemeService} from '@monorepo/front-core-lib';

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

  currentSpace$: Observable<CaSpace> = this.currentSpaceService.getCurrentSpace$();
  spaceUsers: CaUserDatasourcePaginated = this.currentSpaceService.getCurrentSpaceUsersDatasource();

  currentDate: Date = new Date();

  communityLogo: string;

  constructor(private currentSpaceService: CaCurrentSpaceService,
              private themeService: FlThemeService) {

  }

  ngOnInit(): void {
    this.communityLogo = this.themeService.isDarkTheme() ?
      'assets/fl-logo/community_logo_text_white.svg' :
      'assets/fl-logo/community_logo_text_black.svg';
  }

  ngOnDestroy(): void {
    this.spaceUsers.disconnect();
  }
}
