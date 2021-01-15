import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabExperimentTableComponent } from './component/lab-experiment-table/lab-experiment-table.component';
import {CoreModule} from '../../core.module';



@NgModule({
  declarations: [
    LabExperimentTableComponent
  ],
  exports: [
    LabExperimentTableComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
  ]
})
export class LabExperimentCoreModule { }
