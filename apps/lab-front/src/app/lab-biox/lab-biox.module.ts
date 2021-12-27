import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {LabExperimentsPageModule} from './module/lab-experiments-page/lab-experiments-page.module';
import {LabExperimentDetailPageModule} from './module/lab-experiment-detail-page/lab-experiment-detail-page.module';
import {LabBioxRoutingModule} from './lab-biox-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    // Biox modules
    LabExperimentsPageModule,
    LabExperimentDetailPageModule,

    // routing
    LabBioxRoutingModule,
  ]
})
export class LabBioxModule {
}
