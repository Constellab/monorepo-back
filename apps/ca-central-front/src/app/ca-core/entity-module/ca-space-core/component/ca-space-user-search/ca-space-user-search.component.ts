import {Component, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  FlThemeService
} from '@monorepo/front-core-lib';
import {CaSpaceRole, CaSpaceUser, CaSpaceUserDatasource} from '../../../../model/entities/space/ca-space-user.class';
import {CaAuthenticatedUserService} from '../../../../service-api/ca-authenticated-user.service';
import {CaSpaceSearchFields} from '../../model/ca-space-search.class';
import {CaCurrentSpaceService} from '../../../../service-api/ca-current-space.service';
import {CaSpaceUserSearch, CaSpaceUserSearchFields} from '../../model/ca-space-user-search.class';
import {
  CaGroupAddUserDialogComponent,
  CaGroupAddUserDialogInput
} from '../../../ca-group-core/component/ca-group-add-user-dialog/ca-group-add-user-dialog.component';
import {
  CaSpaceUserRoleDialogComponent,
  CaSpaceUserRoleDialogInput
} from '../../../../../ca-structure/ca-space-page/component/ca-space-user-role-dialog/ca-space-user-role-dialog.component';

@Component({
  selector: 'ca-space-user-search',
  templateUrl: './ca-space-user-search.component.html',
  styleUrls: ['./ca-space-user-search.component.scss'],
  providers: [FlSearchState]
})
export class CaSpaceUserSearchComponent implements OnInit {

  datasource: CaSpaceUserDatasource;

  columns: FlTableColumn<CaSpaceUser>[] = ['user', 'role', 'active', 'addedInfo'];

  constructor(private searchState: FlSearchState<any>,
              private currentSpaceService: CaCurrentSpaceService,
              private authenticatedUserService: CaAuthenticatedUserService,
              private themeService: FlThemeService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {

    // only show the remove button if the user is an admin
    if (this.currentSpaceService.isSpaceAdmin()) {
      this.columns.push('actions');
    }

    const config: FlSearchConfig = {
      version: 1,
      buildAdvancedForm: CaSpaceUserSearch.getAdvancedSearchForm,
      advancedFormClass: CaSpaceUserSearchFields,
      savedSearch: this.getSavedSearch(),
      advancedFormManager: {
        config: CaSpaceUserSearch.advancedSearchManagerConfig,
      },
      storeSearchInUrl: true
    };

    this.datasource = new CaSpaceUserDatasource(
      (page, size, filters) => this.currentSpaceService.searchSpaceUsers(
        page, size, filters),
      20, false);
    this.searchState.init(config, this.datasource);
  }

  private getSavedSearch(): FlSavedSearch[] {
    return [{
      searchName: 'ca-space',
      id: null,
      label: 'All spaces',
      color: this.themeService.getCurrentThemeDetail().primary,
      version: 1,
      default: true,
      filtersCriteria: {} as Partial<CaSpaceSearchFields>
    }];
  }

  openAddUserDialog(): void {
    const input: CaGroupAddUserDialogInput = {
      addUserToGroup: (userId: string) => this.currentSpaceService.addUserToSpace(userId),
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
      this.datasource.addItem(user, () => true);
    }
  }

  openUpdateRoleDialog(user: CaSpaceUser): void {
    const data: CaSpaceUserRoleDialogInput = {
      currentRole: user.role,
      updateRole: (role) => this.currentSpaceService.updateUserRole(user.user.id, role)
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
      observable: this.currentSpaceService.deactivateUser(user.user.id),
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
      observable: this.currentSpaceService.activateUser(user.user.id),
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
      observable: this.currentSpaceService.removeUserFromSpace(user.user.id),
      successMessage: 'space_user_removed',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onRemoveUserClosed(result, user)
    );
  }

  private onRemoveUserClosed(result: FlConfirmDialogResult, user: CaSpaceUser): void {
    if (result.choice) {
      this.datasource.removeItem(user);
    }
  }
}
