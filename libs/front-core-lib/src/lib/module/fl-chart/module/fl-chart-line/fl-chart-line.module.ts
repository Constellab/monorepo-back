import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartLineSimpleComponent} from './component/fl-chart-line-simple/fl-chart-line-simple.component';
import {FlChartLineMultipleComponent} from './component/fl-chart-line-multiple/fl-chart-line-multiple.component';
import {FlChartScatterPlotSimpleComponent} from './component/fl-chart-scatter-plot-simple/fl-chart-scatter-plot-simple.component';
import {FlChartScatterPlotMultipleComponent} from './component/fl-chart-scatter-plot-multiple/fl-chart-scatter-plot-multiple.component';


@NgModule({
  declarations: [
    FlChartLineSimpleComponent,
    FlChartLineMultipleComponent,
    FlChartScatterPlotSimpleComponent,
    FlChartScatterPlotMultipleComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [FlChartLineSimpleComponent,
    FlChartLineMultipleComponent,
    FlChartScatterPlotSimpleComponent,
    FlChartScatterPlotMultipleComponent
  ],
})
export class FlChartLineModule {
}
