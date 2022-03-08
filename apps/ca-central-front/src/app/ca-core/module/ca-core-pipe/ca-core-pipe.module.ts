import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaDetailRoutePipe} from './ca-detail-route/ca-detail-route.pipe';


@NgModule({
  declarations: [
    CaDetailRoutePipe
  ],
  exports: [
    CaDetailRoutePipe
  ],
  imports: [
    CommonModule
  ],
})
export class CaCorePipeModule { }
