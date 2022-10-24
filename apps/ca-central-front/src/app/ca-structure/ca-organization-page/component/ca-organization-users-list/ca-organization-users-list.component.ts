import {Component, Input, OnInit} from '@angular/core';
import {CaOrganizationService} from '../../../../ca-core/service-api/ca-organization.service';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {CaAuthenticatedUserService} from '../../../../ca-core/service-api/ca-authenticated-user.service';
import {
  CaGroupAddUserDialogComponent,
  CaGroupAddUserDialogInput
} from '../../../../ca-core/entity-module/ca-group-core/component/ca-group-add-user-dialog/ca-group-add-user-dialog.component';
import {
  CaOrganizationRole,
  CaOrganizationUser,
  CaOrganizationUserDatasource
} from '../../../../ca-core/model/entities/ca-organization.class';
import {
  CaOrganisationUserRoleDialogComponent,
  CaOrganisationUserRoleDialogInput
} from '../ca-organisation-user-role-dialog/ca-organisation-user-role-dialog.component';

/**
 * Component to list the users of an organization and add
 */
@Component({
  selector: 'ca-organization-users-list',
  templateUrl: './ca-organization-users-list.component.html',
  styleUrls: ['./ca-organization-users-list.component.scss']
})
export class CaOrganizationUsersListComponent implements OnInit {

  @Input() organizationId: string;

  users: CaOrganizationUserDatasource;

  displayedColumns: FlTableColumn<CaOrganizationUser>[] = ['user', 'role', 'active'];

  constructor(private organizationService: CaOrganizationService,
              private dialogService: FlDialogService,
              private authenticatedUserService: CaAuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.users = this.organizationService.getUsersOfOrganizationDatasource(this.organizationId);

    // only show the remove button if the user is an admin
    if (this.authenticatedUserService.isAdmin()) {
      this.displayedColumns.push('actions');
    }
  }

  openAddUserDialog(): void {
    const input: CaGroupAddUserDialogInput = {
      addUserToGroup: (userId: string) => this.organizationService.addUserToOrganization(this.organizationId, userId),
      title: 'organization_add_user',
      successMessage: 'organization_user_added'
    };

    this.dialogService.openSmallDialog(CaGroupAddUserDialogComponent, {data: input}).afterClosed().subscribe(
      user => this.onAddUserClosed(user)
    );
  }

  private onAddUserClosed(user?: CaOrganizationUser): void {
    if (user) {
      this.users.addItem(user, () => true);
    }
  }

  openUpdateRoleDialog(user: CaOrganizationUser): void {
    const data: CaOrganisationUserRoleDialogInput = {
      organizationId: this.organizationId,
      userId: user.user.id,
      currentRole: user.role
    };

    this.dialogService.openSmallDialog(CaOrganisationUserRoleDialogComponent, {data}).afterClosed().subscribe(
      role => this.onUpdateRoleClosed(user, role)
    );

  }

  private onUpdateRoleClosed(user: CaOrganizationUser, role?: CaOrganizationRole): void {
    if (role) {
      user.role = role;
    }
  }

  openDeactivateUserDialog(user: CaOrganizationUser): void {
    const data: FlConfirmDialogInput = {
      title: 'organization_deactivate_license',
      content: 'organization_deactivate_license_confirmation',
      translateTitleAndContent: true,
      observable: this.organizationService.deactivateUser(this.organizationId, user.user.id),
      successMessage: 'organization_license_deactivated',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeactivateUserClosed(result, user)
    );
  }

  private onDeactivateUserClosed(result: FlConfirmDialogResult, user: CaOrganizationUser): void {
    if (result.choice) {
      user.active = false;
    }
  }

  openActivateUser(user: CaOrganizationUser): void {
    const data: FlConfirmDialogInput = {
      title: 'organization_activate_license',
      content: 'organization_activate_license_confirmation',
      translateTitleAndContent: true,
      observable: this.organizationService.activateUser(this.organizationId, user.user.id),
      successMessage: 'organization_license_activated',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onActivateUserClosed(result, user)
    );
  }

  private onActivateUserClosed(result: FlConfirmDialogResult, user: CaOrganizationUser): void {
    if (result.choice) {
      user.active = true;
    }
  }

  openRemoveUserDialog(user: CaOrganizationUser): void {
    const data: FlConfirmDialogInput = {
      title: 'organization_remove_user',
      content: 'organization_remove_user_confirmation',
      translateTitleAndContent: true,
      observable: this.organizationService.removeUserFromOrganization(this.organizationId, user.user.id),
      successMessage: 'organization_user_removed',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onRemoveUserClosed(result, user)
    );
  }

  private onRemoveUserClosed(result: FlConfirmDialogResult, user: CaOrganizationUser): void {
    if (result.choice) {
      this.users.removeItem(user);
    }
  }

  loadMoreResults(): void {
    this.users.getNextPage();
  }

}
