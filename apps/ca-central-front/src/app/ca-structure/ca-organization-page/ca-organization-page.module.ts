import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CaCurrentOrganizationPageComponent
} from './component/ca-current-organization-page/ca-current-organization-page.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaOrganizationCoreModule} from '../../ca-core/entity-module/ca-organization-core/ca-organization-core.module';
import {
  CaCurrentOrganizationDetailComponent
} from './component/ca-current-organization-detail/ca-current-organization-detail.component';
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
import {
  CaOrganizationInvitTableComponent
} from './component/ca-organization-invit-table/ca-organization-invit-table.component';
import {
  CaOrganizationInvitFormDialogComponent
} from './component/ca-organization-invit-form-dialog/ca-organization-invit-form-dialog.component';
import {
  CaOrganizationInvitListComponent
} from './component/ca-organization-invit-list/ca-organization-invit-list.component';
import {
  CaCurrentOrgaLabInstancesListComponent
} from './component/ca-current-orga-lab-instances-list/ca-current-orga-lab-instances-list.component';
import {CaLabCoreModule} from '../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {
  CaCurrentOrgaProjectsListComponent
} from './component/ca-current-orga-projects-list/ca-current-orga-projects-list.component';
import {CaProjectCoreModule} from '../../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {
  CaCurrentOrgaTeamsListComponent
} from './component/ca-current-orga-teams-list/ca-current-orga-teams-list.component';
import {CaRequestNewLicensesComponent} from './component/ca-request-new-licenses/ca-request-new-licenses.component';


@NgModule({
  declarations: [
    CaCurrentOrganizationPageComponent,
    CaCurrentOrganizationDetailComponent,
    CaOrganizationUsersListComponent,
    CaOrganisationUserRoleDialogComponent,
    CaOrganizationUploadPhotoDialogComponent,
    CaOrganizationInvitTableComponent,
    CaOrganizationInvitFormDialogComponent,
    CaOrganizationInvitListComponent,
    CaCurrentOrgaLabInstancesListComponent,
    CaCurrentOrgaProjectsListComponent,
    CaCurrentOrgaTeamsListComponent,
    CaRequestNewLicensesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaOrganizationCoreModule,
    CaGroupCoreModule,
    CaLabCoreModule,
    CaProjectCoreModule,
  ],
  exports: [
    CaOrganizationInvitFormDialogComponent,
    CaOrganizationInvitListComponent,
    CaCurrentOrgaTeamsListComponent,
    CaRequestNewLicensesComponent
  ]
})
export class CaOrganizationPageModule {
}
