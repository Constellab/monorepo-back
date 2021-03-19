import {NgModule} from '@angular/core';
import {FlChartLineModule} from './module/fl-chart-line/fl-chart-line.module';
import {FlChartHistogramModule} from './module/fl-chart-histogram/fl-chart-histogram.module';
import {FlChartPieModule} from './module/fl-chart-pie/fl-chart-pie.module';
import {FlChartScatterPlotModule} from './module/fl-chart-scatter-plot/fl-chart-scatter-plot.module';

/**
 * Main module exporting all the chart modules
 */
@NgModule({
  exports: [
    FlChartHistogramModule,
    FlChartLineModule,
    FlChartPieModule,
    FlChartScatterPlotModule,
  ]
})
export class FlChartModule {
}
