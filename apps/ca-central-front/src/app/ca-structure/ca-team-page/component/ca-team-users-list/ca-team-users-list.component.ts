import {Component, Input, OnInit} from '@angular/core';
import {CaUser, CaUserDatasourcePaginated} from '../../../../ca-core/model/entities/ca-user.class';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaGroupAddUserDialogComponent,
  CaGroupAddUserDialogInput
} from '../../../../ca-core/entity-module/ca-group-core/component/ca-group-add-user-dialog/ca-group-add-user-dialog.component';
import {CaGroupService} from '../../../../ca-core/service-api/ca-group.service';

/**
 * Component to list the users of a team
 * with possibility to add or remove users.
 */
@Component({
  selector: 'ca-team-users-list',
  templateUrl: './ca-team-users-list.component.html',
  styleUrls: ['./ca-team-users-list.component.scss']
})
export class CaTeamUsersListComponent implements OnInit {

  @Input() groupId: string;

  users: CaUserDatasourcePaginated;

  displayedColumns: FlTableColumn<CaUser>[] = ['fullname', 'customTemplate'];

  constructor(private groupService: CaGroupService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.users = this.groupService.getUsersOfTeamDatasource(this.groupId);
  }

  openAddUserDialog(): void {
    const input: CaGroupAddUserDialogInput = {
      addUserToGroup: (userId: string) => this.groupService.addUserToTeam(this.groupId, userId),
      title: 'team_add_user',
      successMessage: 'team_user_added'
    };

    this.dialogService.openSmallDialog(CaGroupAddUserDialogComponent, {data: input}).afterClosed().subscribe(
      user => this.onAddUserClosed(user)
    );
  }

  private onAddUserClosed(user?: CaUser): void {
    if (user) {
      this.users.addItem(user, () => true);
    }
  }

  openRemoveUserDialog(user: CaUser): void {
    const data: FlConfirmDialogInput = {
      title: 'team_remove_user',
      content: 'team_remove_user_confirmation',
      translateTitleAndContent: true,
      observable: this.groupService.removeUserFromTeam(this.groupId, user.id),
      successMessage: 'team_user_removed',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onRemoveUserClosed(result, user)
    );
  }

  private onRemoveUserClosed(result: FlConfirmDialogResult, user: CaUser): void {
    if (result.choice) {
      this.users.removeItem(user);
    }
  }

  loadMoreResults(): void {
    this.users.getNextPage();
  }


}
