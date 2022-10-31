import {Component, OnInit} from '@angular/core';
import {CaGroup, CaGroupDatasourcePaginated} from '../../../../ca-core/model/entities/ca-group.entity';
import {CaGroupService} from '../../../../ca-core/service-api/ca-group.service';
import {FlDialogService, FlFormDialogInput} from '@monorepo/front-core-lib';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';
import {
  CaTeamFormDialogComponent
} from '../../../../ca-core/entity-module/ca-group-core/component/ca-team-form-dialog/ca-team-form-dialog.component';

@Component({
  selector: 'ca-my-groups-page',
  templateUrl: './ca-my-groups-page.component.html',
  styleUrls: ['./ca-my-groups-page.component.scss']
})
export class CaMyGroupsPageComponent implements OnInit {

  groupsDatasource: CaGroupDatasourcePaginated;

  constructor(private groupService: CaGroupService,
              private routerService: CaRouterService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.groupsDatasource = this.groupService.getMyTeamsDatasource(20);
  }


  createTeam(): void {
    const input: FlFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaTeamFormDialogComponent, {data: input}).afterClosed().subscribe(
      group => this.onCreateClosed(group)
    );
  }

  private onCreateClosed(group?: CaGroup): void {
    if (group) {
      this.routerService.navigateToTeam(group.id);
    }
  }
}
