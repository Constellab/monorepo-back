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
import {
  CaLabInstanceManagerConfigComponent
} from './component/ca-lab-instance-manager-config/ca-lab-instance-manager-config.component';
import {
  CaLabInstanceConfigFormComponent
} from './component/ca-lab-instance-config-form/ca-lab-instance-config-form.component';
import {
  CaLabInstanceConfigBrickComponent
} from './component/ca-lab-instance-config-brick/ca-lab-instance-config-brick.component';
import {CaBrickCoreModule} from '../ca-core/entity-module/ca-brick-core/ca-brick-core.module';
import {CaLabDockerContainersComponent} from './component/ca-lab-docker-containers/ca-lab-docker-containers.component';
import {
  CaLabInstanceProjectsListComponent
} from './component/ca-lab-instance-projects-list/ca-lab-instance-projects-list.component';
import {
  CaLabInstanceProjectsTableComponent
} from './component/ca-lab-instance-projects-table/ca-lab-instance-projects-table.component';
import {CaProjectCoreModule} from '../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {
  CaLabInstanceAddProjectDialogComponent
} from './component/ca-lab-instance-add-project-dialog/ca-lab-instance-add-project-dialog.component';
import {
  CaLabInstanceCodelabInfoComponent
} from './component/ca-lab-instance-codelab-info/ca-lab-instance-codelab-info.component';
import {CaLabInstanceHeaderComponent} from './component/ca-lab-instance-header/ca-lab-instance-header.component';
import {
  CaLabInstanceManageBackupComponent
} from './component/ca-lab-instance-manage-backup/ca-lab-instance-manage-backup.component';
import {CaLabInstanceBackupComponent} from './component/ca-lab-instance-backup/ca-lab-instance-backup.component';
import {
  CaLabBackupHistoryDialogComponent
} from './component/ca-lab-backup-history-dialog/ca-lab-backup-history-dialog.component';
import {CaConfigCoreModule} from '../ca-core/entity-module/ca-config-core/ca-config-core.module';
import {
  CaLabInstanceDashboardPageComponent
} from './component/ca-lab-instance-dashboard-page/ca-lab-instance-dashboard-page.component';
import {
  CaLabInstanceConfigPageComponent
} from './component/ca-lab-instance-config-page/ca-lab-instance-config-page.component';
import {CaLabInstanceServerComponent} from './component/ca-lab-instance-server/ca-lab-instance-server.component';
import {
  CaLabServerCompleteInfoComponent
} from './component/ca-lab-server-complete-info/ca-lab-server-complete-info.component';
import {
  CaLabServerCompleteInfoDialogComponent
} from './component/ca-lab-server-complete-info-dialog/ca-lab-server-complete-info-dialog.component';
import {
  CaLabInstanceStartStopComponent
} from './component/ca-lab-instance-start-stop/ca-lab-instance-start-stop.component';
import {
  CaLabInstanceServerStatusComponent
} from './component/ca-lab-instance-server-status/ca-lab-instance-server-status.component';

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
    CaLabInstanceManagerConfigComponent,
    CaLabInstanceConfigFormComponent,
    CaLabInstanceConfigBrickComponent,
    CaLabDockerContainersComponent,
    CaLabInstanceProjectsListComponent,
    CaLabInstanceProjectsTableComponent,
    CaLabInstanceAddProjectDialogComponent,
    CaLabInstanceCodelabInfoComponent,
    CaLabInstanceHeaderComponent,
    CaLabInstanceManageBackupComponent,
    CaLabInstanceBackupComponent,
    CaLabBackupHistoryDialogComponent,
    CaLabInstanceDashboardPageComponent,
    CaLabInstanceConfigPageComponent,
    CaLabInstanceServerComponent,
    CaLabServerCompleteInfoComponent,
    CaLabServerCompleteInfoDialogComponent,
    CaLabInstanceStartStopComponent,
    CaLabInstanceServerStatusComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    CaCoreModule,
    CaLabCoreModule,
    CaServerInfoCoreModule,
    CaBrickCoreModule,
    CaProjectCoreModule,
    CaConfigCoreModule,

    CaLabInstanceRoutingModule,
  ]
})
export class CaLabInstanceModule {
}
