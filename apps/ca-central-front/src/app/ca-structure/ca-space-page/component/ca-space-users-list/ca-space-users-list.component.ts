import {Component, Input, OnInit} from '@angular/core';
import {CaSpaceService} from '../../../../ca-core/service-api/ca-space.service';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {CaAuthenticatedUserService} from '../../../../ca-core/service-api/ca-authenticated-user.service';
import {
  CaGroupAddUserDialogComponent,
  CaGroupAddUserDialogInput
} from '../../../../ca-core/entity-module/ca-group-core/component/ca-group-add-user-dialog/ca-group-add-user-dialog.component';
import {
  CaSpaceRole,
  CaSpaceUser,
  CaSpaceUserDatasource
} from '../../../../ca-core/model/entities/ca-space.class';
import {
  CaSpaceUserRoleDialogComponent,
  CaSpaceUserRoleDialogInput
} from '../ca-space-user-role-dialog/ca-space-user-role-dialog.component';
import {CaCurrentSpaceDetailComponent} from '../ca-current-space-detail/ca-current-space-detail.component';

/**
 * Component to list the users of an space and add
 */
@Component({
  selector: 'ca-space-users-list',
  templateUrl: './ca-space-users-list.component.html',
  styleUrls: ['./ca-space-users-list.component.scss']
})
export class CaSpaceUsersListComponent implements OnInit {

  @Input() spaceId: string;

  users: CaSpaceUserDatasource;

  displayedColumns: FlTableColumn<CaSpaceUser>[] = ['user', 'role', 'active'];

  constructor(private spaceService: CaSpaceService,
              private dialogService: FlDialogService,
              private authenticatedUserService: CaAuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.users = this.spaceService.getUsersOfSpaceDatasource(this.spaceId);

    // only show the remove button if the user is an admin
    if (this.authenticatedUserService.isAdmin()) {
      this.displayedColumns.push('actions');
    }
  }

  openAddUserDialog(): void {
    const input: CaGroupAddUserDialogInput = {
      addUserToGroup: (userId: string) => this.spaceService.addUserToSpace(this.spaceId, userId),
      title: 'space_add_user',
      successMessage: 'space_user_added',
      selectUserMode: 'all' // add the add bouton is only for admin, set the select to all user
    };

    this.dialogService.openSmallDialog(CaGroupAddUserDialogComponent, {data: input}).afterClosed().subscribe(
      user => this.onAddUserClosed(user)
    );
  }

  private onAddUserClosed(user?: CaSpaceUser): void {
    if (user) {
      this.users.addItem(user, () => true);
    }
  }

  openUpdateRoleDialog(user: CaSpaceUser): void {
    const data: CaSpaceUserRoleDialogInput = {
      currentRole: user.role,
      updateRole: (role) => this.spaceService.updateUserRole(this.spaceId, user.user.id, role)
    };

    this.dialogService.openSmallDialog(CaSpaceUserRoleDialogComponent, {data}).afterClosed().subscribe(
      role => this.onUpdateRoleClosed(user, role)
    );

  }

  private onUpdateRoleClosed(user: CaSpaceUser, role?: CaSpaceRole): void {
    if (role) {
      user.role = role;
    }
  }

  openDeactivateUserDialog(user: CaSpaceUser): void {
    const data: FlConfirmDialogInput = {
      title: 'space_deactivate_license',
      content: 'space_deactivate_license_confirmation',
      translateTitleAndContent: true,
      observable: this.spaceService.deactivateUser(this.spaceId, user.user.id),
      successMessage: 'space_license_deactivated',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeactivateUserClosed(result, user)
    );
  }

  private onDeactivateUserClosed(result: FlConfirmDialogResult, user: CaSpaceUser): void {
    if (result.choice) {
      user.active = false;
    }
  }

  openActivateUser(user: CaSpaceUser): void {
    const data: FlConfirmDialogInput = {
      title: 'space_activate_license',
      content: 'space_activate_license_confirmation',
      translateTitleAndContent: true,
      observable: this.spaceService.activateUser(this.spaceId, user.user.id),
      successMessage: 'space_license_activated',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onActivateUserClosed(result, user)
    );
  }

  private onActivateUserClosed(result: FlConfirmDialogResult, user: CaSpaceUser): void {
    if (result.choice) {
      user.active = true;
    }
  }

  openRemoveUserDialog(user: CaSpaceUser): void {
    const data: FlConfirmDialogInput = {
      title: 'space_remove_user',
      content: 'space_remove_user_confirmation',
      translateTitleAndContent: true,
      observable: this.spaceService.removeUserFromSpace(this.spaceId, user.user.id),
      successMessage: 'space_user_removed',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onRemoveUserClosed(result, user)
    );
  }

  private onRemoveUserClosed(result: FlConfirmDialogResult, user: CaSpaceUser): void {
    if (result.choice) {
      this.users.removeItem(user);
    }
  }
}
