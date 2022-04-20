import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabViewConfigSearchFormComponent
} from './component/lab-view-config-search-form/lab-view-config-search-form.component';
import {LabViewConfigSearchComponent} from './component/lab-view-config-search/lab-view-config-search.component';
import {
  LabSelectViewConfigDialogComponent
} from './component/lab-select-view-config-dialog/lab-select-view-config-dialog.component';
import {LabCoreModule} from '../../lab-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  LabSelectViewTypeOptionsComponent
} from './component/lab-select-view-type-options/lab-select-view-type-options.component';
import {LabViewConfigTableComponent} from './component/lab-view-config-table/lab-view-config-table.component';
import {LabViewTypeInfoPipe} from './pipe/lab-view-type-info.pipe';


@NgModule({
  declarations: [
    LabViewConfigSearchFormComponent,
    LabViewConfigSearchComponent,
    LabSelectViewConfigDialogComponent,
    LabSelectViewTypeOptionsComponent,
    LabViewConfigTableComponent,
    LabViewTypeInfoPipe
  ],
  exports: [
    LabViewConfigSearchComponent,
    LabSelectViewConfigDialogComponent,
    LabSelectViewTypeOptionsComponent,
    LabViewConfigTableComponent,
    LabViewTypeInfoPipe
  ],
  imports: [
    CommonModule,

    LabCoreModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class LabViewConfigCoreModule {
}
