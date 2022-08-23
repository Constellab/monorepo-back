import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabViewboxRoutingModule} from './lab-viewbox-routing.module';
import {LabViewboxPageModule} from './module/lab-viewbox-page/lab-viewbox-page.module';
import {LabViewConfigDetailPageModule} from './module/lab-view-config-detail-page/lab-view-config-detail-page.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    LabViewboxPageModule,
    LabViewConfigDetailPageModule,

    LabViewboxRoutingModule,
  ]
})
export class LabViewboxModule { }
