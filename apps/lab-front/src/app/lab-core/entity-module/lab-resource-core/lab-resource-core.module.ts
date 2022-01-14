import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabResourceInfoComponent} from './component/lab-resource-info/lab-resource-info.component';
import {LabCoreModule} from '../../lab-core.module';
import {LabResourcePortalComponent} from './component/lab-resource-portal/lab-resource-portal.component';
import {LabResourceSpreadsheetComponent} from './component/lab-resource-spreadsheet/lab-resource-spreadsheet.component';
import {RouterModule} from '@angular/router';
import {LabResourceJsonComponent} from './component/lab-resource-json/lab-resource-json.component';
import {LabResourceTextComponent} from './component/lab-resource-text/lab-resource-text.component';
import {LabResourceImageComponent} from './component/lab-resource-image/lab-resource-image.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  LabResourceTypeSelectOptionsComponent
} from './component/lab-resource-type-select-options/lab-resource-type-select-options.component';
import {LabResourceNetworkComponent} from './component/lab-resource-network/lab-resource-network.component';
import {LabResourceChart2dComponent} from './component/lab-resource-chart-2d/lab-resource-chart2d.component';
import {LabResourceViewPortalComponent} from './component/lab-resource-view-portal/lab-resource-view-portal.component';
import {LabResourceMultiViewComponent} from './component/lab-resource-multi-view/lab-resource-multi-view.component';
import {LabResourceViewComponent} from './component/lab-resource-view/lab-resource-view.component';
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
  LabUploadFsNodeDialogComponent
} from './component/lab-upload-fs-node-dialog/lab-upload-fs-node-dialog.component';
import {LabTransformerModule} from '../lab-transformer/lab-transformer.module';
import {
  LabImportResourceDialogComponent
} from './component/lab-import-resource-dialog/lab-import-resource-dialog.component';
import {LabConfigCoreModule} from '../lab-config-core/lab-config-core.module';
import {LabProcessCoreModule} from '../lab-process-core/lab-process-core.module';
import {
  LabResourceDetailDialogComponent
} from './component/lab-resource-detail-dialog/lab-resource-detail-dialog.component';
import {LabResourceDetailComponent} from './component/lab-resource-detail/lab-resource-detail.component';


@NgModule({
  declarations: [
    LabResourceInfoComponent,
    LabResourcePortalComponent,
    LabResourceSpreadsheetComponent,
    LabResourceJsonComponent,
    LabResourceTextComponent,
    LabResourceImageComponent,
    LabResourceTypeSelectOptionsComponent,
    LabResourceNetworkComponent,
    LabResourceChart2dComponent,
    LabResourceViewPortalComponent,
    LabResourceMultiViewComponent,
    LabResourceViewComponent,
    LabResourceTableComponent,
    LabResourceSearchComponent,
    LabResourceAdvancedSearchFormComponent,
    LabResourceOriginOptionsComponent,
    LabSelectResourceDialogComponent,
    LabResourceCardComponent,
    LabUploadFsNodeDialogComponent,
    LabImportResourceDialogComponent,
    LabResourceDetailDialogComponent,
    LabResourceDetailComponent,
  ],
  exports: [
    LabResourceInfoComponent,
    LabResourcePortalComponent,
    LabResourceSpreadsheetComponent,
    LabResourceJsonComponent,
    LabResourceTextComponent,
    LabResourceImageComponent,
    LabResourceTypeSelectOptionsComponent,
    LabResourceNetworkComponent,
    LabResourceChart2dComponent,
    LabResourceViewPortalComponent,
    LabResourceMultiViewComponent,
    LabResourceViewComponent,
    LabResourceTableComponent,
    LabResourceSearchComponent,
    LabResourceOriginOptionsComponent,
    LabSelectResourceDialogComponent,
    LabResourceCardComponent,
    LabImportResourceDialogComponent,
    LabResourceDetailDialogComponent,
    LabResourceDetailComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
    LabTransformerModule,
    LabConfigCoreModule,
    LabProcessCoreModule,
  ],
})
export class LabResourceCoreModule {
}
