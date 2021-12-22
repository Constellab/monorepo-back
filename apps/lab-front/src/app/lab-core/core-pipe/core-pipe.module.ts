import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabDetailRoutePipe} from './lab-detail-route/lab-detail-route.pipe';

@NgModule({
  declarations: [
    LabDetailRoutePipe,
  ],
  exports: [
    LabDetailRoutePipe
  ],
  imports: [
    CommonModule
  ]
})
export class CorePipeModule { }
