import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCurrentSpacePageComponent} from './component/ca-current-space-page/ca-current-space-page.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaSpaceCoreModule} from '../../ca-core/entity-module/ca-space-core/ca-space-core.module';
import {CaCurrentSpaceDetailComponent} from './component/ca-current-space-detail/ca-current-space-detail.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaGroupCoreModule} from '../../ca-core/entity-module/ca-group-core/ca-group-core.module';
import {
  CaSpaceUserRoleDialogComponent
} from './component/ca-space-user-role-dialog/ca-space-user-role-dialog.component';
import {
  CaSpaceUploadPhotoDialogComponent
} from './component/ca-space-upload-photo-dialog/ca-space-upload-photo-dialog.component';
import {CaSpaceInvitTableComponent} from './component/ca-space-invit-table/ca-space-invit-table.component';
import {
  CaSpaceInvitFormDialogComponent
} from './component/ca-space-invit-form-dialog/ca-space-invit-form-dialog.component';
import {
  CaCurrentSpaceInvitListComponent
} from './component/ca-current-space-invit-list/ca-current-space-invit-list.component';
import {CaLabCoreModule} from '../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {
  CaCurrentSpaceProjectsListComponent
} from './component/ca-current-space-projects-list/ca-current-space-projects-list.component';
import {CaProjectCoreModule} from '../../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {
  CaCurrentSpaceTeamsListComponent
} from './component/ca-current-space-teams-list/ca-current-space-teams-list.component';
import {CaRequestNewLicensesComponent} from './component/ca-request-new-licenses/ca-request-new-licenses.component';
import {RouterModule} from '@angular/router';
import {
  CaCurrentSpaceUsersPageComponent
} from './component/ca-current-space-users-page/ca-current-space-users-page.component';
import {
  CaCurrentSpaceDashboardPageComponent
} from './component/ca-current-space-dashboard-page/ca-current-space-dashboard-page.component';
import {
  CaCurrentSpaceLabInstancesPageComponent
} from './component/ca-current-space-lab-instances-page/ca-current-space-lab-instances-page.component';


@NgModule({
  declarations: [
    CaCurrentSpacePageComponent,
    CaCurrentSpaceDetailComponent,
    CaSpaceUserRoleDialogComponent,
    CaSpaceUploadPhotoDialogComponent,
    CaSpaceInvitTableComponent,
    CaSpaceInvitFormDialogComponent,
    CaCurrentSpaceInvitListComponent,
    CaCurrentSpaceProjectsListComponent,
    CaCurrentSpaceTeamsListComponent,
    CaRequestNewLicensesComponent,
    CaCurrentSpaceUsersPageComponent,
    CaCurrentSpaceDashboardPageComponent,
    CaCurrentSpaceLabInstancesPageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaCoreModule,
    CaSpaceCoreModule,
    CaGroupCoreModule,
    CaLabCoreModule,
    CaProjectCoreModule,
  ],
  exports: [
    CaSpaceInvitFormDialogComponent,
    CaCurrentSpaceInvitListComponent,
    CaCurrentSpaceTeamsListComponent,
    CaRequestNewLicensesComponent
  ]
})
export class CaSpacePageModule {
}
