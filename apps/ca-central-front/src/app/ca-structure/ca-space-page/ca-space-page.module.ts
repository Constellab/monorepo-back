import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  CaCurrentSpacePageComponent
} from './component/ca-current-space-page/ca-current-space-page.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaSpaceCoreModule} from '../../ca-core/entity-module/ca-space-core/ca-space-core.module';
import {
  CaCurrentSpaceDetailComponent
} from './component/ca-current-space-detail/ca-current-space-detail.component';
import {
  CaSpaceUsersListComponent
} from './component/ca-space-users-list/ca-space-users-list.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaGroupCoreModule} from '../../ca-core/entity-module/ca-group-core/ca-group-core.module';
import {
  CaSpaceUserRoleDialogComponent
} from './component/ca-space-user-role-dialog/ca-space-user-role-dialog.component';
import {
  CaSpaceUploadPhotoDialogComponent
} from './component/ca-space-upload-photo-dialog/ca-space-upload-photo-dialog.component';
import {
  CaSpaceInvitTableComponent
} from './component/ca-space-invit-table/ca-space-invit-table.component';
import {
  CaSpaceInvitFormDialogComponent
} from './component/ca-space-invit-form-dialog/ca-space-invit-form-dialog.component';
import {
  CaSpaceInvitListComponent
} from './component/ca-space-invit-list/ca-space-invit-list.component';
import {
  CaCurrentSpaceLabInstancesListComponent
} from './component/ca-current-space-lab-instances-list/ca-current-space-lab-instances-list.component';
import {CaLabCoreModule} from '../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {
  CaCurrentSpaceProjectsListComponent
} from './component/ca-current-space-projects-list/ca-current-space-projects-list.component';
import {CaProjectCoreModule} from '../../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {
  CaCurrentSpaceTeamsListComponent
} from './component/ca-current-space-teams-list/ca-current-space-teams-list.component';
import {CaRequestNewLicensesComponent} from './component/ca-request-new-licenses/ca-request-new-licenses.component';


@NgModule({
  declarations: [
    CaCurrentSpacePageComponent,
    CaCurrentSpaceDetailComponent,
    CaSpaceUsersListComponent,
    CaSpaceUserRoleDialogComponent,
    CaSpaceUploadPhotoDialogComponent,
    CaSpaceInvitTableComponent,
    CaSpaceInvitFormDialogComponent,
    CaSpaceInvitListComponent,
    CaCurrentSpaceLabInstancesListComponent,
    CaCurrentSpaceProjectsListComponent,
    CaCurrentSpaceTeamsListComponent,
    CaRequestNewLicensesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaSpaceCoreModule,
    CaGroupCoreModule,
    CaLabCoreModule,
    CaProjectCoreModule,
  ],
  exports: [
    CaSpaceInvitFormDialogComponent,
    CaSpaceInvitListComponent,
    CaCurrentSpaceTeamsListComponent,
    CaRequestNewLicensesComponent
  ]
})
export class CaSpacePageModule {
}
