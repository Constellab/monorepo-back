import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaLabInstanceRoutingModule} from './ca-lab-instance-routing.module';
import {
  CaLabInstanceDetailPageComponent
} from './component/ca-lab-instance-detail-page/ca-lab-instance-detail-page.component';
import {CaLabInstanceDetailComponent} from './component/ca-lab-instance-detail/ca-lab-instance-detail.component';
import {CaLabCoreModule} from '../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {CaServerInfoCoreModule} from '../ca-core/entity-module/ca-server-info-core/ca-server-info-core.module';
import {CaMyLabInstancesPageComponent} from './component/ca-my-lab-instances-page/ca-my-lab-instances-page.component';
import {
  CaLabInstanceUsersListComponent
} from './component/ca-lab-instance-users-list/ca-lab-instance-users-list.component';
import {
  CaLabInstanceUsersTableComponent
} from './component/ca-lab-instance-users-table/ca-lab-instance-users-table.component';
import {
  CaLabInstanceUserFormDialogComponent
} from './component/ca-lab-instance-user-form-dialog/ca-lab-instance-user-form-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  CaLabInstanceUpdateNameDialogComponent
} from './component/ca-lab-instance-update-name-dialog/ca-lab-instance-update-name-dialog.component';
import {CaLabInstanceManagerComponent} from './component/ca-lab-instance-manager/ca-lab-instance-manager.component';
import {
  CaLabDockerContainersListComponent
} from './component/ca-lab-docker-containers-list/ca-lab-docker-containers-list.component';
import {
  CaLabDockerContainerLogsComponent
} from './component/ca-lab-docker-container-logs/ca-lab-docker-container-logs.component';
import {
  CaLabInstanceManagerStatusComponent
} from './component/ca-lab-instance-manager-status/ca-lab-instance-manager-status.component';
import {
  CaLabInstanceDockerUpFormComponent
} from './component/ca-lab-instance-docker-up-form/ca-lab-instance-docker-up-form.component';
import {CaLabInstanceConfigComponent} from './component/ca-lab-instance-config/ca-lab-instance-config.component';
import {
  CaLabInstanceConfigFormComponent
} from './component/ca-lab-instance-config-form/ca-lab-instance-config-form.component';
import {
  CaLabInstanceConfigBrickComponent
} from './component/ca-lab-instance-config-brick/ca-lab-instance-config-brick.component';
import {CaBrickCoreModule} from '../ca-core/entity-module/ca-brick-core/ca-brick-core.module';
import {CaLabDockerContainersComponent} from './component/ca-lab-docker-containers/ca-lab-docker-containers.component';

/**
 * Module the lab instance detail page with iframe for the lab
 */
@NgModule({
  declarations: [
    CaLabInstanceDetailPageComponent,
    CaLabInstanceDetailComponent,
    CaMyLabInstancesPageComponent,
    CaLabInstanceUsersListComponent,
    CaLabInstanceUsersTableComponent,
    CaLabInstanceUserFormDialogComponent,
    CaLabInstanceUpdateNameDialogComponent,
    CaLabInstanceManagerComponent,
    CaLabDockerContainersListComponent,
    CaLabDockerContainerLogsComponent,
    CaLabInstanceManagerStatusComponent,
    CaLabInstanceDockerUpFormComponent,
    CaLabInstanceConfigComponent,
    CaLabInstanceConfigFormComponent,
    CaLabInstanceConfigBrickComponent,
    CaLabDockerContainersComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CaCoreModule,
    CaLabCoreModule,
    CaServerInfoCoreModule,
    CaBrickCoreModule,

    CaLabInstanceRoutingModule,
  ]
})
export class CaLabInstanceModule {
}
