import {Component, Input, OnInit} from '@angular/core';
import {CaGroup, CaSaveTeamDTO} from '../../../../ca-core/model/entities/ca-group.entity';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlFormDialogInput
} from '@monorepo/front-core-lib';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';
import {CaGroupService} from '../../../../ca-core/service-api/ca-group.service';
import {
  CaTeamFormDialogComponent
} from '../../../../ca-core/entity-module/ca-group-core/component/ca-team-form-dialog/ca-team-form-dialog.component';

/**
 * Show detail of a team
 */
@Component({
  selector: 'ca-team-detail',
  templateUrl: './ca-team-detail.component.html',
  styleUrls: ['./ca-team-detail.component.scss']
})
export class CaTeamDetailComponent implements OnInit {

  @Input() team: CaGroup;

  constructor(private dialogService: FlDialogService,
              private groupService: CaGroupService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
  }

  openUpdateDialog(): void {
    const data: FlFormDialogInput<CaSaveTeamDTO> = {
      mode: 'update',
      object: {
        id: this.team.id,
        label: this.team.label
      }
    };

    this.dialogService.openSmallDialog(CaTeamFormDialogComponent, {data: data}).afterClosed().subscribe(
      group => this.onUpdateClosed(group)
    );
  }

  private onUpdateClosed(group?: CaGroup): void {
    if (group) {
      this.team.label = group.label;
    }
  }

  openDeleteDialog(): void {
    const data: FlConfirmDialogInput = {
      title: 'delete_team',
      content: 'delete_team_confirmation',
      translateTitleAndContent: true,
      observable: this.groupService.deleteTeamById(this.team.id),
      successMessage: 'team_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeleteClosed(result)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult): void {
    if (result.choice) {
      this.routerService.navigateToMyTeams();
    }
  }

}
