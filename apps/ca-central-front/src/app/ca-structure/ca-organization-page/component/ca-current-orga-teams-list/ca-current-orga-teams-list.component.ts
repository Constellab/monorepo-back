import {Component, OnInit} from '@angular/core';
import {CaGroup, CaGroupDatasource} from '../../../../ca-core/model/entities/ca-group.entity';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {CaGroupService} from '../../../../ca-core/service-api/ca-group.service';
import {
  CaTeamFormDialogComponent,
  CaTeamFormDialogInput
} from '../../../../ca-core/entity-module/ca-group-core/component/ca-team-form-dialog/ca-team-form-dialog.component';

/**
 * Component for organization admin to list all the teams of the organization
 */
@Component({
  selector: 'ca-current-orga-teams-list',
  templateUrl: './ca-current-orga-teams-list.component.html',
  styleUrls: ['./ca-current-orga-teams-list.component.scss']
})
export class CaCurrentOrgaTeamsListComponent implements OnInit {

  teams: CaGroupDatasource;

  columns: FlTableColumn<CaGroup>[] = ['label', 'creation', 'actions'];

  constructor(private groupService: CaGroupService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.teams = this.groupService.getByCurrentOrganizationDatasource();
  }

  createTeam(): void {
    const input: CaTeamFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaTeamFormDialogComponent, {data: input}).afterClosed().subscribe(
      group => this.onCreateClosed(group)
    );
  }

  private onCreateClosed(group?: CaGroup): void {
    if (group) {
      this.teams.addItem(group);
    }
  }

}
