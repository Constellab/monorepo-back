import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../core/core.module';
import {LabInstanceRoutingModule} from './lab-instance-routing.module';
import {LabInstanceDetailPageComponent} from './component/lab-instance-detail-page/lab-instance-detail-page.component';
import {LabInstanceDetailComponent} from './component/lab-instance-detail/lab-instance-detail.component';
import {LabCoreModule} from '../core/entity-module/lab-core/lab-core.module';
import {ServerInfoCoreModule} from '../core/entity-module/server-info-core/server-info-core.module';
import {LabInstanceIframeComponent} from './component/lab-instance-iframe/lab-instance-iframe.component';
import {LabInstanceIframePageComponent} from './component/lab-instance-iframe-page/lab-instance-iframe-page.component';
import {MyLabInstancesPageComponent} from './component/my-lab-instances-page/my-lab-instances-page.component';
import {LabInstanceUsersListComponent} from './component/lab-instance-users-list/lab-instance-users-list.component';
import {LabInstanceUsersTableComponent} from './component/lab-instance-users-table/lab-instance-users-table.component';
import {LabInstanceUserFormDialogComponent} from './component/lab-instance-user-form-dialog/lab-instance-user-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabInstanceUpdateNameDialogComponent} from './component/lab-instance-update-name-dialog/lab-instance-update-name-dialog.component';

/**
 * Module the lab instance detail page with iframe for the lab
 */
@NgModule({
  declarations: [
    LabInstanceDetailPageComponent,
    LabInstanceDetailComponent,
    LabInstanceIframeComponent,
    LabInstanceIframePageComponent,
    MyLabInstancesPageComponent,
    LabInstanceUsersListComponent,
    LabInstanceUsersTableComponent,
    LabInstanceUserFormDialogComponent,
    LabInstanceUpdateNameDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CoreModule,
    LabCoreModule,
    ServerInfoCoreModule,

    LabInstanceRoutingModule,
  ]
})
export class LabInstanceModule {
}
