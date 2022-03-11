import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaOrganizationPageComponent} from './component/ca-organization-page/ca-organization-page.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaOrganizationCoreModule} from '../../ca-core/entity-module/ca-organization-core/ca-organization-core.module';
import {CaOrganizationDetailComponent} from './component/ca-organization-detail/ca-organization-detail.component';
import {
  CaOrganizationUsersListComponent
} from './component/ca-organization-users-list/ca-organization-users-list.component';
import {
  CaOrganizationAddUserDialogComponent
} from './component/ca-organization-add-user-dialog/ca-organization-add-user-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    CaOrganizationPageComponent,
    CaOrganizationDetailComponent,
    CaOrganizationUsersListComponent,
    CaOrganizationAddUserDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,
    CaOrganizationCoreModule,
  ]
})
export class CaOrganizationPageModule {
}
