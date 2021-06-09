import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartScatterPlotSimpleComponent} from './component/fl-chart-scatter-plot-simple/fl-chart-scatter-plot-simple.component';


@NgModule({
  declarations: [
    FlChartScatterPlotSimpleComponent,
  ],
  exports: [
    FlChartScatterPlotSimpleComponent,
  ],
  imports: [
    CommonModule
  ]
})
export class FlChartScatterPlotModule {
}
