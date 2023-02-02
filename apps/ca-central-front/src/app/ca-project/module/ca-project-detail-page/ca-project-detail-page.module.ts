import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaProjectDetailPageComponent} from './component/ca-project-detail-page/ca-project-detail-page.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaProjectCoreModule} from '../../../ca-core/entity-module/ca-project-core/ca-project-core.module';
import {CaProjectDetailComponent} from './component/ca-project-detail/ca-project-detail.component';
import {RouterModule} from '@angular/router';
import {CaExperimentCoreModule} from '../ca-experiment-core/ca-experiment-core.module';
import {CaReportCoreModule} from '../ca-report-core/ca-report-core.module';
import {CaGroupCoreModule} from '../../../ca-core/entity-module/ca-group-core/ca-group-core.module';
import {
  CaProjectSharedGroupsListComponent
} from './component/ca-project-shared-groups-list/ca-project-shared-groups-list.component';
import {CaProjectChildrenComponent} from './component/ca-project-children/ca-project-children.component';
import {CaProjectObjectCoreModule} from '../ca-project-object-core/ca-project-object-core.module';
import {CaProjectUsersComponent} from './component/ca-project-users/ca-project-users.component';
import {
  CaProjectDetailRightPanelComponent
} from './component/ca-project-detail-right-panel/ca-project-detail-right-panel.component';
import {CaProjectDescriptionComponent} from './component/ca-project-description/ca-project-description.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  CaProjectReportPreviewComponent
} from './component/ca-project-report-preview/ca-project-report-preview.component';
import {
  CaProjectExperimentPreviewComponent
} from './component/ca-project-experiment-preview/ca-project-experiment-preview.component';
import {CaLabCoreModule} from '../../../ca-core/entity-module/ca-lab-core/ca-lab-core.module';
import {CaProjectCommentsComponent} from './component/ca-project-comments/ca-project-comments.component';
import {CaCommentModule} from '../../../ca-comment/ca-comment.module';
import {PickerModule} from '@ctrl/ngx-emoji-mart';
import {CaProjectSettingsComponent} from './component/ca-project-settings/ca-project-settings.component';
import {
  CaProjectStorageSettingsComponent
} from './component/ca-project-storage-settings/ca-project-storage-settings.component';
import {
  CaProjectConfigureStorageComponent
} from './component/ca-project-configure-storage/ca-project-configure-storage.component';
import {
  CaObjectStorageCoreModule
} from '../../../ca-core/entity-module/ca-object-storage-core/ca-object-storage-core.module';
import {
  CaCloudProviderCoreModule
} from '../../../ca-core/entity-module/ca-cloud-provider-core/ca-cloud-provider-core.module';
import {
  CaProjectDocumentsListComponent
} from './component/ca-project-documents-list/ca-project-documents-list.component';
import {CaDocumentCoreModule} from '../ca-document-core/ca-document-core.module';

/**
 * Module for the project detail page
 */
@NgModule({
  declarations: [
    CaProjectDetailPageComponent,
    CaProjectDetailComponent,
    CaProjectSharedGroupsListComponent,
    CaProjectChildrenComponent,
    CaProjectUsersComponent,
    CaProjectDetailRightPanelComponent,
    CaProjectDescriptionComponent,
    CaProjectReportPreviewComponent,
    CaProjectExperimentPreviewComponent,
    CaProjectCommentsComponent,
    CaProjectSettingsComponent,
    CaProjectStorageSettingsComponent,
    CaProjectConfigureStorageComponent,
    CaProjectDocumentsListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PickerModule,

    CaCoreModule,
    CaProjectObjectCoreModule,
    CaProjectCoreModule,
    CaExperimentCoreModule,
    CaReportCoreModule,
    CaDocumentCoreModule,
    CaGroupCoreModule,
    CaLabCoreModule,
    CaCommentModule,
    CaObjectStorageCoreModule,
    CaCloudProviderCoreModule,
  ]
})
export class CaProjectDetailPageModule {
}
