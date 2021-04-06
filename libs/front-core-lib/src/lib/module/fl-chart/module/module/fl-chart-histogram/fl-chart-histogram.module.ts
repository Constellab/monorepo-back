import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlChartHistogramComponent} from './component/fl-chart-histogram/fl-chart-histogram.component';
import { FlChartHistogramMultipleComponent } from './component/fl-chart-histogram-multiple/fl-chart-histogram-multiple.component';
import {FlChartCoreModule} from '../fl-chart-core/fl-chart-core.module';


@NgModule({
  declarations: [
    FlChartHistogramComponent,
    FlChartHistogramMultipleComponent,
  ],
  exports: [
    FlChartHistogramComponent,
    FlChartHistogramMultipleComponent
  ],
  imports: [
    CommonModule,
    FlChartCoreModule,
  ]
})
export class FlChartHistogramModule { }
