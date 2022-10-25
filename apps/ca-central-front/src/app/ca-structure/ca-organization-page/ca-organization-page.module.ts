import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaOrganizationPageComponent} from './component/ca-organization-page/ca-organization-page.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaOrganizationCoreModule} from '../../ca-core/entity-module/ca-organization-core/ca-organization-core.module';
import {CaOrganizationDetailComponent} from './component/ca-organization-detail/ca-organization-detail.component';
import {
  CaOrganizationUsersListComponent
} from './component/ca-organization-users-list/ca-organization-users-list.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaGroupCoreModule} from '../../ca-core/entity-module/ca-group-core/ca-group-core.module';
import {
  CaOrganisationUserRoleDialogComponent
} from './component/ca-organisation-user-role-dialog/ca-organisation-user-role-dialog.component';
import {
  CaOrganizationUploadPhotoDialogComponent
} from './component/ca-organization-upload-photo-dialog/ca-organization-upload-photo-dialog.component';


@NgModule({
  declarations: [
    CaOrganizationPageComponent,
    CaOrganizationDetailComponent,
    CaOrganizationUsersListComponent,
    CaOrganisationUserRoleDialogComponent,
    CaOrganizationUploadPhotoDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaOrganizationCoreModule,
    CaGroupCoreModule,
  ]
})
export class CaOrganizationPageModule {
}
