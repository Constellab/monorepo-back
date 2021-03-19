import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlChartScatterPlotSimpleComponent} from './component/fl-chart-scatter-plot-simple/fl-chart-scatter-plot-simple.component';
import {FlChartScatterPlotMultipleComponent} from './component/fl-chart-scatter-plot-multiple/fl-chart-scatter-plot-multiple.component';



@NgModule({
  declarations: [
    FlChartScatterPlotSimpleComponent,
    FlChartScatterPlotMultipleComponent,
  ],
  exports: [
    FlChartScatterPlotSimpleComponent,
    FlChartScatterPlotMultipleComponent,
  ],
  imports: [
    CommonModule
  ]
})
export class FlChartScatterPlotModule { }
