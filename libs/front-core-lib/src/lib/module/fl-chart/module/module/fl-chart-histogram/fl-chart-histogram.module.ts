import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartHistogramComponent} from './component/fl-chart-histogram/fl-chart-histogram.component';
import {FlChartCoreModule} from '../fl-chart-core/fl-chart-core.module';


@NgModule({
  declarations: [
    FlChartHistogramComponent,
  ],
  exports: [
    FlChartHistogramComponent,
  ],
  imports: [
    CommonModule,
    FlChartCoreModule,
  ]
})
export class FlChartHistogramModule {
}
