import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabExperimentTableComponent } from './component/lab-experiment-table/lab-experiment-table.component';
import {CoreModule} from '../../core.module';
import {RouterModule} from '@angular/router';
import { LabExperimentCardComponent } from './component/lab-experiment-card/lab-experiment-card.component';



@NgModule({
  declarations: [
    LabExperimentTableComponent,
    LabExperimentCardComponent
  ],
  exports: [
    LabExperimentTableComponent,
    LabExperimentCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,
  ]
})
export class LabExperimentCoreModule { }
