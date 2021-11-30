import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxResourceInfoComponent} from './component/biox-resource-info/biox-resource-info.component';
import {CoreModule} from '../../core.module';
import {BioxResourcePortalComponent} from './component/biox-resource-portal/biox-resource-portal.component';
import {BioxResourceSpreadsheetComponent} from './component/biox-resource-spreadsheet/biox-resource-spreadsheet.component';
import {RouterModule} from '@angular/router';
import {BioxResourceJsonComponent} from './component/biox-resource-json/biox-resource-json.component';
import {BioxResourceTextComponent} from './component/biox-resource-text/biox-resource-text.component';
import {BioxResourceImageComponent} from './component/biox-resource-image/biox-resource-image.component';
import {BioxResourceSelectComponent} from './component/biox-resource-select/biox-resource-select.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BioxResourceTypeSelectOptionsComponent} from './component/biox-resource-type-select-options/biox-resource-type-select-options.component';
import {BioxResourceSelectOptionsComponent} from './component/biox-resource-select-options/biox-resource-select-options.component';
import {BioxResourceNetworkComponent} from './component/biox-resource-network/biox-resource-network.component';
import {BioxResourceChart2dComponent} from './component/biox-resource-chart-2d/biox-resource-chart-2d.component';
import {BioxResourceHistogramComponent} from './component/biox-resource-histogram/biox-resource-histogram.component';
import {BioxResourceViewPortalComponent} from './component/biox-resource-view-portal/biox-resource-view-portal.component';
import {BioxResourceBoxPlotComponent} from './component/biox-resource-box-plot/biox-resource-box-plot.component';
import {BioxResourceMultiViewComponent} from './component/biox-resource-multi-view/biox-resource-multi-view.component';
import {BioxResourceViewComponent} from './component/biox-resource-view/biox-resource-view.component';
import {BioxResourceTableComponent} from './component/biox-resource-table/biox-resource-table.component';
import { BioxResourceSearchComponent } from './component/biox-resource-search/biox-resource-search.component';
import { BioxResourceAdvancedSearchFormComponent } from './component/biox-resource-advanced-search-form/biox-resource-advanced-search-form.component';
import { BioxResourceOriginOptionsComponent } from './component/biox-resource-origin-options/biox-resource-origin-options.component';
import { BioxSelectResourceDialogComponent } from './component/biox-select-resource-dialog/biox-select-resource-dialog.component';
import { BioxResourceCardComponent } from './component/biox-resource-card/biox-resource-card.component';
import {UploadFsNodeDialogComponent} from './component/upload-fs-node-dialog/upload-fs-node-dialog.component';


@NgModule({
  declarations: [
    BioxResourceInfoComponent,
    BioxResourcePortalComponent,
    BioxResourceSpreadsheetComponent,
    BioxResourceJsonComponent,
    BioxResourceTextComponent,
    BioxResourceImageComponent,
    BioxResourceSelectComponent,
    BioxResourceTypeSelectOptionsComponent,
    BioxResourceSelectOptionsComponent,
    BioxResourceNetworkComponent,
    BioxResourceChart2dComponent,
    BioxResourceHistogramComponent,
    BioxResourceViewPortalComponent,
    BioxResourceBoxPlotComponent,
    BioxResourceMultiViewComponent,
    BioxResourceViewComponent,
    BioxResourceTableComponent,
    BioxResourceSearchComponent,
    BioxResourceAdvancedSearchFormComponent,
    BioxResourceOriginOptionsComponent,
    BioxSelectResourceDialogComponent,
    BioxResourceCardComponent,
    UploadFsNodeDialogComponent,
  ],
  exports: [
    BioxResourceInfoComponent,
    BioxResourcePortalComponent,
    BioxResourceSpreadsheetComponent,
    BioxResourceJsonComponent,
    BioxResourceTextComponent,
    BioxResourceImageComponent,
    BioxResourceSelectComponent,
    BioxResourceTypeSelectOptionsComponent,
    BioxResourceSelectOptionsComponent,
    BioxResourceNetworkComponent,
    BioxResourceChart2dComponent,
    BioxResourceHistogramComponent,
    BioxResourceViewPortalComponent,
    BioxResourceBoxPlotComponent,
    BioxResourceMultiViewComponent,
    BioxResourceViewComponent,
    BioxResourceTableComponent,
    BioxResourceSearchComponent,
    BioxResourceOriginOptionsComponent,
    BioxSelectResourceDialogComponent,
    BioxResourceCardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
  ],
})
export class BioxResourceCoreModule { }
