import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabBricksSelectOptionsComponent
} from './component/lab-bricks-select-options/lab-bricks-select-options.component';
import {LabCoreModule} from '../../lab-core.module';


@NgModule({
  declarations: [
    LabBricksSelectOptionsComponent
  ],
  exports: [
    LabBricksSelectOptionsComponent
  ],
  imports: [
    CommonModule,

    LabCoreModule,
  ],
})
export class LabBrickCoreModule { }
