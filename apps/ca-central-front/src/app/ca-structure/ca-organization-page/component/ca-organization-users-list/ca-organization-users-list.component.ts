import {Component, Input, OnInit} from '@angular/core';
import {CaOrganizationService} from '../../../../ca-core/service-api/ca-organization.service';
import {CaUser, CaUserDatasourcePaginated} from '../../../../ca-core/model/entities/ca-user.class';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaOrganizationAddUserDialogComponent
} from '../ca-organization-add-user-dialog/ca-organization-add-user-dialog.component';
import {CaAuthenticatedUserService} from '../../../../ca-core/service-api/ca-authenticated-user.service';

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

  users: CaUserDatasourcePaginated;

  displayedColumns: FlTableColumn<CaUser>[] = ['photo', 'fullname'];

  constructor(private organizationService: CaOrganizationService,
              private dialogService: FlDialogService,
              private authenticatedUserService: CaAuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.users = this.organizationService.getUsersOfOrganizationDatasource(this.organizationId);

    // only show the remove button if the user is an admin
    if (this.authenticatedUserService.isAdmin()) {
      this.displayedColumns.push('customTemplate');
    }
  }

  openAddUserDialog(): void {
    this.dialogService.openSmallDialog(CaOrganizationAddUserDialogComponent, {data: this.organizationId}).afterClosed().subscribe(
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
      title: 'organization_remove_user',
      content: 'organization_remove_user_confirmation',
      translateTitleAndContent: true,
      observable: this.organizationService.removeUserFromOrganization(this.organizationId, user.id),
      successMessage: 'organization_user_removed',
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
