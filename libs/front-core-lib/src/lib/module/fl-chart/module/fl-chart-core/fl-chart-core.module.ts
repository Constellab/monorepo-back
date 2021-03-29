import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartLegendComponent} from './component/fl-chart-legend/fl-chart-legend.component';
import {FlexLayoutModule} from '@angular/flex-layout';


/**
 * Core module for the chart, it shares common component and directives
 */
@NgModule({
  declarations: [
    FlChartLegendComponent
  ],
  exports: [
    FlChartLegendComponent
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
  ],
})
export class FlChartCoreModule {
}
