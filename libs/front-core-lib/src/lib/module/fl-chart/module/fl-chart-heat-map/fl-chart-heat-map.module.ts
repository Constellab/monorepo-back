import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartHeatMapComponent} from './component/fl-chart-heat-map/fl-chart-heat-map.component';


@NgModule({
  declarations: [
    FlChartHeatMapComponent
  ],
  exports: [
    FlChartHeatMapComponent
  ],
  imports: [
    CommonModule
  ],
})
export class FlChartHeatMapModule {
}
