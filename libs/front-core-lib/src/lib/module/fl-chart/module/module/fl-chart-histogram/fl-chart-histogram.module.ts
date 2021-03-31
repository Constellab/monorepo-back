import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlChartHistogramComponent} from './component/fl-chart-histogram/fl-chart-histogram.component';


@NgModule({
  declarations: [
    FlChartHistogramComponent,
  ],
  exports: [
    FlChartHistogramComponent
  ],
  imports: [
    CommonModule
  ]
})
export class FlChartHistogramModule { }
