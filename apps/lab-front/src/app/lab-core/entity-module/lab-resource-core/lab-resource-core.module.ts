import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabResourceInfoComponent} from './component/lab-resource-info/lab-resource-info.component';
import {LabCoreModule} from '../../lab-core.module';
import {LabResourceSpreadsheetComponent} from './component/lab-resource-spreadsheet/lab-resource-spreadsheet.component';
import {RouterModule} from '@angular/router';
import {LabResourceTextComponent} from './component/lab-resource-text/lab-resource-text.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  LabResourceTypeSelectOptionsComponent
} from './component/lab-resource-type-select-options/lab-resource-type-select-options.component';
import {LabResourceViewPortalComponent} from './component/lab-resource-view-portal/lab-resource-view-portal.component';
import {LabResourceTableComponent} from './component/lab-resource-table/lab-resource-table.component';
import {LabResourceSearchComponent} from './component/lab-resource-search/lab-resource-search.component';
import {
  LabResourceAdvancedSearchFormComponent
} from './component/lab-resource-advanced-search-form/lab-resource-advanced-search-form.component';
import {
  LabResourceOriginOptionsComponent
} from './component/lab-resource-origin-options/lab-resource-origin-options.component';
import {
  LabSelectResourceDialogComponent
} from './component/lab-select-resource-dialog/lab-select-resource-dialog.component';
import {LabResourceCardComponent} from './component/lab-resource-card/lab-resource-card.component';
import {
  LabFsNodeTypesSelectionDialogComponent
} from './component/lab-fs-node-types-selection-dialog/lab-fs-node-types-selection-dialog.component';
import {LabTransformerModule} from '../lab-transformer/lab-transformer.module';
import {
  LabImportResourceDialogComponent
} from './component/lab-import-resource-dialog/lab-import-resource-dialog.component';
import {LabConfigCoreModule} from '../lab-config-core/lab-config-core.module';
import {
  LabResourceDetailDialogComponent
} from './component/lab-resource-detail-dialog/lab-resource-detail-dialog.component';
import {LabUpdateResourceTypeComponent} from './component/lab-update-resource-type/lab-update-resource-type.component';
import {
  LabUpdateResourceNameDialogComponent
} from './component/lab-update-resource-name-dialog/lab-update-resource-name-dialog.component';
import {
  LabResourceActionsMenuComponent
} from './component/lab-resource-actions-menu/lab-resource-actions-menu.component';
import {LabUserCoreModule} from '../lab-user-core/lab-user-core.module';
import {LabResourceFolderComponent} from './component/lab-resource-folder/lab-resource-folder.component';
import {LabViewResourcesListComponent} from './component/lab-view-resources-list/lab-view-resources-list.component';
import {LabExperimentCoreModule} from '../lab-experiment-core/lab-experiment-core.module';
import {LabTagCoreModule} from '../lab-tag-core/lab-tag-core.module';
import {LabTypeCoreModule} from '../lab-type-core/lab-type-core.module';
import {
  LabConfigureResourceViewComponent
} from './component/lab-configure-resource-view/lab-configure-resource-view.component';
import {LabEntityCoreModule} from '../lab-entity-core/lab-entity-core.module';
import {LabProjectCoreModule} from '../lab-project-core/lab-project-core.module';
import {LabViewConfigTabComponent} from './component/lab-view-config-tab/lab-view-config-tab.component';
import {LabResourceDetailTabsComponent} from './component/lab-resource-detail-tabs/lab-resource-detail-tabs.component';
import {
  LabResourceDetailTabHeaderComponent
} from './component/lab-resource-detail-tab-header/lab-resource-detail-tab-header.component';
import {LabResourceDetailComponent} from './component/lab-resource-detail/lab-resource-detail.component';
import {
  LabResourceViewSpecListComponent
} from './component/lab-resource-view-spec-list/lab-resource-view-spec-list.component';
import {LabViewConfigCoreModule} from '../lab-view-config-core/lab-view-config-core.module';
import {LabResourceViewDetailComponent} from './component/lab-resource-view-detail/lab-resource-view-detail.component';


@NgModule({
  declarations: [
    LabResourceInfoComponent,
    LabResourceSpreadsheetComponent,
    LabResourceTextComponent,
    LabResourceTypeSelectOptionsComponent,
    LabResourceViewPortalComponent,
    LabResourceTableComponent,
    LabResourceSearchComponent,
    LabResourceAdvancedSearchFormComponent,
    LabResourceOriginOptionsComponent,
    LabSelectResourceDialogComponent,
    LabResourceCardComponent,
    LabFsNodeTypesSelectionDialogComponent,
    LabImportResourceDialogComponent,
    LabResourceDetailDialogComponent,
    LabUpdateResourceTypeComponent,
    LabUpdateResourceNameDialogComponent,
    LabResourceActionsMenuComponent,
    LabResourceFolderComponent,
    LabViewResourcesListComponent,
    LabConfigureResourceViewComponent,
    LabViewConfigTabComponent,
    LabResourceDetailTabsComponent,
    LabResourceDetailTabHeaderComponent,
    LabResourceDetailComponent,
    LabResourceViewSpecListComponent,
    LabResourceViewDetailComponent,
  ],
  exports: [
    LabResourceInfoComponent,
    LabResourceSpreadsheetComponent,
    LabResourceTextComponent,
    LabResourceTypeSelectOptionsComponent,
    LabResourceViewPortalComponent,
    LabResourceTableComponent,
    LabResourceSearchComponent,
    LabResourceOriginOptionsComponent,
    LabSelectResourceDialogComponent,
    LabResourceCardComponent,
    LabImportResourceDialogComponent,
    LabResourceDetailDialogComponent,
    LabUpdateResourceTypeComponent,
    LabUpdateResourceNameDialogComponent,
    LabResourceActionsMenuComponent,
    LabConfigureResourceViewComponent,
    LabViewConfigTabComponent,
    LabResourceDetailTabsComponent,
    LabResourceDetailTabHeaderComponent,
    LabResourceDetailComponent,
    LabResourceViewDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
    LabTransformerModule,
    LabConfigCoreModule,
    LabTypeCoreModule,
    LabUserCoreModule,
    LabExperimentCoreModule,
    LabTagCoreModule,
    LabEntityCoreModule,
    LabProjectCoreModule,
    LabViewConfigCoreModule,
  ],
})
export class LabResourceCoreModule {
}
