import {Component, OnInit} from '@angular/core';
import {CaGroup, CaGroupDatasource} from '../../../../ca-core/model/entities/ca-group.entity';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {CaGroupService} from '../../../../ca-core/service-api/ca-group.service';
import {
  CaTeamFormDialogComponent,
  CaTeamFormDialogInput
} from '../../../../ca-core/entity-module/ca-group-core/component/ca-team-form-dialog/ca-team-form-dialog.component';
import {CaCurrentSpaceDetailComponent} from '../ca-current-space-detail/ca-current-space-detail.component';

/**
 * Component for space admin to list all the teams of the space
 */
@Component({
  selector: 'ca-current-space-teams-list',
  templateUrl: './ca-current-space-teams-list.component.html',
  styleUrls: ['./ca-current-space-teams-list.component.scss']
})
export class CaCurrentSpaceTeamsListComponent implements OnInit {

  teams: CaGroupDatasource;

  columns: FlTableColumn<CaGroup>[] = ['label', 'creation', 'actions'];

  constructor(private groupService: CaGroupService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.teams = this.groupService.getByCurrentSpaceDatasource();
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
