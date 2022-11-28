import {Component, OnInit} from '@angular/core';
import {CaGroup, CaGroupDatasource} from '../../../../../ca-core/model/entities/ca-group.entity';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';
import {CaGroupService} from '../../../../../ca-core/service-api/ca-group.service';
import {CaDashboardListLayoutComponent} from '../ca-dashboard-list-layout/ca-dashboard-list-layout.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaTeamFormDialogComponent,
  CaTeamFormDialogInput
} from '../../../../../ca-core/entity-module/ca-group-core/component/ca-team-form-dialog/ca-team-form-dialog.component';

/**
 * Small list of groups in the dashboard
 */
@Component({
  selector: 'ca-dashboard-teams',
  templateUrl: './ca-dashboard-teams.component.html',
  styleUrls: ['./ca-dashboard-teams.component.scss']
})
export class CaDashboardTeamsComponent implements OnInit {

  teamsDatasource: CaGroupDatasource;

  myTeamsRoute: string = CaRouterService.getMyTeamsRoute();

  constructor(private groupService: CaGroupService,
              private dialogService: FlDialogService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.teamsDatasource = this.groupService.getMyTeamsDatasource(CaDashboardListLayoutComponent.maxItems);
  }

  openCreateTeamDialog(): void {
    const input: CaTeamFormDialogInput = {mode: 'create'};

    this.dialogService.openSmallDialog(CaTeamFormDialogComponent, {data: input}).afterClosed().subscribe(
      team => this.onOpenTeamDialogClosed(team)
    );
  }

  private onOpenTeamDialogClosed(team?: CaGroup): void {
    if (team) {
      this.routerService.navigateToTeam(team.id);
    }
  }

}
