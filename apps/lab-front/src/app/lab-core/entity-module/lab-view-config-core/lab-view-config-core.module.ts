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
import {
  LabViewConfigActionsMenuComponent
} from './component/lab-view-config-actions-menu/lab-view-config-actions-menu.component';
import {
  LabUpdateViewConfigDialogComponent
} from './component/lab-update-view-config-dialog/lab-update-view-config-dialog.component';
import {LabTagCoreModule} from '../lab-tag-core/lab-tag-core.module';
import {LabEntityCoreModule} from '../lab-entity-core/lab-entity-core.module';
import {RouterModule} from '@angular/router';
import {LabViewConfigPreviewComponent} from './component/lab-view-config-preview/lab-view-config-preview.component';


@NgModule({
  declarations: [
    LabViewConfigSearchFormComponent,
    LabViewConfigSearchComponent,
    LabSelectViewConfigDialogComponent,
    LabSelectViewTypeOptionsComponent,
    LabViewConfigTableComponent,
    LabViewTypeInfoPipe,
    LabViewConfigActionsMenuComponent,
    LabUpdateViewConfigDialogComponent,
    LabViewConfigPreviewComponent,
  ],
  exports: [
    LabViewConfigSearchComponent,
    LabSelectViewConfigDialogComponent,
    LabSelectViewTypeOptionsComponent,
    LabViewConfigTableComponent,
    LabViewTypeInfoPipe,
    LabViewConfigActionsMenuComponent,
    LabUpdateViewConfigDialogComponent,
    LabViewConfigPreviewComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,

    LabCoreModule,
    LabTagCoreModule,
    LabEntityCoreModule,
  ],
})
export class LabViewConfigCoreModule {
}
