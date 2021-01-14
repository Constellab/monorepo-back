import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BioxRoutingModule } from './biox-routing.module';
import {BioxExperimentsPageModule} from './module/biox-experiments-page/biox-experiments-page.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    // Biox modules
    BioxExperimentsPageModule,

    // routing
    BioxRoutingModule,
  ]
})
export class BioxModule { }
