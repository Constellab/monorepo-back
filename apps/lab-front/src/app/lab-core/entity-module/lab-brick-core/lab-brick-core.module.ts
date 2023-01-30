import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabBricksSelectOptionsComponent
} from './component/lab-bricks-select-options/lab-bricks-select-options.component';
import {LabCoreModule} from '../../lab-core.module';
import {LabBrickDataTableComponent} from './component/lab-brick-data-table/lab-brick-data-table.component';


@NgModule({
  declarations: [
    LabBricksSelectOptionsComponent,
    LabBrickDataTableComponent
  ],
  exports: [
    LabBricksSelectOptionsComponent,
    LabBrickDataTableComponent
  ],
  imports: [
    CommonModule,

    LabCoreModule,
  ],
})
export class LabBrickCoreModule { }
