import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabViewboxRoutingModule} from './lab-viewbox-routing.module';
import {LabViewboxPageModule} from './module/lab-viewbox-page/lab-viewbox-page.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    LabViewboxPageModule,

    LabViewboxRoutingModule,
  ]
})
export class LabViewboxModule { }
