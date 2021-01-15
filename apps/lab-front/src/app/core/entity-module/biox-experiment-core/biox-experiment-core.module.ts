import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BioxExperimentTableComponent } from './component/biox-experiment-table/biox-experiment-table.component';
import {CoreModule} from '../../core.module';
import {RouterModule} from '@angular/router';
import { BioxExperimentCardComponent } from './component/biox-experiment-card/biox-experiment-card.component';


@NgModule({
  declarations: [
    BioxExperimentTableComponent,
    BioxExperimentCardComponent
  ],
  exports: [
    BioxExperimentTableComponent,
    BioxExperimentCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    CoreModule,
  ]
})
export class BioxExperimentCoreModule { }
