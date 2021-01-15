import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BioxRoutingModule } from './biox-routing.module';
import {BioxExperimentsPageModule} from './module/biox-experiments-page/biox-experiments-page.module';
import {BioxExperimentDetailPageModule} from './module/biox-experiment-detail-page/biox-experiment-detail-page.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    // Biox modules
    BioxExperimentsPageModule,
    BioxExperimentDetailPageModule,

    // routing
    BioxRoutingModule,
  ]
})
export class BioxModule { }
